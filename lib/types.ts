export type StatusProposta =
  | "rascunho"
  | "enviada"
  | "negociacao"
  | "ganha"
  | "perdida";

export interface ItemProposta {
  produtoId: string;
  produtoNome: string;
  categoria: string;
  modelo: string;
  quantidade: number;
  precoUnitario: number; // em reais
}

export interface Cliente {
  nome: string;
  empresa: string;
  whatsapp: string;
  email?: string;
  cidade: string;
  uf: string;
  segmento: string; // padaria, confeitaria, indústria, restaurante...
}

export interface CondicoesComerciais {
  validadeDias: number;
  prazoEntrega: string;
  frete: "CIF" | "FOB" | "A combinar";
  formaPagamento: string;
  descontoPercent: number;
  observacoes?: string;
}

export interface Proposta {
  id: string;
  numero: string; // BF-2026-0001
  criadaEm: string; // ISO
  atualizadaEm: string;
  status: StatusProposta;
  representante: string;
  cliente: Cliente;
  itens: ItemProposta[];
  condicoes: CondicoesComerciais;
}

export interface BancoDados {
  seq: number;
  propostas: Proposta[];
}
