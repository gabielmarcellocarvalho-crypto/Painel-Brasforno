import { NextRequest, NextResponse } from "next/server";
import { sessaoDaApi } from "@/lib/auth";
import { podeAprovarInternamente, podeExcluirPropostas } from "@/lib/permissoes";
import {
  atualizarProposta,
  buscarProposta,
  excluirProposta,
  podeVerProposta,
} from "@/lib/store";
import { Proposta, StatusProposta } from "@/lib/types";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

const STATUS_VALIDOS: StatusProposta[] = [
  "rascunho",
  "enviada",
  "negociacao",
  "ganha",
  "perdida",
];

export async function GET(_req: NextRequest, { params }: Params) {
  const sessao = await sessaoDaApi();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const proposta = await buscarProposta(id);
  // Mesma resposta para "não existe" e "não é sua": nada de vazar a existência.
  if (!proposta || !podeVerProposta(sessao, proposta)) {
    return NextResponse.json({ erro: "Proposta não encontrada." }, { status: 404 });
  }
  return NextResponse.json(proposta);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const sessao = await sessaoDaApi();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const atual = await buscarProposta(id);
  if (!atual || !podeVerProposta(sessao, atual)) {
    return NextResponse.json({ erro: "Proposta não encontrada." }, { status: 404 });
  }

  const body = await req.json();
  const mudancas: Partial<Proposta> = {};

  if (body.status !== undefined) {
    if (!STATUS_VALIDOS.includes(body.status)) {
      return NextResponse.json({ erro: "Status inválido." }, { status: 400 });
    }
    mudancas.status = body.status;
  }

  // Aprovação interna: privilégio de admin/gestor. O representante nunca
  // libera o próprio desconto.
  if (body.aprovacaoInterna !== undefined) {
    if (!podeAprovarInternamente(sessao.papel)) {
      return NextResponse.json(
        { erro: "Apenas a gestão pode aprovar ou reprovar propostas." },
        { status: 403 }
      );
    }
    const status = body.aprovacaoInterna.status;
    if (!["pendente", "aprovada", "reprovada"].includes(status)) {
      return NextResponse.json({ erro: "Situação de aprovação inválida." }, { status: 400 });
    }
    mudancas.aprovacaoInterna = {
      status,
      porId: sessao.uid,
      porNome: sessao.nome,
      em: new Date().toISOString(),
      observacao: String(body.aprovacaoInterna.observacao || "").trim(),
    };
  }

  // Resultado do cliente: o representante registra o desfecho da sua venda.
  if (body.aprovacaoCliente !== undefined) {
    const status = body.aprovacaoCliente.status;
    if (!["pendente", "aprovada", "nao_aprovada"].includes(status)) {
      return NextResponse.json({ erro: "Situação de aprovação inválida." }, { status: 400 });
    }
    mudancas.aprovacaoCliente = {
      status,
      em: status === "pendente" ? undefined : new Date().toISOString(),
      motivo: String(body.aprovacaoCliente.motivo || "").trim(),
    };
    // Mantém o funil coerente com o desfecho registrado.
    if (status === "aprovada") mudancas.status = "ganha";
    if (status === "nao_aprovada") mudancas.status = "perdida";
    if (status === "pendente" && atual.status !== "rascunho") mudancas.status = "negociacao";
  }

  if (Object.keys(mudancas).length === 0) {
    return NextResponse.json({ erro: "Nada para atualizar." }, { status: 400 });
  }

  const proposta = await atualizarProposta(id, mudancas);
  if (!proposta) return NextResponse.json({ erro: "Proposta não encontrada." }, { status: 404 });
  return NextResponse.json(proposta);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const sessao = await sessaoDaApi();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  if (!podeExcluirPropostas(sessao.papel)) {
    return NextResponse.json(
      { erro: "Apenas o administrador pode excluir propostas." },
      { status: 403 }
    );
  }

  const { id } = await params;
  const ok = await excluirProposta(id);
  if (!ok) return NextResponse.json({ erro: "Proposta não encontrada." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
