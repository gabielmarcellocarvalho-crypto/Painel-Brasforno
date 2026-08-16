import Image from "next/image";
import { notFound } from "next/navigation";
import { requerSessao } from "@/lib/auth";
import { buscarPropostaVisivel } from "@/lib/store";
import { EMPRESA, TITULO_DOCUMENTO } from "@/lib/empresa";
import {
  descontoProposta,
  formatarDataHora,
  formatarDataSimples,
  formatarNumero,
  subtotalProposta,
  totalProposta,
  validadeProposta,
} from "@/lib/utils";
import BarraAcoes from "@/components/BarraAcoes";

export const dynamic = "force-dynamic";

/**
 * Documento de saída — réplica do "Orçamento de Venda" que a Brasforno já
 * emite pelo ERP (ver `modelo de proposta.pdf`). O layout é fixo e igual para
 * todos os representantes: a padronização é o motivo de existir da plataforma.
 */
export default async function PaginaProposta({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const sessao = await requerSessao();
  const { id } = await params;

  // buscarPropostaVisivel já aplica o escopo: representante que tentar abrir a
  // proposta de outro cai no 404, não numa tela de "sem permissão".
  const proposta = await buscarPropostaVisivel(id, sessao);
  if (!proposta) notFound();

  const subtotal = subtotalProposta(proposta);
  const desconto = descontoProposta(proposta);
  const total = totalProposta(proposta);
  const { condicoes, cliente } = proposta;

  const enderecoCliente = [
    cliente.endereco,
    cliente.complemento,
    cliente.bairro,
  ].filter(Boolean);

  const linhaCidade = [
    [cliente.cidade, cliente.uf].filter(Boolean).join(" - "),
    cliente.cep ? `CEP: ${cliente.cep}` : "",
  ]
    .filter(Boolean)
    .join(" - ");

  const totais: [string, number][] = [
    ["Subtotal:", subtotal],
    ...(desconto > 0 ? ([[`Desconto (${condicoes.descontoPercent}%):`, -desconto]] as [string, number][]) : []),
    ["IPI:", condicoes.ipi || 0],
    ["ICMS ST:", condicoes.icmsSt || 0],
    ["Total:", total],
  ];

  return (
    <div>
      <BarraAcoes proposta={proposta} papel={sessao.papel} />

      <div className="px-3 py-8 md:px-8">
        <article className="print-area doc mx-auto max-w-[860px] bg-white px-8 py-9 shadow-xl shadow-steel-900/10 md:px-12 md:py-12">
          {/* ── Cabeçalho ─────────────────────────────────────────────── */}
          <header className="flex flex-wrap items-start justify-between gap-6">
            <Image
              src="/brasforno-logo.png"
              alt="Brasforno"
              width={150}
              height={23}
              priority
              className="mt-1"
            />
            <div className="ml-auto text-right text-[0.7rem] leading-relaxed text-neutral-600">
              <p className="text-base font-bold tracking-tight text-neutral-900">
                {EMPRESA.razaoSocial}
              </p>
              <p className="mt-1.5">CNPJ: {EMPRESA.cnpj}</p>
              <p>Inscrição Estadual: {EMPRESA.inscricaoEstadual}</p>
              <p className="mt-2.5">{EMPRESA.endereco}</p>
              <p>{EMPRESA.bairro}</p>
              <p>
                {EMPRESA.cidade} - {EMPRESA.uf} - CEP: {EMPRESA.cep}
              </p>
              <p>Telefone: {EMPRESA.telefone}</p>
            </div>
          </header>

          <h1 className="mt-5 text-[1.65rem] font-bold tracking-tight text-neutral-900">
            {TITULO_DOCUMENTO} Nº {proposta.numero}
          </h1>

          {/* ── Cliente ───────────────────────────────────────────────── */}
          <h2 className="doc-h2">Informações do Cliente</h2>
          <p className="mt-3 text-[0.95rem] text-neutral-800">
            {cliente.empresa}
            {cliente.nome && cliente.nome !== cliente.empresa && (
              <span className="text-neutral-600"> · A/C {cliente.nome}</span>
            )}
          </p>

          <div className="mt-3 grid grid-cols-1 gap-x-8 gap-y-1 text-[0.72rem] leading-relaxed text-neutral-700 sm:grid-cols-2">
            <div className="space-y-1">
              {cliente.cnpjCpf && <p>CNPJ: {cliente.cnpjCpf}</p>}
              {cliente.inscricaoEstadual && (
                <p>Inscrição Estadual: {cliente.inscricaoEstadual}</p>
              )}
              <p className="font-bold">Telefone: {cliente.whatsapp}</p>
            </div>
            <div className="space-y-1">
              {enderecoCliente.map((linha) => (
                <p key={linha}>{linha}</p>
              ))}
              {linhaCidade && <p>{linhaCidade}</p>}
              {cliente.email && <p className="font-bold">Email: {cliente.email}</p>}
            </div>
          </div>

          {/* ── Itens ─────────────────────────────────────────────────── */}
          <h2 className="doc-h2">Itens do {TITULO_DOCUMENTO}</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse text-[0.72rem]">
              <thead>
                <tr>
                  <th className="doc-th text-left">Código</th>
                  <th className="doc-th text-left">Descrição</th>
                  <th className="doc-th text-right">NCM</th>
                  <th className="doc-th text-right">Quant.</th>
                  <th className="doc-th text-right">Unit. (R$)</th>
                  <th className="doc-th text-right">Valor Total (R$)</th>
                </tr>
              </thead>
              <tbody>
                {proposta.itens.map((item, idx) => (
                  <tr key={`${item.produtoId}-${idx}`} className="border-b border-neutral-200">
                    <td className="doc-td font-mono">{item.codigo}</td>
                    <td className="doc-td">{item.descricao}</td>
                    <td className="doc-td text-right font-mono">{item.ncm || "—"}</td>
                    <td className="doc-td whitespace-nowrap text-right font-mono">
                      {formatarNumero(item.quantidade)} {item.unidade}
                    </td>
                    <td className="doc-td text-right font-mono">
                      {formatarNumero(item.precoUnitario, 4)}
                    </td>
                    <td className="doc-td text-right font-mono">
                      {formatarNumero(item.precoUnitario * item.quantidade)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                {totais.map(([rotulo, valor]) => {
                  const ehTotal = rotulo === "Total:";
                  return (
                    <tr key={rotulo}>
                      <td colSpan={4} />
                      <td
                        className={`doc-total-label ${ehTotal ? "font-bold" : "font-semibold"}`}
                      >
                        {rotulo}
                      </td>
                      <td
                        className={`doc-total-valor font-mono ${ehTotal ? "font-bold" : ""}`}
                      >
                        {formatarNumero(valor)}
                      </td>
                    </tr>
                  );
                })}
              </tfoot>
            </table>
          </div>

          {/* ── Vencimentos ───────────────────────────────────────────── */}
          <h2 className="doc-h2">
            Vencimentos{" "}
            <span className="font-normal text-neutral-600">{condicoes.tipoVencimento}</span>
          </h2>

          {condicoes.parcelas.length > 0 ? (
            <div className="mt-3 overflow-x-auto">
              <table className="border-collapse text-[0.72rem]">
                <tbody>
                  <tr>
                    <th className="doc-parcela-label">Parcela</th>
                    {condicoes.parcelas.map((p) => (
                      <td key={p.numero} className="doc-parcela-valor font-mono">
                        {p.numero}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th className="doc-parcela-label">Vencimento</th>
                    {condicoes.parcelas.map((p) => (
                      <td key={p.numero} className="doc-parcela-valor font-mono">
                        {formatarDataSimples(p.vencimento)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th className="doc-parcela-label">Valor (R$)</th>
                    {condicoes.parcelas.map((p) => (
                      <td key={p.numero} className="doc-parcela-valor font-mono">
                        {formatarNumero(p.valor)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-3 text-[0.72rem] text-neutral-600">
              Vencimentos a definir conforme a condição de pagamento acordada.
            </p>
          )}

          {/* ── Outras informações ────────────────────────────────────── */}
          <h2 className="doc-h2">Outras Informações</h2>
          <div className="mt-3 space-y-1 text-[0.72rem] leading-relaxed text-neutral-700">
            <p>
              <span className="font-bold">{TITULO_DOCUMENTO} - incluído em:</span>{" "}
              {formatarDataHora(proposta.criadaEm)}
            </p>
            {condicoes.previsaoFaturamento && (
              <p>
                <span className="font-bold">Previsão de Faturamento:</span>{" "}
                {formatarDataSimples(condicoes.previsaoFaturamento)}
              </p>
            )}
            <p>
              <span className="font-bold">Vendedor:</span> {proposta.vendedorNome}
            </p>
            <p>
              <span className="font-bold">Validade da proposta:</span>{" "}
              {condicoes.validadeDias} dias (até {validadeProposta(proposta)})
            </p>
            {condicoes.prazoEntrega && (
              <p>
                <span className="font-bold">Prazo de entrega:</span> {condicoes.prazoEntrega}
              </p>
            )}
          </div>

          <p className="mt-4 text-[0.72rem] uppercase leading-relaxed text-neutral-800">
            {condicoes.condicaoPagamento}
          </p>

          {condicoes.despesas.length > 0 && (
            <div className="mt-4 space-y-0.5 text-[0.72rem] uppercase leading-relaxed text-neutral-800">
              {condicoes.despesas.map((d, i) => (
                <p key={`${d.descricao}-${i}`}>
                  {d.descricao} por conta{" "}
                  {d.responsavel === "Brasforno" ? "da Brasforno" : "do cliente"}
                  {d.valor ? ` — estimativa de R$ ${formatarNumero(d.valor)}` : ""}
                </p>
              ))}
            </div>
          )}

          {condicoes.despesas.some((d) => d.valor) && (
            <p className="mt-2 text-[0.66rem] italic text-neutral-500">
              Despesas informadas acima são estimativas e não estão inclusas no total do
              orçamento.
            </p>
          )}

          {condicoes.observacoes && (
            <p className="mt-4 whitespace-pre-line text-[0.72rem] leading-relaxed text-neutral-800">
              {condicoes.observacoes}
            </p>
          )}

          {/* ── Ficha de cada produto ─────────────────────────────────── */}
          <h2 className="doc-h2-barra">Produto</h2>

          <div className="mt-4 space-y-8">
            {proposta.itens.map((item, idx) => (
              <section key={`ficha-${item.produtoId}-${idx}`} className="break-inside-avoid">
                <h3 className="text-[0.85rem] font-bold text-neutral-900">
                  {item.codigo} - {item.descricao}
                </h3>

                {item.caracteristicas.length > 0 && (
                  <div className="mt-1.5 space-y-0.5 text-[0.72rem] leading-relaxed text-neutral-700">
                    {item.caracteristicas.map((c, i) => (
                      <p key={`${c}-${i}`}>{c}</p>
                    ))}
                  </div>
                )}

                {item.descricaoComplementar && (
                  <p className="mt-3 whitespace-pre-line text-[0.72rem] leading-relaxed text-neutral-700">
                    {item.descricaoComplementar}
                  </p>
                )}

                {item.fotoUrl && (
                  // Foto vem do cadastro do item como data URL ou link externo —
                  // <img> evita passar por otimização do Next nos dois casos.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.fotoUrl}
                    alt={item.descricao}
                    className="mt-3 h-auto w-[190px] max-w-full border border-neutral-200 bg-neutral-50 object-contain"
                  />
                )}
              </section>
            ))}
          </div>

          {/* ── Rodapé ────────────────────────────────────────────────── */}
          <footer className="mt-12 border-t border-neutral-200 pt-4 text-center text-[0.66rem] text-neutral-500">
            <p>
              Gerado em {formatarDataHora(proposta.atualizadaEm)} por{" "}
              {proposta.criadaPorNome}
            </p>
            <p className="mt-0.5">Página 1 de 1</p>
          </footer>
        </article>
      </div>
    </div>
  );
}
