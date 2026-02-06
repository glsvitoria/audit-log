# 📋 Audit Log API

Uma API robusta de auditoria desenvolvida com NestJS para registro e consulta de logs de ações em sistemas empresariais. Permite que múltiplas empresas registrem e consultem seus logs de forma segura e organizada.

## 📖 Sobre o Projeto

O **Audit Log API** é um sistema de auditoria multi-tenant que permite:

- 🏢 **Gestão de Empresas**: Cadastro e gerenciamento de empresas
- 🔑 **API Keys**: Geração de chaves de API para autenticação
- 📝 **Registro de Logs**: Armazenamento de logs de auditoria com dados estruturados
- 🔍 **Consulta Avançada**: Filtros por ação, entidade, período e mais
- 🛡️ **Segurança**: Autenticação JWT para admins e API Keys para logs
- 🗑️ **Soft Delete**: Exclusão lógica de dados sensíveis

## 🚀 Tecnologias

- **[NestJS](https://nestjs.com/)** - Framework Node.js progressivo
- **[Prisma](https://www.prisma.io/)** - ORM moderno para TypeScript
- **[PostgreSQL](https://www.postgresql.org/)** - Banco de dados relacional
- **[JWT](https://jwt.io/)** - Autenticação baseada em tokens
- **[bcryptjs](https://github.com/dcodeIO/bcrypt.js)** - Hash seguro de senhas
- **[class-validator](https://github.com/typestack/class-validator)** - Validação de DTOs
- **[Docker](https://www.docker.com/)** - Containerização

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18 ou superior)
- **pnpm** (gerenciador de pacotes)
- **Docker** e **Docker Compose** (para o banco de dados)
- **Git**

### Instalando o pnpm

```bash
npm install -g pnpm
```

## 🔧 Instalação e Configuração

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd audit-log
```

### 2. Instale as dependências

```bash
pnpm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo de exemplo e configure suas variáveis:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Database
DATABASE_URL="postgresql://auditlog:auditlog@localhost:5432/auditlogdb?schema=public"

# JWT
ACCESS_TOKEN_SECRET="seu-secret-jwt-super-seguro-mude-em-producao"

# Application
PORT=3000
NODE_ENV=development
```

> ⚠️ **Importante**: Em produção, use um `ACCESS_TOKEN_SECRET` forte e único!

### 4. Inicie o banco de dados com Docker

```bash
docker-compose up -d
```

Isso irá criar um container PostgreSQL com as seguintes configurações:

- **Usuário**: auditlog
- **Senha**: auditlog
- **Database**: auditlogdb
- **Porta**: 5432

### 5. Execute as migrações do banco de dados

```bash
pnpm prisma migrate dev
```

### 6. Gere o Prisma Client

```bash
pnpm prisma generate
```

## 🏃 Executando a Aplicação

### Modo Desenvolvimento

```bash
pnpm start:dev
```

A API estará disponível em `http://localhost:3000`

### Modo Produção

```bash
# Build da aplicação
pnpm build

# Executar em produção
pnpm start:prod
```

### Modo Debug

```bash
pnpm start:debug
```

## 🗄️ Gerenciamento do Banco de Dados

### Visualizar dados com Prisma Studio

```bash
pnpm prisma studio
```

Abre uma interface visual em `http://localhost:5555` para explorar e editar dados.

### Criar uma nova migração

```bash
pnpm prisma migrate dev --name nome_da_migracao
```

### Resetar o banco de dados

```bash
pnpm prisma migrate reset
```

> ⚠️ **Atenção**: Isso irá apagar todos os dados!

## 📚 Estrutura da API

### 🔐 Autenticação

A API utiliza dois métodos de autenticação:

#### 1. JWT (Access Token) - Para rotas administrativas

```
Authorization: Bearer {token}
```

#### 2. API Key - Para registro de logs

```
x-api-key: ak_1234567890abcdef...
```

---

### 🔑 Auth - Autenticação

#### `POST /auth/login`

Autenticação de usuários (Admin ou Enterprise)

**Request:**

```json
{
	"email": "user@example.com",
	"password": "senha123"
}
```

**Response:**

```json
{
	"access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 🏢 Enterprise - Gestão de Empresas

> 🔒 Rotas protegidas por JWT (apenas ADMIN)

#### `POST /enterprise`

Criar nova empresa

**Request:**

```json
{
	"corporateReason": "Empresa LTDA",
	"email": "empresa@example.com",
	"responsibleName": "João Silva",
	"password": "senha123",
	"confirmPassword": "senha123"
}
```

**Response:**

```json
{
	"apiKey": "ak_1234567890abcdef..."
}
```

#### `GET /enterprise`

Listar empresas com paginação

**Query params:**

- `page` (opcional): número da página (padrão: 1)
- `limit` (opcional): itens por página (padrão: 10)
- `corporateReason` (opcional): filtro por razão social
- `email` (opcional): filtro por email

#### `GET /enterprise/:enterpriseId`

Buscar empresa por ID

#### `PUT /enterprise/:enterpriseId`

Atualizar dados da empresa

#### `PATCH /enterprise/:enterpriseId`

Desabilitar empresa

#### `DELETE /enterprise/:enterpriseId`

Deletar empresa (soft delete)

---

### 🔑 API Key - Gestão de Chaves

> 🔒 Rotas protegidas por JWT

#### `POST /api-key` (ADMIN)

Criar API Key para uma empresa

**Request:**

```json
{
	"enterpriseId": "uuid-da-empresa",
	"description": "Chave para produção"
}
```

#### `POST /api-key/enterprise` (ENTERPRISE)

Empresa criar sua própria API Key

**Request:**

```json
{
	"description": "Chave para homologação"
}
```

#### `GET /api-key`

Listar API Keys (com paginação)

**Query params:**

- `page`, `limit`: paginação
- `description`: filtro por descrição

#### `GET /api-key/:apiKeyId`

Buscar API Key por ID

#### `PUT /api-key/:apiKeyId`

Atualizar descrição da API Key

#### `PATCH /api-key/:apiKeyId`

Desabilitar API Key

#### `DELETE /api-key/:apiKeyId`

Deletar API Key (soft delete)

---

### 📝 Log - Registro de Auditoria

> 🔒 Rotas protegidas por API Key (header `x-api-key`)

#### `POST /log`

Criar novo log de auditoria

**Request:**

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

**Campos:**

- `action`: Ação realizada (CREATE, UPDATE, DELETE, etc.)
- `entity`: Entidade afetada (User, Product, etc.)
- `entityId`: ID da entidade
- `actorRole`: Papel do ator (ADMIN, USER, SYSTEM, etc.)
- `actorId`: ID do ator que realizou a ação
- `oldData`: Dados anteriores (opcional)
- `newData`: Dados novos (opcional)
- `message`: Mensagem descritiva (opcional)

#### `GET /log/:logId`

Buscar log por ID

#### `GET /log`

Listar logs com paginação e filtros

**Query params:**

- `page`, `limit`: paginação
- `action`: filtro por ação
- `entity`: filtro por entidade
- `actorRole`: filtro por papel do ator
- `actorId`: filtro por ID do ator
- `startDate`: data inicial (ISO 8601)
- `endDate`: data final (ISO 8601)

**Exemplo:**

```
GET /log?page=1&limit=20&action=CREATE&entity=User&startDate=2024-01-01T00:00:00Z
```

#### `DELETE /log/:logId`

Deletar log (soft delete)

---

## 🛡️ Recursos de Segurança

- ✅ **Rate Limiting**: 100 requisições por minuto
- ✅ **Helmet**: Headers HTTP seguros
- ✅ **Validação de Dados**: class-validator em todos os DTOs
- ✅ **Soft Delete**: Exclusão lógica de dados sensíveis
- ✅ **Hash de Senhas**: bcrypt com salt rounds
- ✅ **CORS**: Configurável por ambiente
- ✅ **Validação de UUID**: Pipe customizado com mensagens em português

## 🗑️ Soft Delete

A aplicação implementa soft delete automático através de uma extensão do Prisma:

- Empresas, usuários, API keys e logs não são deletados fisicamente
- Campo `deletedAt` marca registros como deletados
- Queries automáticas filtram registros deletados
- Operações `delete` são convertidas em `update` com `deletedAt`

**Localização**: `src/database/prisma/soft-delete.extension.ts`

## ✅ Validação Customizada

O projeto utiliza um pipe customizado `ValidationUUID` para validação de UUIDs com mensagens em português:

```typescript
@Param('id', new ValidationUUID('ID da empresa')) id: string
```

**Mensagens de erro:**

- "O [campo] é obrigatório e não pode ser vazio"
- "O [campo] deve ser uma string válida"
- "O [campo] deve ser um UUID válido no formato: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"

**Localização**: `src/common/pipes/uuid.pipe.ts`

## 📁 Estrutura do Projeto

```
audit-log/
├── prisma/
│   ├── migrations/          # Migrações do banco
│   └── schema.prisma        # Schema do Prisma
├── src/
│   ├── apiKey/              # Módulo de API Keys
│   ├── auth/                # Módulo de autenticação
│   ├── common/              # Pipes, guards, decorators
│   ├── config/              # Configurações da aplicação
│   ├── database/            # Prisma service e extensões
│   ├── enterprise/          # Módulo de empresas
│   ├── log/                 # Módulo de logs
│   ├── user/                # Módulo de usuários
│   ├── utils/               # Utilitários
│   ├── app.module.ts        # Módulo principal
│   └── main.ts              # Entry point
├── test/                    # Testes E2E
├── .env.example             # Exemplo de variáveis de ambiente
├── docker-compose.yml       # Configuração do Docker
├── package.json             # Dependências
└── README.md                # Este arquivo
```

## 🧪 Testes

### Executar testes unitários

```bash
pnpm test
```

### Executar testes em modo watch

```bash
pnpm test:watch
```

### Executar testes E2E

```bash
pnpm test:e2e
```

### Gerar relatório de cobertura

```bash
pnpm test:cov
```

## 👨‍💻 Desenvolvimento

### Lint

```bash
pnpm lint
```

### Formatação de código

```bash
pnpm format
```

### Build

```bash
pnpm build
```

## 🐳 Docker

### Iniciar apenas o banco de dados

```bash
docker-compose up -d
```

### Parar o banco de dados

```bash
docker-compose down
```

### Parar e remover volumes (apaga dados)

```bash
docker-compose down -v
```

### Ver logs do container

```bash
docker-compose logs -f
```

## 🚀 Deploy

### Variáveis de ambiente em produção

Certifique-se de configurar:

```env
NODE_ENV=production
DATABASE_URL="sua-url-de-producao"
ACCESS_TOKEN_SECRET="secret-super-seguro-aleatorio"
PORT=3000
```

### Build e execução

```bash
pnpm build
NODE_ENV=production pnpm start:prod
```

## 📝 Fluxo de Uso

### 1. Criar usuário Admin (primeira vez)

Execute o seed ou crie manualmente no banco:

```sql
INSERT INTO users (id, name, email, password, role, created_at)
VALUES (
  gen_random_uuid(),
  'Admin',
  'admin@example.com',
  '$2a$10$hashed_password_here',
  'ADMIN',
  NOW()
);
```

### 2. Login como Admin

```bash
POST /auth/login
{
  "email": "admin@example.com",
  "password": "senha"
}
```

### 3. Criar uma empresa

```bash
POST /enterprise
Authorization: Bearer {token}
{
  "corporateReason": "Minha Empresa",
  "email": "empresa@example.com",
  "responsibleName": "João Silva",
  "password": "senha123",
  "confirmPassword": "senha123"
}
```

Você receberá uma API Key no response.

### 4. Registrar logs

```bash
POST /log
x-api-key: ak_sua_chave_aqui
{
  "action": "CREATE",
  "entity": "User",
  "entityId": "uuid",
  "actorRole": "ADMIN",
  "actorId": "uuid",
  "message": "Usuário criado"
}
```

### 5. Consultar logs

```bash
GET /log?page=1&limit=10&action=CREATE
x-api-key: ak_sua_chave_aqui
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

UNLICENSED - Uso privado

## 📧 Contato

Para dúvidas ou sugestões, entre em contato através do repositório.

---

**Desenvolvido com ❤️ usando NestJS**
