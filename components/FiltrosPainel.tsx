import Link from "next/link";
import { Proposta } from "@/lib/types";
import { IconSearch } from "./Icons";

// Abas do painel: o time pediu para enxergar de imediato o que foi aprovado,
// o que não foi e o que ainda depende de alguém.
export const FILTROS: { id: string; rotulo: string; teste: (p: Proposta) => boolean }[] = [
  { id: "todas", rotulo: "Todas", teste: () => true },
  {
    id: "em-aberto",
    rotulo: "Em aberto",
    teste: (p) =>
      p.aprovacaoCliente?.status !== "aprovada" && p.aprovacaoCliente?.status !== "nao_aprovada",
  },
  {
    id: "aguardando-gestao",
    rotulo: "Aguardando gestão",
    teste: (p) => p.aprovacaoInterna?.status === "pendente",
  },
  {
    id: "aprovadas",
    rotulo: "Aprovadas",
    teste: (p) => p.aprovacaoCliente?.status === "aprovada",
  },
  {
    id: "nao-aprovadas",
    rotulo: "Não aprovadas",
    teste: (p) => p.aprovacaoCliente?.status === "nao_aprovada",
  },
  { id: "rascunhos", rotulo: "Rascunhos", teste: (p) => p.status === "rascunho" },
];

export function aplicarFiltro(propostas: Proposta[], filtroId: string): Proposta[] {
  const filtro = FILTROS.find((f) => f.id === filtroId) ?? FILTROS[0];
  return propostas.filter(filtro.teste);
}

export default function FiltrosPainel({
  propostas,
  filtroAtivo,
  busca,
  vendedor,
}: {
  propostas: Proposta[];
  filtroAtivo: string;
  busca: string;
  vendedor?: string;
}) {
  function href(filtroId: string): string {
    const params = new URLSearchParams();
    if (filtroId !== "todas") params.set("filtro", filtroId);
    if (busca) params.set("q", busca);
    if (vendedor) params.set("vendedor", vendedor);
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  }

  return (
    <section className="rise rise-4 mt-6 flex flex-wrap items-center gap-2">
      {FILTROS.map((f) => {
        const n = propostas.filter(f.teste).length;
        const ativo = filtroAtivo === f.id;
        return (
          <Link
            key={f.id}
            href={href(f.id)}
            className={`flex h-9 cursor-pointer items-center rounded-sm px-3 font-mono text-xs uppercase tracking-wider transition-colors duration-200 ${
              ativo
                ? "bg-steel-800 text-white"
                : "bg-white text-steel-600 shadow-sm hover:bg-steel-100"
            }`}
          >
            {f.rotulo} ({n})
          </Link>
        );
      })}

      <form className="ml-auto" action="/">
        {filtroAtivo !== "todas" && <input type="hidden" name="filtro" value={filtroAtivo} />}
        {vendedor && <input type="hidden" name="vendedor" value={vendedor} />}
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
            defaultValue={busca}
            placeholder="Buscar cliente, empresa, nº…"
            className="h-9 w-60 rounded-sm border border-steel-200 bg-white pl-9 pr-3 text-sm shadow-sm outline-none transition-colors duration-200 focus:border-steel-600"
          />
        </div>
      </form>
    </section>
  );
}
