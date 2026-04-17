# Comex133 API

API REST para gerenciamento do sistema de importações Comex133, desenvolvida com **.NET 8**, **Entity Framework Core 8** e **SQL Server**.

## 📋 Visão Geral

A Comex133 API fornece endpoints para:
- 🔐 Autenticação com JWT (access + refresh tokens)
- 👥 Gerenciamento de clientes e usuários
- 📦 Gestão de importações e orçamentos
- 🚢 Administração de portos e despachantes
- 📊 Consultas e operações de dados

## 🚀 Deployment & Servidor Remoto

**API em Produção:** `http://www.viaveritascomex.com.br/api`

### Testando contra o Servidor Remoto

#### Opção 1: Usando o VS Code com REST Client
1. Instale a extensão **REST Client**
2. Abra `comex133_api.http`
3. Clique em `Send Request` para executar testes
4. Veja [TESTING_REMOTE_SERVER.md](./TESTING_REMOTE_SERVER.md) para instruções detalhadas

#### Opção 2: Usando PowerShell (Automático)
```powershell
# Testar contra o servidor remoto
.\test-remote-api.ps1 -Environment "remote"

# Testar contra o servidor local
.\test-remote-api.ps1 -Environment "local"
```

**Recursos do script:**
- ✅ Verifica saúde da API (health check)
- ✅ Testa login e autenticação
- ✅ Valida endpoints de dados (clientes, orçamentos)
- ✅ Testa logout
- ✅ Relatório colorido com resultados

#### Opção 3: Usando cURL (Manual)
```bash
# Health check
curl -X GET "http://www.viaveritascomex.com.br/api/health" \
  -H "Accept: application/json"

# Login
curl -X POST "http://www.viaveritascomex.com.br/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@comex133.com.br",
    "senha": "Pa$$word"
  }'
```

## 🔑 Credenciais Padrão

| Campo | Valor |
|-------|-------|
| Email | `admin@comex133.com.br` |
| Senha | `Pa$$word` |

> ⚠️ **IMPORTANTE:** Altere as credenciais padrão em produção!

## 📡 Endpoints Principais

### Authentication
```
POST   /api/auth/login        → Autenticar e obter tokens
POST   /api/auth/refresh      → Renovar access token
POST   /api/auth/logout       → Fazer logout (revogar refresh token)
GET    /api/auth/me           → Obter dados do usuário autenticado
```

### Health
```
GET    /api/health            → Verificar saúde da API e BD
```

### Data
```
GET    /api/clientes                      → Listar clientes
GET    /api/importadores                  → Listar importadores
GET    /api/portos-origem                 → Listar portos de origem
GET    /api/portos-destino                → Listar portos de destino
GET    /api/solicitacoes-orcamento        → Listar solicitações de orçamento
GET    /api/despachantes                  → Listar despachantes
GET    /api/usuarios                      → Listar usuários
```

## 🛠️ Desenvolvimento Local

### Pré-requisitos
- `.NET 8 SDK` ou superior
- `SQL Server` (ou SQL Server Express)
- `Visual Studio 2022` ou `VS Code`

### Setup Local

1. **Clone o repositório**
   ```bash
   git clone <repository-url>
   cd comex133_api
   ```

2. **Configure a string de conexão**
   
   Edite `appsettings.Development.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=localhost;Database=comex133_dev;Trusted_Connection=True;TrustServerCertificate=True;"
     }
   }
   ```

3. **Execute as migrações**
   ```bash
   dotnet ef database update
   ```

4. **Inicie a API**
   ```bash
   dotnet run --urls "http://localhost:5001"
   ```

5. **Acesse Swagger**
   - Abra: `http://localhost:5001/swagger`

### Testar Localmente
```powershell
# Via PowerShell
.\test-remote-api.ps1 -Environment "local"
```

## 🗄️ Banco de Dados

- **Servidor:** SQL Server (3533 em produção, local em desenvolvimento)
- **Banco:** `304_comex133_dev` (desenvolvimento) / `304_comex133` (produção)
- **Framework:** Entity Framework Core 8 com Code-First Migrations

### Tabelas Principais
- `Usuarios` - Usuários do sistema
- `Clientes` - Dados de clientes
- `Importadores` - Importadores cadastrados
- `Portos` - Portos de origem/destino
- `SolicitacoesOrcamento` - Solicitações de orçamento (Phase 4)
- `Despachantes` - Despachantes associados
- `Documentos` - Documentação de importação

## 🔐 Autenticação & Segurança

### JWT Configuration
- **Algorithm:** HS256
- **Access Token Expiry:** 60 minutos
- **Refresh Token Expiry:** 7 dias
- **Issuer:** `comex133-api`
- **Audience:** `comex133-app`

### CORS Allowed Origins
```json
[
  "http://localhost:4200",
  "http://localhost:5000",
  "http://127.0.0.1:4200",
  "http://127.0.0.1:5000",
  "https://comex133.com.br",
  "https://www.comex133.com.br",
  "http://www.viaveritascomex.com.br",
  "https://www.viaveritascomex.com.br"
]
```

## 📦 Request/Response Format

### ApiResponse Envelope
Todas as respostas seguem este formato:

```json
{
  "success": true,
  "data": { /* ... */ },
  "message": "Operação realizada com sucesso",
  "errors": null,
  "statusCode": 200
}
```

### Paginação
Endpoints que retornam listas usam paginação:

```json
{
  "success": true,
  "data": {
    "items": [ /* ... */ ],
    "totalCount": 150,
    "pageNumber": 1,
    "pageSize": 10,
    "totalPages": 15
  },
  "statusCode": 200
}
```

**Query Parameters:**
- `page` (padrão: 1)
- `pageSize` (padrão: 10)
- `sortBy` (opcional)
- `sortDirection` (opcional: asc/desc)

## 🧪 Testes

### Scripts Disponíveis
- `test-remote-api.ps1` - Testa toda a API contra o servidor remoto
- `comex133_api.http` - Requisições individuais para VS Code REST Client

### Execução de Testes
```powershell
# Teste completo do servidor remoto
.\test-remote-api.ps1

# Com parâmetros customizados
.\test-remote-api.ps1 -Environment "remote" -Email "seu@email.com" -Senha "SuaSenha123"
```

## 📚 Estrutura do Projeto

```
comex133_api/
├── Controllers/              # HTTP endpoints
├── Core/
│   ├── Database/            # EF Core context e migrations
│   ├── Extensions/          # Extensões de serviço
│   ├── Middleware/          # Middleware customizado
│   └── Models/              # Response wrappers
├── Domain/
│   ├── Entities/            # Entidades do domínio
│   ├── Enums/               # Enumerações
│   └── ValueObjects/        # Value objects
├── Features/                # Funcionalidades (CQRS pattern)
│   ├── Auth/                # Autenticação
│   ├── Clientes/            # Gestão de clientes
│   ├── Importadores/        # Gestão de importadores
│   ├── Portos/              # Gestão de portos
│   └── SolicitacoesOrcamento/ # Phase 4 - Solicitações
├── Migrations/              # EF Core migrations
├── Properties/              # Configurações
├── Program.cs               # Configuração da aplicação
├── appsettings.json         # Configurações
└── comex133_api.csproj      # Arquivo do projeto
```

## 🔄 Fluxo de Autenticação

1. **Login**
   ```
   POST /api/auth/login
   { email, senha } → { accessToken, refreshToken }
   ```

2. **Requisições Autenticadas**
   ```
   GET /api/clientes
   Authorization: Bearer {accessToken}
   ```

3. **Renovação de Token**
   ```
   POST /api/auth/refresh
   { refreshToken } → { accessToken, refreshToken }
   ```

4. **Logout**
   ```
   POST /api/auth/logout
   { refreshToken } → Revoga o token
   ```

## 🚀 Deployment

API está hospedada em: **http://www.viaveritascomex.com.br/api**

Para fazer deploy de novas versões:
1. Merge no branch `main`
2. Execute `deploy.ps1`
3. Confirme que a API está online: `http://www.viaveritascomex.com.br/api/health`

Veja [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md) para instruções detalhadas.

## 🐛 Troubleshooting

### "401 Unauthorized"
- Token expirado: Execute login novamente
- Token inválido: Verifique se está usando o Bearer token correto

### "403 Forbidden"
- Usuário sem permissão: Verifique as roles do usuário
- Recurso restrito: Confirme o acesso ao endpoint

### "500 Internal Server Error"
- Verifique os logs: `logs/` ou console da aplicação
- Conectividade com BD: `ping` BD server
- Verifique strings de conexão em `appsettings.json`

### API não responde
- Verifique: `http://www.viaveritascomex.com.br/api/health`
- Confirme conectividade: `ping www.viaveritascomex.com.br`
- Verificar status do servidor remoto

## 📞 Suporte

Para relatar problemas ou sugestões:
- 📧 Email: dev@comex133.com.br
- 📋 Issues: GitHub Repository
- 📱 Chat: Slack #comex133-api

## 📄 Licença

Propriedade da ViaVeritas Logística

---

**Última atualização:** 2026-04-16  
**Versão da API:** 1.0  
**Fase Atual:** Phase 4 - Solicitações de Orçamento
