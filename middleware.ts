import { NextRequest, NextResponse } from "next/server";
import { COOKIE_SESSAO, verificarSessao } from "@/lib/sessao";

// Barreira de entrada: sem cookie de sessão válido, ninguém passa.
// A autorização fina (quem vê o quê) é decidida no servidor, junto do dado —
// aqui só resolvemos "está logado ou não".

const PUBLICAS = ["/login", "/setup"];
const API_PUBLICAS = ["/api/auth/login", "/api/auth/setup", "/api/auth/logout"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLICAS.includes(pathname) || API_PUBLICAS.includes(pathname)) {
    return NextResponse.next();
  }

  const sessao = await verificarSessao(req.cookies.get(COOKIE_SESSAO)?.value);
  if (sessao) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ erro: "Sessão expirada. Faça login novamente." }, { status: 401 });
  }

  const login = new URL("/login", req.url);
  if (pathname !== "/") login.searchParams.set("destino", pathname + req.nextUrl.search);
  return NextResponse.redirect(login);
}

export const config = {
  // Tudo, menos assets estáticos e arquivos do /public.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico|webp)$).*)"],
};
