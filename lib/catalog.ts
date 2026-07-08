// Catálogo Brasforno — dados extraídos de brasforno.com.br (dez/2024).
// Preços NÃO são públicos: o representante informa o valor na proposta.
// Tarefa pendente: substituir por tabela de preços oficial da fábrica.

export interface ModeloProduto {
  nome: string;
  detalhe?: string;
}

export interface Produto {
  id: string;
  nome: string;
  categoria: string;
  resumo: string;
  descricaoProposta: string; // texto padrão que entra na proposta
  modelos: ModeloProduto[];
  specs: Record<string, string>;
  beneficios: string[];
}

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
] as const;

export const CATALOGO: Produto[] = [
  {
    id: "forno-lastro-pnova",
    nome: "Forno de Lastro PNOVA",
    categoria: "Fornos",
    resumo: "Líder de mercado — nova geração da linha POMPÉIA, tecnologia aplicada e baixo consumo.",
    descricaoProposta:
      "O Forno de Lastro LINHA PNOVA é a evolução tecnológica da consagrada linha POMPÉIA. Projetado para o acabamento final e cozimento perfeito de produtos de panificação, confeitaria e cozinha em geral, entrega assamento uniforme com baixo consumo de energia.",
    modelos: [
      { nome: "PNOVA 4", detalhe: "4 assadeiras 58×70 cm" },
      { nome: "PNOVA 6", detalhe: "6 assadeiras 58×70 cm" },
      { nome: "PNOVA 9", detalhe: "9 assadeiras 58×70 cm" },
      { nome: "PNOVA 12", detalhe: "12 assadeiras 58×70 cm" },
    ],
    specs: {
      "Assadeiras": "58 × 70 cm (4 a 12 unidades)",
      "Alimentação": "220V / 380V Trifásico",
      "Peso": "298 a 1.770 kg conforme modelo",
      "Sistema": "Modular, com vaporização de caldeira",
      "Comando": "Digital Touch Screen com controlador LED",
    },
    beneficios: [
      "Chapa em aço inox 430",
      "Comando elétrico isolado IP 66",
      "Estrutura reforçada em chapa grossa",
      "Isolamento em fibra cerâmica e lã de rocha",
      "Porta de vidro temperado",
      "Resistências especiais de longa durabilidade",
      "Sistema modular expansível",
      "Garantia de 1 ano direto de fábrica",
    ],
  },
  {
    id: "forno-rotativo-rotor",
    nome: "Forno Rotativo ROTOR",
    categoria: "Fornos",
    resumo: "Sistema patenteado de queima com economia direta de até 40% sobre a concorrência.",
    descricaoProposta:
      "Os Fornos Rotativos LINHA ROTOR, fabricados no Brasil, possuem sistema exclusivo e patenteado de aquecimento que reduz o consumo em até 40% em relação a fornos rotativos com trocador de calor — com garantia de reposição de peças a pronto atendimento e preço justo.",
    modelos: [
      { nome: "ROTOR 01 Small — Gás", detalhe: "Assadeiras 60×80 cm" },
      { nome: "ROTOR 01 Small — Elétrico", detalhe: "Assadeiras 60×80 cm" },
      { nome: "ROTOR 01 Médio — Gás", detalhe: "Assadeiras 60×80 cm" },
      { nome: "ROTOR 01 Médio — Elétrico", detalhe: "Assadeiras 60×80 cm" },
      { nome: "ROTOR 02 Grand — Gás", detalhe: "Assadeiras 60×80 cm" },
      { nome: "ROTOR 02 Grand — Elétrico", detalhe: "Assadeiras 60×80 cm" },
    ],
    specs: {
      "Assadeiras": "60 × 80 cm",
      "Alimentação": "220V / 380V Trifásico",
      "Combustível": "Gás ou Elétrico",
      "Peso": "Até 1.800 kg",
      "Consumo": "Até 40% menor que fornos com trocador de calor",
    },
    beneficios: [
      "Sistema patenteado de queima — economia direta de 40%",
      "Chapa em aço inox 430",
      "Estrutura reforçada em chapa grossa",
      "Inversor com 4 velocidades",
      "Porta móvel em aço inox com vidro duplo",
      "Sistema de vaporização direta",
      "Fabricação nacional com reposição de peças imediata",
    ],
  },
  {
    id: "forno-turbo-virtus",
    nome: "Forno Turbo Virtus",
    categoria: "Fornos",
    resumo: "Alta produção: várias bandejas simultâneas em curto período de tempo.",
    descricaoProposta:
      "O Forno Turbo Virtus é ideal para cozinhar grandes quantidades de alimentos em curto período, permitindo assar várias bandejas simultaneamente sem transferência de sabores, com circulação forçada de ar quente e uniformidade de assamento.",
    modelos: [
      { nome: "Virtus 5", detalhe: "5 bandejas" },
      { nome: "Virtus 8", detalhe: "8 bandejas" },
      { nome: "Virtus 10", detalhe: "10 bandejas" },
    ],
    specs: {
      "Sistema": "Convecção turbo com circulação forçada",
      "Alimentação": "220V / 380V Trifásico",
      "Aplicação": "Panificação, confeitaria e food service",
    },
    beneficios: [
      "Assamento simultâneo de múltiplas bandejas",
      "Uniformidade sem transferência de sabores",
      "Estrutura em aço inox",
      "Baixo consumo energético",
      "Garantia de 1 ano direto de fábrica",
    ],
  },
  {
    id: "amassadeira-evo-pro",
    nome: "Amassadeira EVO PRO",
    categoria: "Amassadeiras",
    resumo: "Design exclusivo para trabalho pesado com controles de alta performance.",
    descricaoProposta:
      "As Amassadeiras Linha EVO PRO possuem design exclusivo e foram desenvolvidas para trabalho pesado, com sistemas de controle que auxiliam o operador para melhor performance na preparação das receitas.",
    modelos: [
      { nome: "EVO PRO 25", detalhe: "25 kg de massa" },
      { nome: "EVO PRO 40", detalhe: "40 kg de massa" },
      { nome: "EVO PRO 60", detalhe: "60 kg de massa" },
      { nome: "Linha T", detalhe: "Amassadeira convencional" },
      { nome: "Linha TR", detalhe: "Amassadeira rápida" },
    ],
    specs: {
      "Estrutura": "Reforçada em chapa grossa",
      "Ruído": "Baixo nível de ruído",
      "Motores": "Alta potência para trabalho contínuo",
    },
    beneficios: [
      "Baixo ruído",
      "Design ergonômico",
      "Estrutura reforçada em chapa grossa",
      "Motores fortes",
      "Garantia de 1 ano direto de fábrica",
    ],
  },
  {
    id: "batedeira-evo",
    nome: "Batedeira EVO / EVO-XT",
    categoria: "Batedeiras",
    resumo: "Linha profissional de batedeiras planetárias para confeitaria e panificação.",
    descricaoProposta:
      "A linha de Batedeiras EVO e EVO-XT da Brasforno foi desenvolvida para uso profissional intenso em confeitarias e padarias, com estrutura robusta, múltiplas velocidades e acessórios completos (globo, raquete e gancho).",
    modelos: [
      { nome: "EVO 12", detalhe: "Tacho 12 litros" },
      { nome: "EVO 20", detalhe: "Tacho 20 litros" },
      { nome: "EVO-XT 40", detalhe: "Tacho 40 litros" },
      { nome: "EVO-XT 60", detalhe: "Tacho 60 litros" },
    ],
    specs: {
      "Sistema": "Planetário com múltiplas velocidades",
      "Acessórios": "Globo, raquete e gancho inclusos",
      "Estrutura": "Aço reforçado",
    },
    beneficios: [
      "Múltiplas velocidades com inversor",
      "Tacho em aço inox",
      "Estrutura reforçada",
      "Baixa manutenção",
      "Garantia de 1 ano direto de fábrica",
    ],
  },
  {
    id: "divisora-manual",
    nome: "Divisora Manual",
    categoria: "Divisoras",
    resumo: "Divisão precisa e uniforme de massas com operação simples.",
    descricaoProposta:
      "A Divisora Manual Brasforno garante porcionamento uniforme da massa, aumentando a padronização da produção e reduzindo desperdícios, com operação simples e robustez para o dia a dia da padaria.",
    modelos: [{ nome: "Divisora 30 partes", detalhe: "Divisão em 30 porções iguais" }],
    specs: {
      "Divisões": "30 partes iguais",
      "Operação": "Manual por alavanca",
      "Estrutura": "Aço com pintura epóxi",
    },
    beneficios: [
      "Porcionamento padronizado",
      "Redução de desperdício de massa",
      "Operação simples e segura",
      "Garantia de 1 ano direto de fábrica",
    ],
  },
  {
    id: "divisora-volumetrica",
    nome: "Divisora Volumétrica",
    categoria: "Divisoras",
    resumo: "Divisão automática por volume para alta produção.",
    descricaoProposta:
      "A Divisora Volumétrica Brasforno automatiza o porcionamento de massas por volume, ideal para produções de média e alta escala que exigem velocidade e consistência de peso.",
    modelos: [{ nome: "Volumétrica Automática", detalhe: "Regulagem contínua de peso" }],
    specs: {
      "Sistema": "Divisão automática por volume",
      "Regulagem": "Peso ajustável em operação",
      "Aplicação": "Média e alta produção",
    },
    beneficios: [
      "Alta velocidade de porcionamento",
      "Consistência de peso",
      "Redução de mão de obra",
      "Garantia de 1 ano direto de fábrica",
    ],
  },
  {
    id: "modeladora-pao",
    nome: "Modeladora de Pão",
    categoria: "Modeladoras",
    resumo: "Modelagem uniforme para pão francês e similares.",
    descricaoProposta:
      "A Modeladora de Pão Brasforno (linha 500) entrega modelagem uniforme e delicada da massa, preservando a estrutura do glúten e garantindo padrão visual em toda a fornada.",
    modelos: [{ nome: "Modeladora 500", detalhe: "Boca de 500 mm" }],
    specs: {
      "Boca": "500 mm",
      "Rolos": "Revestimento antiaderente",
      "Estrutura": "Aço reforçado",
    },
    beneficios: [
      "Modelagem uniforme",
      "Preserva a estrutura da massa",
      "Fácil regulagem",
      "Garantia de 1 ano direto de fábrica",
    ],
  },
  {
    id: "cilindro-massa",
    nome: "Cilindro de Massa",
    categoria: "Cilindros",
    resumo: "Cilindragem eficiente com segurança NR-12.",
    descricaoProposta:
      "O Cilindro de Massa Brasforno (linha 500/600) proporciona refino e homogeneização da massa com produtividade e segurança, atendendo às exigências da NR-12.",
    modelos: [
      { nome: "Cilindro 500", detalhe: "Rolos de 500 mm" },
      { nome: "Cilindro 600", detalhe: "Rolos de 600 mm" },
    ],
    specs: {
      "Rolos": "500 ou 600 mm",
      "Segurança": "Grade de proteção NR-12",
      "Estrutura": "Aço reforçado",
    },
    beneficios: [
      "Refino homogêneo da massa",
      "Segurança NR-12",
      "Alta durabilidade",
      "Garantia de 1 ano direto de fábrica",
    ],
  },
  {
    id: "boleadora-massa",
    nome: "Boleadora de Massa",
    categoria: "Boleadoras",
    resumo: "Boleamento automático e padronizado.",
    descricaoProposta:
      "A Boleadora de Massa Brasforno automatiza o boleamento das porções, garantindo formato padronizado e agilidade na produção de pães.",
    modelos: [{ nome: "Boleadora Cônica", detalhe: "Boleamento contínuo" }],
    specs: {
      "Sistema": "Cônico contínuo",
      "Aplicação": "Pães de diversos pesos",
    },
    beneficios: [
      "Boleamento padronizado",
      "Agilidade na produção",
      "Estrutura robusta",
      "Garantia de 1 ano direto de fábrica",
    ],
  },
  {
    id: "fatiadeira-pao",
    nome: "Fatiadeira de Pão",
    categoria: "Fatiadeiras",
    resumo: "Fatiamento uniforme para pão de forma e similares.",
    descricaoProposta:
      "A Fatiadeira de Pão Brasforno garante fatias uniformes com rapidez e segurança, ideal para pães de forma, bisnagas e similares.",
    modelos: [{ nome: "Fatiadeira Semiautomática", detalhe: "Fatias uniformes" }],
    specs: {
      "Corte": "Lâminas de alta precisão",
      "Segurança": "Proteções conforme norma",
    },
    beneficios: [
      "Fatias uniformes",
      "Operação rápida e segura",
      "Garantia de 1 ano direto de fábrica",
    ],
  },
  {
    id: "moinho-pao",
    nome: "Moinho de Pão",
    categoria: "Moinhos",
    resumo: "Reaproveitamento de pães para farinha de rosca.",
    descricaoProposta:
      "O Moinho de Pão Brasforno transforma sobras de pão em farinha de rosca de qualidade, agregando receita e reduzindo desperdício na operação.",
    modelos: [{ nome: "Moinho Standard", detalhe: "Produção contínua" }],
    specs: {
      "Aplicação": "Farinha de rosca",
      "Estrutura": "Aço reforçado",
    },
    beneficios: [
      "Reduz desperdício",
      "Gera receita adicional",
      "Garantia de 1 ano direto de fábrica",
    ],
  },
  {
    id: "laminadora-massa",
    nome: "Laminadora de Massa",
    categoria: "Laminadoras",
    resumo: "Laminação precisa para folhados e confeitaria.",
    descricaoProposta:
      "A Laminadora de Massa Brasforno proporciona laminação precisa e progressiva, ideal para massas folhadas, croissants e confeitaria fina.",
    modelos: [{ nome: "Laminadora de Bancada" }, { nome: "Laminadora de Piso" }],
    specs: {
      "Regulagem": "Espessura progressiva",
      "Esteiras": "Reversíveis",
    },
    beneficios: [
      "Laminação uniforme",
      "Controle fino de espessura",
      "Garantia de 1 ano direto de fábrica",
    ],
  },
  {
    id: "resfriador-agua",
    nome: "Resfriador de Água",
    categoria: "Resfriadores",
    resumo: "Controle de temperatura da água para massas perfeitas.",
    descricaoProposta:
      "O Resfriador de Água Brasforno garante água gelada na temperatura exata para o preparo das massas, fator crítico para a qualidade e consistência da produção diária.",
    modelos: [
      { nome: "Resfriador 100L", detalhe: "100 litros" },
      { nome: "Resfriador 200L", detalhe: "200 litros" },
    ],
    specs: {
      "Capacidade": "100 a 200 litros",
      "Controle": "Termostato digital",
      "Reservatório": "Aço inox",
    },
    beneficios: [
      "Temperatura precisa da água",
      "Reservatório em aço inox",
      "Garantia de 1 ano direto de fábrica",
    ],
  },
  {
    id: "camara-climatica",
    nome: "Câmara Climática",
    categoria: "Câmaras Climáticas",
    resumo: "Fermentação controlada com temperatura e umidade programáveis.",
    descricaoProposta:
      "A Câmara Climática Brasforno controla temperatura e umidade da fermentação, permitindo programar a produção (fermentação retardada) e padronizar a qualidade dos pães em qualquer estação do ano.",
    modelos: [
      { nome: "Climática 20 esteiras" },
      { nome: "Climática 40 esteiras" },
    ],
    specs: {
      "Controle": "Temperatura e umidade programáveis",
      "Aplicação": "Fermentação controlada e retardada",
      "Estrutura": "Painéis isotérmicos",
    },
    beneficios: [
      "Produção programada (asse na hora certa)",
      "Padronização em qualquer clima",
      "Economia de mão de obra noturna",
      "Garantia de 1 ano direto de fábrica",
    ],
  },
];

export function getProduto(id: string): Produto | undefined {
  return CATALOGO.find((p) => p.id === id);
}

export function produtosPorCategoria(categoria: string): Produto[] {
  return CATALOGO.filter((p) => p.categoria === categoria);
}

export const EMPRESA = {
  nome: "Brasforno",
  razao: "Brasforno Equipamentos para Panificação",
  fundacao: 1992,
  endereco: "Santana do Parnaíba – SP",
  area: "Sede própria com 5.700 m²",
  site: "https://brasforno.com.br",
  instagram: "https://www.instagram.com/brasforno/",
  facebook: "https://www.facebook.com/brasforno",
  youtube: "https://www.youtube.com/user/Brasforno",
  garantia: "1 ano de garantia direto de fábrica",
  entrega: "Entrega em todo o território nacional",
  portfolio: "Mais de 150 modelos de equipamentos",
};

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
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];
