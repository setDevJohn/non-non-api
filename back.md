# BACK-END DOCUMENTATION
# APP FITNESS COMPETITIVO
## NestJS + Prisma + PostgreSQL

---

# OBJETIVO

Este documento define:

- Arquitetura backend
- Estrutura modular
- Padrões técnicos
- Regras de negócio server-side
- Estrutura de banco
- Fluxos de autenticação
- Estratégia de escalabilidade
- Módulo principal do app
- Módulo financeiro separado

O sistema deve ser construído com:

- NestJS
- Prisma ORM
- PostgreSQL
- TypeScript

---

# DOCUMENTAÇÃO 1
# CORE BACKEND (SEM MÓDULO FINANCEIRO)

---

# OBJETIVOS DO CORE

Responsável por:

- Usuários
- Eventos
- Feed social
- Ranking
- Hidratação
- Conquistas
- Notificações
- Gamificação
- Registro de treinos

SEM:

- Carteira
- PIX
- Transações
- Pagamentos
- Reembolsos

O módulo financeiro deve permanecer desacoplado.

---

# STACK

## Backend

- NestJS
- Prisma ORM
- PostgreSQL
- TypeScript
- JWT
- bcrypt
- Zod ou class-validator
- Swagger
- Redis (futuro)
- BullMQ (futuro)

---

# ARQUITETURA

## Padrão

Arquitetura modular baseada em domínio.

Cada módulo deve possuir:

- controller
- service
- repository/provider
- dto
- entities/types
- validations
- tests

---

# ESTRUTURA DE PASTAS

```txt
src/
 ┣ modules/
 ┃ ┣ auth/
 ┃ ┣ users/
 ┃ ┣ events/
 ┃ ┣ workouts/
 ┃ ┣ hydration/
 ┃ ┣ feed/
 ┃ ┣ rankings/
 ┃ ┣ badges/
 ┃ ┣ notifications/
 ┃ ┣ social/
 ┃ ┗ admin/
 ┣ common/
 ┃ ┣ decorators/
 ┃ ┣ guards/
 ┃ ┣ filters/
 ┃ ┣ interceptors/
 ┃ ┣ pipes/
 ┃ ┗ exceptions/
 ┣ config/
 ┣ database/
 ┣ prisma/
 ┣ utils/
 ┣ types/
 ┣ jobs/
 ┗ main.ts
```

---

# PADRÕES OBRIGATÓRIOS

## Código

- SOLID
- Clean Architecture principles
- DTO validation
- Strong typing
- Repository pattern
- Services desacoplados
- Exceptions padronizadas
- Response patterns

---

# AUTENTICAÇÃO

## Estratégia

JWT Access Token.

---

## Funcionalidades

- Cadastro
- Login
- Refresh token
- Logout
- Recuperação senha
- Verificação email (futuro)

---

## Regras

### Email:
- único

### Senha:
- hash bcrypt
- nunca retornar para client

---

# MÓDULO USERS

## Responsável por:

- Perfil
- Dados físicos
- Estatísticas
- Conquistas do usuário

---

## Campos principais

- id
- name
- email
- passwordHash
- photoUrl
- heightCm
- weightKg
- hydrationMode
- hydrationGoalMl
- birthDate

---

## Regras

### Meta de água:

Calculada automaticamente:

- 28ml/kg
- 35ml/kg

---

## Endpoints

### GET /users/me
### PATCH /users/me
### GET /users/:id

---

# MÓDULO EVENTS

## Responsável por:

- Criação eventos
- Participantes
- Admins
- Convites
- Status do evento

---

## Estados do evento

- draft
- waiting_confirmation
- ready
- active
- finished
- cancelled

---

## Regras

### Evento inicia somente quando:

- todos confirmarem

---

## Participantes

Todos admins possuem mesmo nível.

---

## Funcionalidades

- Criar evento
- Convidar participantes
- Remover participantes
- Promover admin
- Feed do evento
- Ranking do evento

---

## Endpoints

### POST /events
### GET /events
### GET /events/:id
### POST /events/:id/invite
### PATCH /events/:id/promote
### DELETE /events/:id/participants/:userId

---

# MÓDULO WORKOUTS

## Responsável por:

- Registro treino
- Pontuação
- Validação

---

## Regras principais

### Apenas 1 treino válido por dia.

Constraint obrigatória:

```sql
UNIQUE(user_id, workout_date)
```

---

## Campos

- workoutType
- duration
- notes
- imageUrl
- pointsEarned

---

## Pontuação

### Segunda:
+2

### Ter–Qui:
+1

### Sexta:
+2

---

## Recuperação fim de semana

Apenas:

- usuário abaixo da média
- usuário treinou ao menos 1x na semana

---

## Endpoints

### POST /workouts
### GET /workouts/me
### GET /events/:id/workouts

---

# MÓDULO HYDRATION

## Responsável por:

- Registro água
- Meta diária
- Bonus hidratação

---

## Regras

### Meta batida:
+1 ponto

### Treino + água:
bonus adicional

---

## Funcionalidades

- Registro progressivo
- Histórico
- Meta diária

---

## Endpoints

### POST /hydration
### GET /hydration/me
### GET /hydration/today

---

# MÓDULO FEED

## Responsável por:

- Feed social
- Posts
- Comentários
- Curtidas
- Interações

---

## Regras

### Workout gera post.

### Atualização hidratação pode gerar post.

---

## Funcionalidades

- Feed global
- Feed evento
- Feed usuário

---

## Endpoints

### GET /feed
### POST /posts/:id/like
### POST /posts/:id/comment

---

# MÓDULO BADGES

## Responsável por:

- Conquistas
- Progressão
- Tier badges

---

## Estrutura

### Tier:
- bronze
- prata
- ouro

---

## Regras

### Badge:

- possui progresso
- pode evoluir
- nome adaptado masc/fem

---

## Exemplos

### Água
- Peixinho Fora D'Água
- Guardião das Marés
- Último Dobrador de Água

---

# MÓDULO RANKINGS

## Responsável por:

- Ranking semanal
- Ranking evento
- Posição usuário

---

## Regras

### Desempate

1. Mais treinos
2. Mais metas água
3. Maior consistência
4. Primeiro a atingir pontuação

---

# MÓDULO NOTIFICATIONS

## Responsável por:

- Push
- Alertas
- Recuperação
- Social

---

## Tipos

### Sistema
- hora treinar
- meta água
- recuperação disponível

### Social
- curtidas
- comentários
- ultrapassagem ranking

### Evento
- convite
- início evento
- finalização

---

# MÓDULO SOCIAL

## Responsável por:

- Curtidas
- Comentários
- Reações
- Interações sociais

---

# MÓDULO ADMIN

## Responsável por:

- Banimentos
- Remoção fraude
- Moderação

---

## Regras

### Fraude:

- invalida pontos
- remove badge
- possível banimento

---

# PRISMA

## Estratégia

Separar schema por domínio futuramente.

---

## Organização inicial

```txt
prisma/
 ┣ schema.prisma
 ┣ migrations/
 ┗ seed.ts
```

---

# BANCO DE DADOS

## PostgreSQL

Recomendado:

- UUID primary keys
- timestamps em UTC
- soft delete onde necessário
- índices em rankings
- índices compostos

---

# PRINCIPAIS TABELAS

- users
- events
- event_participants
- workouts
- hydration_logs
- posts
- comments
- likes
- badges
- user_badges
- notifications

---

# PERFORMANCE

## Futuro

- Redis cache
- Queue notifications
- Feed pagination
- Image CDN
- Ranking cache

---

# SEGURANÇA

## Obrigatório

- Rate limit
- JWT guard
- DTO validation
- Input sanitization
- Upload validation
- File size limit
- Helmet
- CORS

---

# TESTES

## Obrigatório

- unit tests
- integration tests
- e2e tests

---

# DOCUMENTAÇÃO API

## Swagger

Obrigatório.

Endpoints documentados.

---

# ESCALABILIDADE

Sistema preparado para:

- microservices futuros
- filas
- websocket
- realtime ranking
- analytics
- sistema financeiro separado

---

# DOCUMENTAÇÃO 2
# MÓDULO FINANCEIRO (SEPARADO)

---

# OBJETIVO

Módulo completamente desacoplado do core.

Responsável apenas por:

- pagamentos
- carteira
- transações
- premiações
- reembolsos

---

# ARQUITETURA

## Recomendação

Microserviço separado futuramente.

Inicialmente:

NestJS module isolado.

---

# ESTRUTURA

```txt
src/modules/finance/
 ┣ wallet/
 ┣ payments/
 ┣ payouts/
 ┣ refunds/
 ┣ transactions/
 ┣ gateways/
 ┗ anti-fraud/
```

---

# RESPONSABILIDADES

## Wallet

- saldo usuário
- histórico
- bloqueios

---

## Payments

- entrada evento
- confirmação pagamento
- status pagamento

---

## Payouts

- distribuição prêmio
- premiação automática

---

## Refunds

- reembolso
- cancelamentos

---

## Transactions

- logs financeiros
- auditoria

---

# GATEWAYS

## Futuro

- Mercado Pago
- Stripe
- PIX

---

# REGRAS

## Evento

### Antes início:

participante pode sair conforme regra.

---

### Durante evento:

saldo bloqueado.

---

### Final:

premiação automática.

---

# SEGURANÇA FINANCEIRA

## Obrigatório

- logs imutáveis
- idempotência
- auditoria
- antifraude
- verificação webhook
- assinatura transações

---

# TABELAS FINANCEIRAS

- wallets
- wallet_transactions
- payments
- payment_attempts
- payouts
- refunds
- financial_logs

---

# EXEMPLO WALLET

## Campos

- id
- userId
- balance
- blockedBalance
- createdAt

---

# EXEMPLO PAYMENTS

## Campos

- id
- userId
- eventId
- amount
- status
- gateway
- externalId
- paidAt

---

# EXEMPLO PAYOUTS

## Campos

- id
- userId
- eventId
- amount
- position
- processedAt

---

# ANTIFRAUDE

## Estratégias

- múltiplas tentativas
- contas suspeitas
- abuso reembolso
- eventos fraudulentos

---

# WEBHOOKS

## Necessário

- confirmação pagamento
- falha pagamento
- chargeback
- cancelamento

---

# ESCALABILIDADE

Módulo preparado para:

- múltiplos gateways
- split payment
- assinaturas premium
- saque automático
- marketplace futuro

---

# OBSERVAÇÃO FINAL

O sistema financeiro deve permanecer desacoplado do núcleo principal para:

- facilitar MVP
- reduzir complexidade inicial
- melhorar segurança
- permitir escalabilidade futura
- evitar acoplamento crítico

---

# ATUALIZAÇÕES RECENTES

## Módulos Implementados

### Feed Module
- Service com métodos para feed global, por evento, por usuário
- Controller com endpoints para likes, comentários
- DTO para comentários
- Paginação implementada
- Posts gerados automaticamente por workouts e hidratação

### Badges Module
- Service com verificação automática de badges
- Controller para listagem e verificação
- Lógica de progresso baseada em critérios
- Sistema de tiers (bronze, prata, ouro)
- Badges podem evoluir com progresso

### Notifications Module
- Service com tipos de notificações (sistema, social, evento)
- Controller para gerenciamento de notificações
- Helper methods para diferentes tipos de notificações
- Contagem de notificações não lidas
- Marcar como lida individualmente ou em massa

### Rankings Module
- Service com ranking semanal e por evento
- Lógica de desempate (treinos, metas água, consistência)
- Controller para consultas de ranking
- Posição atual do usuário
- Ranking global e por evento

## Lógica de Pontuação Atualizada

### Recuperação Fim de Semana
- Implementada no módulo Workouts
- Verifica se usuário está abaixo da média semanal
- Verifica se usuário treinou ao menos 1x na semana
- Se qualificado: +1 ponto nos dias de fim de semana
- Método `canDoWeekendRecovery()` verifica elegibilidade

### Pontuação por Meta de Água
- Implementada no módulo Hydration
- Verifica se meta diária foi atingida
- Atribui +1 ponto automaticamente
- Cria post no feed social
- Evita duplicação de pontos no mesmo dia
- Método `checkAndAwardHydrationPoints()` gerencia a lógica

## Endpoints Adicionados

### Feed
- GET /feed/global - Feed global com paginação
- GET /feed/event/:eventId - Feed por evento
- GET /feed/user/:userId - Feed por usuário
- POST /feed/:postId/like - Curtir/descuritar post
- POST /feed/:postId/comment - Comentar post
- GET /feed/:postId/comments - Listar comentários

### Badges
- GET /badges - Listar todas badges disponíveis
- GET /badges/me - Listar badges do usuário
- GET /badges/:id - Obter badge por ID
- POST /badges/check/:userId - Verificar e conceder badges

### Notifications
- GET /notifications/me - Listar notificações do usuário
- POST /notifications/:id/read - Marcar como lida
- POST /notifications/read-all - Marcar todas como lidas
- DELETE /notifications/:id - Deletar notificação

### Rankings
- GET /rankings/weekly - Ranking semanal
- GET /rankings/event/:eventId - Ranking por evento
- GET /rankings/position/me - Posição atual do usuário

