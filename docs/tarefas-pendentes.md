# Tarefas Pendentes — Fase 2

> Itens que dependem de credenciais, decisões do cliente ou infraestrutura.
> Nenhum bloqueia o uso do piloto.

## Dependem do cliente (Brasforno)

- [ ] **Fotos dos produtos** — o cadastro está pronto e aceita upload em `/catalogo`,
      mas os 36 itens carregados pelo seed ainda estão sem foto. Enviar as fotos
      oficiais (uma por item) é o que faz a ficha do orçamento ficar completa.
- [ ] **Tabela de preços oficial** — o campo "preço de tabela" existe em cada item
      e pré-preenche a proposta, mas está zerado ("sob consulta"). Carregar os
      valores de fábrica em `/catalogo`.
- [ ] **Revisar o catálogo carregado** — nomes, NCM e características vieram de
      brasforno.com.br e foram divididos em itens vendáveis automaticamente.
      NCM só está preenchido nos fornos (8417.20.00, conforme o modelo do ERP);
      os demais precisam ser informados pelo fiscal.
- [ ] **Numeração dos orçamentos** — hoje a sequência do sistema está em 13. Se os
      orçamentos precisarem continuar a numeração do ERP (o modelo mostra o nº 961),
      basta ajustar `contadores/propostas.seq` no Firestore.
- [ ] **Definir quem aprova** descontos acima de 10% — hoje qualquer usuário com
      perfil Diretoria/Gestão ou Administrador pode liberar.

## Dependem de credenciais / contratação

- [ ] **WhatsApp Business API** (Meta Cloud API ou parceiro tipo Twilio/Z-API) — para
      envio automático da proposta sem abrir o WhatsApp Web. Hoje: link `wa.me`
      (zero custo, funciona já).
- [ ] **Hospedagem** — publicar em servidor acessível aos representantes (Vercel é o
      caminho natural para Next.js). Lembrar de configurar `AUTH_SECRET` e as
      credenciais do Firebase nas variáveis de ambiente do provedor.
- [ ] **Domínio** — ex.: propostas.brasforno.com.br.

## Concluídos na fase 2

- [x] **Banco de dados gerenciado** — Firestore (projeto `painel-brasforno`).
- [x] **Autenticação de representantes** — login e senha por usuário, sessão em
      cookie assinado, senhas com hash scrypt. Sem serviço externo.
- [x] **Controle de acesso por perfil** — Administrador (tudo), Diretoria/Gestão
      (acompanha e aprova) e Representante (só as próprias propostas).
- [x] **Cadastro de produtos** — foto, características técnicas, NCM, unidade e
      preço de tabela editáveis pelo administrador em `/catalogo`.
- [x] **Orçamento fiel ao modelo da Brasforno** — layout replicado de
      `modelo de proposta.pdf`, igual para todos os representantes.
- [x] **Foto e características na ficha do produto** dentro do orçamento.
- [x] **Despesas previstas** (técnico de montagem, frete, obra civil…) com
      responsável definido, no bloco de observações.
- [x] **Fluxo de aprovação** — aprovação interna da gestão + resultado do cliente
      (aprovada / não aprovada com motivo), com taxa de aprovação no painel.

## Melhorias técnicas futuras

- [ ] Edição de proposta existente (hoje: gerar nova versão).
- [ ] Geração de PDF server-side (hoje: imprimir → salvar como PDF).
- [ ] Relatório mensal automático (conversão por representante/região).
- [ ] Notificação de follow-up (propostas paradas em "Enviada" há mais de 2 dias).
- [ ] Recuperação de senha por e-mail (hoje o admin redefine em `/usuarios`).
- [ ] Importar leads direto de formulário público no site da Brasforno.
