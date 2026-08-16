import {
  LIMITE_DESCONTO_SEM_APROVACAO,
  Proposta,
  StatusAprovacaoCliente,
  StatusAprovacaoInterna,
  StatusProposta,
} from "./types";

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Só o número, sem "R$" — usado nas colunas da tabela do orçamento. */
export function formatarNumero(valor: number, casas = 2): string {
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}

export function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** "05/01/2026 às 13:39:59" — formato do rodapé do orçamento. */
export function formatarDataHora(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString("pt-BR")} às ${d.toLocaleTimeString("pt-BR", {
    hour12: false,
  })}`;
}

/** Data em yyyy-mm-dd (input date) para dd/mm/aaaa, sem susto de fuso horário. */
export function formatarDataSimples(data: string): string {
  if (!data) return "—";
  const [ano, mes, dia] = data.split("-");
  return dia && mes && ano ? `${dia}/${mes}/${ano}` : data;
}

export function hojeISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function somarDias(dataISO: string, dias: number): string {
  const d = new Date(`${dataISO}T12:00:00`);
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

/* ── Cálculos da proposta ─────────────────────────────────────────────────── */

export function subtotalProposta(p: Proposta): number {
  return p.itens.reduce((s, i) => s + i.precoUnitario * i.quantidade, 0);
}

export function descontoProposta(p: Proposta): number {
  return subtotalProposta(p) * ((p.condicoes.descontoPercent || 0) / 100);
}

/** Total do documento: itens − desconto + IPI + ICMS ST. Despesas não entram. */
export function totalProposta(p: Proposta): number {
  return (
    subtotalProposta(p) -
    descontoProposta(p) +
    (p.condicoes.ipi || 0) +
    (p.condicoes.icmsSt || 0)
  );
}

export function validadeProposta(p: Proposta): string {
  const d = new Date(p.criadaEm);
  d.setDate(d.getDate() + (p.condicoes.validadeDias || 15));
  return d.toLocaleDateString("pt-BR");
}

export function exigeAprovacaoInterna(descontoPercent: number): boolean {
  return descontoPercent > LIMITE_DESCONTO_SEM_APROVACAO;
}

/* ── Rótulos ──────────────────────────────────────────────────────────────── */

export const STATUS_LABEL: Record<StatusProposta, string> = {
  rascunho: "Rascunho",
  enviada: "Enviada",
  negociacao: "Em negociação",
  ganha: "Ganha",
  perdida: "Perdida",
};

export const STATUS_ORDEM: StatusProposta[] = [
  "rascunho",
  "enviada",
  "negociacao",
  "ganha",
  "perdida",
];

export const APROVACAO_INTERNA_LABEL: Record<StatusAprovacaoInterna, string> = {
  nao_requer: "Não requer aprovação",
  pendente: "Aguardando gestor",
  aprovada: "Aprovada pelo gestor",
  reprovada: "Reprovada pelo gestor",
};

export const APROVACAO_CLIENTE_LABEL: Record<StatusAprovacaoCliente, string> = {
  pendente: "Aguardando cliente",
  aprovada: "Aprovada pelo cliente",
  nao_aprovada: "Não aprovada",
};

export const MOTIVOS_RECUSA = [
  "Preço acima do orçamento do cliente",
  "Fechou com concorrente",
  "Prazo de entrega incompatível",
  "Condição de pagamento não atendida",
  "Projeto adiado / sem verba no momento",
  "Sem retorno do cliente",
  "Outro",
];

/* ── WhatsApp ─────────────────────────────────────────────────────────────── */

export function somenteDigitos(s: string): string {
  return s.replace(/\D/g, "");
}

export function linkWhatsApp(proposta: Proposta, urlProposta: string): string {
  const fone = somenteDigitos(proposta.cliente.whatsapp);
  const foneCompleto = fone.length <= 11 ? `55${fone}` : fone;
  const texto = [
    `Olá, ${proposta.cliente.nome}! Aqui é da *Brasforno* 🔥`,
    ``,
    `Conforme conversamos, segue o *Orçamento de Venda nº ${proposta.numero}* preparado para ${proposta.cliente.empresa}:`,
    ``,
    ...proposta.itens.map((i) => `• ${i.quantidade}× ${i.descricao}`),
    ``,
    `💰 Total: *${formatarMoeda(totalProposta(proposta))}*`,
    `📄 Orçamento completo: ${urlProposta}`,
    ``,
    `Qualquer dúvida estou à disposição. Podemos agendar uma conversa?`,
  ].join("\n");
  return `https://wa.me/${foneCompleto}?text=${encodeURIComponent(texto)}`;
}

export function iniciais(nome: string): string {
  return nome
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
