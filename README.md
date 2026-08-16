# Plataforma Brasforno — Central de Propostas

Plataforma interna para geração, envio e centralização de orçamentos comerciais
dos equipamentos Brasforno (fornos, amassadeiras, batedeiras e linha completa
de panificação).

O documento gerado é uma réplica do **Orçamento de Venda** que a Brasforno já
emite pelo ERP (ver `modelo de proposta.pdf`) — mesmo layout para todos os
representantes.

## Rodar localmente

```bash
npm install
cp .env.local.example .env.local   # preencha as credenciais
npm run gerar:secret               # cole o AUTH_SECRET no .env.local
npm run dev
```

Abra **http://localhost:3000**. Sem nenhum usuário cadastrado, a tela de login
leva ao `/setup` para criar o primeiro administrador.

### Primeira carga de dados

```bash
npm run seed:produtos              # carrega o catálogo inicial (36 itens)
npm run criar:usuario -- "Nome" login@brasforno.com.br senha12345 admin
npm run migrate:propostas -- login@brasforno.com.br   # só se houver propostas antigas
```

`criar:usuario` também serve para **redefinir a senha** de quem perdeu o acesso —
rodar de novo com o mesmo login atualiza a senha.

## Perfis de acesso

| Perfil | Enxerga | Pode |
|---|---|---|
| **Administrador** | todas as propostas | tudo: catálogo, usuários, aprovações, exclusões |
| **Diretoria / Gestão** | todas as propostas | acompanhar resultados e aprovar/reprovar internamente |
| **Representante** | apenas as próprias | criar e acompanhar as suas propostas |

O escopo é aplicado **na consulta ao banco**, não só na tela: um representante
nunca recebe do servidor uma proposta que não é dele.

## Rotas

| Rota | Função |
|---|---|
| `/login`, `/setup` | Acesso e criação do primeiro administrador |
| `/` | Painel com escopo por perfil: indicadores, taxa de aprovação, abas (em aberto / aguardando gestão / aprovadas / não aprovadas), busca, CSV |
| `/nova` | Assistente em 4 passos: cliente → equipamentos → condições → revisão |
| `/proposta/[id]` | Orçamento de Venda print-ready + aprovações + envio via WhatsApp |
| `/catalogo` | Cadastro de itens: foto, características, NCM, unidade e preço de tabela |
| `/usuarios` | Gestão de usuários e perfis (só administrador) |
| `/manual` | Manual de treinamento dos representantes |

## Estrutura

```
app/            páginas e API routes (Next.js App Router)
components/     Sidebar, assistente, catálogo, usuários, aprovações
lib/            tipos, permissões, sessão, Firestore (propostas/produtos/usuários)
middleware.ts   barreira de sessão em todas as rotas
scripts/        seed do catálogo, criação de usuário, migrações
docs/           fluxo documentado, manual, tarefas pendentes
public/         logo e favicon Brasforno
```

## Como funciona o acesso

Sessão em cookie `httpOnly` assinado com HMAC-SHA256 (`AUTH_SECRET`), válido por
12 horas. Senhas guardadas com **scrypt** — nunca em texto puro e nunca enviadas
ao navegador. Sem dependência ou serviço externo de autenticação.

Trocar o `AUTH_SECRET` desloga todos os usuários imediatamente.

## Documentação da entrega

- `docs/fluxo-de-proposta.md` — o fluxo automático documentado (briefing da Maria)
- `docs/manual-representante.md` — manual de uso para representantes
- `docs/tarefas-pendentes.md` — o que falta para a fase 2
- `docs/design-system.md` — identidade visual da plataforma

Stack: Next.js 15 · React 19 · Tailwind CSS 4 · Firestore (`painel-brasforno`).
