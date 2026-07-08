# Fluxo Automático de Proposta — Brasforno

> Entrega do briefing da Maria: padronizar a geração e o envio de propostas,
> capturando dados do cliente e centralizando informações.

## Diagnóstico

- Os melhores representantes usam materiais (propostas de forno); outros enviam apenas preço no WhatsApp.
- Sem padrão, informações de clientes se perdem em conversas soltas e a qualidade do atendimento varia.

## O fluxo novo (implementado na plataforma)

```
Cliente interessado (WhatsApp / telefone / feira / indicação)
        │
        ▼
[1] Representante abre a plataforma → "Nova Proposta"
        │
        ▼
[2] CAPTURA DE DADOS (formulário guiado em 4 passos)
    • Cliente: nome, empresa, WhatsApp, e-mail, cidade/UF, segmento
    • Equipamentos: categoria → produto → modelo/tamanho → qtde → preço
    • Condições: validade, prazo, frete, pagamento, desconto, observações
    • Revisão final
        │
        ▼
[3] GERAÇÃO AUTOMÁTICA da proposta
    • Número único sequencial (BF-ANO-XXXX)
    • Template do equipamento entra sozinho: texto comercial,
      especificações técnicas e diferenciais (dados de brasforno.com.br)
    • Documento com identidade visual Brasforno, pronto para imprimir/PDF
        │
        ▼
[4] ENVIO
    • Botão "Enviar via WhatsApp": mensagem formatada + link da proposta
    • Botão "Imprimir / PDF": salvar como PDF e anexar
    • Status muda automaticamente para "Enviada"
        │
        ▼
[5] CENTRALIZAÇÃO E ACOMPANHAMENTO
    • Painel único com todas as propostas do time
    • Funil: Rascunho → Enviada → Em negociação → Ganha / Perdida
    • Indicadores: propostas em aberto, valor em negociação, vendas ganhas
    • Exportação CSV para planilha compartilhada / reuniões comerciais
```

## Dados capturados por proposta

| Bloco | Campos |
|---|---|
| Cliente | nome do contato, empresa, WhatsApp, e-mail, cidade, UF, segmento |
| Equipamento | categoria, produto, modelo/tamanho, quantidade, preço unitário |
| Condições | validade (dias), prazo de entrega, frete (CIF/FOB), forma de pagamento, desconto %, observações |
| Gestão | nº da proposta, representante, data, status, histórico de atualização |

## Regras do processo

1. **Toda** proposta passa pela plataforma — nada de preço solto no WhatsApp.
2. Desconto acima de 10% exige aprovação do gerente comercial.
3. Follow-up em até 2 dias úteis após o envio (ver painel, filtro "Enviada").
4. Proposta perdida recebe o motivo nas observações.
5. Exportar CSV semanalmente para a reunião comercial.

## Plano de implantação com grupo piloto

| Semana | Ação |
|---|---|
| 1 | Apresentar o fluxo à equipe + treinar 2–3 representantes piloto (usar /manual) |
| 2–3 | Piloto usa a plataforma para 100% das propostas; coletar feedback |
| 4 | Ajustes (preços de tabela, textos dos templates) e rollout para todo o time |

## Arquitetura da plataforma

- **Next.js 15 + React 19 + Tailwind 4** rodando em servidor local (`npm run dev` → http://localhost:3000)
- Dados em `data/propostas.json` (piloto) — migração futura para banco gerenciado
- Catálogo e templates em `lib/catalog.ts` (fonte: brasforno.com.br, dez/2024)
- Sem credenciais ou serviços externos: o envio WhatsApp usa link `wa.me` (não requer API)
