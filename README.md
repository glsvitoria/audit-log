# 📋 Audit Log API

API de auditoria para registro e consulta de logs de ações em sistemas empresariais.

## 🚀 Tecnologias

- **NestJS** - Framework Node.js
- **Prisma** - ORM para PostgreSQL
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas
- **class-validator** - Validação de DTOs

## 📦 Instalação

```bash
# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env

# Rodar migrações do banco
pnpm prisma migrate dev

# Gerar cliente Prisma
pnpm prisma generate
```

## 🔧 Configuração

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/audit_log"
ACCESS_TOKEN_SECRET="seu-secret-jwt-aqui"
PORT=3000
```

## 🏃 Executando

```bash
# Desenvolvimento
pnpm start:dev

# Produção
pnpm build
pnpm start:prod
```

## 📚 Estrutura da API

### Autenticação

#### POST `/auth/login`

Autenticação de usuários (Admin ou Enterprise)

```json
{
	"email": "user@example.com",
	"password": "senha123"
}
```

**Resposta:**

```json
{
	"access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Empresas (Enterprise)

Rotas protegidas por JWT (apenas ADMIN)

#### POST `/enterprise`

Criar nova empresa

```json
{
	"corporateReason": "Empresa LTDA",
	"email": "empresa@example.com",
	"responsibleName": "João Silva",
	"password": "senha123",
	"confirmPassword": "senha123"
}
```

**Resposta:**

```json
{
	"apiKey": "ak_1234567890abcdef..."
}
```

#### GET `/enterprise`

Listar empresas com paginação

**Query params:**

- `page` (opcional): número da página
- `limit` (opcional): itens por página
- `corporateReason` (opcional): filtro por razão social
- `email` (opcional): filtro por email

#### PUT `/enterprise/:enterpriseId`

Atualizar empresa

#### PATCH `/enterprise/:enterpriseId`

Desabilitar empresa

#### DELETE `/enterprise/:enterpriseId`

Deletar empresa (soft delete)

---

### API Keys

Rotas protegidas por JWT

#### POST `/api-key` (ADMIN)

Criar API Key para empresa

```json
{
	"enterpriseId": "uuid-da-empresa",
	"description": "Chave para produção"
}
```

#### POST `/api-key/enterprise` (ENTERPRISE)

Empresa criar sua própria API Key

```json
{
	"description": "Chave para homologação"
}
```

#### GET `/api-key`

Listar API Keys

#### PUT `/api-key/:apiKeyId`

Atualizar API Key

#### PATCH `/api-key/:apiKeyId`

Desabilitar API Key

#### DELETE `/api-key/:apiKeyId`

Deletar API Key

---

### Logs

Rotas protegidas por API Key (header `x-api-key`)

#### POST `/log`

Criar novo log de auditoria

```json
{
	"action": "CREATE",
	"entity": "User",
	"entityId": "uuid-do-usuario",
	"actorRole": "ADMIN",
	"actorId": "uuid-do-ator",
	"oldData": {},
	"newData": {
		"name": "João Silva",
		"email": "joao@example.com"
	},
	"message": "Usuário criado com sucesso"
}
```

#### GET `/log/:log_id`

Buscar log por ID

#### GET `/log`

Listar logs com paginação e filtros

**Query params:**

- `page`, `limit`: paginação
- `action`: filtro por ação
- `entity`: filtro por entidade
- `actorRole`: filtro por papel do ator
- `startDate`, `endDate`: filtro por período

---

## 🔐 Autenticação

A API utiliza dois métodos de autenticação:

### 1. JWT (Access Token)

Para rotas administrativas e de gerenciamento

```
Authorization: Bearer {token}
```

### 2. API Key

Para registro de logs

```
x-api-key: ak_1234567890abcdef...
```

---

## 🛡️ Segurança

- ✅ Rate limiting (100 req/min)
- ✅ Helmet para headers HTTP seguros
- ✅ Validação de dados com class-validator
- ✅ Soft delete para dados sensíveis
- ✅ Hash de senhas com bcrypt
- ✅ CORS configurável

---

## 📝 Soft Delete

A aplicação implementa soft delete automático:

- Empresas, usuários, API keys e logs não são deletados fisicamente
- Campo `deletedAt` marca registros como deletados
- Queries automáticas filtram registros deletados

---

## 🧪 Testes

```bash
# Testes unitários
pnpm test

# Testes e2e
pnpm test:e2e

# Cobertura
pnpm test:cov
```

---

## 📄 Licença

UNLICENSED - Uso privado

---

## 👨‍💻 Desenvolvimento

```bash
# Lint
pnpm lint

# Format
pnpm format

# Build
pnpm build
```
