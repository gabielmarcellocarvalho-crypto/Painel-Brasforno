"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DESPESAS_SUGERIDAS, SEGMENTOS, UFS } from "@/lib/empresa";
import {
  Cliente,
  CondicoesComerciais,
  Despesa,
  ItemProposta,
  LIMITE_DESCONTO_SEM_APROVACAO,
  Parcela,
  Produto,
} from "@/lib/types";
import { formatarMoeda, hojeISO, somarDias } from "@/lib/utils";
import {
  TAMANHO_MAX_CEP,
  TAMANHO_MAX_CNPJ_CPF,
  TAMANHO_MAX_INSCRICAO_ESTADUAL,
  TAMANHO_MAX_TELEFONE,
  mascararCep,
  mascararCnpjCpf,
  mascararTelefone,
} from "@/lib/mascaras";
import {
  IconAlertTriangle,
  IconArrowRight,
  IconCheck,
  IconChevronLeft,
  IconFlame,
  IconImage,
  IconPlus,
  IconSearch,
  IconTrash,
} from "./Icons";

const PASSOS = ["Cliente", "Equipamentos", "Condições", "Revisão"] as const;

const inputCls =
  "h-11 w-full rounded-sm border border-steel-200 bg-white px-3 text-sm outline-none transition-colors duration-200 focus:border-steel-600 focus:ring-2 focus:ring-steel-600/15";
const areaCls =
  "w-full rounded-sm border border-steel-200 bg-white px-3 py-2.5 text-sm leading-relaxed outline-none transition-colors duration-200 focus:border-steel-600 focus:ring-2 focus:ring-steel-600/15";
const labelCls = "tech-label mb-1.5 block text-steel-600";

function paraNumero(texto: string): number {
  const n = parseFloat(texto.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function paraTextoMoeda(valor: number): string {
  return valor ? valor.toFixed(2).replace(".", ",") : "";
}

export default function AssistenteProposta({
  produtos,
  vendedorNome,
}: {
  produtos: Produto[];
  vendedorNome: string;
}) {
  const router = useRouter();
  const [passo, setPasso] = useState(0);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const [cliente, setCliente] = useState<Cliente>({
    nome: "",
    empresa: "",
    cnpjCpf: "",
    inscricaoEstadual: "",
    whatsapp: "",
    email: "",
    endereco: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "SP",
    cep: "",
    segmento: "Padaria",
  });

  const [itens, setItens] = useState<ItemProposta[]>([]);
  const [buscaProduto, setBuscaProduto] = useState("");
  const [categoriaSel, setCategoriaSel] = useState("Todas");

  const [condicoes, setCondicoes] = useState<CondicoesComerciais>({
    condicaoPagamento: "CONDIÇÃO DE PAGAMENTO A COMBINAR",
    tipoVencimento: "A Vista",
    parcelas: [],
    previsaoFaturamento: somarDias(hojeISO(), 30),
    validadeDias: 15,
    prazoEntrega: "30 dias úteis após confirmação do pedido",
    frete: "A combinar",
    descontoPercent: 0,
    ipi: 0,
    icmsSt: 0,
    despesas: [
      DESPESAS_SUGERIDAS[0], // técnico de montagem — o esquecimento clássico
      DESPESAS_SUGERIDAS[1], // frete
      DESPESAS_SUGERIDAS[2], // montagem
    ],
    observacoes: "",
  });

  const [ipiTexto, setIpiTexto] = useState("");
  const [icmsTexto, setIcmsTexto] = useState("");

  /* ── Cálculos ──────────────────────────────────────────────────────────── */
  const subtotal = itens.reduce((s, i) => s + i.precoUnitario * i.quantidade, 0);
  const desconto = subtotal * (condicoes.descontoPercent / 100);
  const total = subtotal - desconto + condicoes.ipi + condicoes.icmsSt;
  const precisaAprovacao = condicoes.descontoPercent > LIMITE_DESCONTO_SEM_APROVACAO;

  const categorias = useMemo(
    () => ["Todas", ...Array.from(new Set(produtos.map((p) => p.categoria)))],
    [produtos]
  );

  const produtosFiltrados = useMemo(() => {
    const q = buscaProduto.toLowerCase().trim();
    return produtos.filter((p) => {
      const okCategoria = categoriaSel === "Todas" || p.categoria === categoriaSel;
      const okBusca = !q || [p.codigo, p.nome, p.categoria].join(" ").toLowerCase().includes(q);
      return okCategoria && okBusca;
    });
  }, [produtos, buscaProduto, categoriaSel]);

  /* ── Itens ─────────────────────────────────────────────────────────────── */
  function adicionarProduto(p: Produto) {
    setErro("");
    // Snapshot completo: foto, características e NCM viajam junto com o item,
    // então editar o cadastro depois não altera propostas já emitidas.
    setItens((atuais) => [
      ...atuais,
      {
        produtoId: p.id,
        codigo: p.codigo,
        descricao: p.nome,
        categoria: p.categoria,
        ncm: p.ncm,
        unidade: p.unidade,
        quantidade: 1,
        precoUnitario: p.precoTabela,
        fotoUrl: p.fotoUrl,
        caracteristicas: p.caracteristicas,
        descricaoComplementar: p.descricaoComplementar,
      },
    ]);
  }

  function alterarItem(idx: number, mudancas: Partial<ItemProposta>) {
    setItens((atuais) =>
      atuais.map((item, i) => (i === idx ? { ...item, ...mudancas } : item))
    );
  }

  /* ── Parcelas ──────────────────────────────────────────────────────────── */
  function gerarParcelas(quantidade: number) {
    if (quantidade < 1) return;
    const valorParcela = total / quantidade;
    const base = hojeISO();
    const parcelas: Parcela[] = Array.from({ length: quantidade }, (_, i) => ({
      numero: i + 1,
      // À vista vence hoje; parcelado segue o padrão 30/60/90.
      vencimento: quantidade === 1 ? base : somarDias(base, (i + 1) * 30),
      valor: Number(valorParcela.toFixed(2)),
    }));
    setCondicoes((c) => ({
      ...c,
      parcelas,
      tipoVencimento: quantidade === 1 ? "A Vista" : `Em ${quantidade}x`,
    }));
  }

  function alterarParcela(idx: number, mudancas: Partial<Parcela>) {
    setCondicoes((c) => ({
      ...c,
      parcelas: c.parcelas.map((p, i) => (i === idx ? { ...p, ...mudancas } : p)),
    }));
  }

  /* ── Despesas ──────────────────────────────────────────────────────────── */
  function alternarDespesa(sugestao: Despesa) {
    setCondicoes((c) => {
      const jaTem = c.despesas.some((d) => d.descricao === sugestao.descricao);
      return {
        ...c,
        despesas: jaTem
          ? c.despesas.filter((d) => d.descricao !== sugestao.descricao)
          : [...c.despesas, { ...sugestao }],
      };
    });
  }

  function alterarDespesa(idx: number, mudancas: Partial<Despesa>) {
    setCondicoes((c) => ({
      ...c,
      despesas: c.despesas.map((d, i) => (i === idx ? { ...d, ...mudancas } : d)),
    }));
  }

  /* ── Navegação ─────────────────────────────────────────────────────────── */
  function falha(msg: string): false {
    setErro(msg);
    return false;
  }

  function validarPasso(): boolean {
    setErro("");
    if (passo === 0) {
      if (!cliente.empresa.trim()) return falha("Informe a razão social / nome da empresa.");
      if (!cliente.nome.trim()) return falha("Informe o nome do contato.");
      if (cliente.whatsapp.replace(/\D/g, "").length < 10)
        return falha("Informe um telefone válido com DDD.");
      if (!cliente.cidade.trim()) return falha("Informe a cidade.");
    }
    if (passo === 1) {
      if (itens.length === 0) return falha("Adicione pelo menos um equipamento.");
      const semPreco = itens.findIndex((i) => i.precoUnitario <= 0);
      if (semPreco >= 0)
        return falha(`Informe o preço de "${itens[semPreco].descricao}".`);
    }
    return true;
  }

  async function finalizar() {
    if (!validarPasso()) return;
    setSalvando(true);
    setErro("");
    try {
      const resp = await fetch("/api/propostas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cliente, itens, condicoes }),
      });
      const dados = await resp.json();
      if (!resp.ok) throw new Error(dados.erro || "Erro ao salvar proposta.");
      router.push(`/proposta/${dados.id}`);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro inesperado.");
      setSalvando(false);
    }
  }

  const semCatalogo = produtos.length === 0;

  return (
    <div className="max-w-6xl px-4 py-8 md:px-6 lg:px-10">
      <header className="rise">
        <p className="tech-label text-steel-500">Orçamento de venda · {vendedorNome}</p>
        <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-steel-900 md:text-4xl">
          Nova Proposta
        </h1>
      </header>

      {/* Passos */}
      <ol className="rise rise-1 mt-7 flex items-center gap-0" aria-label="Etapas do fluxo">
        {PASSOS.map((nome, i) => (
          <li key={nome} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5 sm:flex-row sm:gap-2.5">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold transition-colors duration-200 ${
                  i < passo
                    ? "bg-steel-600 text-white"
                    : i === passo
                      ? "bg-ember-500 text-white"
                      : "border-2 border-steel-200 bg-white text-steel-400"
                }`}
                aria-current={i === passo ? "step" : undefined}
              >
                {i < passo ? <IconCheck size={15} /> : String(i + 1).padStart(2, "0")}
              </span>
              <span
                className={`text-center text-xs font-medium sm:text-sm ${
                  i === passo ? "text-steel-900" : i < passo ? "text-steel-600" : "text-steel-400"
                }`}
              >
                {nome}
              </span>
            </div>
            {i < PASSOS.length - 1 && (
              <span
                className={`mx-2 h-0.5 flex-1 rounded-full sm:mx-3 ${
                  i < passo ? "bg-steel-600" : "bg-steel-200"
                }`}
                aria-hidden
              />
            )}
          </li>
        ))}
      </ol>

      {erro && (
        <div
          role="alert"
          className="mt-5 flex items-center gap-2.5 border-l-2 border-ember-500 bg-ember-100 px-4 py-3 text-sm font-medium text-ember-700"
        >
          <IconAlertTriangle size={16} className="shrink-0" />
          {erro}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div className="rise rise-2 panel p-5 md:p-8">
          {/* ── PASSO 1 — CLIENTE ────────────────────────────────────── */}
          {passo === 0 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className={labelCls} htmlFor="empresa">Razão social / Empresa *</label>
                  <input
                    id="empresa"
                    className={inputCls}
                    value={cliente.empresa}
                    onChange={(e) => setCliente({ ...cliente, empresa: e.target.value })}
                    placeholder="Ex.: Padaria Pão Dourado LTDA"
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor="nome">Nome do contato *</label>
                  <input
                    id="nome"
                    className={inputCls}
                    value={cliente.nome}
                    onChange={(e) => setCliente({ ...cliente, nome: e.target.value })}
                    placeholder="Ex.: Carlos Andrade"
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor="cnpj">CNPJ / CPF</label>
                  <input
                    id="cnpj"
                    className={inputCls}
                    value={cliente.cnpjCpf}
                    onChange={(e) =>
                      setCliente({ ...cliente, cnpjCpf: mascararCnpjCpf(e.target.value) })
                    }
                    maxLength={TAMANHO_MAX_CNPJ_CPF}
                    inputMode="numeric"
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor="ie">Inscrição Estadual</label>
                  <input
                    id="ie"
                    className={inputCls}
                    value={cliente.inscricaoEstadual}
                    onChange={(e) =>
                      setCliente({ ...cliente, inscricaoEstadual: e.target.value })
                    }
                    maxLength={TAMANHO_MAX_INSCRICAO_ESTADUAL}
                    placeholder="isento ou nº da IE"
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor="zap">Telefone / WhatsApp *</label>
                  <input
                    id="zap"
                    className={inputCls}
                    value={cliente.whatsapp}
                    onChange={(e) =>
                      setCliente({ ...cliente, whatsapp: mascararTelefone(e.target.value) })
                    }
                    maxLength={TAMANHO_MAX_TELEFONE}
                    inputMode="numeric"
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor="email">E-mail</label>
                  <input
                    id="email"
                    type="email"
                    className={inputCls}
                    value={cliente.email}
                    onChange={(e) => setCliente({ ...cliente, email: e.target.value })}
                    placeholder="contato@empresa.com.br"
                  />
                </div>
              </div>

              <div className="border-t border-steel-100 pt-5">
                <p className="tech-label mb-4 text-steel-500">Endereço de entrega</p>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className={labelCls} htmlFor="endereco">Logradouro e número</label>
                    <input
                      id="endereco"
                      className={inputCls}
                      value={cliente.endereco}
                      onChange={(e) => setCliente({ ...cliente, endereco: e.target.value })}
                      placeholder="Rua Goiás, 317"
                    />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="complemento">Complemento</label>
                    <input
                      id="complemento"
                      className={inputCls}
                      value={cliente.complemento}
                      onChange={(e) => setCliente({ ...cliente, complemento: e.target.value })}
                      placeholder="Andar, sala, galpão…"
                    />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="bairro">Bairro</label>
                    <input
                      id="bairro"
                      className={inputCls}
                      value={cliente.bairro}
                      onChange={(e) => setCliente({ ...cliente, bairro: e.target.value })}
                      placeholder="Vila Elisa"
                    />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="cep">CEP</label>
                    <input
                      id="cep"
                      className={inputCls}
                      value={cliente.cep}
                      onChange={(e) =>
                        setCliente({ ...cliente, cep: mascararCep(e.target.value) })
                      }
                      maxLength={TAMANHO_MAX_CEP}
                      inputMode="numeric"
                      placeholder="06530-020"
                    />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="cidade">Cidade *</label>
                    <input
                      id="cidade"
                      className={inputCls}
                      value={cliente.cidade}
                      onChange={(e) => setCliente({ ...cliente, cidade: e.target.value })}
                      placeholder="Ex.: Osasco"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls} htmlFor="uf">UF *</label>
                      <select
                        id="uf"
                        className={`${inputCls} cursor-pointer`}
                        value={cliente.uf}
                        onChange={(e) => setCliente({ ...cliente, uf: e.target.value })}
                      >
                        {UFS.map((uf) => (
                          <option key={uf}>{uf}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls} htmlFor="segmento">Segmento</label>
                      <select
                        id="segmento"
                        className={`${inputCls} cursor-pointer`}
                        value={cliente.segmento}
                        onChange={(e) => setCliente({ ...cliente, segmento: e.target.value })}
                      >
                        {SEGMENTOS.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── PASSO 2 — EQUIPAMENTOS ───────────────────────────────── */}
          {passo === 1 && (
            <div>
              {semCatalogo ? (
                <div className="border-l-2 border-ember-500 bg-ember-100 p-5 text-sm text-ember-700">
                  <p className="font-semibold">Nenhum produto cadastrado.</p>
                  <p className="mt-1.5 leading-relaxed">
                    Cadastre os itens em{" "}
                    <Link href="/catalogo" className="underline underline-offset-2">
                      Catálogo de Produtos
                    </Link>{" "}
                    (ou rode <code className="font-mono">npm run seed:produtos</code>) para
                    que a foto e as características entrem automaticamente na proposta.
                  </p>
                </div>
              ) : (
                <>
                  {/* Seletor tipo catálogo */}
                  <div className="flex flex-wrap items-center gap-2">
                    {categorias.map((c) => (
                      <button
                        key={c}
                        onClick={() => setCategoriaSel(c)}
                        className={`flex h-8 cursor-pointer items-center rounded-sm px-2.5 font-mono text-[0.68rem] uppercase tracking-wider transition-colors duration-200 ${
                          categoriaSel === c
                            ? "bg-steel-800 text-white"
                            : "border border-steel-200 text-steel-600 hover:bg-steel-50"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                    <div className="relative ml-auto">
                      <IconSearch
                        size={14}
                        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-steel-400"
                      />
                      <label className="sr-only" htmlFor="busca-eq">Buscar equipamento</label>
                      <input
                        id="busca-eq"
                        type="search"
                        value={buscaProduto}
                        onChange={(e) => setBuscaProduto(e.target.value)}
                        placeholder="Buscar…"
                        className="h-8 w-44 rounded-sm border border-steel-200 bg-white pl-8 pr-2.5 text-xs outline-none focus:border-steel-600"
                      />
                    </div>
                  </div>

                  <div className="mt-4 grid max-h-[420px] grid-cols-2 gap-3 overflow-y-auto pr-1 md:grid-cols-3">
                    {produtosFiltrados.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => adicionarProduto(p)}
                        className="group flex cursor-pointer flex-col overflow-hidden rounded-sm border border-steel-200 bg-white text-left transition-colors duration-200 hover:border-ember-400"
                      >
                        <span className="flex h-24 items-center justify-center border-b border-steel-100 bg-steel-50">
                          {p.fotoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.fotoUrl}
                              alt=""
                              className="h-full w-full object-contain p-1.5"
                            />
                          ) : (
                            <IconImage size={20} className="text-steel-300" />
                          )}
                        </span>
                        <span className="flex flex-1 flex-col p-2.5">
                          <span className="font-mono text-[0.6rem] text-steel-400">
                            {p.codigo}
                          </span>
                          <span className="mt-0.5 line-clamp-3 text-xs font-medium leading-snug text-steel-900">
                            {p.nome}
                          </span>
                          <span className="mt-auto pt-2 font-mono text-[0.68rem] font-bold text-steel-600">
                            {p.precoTabela > 0 ? formatarMoeda(p.precoTabela) : "sob consulta"}
                          </span>
                          <span className="tech-label mt-1.5 flex items-center gap-1 text-ember-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                            <IconPlus size={11} /> adicionar
                          </span>
                        </span>
                      </button>
                    ))}
                    {produtosFiltrados.length === 0 && (
                      <p className="col-span-full py-8 text-center text-sm text-steel-400">
                        Nenhum equipamento encontrado.
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Itens escolhidos */}
              {itens.length > 0 && (
                <div className="mt-7 border-t border-steel-100 pt-6">
                  <p className="tech-label mb-4 text-steel-500">
                    Itens do orçamento ({itens.length})
                  </p>
                  <div className="space-y-3">
                    {itens.map((item, idx) => (
                      <div
                        key={`${item.produtoId}-${idx}`}
                        className="flex flex-wrap items-start gap-4 rounded-sm border border-steel-200 p-3"
                      >
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-steel-100 bg-steel-50">
                          {item.fotoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.fotoUrl}
                              alt=""
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <IconImage size={17} className="text-steel-300" />
                          )}
                        </div>

                        <div className="min-w-[180px] flex-1">
                          <p className="font-mono text-[0.62rem] text-steel-400">
                            {item.codigo}
                            {item.ncm ? ` · NCM ${item.ncm}` : ""}
                          </p>
                          <p className="mt-0.5 text-sm font-semibold leading-snug text-steel-900">
                            {item.descricao}
                          </p>
                          {item.caracteristicas.length > 0 && (
                            <p className="mt-1 line-clamp-2 text-xs text-steel-500">
                              {item.caracteristicas.join(" · ")}
                            </p>
                          )}
                        </div>

                        <div className="w-20">
                          <label
                            className={labelCls}
                            htmlFor={`qtd-${idx}`}
                          >
                            Qtde
                          </label>
                          <input
                            id={`qtd-${idx}`}
                            type="number"
                            min={1}
                            className={inputCls}
                            value={item.quantidade}
                            onChange={(e) =>
                              alterarItem(idx, {
                                quantidade: Math.max(1, Number(e.target.value)),
                              })
                            }
                          />
                        </div>

                        <div className="w-36">
                          <label className={labelCls} htmlFor={`preco-${idx}`}>
                            Preço unit. (R$)
                          </label>
                          <input
                            id={`preco-${idx}`}
                            className={inputCls}
                            defaultValue={paraTextoMoeda(item.precoUnitario)}
                            onChange={(e) =>
                              alterarItem(idx, { precoUnitario: paraNumero(e.target.value) })
                            }
                            placeholder="0,00"
                          />
                        </div>

                        <div className="flex flex-col items-end justify-end pb-0.5">
                          <span className="font-mono text-sm font-bold text-steel-800">
                            {formatarMoeda(item.precoUnitario * item.quantidade)}
                          </span>
                          <button
                            onClick={() => setItens(itens.filter((_, i) => i !== idx))}
                            aria-label={`Remover ${item.descricao}`}
                            className="mt-1 cursor-pointer rounded-sm p-1.5 text-steel-400 transition-colors duration-150 hover:bg-ember-100 hover:text-ember-600"
                          >
                            <IconTrash size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── PASSO 3 — CONDIÇÕES ──────────────────────────────────── */}
          {passo === 2 && (
            <div className="space-y-7">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className={labelCls} htmlFor="cond-pgto">
                    Condição de pagamento (texto do orçamento)
                  </label>
                  <input
                    id="cond-pgto"
                    className={inputCls}
                    value={condicoes.condicaoPagamento}
                    onChange={(e) =>
                      setCondicoes({ ...condicoes, condicaoPagamento: e.target.value })
                    }
                    placeholder="CONDIÇÃO DE PAGAMENTO A COMBINAR"
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor="prazo">Prazo de entrega</label>
                  <input
                    id="prazo"
                    className={inputCls}
                    value={condicoes.prazoEntrega}
                    onChange={(e) =>
                      setCondicoes({ ...condicoes, prazoEntrega: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor="prev">Previsão de faturamento</label>
                  <input
                    id="prev"
                    type="date"
                    className={inputCls}
                    value={condicoes.previsaoFaturamento || ""}
                    onChange={(e) =>
                      setCondicoes({ ...condicoes, previsaoFaturamento: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor="validade">Validade (dias)</label>
                  <input
                    id="validade"
                    type="number"
                    min={1}
                    className={inputCls}
                    value={condicoes.validadeDias}
                    onChange={(e) =>
                      setCondicoes({ ...condicoes, validadeDias: Number(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor="frete">Frete</label>
                  <select
                    id="frete"
                    className={`${inputCls} cursor-pointer`}
                    value={condicoes.frete}
                    onChange={(e) =>
                      setCondicoes({
                        ...condicoes,
                        frete: e.target.value as CondicoesComerciais["frete"],
                      })
                    }
                  >
                    <option value="CIF">CIF — por conta da Brasforno</option>
                    <option value="FOB">FOB — por conta do cliente</option>
                    <option value="A combinar">A combinar</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls} htmlFor="desc">Desconto (%)</label>
                  <input
                    id="desc"
                    type="number"
                    min={0}
                    max={30}
                    className={inputCls}
                    value={condicoes.descontoPercent}
                    onChange={(e) =>
                      setCondicoes({
                        ...condicoes,
                        descontoPercent: Math.min(30, Math.max(0, Number(e.target.value))),
                      })
                    }
                  />
                  <p
                    className={`mt-1.5 text-xs ${
                      precisaAprovacao ? "font-medium text-ember-600" : "text-steel-500"
                    }`}
                  >
                    {precisaAprovacao
                      ? `Acima de ${LIMITE_DESCONTO_SEM_APROVACAO}%: a proposta ficará travada até a liberação da gestão.`
                      : `Até ${LIMITE_DESCONTO_SEM_APROVACAO}% não precisa de aprovação.`}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls} htmlFor="ipi">IPI (R$)</label>
                    <input
                      id="ipi"
                      className={inputCls}
                      value={ipiTexto}
                      onChange={(e) => {
                        setIpiTexto(e.target.value);
                        setCondicoes((c) => ({ ...c, ipi: paraNumero(e.target.value) }));
                      }}
                      placeholder="0,00"
                    />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="icms">ICMS ST (R$)</label>
                    <input
                      id="icms"
                      className={inputCls}
                      value={icmsTexto}
                      onChange={(e) => {
                        setIcmsTexto(e.target.value);
                        setCondicoes((c) => ({ ...c, icmsSt: paraNumero(e.target.value) }));
                      }}
                      placeholder="0,00"
                    />
                  </div>
                </div>
              </div>

              {/* Vencimentos */}
              <div className="border-t border-steel-100 pt-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="tech-label text-steel-500">Vencimentos</p>
                    <p className="mt-1 text-xs text-steel-500">
                      Gere as parcelas a partir do total de {formatarMoeda(total)} e ajuste
                      datas e valores se precisar.
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 6].map((n) => (
                      <button
                        key={n}
                        onClick={() => gerarParcelas(n)}
                        className="flex h-9 cursor-pointer items-center rounded-sm border border-steel-200 px-3 font-mono text-xs text-steel-600 transition-colors duration-200 hover:border-steel-600 hover:bg-steel-600 hover:text-white"
                      >
                        {n === 1 ? "À vista" : `${n}x`}
                      </button>
                    ))}
                  </div>
                </div>

                {condicoes.parcelas.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {condicoes.parcelas.map((p, idx) => (
                      <div key={p.numero} className="flex flex-wrap items-center gap-3">
                        <span className="w-20 font-mono text-xs text-steel-500">
                          Parcela {p.numero}
                        </span>
                        <input
                          type="date"
                          aria-label={`Vencimento da parcela ${p.numero}`}
                          className={`${inputCls} w-44`}
                          value={p.vencimento}
                          onChange={(e) => alterarParcela(idx, { vencimento: e.target.value })}
                        />
                        <input
                          aria-label={`Valor da parcela ${p.numero}`}
                          className={`${inputCls} w-36`}
                          defaultValue={paraTextoMoeda(p.valor)}
                          onChange={(e) =>
                            alterarParcela(idx, { valor: paraNumero(e.target.value) })
                          }
                        />
                        <button
                          onClick={() =>
                            setCondicoes((c) => ({
                              ...c,
                              parcelas: c.parcelas
                                .filter((_, i) => i !== idx)
                                .map((x, i) => ({ ...x, numero: i + 1 })),
                            }))
                          }
                          aria-label={`Remover parcela ${p.numero}`}
                          className="cursor-pointer rounded-sm p-2 text-steel-400 hover:bg-ember-100 hover:text-ember-600"
                        >
                          <IconTrash size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Despesas previstas */}
              <div className="border-t border-steel-100 pt-6">
                <p className="tech-label text-steel-500">Despesas previstas</p>
                <p className="mt-1 text-xs leading-relaxed text-steel-500">
                  Entram no bloco de observações do orçamento, deixando claro o que é por
                  conta de quem. São informativas: não somam ao total.
                </p>

                <div className="mt-3.5 flex flex-wrap gap-2">
                  {DESPESAS_SUGERIDAS.map((s) => {
                    const marcada = condicoes.despesas.some((d) => d.descricao === s.descricao);
                    return (
                      <button
                        key={s.descricao}
                        onClick={() => alternarDespesa(s)}
                        className={`flex h-8 max-w-full cursor-pointer items-center gap-1.5 rounded-sm px-2.5 text-left text-[0.72rem] transition-colors duration-200 ${
                          marcada
                            ? "bg-steel-700 text-white"
                            : "border border-steel-200 text-steel-600 hover:bg-steel-50"
                        }`}
                      >
                        {marcada ? <IconCheck size={12} /> : <IconPlus size={12} />}
                        <span className="truncate">{s.descricao.split(" (")[0]}</span>
                      </button>
                    );
                  })}
                </div>

                {condicoes.despesas.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {condicoes.despesas.map((d, idx) => (
                      <div
                        key={`${d.descricao}-${idx}`}
                        className="flex flex-wrap items-center gap-2 rounded-sm border border-steel-200 p-2.5"
                      >
                        <input
                          aria-label="Descrição da despesa"
                          className="h-9 min-w-[200px] flex-1 rounded-sm border border-steel-200 px-2.5 text-xs outline-none focus:border-steel-600"
                          value={d.descricao}
                          onChange={(e) => alterarDespesa(idx, { descricao: e.target.value })}
                        />
                        <select
                          aria-label="Responsável pela despesa"
                          className="h-9 cursor-pointer rounded-sm border border-steel-200 px-2 text-xs outline-none focus:border-steel-600"
                          value={d.responsavel}
                          onChange={(e) =>
                            alterarDespesa(idx, {
                              responsavel: e.target.value as Despesa["responsavel"],
                            })
                          }
                        >
                          <option value="Cliente">Por conta do cliente</option>
                          <option value="Brasforno">Por conta da Brasforno</option>
                        </select>
                        <input
                          aria-label="Valor estimado da despesa"
                          className="h-9 w-28 rounded-sm border border-steel-200 px-2.5 text-xs outline-none focus:border-steel-600"
                          defaultValue={d.valor ? paraTextoMoeda(d.valor) : ""}
                          onChange={(e) =>
                            alterarDespesa(idx, { valor: paraNumero(e.target.value) })
                          }
                          placeholder="valor opc."
                        />
                        <button
                          onClick={() =>
                            setCondicoes((c) => ({
                              ...c,
                              despesas: c.despesas.filter((_, i) => i !== idx),
                            }))
                          }
                          aria-label={`Remover despesa ${d.descricao}`}
                          className="cursor-pointer rounded-sm p-2 text-steel-400 hover:bg-ember-100 hover:text-ember-600"
                        >
                          <IconTrash size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-steel-100 pt-6">
                <label className={labelCls} htmlFor="obs">Observações adicionais</label>
                <textarea
                  id="obs"
                  rows={3}
                  className={areaCls}
                  value={condicoes.observacoes}
                  onChange={(e) =>
                    setCondicoes({ ...condicoes, observacoes: e.target.value })
                  }
                  placeholder="Treinamento incluso, troca de equipamento usado, particularidades da instalação…"
                />
              </div>
            </div>
          )}

          {/* ── PASSO 4 — REVISÃO ────────────────────────────────────── */}
          {passo === 3 && (
            <div className="text-sm">
              {precisaAprovacao && (
                <div className="mb-6 flex items-start gap-2.5 border-l-2 border-amber-500 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  <IconAlertTriangle size={16} className="mt-0.5 shrink-0" />
                  <span>
                    Desconto de {condicoes.descontoPercent}% acima da alçada. A proposta
                    será criada aguardando a liberação da gestão e o envio ficará
                    bloqueado até lá.
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <p className="tech-label border-b-2 border-steel-800 pb-2 text-steel-600">
                    Cliente
                  </p>
                  <dl className="mt-3 space-y-2">
                    {[
                      ["Empresa", cliente.empresa],
                      ["Contato", cliente.nome],
                      ["CNPJ/CPF", cliente.cnpjCpf || "—"],
                      ["Telefone", cliente.whatsapp],
                      ["Local", `${cliente.cidade}/${cliente.uf} · ${cliente.segmento}`],
                    ].map(([k, v]) => (
                      <div key={k} className="flex gap-2">
                        <dt className="shrink-0 text-steel-500">{k}:</dt>
                        <dd className="font-medium text-steel-900">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <div>
                  <p className="tech-label border-b-2 border-steel-800 pb-2 text-steel-600">
                    Condições
                  </p>
                  <dl className="mt-3 space-y-2">
                    {[
                      ["Pagamento", condicoes.condicaoPagamento],
                      ["Vencimentos", condicoes.tipoVencimento],
                      ["Entrega", condicoes.prazoEntrega],
                      ["Frete", condicoes.frete],
                      ["Validade", `${condicoes.validadeDias} dias`],
                    ].map(([k, v]) => (
                      <div key={k} className="flex gap-2">
                        <dt className="shrink-0 text-steel-500">{k}:</dt>
                        <dd className="font-medium text-steel-900">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>

              <p className="tech-label mt-7 border-b-2 border-steel-800 pb-2 text-steel-600">
                Itens
              </p>
              <ul className="mt-3 space-y-2.5">
                {itens.map((i, idx) => (
                  <li key={idx} className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2.5 text-steel-800">
                      {i.fotoUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={i.fotoUrl}
                          alt=""
                          className="h-9 w-9 shrink-0 rounded-sm border border-steel-100 object-contain"
                        />
                      )}
                      <span>
                        <span className="font-mono text-xs text-steel-400">{i.codigo}</span>{" "}
                        {i.quantidade}× {i.descricao}
                      </span>
                    </span>
                    <span className="shrink-0 font-mono font-medium">
                      {formatarMoeda(i.precoUnitario * i.quantidade)}
                    </span>
                  </li>
                ))}
              </ul>

              {condicoes.despesas.length > 0 && (
                <>
                  <p className="tech-label mt-7 border-b-2 border-steel-800 pb-2 text-steel-600">
                    Despesas previstas
                  </p>
                  <ul className="mt-3 space-y-1.5 text-xs text-steel-600">
                    {condicoes.despesas.map((d, i) => (
                      <li key={i}>
                        {d.descricao} —{" "}
                        <span className="font-medium">
                          por conta {d.responsavel === "Brasforno" ? "da Brasforno" : "do cliente"}
                        </span>
                        {d.valor ? ` · ${formatarMoeda(d.valor)}` : ""}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>

        {/* Resumo */}
        <aside className="rise rise-3 lg:sticky lg:top-6 lg:self-start" aria-label="Resumo da proposta">
          <div className="panel overflow-hidden">
            <div className="hazard h-1.5 w-full" aria-hidden />
            <div className="p-5">
              <p className="tech-label text-steel-500">Resumo em tempo real</p>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-xs text-steel-500">Cliente</dt>
                  <dd className="mt-0.5 font-medium text-steel-900">
                    {cliente.empresa || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-steel-500">Itens</dt>
                  <dd className="mt-0.5 font-medium text-steel-900">
                    {itens.length === 0
                      ? "—"
                      : `${itens.reduce((s, i) => s + i.quantidade, 0)} unidade(s) · ${itens.length} item(ns)`}
                  </dd>
                </div>
              </dl>

              <div className="mt-5 space-y-1.5 border-t border-steel-100 pt-4 text-sm">
                <div className="flex justify-between text-steel-600">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatarMoeda(subtotal)}</span>
                </div>
                {condicoes.descontoPercent > 0 && (
                  <div className="flex justify-between text-ember-600">
                    <span>Desconto ({condicoes.descontoPercent}%)</span>
                    <span className="font-mono">− {formatarMoeda(desconto)}</span>
                  </div>
                )}
                {condicoes.ipi > 0 && (
                  <div className="flex justify-between text-steel-600">
                    <span>IPI</span>
                    <span className="font-mono">{formatarMoeda(condicoes.ipi)}</span>
                  </div>
                )}
                {condicoes.icmsSt > 0 && (
                  <div className="flex justify-between text-steel-600">
                    <span>ICMS ST</span>
                    <span className="font-mono">{formatarMoeda(condicoes.icmsSt)}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 border-t-2 border-steel-800 pt-4">
                <p className="tech-label text-steel-500">Total do orçamento</p>
                <p className="mt-1 font-mono text-2xl font-bold text-steel-900">
                  {formatarMoeda(total)}
                </p>
              </div>

              {precisaAprovacao && (
                <p className="mt-4 border-l-2 border-amber-500 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800">
                  Precisa de liberação da gestão antes do envio.
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Navegação */}
      <div className="rise rise-4 mt-6 flex justify-between lg:max-w-[calc(100%-324px)]">
        <button
          onClick={() => {
            setErro("");
            setPasso(Math.max(0, passo - 1));
          }}
          disabled={passo === 0}
          className="flex h-11 cursor-pointer items-center gap-1.5 rounded-sm border border-steel-300 bg-white px-4 text-sm font-medium text-steel-600 transition-colors duration-200 hover:bg-steel-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <IconChevronLeft size={15} />
          Voltar
        </button>
        {passo < PASSOS.length - 1 ? (
          <button
            onClick={() => validarPasso() && setPasso(passo + 1)}
            className="flex h-11 cursor-pointer items-center gap-2 rounded-sm bg-steel-700 px-6 text-sm font-bold text-white transition-colors duration-200 hover:bg-steel-600"
          >
            Avançar
            <IconArrowRight size={15} />
          </button>
        ) : (
          <button
            onClick={finalizar}
            disabled={salvando}
            className="flex h-11 cursor-pointer items-center gap-2 rounded-sm bg-ember-500 px-6 text-sm font-bold text-white transition-colors duration-200 hover:bg-ember-600 disabled:cursor-wait disabled:opacity-60"
          >
            <IconFlame size={16} />
            {salvando ? "Gerando orçamento…" : "Gerar Orçamento"}
          </button>
        )}
      </div>
    </div>
  );
}
