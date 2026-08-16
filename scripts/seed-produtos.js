// Carrega o catálogo inicial no Firestore (coleção "produtos").
//
//   npm run seed:produtos
//
// É seguro rodar mais de uma vez: itens já existentes (mesmo nome) são
// ignorados, então fotos e preços já cadastrados nunca são sobrescritos.

const { conectar } = require("./firestore");
const { gerarItens } = require("./catalogo-inicial");

async function proximoCodigo(db, contadorRef) {
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(contadorRef);
    const proximo = (snap.exists ? snap.data().seq : 0) + 1;
    tx.set(contadorRef, { seq: proximo }, { merge: true });
    return String(proximo).padStart(6, "0");
  });
}

async function main() {
  const db = conectar();
  const produtosRef = db.collection("produtos");
  const contadorRef = db.collection("contadores").doc("produtos");

  const existentes = await produtosRef.get();
  const nomesExistentes = new Set(
    existentes.docs.map((d) => (d.data().nome || "").trim().toUpperCase())
  );

  const itens = gerarItens();
  let criados = 0;
  let pulados = 0;

  for (const item of itens) {
    if (nomesExistentes.has(item.nome.toUpperCase())) {
      pulados += 1;
      continue;
    }

    const docRef = produtosRef.doc();
    const agora = new Date().toISOString();

    await docRef.set({
      ...item,
      id: docRef.id,
      codigo: await proximoCodigo(db, contadorRef),
      criadoEm: agora,
      atualizadoEm: agora,
    });

    criados += 1;
    console.log(`  + ${item.nome}`);
  }

  console.log(`\n✔ Catálogo carregado: ${criados} item(ns) criado(s), ${pulados} já existia(m).`);
  console.log("  Próximo passo: abra /catalogo e envie as fotos e os preços de tabela.\n");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("\n✖ Erro:", e.message, "\n");
    process.exit(1);
  });
