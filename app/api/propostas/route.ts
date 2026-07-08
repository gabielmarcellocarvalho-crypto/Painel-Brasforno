import { NextRequest, NextResponse } from "next/server";
import { criarProposta, listarPropostas } from "@/lib/store";
import { Cliente, CondicoesComerciais, ItemProposta } from "@/lib/types";

export async function GET() {
  return NextResponse.json(await listarPropostas());
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const cliente = body.cliente as Cliente;
  const itens = body.itens as ItemProposta[];
  const condicoes = body.condicoes as CondicoesComerciais;
  const representante = String(body.representante || "").trim();

  if (!cliente?.nome || !cliente?.whatsapp || !cliente?.empresa) {
    return NextResponse.json(
      { erro: "Dados do cliente incompletos (nome, empresa e WhatsApp são obrigatórios)." },
      { status: 400 }
    );
  }
  if (!Array.isArray(itens) || itens.length === 0) {
    return NextResponse.json(
      { erro: "A proposta precisa de pelo menos um equipamento." },
      { status: 400 }
    );
  }
  if (!representante) {
    return NextResponse.json(
      { erro: "Informe o nome do representante." },
      { status: 400 }
    );
  }

  const proposta = await criarProposta({
    status: "rascunho",
    representante,
    cliente,
    itens,
    condicoes,
  });

  return NextResponse.json(proposta, { status: 201 });
}
