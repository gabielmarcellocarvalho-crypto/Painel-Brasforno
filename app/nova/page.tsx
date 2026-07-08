"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CATALOGO, CATEGORIAS, SEGMENTOS, UFS, getProduto } from "@/lib/catalog";
import { Cliente, CondicoesComerciais, ItemProposta } from "@/lib/types";
import { formatarMoeda } from "@/lib/utils";
import {
  IconCheck,
  IconChevronLeft,
  IconArrowRight,
  IconFlame,
  IconPlus,
  IconTrash,
} from "@/components/Icons";

const PASSOS = ["Cliente", "Equipamentos", "Condições", "Revisão"] as const;

const inputCls =
  "h-11 w-full rounded-sm border border-steel-200 bg-white px-3 text-sm outline-none transition-colors duration-200 focus:border-steel-600 focus:ring-2 focus:ring-steel-600/15";
const areaCls =
  "w-full rounded-sm border border-steel-200 bg-white px-3 py-2.5 text-sm outline-none transition-colors duration-200 focus:border-steel-600 focus:ring-2 focus:ring-steel-600/15";
const labelCls = "tech-label mb-1.5 block text-steel-600";

export default function NovaProposta() {
  const router = useRouter();
  const [passo, setPasso] = useState(0);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const [representante, setRepresentante] = useState("");
  const [cliente, setCliente] = useState<Cliente>({
    nome: "",
    empresa: "",
    whatsapp: "",
    email: "",
    cidade: "",
    uf: "SP",
    segmento: "Padaria",
  });

  const [itens, setItens] = useState<ItemProposta[]>([]);
  const [categoriaSel, setCategoriaSel] = useState<string>("Fornos");
  const [produtoSel, setProdutoSel] = useState<string>("forno-lastro-pnova");
  const [modeloSel, setModeloSel] = useState<string>("");
  const [qtdSel, setQtdSel] = useState(1);
  const [precoSel, setPrecoSel] = useState("");

  const [condicoes, setCondicoes] = useState<CondicoesComerciais>({
    validadeDias: 15,
    prazoEntrega: "30 dias úteis após confirmação do pedido",
    frete: "A combinar",
    formaPagamento: "50% entrada + 50% na entrega",
    descontoPercent: 0,
    observacoes: "",
  });

  const produtosDaCategoria = useMemo(
    () => CATALOGO.filter((p) => p.categoria === categoriaSel),
    [categoriaSel]
  );
  const produtoAtual = getProduto(produtoSel);

  const subtotal = itens.reduce((s, i) => s + i.precoUnitario * i.quantidade, 0);
  const total = subtotal * (1 - condicoes.descontoPercent / 100);

  function adicionarItem() {
    if (!produtoAtual) return;
    const preco = parseFloat(precoSel.replace(/\./g, "").replace(",", "."));
    if (!modeloSel) {
      setErro("Selecione o modelo do equipamento.");
      return;
    }
    if (!preco || preco <= 0) {
      setErro("Informe o preço unitário negociado (consulte a tabela da fábrica).");
      return;
    }
    setErro("");
    setItens([
      ...itens,
      {
        produtoId: produtoAtual.id,
        produtoNome: produtoAtual.nome,
        categoria: produtoAtual.categoria,
        modelo: modeloSel,
        quantidade: qtdSel,
        precoUnitario: preco,
      },
    ]);
    setModeloSel("");
    setQtdSel(1);
    setPrecoSel("");
  }

  function validarPasso(): boolean {
    setErro("");
    if (passo === 0) {
      if (!representante.trim()) return falha("Informe o seu nome (representante).");
      if (!cliente.nome.trim()) return falha("Informe o nome do contato.");
      if (!cliente.empresa.trim()) return falha("Informe o nome da empresa/padaria.");
      const dig = cliente.whatsapp.replace(/\D/g, "");
      if (dig.length < 10) return falha("Informe um WhatsApp válido com DDD.");
      if (!cliente.cidade.trim()) return falha("Informe a cidade.");
    }
    if (passo === 1 && itens.length === 0)
      return falha("Adicione pelo menos um equipamento à proposta.");
    return true;
  }

  function falha(msg: string): false {
    setErro(msg);
    return false;
  }

  async function finalizar() {
    if (!validarPasso()) return;
    setSalvando(true);
    setErro("");
    try {
      const resp = await fetch("/api/propostas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ representante, cliente, itens, condicoes }),
      });
      const dados = await resp.json();
      if (!resp.ok) throw new Error(dados.erro || "Erro ao salvar proposta.");
      router.push(`/proposta/${dados.id}`);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro inesperado.");
      setSalvando(false);
    }
  }

  return (
    <div className="max-w-6xl px-4 py-8 md:px-6 lg:px-10">
      <header className="rise">
        <p className="tech-label text-steel-500">Fluxo padrão de atendimento</p>
        <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-steel-900 md:text-4xl">
          Nova Proposta
        </h1>
      </header>

      {/* Passos conectados */}
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
          {erro}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_290px]">
        {/* Formulário do passo */}
        <div className="rise rise-2 panel p-5 md:p-8">
          {/* PASSO 1 — CLIENTE */}
          {passo === 0 && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className={labelCls} htmlFor="rep">Representante responsável *</label>
                <input
                  id="rep"
                  className={inputCls}
                  value={representante}
                  onChange={(e) => setRepresentante(e.target.value)}
                  placeholder="Seu nome"
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
                <label className={labelCls} htmlFor="empresa">Empresa / Padaria *</label>
                <input
                  id="empresa"
                  className={inputCls}
                  value={cliente.empresa}
                  onChange={(e) => setCliente({ ...cliente, empresa: e.target.value })}
                  placeholder="Ex.: Padaria Pão Dourado"
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="zap">WhatsApp (com DDD) *</label>
                <input
                  id="zap"
                  className={inputCls}
                  value={cliente.whatsapp}
                  onChange={(e) => setCliente({ ...cliente, whatsapp: e.target.value })}
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
                  placeholder="opcional"
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
          )}

          {/* PASSO 2 — EQUIPAMENTOS */}
          {passo === 1 && (
            <div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className={labelCls} htmlFor="cat">Categoria</label>
                  <select
                    id="cat"
                    className={`${inputCls} cursor-pointer`}
                    value={categoriaSel}
                    onChange={(e) => {
                      setCategoriaSel(e.target.value);
                      const primeiro = CATALOGO.find((p) => p.categoria === e.target.value);
                      setProdutoSel(primeiro?.id || "");
                      setModeloSel("");
                    }}
                  >
                    {CATEGORIAS.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls} htmlFor="prod">Equipamento</label>
                  <select
                    id="prod"
                    className={`${inputCls} cursor-pointer`}
                    value={produtoSel}
                    onChange={(e) => {
                      setProdutoSel(e.target.value);
                      setModeloSel("");
                    }}
                  >
                    {produtosDaCategoria.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls} htmlFor="modelo">Modelo / Tamanho</label>
                  <select
                    id="modelo"
                    className={`${inputCls} cursor-pointer`}
                    value={modeloSel}
                    onChange={(e) => setModeloSel(e.target.value)}
                  >
                    <option value="">Selecione…</option>
                    {produtoAtual?.modelos.map((m) => (
                      <option key={m.nome} value={m.nome}>
                        {m.nome}
                        {m.detalhe ? ` — ${m.detalhe}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls} htmlFor="qtd">Qtde</label>
                    <input
                      id="qtd"
                      type="number"
                      min={1}
                      className={inputCls}
                      value={qtdSel}
                      onChange={(e) => setQtdSel(Math.max(1, Number(e.target.value)))}
                    />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="preco">Preço unit. (R$)</label>
                    <input
                      id="preco"
                      className={inputCls}
                      value={precoSel}
                      onChange={(e) => setPrecoSel(e.target.value)}
                      placeholder="48.900,00"
                    />
                  </div>
                </div>
              </div>

              {produtoAtual && (
                <div className="mt-4 border-l-2 border-steel-600 bg-steel-50 p-4 text-sm">
                  <p className="font-semibold text-steel-800">{produtoAtual.nome}</p>
                  <p className="mt-1 leading-relaxed text-steel-600">{produtoAtual.resumo}</p>
                </div>
              )}

              <button
                onClick={adicionarItem}
                className="mt-4 flex h-11 cursor-pointer items-center gap-2 rounded-sm border border-steel-600/50 px-4 text-sm font-medium text-steel-700 transition-colors duration-200 hover:border-steel-600 hover:bg-steel-600 hover:text-white"
              >
                <IconPlus size={15} />
                Adicionar à proposta
              </button>

              {itens.length > 0 && (
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full min-w-[520px] text-sm">
                    <thead>
                      <tr className="border-b-2 border-steel-800 text-left">
                        <th className="tech-label py-2.5 font-normal text-steel-500">Equipamento</th>
                        <th className="tech-label py-2.5 font-normal text-steel-500">Modelo</th>
                        <th className="tech-label py-2.5 text-center font-normal text-steel-500">Qtde</th>
                        <th className="tech-label py-2.5 text-right font-normal text-steel-500">Subtotal</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {itens.map((item, idx) => (
                        <tr key={idx} className="border-b border-steel-100">
                          <td className="py-3 font-medium text-steel-900">{item.produtoNome}</td>
                          <td className="py-3 text-steel-600">{item.modelo}</td>
                          <td className="py-3 text-center font-mono">{item.quantidade}</td>
                          <td className="py-3 text-right font-mono font-semibold">
                            {formatarMoeda(item.precoUnitario * item.quantidade)}
                          </td>
                          <td className="py-3 pl-3 text-right">
                            <button
                              onClick={() => setItens(itens.filter((_, i) => i !== idx))}
                              aria-label={`Remover ${item.produtoNome}`}
                              className="cursor-pointer rounded-sm p-2 text-steel-400 transition-colors duration-150 hover:bg-ember-100 hover:text-ember-600"
                            >
                              <IconTrash size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* PASSO 3 — CONDIÇÕES */}
          {passo === 2 && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className={labelCls} htmlFor="validade">Validade da proposta (dias)</label>
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
                <label className={labelCls} htmlFor="pgto">Forma de pagamento</label>
                <input
                  id="pgto"
                  className={inputCls}
                  value={condicoes.formaPagamento}
                  onChange={(e) =>
                    setCondicoes({ ...condicoes, formaPagamento: e.target.value })
                  }
                  placeholder="Ex.: 50% entrada + 50% na entrega / FINAME"
                />
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
                <p className="mt-1.5 font-mono text-xs text-steel-500">
                  Acima de 10% exige aprovação do gerente comercial.
                </p>
              </div>
              <div className="md:col-span-2">
                <label className={labelCls} htmlFor="obs">Observações</label>
                <textarea
                  id="obs"
                  rows={3}
                  className={areaCls}
                  value={condicoes.observacoes}
                  onChange={(e) =>
                    setCondicoes({ ...condicoes, observacoes: e.target.value })
                  }
                  placeholder="Instalação, treinamento, troca de equipamento usado…"
                />
              </div>
            </div>
          )}

          {/* PASSO 4 — REVISÃO */}
          {passo === 3 && (
            <div className="text-sm">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <p className="tech-label border-b-2 border-steel-800 pb-2 text-steel-600">
                    Cliente
                  </p>
                  <dl className="mt-3 space-y-2">
                    {[
                      ["Empresa", cliente.empresa],
                      ["Contato", cliente.nome],
                      ["WhatsApp", cliente.whatsapp],
                      ["Local", `${cliente.cidade}/${cliente.uf} · ${cliente.segmento}`],
                      ["Representante", representante],
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
                      ["Validade", `${condicoes.validadeDias} dias`],
                      ["Entrega", condicoes.prazoEntrega],
                      ["Frete", condicoes.frete],
                      ["Pagamento", condicoes.formaPagamento],
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
                Equipamentos
              </p>
              <ul className="mt-3 space-y-2">
                {itens.map((i, idx) => (
                  <li key={idx} className="flex justify-between gap-3">
                    <span className="text-steel-800">
                      {i.quantidade}× {i.produtoNome} — {i.modelo}
                    </span>
                    <span className="font-mono font-medium">
                      {formatarMoeda(i.precoUnitario * i.quantidade)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Trilho de resumo */}
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
                  <dt className="text-xs text-steel-500">Equipamentos</dt>
                  <dd className="mt-0.5 font-medium text-steel-900">
                    {itens.length === 0
                      ? "—"
                      : `${itens.reduce((s, i) => s + i.quantidade, 0)} unidade(s) · ${itens.length} item(ns)`}
                  </dd>
                </div>
                {condicoes.descontoPercent > 0 && (
                  <div>
                    <dt className="text-xs text-steel-500">Desconto</dt>
                    <dd className="mt-0.5 font-medium text-ember-600">
                      {condicoes.descontoPercent}%
                    </dd>
                  </div>
                )}
              </dl>
              <div className="mt-5 border-t-2 border-steel-800 pt-4">
                <p className="tech-label text-steel-500">Investimento total</p>
                <p className="mt-1 font-mono text-2xl font-bold text-steel-900">
                  {formatarMoeda(total)}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Navegação */}
      <div className="rise rise-4 mt-6 flex justify-between lg:max-w-[calc(100%-314px)]">
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
            {salvando ? "Gerando proposta…" : "Gerar Proposta"}
          </button>
        )}
      </div>
    </div>
  );
}
