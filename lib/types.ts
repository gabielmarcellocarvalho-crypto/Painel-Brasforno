/* ── Usuários e permissões ──────────────────────────────────────────────── */

export type Papel = "admin" | "gestor" | "representante";

export const PAPEL_LABEL: Record<Papel, string> = {
  admin: "Administrador",
  gestor: "Diretoria / Gestão",
  representante: "Representante",
};

export const PAPEL_DESCRICAO: Record<Papel, string> = {
  admin:
    "Acesso total: todas as propostas, cadastro de produtos, usuários e exclusões.",
  gestor:
    "Acompanha todas as propostas e aprova/reprova internamente. Não gerencia usuários nem catálogo.",
  representante:
    "Cria e acompanha apenas as próprias propostas.",
};

export interface Usuario {
  id: string;
  nome: string;
  login: string; // e-mail ou usuário, sempre em minúsculas
  senhaHash: string; // scrypt — nunca sai do servidor
  papel: Papel;
  telefone?: string;
  ativo: boolean;
  criadoEm: string;
  ultimoAcesso?: string;
}

// Versão segura para enviar ao cliente (sem hash de senha).
export type UsuarioPublico = Omit<Usuario, "senhaHash">;

export interface Sessao {
  uid: string;
  nome: string;
  papel: Papel;
  exp: number; // epoch em segundos
}

/* ── Catálogo / cadastro de itens ───────────────────────────────────────── */

// Cada produto cadastrado é um item vendável com código próprio — mesma lógica
// do ERP da Brasforno, onde a linha do orçamento traz "000025 - FORNO ROTATIVO…".
export interface Produto {
  id: string;
  codigo: string; // 000025
  nome: string; // FORNO ROTATIVO GÁS - 220V - PEQUENO COM 01 CARRO 60x80
  categoria: string;
  ncm: string; // 8417.20.00
  unidade: string; // UNID
  precoTabela: number; // 0 = sem preço de tabela; representante informa
  fotoUrl: string; // data URL (upload) ou URL externa
  caracteristicas: string[]; // uma linha por característica técnica
  descricaoComplementar: string; // "acompanha 3 carros de forneio…"
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

/* ── Propostas ──────────────────────────────────────────────────────────── */

export type StatusProposta =
  | "rascunho"
  | "enviada"
  | "negociacao"
  | "ganha"
  | "perdida";

export type StatusAprovacaoInterna = "nao_requer" | "pendente" | "aprovada" | "reprovada";
export type StatusAprovacaoCliente = "pendente" | "aprovada" | "nao_aprovada";

export interface Cliente {
  nome: string;
  empresa: string;
  cnpjCpf?: string;
  inscricaoEstadual?: string;
  whatsapp: string;
  email?: string;
  endereco?: string;
  complemento?: string; // "ANDAR - VILA ELISA"
  bairro?: string;
  cidade: string;
  uf: string;
  cep?: string;
  segmento: string;
}

// Snapshot do cadastro no momento em que a proposta foi montada: o documento
// não pode mudar se o produto for editado depois.
export interface ItemProposta {
  produtoId: string;
  codigo: string;
  descricao: string;
  categoria: string;
  ncm: string;
  unidade: string;
  quantidade: number;
  precoUnitario: number;
  fotoUrl: string;
  caracteristicas: string[];
  descricaoComplementar: string;
}

export interface Parcela {
  numero: number;
  vencimento: string; // ISO (yyyy-mm-dd)
  valor: number;
}

// Despesas previstas (técnico de montagem, frete, obra civil…). São
// informativas: aparecem em "Outras Informações" e não entram no total.
export interface Despesa {
  descricao: string;
  responsavel: "Cliente" | "Brasforno";
  valor?: number;
}

export interface CondicoesComerciais {
  condicaoPagamento: string; // "CONDIÇÃO DE PAGAMENTO A COMBINAR"
  tipoVencimento: string; // "A Vista", "30/60/90 dias"…
  parcelas: Parcela[];
  previsaoFaturamento?: string; // ISO
  validadeDias: number;
  prazoEntrega: string;
  frete: "CIF" | "FOB" | "A combinar";
  descontoPercent: number;
  ipi: number; // em R$
  icmsSt: number; // em R$
  despesas: Despesa[];
  observacoes?: string;
}

export interface AprovacaoInterna {
  status: StatusAprovacaoInterna;
  porId?: string;
  porNome?: string;
  em?: string;
  observacao?: string;
}

export interface AprovacaoCliente {
  status: StatusAprovacaoCliente;
  em?: string;
  motivo?: string; // motivo da recusa
}

export interface Proposta {
  id: string;
  numero: string; // 961
  criadaEm: string;
  atualizadaEm: string;
  status: StatusProposta;

  // Dono da proposta — base de todo o controle de acesso.
  vendedorId: string;
  vendedorNome: string;
  criadaPorNome: string; // rodapé "Gerado em … por Brenda"

  cliente: Cliente;
  itens: ItemProposta[];
  condicoes: CondicoesComerciais;
  aprovacaoInterna: AprovacaoInterna;
  aprovacaoCliente: AprovacaoCliente;
}

// Desconto acima deste percentual exige aval do gestor antes de ir ao cliente.
export const LIMITE_DESCONTO_SEM_APROVACAO = 10;
