import { db } from "./firebase-admin";
import { Proposta } from "./types";

// Persistência em Firestore (Firebase). Estrutura:
//   propostas/{id}          -> documento Proposta (id do doc == campo id)
//   contadores/propostas    -> { seq: number } usado para gerar o número BF-ANO-XXXX

const propostasRef = db.collection("propostas");
const contadorRef = db.collection("contadores").doc("propostas");

export async function listarPropostas(): Promise<Proposta[]> {
  const snap = await propostasRef.orderBy("criadaEm", "desc").get();
  return snap.docs.map((d) => d.data() as Proposta);
}

export async function buscarProposta(id: string): Promise<Proposta | undefined> {
  const doc = await propostasRef.doc(id).get();
  return doc.exists ? (doc.data() as Proposta) : undefined;
}

export async function criarProposta(
  dados: Omit<Proposta, "id" | "numero" | "criadaEm" | "atualizadaEm">
): Promise<Proposta> {
  const docRef = propostasRef.doc();
  const agora = new Date().toISOString();
  const ano = new Date().getFullYear();

  const proposta = await db.runTransaction(async (tx) => {
    const contadorSnap = await tx.get(contadorRef);
    const seq = (contadorSnap.exists ? (contadorSnap.data()?.seq as number) : 0) + 1;

    const nova: Proposta = {
      ...dados,
      id: docRef.id,
      numero: `BF-${ano}-${String(seq).padStart(4, "0")}`,
      criadaEm: agora,
      atualizadaEm: agora,
    };

    tx.set(contadorRef, { seq }, { merge: true });
    tx.set(docRef, nova);
    return nova;
  });

  return proposta;
}

export async function atualizarProposta(
  id: string,
  mudancas: Partial<Proposta>
): Promise<Proposta | undefined> {
  const docRef = propostasRef.doc(id);
  const atual = await docRef.get();
  if (!atual.exists) return undefined;

  const { id: _id, numero: _numero, ...permitido } = mudancas;
  const atualizacao = { ...permitido, atualizadaEm: new Date().toISOString() };

  await docRef.update(atualizacao);
  const atualizado = await docRef.get();
  return atualizado.data() as Proposta;
}

export async function excluirProposta(id: string): Promise<boolean> {
  const docRef = propostasRef.doc(id);
  const atual = await docRef.get();
  if (!atual.exists) return false;
  await docRef.delete();
  return true;
}
