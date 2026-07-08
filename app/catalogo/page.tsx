import Link from "next/link";
import { CATALOGO, CATEGORIAS } from "@/lib/catalog";
import { IconArrowRight, IconCheck } from "@/components/Icons";

export default function Catalogo() {
  return (
    <div className="max-w-5xl px-4 py-8 md:px-6 lg:px-10">
      <header className="rise">
        <p className="tech-label text-steel-500">Templates padrão por equipamento</p>
        <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-steel-900 md:text-4xl">
          Catálogo &amp; Templates
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-steel-600">
          Cada equipamento já possui texto comercial, especificações e
          diferenciais padronizados — ao gerar uma proposta, esse conteúdo entra
          automaticamente no documento. Fonte: brasforno.com.br.
        </p>
      </header>

      {CATEGORIAS.map((cat) => {
        const produtos = CATALOGO.filter((p) => p.categoria === cat);
        if (produtos.length === 0) return null;
        return (
          <section key={cat} className="rise rise-2 mt-9">
            <div className="flex items-center gap-3">
              <h2 className="tech-label shrink-0 text-steel-700">{cat}</h2>
              <span className="h-px flex-1 bg-steel-300/60" aria-hidden />
              <span className="font-mono text-[0.65rem] uppercase tracking-wider text-steel-400">
                {produtos.length} equipamento(s)
              </span>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              {produtos.map((p) => (
                <div key={p.id} className="panel panel-hover flex flex-col overflow-hidden">
                  <div className="hazard h-1 w-full opacity-80" aria-hidden />
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-bold text-steel-900">{p.nome}</h3>
                      <span className="shrink-0 rounded-sm bg-steel-100 px-2 py-1 font-mono text-[0.62rem] uppercase tracking-wider text-steel-600">
                        {p.modelos.length} modelo(s)
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-steel-600">{p.resumo}</p>
                    <div className="mt-3.5 flex flex-wrap gap-1.5">
                      {p.modelos.map((m) => (
                        <span
                          key={m.nome}
                          className="rounded-sm border border-steel-200 bg-steel-50 px-2 py-1 font-mono text-[0.66rem] text-steel-700"
                        >
                          {m.nome}
                        </span>
                      ))}
                    </div>
                    <details className="group mt-4 text-sm">
                      <summary className="tech-label cursor-pointer list-none text-ember-600 transition-colors duration-150 hover:text-ember-500">
                        <span className="group-open:hidden">+ Ver template da proposta</span>
                        <span className="hidden group-open:inline">− Ocultar template</span>
                      </summary>
                      <div className="mt-3 border-t border-steel-100 pt-3 text-steel-600">
                        <p className="italic leading-relaxed">“{p.descricaoProposta}”</p>
                        <ul className="mt-3 space-y-1.5">
                          {p.beneficios.map((b) => (
                            <li key={b} className="flex items-start gap-2">
                              <IconCheck size={13} className="mt-0.5 shrink-0 text-ember-500" />
                              {b}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </details>
                    <Link
                      href="/nova"
                      className="mt-auto inline-flex cursor-pointer items-center gap-1.5 pt-4 text-sm font-semibold text-steel-700 transition-colors duration-150 hover:text-ember-600"
                    >
                      Gerar proposta com este equipamento
                      <IconArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
