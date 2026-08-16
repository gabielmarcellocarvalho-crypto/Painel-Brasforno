import { NextRequest, NextResponse } from "next/server";
import { sessaoDaApi } from "@/lib/auth";
import { podeCriarPropostas } from "@/lib/permissoes";
import { criarProposta, listarPropostasVisiveis } from "@/lib/store";
import { buscarUsuario } from "@/lib/usuarios";
import { Cliente, CondicoesComerciais, ItemProposta, Proposta } from "@/lib/types";
import { exigeAprovacaoInterna } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET() {
  const sessao = await sessaoDaApi();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  return NextResponse.json(await listarPropostasVisiveis(sessao));
}

export async function POST(req: NextRequest) {
  const sessao = await sessaoDaApi();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  if (!podeCriarPropostas(sessao.papel)) {
    return NextResponse.json(
      { erro: "Seu perfil acompanha propostas, mas não emite novas." },
      { status: 403 }
    );
  }

  const body = await req.json();
  const cliente = body.cliente as Cliente;
  const itens = body.itens as ItemProposta[];
  const condicoes = body.condicoes as CondicoesComerciais;

  if (!cliente?.nome || !cliente?.whatsapp || !cliente?.empresa) {
    return NextResponse.json(
      { erro: "Dados do cliente incompletos (nome, empresa e telefone são obrigatórios)." },
      { status: 400 }
    );
  }
  if (!Array.isArray(itens) || itens.length === 0) {
    return NextResponse.json(
      { erro: "A proposta precisa de pelo menos um equipamento." },
      { status: 400 }
    );
  }

  // A proposta pertence a quem está logado — nunca a um nome digitado no
  // formulário. É isso que sustenta o "cada um vê o que é seu".
  const vendedorId = sessao.uid;
  const usuario = await buscarUsuario(vendedorId);
  const vendedorNome = usuario?.nome || sessao.nome;

  const precisaAprovacao = exigeAprovacaoInterna(condicoes?.descontoPercent || 0);

  const dados: Omit<Proposta, "id" | "numero" | "criadaEm" | "atualizadaEm"> = {
    status: "rascunho",
    vendedorId,
    vendedorNome,
    criadaPorNome: sessao.nome,
    cliente,
    itens,
    condicoes,
    aprovacaoInterna: { status: precisaAprovacao ? "pendente" : "nao_requer" },
    aprovacaoCliente: { status: "pendente" },
  };

  return NextResponse.json(await criarProposta(dados), { status: 201 });
}
