# Plataforma Brasforno — Central de Propostas

Plataforma interna para geração, envio e centralização de propostas comerciais
dos equipamentos Brasforno (fornos, amassadeiras, batedeiras e linha completa
de panificação).

## Rodar localmente

```bash
npm install
npm run dev
```

Abra **http://localhost:3000**.

## O que a plataforma faz

| Rota | Função |
|---|---|
| `/` | Painel: todas as propostas, funil de status, indicadores, filtros, busca, exportar CSV |
| `/nova` | Wizard em 4 passos: cliente → equipamentos → condições → revisão |
| `/proposta/[id]` | Documento da proposta (identidade Brasforno, print-ready) + envio via WhatsApp + status |
| `/catalogo` | Catálogo com templates padrão por equipamento (fichas de brasforno.com.br) |
| `/manual` | Manual interativo de treinamento dos representantes |

## Estrutura

```
app/            páginas e API routes (Next.js App Router)
components/     Sidebar, StatusBadge, BarraAcoes
lib/            catálogo/templates, tipos, persistência, utilitários
data/           seed.json (exemplos) → propostas.json (criado no 1º uso, fora do git)
docs/           fluxo documentado, manual impresso, tarefas pendentes
public/         logo e favicon Brasforno
```

## Documentação da entrega

- `docs/fluxo-de-proposta.md` — o fluxo automático documentado (briefing da Maria)
- `docs/manual-representante.md` — manual de uso para representantes
- `docs/tarefas-pendentes.md` — credenciais/integrações para a fase 2

Stack: Next.js 15 · React 19 · Tailwind CSS 4 · persistência local em JSON (piloto).
