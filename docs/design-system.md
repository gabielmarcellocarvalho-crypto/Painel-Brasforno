# Sistema de Design v2 — "Forja Industrial"

> Fonte da verdade do design da Central de Propostas Brasforno.
> Gerado pelo FORGE com base no ui-ux-pro-max (padrão enterprise + micro-interações).

## Conceito

Plataforma interna B2B para representantes de equipamentos industriais de
panificação. Estética industrial-técnica: blueprint, aço e a brasa do forno.
Light mode only (uso comercial diurno, documentos impressos).

## Tokens de cor (Tailwind `@theme`, em `app/globals.css`)

| Token | Valor | Uso |
|---|---|---|
| `steel-600` | `#0C5782` | Primária da marca (site oficial) — ações secundárias, estrutura |
| `steel-900/950` | `#062538` / `#03141F` | Sidebar, cabeçalhos de tabela/documento |
| `steel-50–300` | tons claros | Superfícies, bordas, textos secundários |
| `ember-500` | `#E4581B` | AÇÃO PRIMÁRIA e acentos (CTA, faixa hazard, foco) — usar com parcimônia |
| `emerald-600` | verde | Exclusivo para "ganha" e WhatsApp |
| `paper` | `#F3F0E9` | Fundo (papel técnico) com grid blueprint |
| `ink` | `#101C26` | Texto principal |

Regra: âmbar nunca como cor de texto longo; contraste mínimo 4.5:1 (usar `ember-600/700` sobre claro).

## Tipografia

- **Ubuntu** (marca) — títulos `font-bold tracking-tight`, corpo `text-sm/relaxed`
- **Ubuntu Mono** — números, datas, valores, rótulos técnicos (`.tech-label`: 0.68rem, uppercase, tracking 0.18em)
- Escala de títulos de página: `text-3xl md:text-4xl font-bold tracking-tight`

## Componentes e utilitários

- `.panel` — cartão branco, sombra em camadas, borda azulada 8%
- `.panel-hover` — lift de 2px + sombra maior (200ms, transform/opacity apenas)
- `.hazard` — faixa de risco industrial (listras âmbar/aço a 45°) como acento de 1–2px de altura
- `.blueprint-bg` / `.blueprint-dark` — grid técnico duplo (28px + 112px)
- `.rise .rise-1..5` — entrada escalonada (0.5s, cubic-bezier suave)
- Ícones: SVG inline estilo Lucide em `components/Icons.tsx` — **nunca emoji estrutural**
- Cantos: `rounded-sm` (2px) — estética industrial, nada de raios grandes

## Interação e acessibilidade

- Micro-interações 150–300ms, só `transform`/`opacity`/cor
- `:focus-visible` global: anel âmbar 2px
- `prefers-reduced-motion`: desliga rise/pulse/hover-lift
- Touch targets ≥ 44px (`h-11` em botões/inputs, `h-9` mínimo em controles densos com espaçamento)
- `cursor-pointer` em tudo que é clicável; `aria-label` em botões só-ícone; `aria-current` na navegação
- Mobile: barra fixa superior com ícones (sidebar só ≥768px); `main` compensa com `pt-[60px]`

## Anti-padrões (proibidos)

- Emoji como ícone de UI
- Gradientes roxos / estética genérica de IA
- Hover com `scale` que desloca layout
- Texto `steel-400` ou mais claro sobre fundo claro (contraste insuficiente)
- Onboarding complexo — o wizard é o produto; máximo 4 passos
