import { NextRequest, NextResponse } from "next/server";
import { contarUsuarios, criarUsuario } from "@/lib/usuarios";
import {
  COOKIE_SESSAO,
  DURACAO_SESSAO_SEGUNDOS,
  assinarSessao,
  novaSessao,
} from "@/lib/sessao";

export const runtime = "nodejs";

// Cria o primeiro administrador. Só funciona enquanto não existir nenhum
// usuário — depois disso a rota fica permanentemente fechada.
export async function POST(req: NextRequest) {
  if ((await contarUsuarios()) > 0) {
    return NextResponse.json(
      { erro: "O sistema já possui usuários. Peça acesso ao administrador." },
      { status: 403 }
    );
  }

  const { nome, login, senha } = await req.json();

  if (!nome?.trim() || !login?.trim()) {
    return NextResponse.json({ erro: "Informe nome e login." }, { status: 400 });
  }
  if (!senha || senha.length < 8) {
    return NextResponse.json(
      { erro: "A senha precisa ter pelo menos 8 caracteres." },
      { status: 400 }
    );
  }

  const usuario = await criarUsuario({ nome, login, senha, papel: "admin" });
  const token = await assinarSessao(novaSessao(usuario.id, usuario.nome, usuario.papel));

  const resp = NextResponse.json({ ok: true }, { status: 201 });
  resp.cookies.set(COOKIE_SESSAO, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DURACAO_SESSAO_SEGUNDOS,
  });
  return resp;
}
