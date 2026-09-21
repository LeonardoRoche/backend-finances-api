# Backend Finances API

API REST de finanças pessoais construída com **NestJS 12** e **PostgreSQL**. Integra com a **Pluggy** (Open Finance) para importar transações bancárias, categorizar movimentações e calcular métricas do dashboard.

## Funcionalidades

- **Conexões** — registrar contas conectadas via Pluggy
- **Transações** — CRUD, filtros por tipo/categoria/mês e detecção de transferências
- **Orçamentos** — limites por categoria com gasto calculado
- **Dashboard** — saldo, gastos, PIX/TED e resumo de cartões
- **Pluggy** — sync automático, webhook e recategorização (regras + IA opcional)

## Pré-requisitos

- Node.js 20+
- npm
- Docker (para PostgreSQL)

## Como rodar

1. Clone o repositório:

```bash
git clone git@github.com:LeonardoRoche/backend-finances-api.git
cd backend-finances-api
```

2. Instale as dependências:

```bash
npm install
```

3. Suba o banco de dados:

```bash
docker compose up -d
```

4. Configure as variáveis de ambiente:

```bash
cp .env.example .env
```

Preencha as credenciais da Pluggy no `.env`.

5. Inicie a API:

```bash
npm run start:dev
```

A API ficará disponível em [http://localhost:3001](http://localhost:3001).

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `DB_HOST` | Sim | Host do PostgreSQL |
| `DB_PORT` | Sim | Porta do PostgreSQL |
| `DB_USERNAME` | Sim | Usuário do banco |
| `DB_PASSWORD` | Sim | Senha do banco |
| `DB_DATABASE` | Sim | Nome do banco |
| `PORT` | Não | Porta da API (padrão: 3001) |
| `PLUGGY_CLIENT_ID` | Sim | Client ID da Pluggy |
| `PLUGGY_CLIENT_SECRET` | Sim | Client Secret da Pluggy |
| `PLUGGY_API_URL` | Não | URL da API Pluggy |
| `OPENAI_API_KEY` | Não | Habilita recategorização com IA |
| `OPENAI_MODEL` | Não | Modelo OpenAI (padrão: gpt-4o-mini) |

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run start:dev` | Desenvolvimento com hot reload |
| `npm run build` | Build de produção |
| `npm run start:prod` | Executa build compilado |
| `npm run test` | Testes unitários |
| `npm run test:e2e` | Testes end-to-end |

## Expor localmente (ngrok)

Use o template `ngrok.example.yml` como base. **Não commite** o arquivo `ngrok.yml` com seu authtoken.

```bash
cp ngrok.example.yml ngrok.yml
# Edite ngrok.yml com seu authtoken
ngrok start --all --config=ngrok.yml
```

## Repositório relacionado

- **Frontend:** [front-end-finances](https://github.com/LeonardoRoche/front-end-finances)
