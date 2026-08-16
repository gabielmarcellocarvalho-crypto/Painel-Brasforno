import { Papel } from "./types";

// Regras de "quem pode o quê". Módulo puro de propósito: é usado tanto no
// servidor (onde decide de verdade) quanto na interface (onde só esconde
// botões). Nada de segredo ou dependência de runtime aqui.

/** Vê propostas de todo mundo? Representante só vê as próprias. */
export function vePropostasDeTodos(papel: Papel): boolean {
  return papel === "admin" || papel === "gestor";
}

/** Pode aprovar ou reprovar internamente (desconto acima da alçada). */
export function podeAprovarInternamente(papel: Papel): boolean {
  return papel === "admin" || papel === "gestor";
}

/** Pode cadastrar/editar produtos do catálogo. */
export function podeGerenciarCatalogo(papel: Papel): boolean {
  return papel === "admin";
}

/** Pode criar, editar e desativar usuários. */
export function podeGerenciarUsuarios(papel: Papel): boolean {
  return papel === "admin";
}

/** Pode excluir uma proposta em definitivo. */
export function podeExcluirPropostas(papel: Papel): boolean {
  return papel === "admin";
}

/** Pode criar novas propostas. Gestor acompanha, não vende. */
export function podeCriarPropostas(papel: Papel): boolean {
  return papel === "admin" || papel === "representante";
}
