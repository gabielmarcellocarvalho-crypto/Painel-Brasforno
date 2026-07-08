import { NextResponse } from "next/server";
import { listarPropostas } from "@/lib/store";
import { STATUS_LABEL, subtotalProposta, totalProposta } from "@/lib/utils";

function csvEscape(v: string | number): string {
  const s = String(v);
  if (s.includes(";") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET() {
  const propostas = await listarPropostas();
  const cabecalho = [
    "Número",
    "Data",
    "Status",
    "Representante",
    "Cliente",
    "Empresa",
    "WhatsApp",
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
  ];

  const linhas = propostas.map((p) =>
    [
      p.numero,
      new Date(p.criadaEm).toLocaleDateString("pt-BR"),
      STATUS_LABEL[p.status],
      p.representante,
      p.cliente.nome,
      p.cliente.empresa,
      p.cliente.whatsapp,
      p.cliente.cidade,
      p.cliente.uf,
      p.cliente.segmento,
      p.itens.map((i) => `${i.quantidade}x ${i.produtoNome} (${i.modelo})`).join(" | "),
      subtotalProposta(p).toFixed(2).replace(".", ","),
      p.condicoes.descontoPercent,
      totalProposta(p).toFixed(2).replace(".", ","),
      p.condicoes.frete,
      p.condicoes.formaPagamento,
      p.condicoes.prazoEntrega,
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
