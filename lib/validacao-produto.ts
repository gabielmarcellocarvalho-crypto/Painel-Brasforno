import { DadosProduto } from "./produtos";

// Documento do Firestore tem teto de 1 MiB. A foto vai embutida como data URL,
// então limitamos bem abaixo disso — o formulário já comprime antes de enviar.
export const LIMITE_FOTO_BYTES = 700 * 1024;

function limparLinhas(valor: unknown): string[] {
  if (Array.isArray(valor)) {
    return valor.map((l) => String(l).trim()).filter(Boolean);
  }
  return String(valor || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function validarFoto(foto: unknown): string {
  const url = String(foto || "").trim();
  if (!url) return "";

  if (url.startsWith("data:image/")) {
    if (url.length > LIMITE_FOTO_BYTES) {
      throw new Error(
        "A foto ficou grande demais. Use uma imagem menor (o envio pelo formulário já comprime automaticamente)."
      );
    }
    return url;
  }

  if (/^https?:\/\//i.test(url)) return url;

  throw new Error("A foto precisa ser um arquivo de imagem ou um endereço http(s).");
}

function numero(valor: unknown): number {
  const n = Number(valor);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

/** Converte o corpo cru da requisição em dados válidos de produto. */
export function normalizarEntradaProduto(body: Record<string, unknown>): DadosProduto {
  const nome = String(body.nome || "").trim();
  if (!nome) throw new Error("Informe o nome do produto.");

  const categoria = String(body.categoria || "").trim();
  if (!categoria) throw new Error("Selecione a categoria.");

  return {
    nome,
    categoria,
    codigo: String(body.codigo || "").trim() || undefined,
    ncm: String(body.ncm || "").trim(),
    unidade: String(body.unidade || "UNID").trim() || "UNID",
    precoTabela: numero(body.precoTabela),
    fotoUrl: validarFoto(body.fotoUrl),
    caracteristicas: limparLinhas(body.caracteristicas),
    descricaoComplementar: String(body.descricaoComplementar || "").trim(),
    ativo: body.ativo === undefined ? true : Boolean(body.ativo),
  };
}
