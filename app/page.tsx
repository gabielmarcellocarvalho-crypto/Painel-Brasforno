import Link from "next/link";
import { listarPropostas } from "@/lib/store";
import { StatusProposta } from "@/lib/types";
import {
  formatarData,
  formatarMoeda,
  STATUS_LABEL,
  STATUS_ORDEM,
  totalProposta,
} from "@/lib/utils";
import StatusDropdown from "@/components/StatusDropdown";
import ExcluirPropostaButton from "@/components/ExcluirPropostaButton";
import {
  IconCircleDollar,
  IconDownload,
  IconFolderOpen,
  IconPlus,
  IconSearch,
  IconTrendingUp,
} from "@/components/Icons";

export const dynamic = "force-dynamic";

const FUNIL_COR: Record<StatusProposta, string> = {
  rascunho: "bg-steel-300",
  enviada: "bg-steel-600",
  negociacao: "bg-ember-500",
  ganha: "bg-emerald-600",
  perdida: "bg-ink/20",
};

export default async function Painel({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;
  const todas = await listarPropostas();

  const filtradas = todas.filter((p) => {
    const okStatus = !status || p.status === status;
    const busca = (q || "").toLowerCase();
    const okBusca =
      !busca ||
      [p.numero, p.cliente.nome, p.cliente.empresa, p.cliente.cidade, p.representante]
        .join(" ")
        .toLowerCase()
        .includes(busca);
    return okStatus && okBusca;
  });

  const valorPipeline = todas
    .filter((p) => ["enviada", "negociacao"].includes(p.status))
    .reduce((s, p) => s + totalProposta(p), 0);
  const valorGanho = todas
    .filter((p) => p.status === "ganha")
    .reduce((s, p) => s + totalProposta(p), 0);
  const emAberto = todas.filter((p) =>
    ["rascunho", "enviada", "negociacao"].includes(p.status)
  ).length;

  const KPIS = [
    {
      rotulo: "Propostas em aberto",
      valor: String(emAberto),
      Icone: IconFolderOpen,
      borda: "border-steel-600",
      cor: "text-steel-800",
      fundoIcone: "bg-steel-600",
    },
    {
      rotulo: "Valor em negociação",
      valor: formatarMoeda(valorPipeline),
      Icone: IconCircleDollar,
      borda: "border-ember-500",
      cor: "text-ember-600",
      fundoIcone: "bg-ember-500",
    },
    {
      rotulo: "Vendas ganhas",
      valor: formatarMoeda(valorGanho),
      Icone: IconTrendingUp,
      borda: "border-emerald-600",
      cor: "text-emerald-700",
      fundoIcone: "bg-emerald-600",
    },
  ];

  return (
    <div className="max-w-6xl px-4 py-8 md:px-6 lg:px-10">
      <header className="rise flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="tech-label text-steel-500">Centralização comercial</p>
          <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-steel-900 md:text-4xl">
            Painel de Propostas
          </h1>
        </div>
        <div className="flex gap-2.5">
          <a
            href="/api/propostas/export"
            className="flex h-11 cursor-pointer items-center gap-2 rounded-sm border border-steel-600/40 bg-white px-4 text-sm font-medium text-steel-700 transition-colors duration-200 hover:border-steel-600 hover:bg-steel-600 hover:text-white"
          >
            <IconDownload size={16} />
            Exportar CSV
          </a>
          <Link
            href="/nova"
            className="ember-pulse flex h-11 items-center gap-2 rounded-sm bg-ember-500 px-5 text-sm font-bold text-white transition-colors duration-200 hover:bg-ember-600"
          >
            <IconPlus size={16} />
            Nova Proposta
          </Link>
        </div>
      </header>

      {/* Indicadores */}
      <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {KPIS.map(({ rotulo, valor, Icone, borda, cor, fundoIcone }, i) => (
          <div
            key={rotulo}
            className={`rise rise-${i + 1} panel panel-hover border-t-2 ${borda} p-5`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="tech-label text-steel-500">{rotulo}</p>
                <p className={`mt-2 truncate font-mono text-[1.7rem] font-bold leading-none ${cor}`}>
                  {valor}
                </p>
              </div>
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-sm ${fundoIcone} text-white`}
              >
                <Icone size={19} />
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* Funil visual */}
      {todas.length > 0 && (
        <section className="rise rise-3 panel mt-4 p-5" aria-label="Funil de propostas">
          <div className="flex items-baseline justify-between">
            <p className="tech-label text-steel-500">Funil do time</p>
            <p className="font-mono text-xs text-steel-400">
              {todas.length} proposta(s) no total
            </p>
          </div>
          <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-steel-50">
            {STATUS_ORDEM.map((s) => {
              const n = todas.filter((p) => p.status === s).length;
              if (n === 0) return null;
              return (
                <div
                  key={s}
                  className={`${FUNIL_COR[s]} transition-all duration-300`}
                  style={{ width: `${(n / todas.length) * 100}%` }}
                  title={`${STATUS_LABEL[s]}: ${n}`}
                />
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
            {STATUS_ORDEM.map((s) => {
              const n = todas.filter((p) => p.status === s).length;
              return (
                <span key={s} className="flex items-center gap-1.5 font-mono text-[0.68rem] uppercase tracking-wider text-steel-600">
                  <span className={`h-2 w-2 rounded-full ${FUNIL_COR[s]}`} aria-hidden />
                  {STATUS_LABEL[s]} · {n}
                </span>
              );
            })}
          </div>
        </section>
      )}

      {/* Filtros */}
      <section className="rise rise-4 mt-6 flex flex-wrap items-center gap-2">
        <Link
          href="/"
          className={`flex h-9 cursor-pointer items-center rounded-sm px-3 font-mono text-xs uppercase tracking-wider transition-colors duration-200 ${
            !status
              ? "bg-steel-800 text-white"
              : "bg-white text-steel-600 shadow-sm hover:bg-steel-100"
          }`}
        >
          Todas ({todas.length})
        </Link>
        {STATUS_ORDEM.map((s) => {
          const n = todas.filter((p) => p.status === s).length;
          return (
            <Link
              key={s}
              href={`/?status=${s}`}
              className={`flex h-9 cursor-pointer items-center rounded-sm px-3 font-mono text-xs uppercase tracking-wider transition-colors duration-200 ${
                status === s
                  ? "bg-steel-800 text-white"
                  : "bg-white text-steel-600 shadow-sm hover:bg-steel-100"
              }`}
            >
              {STATUS_LABEL[s]} ({n})
            </Link>
          );
        })}
        <form className="ml-auto" action="/">
          {status && <input type="hidden" name="status" value={status} />}
          <div className="relative">
            <IconSearch
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-steel-400"
            />
            <label className="sr-only" htmlFor="busca">
              Buscar propostas
            </label>
            <input
              id="busca"
              type="search"
              name="q"
              defaultValue={q || ""}
              placeholder="Buscar cliente, empresa, nº…"
              className="h-9 w-60 rounded-sm border border-steel-200 bg-white pl-9 pr-3 text-sm shadow-sm outline-none transition-colors duration-200 focus:border-steel-600"
            />
          </div>
        </form>
      </section>

      {/* Tabela */}
      <section className="rise rise-5 panel mt-4 overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="bg-steel-900 text-left text-white">
              <th className="tech-label px-4 py-3.5 font-normal text-steel-300">Nº</th>
              <th className="tech-label px-4 py-3.5 font-normal text-steel-300">Cliente</th>
              <th className="tech-label px-4 py-3.5 font-normal text-steel-300">Equipamentos</th>
              <th className="tech-label px-4 py-3.5 text-right font-normal text-steel-300">Valor</th>
              <th className="tech-label px-4 py-3.5 font-normal text-steel-300">Representante</th>
              <th className="tech-label px-4 py-3.5 font-normal text-steel-300">Data</th>
              <th className="tech-label px-4 py-3.5 font-normal text-steel-300">Status</th>
              <th className="tech-label px-4 py-3.5 font-normal text-steel-300">
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtradas.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-steel-400">
                  Nenhuma proposta encontrada.{" "}
                  <Link href="/nova" className="font-medium text-ember-600 underline underline-offset-2 hover:text-ember-500">
                    Criar a primeira
                  </Link>
                </td>
              </tr>
            )}
            {filtradas.map((p) => (
              <tr
                key={p.id}
                className="group border-b border-steel-100 transition-colors duration-150 last:border-b-0 hover:bg-steel-50"
              >
                <td className="px-4 py-3.5 font-mono font-bold text-steel-700">
                  <Link
                    href={`/proposta/${p.id}`}
                    className="cursor-pointer transition-colors duration-150 hover:text-ember-600"
                  >
                    {p.numero}
                  </Link>
                </td>
                <td className="px-4 py-3.5">
                  <Link href={`/proposta/${p.id}`} className="block cursor-pointer">
                    <span className="font-medium text-steel-900 transition-colors duration-150 group-hover:text-steel-700">
                      {p.cliente.empresa}
                    </span>
                    <span className="mt-0.5 block text-xs text-steel-500">
                      {p.cliente.nome} · {p.cliente.cidade}/{p.cliente.uf}
                    </span>
                  </Link>
                </td>
                <td className="max-w-[220px] px-4 py-3.5 text-xs leading-relaxed text-steel-600">
                  {p.itens.map((i) => `${i.quantidade}× ${i.produtoNome}`).join(", ")}
                </td>
                <td className="px-4 py-3.5 text-right font-mono font-semibold text-steel-800">
                  {formatarMoeda(totalProposta(p))}
                </td>
                <td className="px-4 py-3.5">
                  <span className="flex items-center gap-2 text-steel-600">
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-steel-100 font-mono text-[0.6rem] font-bold uppercase text-steel-600"
                      aria-hidden
                    >
                      {p.representante
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </span>
                    {p.representante}
                  </span>
                </td>
                <td className="px-4 py-3.5 font-mono text-xs text-steel-500">
                  {formatarData(p.criadaEm)}
                </td>
                <td className="px-4 py-3.5">
                  <StatusDropdown propostaId={p.id} status={p.status} numero={p.numero} size="sm" />
                </td>
                <td className="px-4 py-3.5">
                  <ExcluirPropostaButton propostaId={p.id} numero={p.numero} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <p className="rise rise-5 mt-5 font-mono text-xs text-steel-500">
        {filtradas.length} proposta(s) exibida(s) · dados centralizados
        localmente · exporte o CSV para a reunião comercial
      </p>
    </div>
  );
}
