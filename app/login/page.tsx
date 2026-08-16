import { redirect } from "next/navigation";
import { contarUsuarios } from "@/lib/usuarios";
import { sessaoAtual } from "@/lib/auth";
import FormularioAcesso from "@/components/FormularioAcesso";

export const dynamic = "force-dynamic";

export default async function PaginaLogin({
  searchParams,
}: {
  searchParams: Promise<{ destino?: string }>;
}) {
  // Sistema recém-instalado: manda criar o primeiro administrador.
  if ((await contarUsuarios()) === 0) redirect("/setup");
  if (await sessaoAtual()) redirect("/");

  const { destino } = await searchParams;
  return <FormularioAcesso modo="login" destino={destino} />;
}
