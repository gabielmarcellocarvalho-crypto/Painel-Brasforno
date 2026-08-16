import { NextResponse } from "next/server";
import { sessaoDaApi } from "@/lib/auth";
import { listarPropostasVisiveis } from "@/lib/store";
import {
  APROVACAO_CLIENTE_LABEL,
  APROVACAO_INTERNA_LABEL,
  STATUS_LABEL,
  formatarDataSimples,
  subtotalProposta,
  totalProposta,
} from "@/lib/utils";

export const runtime = "nodejs";

function csvEscape(v: string | number): string {
  const s = String(v ?? "");
  if (s.includes(";") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET() {
  const sessao = await sessaoDaApi();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  // O CSV respeita o mesmo escopo da tela: representante exporta só o que é seu.
  const propostas = await listarPropostasVisiveis(sessao);

  const cabecalho = [
    "Número",
    "Data",
    "Status",
    "Aprovação interna",
    "Resultado do cliente",
    "Motivo da recusa",
    "Vendedor",
    "Cliente",
    "Empresa",
    "CNPJ/CPF",
    "Telefone",
    "Cidade",
    "UF",
    "Segmento",
    "Equipamentos",
    "Subtotal (R$)",
    "Desconto (%)",
    "Total (R$)",
    "Frete",
    "Pagamento",
    "Prazo de entrega",
    "Previsão de faturamento",
  ];

  const linhas = propostas.map((p) =>
    [
      p.numero,
      new Date(p.criadaEm).toLocaleDateString("pt-BR"),
      STATUS_LABEL[p.status],
      APROVACAO_INTERNA_LABEL[p.aprovacaoInterna?.status || "nao_requer"],
      APROVACAO_CLIENTE_LABEL[p.aprovacaoCliente?.status || "pendente"],
      p.aprovacaoCliente?.motivo || "",
      p.vendedorNome,
      p.cliente.nome,
      p.cliente.empresa,
      p.cliente.cnpjCpf || "",
      p.cliente.whatsapp,
      p.cliente.cidade,
      p.cliente.uf,
      p.cliente.segmento,
      p.itens.map((i) => `${i.quantidade}x ${i.codigo} ${i.descricao}`).join(" | "),
      subtotalProposta(p).toFixed(2).replace(".", ","),
      p.condicoes.descontoPercent,
      totalProposta(p).toFixed(2).replace(".", ","),
      p.condicoes.frete,
      p.condicoes.condicaoPagamento,
      p.condicoes.prazoEntrega,
      p.condicoes.previsaoFaturamento
        ? formatarDataSimples(p.condicoes.previsaoFaturamento)
        : "",
    ]
      .map(csvEscape)
      .join(";")
  );

  // BOM para o Excel abrir acentos corretamente
  const csv = "﻿" + [cabecalho.join(";"), ...linhas].join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="propostas-brasforno-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
