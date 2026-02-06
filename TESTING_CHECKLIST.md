# 📋 Checklist de Testes - Audit Log API

## 📝 Legenda

- ✅ Testado e funcionando
- ❌ Testado com erro
- ⏳ Pendente de teste
- 🔒 Requer autenticação JWT
- 🔑 Requer API Key

---

## 🔐 Autenticação

### POST `/auth` - Login

- [✅] ⏳ Login com usuário ADMIN válido
- [✅] ⏳ Login com usuário ENTERPRISE válido
- [✅] ⏳ Login com email inexistente (deve retornar erro)
- [✅] ⏳ Login com senha incorreta (deve retornar erro)
- [✅] ⏳ Login com empresa desabilitada (deve retornar erro)
- [✅] ⏳ Login com empresa deletada (deve retornar erro)
- [✅] ⏳ Validar formato do token JWT retornado

**Payload de teste:**

```json
{
	"email": "admin@example.com",
	"password": "senha123"
}
```

---

## 🏢 Empresas (Enterprise)

### POST `/enterprise` - Criar Empresa 🔒 ADMIN

- [✅] ⏳ Criar empresa com dados válidos
- [✅] ⏳ Criar empresa com email duplicado (deve retornar erro)
- [✅] ⏳ Criar empresa sem campos obrigatórios (deve retornar erro)
- [✅] ⏳ Criar empresa com senhas não correspondentes (deve retornar erro)
- [✅] ⏳ Validar que API Key é retornada
- [✅] ⏳ Validar que usuário responsável é criado automaticamente

**Payload de teste:**

```json
{
	"corporateReason": "Empresa Teste LTDA",
	"email": "empresa@teste.com",
	"responsibleName": "João Silva",
	"password": "senha123",
	"confirmPassword": "senha123"
}
```

### GET `/enterprise` - Listar Empresas 🔒 ADMIN

- [✅] ⏳ Listar todas as empresas (sem filtros)
- [✅] ⏳ Listar com paginação (page=1, limit=10)
- [✅] ⏳ Filtrar por corporateReason (busca parcial case-insensitive)
- [✅] ⏳ Filtrar por email (busca parcial case-insensitive)
- [✅] ⏳ Validar que empresas deletadas não aparecem
- [✅] ⏳ Validar ordenação por createdAt desc

**Query params de teste:**

```
?page=1&limit=10&corporateReason=teste&email=empresa
```

### GET `/enterprise/:enterpriseId` - Buscar Empresa 🔒 ADMIN

- [✅] ⏳ Buscar empresa existente
- [✅] ⏳ Buscar empresa inexistente (deve retornar erro)
- [✅] ⏳ Buscar empresa deletada (deve retornar erro)
- [✅] ⏳ Validar UUID inválido (deve retornar erro)

### PUT `/enterprise/:enterpriseId` - Atualizar Empresa 🔒 ADMIN

- [✅] ⏳ Atualizar corporateReason
- [✅] ⏳ Atualizar email
- [✅] ⏳ Atualizar empresa inexistente (deve retornar erro)
- [✅] ⏳ Atualizar com email duplicado (deve retornar erro)

**Payload de teste:**

```json
{
	"corporateReason": "Empresa Atualizada LTDA",
	"email": "empresa.atualizada@teste.com"
}
```

### PATCH `/enterprise/:enterpriseId` - Desabilitar Empresa 🔒 ADMIN

- [✅] ⏳ Desabilitar empresa ativa
- [✅] ⏳ Desabilitar empresa inexistente (deve retornar erro)
- [✅] ⏳ Validar que empresa desabilitada não pode fazer login
- [✅] ⏳ Validar que API Keys da empresa param de funcionar

### PATCH `/enterprise/:enterpriseId` - Habilitar Empresa 🔒 ADMIN

- [✅] ⏳ Habilitar empresa desabilitada
- [✅] ⏳ Habilitar empresa inexistente (deve retornar erro)

### DELETE `/enterprise/:enterpriseId` - Deletar Empresa 🔒 ADMIN

- [✅] ⏳ Deletar empresa existente (soft delete)
- [✅] ⏳ Deletar empresa inexistente (deve retornar erro)
- [✅] ⏳ Validar que empresa deletada não aparece nas listagens
- [✅] ⏳ Validar que usuários da empresa são deletados
- [✅] ⏳ Validar que API Keys da empresa são deletadas

---

## 🔑 API Keys

### POST `/api-key` - Criar API Key (Admin) 🔒 ADMIN

- [✅] ⏳ Criar API Key para empresa válida
- [✅] ⏳ Criar API Key com descrição
- [✅] ⏳ Criar API Key sem descrição (opcional)
- [✅] ⏳ Criar API Key para empresa inexistente (deve retornar erro)
- [✅] ⏳ Validar formato da API Key retornada (ak\_...)

**Payload de teste:**

```json
{
	"enterpriseId": "uuid-da-empresa",
	"description": "Chave para produção"
}
```

### POST `/api-key/enterprise` - Criar API Key (Enterprise) 🔒 ENTERPRISE

- [✅] ⏳ Empresa criar sua própria API Key
- [✅] ⏳ Criar com descrição opcional
- [✅] ⏳ Validar que enterpriseId é pego do token JWT

**Payload de teste:**

```json
{
	"description": "Chave para homologação"
}
```

### GET `/api-key` - Listar API Keys 🔒 ADMIN/ENTERPRISE

- [✅] ⏳ ADMIN: Listar todas as API Keys
- [✅] ⏳ ENTERPRISE: Listar apenas suas API Keys
- [✅] ⏳ Listar com paginação
- [✅] ⏳ Validar que API Keys deletadas não aparecem
- [✅] ⏳ Validar campo lastUsedAt

**Query params de teste:**

```
?page=1&limit=10
```

### PUT `/api-key/:apiKeyId` - Atualizar API Key 🔒 ADMIN/ENTERPRISE

- [✅] ⏳ Atualizar descrição da API Key
- [✅] ⏳ ENTERPRISE: Tentar atualizar API Key de outra empresa (deve retornar erro)
- [✅] ⏳ Atualizar API Key inexistente (deve retornar erro)

**Payload de teste:**

```json
{
	"description": "Descrição atualizada"
}
```

### PATCH `/api-key/:apiKeyId` - Desabilitar API Key 🔒 ADMIN/ENTERPRISE

- [✅] ⏳ Desabilitar API Key ativa
- [✅] ⏳ Validar que API Key desabilitada não funciona mais
- [✅] ⏳ ENTERPRISE: Tentar desabilitar API Key de outra empresa (deve retornar erro)

### PATCH `/api-key/:apiKeyId` - Habilitar API Key 🔒 ADMIN/ENTERPRISE

- [✅] ⏳ Habilita API Key desativada
- [✅] ⏳ ENTERPRISE: Tentar habilitar API Key de outra empresa (deve retornar erro)

### DELETE `/api-key/:apiKeyId` - Deletar API Key 🔒 ADMIN/ENTERPRISE

- [✅] ⏳ Deletar API Key existente (soft delete)
- [✅] ⏳ Validar que API Key deletada não aparece nas listagens
- [✅] ⏳ ENTERPRISE: Tentar deletar API Key de outra empresa (deve retornar erro)

---

## 👥 Usuários

### POST `/user` - Criar Usuário 🔒 ADMIN

- [✅] ⏳ Criar usuário ENTERPRISE vinculado a empresa
- [✅] ⏳ Criar usuário com email duplicado (deve retornar erro)
- [✅] ⏳ Criar usuário com senhas não correspondentes (deve retornar erro)
- [✅] ⏳ Criar usuário sem campos obrigatórios (deve retornar erro)

**Payload de teste:**

```json
{
	"name": "Maria Santos",
	"email": "maria@teste.com",
	"password": "senha123",
	"confirmPassword": "senha123",
	"enterpriseId": "uuid-da-empresa"
}
```

### GET `/user/profile` - Perfil do Usuário 🔒 ENTERPRISE

- [✅] ⏳ Buscar perfil do usuário logado
- [✅] ⏳ Validar que retorna dados da empresa vinculada
- [✅] ⏳ Validar que não retorna senha

### PUT `/user/profile` - Atualizar Perfil 🔒 ENTERPRISE

- [✅] ⏳ Atualizar nome do usuário
- [✅] ⏳ Atualizar email do usuário
- [✅] ⏳ Validar que não pode usar email duplicado

**Payload de teste:**

```json
{
	"name": "Nome Atualizado",
	"email": "email.atualizado@teste.com"
}
```

### PUT `/user/:user_id` - Atualizar Usuário 🔒 ADMIN

- [ ] ⏳ Atualizar dados de qualquer usuário
- [ ] ⏳ Atualizar usuário inexistente (deve retornar erro)
# OBS: usuário deletado com email X, e usuário novo quer cadastrar com esse email X. Porém é @unique no banco.

### DELETE `/user/:user_id` - Deletar Usuário 🔒 ADMIN

- [✅] ⏳ Deletar usuário existente (soft delete)
- [✅] ⏳ Deletar usuário inexistente (deve retornar erro)
- [✅] ⏳ Validar que usuário deletado não pode fazer login

---

## 📝 Logs

### POST `/log` - Criar Log 🔑 API Key

- [✅] ⏳ Criar log com todos os campos
- [✅] ⏳ Criar log com campos opcionais vazios
- [✅] ⏳ Criar log sem API Key (deve retornar erro)
- [✅] ⏳ Criar log com API Key inválida (deve retornar erro)
- [✅] ⏳ Criar log com API Key desabilitada (deve retornar erro)
- [✅] ⏳ Validar que lastUsedAt da API Key é atualizado

**Headers:**

```
x-api-key: ak_1234567890abcdef...
```

**Payload de teste:**

```json
{
	"action": "CREATE",
	"entity": "User",
	"entityId": "uuid-do-usuario",
	"actorRole": "ADMIN",
	"actorId": "uuid-do-ator",
	"oldData": null,
	"newData": {
		"name": "João Silva",
		"email": "joao@example.com"
	},
	"message": "Usuário criado com sucesso"
}
```

### GET `/log/:logId` - Buscar Log 🔑 API Key

- [✅] ⏳ Buscar log existente
- [✅] ⏳ Buscar log inexistente (deve retornar erro)
- [ ] ⏳ Buscar log deletado (deve retornar erro)
- [✅] ⏳ Validar UUID inválido (deve retornar erro)

### DELETE `/log/:logId` - Deletar Usuário 🔒 ADMIN

- [✅] ⏳ Deletar log existente (soft delete)
- [✅] ⏳ Deletar log inexistente (deve retornar erro)

### GET `/log` - Listar Logs 🔒 ADMIN/ENTERPRISE

- [✅] ⏳ Listar todos os logs da empresa
- [✅] ⏳ Listar com paginação (page=1, limit=10)
- [✅] ⏳ Filtrar por action
- [✅] ⏳ Filtrar por entity
- [✅] ⏳ Filtrar por actorRole
- [ ] ⏳ Filtrar por período (startDate e endDate)
- [✅] ⏳ Validar que logs deletados não aparecem
- [✅] ⏳ Validar ordenação por createdAt desc
- [✅] ⏳ Validar que empresa só vê seus próprios logs

**Query params de teste:**

```
?page=1&limit=10&action=CREATE&entity=User&actorRole=ADMIN&startDate=2026-01-01&endDate=2026-12-31
```

---

## 🔒 Testes de Segurança

### Autenticação JWT

- [ ] ⏳ Acessar rota protegida sem token (deve retornar 401)
- [ ] ⏳ Acessar rota protegida com token inválido (deve retornar 401)
- [ ] ⏳ Acessar rota protegida com token expirado (deve retornar 401)
- [ ] ⏳ ENTERPRISE tentar acessar rota ADMIN (deve retornar 403)
- [ ] ⏳ ADMIN acessar rota ENTERPRISE (deve funcionar)

### Autenticação API Key

- [ ] ⏳ Acessar rota de log sem API Key (deve retornar 401)
- [ ] ⏳ Acessar rota de log com API Key inválida (deve retornar 401)
- [ ] ⏳ Acessar rota de log com API Key de empresa desabilitada (deve retornar 401)
- [ ] ⏳ Acessar rota de log com API Key deletada (deve retornar 401)

### Isolamento de Dados

- [ ] ⏳ ENTERPRISE não pode ver logs de outra empresa
- [ ] ⏳ ENTERPRISE não pode ver API Keys de outra empresa
- [ ] ⏳ ENTERPRISE não pode modificar dados de outra empresa

### Validações

- [ ] ⏳ Enviar campos extras não permitidos (whitelist)
- [ ] ⏳ Enviar tipos de dados incorretos
- [ ] ⏳ Enviar UUIDs inválidos
- [ ] ⏳ Enviar emails inválidos
- [ ] ⏳ Enviar valores vazios em campos obrigatórios

---

## 🚀 Testes de Performance

- [ ] ⏳ Criar 100 logs em sequência
- [ ] ⏳ Listar logs com 1000+ registros
- [ ] ⏳ Testar paginação com grandes volumes
- [ ] ⏳ Testar rate limiting (100 req/min)

---

## 🐛 Testes de Edge Cases

- [ ] ⏳ Criar empresa e imediatamente fazer login
- [ ] ⏳ Desabilitar empresa e tentar usar API Key
- [ ] ⏳ Deletar empresa e verificar cascata (users, api keys)
- [ ] ⏳ Criar log com JSON muito grande (oldData/newData)
- [ ] ⏳ Testar caracteres especiais em strings
- [ ] ⏳ Testar SQL injection em filtros
- [ ] ⏳ Testar XSS em campos de texto

---

## 📊 Resumo

**Total de testes:** ~100+

**Por módulo:**

- Autenticação: 7 testes
- Empresas: 25 testes
- API Keys: 20 testes
- Usuários: 15 testes
- Logs: 18 testes
- Segurança: 15 testes
- Performance: 4 testes
- Edge Cases: 7 testes

---

## 📝 Notas

- Sempre validar os códigos de status HTTP corretos
- Validar estrutura das respostas JSON
- Validar mensagens de erro descritivas
- Testar em ordem: criar recursos antes de tentar modificá-los
- Guardar IDs e tokens gerados para testes subsequentes
