import { NextRequest, NextResponse } from "next/server";
import { sessaoDaApi } from "@/lib/auth";
import { podeGerenciarCatalogo } from "@/lib/permissoes";
import { criarProduto, listarProdutos } from "@/lib/produtos";
import { normalizarEntradaProduto } from "@/lib/validacao-produto";

export const runtime = "nodejs";

export async function GET() {
  const sessao = await sessaoDaApi();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  return NextResponse.json(await listarProdutos());
}

export async function POST(req: NextRequest) {
  const sessao = await sessaoDaApi();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  if (!podeGerenciarCatalogo(sessao.papel)) {
    return NextResponse.json({ erro: "Sem permissão para editar o catálogo." }, { status: 403 });
  }

  try {
    const dados = normalizarEntradaProduto(await req.json());
    return NextResponse.json(await criarProduto(dados), { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { erro: e instanceof Error ? e.message : "Erro ao salvar produto." },
      { status: 400 }
    );
  }
}
