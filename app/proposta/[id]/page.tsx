import Image from "next/image";
import { notFound } from "next/navigation";
import { buscarProposta } from "@/lib/store";
import { EMPRESA, getProduto } from "@/lib/catalog";
import {
  formatarData,
  formatarMoeda,
  subtotalProposta,
  totalProposta,
  validadeProposta,
} from "@/lib/utils";
import BarraAcoes from "@/components/BarraAcoes";
import { IconCheck, IconMapPin } from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function PaginaProposta({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const proposta = await buscarProposta(id);
  if (!proposta) notFound();

  const subtotal = subtotalProposta(proposta);
  const total = totalProposta(proposta);
  const produtosUnicos = [...new Set(proposta.itens.map((i) => i.produtoId))]
    .map((pid) => getProduto(pid))
    .filter(Boolean);

  return (
    <div>
      <BarraAcoes proposta={proposta} />

      <div className="px-3 py-8 md:px-8">
        <article className="print-area mx-auto max-w-4xl bg-white shadow-xl shadow-steel-900/10">
          {/* Cabeçalho do documento */}
          <header className="relative overflow-hidden bg-steel-900">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
              aria-hidden
            />
            <div className="relative flex flex-wrap items-center justify-between gap-5 px-7 py-8 md:px-10">
              <Image
                src="/brasforno-logo.png"
                alt="Brasforno"
                width={200}
                height={31}
              />
              <div className="text-right">
                <p className="tech-label text-ember-400">Proposta Comercial</p>
                <p className="mt-1.5 font-mono text-3xl font-bold tracking-tight text-white">
                  {proposta.numero}
                </p>
                <p className="mt-2 font-mono text-xs text-steel-300">
                  Emitida em {formatarData(proposta.criadaEm)} · válida até{" "}
                  {validadeProposta(proposta)}
                </p>
              </div>
            </div>
            <div className="hazard h-2 w-full" aria-hidden />
          </header>

          <div className="px-7 py-8 md:px-10">
            {/* Cliente + Representante */}
            <section className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="border-l-2 border-steel-600 bg-steel-50 p-5">
                <p className="tech-label text-steel-500">Preparada para</p>
                <p className="mt-2 text-xl font-bold leading-snug text-steel-900">
                  {proposta.cliente.empresa}
                </p>
                <p className="mt-1 text-sm text-steel-600">
                  A/C {proposta.cliente.nome}
                </p>
                <p className="mt-2.5 flex items-center gap-1.5 font-mono text-xs text-steel-500">
                  <IconMapPin size={12} className="shrink-0" />
                  {proposta.cliente.cidade}/{proposta.cliente.uf} ·{" "}
                  {proposta.cliente.segmento} · {proposta.cliente.whatsapp}
                </p>
              </div>
              <div className="border-l-2 border-ember-500 bg-ember-100/40 p-5">
                <p className="tech-label text-steel-500">Seu consultor Brasforno</p>
                <p className="mt-2 text-xl font-bold leading-snug text-steel-900">
                  {proposta.representante}
                </p>
                <p className="mt-1 text-sm text-steel-600">{EMPRESA.razao}</p>
                <p className="mt-2.5 font-mono text-xs text-steel-500">
                  {EMPRESA.endereco} · {EMPRESA.site}
                </p>
              </div>
            </section>

            {/* Itens */}
            <section className="mt-9">
              <div className="flex items-center gap-3">
                <h2 className="tech-label shrink-0 text-steel-700">
                  Equipamentos propostos
                </h2>
                <span className="h-px flex-1 bg-steel-200" aria-hidden />
              </div>
              <table className="mt-4 w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="tech-label pb-2.5 font-normal text-steel-500">Item</th>
                    <th className="tech-label pb-2.5 font-normal text-steel-500">Modelo</th>
                    <th className="tech-label pb-2.5 text-center font-normal text-steel-500">Qtde</th>
                    <th className="tech-label pb-2.5 text-right font-normal text-steel-500">Valor unit.</th>
                    <th className="tech-label pb-2.5 text-right font-normal text-steel-500">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {proposta.itens.map((item, idx) => (
                    <tr key={idx} className="border-t border-steel-100">
                      <td className="py-3.5 font-semibold text-steel-900">
                        {item.produtoNome}
                      </td>
                      <td className="py-3.5 text-steel-600">{item.modelo}</td>
                      <td className="py-3.5 text-center font-mono">{item.quantidade}</td>
                      <td className="py-3.5 text-right font-mono">
                        {formatarMoeda(item.precoUnitario)}
                      </td>
                      <td className="py-3.5 text-right font-mono font-semibold">
                        {formatarMoeda(item.precoUnitario * item.quantidade)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-steel-900">
                    <td colSpan={4} className="py-2.5 text-right text-steel-600">
                      Subtotal
                    </td>
                    <td className="py-2.5 text-right font-mono">
                      {formatarMoeda(subtotal)}
                    </td>
                  </tr>
                  {proposta.condicoes.descontoPercent > 0 && (
                    <tr>
                      <td colSpan={4} className="py-1 text-right text-steel-600">
                        Desconto ({proposta.condicoes.descontoPercent}%)
                      </td>
                      <td className="py-1 text-right font-mono text-ember-600">
                        − {formatarMoeda(subtotal - total)}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan={3} />
                    <td className="py-3.5 pr-3 text-right text-base font-bold text-steel-900">
                      Investimento total
                    </td>
                    <td className="bg-steel-900 py-3.5 pl-3 pr-3 text-right font-mono text-lg font-bold text-white">
                      {formatarMoeda(total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </section>

            {/* Detalhes técnicos por equipamento */}
            {produtosUnicos.map(
              (produto) =>
                produto && (
                  <section key={produto.id} className="mt-9">
                    <div className="flex items-center gap-3">
                      <h2 className="tech-label shrink-0 text-steel-700">
                        {produto.nome} — detalhes técnicos
                      </h2>
                      <span className="h-px flex-1 bg-steel-200" aria-hidden />
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-steel-700">
                      {produto.descricaoProposta}
                    </p>
                    <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="bg-steel-50 p-4">
                        <p className="tech-label text-steel-600">Especificações</p>
                        <dl className="mt-2.5 space-y-1.5 text-sm">
                          {Object.entries(produto.specs).map(([k, v]) => (
                            <div key={k} className="flex gap-2">
                              <dt className="shrink-0 font-semibold text-steel-800">
                                {k}:
                              </dt>
                              <dd className="text-steel-600">{v}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                      <div>
                        <p className="tech-label text-ember-600">Diferenciais</p>
                        <ul className="mt-2.5 space-y-1.5 text-sm text-steel-700">
                          {produto.beneficios.map((b) => (
                            <li key={b} className="flex items-start gap-2">
                              <IconCheck
                                size={14}
                                className="mt-0.5 shrink-0 text-ember-500"
                              />
                              {b}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </section>
                )
            )}

            {/* Condições */}
            <section className="mt-9">
              <div className="flex items-center gap-3">
                <h2 className="tech-label shrink-0 text-steel-700">
                  Condições comerciais
                </h2>
                <span className="h-px flex-1 bg-steel-200" aria-hidden />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                {[
                  ["Validade", `${proposta.condicoes.validadeDias} dias`],
                  ["Entrega", proposta.condicoes.prazoEntrega],
                  ["Frete", proposta.condicoes.frete],
                  ["Pagamento", proposta.condicoes.formaPagamento],
                ].map(([k, v]) => (
                  <div key={k} className="border-t-2 border-steel-600 bg-steel-50 p-3.5">
                    <p className="tech-label text-steel-500">{k}</p>
                    <p className="mt-1.5 font-medium leading-snug text-steel-900">{v}</p>
                  </div>
                ))}
              </div>
              {proposta.condicoes.observacoes && (
                <p className="mt-4 border-l-2 border-steel-300 bg-steel-50 p-4 text-sm leading-relaxed text-steel-700">
                  <span className="font-semibold">Observações:</span>{" "}
                  {proposta.condicoes.observacoes}
                </p>
              )}
            </section>

            {/* Por que Brasforno */}
            <section className="mt-9 grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                ["+30", "anos de mercado"],
                ["1 ano", "de garantia de fábrica"],
                ["100%", "do território nacional"],
                ["+150", "modelos disponíveis"],
              ].map(([num, txt]) => (
                <div
                  key={txt}
                  className="border border-steel-200 p-4 text-center"
                >
                  <p className="font-mono text-2xl font-bold text-steel-700">{num}</p>
                  <p className="mt-1 text-xs leading-snug text-steel-500">{txt}</p>
                </div>
              ))}
            </section>

            {/* Aceite */}
            <section className="mt-10 grid grid-cols-1 gap-8 border-t border-steel-200 pt-8 sm:grid-cols-2">
              <div>
                <div className="h-10 border-b border-steel-400" aria-hidden />
                <p className="mt-2 text-xs text-steel-500">
                  {proposta.cliente.nome} — {proposta.cliente.empresa}
                </p>
                <p className="tech-label mt-0.5 text-steel-400">Aceite do cliente</p>
              </div>
              <div>
                <div className="h-10 border-b border-steel-400" aria-hidden />
                <p className="mt-2 text-xs text-steel-500">
                  {proposta.representante} — {EMPRESA.nome}
                </p>
                <p className="tech-label mt-0.5 text-steel-400">Representante comercial</p>
              </div>
            </section>
          </div>

          {/* Rodapé */}
          <footer className="relative bg-steel-900 px-8 py-6 text-center">
            <div className="hazard absolute inset-x-0 top-0 h-1.5" aria-hidden />
            <p className="text-sm font-semibold text-white">
              {EMPRESA.razao} — desde {EMPRESA.fundacao}
            </p>
            <p className="mt-1.5 font-mono text-xs text-steel-300">
              {EMPRESA.endereco} · {EMPRESA.area} · {EMPRESA.site}
            </p>
          </footer>
        </article>
      </div>
    </div>
  );
}
