import { NextRequest, NextResponse } from "next/server";
import { sessaoDaApi } from "@/lib/auth";
import { podeGerenciarUsuarios } from "@/lib/permissoes";
import { atualizarUsuario, buscarUsuario, excluirUsuario, listarUsuarios } from "@/lib/usuarios";
import { contarPropostasDoVendedor } from "@/lib/store";
import { Papel } from "@/lib/types";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

const PAPEIS: Papel[] = ["admin", "gestor", "representante"];

async function exigirAdmin() {
  const sessao = await sessaoDaApi();
  if (!sessao) return { erro: NextResponse.json({ erro: "Não autenticado." }, { status: 401 }) };
  if (!podeGerenciarUsuarios(sessao.papel)) {
    return { erro: NextResponse.json({ erro: "Sem permissão." }, { status: 403 }) };
  }
  return { sessao };
}

/** Impede que o sistema fique sem nenhum administrador ativo. */
async function seriaOUltimoAdmin(id: string): Promise<boolean> {
  const alvo = await buscarUsuario(id);
  if (alvo?.papel !== "admin" || !alvo.ativo) return false;
  const admins = (await listarUsuarios()).filter((u) => u.papel === "admin" && u.ativo);
  return admins.length <= 1;
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { erro, sessao } = await exigirAdmin();
  if (erro) return erro;

  const { id } = await params;
  const mudancas = await req.json();

  if (mudancas.papel !== undefined && !PAPEIS.includes(mudancas.papel)) {
    return NextResponse.json({ erro: "Perfil de acesso inválido." }, { status: 400 });
  }
  if (mudancas.senha !== undefined && mudancas.senha.length < 8) {
    return NextResponse.json(
      { erro: "A senha precisa ter pelo menos 8 caracteres." },
      { status: 400 }
    );
  }

  const perdeAdmin =
    mudancas.ativo === false || (mudancas.papel !== undefined && mudancas.papel !== "admin");
  if (perdeAdmin && (await seriaOUltimoAdmin(id))) {
    return NextResponse.json(
      { erro: "Este é o único administrador ativo. Promova outro usuário antes de alterá-lo." },
      { status: 400 }
    );
  }
  if (id === sessao!.uid && mudancas.ativo === false) {
    return NextResponse.json({ erro: "Você não pode desativar a si mesmo." }, { status: 400 });
  }

  try {
    const usuario = await atualizarUsuario(id, mudancas);
    if (!usuario) {
      return NextResponse.json({ erro: "Usuário não encontrado." }, { status: 404 });
    }
    return NextResponse.json(usuario);
  } catch (e) {
    return NextResponse.json(
      { erro: e instanceof Error ? e.message : "Erro ao atualizar usuário." },
      { status: 400 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { erro, sessao } = await exigirAdmin();
  if (erro) return erro;

  const { id } = await params;
  if (id === sessao!.uid) {
    return NextResponse.json({ erro: "Você não pode excluir a si mesmo." }, { status: 400 });
  }
  if (await seriaOUltimoAdmin(id)) {
    return NextResponse.json(
      { erro: "Este é o único administrador ativo. Promova outro usuário antes de excluí-lo." },
      { status: 400 }
    );
  }

  // Propostas guardam o histórico de quem vendeu: se houver alguma, o usuário
  // é desativado em vez de apagado, para não quebrar o rastro comercial.
  const propostas = await contarPropostasDoVendedor(id);
  if (propostas > 0) {
    return NextResponse.json(
      {
        erro: `Este usuário tem ${propostas} proposta(s) no sistema e não pode ser excluído. Desative-o para bloquear o acesso mantendo o histórico.`,
      },
      { status: 400 }
    );
  }

  const ok = await excluirUsuario(id);
  if (!ok) return NextResponse.json({ erro: "Usuário não encontrado." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
