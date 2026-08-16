import { Papel, Sessao } from "./types";

// Sessão em cookie assinado com HMAC-SHA256. Usa Web Crypto (crypto.subtle),
// que existe tanto no runtime Node quanto no Edge — assim o middleware e as
// páginas server-side compartilham exatamente o mesmo código de verificação.

export const COOKIE_SESSAO = "bf_sessao";
export const DURACAO_SESSAO_SEGUNDOS = 60 * 60 * 12; // 12h — um turno de trabalho

function segredo(): string {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) {
    throw new Error(
      "AUTH_SECRET ausente ou muito curto. Gere um com `npm run gerar:secret` e coloque em .env.local (mínimo 32 caracteres)."
    );
  }
  return s;
}

function base64url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function deBase64url(s: string): Uint8Array<ArrayBuffer> {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64.padEnd(Math.ceil(b64.length / 4) * 4, "="));
  // ArrayBuffer explícito: crypto.subtle exige um buffer não compartilhado.
  const bytes = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function chave(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(segredo()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/** Gera o valor do cookie: <payload em base64url>.<assinatura em base64url> */
export async function assinarSessao(sessao: Sessao): Promise<string> {
  const payload = base64url(new TextEncoder().encode(JSON.stringify(sessao)));
  const assinatura = await crypto.subtle.sign(
    "HMAC",
    await chave(),
    new TextEncoder().encode(payload)
  );
  return `${payload}.${base64url(new Uint8Array(assinatura))}`;
}

/** Verifica assinatura e validade. Devolve null se o token for inválido. */
export async function verificarSessao(token: string | undefined): Promise<Sessao | null> {
  if (!token) return null;
  const [payload, assinatura] = token.split(".");
  if (!payload || !assinatura) return null;

  try {
    const valida = await crypto.subtle.verify(
      "HMAC",
      await chave(),
      deBase64url(assinatura),
      new TextEncoder().encode(payload)
    );
    if (!valida) return null;

    const sessao = JSON.parse(
      new TextDecoder().decode(deBase64url(payload))
    ) as Sessao;

    if (!sessao?.uid || !sessao?.papel) return null;
    if (sessao.exp * 1000 < Date.now()) return null;
    return sessao;
  } catch {
    return null;
  }
}

export function novaSessao(uid: string, nome: string, papel: Papel): Sessao {
  return {
    uid,
    nome,
    papel,
    exp: Math.floor(Date.now() / 1000) + DURACAO_SESSAO_SEGUNDOS,
  };
}

// As regras de permissão moram em `lib/permissoes.ts` — módulo puro, seguro
// para importar em componentes de cliente sem arrastar este código junto.
