// Dados cadastrais da Brasforno — conforme o cabeçalho do "Orçamento de Venda"
// oficial da empresa (modelo de proposta.pdf). Estes valores aparecem no topo
// de todo documento gerado e devem bater exatamente com o modelo do ERP.

export const EMPRESA = {
  razaoSocial: "BRASFORNO INDUSTRIA E COMERCIO LTDA",
  nomeFantasia: "Brasforno",
  cnpj: "68.947.308/0001-82",
  inscricaoEstadual: "623.011.662.113",
  endereco: "RUA RIO DE JANEIRO, 834",
  bairro: "CHACARA SOLAR",
  cidade: "Santana de Parnaíba",
  uf: "SP",
  cep: "06530-020",
  telefone: "(11) 97500-6577",
  site: "https://brasforno.com.br",
  fundacao: 1992,
} as const;

// Rótulo do documento — mantido igual ao do ERP para o cliente reconhecer.
export const TITULO_DOCUMENTO = "ORÇAMENTO DE VENDA";

// Categorias e unidades vivem aqui (módulo puro) e não em lib/produtos.ts,
// que fala com o Firestore e não pode ser importado por componentes de cliente.
export const CATEGORIAS = [
  "Fornos",
  "Amassadeiras",
  "Batedeiras",
  "Divisoras",
  "Modeladoras",
  "Cilindros",
  "Boleadoras",
  "Fatiadeiras",
  "Laminadoras",
  "Moinhos",
  "Resfriadores",
  "Câmaras Climáticas",
  "Acessórios",
  "Outros",
];

export const UNIDADES = ["UNID", "PÇ", "CJ", "KIT", "MT", "KG"];

export const SEGMENTOS = [
  "Padaria",
  "Confeitaria",
  "Supermercado",
  "Restaurante / Food Service",
  "Indústria Alimentícia",
  "Hotel / Buffet",
  "Outro",
];

export const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

// Despesas que o representante costuma esquecer de prever. Viram sugestões de
// um clique no passo de condições — pedido explícito do time comercial.
export const DESPESAS_SUGERIDAS: {
  descricao: string;
  responsavel: "Cliente" | "Brasforno";
}[] = [
  { descricao: "Despesa com técnico de montagem (deslocamento, hospedagem e alimentação)", responsavel: "Cliente" },
  { descricao: "Frete até o local de entrega", responsavel: "Cliente" },
  { descricao: "Montagem do equipamento", responsavel: "Brasforno" },
  { descricao: "Instalação elétrica e/ou hidráulica no local", responsavel: "Cliente" },
  { descricao: "Instalação e tubulação de gás", responsavel: "Cliente" },
  { descricao: "Obra civil e adequação do ambiente", responsavel: "Cliente" },
  { descricao: "Guindaste / içamento para descarga", responsavel: "Cliente" },
  { descricao: "Treinamento de operação da equipe", responsavel: "Brasforno" },
];
