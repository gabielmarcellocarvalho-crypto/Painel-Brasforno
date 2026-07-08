import { NextRequest, NextResponse } from "next/server";
import { atualizarProposta, buscarProposta, excluirProposta } from "@/lib/store";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const proposta = await buscarProposta(id);
  if (!proposta) {
    return NextResponse.json({ erro: "Proposta não encontrada." }, { status: 404 });
  }
  return NextResponse.json(proposta);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const mudancas = await req.json();
  const proposta = await atualizarProposta(id, mudancas);
  if (!proposta) {
    return NextResponse.json({ erro: "Proposta não encontrada." }, { status: 404 });
  }
  return NextResponse.json(proposta);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const ok = await excluirProposta(id);
  if (!ok) {
    return NextResponse.json({ erro: "Proposta não encontrada." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
