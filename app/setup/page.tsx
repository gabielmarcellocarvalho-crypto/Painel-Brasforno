import { redirect } from "next/navigation";
import { contarUsuarios } from "@/lib/usuarios";
import FormularioAcesso from "@/components/FormularioAcesso";

export const dynamic = "force-dynamic";

export default async function PaginaSetup() {
  // Depois do primeiro administrador, esta tela deixa de existir.
  if ((await contarUsuarios()) > 0) redirect("/login");
  return <FormularioAcesso modo="setup" />;
}
