import { db } from "./firebase-admin";
import { Proposta, Sessao } from "./types";
import { vePropostasDeTodos } from "./permissoes";

// Persistência em Firestore. Estrutura:
//   propostas/{id}          -> documento Proposta (id do doc == campo id)
//   contadores/propostas    -> { seq: number } usado para gerar o número

const propostasRef = db.collection("propostas");
const contadorRef = db.collection("contadores").doc("propostas");

function ordenarPorData(propostas: Proposta[]): Proposta[] {
  return propostas.sort((a, b) => b.criadaEm.localeCompare(a.criadaEm));
}

/**
 * Propostas visíveis para a sessão informada. Representante só enxerga as
 * próprias — o filtro é aplicado na consulta, nunca só na tela.
 *
 * A ordenação é feita em memória de propósito: `where` + `orderBy` em campos
 * diferentes exigiria um índice composto no Firestore sem ganho real no volume
 * de propostas dessa operação.
 */
export async function listarPropostasVisiveis(sessao: Sessao): Promise<Proposta[]> {
  if (vePropostasDeTodos(sessao.papel)) {
    const snap = await propostasRef.get();
    return ordenarPorData(snap.docs.map((d) => d.data() as Proposta));
  }

  const snap = await propostasRef.where("vendedorId", "==", sessao.uid).get();
  return ordenarPorData(snap.docs.map((d) => d.data() as Proposta));
}

/** Sem escopo — use apenas em rotinas administrativas (export, scripts). */
export async function listarTodasPropostas(): Promise<Proposta[]> {
  const snap = await propostasRef.get();
  return ordenarPorData(snap.docs.map((d) => d.data() as Proposta));
}

export async function buscarProposta(id: string): Promise<Proposta | undefined> {
  const doc = await propostasRef.doc(id).get();
  return doc.exists ? (doc.data() as Proposta) : undefined;
}

/** true se a sessão pode abrir/alterar esta proposta. */
export function podeVerProposta(sessao: Sessao, proposta: Proposta): boolean {
  return vePropostasDeTodos(sessao.papel) || proposta.vendedorId === sessao.uid;
}

/** Busca já validando o escopo do usuário. undefined = não existe ou sem acesso. */
export async function buscarPropostaVisivel(
  id: string,
  sessao: Sessao
): Promise<Proposta | undefined> {
  const proposta = await buscarProposta(id);
  if (!proposta) return undefined;
  return podeVerProposta(sessao, proposta) ? proposta : undefined;
}

export async function criarProposta(
  dados: Omit<Proposta, "id" | "numero" | "criadaEm" | "atualizadaEm">
): Promise<Proposta> {
  const docRef = propostasRef.doc();
  const agora = new Date().toISOString();

  return db.runTransaction(async (tx) => {
    const contadorSnap = await tx.get(contadorRef);
    const seq = (contadorSnap.exists ? (contadorSnap.data()?.seq as number) : 0) + 1;

    const nova: Proposta = {
      ...dados,
      id: docRef.id,
      numero: String(seq),
      criadaEm: agora,
      atualizadaEm: agora,
    };

    tx.set(contadorRef, { seq }, { merge: true });
    tx.set(docRef, nova);
    return nova;
  });
}

export async function atualizarProposta(
  id: string,
  mudancas: Partial<Proposta>
): Promise<Proposta | undefined> {
  const docRef = propostasRef.doc(id);
  const atual = await docRef.get();
  if (!atual.exists) return undefined;

  // Identidade e autoria da proposta nunca mudam por PATCH.
  const {
    id: _id,
    numero: _numero,
    criadaEm: _criadaEm,
    vendedorId: _vendedorId,
    ...permitido
  } = mudancas;

  await docRef.update({ ...permitido, atualizadaEm: new Date().toISOString() });
  const atualizado = await docRef.get();
  return atualizado.data() as Proposta;
}

export async function excluirProposta(id: string): Promise<boolean> {
  const docRef = propostasRef.doc(id);
  if (!(await docRef.get()).exists) return false;
  await docRef.delete();
  return true;
}

/** Quantas propostas estão ligadas a um vendedor — usado antes de excluir usuário. */
export async function contarPropostasDoVendedor(vendedorId: string): Promise<number> {
  const snap = await propostasRef.where("vendedorId", "==", vendedorId).count().get();
  return snap.data().count;
}
