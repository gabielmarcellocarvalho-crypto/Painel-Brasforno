import Link from "next/link";
import { requerSessao } from "@/lib/auth";
import { listarProdutos } from "@/lib/produtos";
import { podeCriarPropostas } from "@/lib/permissoes";
import AssistenteProposta from "@/components/AssistenteProposta";

export const dynamic = "force-dynamic";

export default async function NovaProposta() {
  const sessao = await requerSessao();

  if (!podeCriarPropostas(sessao.papel)) {
    return (
      <div className="max-w-2xl px-4 py-16 md:px-6 lg:px-10">
        <h1 className="text-2xl font-bold text-steel-900">Sem acesso a esta etapa</h1>
        <p className="mt-3 text-sm leading-relaxed text-steel-600">
          Seu perfil acompanha os resultados do time, mas não emite propostas. Se você
          precisa emitir orçamentos, peça ao administrador para ajustar seu perfil.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-11 items-center rounded-sm bg-steel-700 px-5 text-sm font-bold text-white hover:bg-steel-600"
        >
          Voltar ao painel
        </Link>
      </div>
    );
  }

  const produtos = (await listarProdutos(true)).filter((p) => p.ativo);

  return <AssistenteProposta produtos={produtos} vendedorNome={sessao.nome} />;
}
