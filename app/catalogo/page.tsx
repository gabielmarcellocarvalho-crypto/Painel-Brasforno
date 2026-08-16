import { requerSessao } from "@/lib/auth";
import { listarProdutos } from "@/lib/produtos";
import { podeGerenciarCatalogo } from "@/lib/permissoes";
import GerenciadorCatalogo from "@/components/GerenciadorCatalogo";

export const dynamic = "force-dynamic";

export default async function PaginaCatalogo() {
  const sessao = await requerSessao();
  const produtos = await listarProdutos();

  return (
    <GerenciadorCatalogo
      produtosIniciais={produtos}
      podeEditar={podeGerenciarCatalogo(sessao.papel)}
    />
  );
}
