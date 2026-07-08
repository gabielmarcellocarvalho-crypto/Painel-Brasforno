import { Proposta, StatusProposta } from "./types";

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function totalProposta(p: Proposta): number {
  const bruto = p.itens.reduce(
    (soma, item) => soma + item.precoUnitario * item.quantidade,
    0
  );
  return bruto * (1 - (p.condicoes.descontoPercent || 0) / 100);
}

export function subtotalProposta(p: Proposta): number {
  return p.itens.reduce(
    (soma, item) => soma + item.precoUnitario * item.quantidade,
    0
  );
}

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

export function somenteDigitos(s: string): string {
  return s.replace(/\D/g, "");
}

export function linkWhatsApp(proposta: Proposta, urlProposta: string): string {
  const fone = somenteDigitos(proposta.cliente.whatsapp);
  const foneCompleto = fone.length <= 11 ? `55${fone}` : fone;
  const texto = [
    `Olá, ${proposta.cliente.nome}! Aqui é da *Brasforno* 🔥`,
    ``,
    `Conforme conversamos, segue a proposta *${proposta.numero}* preparada especialmente para ${proposta.cliente.empresa}:`,
    ``,
    ...proposta.itens.map(
      (i) => `• ${i.quantidade}× ${i.produtoNome} — ${i.modelo}`
    ),
    ``,
    `📄 Proposta completa: ${urlProposta}`,
    ``,
    `Qualquer dúvida estou à disposição. Podemos agendar uma conversa?`,
  ].join("\n");
  return `https://wa.me/${foneCompleto}?text=${encodeURIComponent(texto)}`;
}

export function validadeProposta(p: Proposta): string {
  const d = new Date(p.criadaEm);
  d.setDate(d.getDate() + (p.condicoes.validadeDias || 15));
  return d.toLocaleDateString("pt-BR");
}
