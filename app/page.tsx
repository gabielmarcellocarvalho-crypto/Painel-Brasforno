import Link from "next/link";
import { requerSessao } from "@/lib/auth";
import { listarPropostasVisiveis } from "@/lib/store";
import { podeCriarPropostas, podeExcluirPropostas, vePropostasDeTodos } from "@/lib/permissoes";
import { PAPEL_LABEL, Proposta } from "@/lib/types";
import {
  formatarData,
  formatarMoeda,
  iniciais,
  totalProposta,
} from "@/lib/utils";
import StatusDropdown from "@/components/StatusDropdown";
import ExcluirPropostaButton from "@/components/ExcluirPropostaButton";
import FiltrosPainel, { aplicarFiltro } from "@/components/FiltrosPainel";
import {
  IconClock,
  IconDownload,
  IconFolderOpen,
  IconPlus,
  IconThumbsUp,
  IconTrendingUp,
} from "@/components/Icons";

export const dynamic = "force-dynamic";

function taxa(parte: number, total: number): string {
  return total === 0 ? "—" : `${Math.round((parte / total) * 100)}%`;
}

export default async function Painel({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string; q?: string; vendedor?: string }>;
}) {
  const sessao = await requerSessao();
  const { filtro = "todas", q, vendedor } = await searchParams;

  // O escopo é resolvido na consulta: representante nunca recebe do servidor
  // uma proposta que não é dele.
  const visiveis = await listarPropostasVisiveis(sessao);
  const veTudo = vePropostasDeTodos(sessao.papel);

  const doVendedor = vendedor
    ? visiveis.filter((p) => p.vendedorId === vendedor)
    : visiveis;

  const busca = (q || "").toLowerCase().trim();
  const filtradas = aplicarFiltro(doVendedor, filtro).filter((p) => {
    if (!busca) return true;
    return [p.numero, p.cliente.nome, p.cliente.empresa, p.cliente.cidade, p.vendedorNome]
      .join(" ")
      .toLowerCase()
      .includes(busca);
  });

  /* ── Indicadores ─────────────────────────────────────────────────────── */
  const aprovadas = doVendedor.filter((p) => p.aprovacaoCliente?.status === "aprovada");
  const naoAprovadas = doVendedor.filter((p) => p.aprovacaoCliente?.status === "nao_aprovada");
  const decididas = aprovadas.length + naoAprovadas.length;
  const emAberto = doVendedor.filter((p) => p.aprovacaoCliente?.status !== "aprovada" && p.aprovacaoCliente?.status !== "nao_aprovada");
  const aguardandoGestao = doVendedor.filter((p) => p.aprovacaoInterna?.status === "pendente");

  const valorEmAberto = emAberto.reduce((s, p) => s + totalProposta(p), 0);
  const valorGanho = aprovadas.reduce((s, p) => s + totalProposta(p), 0);

  const KPIS = [
    {
      rotulo: "Em aberto",
      valor: String(emAberto.length),
      detalhe: formatarMoeda(valorEmAberto),
      Icone: IconFolderOpen,
      borda: "border-steel-600",
      cor: "text-steel-800",
      fundoIcone: "bg-steel-600",
    },
    {
      rotulo: "Aprovadas pelo cliente",
      valor: String(aprovadas.length),
      detalhe: formatarMoeda(valorGanho),
      Icone: IconThumbsUp,
      borda: "border-emerald-600",
      cor: "text-emerald-700",
      fundoIcone: "bg-emerald-600",
    },
    {
      rotulo: "Taxa de aprovação",
      valor: taxa(aprovadas.length, decididas),
      detalhe: `${decididas} proposta(s) decidida(s)`,
      Icone: IconTrendingUp,
      borda: "border-ember-500",
      cor: "text-ember-600",
      fundoIcone: "bg-ember-500",
    },
    {
      rotulo: veTudo ? "Aguardando gestão" : "Aguardando liberação",
      valor: String(aguardandoGestao.length),
      detalhe: aguardandoGestao.length ? "Desconto acima da alçada" : "Nada travado",
      Icone: IconClock,
      borda: "border-amber-500",
      cor: "text-amber-600",
      fundoIcone: "bg-amber-500",
    },
  ];

  /* ── Ranking por representante (só para quem vê o time) ──────────────── */
  const porVendedor = veTudo
    ? Object.values(
        visiveis.reduce<Record<string, { id: string; nome: string; total: number; aprovadas: number; valor: number }>>(
          (acc, p) => {
            const atual = acc[p.vendedorId] ?? {
              id: p.vendedorId,
              nome: p.vendedorNome,
              total: 0,
              aprovadas: 0,
              valor: 0,
            };
            atual.total += 1;
            if (p.aprovacaoCliente?.status === "aprovada") {
              atual.aprovadas += 1;
              atual.valor += totalProposta(p);
            }
            acc[p.vendedorId] = atual;
            return acc;
          },
          {}
        )
      ).sort((a, b) => b.valor - a.valor || b.total - a.total)
    : [];

  return (
    <div className="max-w-6xl px-4 py-8 md:px-6 lg:px-10">
      <header className="rise flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="tech-label text-steel-500">
            {veTudo ? "Visão do time comercial" : `Suas propostas · ${PAPEL_LABEL[sessao.papel]}`}
          </p>
          <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-steel-900 md:text-4xl">
            {veTudo ? "Painel de Propostas" : `Olá, ${sessao.nome.split(" ")[0]}`}
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
          {podeCriarPropostas(sessao.papel) && (
            <Link
              href="/nova"
              className="ember-pulse flex h-11 items-center gap-2 rounded-sm bg-ember-500 px-5 text-sm font-bold text-white transition-colors duration-200 hover:bg-ember-600"
            >
              <IconPlus size={16} />
              Nova Proposta
            </Link>
          )}
        </div>
      </header>

      {/* Indicadores */}
      <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KPIS.map(({ rotulo, valor, detalhe, Icone, borda, cor, fundoIcone }, i) => (
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
                <p className="mt-1.5 truncate text-xs text-steel-500">{detalhe}</p>
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

      {/* Desempenho por representante */}
      {veTudo && porVendedor.length > 0 && (
        <section className="rise rise-3 panel mt-4 p-5" aria-label="Desempenho por representante">
          <div className="flex items-baseline justify-between gap-3">
            <p className="tech-label text-steel-500">Desempenho por representante</p>
            {vendedor && (
              <Link href="/" className="font-mono text-xs text-ember-600 hover:underline">
                limpar filtro
              </Link>
            )}
          </div>
          <div className="mt-3.5 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {porVendedor.map((v) => (
              <Link
                key={v.id}
                href={vendedor === v.id ? "/" : `/?vendedor=${v.id}`}
                className={`flex items-center gap-3 rounded-sm border p-3 transition-colors duration-200 ${
                  vendedor === v.id
                    ? "border-steel-600 bg-steel-50"
                    : "border-steel-200 hover:border-steel-400 hover:bg-steel-50"
                }`}
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-steel-100 font-mono text-[0.65rem] font-bold text-steel-600"
                  aria-hidden
                >
                  {iniciais(v.nome)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-steel-900">{v.nome}</p>
                  <p className="font-mono text-[0.68rem] text-steel-500">
                    {v.aprovadas}/{v.total} aprovadas · {formatarMoeda(v.valor)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Filtros */}
      <FiltrosPainel
        propostas={doVendedor}
        filtroAtivo={filtro}
        busca={q || ""}
        vendedor={vendedor}
      />

      {/* Tabela */}
      <section className="rise rise-5 panel mt-4 overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="bg-steel-900 text-left text-white">
              <th className="tech-label px-4 py-3.5 font-normal text-steel-300">Nº</th>
              <th className="tech-label px-4 py-3.5 font-normal text-steel-300">Cliente</th>
              <th className="tech-label px-4 py-3.5 font-normal text-steel-300">Equipamentos</th>
              <th className="tech-label px-4 py-3.5 text-right font-normal text-steel-300">Valor</th>
              {veTudo && (
                <th className="tech-label px-4 py-3.5 font-normal text-steel-300">Representante</th>
              )}
              <th className="tech-label px-4 py-3.5 font-normal text-steel-300">Data</th>
              <th className="tech-label px-4 py-3.5 font-normal text-steel-300">Situação</th>
              {podeExcluirPropostas(sessao.papel) && (
                <th className="tech-label px-4 py-3.5 font-normal text-steel-300">
                  <span className="sr-only">Ações</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {filtradas.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-steel-400">
                  Nenhuma proposta encontrada.{" "}
                  {podeCriarPropostas(sessao.papel) && (
                    <Link
                      href="/nova"
                      className="font-medium text-ember-600 underline underline-offset-2 hover:text-ember-500"
                    >
                      Criar a primeira
                    </Link>
                  )}
                </td>
              </tr>
            )}
            {filtradas.map((p) => (
              <LinhaProposta
                key={p.id}
                proposta={p}
                mostrarVendedor={veTudo}
                podeExcluir={podeExcluirPropostas(sessao.papel)}
              />
            ))}
          </tbody>
        </table>
      </section>

      <p className="rise rise-5 mt-5 font-mono text-xs text-steel-500">
        {filtradas.length} proposta(s) exibida(s)
        {veTudo
          ? " · você acompanha as propostas de todo o time"
          : " · você vê apenas as suas propostas"}
      </p>
    </div>
  );
}

function LinhaProposta({
  proposta: p,
  mostrarVendedor,
  podeExcluir,
}: {
  proposta: Proposta;
  mostrarVendedor: boolean;
  podeExcluir: boolean;
}) {
  const cliente = p.aprovacaoCliente?.status ?? "pendente";
  const interna = p.aprovacaoInterna?.status ?? "nao_requer";

  return (
    <tr className="group border-b border-steel-100 transition-colors duration-150 last:border-b-0 hover:bg-steel-50">
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
        {p.itens.map((i) => `${i.quantidade}× ${i.descricao}`).join(", ")}
      </td>
      <td className="px-4 py-3.5 text-right font-mono font-semibold text-steel-800">
        {formatarMoeda(totalProposta(p))}
      </td>
      {mostrarVendedor && (
        <td className="px-4 py-3.5">
          <span className="flex items-center gap-2 text-steel-600">
            <span
              className="flex h-6 w-6 items-center justify-center rounded-full bg-steel-100 font-mono text-[0.6rem] font-bold text-steel-600"
              aria-hidden
            >
              {iniciais(p.vendedorNome)}
            </span>
            {p.vendedorNome}
          </span>
        </td>
      )}
      <td className="px-4 py-3.5 font-mono text-xs text-steel-500">
        {formatarData(p.criadaEm)}
      </td>
      <td className="px-4 py-3.5">
        <div className="flex flex-col items-start gap-1.5">
          {cliente === "aprovada" && (
            <span className="rounded-sm bg-emerald-100 px-2 py-0.5 text-[0.68rem] font-bold uppercase tracking-wide text-emerald-800">
              Aprovada
            </span>
          )}
          {cliente === "nao_aprovada" && (
            <span
              className="rounded-sm bg-ember-100 px-2 py-0.5 text-[0.68rem] font-bold uppercase tracking-wide text-ember-700"
              title={p.aprovacaoCliente?.motivo}
            >
              Não aprovada
            </span>
          )}
          {cliente === "pendente" && (
            <StatusDropdown propostaId={p.id} status={p.status} numero={p.numero} size="sm" />
          )}
          {interna === "pendente" && (
            <span className="rounded-sm bg-amber-100 px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-wide text-amber-800">
              Aguardando gestão
            </span>
          )}
          {interna === "reprovada" && (
            <span className="rounded-sm bg-ember-100 px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-wide text-ember-700">
              Reprovada pela gestão
            </span>
          )}
        </div>
      </td>
      {podeExcluir && (
        <td className="px-4 py-3.5">
          <ExcluirPropostaButton propostaId={p.id} numero={p.numero} />
        </td>
      )}
    </tr>
  );
}
