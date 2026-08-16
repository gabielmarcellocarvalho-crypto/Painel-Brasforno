import { db } from "./firebase-admin";
import { Produto } from "./types";

// Cadastro de itens em Firestore: produtos/{id} + contadores/produtos (sequência
// do código). A proposta copia foto, características e NCM daqui no momento da
// montagem, então editar um produto não altera propostas já emitidas.

const produtosRef = db.collection("produtos");
const contadorRef = db.collection("contadores").doc("produtos");

function ordenar(produtos: Produto[]): Produto[] {
  return produtos.sort(
    (a, b) =>
      a.categoria.localeCompare(b.categoria, "pt-BR") ||
      a.nome.localeCompare(b.nome, "pt-BR")
  );
}

export async function listarProdutos(apenasAtivos = false): Promise<Produto[]> {
  const snap = await produtosRef.get();
  const produtos = snap.docs.map((d) => d.data() as Produto);
  return ordenar(apenasAtivos ? produtos.filter((p) => p.ativo) : produtos);
}

export async function buscarProduto(id: string): Promise<Produto | undefined> {
  const doc = await produtosRef.doc(id).get();
  return doc.exists ? (doc.data() as Produto) : undefined;
}

/** Próximo código livre no formato 000025, como no ERP. */
async function proximoCodigo(): Promise<string> {
  const seq = await db.runTransaction(async (tx) => {
    const snap = await tx.get(contadorRef);
    const proximo = (snap.exists ? (snap.data()?.seq as number) : 0) + 1;
    tx.set(contadorRef, { seq: proximo }, { merge: true });
    return proximo;
  });
  return String(seq).padStart(6, "0");
}

export type DadosProduto = Omit<
  Produto,
  "id" | "criadoEm" | "atualizadoEm" | "codigo"
> & { codigo?: string };

export async function criarProduto(dados: DadosProduto): Promise<Produto> {
  const docRef = produtosRef.doc();
  const agora = new Date().toISOString();

  const produto: Produto = {
    ...dados,
    codigo: dados.codigo?.trim() || (await proximoCodigo()),
    id: docRef.id,
    criadoEm: agora,
    atualizadoEm: agora,
  };

  await docRef.set(produto);
  return produto;
}

export async function atualizarProduto(
  id: string,
  mudancas: Partial<DadosProduto>
): Promise<Produto | undefined> {
  const docRef = produtosRef.doc(id);
  const atual = await docRef.get();
  if (!atual.exists) return undefined;

  await docRef.update({ ...mudancas, atualizadoEm: new Date().toISOString() });
  const atualizado = await docRef.get();
  return atualizado.data() as Produto;
}

export async function excluirProduto(id: string): Promise<boolean> {
  const docRef = produtosRef.doc(id);
  if (!(await docRef.get()).exists) return false;
  await docRef.delete();
  return true;
}

export async function contarProdutos(): Promise<number> {
  const snap = await produtosRef.count().get();
  return snap.data().count;
}
