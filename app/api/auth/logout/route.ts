import { NextResponse } from "next/server";
import { COOKIE_SESSAO } from "@/lib/sessao";

export const runtime = "nodejs";

export async function POST() {
  const resp = NextResponse.json({ ok: true });
  resp.cookies.set(COOKIE_SESSAO, "", { path: "/", maxAge: 0 });
  return resp;
}
