import { NextRequest, NextResponse } from "next/server";
import { sessaoDaApi } from "@/lib/auth";
import { podeGerenciarUsuarios } from "@/lib/permissoes";
import { criarUsuario, listarUsuarios } from "@/lib/usuarios";
import { Papel } from "@/lib/types";

export const runtime = "nodejs";

const PAPEIS: Papel[] = ["admin", "gestor", "representante"];

async function exigirAdmin() {
  const sessao = await sessaoDaApi();
  if (!sessao) return { erro: NextResponse.json({ erro: "Não autenticado." }, { status: 401 }) };
  if (!podeGerenciarUsuarios(sessao.papel)) {
    return { erro: NextResponse.json({ erro: "Sem permissão." }, { status: 403 }) };
  }
  return { sessao };
}

export async function GET() {
  const { erro } = await exigirAdmin();
  if (erro) return erro;
  return NextResponse.json(await listarUsuarios());
}

export async function POST(req: NextRequest) {
  const { erro } = await exigirAdmin();
  if (erro) return erro;

  const { nome, login, senha, papel, telefone } = await req.json();

  if (!nome?.trim() || !login?.trim()) {
    return NextResponse.json({ erro: "Informe nome e login." }, { status: 400 });
  }
  if (!senha || senha.length < 8) {
    return NextResponse.json(
      { erro: "A senha precisa ter pelo menos 8 caracteres." },
      { status: 400 }
    );
  }
  if (!PAPEIS.includes(papel)) {
    return NextResponse.json({ erro: "Perfil de acesso inválido." }, { status: 400 });
  }

  try {
    const usuario = await criarUsuario({ nome, login, senha, papel, telefone });
    return NextResponse.json(usuario, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { erro: e instanceof Error ? e.message : "Erro ao criar usuário." },
      { status: 400 }
    );
  }
}
