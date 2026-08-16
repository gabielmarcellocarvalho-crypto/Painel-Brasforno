import { NextRequest, NextResponse } from "next/server";
import { sessaoDaApi } from "@/lib/auth";
import { podeGerenciarCatalogo } from "@/lib/permissoes";
import { atualizarProduto, buscarProduto, excluirProduto } from "@/lib/produtos";
import { normalizarEntradaProduto } from "@/lib/validacao-produto";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

async function exigirCatalogo() {
  const sessao = await sessaoDaApi();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  if (!podeGerenciarCatalogo(sessao.papel)) {
    return NextResponse.json({ erro: "Sem permissão para editar o catálogo." }, { status: 403 });
  }
  return null;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const sessao = await sessaoDaApi();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const produto = await buscarProduto(id);
  if (!produto) return NextResponse.json({ erro: "Produto não encontrado." }, { status: 404 });
  return NextResponse.json(produto);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const barrado = await exigirCatalogo();
  if (barrado) return barrado;

  const { id } = await params;
  try {
    const dados = normalizarEntradaProduto(await req.json());
    const produto = await atualizarProduto(id, dados);
    if (!produto) return NextResponse.json({ erro: "Produto não encontrado." }, { status: 404 });
    return NextResponse.json(produto);
  } catch (e) {
    return NextResponse.json(
      { erro: e instanceof Error ? e.message : "Erro ao salvar produto." },
      { status: 400 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const barrado = await exigirCatalogo();
  if (barrado) return barrado;

  const { id } = await params;
  const ok = await excluirProduto(id);
  if (!ok) return NextResponse.json({ erro: "Produto não encontrado." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
