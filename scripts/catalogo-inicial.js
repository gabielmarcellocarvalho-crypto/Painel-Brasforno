// Catálogo de partida — dados extraídos de brasforno.com.br.
//
// ATENÇÃO: é um ponto de partida para o cadastro, não a tabela oficial.
// Preços NÃO são públicos (ficam zerados: "sob consulta"), fotos precisam ser
// enviadas pelo admin e os textos devem ser revisados pelo time comercial.
// Depois de rodar o seed, tudo é editável em /catalogo.

const CATALOGO = [
  {
    nome: "Forno de Lastro PNOVA",
    categoria: "Fornos",
    ncm: "8417.20.00",
    descricao:
      "Evolução tecnológica da consagrada linha POMPÉIA. Projetado para o acabamento final e cozimento perfeito de produtos de panificação, confeitaria e cozinha em geral, entrega assamento uniforme com baixo consumo de energia.",
    modelos: [
      { nome: "PNOVA 4", detalhe: "4 assadeiras 58×70 cm" },
      { nome: "PNOVA 6", detalhe: "6 assadeiras 58×70 cm" },
      { nome: "PNOVA 9", detalhe: "9 assadeiras 58×70 cm" },
      { nome: "PNOVA 12", detalhe: "12 assadeiras 58×70 cm" },
    ],
    specs: {
      Assadeiras: "58 × 70 cm",
      Alimentação: "220V / 380V Trifásico",
      Peso: "298 a 1.770 kg conforme modelo",
      Sistema: "Modular, com vaporização de caldeira",
      Comando: "Digital Touch Screen com controlador LED",
      Estrutura: "Chapa em aço inox 430, isolamento em fibra cerâmica e lã de rocha",
    },
  },
  {
    nome: "Forno Rotativo ROTOR",
    categoria: "Fornos",
    ncm: "8417.20.00",
    descricao:
      "Sistema exclusivo e patenteado de aquecimento que reduz o consumo em até 40% em relação a fornos rotativos com trocador de calor. Fabricação nacional, com reposição de peças a pronto atendimento.",
    modelos: [
      { nome: "ROTOR 01 Small — Gás", detalhe: "Assadeiras 60×80 cm" },
      { nome: "ROTOR 01 Small — Elétrico", detalhe: "Assadeiras 60×80 cm" },
      { nome: "ROTOR 01 Médio — Gás", detalhe: "Assadeiras 60×80 cm" },
      { nome: "ROTOR 01 Médio — Elétrico", detalhe: "Assadeiras 60×80 cm" },
      { nome: "ROTOR 02 Grand — Gás", detalhe: "Assadeiras 60×80 cm" },
      { nome: "ROTOR 02 Grand — Elétrico", detalhe: "Assadeiras 60×80 cm" },
    ],
    specs: {
      Assadeiras: "60 × 80 cm",
      Alimentação: "220V / 380V Trifásico",
      Peso: "Até 1.800 kg",
      Consumo: "Até 40% menor que fornos com trocador de calor",
      Estrutura: "Chapa em aço inox 430, porta móvel com vidro duplo",
      Sistema: "Inversor com 4 velocidades e vaporização direta",
    },
  },
  {
    nome: "Forno Turbo Virtus",
    categoria: "Fornos",
    ncm: "8417.20.00",
    descricao:
      "Ideal para cozinhar grandes quantidades em curto período, assando várias bandejas simultaneamente sem transferência de sabores, com circulação forçada de ar quente.",
    modelos: [
      { nome: "Virtus 5", detalhe: "5 bandejas" },
      { nome: "Virtus 8", detalhe: "8 bandejas" },
      { nome: "Virtus 10", detalhe: "10 bandejas" },
    ],
    specs: {
      Sistema: "Convecção turbo com circulação forçada",
      Alimentação: "220V / 380V Trifásico",
      Aplicação: "Panificação, confeitaria e food service",
      Estrutura: "Aço inox",
    },
  },
  {
    nome: "Amassadeira EVO PRO",
    categoria: "Amassadeiras",
    ncm: "",
    descricao:
      "Design exclusivo desenvolvido para trabalho pesado, com sistemas de controle que auxiliam o operador na preparação das receitas.",
    modelos: [
      { nome: "EVO PRO 25", detalhe: "25 kg de massa" },
      { nome: "EVO PRO 40", detalhe: "40 kg de massa" },
      { nome: "EVO PRO 60", detalhe: "60 kg de massa" },
      { nome: "Linha T", detalhe: "Amassadeira convencional" },
      { nome: "Linha TR", detalhe: "Amassadeira rápida" },
    ],
    specs: {
      Estrutura: "Reforçada em chapa grossa",
      Ruído: "Baixo nível de ruído",
      Motores: "Alta potência para trabalho contínuo",
    },
  },
  {
    nome: "Batedeira EVO",
    categoria: "Batedeiras",
    ncm: "",
    descricao:
      "Linha profissional de batedeiras planetárias para uso intenso em confeitarias e padarias, com estrutura robusta, múltiplas velocidades e acessórios completos (globo, raquete e gancho).",
    modelos: [
      { nome: "EVO 12", detalhe: "Tacho 12 litros" },
      { nome: "EVO 20", detalhe: "Tacho 20 litros" },
      { nome: "EVO-XT 40", detalhe: "Tacho 40 litros" },
      { nome: "EVO-XT 60", detalhe: "Tacho 60 litros" },
    ],
    specs: {
      Sistema: "Planetário com múltiplas velocidades",
      Acessórios: "Globo, raquete e gancho inclusos",
      Estrutura: "Aço reforçado com tacho em inox",
    },
  },
  {
    nome: "Divisora Manual",
    categoria: "Divisoras",
    ncm: "",
    descricao:
      "Garante porcionamento uniforme da massa, aumentando a padronização da produção e reduzindo desperdícios, com operação simples e robustez para o dia a dia da padaria.",
    modelos: [{ nome: "30 partes", detalhe: "Divisão em 30 porções iguais" }],
    specs: {
      Divisões: "30 partes iguais",
      Operação: "Manual por alavanca",
      Estrutura: "Aço com pintura epóxi",
    },
  },
  {
    nome: "Divisora Volumétrica",
    categoria: "Divisoras",
    ncm: "",
    descricao:
      "Automatiza o porcionamento de massas por volume, ideal para produções de média e alta escala que exigem velocidade e consistência de peso.",
    modelos: [{ nome: "Automática", detalhe: "Regulagem contínua de peso" }],
    specs: {
      Sistema: "Divisão automática por volume",
      Regulagem: "Peso ajustável em operação",
      Aplicação: "Média e alta produção",
    },
  },
  {
    nome: "Modeladora de Pão",
    categoria: "Modeladoras",
    ncm: "",
    descricao:
      "Modelagem uniforme e delicada da massa, preservando a estrutura do glúten e garantindo padrão visual em toda a fornada.",
    modelos: [{ nome: "500", detalhe: "Boca de 500 mm" }],
    specs: {
      Boca: "500 mm",
      Rolos: "Revestimento antiaderente",
      Estrutura: "Aço reforçado",
    },
  },
  {
    nome: "Cilindro de Massa",
    categoria: "Cilindros",
    ncm: "",
    descricao:
      "Refino e homogeneização da massa com produtividade e segurança, atendendo às exigências da NR-12.",
    modelos: [
      { nome: "500", detalhe: "Rolos de 500 mm" },
      { nome: "600", detalhe: "Rolos de 600 mm" },
    ],
    specs: {
      Segurança: "Grade de proteção NR-12",
      Estrutura: "Aço reforçado",
    },
  },
  {
    nome: "Boleadora de Massa",
    categoria: "Boleadoras",
    ncm: "",
    descricao:
      "Automatiza o boleamento das porções, garantindo formato padronizado e agilidade na produção de pães.",
    modelos: [{ nome: "Cônica", detalhe: "Boleamento contínuo" }],
    specs: {
      Sistema: "Cônico contínuo",
      Aplicação: "Pães de diversos pesos",
    },
  },
  {
    nome: "Fatiadeira de Pão",
    categoria: "Fatiadeiras",
    ncm: "",
    descricao:
      "Fatias uniformes com rapidez e segurança, ideal para pães de forma, bisnagas e similares.",
    modelos: [{ nome: "Semiautomática", detalhe: "Fatias uniformes" }],
    specs: {
      Corte: "Lâminas de alta precisão",
      Segurança: "Proteções conforme norma",
    },
  },
  {
    nome: "Moinho de Pão",
    categoria: "Moinhos",
    ncm: "",
    descricao:
      "Transforma sobras de pão em farinha de rosca de qualidade, agregando receita e reduzindo desperdício na operação.",
    modelos: [{ nome: "Standard", detalhe: "Produção contínua" }],
    specs: {
      Aplicação: "Farinha de rosca",
      Estrutura: "Aço reforçado",
    },
  },
  {
    nome: "Laminadora de Massa",
    categoria: "Laminadoras",
    ncm: "",
    descricao:
      "Laminação precisa e progressiva, ideal para massas folhadas, croissants e confeitaria fina.",
    modelos: [{ nome: "de Bancada" }, { nome: "de Piso" }],
    specs: {
      Regulagem: "Espessura progressiva",
      Esteiras: "Reversíveis",
    },
  },
  {
    nome: "Resfriador de Água",
    categoria: "Resfriadores",
    ncm: "",
    descricao:
      "Garante água gelada na temperatura exata para o preparo das massas, fator crítico para a qualidade e consistência da produção diária.",
    modelos: [
      { nome: "100L", detalhe: "100 litros" },
      { nome: "200L", detalhe: "200 litros" },
    ],
    specs: {
      Controle: "Termostato digital",
      Reservatório: "Aço inox",
    },
  },
  {
    nome: "Câmara Climática",
    categoria: "Câmaras Climáticas",
    ncm: "",
    descricao:
      "Controla temperatura e umidade da fermentação, permitindo programar a produção (fermentação retardada) e padronizar a qualidade dos pães em qualquer estação do ano.",
    modelos: [{ nome: "20 esteiras" }, { nome: "40 esteiras" }],
    specs: {
      Controle: "Temperatura e umidade programáveis",
      Aplicação: "Fermentação controlada e retardada",
      Estrutura: "Painéis isotérmicos",
    },
  },
];

/**
 * Junta o nome do produto com o do modelo sem repetir palavras.
 * "Forno de Lastro PNOVA" + "PNOVA 4" -> "FORNO DE LASTRO PNOVA 4"
 */
function montarDescricao(nomeProduto, nomeModelo) {
  const jaPresentes = new Set(nomeProduto.toLowerCase().split(/\s+/));
  const restante = nomeModelo
    .split(/\s+/)
    .filter((token, i, todos) => {
      // Só descarta os tokens iniciais que já aparecem no nome do produto.
      const anterioresTodosDescartados = todos
        .slice(0, i)
        .every((t) => jaPresentes.has(t.toLowerCase()));
      return !(anterioresTodosDescartados && jaPresentes.has(token.toLowerCase()));
    })
    .join(" ");

  return `${nomeProduto} ${restante}`.replace(/\s+/g, " ").trim().toUpperCase();
}

/** Expande o catálogo em itens vendáveis, um por modelo — como no ERP. */
function gerarItens() {
  const itens = [];

  for (const produto of CATALOGO) {
    const caracteristicasBase = Object.entries(produto.specs).map(
      ([chave, valor]) => `${chave.toUpperCase()}: ${valor}`
    );

    for (const modelo of produto.modelos) {
      itens.push({
        nome: montarDescricao(produto.nome, modelo.nome),
        categoria: produto.categoria,
        ncm: produto.ncm,
        unidade: "UNID",
        precoTabela: 0, // preços não são públicos — o admin preenche a tabela
        fotoUrl: "", // foto enviada pelo admin em /catalogo
        caracteristicas: modelo.detalhe
          ? [`CAPACIDADE: ${modelo.detalhe}`, ...caracteristicasBase]
          : caracteristicasBase,
        descricaoComplementar: produto.descricao,
        ativo: true,
      });
    }
  }

  return itens;
}

module.exports = { gerarItens };
