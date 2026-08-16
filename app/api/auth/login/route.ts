import { NextRequest, NextResponse } from "next/server";
import { buscarUsuarioPorLogin, conferirSenha, registrarAcesso } from "@/lib/usuarios";
import {
  COOKIE_SESSAO,
  DURACAO_SESSAO_SEGUNDOS,
  assinarSessao,
  novaSessao,
} from "@/lib/sessao";

export const runtime = "nodejs";

// Mensagem única para login inexistente e senha errada — não entregamos a
// quem tenta adivinhar a informação de quais logins existem.
const CREDENCIAL_INVALIDA = "Login ou senha incorretos.";

export async function POST(req: NextRequest) {
  const { login, senha } = await req.json();

  if (!login?.trim() || !senha) {
    return NextResponse.json({ erro: "Informe login e senha." }, { status: 400 });
  }

  const usuario = await buscarUsuarioPorLogin(login);
  if (!usuario || !(await conferirSenha(senha, usuario.senhaHash))) {
    return NextResponse.json({ erro: CREDENCIAL_INVALIDA }, { status: 401 });
  }

  if (!usuario.ativo) {
    return NextResponse.json(
      { erro: "Este usuário está desativado. Fale com o administrador." },
      { status: 403 }
    );
  }

  const token = await assinarSessao(novaSessao(usuario.id, usuario.nome, usuario.papel));
  await registrarAcesso(usuario.id);

  const resp = NextResponse.json({
    ok: true,
    usuario: { id: usuario.id, nome: usuario.nome, papel: usuario.papel },
  });

  resp.cookies.set(COOKIE_SESSAO, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DURACAO_SESSAO_SEGUNDOS,
  });

  return resp;
}
