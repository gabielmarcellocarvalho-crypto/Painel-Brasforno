// Converte as propostas do formato antigo (campo "representante" solto, itens
// sem código/NCM/foto) para o novo modelo com dono, aprovações e itens fiéis
// ao Orçamento de Venda.
//
//   npm run migrate:propostas <login-do-responsavel-padrao>
//
// O responsável padrão recebe as propostas cujo nome de representante não
// bater com nenhum usuário cadastrado. Rodar de novo é seguro: propostas já
// migradas (que já têm vendedorId) são ignoradas.

const { conectar } = require("./firestore");

const LIMITE_DESCONTO_SEM_APROVACAO = 10;

function normalizar(texto) {
  return (texto || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // tira acentos para comparar nomes
    .trim()
    .toLowerCase();
}

/** Acha o usuário cujo nome bate (inteiro ou primeiro nome) com o representante. */
function acharUsuario(usuarios, representante) {
  const alvo = normalizar(representante);
  if (!alvo) return undefined;

  return (
    usuarios.find((u) => normalizar(u.nome) === alvo) ||
    usuarios.find((u) => normalizar(u.nome).split(" ")[0] === alvo.split(" ")[0])
  );
}

/**
 * "Cilindro de Massa" + "Cilindro 500" -> "cilindro de massa 500":
 * descarta do modelo os tokens iniciais que já aparecem no nome do produto,
 * mesma regra usada para montar o catálogo em scripts/catalogo-inicial.js.
 */
function juntarSemRepetir(nomeProduto, nomeModelo) {
  const jaPresentes = new Set(normalizar(nomeProduto).split(/\s+/));
  const restante = normalizar(nomeModelo)
    .split(/\s+/)
    .filter((token, i, todos) => {
      const anterioresDescartados = todos
        .slice(0, i)
        .every((t) => jaPresentes.has(t));
      return !(anterioresDescartados && jaPresentes.has(token));
    })
    .join(" ");

  return `${normalizar(nomeProduto)} ${restante}`.replace(/\s+/g, " ").trim();
}

/** Reaproveita o cadastro de produtos para trazer código, NCM, foto e specs. */
function acharProduto(produtos, item) {
  const candidatos = [
    juntarSemRepetir(item.produtoNome, item.modelo || ""),
    normalizar(`${item.produtoNome} ${item.modelo}`),
    normalizar(item.produtoNome),
    normalizar(item.modelo),
  ];

  for (const alvo of candidatos) {
    if (!alvo) continue;
    const achado = produtos.find((p) => normalizar(p.nome) === alvo);
    if (achado) return achado;
  }

  // Última tentativa: cadastro que comece pelo nome do produto e termine com o
  // sufixo do modelo (ex.: "…MASSA 500" para o modelo "Cilindro 500").
  const prefixo = normalizar(item.produtoNome);
  const sufixo = normalizar(item.modelo || "").split(/\s+/).pop() || "";
  return produtos.find((p) => {
    const nome = normalizar(p.nome);
    return nome.startsWith(prefixo) && (!sufixo || nome.endsWith(sufixo));
  });
}

function migrarItem(item, produtos) {
  const cadastro = acharProduto(produtos, item);
  const descricao = [item.produtoNome, item.modelo].filter(Boolean).join(" — ");

  return {
    produtoId: cadastro?.id || item.produtoId || "",
    codigo: cadastro?.codigo || "",
    descricao: (cadastro?.nome || descricao).toUpperCase(),
    categoria: item.categoria || cadastro?.categoria || "",
    ncm: cadastro?.ncm || "",
    unidade: cadastro?.unidade || "UNID",
    quantidade: item.quantidade || 1,
    precoUnitario: item.precoUnitario || 0,
    fotoUrl: cadastro?.fotoUrl || "",
    caracteristicas: cadastro?.caracteristicas || [],
    descricaoComplementar: cadastro?.descricaoComplementar || "",
  };
}

function migrarCondicoes(c = {}) {
  return {
    condicaoPagamento: (c.formaPagamento || "CONDIÇÃO DE PAGAMENTO A COMBINAR").toUpperCase(),
    tipoVencimento: "A Vista",
    parcelas: [],
    validadeDias: c.validadeDias || 15,
    prazoEntrega: c.prazoEntrega || "",
    frete: c.frete || "A combinar",
    descontoPercent: c.descontoPercent || 0,
    ipi: 0,
    icmsSt: 0,
    despesas: [],
    observacoes: c.observacoes || "",
  };
}

/** Traduz o funil antigo para o resultado registrado pelo cliente. */
function aprovacaoCliente(status) {
  if (status === "ganha") return { status: "aprovada", em: new Date().toISOString(), motivo: "" };
  if (status === "perdida") {
    return { status: "nao_aprovada", em: new Date().toISOString(), motivo: "Migrado do histórico" };
  }
  return { status: "pendente", motivo: "" };
}

async function main() {
  const args = process.argv.slice(2);
  // --revincular: refaz os itens de propostas já migradas para pegar código,
  // NCM e foto de produtos cadastrados depois da primeira migração.
  const revincular = args.includes("--revincular");
  const loginPadrao = args.find((a) => !a.startsWith("--"));

  if (!loginPadrao) {
    console.error(
      "\nUso: npm run migrate:propostas <login-do-responsavel-padrao> [--revincular]\n" +
        "Ex.: npm run migrate:propostas maria@brasforno.com.br\n"
    );
    process.exit(1);
  }

  const db = conectar();

  const usuarios = (await db.collection("usuarios").get()).docs.map((d) => d.data());
  if (usuarios.length === 0) {
    console.error("\n✖ Nenhum usuário cadastrado. Crie os usuários antes de migrar.\n");
    process.exit(1);
  }

  const padrao = usuarios.find((u) => normalizar(u.login) === normalizar(loginPadrao));
  if (!padrao) {
    console.error(`\n✖ Usuário "${loginPadrao}" não encontrado.\n`);
    process.exit(1);
  }

  const produtos = (await db.collection("produtos").get()).docs.map((d) => d.data());
  const propostas = await db.collection("propostas").get();

  let migradas = 0;
  let puladas = 0;

  for (const doc of propostas.docs) {
    const p = doc.data();

    if (p.vendedorId) {
      if (!revincular) {
        puladas += 1;
        continue;
      }
      // Já migrada: reprocessa só os itens que ficaram sem código, ou seja,
      // os que não acharam par no catálogo na primeira passada.
      const orfaos = (p.itens || []).filter((i) => !i.codigo);
      if (orfaos.length === 0) {
        puladas += 1;
        continue;
      }

      const itens = (p.itens || []).map((i) => {
        if (i.codigo) return i;
        // A descrição órfã tem o formato "PRODUTO — MODELO": desmonta para
        // alimentar o matcher com as mesmas duas partes do formato antigo.
        const [produtoNome, modelo = ""] = String(i.descricao || "").split("—");
        return migrarItem(
          {
            produtoId: i.produtoId,
            produtoNome: produtoNome.trim(),
            modelo: modelo.trim(),
            categoria: i.categoria,
            quantidade: i.quantidade,
            precoUnitario: i.precoUnitario,
          },
          produtos
        );
      });

      await doc.ref.update({ itens });
      migradas += 1;
      console.log(`  ↻ ${p.numero} — ${orfaos.length} item(ns) revinculado(s) ao catálogo`);
      continue;
    }

    const dono = acharUsuario(usuarios, p.representante) || padrao;
    const condicoes = migrarCondicoes(p.condicoes);
    const precisaAprovacao = condicoes.descontoPercent > LIMITE_DESCONTO_SEM_APROVACAO;

    await doc.ref.set(
      {
        vendedorId: dono.id,
        vendedorNome: dono.nome,
        criadaPorNome: p.representante || dono.nome,
        itens: (p.itens || []).map((i) => migrarItem(i, produtos)),
        condicoes,
        aprovacaoInterna: { status: precisaAprovacao ? "pendente" : "nao_requer" },
        aprovacaoCliente: aprovacaoCliente(p.status),
        cliente: {
          ...p.cliente,
          cnpjCpf: p.cliente?.cnpjCpf || "",
          inscricaoEstadual: p.cliente?.inscricaoEstadual || "",
          endereco: p.cliente?.endereco || "",
          complemento: p.cliente?.complemento || "",
          bairro: p.cliente?.bairro || "",
          cep: p.cliente?.cep || "",
        },
        // "representante" some: o dono da proposta agora é o vendedorId.
        representante: require("firebase-admin/firestore").FieldValue.delete(),
      },
      { merge: true }
    );

    migradas += 1;
    console.log(`  ✓ ${p.numero} → ${dono.nome}`);
  }

  console.log(`\n✔ ${migradas} proposta(s) migrada(s), ${puladas} já estava(m) no formato novo.\n`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("\n✖ Erro:", e.message, "\n");
    process.exit(1);
  });
