"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIAS, UNIDADES } from "@/lib/empresa";
import { Produto } from "@/lib/types";
import { formatarMoeda } from "@/lib/utils";
import CampoFoto from "./CampoFoto";
import {
  IconAlertTriangle,
  IconImage,
  IconPencil,
  IconPlus,
  IconSearch,
  IconTrash,
  IconX,
} from "./Icons";

const inputCls =
  "h-11 w-full rounded-sm border border-steel-200 bg-white px-3 text-sm outline-none transition-colors duration-200 focus:border-steel-600 focus:ring-2 focus:ring-steel-600/15";
const areaCls =
  "w-full rounded-sm border border-steel-200 bg-white px-3 py-2.5 text-sm leading-relaxed outline-none transition-colors duration-200 focus:border-steel-600 focus:ring-2 focus:ring-steel-600/15";
const labelCls = "tech-label mb-1.5 block text-steel-600";

type Rascunho = {
  id?: string;
  codigo: string;
  nome: string;
  categoria: string;
  ncm: string;
  unidade: string;
  precoTabela: string;
  fotoUrl: string;
  caracteristicas: string;
  descricaoComplementar: string;
  ativo: boolean;
};

function vazio(): Rascunho {
  return {
    codigo: "",
    nome: "",
    categoria: CATEGORIAS[0],
    ncm: "",
    unidade: "UNID",
    precoTabela: "",
    fotoUrl: "",
    caracteristicas: "",
    descricaoComplementar: "",
    ativo: true,
  };
}

function paraRascunho(p: Produto): Rascunho {
  return {
    id: p.id,
    codigo: p.codigo,
    nome: p.nome,
    categoria: p.categoria,
    ncm: p.ncm,
    unidade: p.unidade,
    precoTabela: p.precoTabela ? String(p.precoTabela).replace(".", ",") : "",
    fotoUrl: p.fotoUrl,
    caracteristicas: p.caracteristicas.join("\n"),
    descricaoComplementar: p.descricaoComplementar,
    ativo: p.ativo,
  };
}

function paraNumero(texto: string): number {
  const limpo = texto.replace(/\./g, "").replace(",", ".");
  const n = parseFloat(limpo);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export default function GerenciadorCatalogo({
  produtosIniciais,
  podeEditar,
}: {
  produtosIniciais: Produto[];
  podeEditar: boolean;
}) {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("Todas");
  const [rascunho, setRascunho] = useState<Rascunho | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [confirmandoExclusao, setConfirmandoExclusao] = useState<string | null>(null);

  const categoriasComItens = useMemo(
    () => ["Todas", ...CATEGORIAS.filter((c) => produtosIniciais.some((p) => p.categoria === c))],
    [produtosIniciais]
  );

  const filtrados = useMemo(() => {
    const q = busca.toLowerCase().trim();
    return produtosIniciais.filter((p) => {
      const okCategoria = categoria === "Todas" || p.categoria === categoria;
      const okBusca =
        !q || [p.codigo, p.nome, p.categoria, p.ncm].join(" ").toLowerCase().includes(q);
      return okCategoria && okBusca;
    });
  }, [produtosIniciais, busca, categoria]);

  async function salvar() {
    if (!rascunho) return;
    if (!rascunho.nome.trim()) return setErro("Informe o nome do produto.");

    setSalvando(true);
    setErro("");
    try {
      const corpo = {
        codigo: rascunho.codigo,
        nome: rascunho.nome,
        categoria: rascunho.categoria,
        ncm: rascunho.ncm,
        unidade: rascunho.unidade,
        precoTabela: paraNumero(rascunho.precoTabela),
        fotoUrl: rascunho.fotoUrl,
        caracteristicas: rascunho.caracteristicas,
        descricaoComplementar: rascunho.descricaoComplementar,
        ativo: rascunho.ativo,
      };

      const resp = await fetch(
        rascunho.id ? `/api/produtos/${rascunho.id}` : "/api/produtos",
        {
          method: rascunho.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(corpo),
        }
      );
      const dados = await resp.json();
      if (!resp.ok) throw new Error(dados.erro || "Erro ao salvar.");

      setRascunho(null);
      router.refresh();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro inesperado.");
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(id: string) {
    setSalvando(true);
    try {
      const resp = await fetch(`/api/produtos/${id}`, { method: "DELETE" });
      if (!resp.ok) {
        const dados = await resp.json();
        setErro(dados.erro || "Erro ao excluir.");
      }
      setConfirmandoExclusao(null);
      router.refresh();
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="max-w-6xl px-4 py-8 md:px-6 lg:px-10">
      <header className="rise flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="tech-label text-steel-500">Cadastro de itens</p>
          <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-steel-900 md:text-4xl">
            Catálogo de Produtos
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-steel-600">
            Foto, características técnicas e preço de tabela ficam aqui. A proposta puxa
            tudo automaticamente na hora de montar o orçamento.
          </p>
        </div>
        {podeEditar && (
          <button
            onClick={() => {
              setRascunho(vazio());
              setErro("");
            }}
            className="flex h-11 cursor-pointer items-center gap-2 rounded-sm bg-ember-500 px-5 text-sm font-bold text-white transition-colors duration-200 hover:bg-ember-600"
          >
            <IconPlus size={16} />
            Novo Produto
          </button>
        )}
      </header>

      {erro && !rascunho && (
        <div
          role="alert"
          className="mt-5 flex items-center gap-2.5 border-l-2 border-ember-500 bg-ember-100 px-4 py-3 text-sm font-medium text-ember-700"
        >
          <IconAlertTriangle size={16} />
          {erro}
        </div>
      )}

      {!podeEditar && (
        <p className="mt-5 border-l-2 border-steel-300 bg-steel-50 px-4 py-3 text-sm text-steel-600">
          Você está vendo o catálogo em modo consulta. Alterações no cadastro são feitas
          pelo administrador.
        </p>
      )}

      {/* Filtros */}
      <section className="rise rise-2 mt-6 flex flex-wrap items-center gap-2">
        {categoriasComItens.map((c) => (
          <button
            key={c}
            onClick={() => setCategoria(c)}
            className={`flex h-9 cursor-pointer items-center rounded-sm px-3 font-mono text-xs uppercase tracking-wider transition-colors duration-200 ${
              categoria === c
                ? "bg-steel-800 text-white"
                : "bg-white text-steel-600 shadow-sm hover:bg-steel-100"
            }`}
          >
            {c}
          </button>
        ))}
        <div className="relative ml-auto">
          <IconSearch
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-steel-400"
          />
          <label className="sr-only" htmlFor="busca-produto">Buscar produto</label>
          <input
            id="busca-produto"
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar código, nome, NCM…"
            className="h-9 w-60 rounded-sm border border-steel-200 bg-white pl-9 pr-3 text-sm shadow-sm outline-none transition-colors duration-200 focus:border-steel-600"
          />
        </div>
      </section>

      {/* Grade de produtos */}
      <section className="rise rise-3 mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtrados.length === 0 && (
          <p className="panel col-span-full p-10 text-center text-sm text-steel-400">
            {produtosIniciais.length === 0
              ? "Nenhum produto cadastrado ainda. Rode `npm run seed:produtos` para carregar o catálogo inicial ou cadastre o primeiro item."
              : "Nenhum produto encontrado com esse filtro."}
          </p>
        )}

        {filtrados.map((p) => (
          <article
            key={p.id}
            className={`panel panel-hover flex flex-col overflow-hidden ${
              p.ativo ? "" : "opacity-55"
            }`}
          >
            <div className="flex h-40 items-center justify-center border-b border-steel-100 bg-steel-50">
              {p.fotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.fotoUrl} alt={p.nome} className="h-full w-full object-contain p-2" />
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-steel-300">
                  <IconImage size={28} />
                  <span className="tech-label">Sem foto</span>
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[0.68rem] font-bold text-steel-500">
                  {p.codigo}
                </span>
                <span className="tech-label text-steel-400">{p.categoria}</span>
              </div>

              <h2 className="mt-1.5 text-sm font-bold leading-snug text-steel-900">
                {p.nome}
              </h2>

              {p.caracteristicas.length > 0 && (
                <ul className="mt-2 space-y-0.5 text-xs leading-relaxed text-steel-600">
                  {p.caracteristicas.slice(0, 3).map((c, i) => (
                    <li key={`${c}-${i}`} className="truncate">{c}</li>
                  ))}
                  {p.caracteristicas.length > 3 && (
                    <li className="text-steel-400">
                      +{p.caracteristicas.length - 3} característica(s)
                    </li>
                  )}
                </ul>
              )}

              <div className="mt-auto pt-3.5">
                <p className="font-mono text-sm font-bold text-steel-800">
                  {p.precoTabela > 0 ? formatarMoeda(p.precoTabela) : "Preço sob consulta"}
                </p>
                {!p.ativo && (
                  <p className="tech-label mt-1 text-ember-600">Inativo</p>
                )}

                {podeEditar && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => {
                        setRascunho(paraRascunho(p));
                        setErro("");
                      }}
                      className="flex h-9 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-sm border border-steel-200 text-xs font-medium text-steel-600 transition-colors duration-200 hover:border-steel-600 hover:bg-steel-600 hover:text-white"
                    >
                      <IconPencil size={13} />
                      Editar
                    </button>
                    {confirmandoExclusao === p.id ? (
                      <>
                        <button
                          onClick={() => excluir(p.id)}
                          disabled={salvando}
                          className="flex h-9 cursor-pointer items-center rounded-sm bg-ember-500 px-3 text-xs font-bold text-white hover:bg-ember-600"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => setConfirmandoExclusao(null)}
                          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-sm border border-steel-200 text-steel-500"
                          aria-label="Cancelar"
                        >
                          <IconX size={14} />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setConfirmandoExclusao(p.id)}
                        aria-label={`Excluir ${p.nome}`}
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-sm text-steel-400 transition-colors duration-200 hover:bg-ember-100 hover:text-ember-600"
                      >
                        <IconTrash size={14} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* Formulário */}
      {rascunho && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={rascunho.id ? "Editar produto" : "Novo produto"}
        >
          <div className="panel my-8 w-full max-w-2xl">
            <div className="hazard h-1.5 w-full" aria-hidden />
            <div className="flex items-center justify-between gap-3 border-b border-steel-100 px-6 py-4">
              <h2 className="text-lg font-bold text-steel-900">
                {rascunho.id ? "Editar produto" : "Novo produto"}
              </h2>
              <button
                onClick={() => setRascunho(null)}
                aria-label="Fechar"
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-sm text-steel-400 hover:bg-steel-100"
              >
                <IconX size={17} />
              </button>
            </div>

            <div className="space-y-5 px-6 py-5">
              {erro && (
                <div
                  role="alert"
                  className="border-l-2 border-ember-500 bg-ember-100 px-4 py-3 text-sm font-medium text-ember-700"
                >
                  {erro}
                </div>
              )}

              <div>
                <span className={labelCls}>Foto do produto</span>
                <CampoFoto
                  valor={rascunho.fotoUrl}
                  onChange={(fotoUrl) => setRascunho({ ...rascunho, fotoUrl })}
                />
              </div>

              <div>
                <label className={labelCls} htmlFor="p-nome">
                  Descrição do item * (é o texto que aparece no orçamento)
                </label>
                <input
                  id="p-nome"
                  className={inputCls}
                  value={rascunho.nome}
                  onChange={(e) => setRascunho({ ...rascunho, nome: e.target.value })}
                  placeholder="FORNO ROTATIVO GÁS - 220V - PEQUENO COM 01 CARRO 60x80"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div>
                  <label className={labelCls} htmlFor="p-codigo">Código</label>
                  <input
                    id="p-codigo"
                    className={inputCls}
                    value={rascunho.codigo}
                    onChange={(e) => setRascunho({ ...rascunho, codigo: e.target.value })}
                    placeholder="automático"
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor="p-categoria">Categoria</label>
                  <select
                    id="p-categoria"
                    className={`${inputCls} cursor-pointer`}
                    value={rascunho.categoria}
                    onChange={(e) => setRascunho({ ...rascunho, categoria: e.target.value })}
                  >
                    {CATEGORIAS.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls} htmlFor="p-ncm">NCM</label>
                  <input
                    id="p-ncm"
                    className={inputCls}
                    value={rascunho.ncm}
                    onChange={(e) => setRascunho({ ...rascunho, ncm: e.target.value })}
                    placeholder="8417.20.00"
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor="p-unidade">Unidade</label>
                  <select
                    id="p-unidade"
                    className={`${inputCls} cursor-pointer`}
                    value={rascunho.unidade}
                    onChange={(e) => setRascunho({ ...rascunho, unidade: e.target.value })}
                  >
                    {UNIDADES.map((u) => (
                      <option key={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls} htmlFor="p-preco">Preço de tabela (R$)</label>
                  <input
                    id="p-preco"
                    className={inputCls}
                    value={rascunho.precoTabela}
                    onChange={(e) => setRascunho({ ...rascunho, precoTabela: e.target.value })}
                    placeholder="197.600,00"
                  />
                  <p className="mt-1.5 text-xs text-steel-500">
                    Sugerido na proposta. O representante ainda pode ajustar o valor
                    negociado.
                  </p>
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex cursor-pointer items-center gap-2.5 text-sm text-steel-700">
                    <input
                      type="checkbox"
                      checked={rascunho.ativo}
                      onChange={(e) => setRascunho({ ...rascunho, ativo: e.target.checked })}
                      className="h-4 w-4 cursor-pointer accent-steel-600"
                    />
                    Produto ativo (aparece na hora de montar a proposta)
                  </label>
                </div>
              </div>

              <div>
                <label className={labelCls} htmlFor="p-caracteristicas">
                  Características técnicas — uma por linha
                </label>
                <textarea
                  id="p-caracteristicas"
                  rows={5}
                  className={`${areaCls} font-mono text-xs`}
                  value={rascunho.caracteristicas}
                  onChange={(e) =>
                    setRascunho({ ...rascunho, caracteristicas: e.target.value })
                  }
                  placeholder={"DIMENSÕES AL1890 X L920 X C720\nCONSUMO 0,5 KW/H\nPESO 2000 KG"}
                />
              </div>

              <div>
                <label className={labelCls} htmlFor="p-complemento">
                  Descrição complementar
                </label>
                <textarea
                  id="p-complemento"
                  rows={3}
                  className={areaCls}
                  value={rascunho.descricaoComplementar}
                  onChange={(e) =>
                    setRascunho({ ...rascunho, descricaoComplementar: e.target.value })
                  }
                  placeholder="acompanha 3 carros de forneio para 30 divisões para 60 assadeiras 60x40"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 border-t border-steel-100 px-6 py-4">
              <button
                onClick={() => setRascunho(null)}
                className="flex h-11 cursor-pointer items-center rounded-sm border border-steel-300 bg-white px-4 text-sm font-medium text-steel-600 hover:bg-steel-50"
              >
                Cancelar
              </button>
              <button
                onClick={salvar}
                disabled={salvando}
                className="flex h-11 cursor-pointer items-center rounded-sm bg-ember-500 px-6 text-sm font-bold text-white transition-colors duration-200 hover:bg-ember-600 disabled:cursor-wait disabled:opacity-60"
              >
                {salvando ? "Salvando…" : "Salvar produto"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
