import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_SESSAO, verificarSessao } from "./sessao";
import { Papel, Sessao } from "./types";

// Helpers de autorização para Server Components e Route Handlers.
// O middleware só barra quem não tem cookie válido; a decisão de "quem pode o
// quê" é sempre tomada aqui, no servidor, junto do dado.

/** Sessão atual, ou null se não estiver logado. Não redireciona. */
export async function sessaoAtual(): Promise<Sessao | null> {
  const jar = await cookies();
  return verificarSessao(jar.get(COOKIE_SESSAO)?.value);
}

/** Sessão atual — manda para o login se não houver. Use em páginas. */
export async function requerSessao(): Promise<Sessao> {
  const sessao = await sessaoAtual();
  if (!sessao) redirect("/login");
  return sessao;
}

/** Exige um dos papéis informados. Manda para o painel se não tiver acesso. */
export async function requerPapel(...papeis: Papel[]): Promise<Sessao> {
  const sessao = await requerSessao();
  if (!papeis.includes(sessao.papel)) redirect("/?erro=sem-permissao");
  return sessao;
}

/** Versão para API: devolve a sessão ou null (o handler responde 401). */
export async function sessaoDaApi(): Promise<Sessao | null> {
  return sessaoAtual();
}
