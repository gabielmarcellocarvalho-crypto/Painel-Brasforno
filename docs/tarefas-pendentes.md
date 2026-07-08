# Tarefas Pendentes — Fase 2

> Itens que dependem de credenciais, decisões do cliente ou infraestrutura.
> Nenhum bloqueia o uso do piloto local.

## Dependem do cliente (Brasforno)

- [ ] **Tabela de preços oficial** — os preços dos equipamentos não são públicos no site. Hoje o representante digita o valor; ideal é carregar a tabela de fábrica em `lib/catalog.ts` (ou planilha importável) com preços sugeridos por modelo.
- [ ] **Validar textos dos templates** — descrições e diferenciais foram extraídos de brasforno.com.br; revisar com o time comercial (especialmente modelos estimados de Batedeira EVO, Virtus e Resfriador, marcados a partir de linhas citadas no site).
- [ ] **Dados cadastrais completos** — CNPJ, telefone comercial e e-mail para o rodapé da proposta.
- [ ] **Definir gerente aprovador** de descontos > 10% (hoje é só regra informativa).

## Dependem de credenciais / contratação

- [ ] **WhatsApp Business API** (Meta Cloud API ou parceiro tipo Twilio/Z-API) — para envio automático da proposta sem abrir o WhatsApp Web. Hoje: link `wa.me` (zero custo, funciona já).
- [ ] **Hospedagem** — publicar em servidor acessível aos representantes (Vercel é o caminho natural para Next.js; requer conta). Enquanto isso: rede local.
- [ ] **Banco de dados gerenciado** (Postgres/Supabase/Neon) — substituir `data/propostas.json` quando houver acesso multiusuário simultâneo.
- [ ] **Autenticação de representantes** (login individual) — necessária quando publicar na internet. Sugestão: Clerk ou NextAuth.
- [ ] **Domínio** — ex.: propostas.brasforno.com.br.

## Melhorias técnicas futuras

- [ ] Edição de proposta existente (hoje: gerar nova versão).
- [ ] Geração de PDF server-side (hoje: imprimir → salvar como PDF).
- [ ] Relatório mensal automático (taxa de conversão por representante/região).
- [ ] Notificação de follow-up (propostas paradas em "Enviada" há mais de 2 dias).
- [ ] Importar leads direto de formulário público no site da Brasforno.
