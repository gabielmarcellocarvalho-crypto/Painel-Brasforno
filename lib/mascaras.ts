// Máscaras "conforme digita" para os campos que têm formato oficial fixo.
// Cada função aceita o valor bruto do input (já com a tentativa de edição do
// usuário) e devolve o texto formatado, cortando dígitos excedentes — assim
// o campo nunca ultrapassa o tamanho do documento real (CNPJ, CEP, NCM…).
//
// O texto retornado é o que fica salvo no cadastro/proposta: os documentos
// gerados (orçamento, CSV) já saem com pontuação, sem precisar reformatar
// na hora de exibir.

function apenasDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

/** Junta segmentos não vazios com o separador correspondente entre eles. */
function juntarSegmentos(segmentos: string[], separadores: string[]): string {
  let out = segmentos[0] || "";
  for (let i = 1; i < segmentos.length; i++) {
    if (segmentos[i]) out += separadores[i - 1] + segmentos[i];
  }
  return out;
}

/** CPF (000.000.000-00) ou CNPJ (00.000.000/0000-00) — decide pelo tamanho. */
export function mascararCnpjCpf(valor: string): string {
  const d = apenasDigitos(valor).slice(0, 14);

  if (d.length <= 11) {
    return juntarSegmentos(
      [d.slice(0, 3), d.slice(3, 6), d.slice(6, 9), d.slice(9, 11)],
      [".", ".", "-"]
    );
  }
  return juntarSegmentos(
    [d.slice(0, 2), d.slice(2, 5), d.slice(5, 8), d.slice(8, 12), d.slice(12, 14)],
    [".", ".", "/", "-"]
  );
}

/** (00) 00000-0000 (celular) ou (00) 0000-0000 (fixo), conforme a digitação. */
export function mascararTelefone(valor: string): string {
  const d = apenasDigitos(valor).slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;

  const ddd = d.slice(0, 2);
  const resto = d.slice(2);
  const celular = d.length > 10;
  const meio = celular ? resto.slice(0, 5) : resto.slice(0, 4);
  const fim = celular ? resto.slice(5, 9) : resto.slice(4, 8);

  return fim ? `(${ddd}) ${meio}-${fim}` : `(${ddd}) ${meio}`;
}

/** 00000-000 */
export function mascararCep(valor: string): string {
  const d = apenasDigitos(valor).slice(0, 8);
  return juntarSegmentos([d.slice(0, 5), d.slice(5, 8)], ["-"]);
}

/** 0000.00.00 — Nomenclatura Comum do Mercosul. */
export function mascararNcm(valor: string): string {
  const d = apenasDigitos(valor).slice(0, 8);
  return juntarSegmentos([d.slice(0, 4), d.slice(4, 6), d.slice(6, 8)], [".", "."]);
}

// Tamanhos máximos do texto já formatado — usados no atributo maxLength dos
// inputs para travar a digitação sem depender só do onChange.
export const TAMANHO_MAX_CNPJ_CPF = 18; // "00.000.000/0000-00"
export const TAMANHO_MAX_TELEFONE = 16; // "(00) 00000-0000"
export const TAMANHO_MAX_CEP = 9; // "00000-000"
export const TAMANHO_MAX_NCM = 10; // "0000.00.00"
export const TAMANHO_MAX_INSCRICAO_ESTADUAL = 20; // formato varia por estado
