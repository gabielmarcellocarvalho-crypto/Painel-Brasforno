import { requerPapel } from "@/lib/auth";
import { listarUsuarios } from "@/lib/usuarios";
import GerenciadorUsuarios from "@/components/GerenciadorUsuarios";

export const dynamic = "force-dynamic";

export default async function PaginaUsuarios() {
  // Só administrador. Quem não for é devolvido ao painel pelo requerPapel.
  const sessao = await requerPapel("admin");
  const usuarios = await listarUsuarios();

  return <GerenciadorUsuarios usuariosIniciais={usuarios} meuId={sessao.uid} />;
}
