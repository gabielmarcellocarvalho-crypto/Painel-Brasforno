import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { db } from "./firebase-admin";
import { Papel, Usuario, UsuarioPublico } from "./types";

// Coleção usuarios/{id}. Senhas guardadas como scrypt (built-in do Node, sem
// dependência externa) no formato "scrypt:<salt hex>:<hash hex>".

const scryptAsync = promisify(scrypt) as (
  senha: string,
  salt: Buffer,
  tamanho: number
) => Promise<Buffer>;

const usuariosRef = db.collection("usuarios");

const CUSTO_TAMANHO = 64;

export async function gerarHashSenha(senha: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scryptAsync(senha, salt, CUSTO_TAMANHO);
  return `scrypt:${salt.toString("hex")}:${hash.toString("hex")}`;
}

export async function conferirSenha(senha: string, armazenado: string): Promise<boolean> {
  const [algoritmo, saltHex, hashHex] = armazenado.split(":");
  if (algoritmo !== "scrypt" || !saltHex || !hashHex) return false;

  const esperado = Buffer.from(hashHex, "hex");
  const calculado = await scryptAsync(senha, Buffer.from(saltHex, "hex"), esperado.length);
  return esperado.length === calculado.length && timingSafeEqual(esperado, calculado);
}

export function semSenha(u: Usuario): UsuarioPublico {
  const { senhaHash: _, ...resto } = u;
  return resto;
}

function normalizarLogin(login: string): string {
  return login.trim().toLowerCase();
}

export async function contarUsuarios(): Promise<number> {
  const snap = await usuariosRef.count().get();
  return snap.data().count;
}

export async function listarUsuarios(): Promise<UsuarioPublico[]> {
  const snap = await usuariosRef.get();
  return snap.docs
    .map((d) => semSenha(d.data() as Usuario))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

export async function buscarUsuario(id: string): Promise<Usuario | undefined> {
  const doc = await usuariosRef.doc(id).get();
  return doc.exists ? (doc.data() as Usuario) : undefined;
}

export async function buscarUsuarioPorLogin(login: string): Promise<Usuario | undefined> {
  const snap = await usuariosRef.where("login", "==", normalizarLogin(login)).limit(1).get();
  return snap.empty ? undefined : (snap.docs[0].data() as Usuario);
}

export async function criarUsuario(dados: {
  nome: string;
  login: string;
  senha: string;
  papel: Papel;
  telefone?: string;
}): Promise<UsuarioPublico> {
  const login = normalizarLogin(dados.login);
  if (await buscarUsuarioPorLogin(login)) {
    throw new Error("Já existe um usuário com este login.");
  }

  const docRef = usuariosRef.doc();
  const usuario: Usuario = {
    id: docRef.id,
    nome: dados.nome.trim(),
    login,
    senhaHash: await gerarHashSenha(dados.senha),
    papel: dados.papel,
    telefone: dados.telefone?.trim() || "",
    ativo: true,
    criadoEm: new Date().toISOString(),
  };

  await docRef.set(usuario);
  return semSenha(usuario);
}

export async function atualizarUsuario(
  id: string,
  mudancas: { nome?: string; login?: string; senha?: string; papel?: Papel; telefone?: string; ativo?: boolean }
): Promise<UsuarioPublico | undefined> {
  const docRef = usuariosRef.doc(id);
  const atual = await docRef.get();
  if (!atual.exists) return undefined;

  const dados: Partial<Usuario> = {};
  if (mudancas.nome !== undefined) dados.nome = mudancas.nome.trim();
  if (mudancas.telefone !== undefined) dados.telefone = mudancas.telefone.trim();
  if (mudancas.papel !== undefined) dados.papel = mudancas.papel;
  if (mudancas.ativo !== undefined) dados.ativo = mudancas.ativo;
  if (mudancas.senha) dados.senhaHash = await gerarHashSenha(mudancas.senha);

  if (mudancas.login !== undefined) {
    const login = normalizarLogin(mudancas.login);
    const existente = await buscarUsuarioPorLogin(login);
    if (existente && existente.id !== id) {
      throw new Error("Já existe outro usuário com este login.");
    }
    dados.login = login;
  }

  await docRef.update(dados);
  const atualizado = await docRef.get();
  return semSenha(atualizado.data() as Usuario);
}

export async function registrarAcesso(id: string): Promise<void> {
  await usuariosRef.doc(id).update({ ultimoAcesso: new Date().toISOString() });
}

/** Exclusão só é permitida se o usuário não tiver propostas ligadas a ele. */
export async function excluirUsuario(id: string): Promise<boolean> {
  const doc = await usuariosRef.doc(id).get();
  if (!doc.exists) return false;
  await usuariosRef.doc(id).delete();
  return true;
}
