# Roadmap — Comex133 API (.NET 8)

> **Projeto:** comex133_api  
> **Framework:** .NET 8.0 / ASP.NET Core  
> **ORM:** Entity Framework Core 8 com SQL Server  
> **Banco:** `304_comex133_dev` — `bd.iron.hostazul.com.br:3533`  
> **Padrão de controle de schema:** EF Migrations  
> **Data início:** 16/04/2026  
> **URL Produção:** http://www.viaveritascomex.com.br/swagger  
> **Fase 1 concluída em:** 16/04/2026  
> **Status geral:** ✅ Fase 1 completa — aguardando ordem para iniciar Fase 2

---

## Objetivo

Criar a API REST do sistema Comex133 baseada nas entidades e fluxos mapeados no frontend Angular V2. Esta API substitui progressivamente o armazenamento em `localStorage` do frontend por um backend real com banco de dados SQL Server.

---

## Fase 1 — Estrutura Inicial e Validação de Stack ✅ CONCLUÍDA

**Meta:** Projeto rodando com Swagger, HealthCheck e uma entidade real persistida no SQL Server com CRUD completo.

> **Concluída em:** 16/04/2026 — todos os critérios validados localmente e em produção.

---

### ATI-01 — Criação do projeto `comex133_api` ✅

**Estrutura de pastas gerada:**

```
comex133_api/
├── comex133_api.csproj
├── Program.cs
├── appsettings.json
├── appsettings.Development.json
├── web.config
├── deploy.ps1
├── Properties/
│   └── launchSettings.json
├── Core/
│   ├── Database/
│   │   ├── AppDbContext.cs
│   │   └── DbInitializer.cs
│   ├── Exceptions/
│   │   ├── NotFoundException.cs
│   │   ├── BusinessException.cs
│   │   └── ValidationException.cs
│   ├── Extensions/
│   │   └── ServiceCollectionExtensions.cs
│   ├── Middleware/
│   │   ├── ExceptionHandlingMiddleware.cs
│   │   └── RequestLoggingMiddleware.cs
│   └── Models/
│       ├── ApiResponse.cs
│       ├── PagedResult.cs
│       └── ValidationError.cs
├── Domain/
│   └── Entities/
│       └── ParametroSistema.cs   ← entidade de validação de integração
├── Migrations/                   ← gerado pelo EF CLI
└── Controllers/
    ├── HealthController.cs
    └── ParametrosController.cs   ← CRUD de validação
```

**Dependências NuGet:**

| Pacote | Versão | Finalidade |
|--------|--------|-----------|
| `Microsoft.AspNetCore.OpenApi` | 8.0.8 | Swagger metadata |
| `Swashbuckle.AspNetCore` | 6.4.0 | Swagger UI |
| `Microsoft.EntityFrameworkCore` | 8.0.0 | ORM base |
| `Microsoft.EntityFrameworkCore.SqlServer` | 8.0.0 | Provider SQL Server |
| `Microsoft.EntityFrameworkCore.Tools` | 8.0.0 | CLI migrations |
| `Microsoft.EntityFrameworkCore.Design` | 8.0.0 | Design-time migrations |
| `FluentValidation.AspNetCore` | 11.3.0 | Validações de request |

---

### ATI-02 — Configuração de banco de dados ✅

**Connection String:**
```
Server=bd.iron.hostazul.com.br,3533;Database=304_comex133_dev;User Id=304_leandro;Password=fbg3mekalujdyzxptosw;TrustServerCertificate=True;
```

**`appsettings.json`** → string de produção  
**`appsettings.Development.json`** → string de desenvolvimento (mesma por enquanto)

**EF Migrations — fluxo padrão:**
```bash
# Na raiz do projeto
dotnet ef migrations add InitialCreate
dotnet ef database update
```

**Critério de aceite:** `dotnet ef database update` executa sem erros e cria a tabela `ParametrosSistema` no banco real.

> ✅ **Validado em 16/04/2026** — Migration `20260416225952_InitialCreate` aplicada. Tabela `ParametrosSistema` criada com índice único em `Chave`.

---

### ATI-03 — Swagger configurado ✅

- `GET /` redireciona para `/swagger`
- Swagger UI disponível em `/swagger`
- Swagger JSON em `/swagger/v1/swagger.json`
- Título: **Comex133 API**
- Versão: **v1**
- Tags agrupadas por resource

**Critério de aceite:** abrir browser em `http://localhost:5000/swagger` exibe a UI com todos os endpoints documentados.

> ✅ **Validado** — Swagger disponível em http://www.viaveritascomex.com.br/swagger

---

### ATI-04 — HealthCheck endpoint ✅

`GET /api/health`

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-04-16T00:00:00Z",
    "version": "1.0.0",
    "environment": "Development",
    "database": "connected"
  }
}
```

O health check deve incluir validação de conectividade com o banco (teste de `context.Database.CanConnectAsync()`).

**Critério de aceite:** `GET /api/health` retorna 200 com `database: "connected"`.

> ✅ **Validado em 16/04/2026** — Resposta em produção:
> ```json
> { "status": "healthy", "environment": "Production", "database": "connected" }
> ```

---

### ATI-05 — CRUD de `ParametroSistema` (validação de integração real) ✅

Entidade simples para validar a stack completa — sem regras de negócio complexas.

**Tabela:** `ParametrosSistema`

| Coluna | Tipo | |
|--------|------|--|
| `Id` | `int` (PK, identity) | |
| `Chave` | `nvarchar(100)` | obrigatório, único |
| `Valor` | `nvarchar(500)` | obrigatório |
| `Descricao` | `nvarchar(250)` | opcional |
| `CriadoEm` | `datetime2` | auto-preenchido |
| `AtualizadoEm` | `datetime2` | auto-atualizado |

**Endpoints:**

| Método | Rota | Ação |
|--------|------|------|
| `GET` | `/api/parametros` | Listar todos |
| `GET` | `/api/parametros/{id}` | Buscar por ID |
| `POST` | `/api/parametros` | Criar |
| `PUT` | `/api/parametros/{id}` | Atualizar |
| `DELETE` | `/api/parametros/{id}` | Excluir |

**Validações (FluentValidation):**
- `Chave` obrigatória, máx 100 chars, única (sem duplicata)
- `Valor` obrigatório, máx 500 chars

**Critério de aceite:** executar todo o CRUD via Swagger UI com dados persistidos e recuperados do SQL Server real.

> ✅ **Validado em 16/04/2026** — POST, GET, PUT e DELETE testados localmente e em produção. Registro `DEPLOY_INICIAL` persistido no banco de produção.

---

### ATI-06 — Middleware de tratamento global de exceções ✅

Intercepta exceções e retorna respostas padronizadas `ApiResponse`.

| Exceção | HTTP Status |
|---------|------------|
| `NotFoundException` | 404 |
| `BusinessException` | 400 |
| `ValidationException` | 400 |
| Qualquer outra | 500 |

---

### ATI-07 — Middleware de logging de requests ✅

Loga cada request com método, path, status code e duração em ms.

```
[INFO] GET /api/parametros → 200 (12ms)
[INFO] POST /api/parametros → 201 (45ms)
```

---

### ATI-08 — CORS configurado ✅

Permite origens:
- `http://localhost:4200` (Angular dev)
- `https://comex133.com.br`
- `https://www.comex133.com.br`

---

### ATI-09 — Deploy script (`deploy.ps1`) ✅

Baseado no `import-costs-api/deploy.ps1` com as seguintes mudanças:
- `$projectPath` aponta para `comex133_api`
- `$publishPath` dentro do projeto
- Configuração de FTP mantida (host, user, password, target)

> ✅ **Validado em 16/04/2026** — Deploy executado com sucesso: 53 arquivos enviados, 0 erros.

---

## Fase 2 — Autenticação e Autorização (Usuários, Roles e JWT) ⬅️ PRÓXIMA FASE
*(Aguardando ordem para iniciar)*

> **Status:** Planejada — não iniciada  
> **Pré-requisito:** Fase 1 ✅ completa  
> **Motivo de prioridade:** Toda a Fase 3 (Cadastros) e Fase 4 (Fluxo Operacional) depende de usuários autenticados. Definir autenticação antes evita retrabalho na proteção dos endpoints.

---

### Visão Geral da Fase 2

Implementar o sistema completo de identidade: cadastro de usuários, roles, autenticação via JWT com refresh token, expiração, blacklist e proteção de endpoints — tudo seguindo boas práticas de segurança.

**Escopo inicial:**
- Role única: `Admin`
- Usuário seed: `admin@comex133.com.br` / `Pa$$word`
- A API Key fixa atual (`X-Api-Key`) permanece como proteção de emergência em paralelo enquanto o JWT não é implementado no frontend

---

### ATI-02-01 — Entidades de Identidade

**Novas tabelas (EF migration `AddIdentity`):**

#### Tabela `Roles`

| Coluna | Tipo | |
|--------|------|--|
| `Id` | `int` PK identity | |
| `Nome` | `nvarchar(50)` | único, ex: `Admin` |
| `Descricao` | `nvarchar(200)` | opcional |
| `CriadoEm` | `datetime2` | auto |
| `AtualizadoEm` | `datetime2` | auto |

**Seed obrigatório:** `{ Id: 1, Nome: "Admin", Descricao: "Administrador do sistema" }`

#### Tabela `Usuarios`

| Coluna | Tipo | |
|--------|------|--|
| `Id` | `int` PK identity | |
| `Email` | `nvarchar(150)` | único, lowercase normalizado |
| `NomeCompleto` | `nvarchar(200)` | obrigatório |
| `PasswordHash` | `nvarchar(500)` | BCrypt hash |
| `Ativo` | `bit` | default `true` |
| `CriadoEm` | `datetime2` | auto |
| `AtualizadoEm` | `datetime2` | auto |
| `UltimoLoginEm` | `datetime2?` | nullable, atualizado no login |

**Seed obrigatório:** `admin@comex133.com.br` com senha `Pa$$word` hasheada via BCrypt.

#### Tabela `UsuarioRoles` (N:N)

| Coluna | Tipo | |
|--------|------|--|
| `UsuarioId` | `int` FK | |
| `RoleId` | `int` FK | |
| `AtribuidoEm` | `datetime2` | |

Chave composta `(UsuarioId, RoleId)`.

**Seed:** associar usuario admin à role Admin.

**NuGet necessário:** `BCrypt.Net-Next` (hash de senha)

---

### ATI-02-02 — Tokens JWT (Access + Refresh)

**Configuração em `appsettings.json`:**
```json
"Jwt": {
  "Secret": "<chave-minimo-256bits-nunca-commitar>",
  "Issuer": "comex133-api",
  "Audience": "comex133-app",
  "AccessTokenExpirationMinutes": 60,
  "RefreshTokenExpirationDays": 7
}
```

**Claims do Access Token:**

| Claim | Valor |
|-------|-------|
| `sub` | `usuario.Id.ToString()` |
| `email` | `usuario.Email` |
| `name` | `usuario.NomeCompleto` |
| `role` | `["Admin"]` (lista de roles) |
| `jti` | GUID único do token |
| `iat` | timestamp de emissão |
| `exp` | timestamp de expiração |

**Access Token:** curta duração (60 min), stateless, sem armazenamento em banco.

**Refresh Token:** longa duração (7 dias), armazenado em banco na tabela `RefreshTokens`:

#### Tabela `RefreshTokens`

| Coluna | Tipo | |
|--------|------|--|
| `Id` | `int` PK identity | |
| `Token` | `nvarchar(500)` | único, opaque random |
| `UsuarioId` | `int` FK | |
| `ExpiresAt` | `datetime2` | |
| `UsedAt` | `datetime2?` | nullable — quando foi usado |
| `RevokedAt` | `datetime2?` | nullable — quando foi revogado |
| `CriadoEm` | `datetime2` | auto |

Regra: refresh token só pode ser usado **uma vez** (rotação de token). Ao usar, gera novo par access+refresh e marca o anterior como usado (`UsedAt`). Tentativa de reutilizar token já usado revoga toda a família (detecção de roubo).

**NuGet necessário:** `Microsoft.AspNetCore.Authentication.JwtBearer 8.x`

---

### ATI-02-03 — Endpoints de Autenticação

**Controller:** `AuthController` — rota base `/api/auth` — **público** (sem proteção de API Key e sem JWT)

| Método | Rota | Ação | Auth |
|--------|------|------|------|
| `POST` | `/api/auth/login` | Autentica email+senha, retorna access+refresh token | Público |
| `POST` | `/api/auth/refresh` | Troca refresh token por novo par | Público |
| `POST` | `/api/auth/logout` | Revoga refresh token | JWT |
| `GET` | `/api/auth/me` | Retorna dados do usuário autenticado | JWT |

#### `POST /api/auth/login`
```json
// Request
{ "email": "admin@comex133.com.br", "senha": "Pa$$word" }

// Response 200
{
  "accessToken": "eyJ...",
  "refreshToken": "abc123...",
  "expiresIn": 3600,
  "tokenType": "Bearer",
  "usuario": {
    "id": 1,
    "email": "admin@comex133.com.br",
    "nomeCompleto": "Administrador",
    "roles": ["Admin"]
  }
}
```
Erros: `401` senha inválida, `401` usuário inativo.

#### `POST /api/auth/refresh`
```json
// Request
{ "refreshToken": "abc123..." }

// Response 200 — novo par
{ "accessToken": "eyJ...", "refreshToken": "xyz789...", "expiresIn": 3600 }
```
Erros: `401` token expirado, `401` token revogado, `401` token já usado (roubo detectado — todos revogados).

#### `POST /api/auth/logout`
```json
// Request (header: Authorization: Bearer <token>)
{ "refreshToken": "abc123..." }
// Response 200
{ "message": "Logout realizado com sucesso" }
```

#### `GET /api/auth/me`
```json
// Response 200
{
  "id": 1,
  "email": "admin@comex133.com.br",
  "nomeCompleto": "Administrador",
  "roles": ["Admin"],
  "ultimoLoginEm": "2026-04-16T23:00:00Z"
}
```

---

### ATI-02-04 — CRUD de Usuários

**Controller:** `UsuariosController` — rota base `/api/usuarios` — protegido por JWT + role `Admin`

| Método | Rota | Ação |
|--------|------|------|
| `GET` | `/api/usuarios` | Listar todos (paginado) |
| `GET` | `/api/usuarios/{id}` | Buscar por ID |
| `POST` | `/api/usuarios` | Criar usuário |
| `PUT` | `/api/usuarios/{id}` | Atualizar dados (exceto senha) |
| `PATCH` | `/api/usuarios/{id}/senha` | Alterar senha |
| `PATCH` | `/api/usuarios/{id}/ativo` | Ativar/desativar |
| `DELETE` | `/api/usuarios/{id}` | Excluir |
| `GET` | `/api/usuarios/{id}/roles` | Listar roles do usuário |
| `POST` | `/api/usuarios/{id}/roles/{roleId}` | Atribuir role |
| `DELETE` | `/api/usuarios/{id}/roles/{roleId}` | Remover role |

**Regras de negócio:**
- Email normalizado para lowercase
- Senha validada: mínimo 8 chars, ao menos 1 maiúscula, 1 número, 1 especial
- Não é possível excluir o próprio usuário autenticado
- Não é possível desativar o último admin ativo
- Hash de senha com BCrypt (work factor ≥ 12)

---

### ATI-02-05 — CRUD de Roles

**Controller:** `RolesController` — rota base `/api/roles` — protegido por JWT + role `Admin`

| Método | Rota | Ação |
|--------|------|------|
| `GET` | `/api/roles` | Listar todas |
| `GET` | `/api/roles/{id}` | Buscar por ID |
| `POST` | `/api/roles` | Criar role |
| `PUT` | `/api/roles/{id}` | Atualizar |
| `DELETE` | `/api/roles/{id}` | Excluir (só se sem usuários vinculados) |

---

### ATI-02-06 — Proteção de endpoints via JWT

Após implementar o JWT, os endpoints protegidos passam a exigir:
```
Authorization: Bearer <accessToken>
```

**Hierarquia de proteção:**

| Nível | Decorator .NET | Endpoints |
|-------|---------------|----------|
| Público | sem atributo | `/`, `/swagger/*`, `/api/health`, `/api/auth/login`, `/api/auth/refresh` |
| Autenticado | `[Authorize]` | `/api/auth/me`, `/api/auth/logout` |
| Admin | `[Authorize(Roles = "Admin")]` | `/api/usuarios/*`, `/api/roles/*`, `/api/parametros/*` |

**Swagger configurado para JWT Bearer:**
- Botão "Authorize" aceita `Bearer <token>` além do `X-Api-Key` já existente
- A API Key fixa é removida nesta fase (substituída pelo JWT)

---

### ATI-02-07 — Segurança adicional

**Rate limiting no login:** máximo 5 tentativas de login falhas em 5 minutos por IP (evitar brute force).

**Limpeza de tokens expirados:** job ou limpeza automática na inicialização de refresh tokens expirados há mais de 30 dias.

**Senhas:** nunca logar, nunca retornar em response, nunca armazenar em texto plano.

**Headers de segurança no `web.config`** (já existe): garantir `X-Content-Type-Options`, `X-Frame-Options`.

---

### Estrutura de pastas — adições da Fase 2

```
comex133_api/
├── Domain/
│   └── Entities/
│       ├── Usuario.cs
│       ├── Role.cs
│       ├── UsuarioRole.cs
│       └── RefreshToken.cs
├── Features/
│   ├── Auth/
│   │   ├── AuthDtos.cs
│   │   ├── AuthService.cs
│   │   ├── JwtService.cs
│   │   └── AuthValidators.cs
│   ├── Usuarios/
│   │   ├── UsuarioDtos.cs
│   │   ├── UsuarioService.cs
│   │   └── UsuarioValidators.cs
│   └── Roles/
│       ├── RoleDtos.cs
│       ├── RoleService.cs
│       └── RoleValidators.cs
└── Controllers/
    ├── AuthController.cs
    ├── UsuariosController.cs
    └── RolesController.cs
```

---

### Dependências NuGet adicionais — Fase 2

| Pacote | Finalidade |
|--------|----------|
| `Microsoft.AspNetCore.Authentication.JwtBearer 8.x` | Validação de JWT |
| `BCrypt.Net-Next 4.x` | Hash de senha |
| `System.IdentityModel.Tokens.Jwt 7.x` | Geração de JWT |

---

### Critérios de Conclusão da Fase 2

- [ ] Migrations `AddIdentity` e `AddRefreshTokens` aplicadas no banco
- [ ] Seed executado: role `Admin` e usuário `admin@comex133.com.br` criados
- [ ] `POST /api/auth/login` retorna access token + refresh token válidos
- [ ] `POST /api/auth/refresh` gera novo par e invalida o token anterior
- [ ] `POST /api/auth/logout` revoga o refresh token
- [ ] `GET /api/auth/me` retorna dados do usuário autenticado
- [ ] CRUD de usuários funcional protegido por `Admin`
- [ ] CRUD de roles funcional protegido por `Admin`
- [ ] Endpoints sem token retornam `401`
- [ ] Endpoints com token de role incorreta retornam `403`
- [ ] Reutilização de refresh token já usado revoga toda a sessão
- [ ] Senha inválida no login retorna `401` (sem revelar se email existe)
- [ ] API Key fixa removida do pipeline
- [ ] Swagger com botão Authorize Bearer JWT
- [ ] Deploy em produção validado

---

## Fase 3 — Entidades de Cadastro Base
*(Inicia após conclusão da Fase 2)*

> **Status:** Em execução — cadastros base concluídos e seed local aplicado  
> **Pré-requisito:** Fase 2 ✅ completa (autenticação necessária para proteger endpoints)

### Entregas da Fase 3 (até 17/04/2026)

- Entidades base implementadas: 12 cadastros + tabela de junção `ModeloDespesaItem`
- Endpoints administrativos (`[Authorize(Roles = "Admin")]`) publicados para os 12 cadastros
- Migration estrutural aplicada: `AddCadastros`
- Seed desacoplado via migration dedicada: `SeedPhase3Cadastros`
- Dados de seed mapeados a partir do frontend `import-costs` (V2) para facilitar testes de integração
- Seed aplicado somente em ambiente local de validação (`dotnet ef database update`), sem execução adicional em produção nesta etapa
- Retorno de listas padronizado com paginação para todos os endpoints de listagem já implementados (Fases 1, 2 e 3)

### Padrão de Paginação (Contrato Único)

- Query params de entrada em endpoints de lista:
  - `page` (default: 1)
  - `pageSize` (default: 20, máximo: 100)
- Modelo padrão de request: `PaginationQuery`
- Modelo padrão de response: `PagedResult<T>`
- Estrutura de `PagedResult<T>`:
  - `items`
  - `totalCount`
  - `page`
  - `pageSize`
  - `totalPages`
  - `hasNextPage`
  - `hasPreviousPage`
- Implementação de paginação server-side via extensão `ToPagedResultAsync` sobre `IQueryable<T>`
- Padrão aplicado em:
  - Fase 3: 12 cadastros + `GET /api/modelos-despesa/{id}/itens`
  - Fase 2: `GET /api/usuarios`, `GET /api/roles`
  - Fase 1: `GET /api/parametros`

### Seed da Fase 3 (Migration dedicada)

- Arquivo de seed: `Core/Database/Seeds/Phase3SeedData.cs`
- Migration de seed: `Migrations/20260417004453_SeedPhase3Cadastros.cs`
- Estratégia adotada:
  - `IF NOT EXISTS` para idempotência
  - resolução de FK por chave natural (`Nome`, `Descricao`, `CodigoNcm`) em vez de IDs fixos
  - `Down()` removendo em ordem inversa para respeitar constraints
- Cobertura do seed (12 tabelas):
  - `PortosOrigem` (5)
  - `PortosDestino` (5)
  - `Clientes` (4)
  - `Importadores` (3)
  - `Exportadores` (3)
  - `AgentesCarga` (3)
  - `Fabricantes` (3)
  - `Despachantes` (2)
  - `Ncms` (5)
  - `ListaPrecoLcl` (3)
  - `DespesasCatalogo` (20)
  - `ModelosDespesa` (3) + `ModelosDespesaItens` (13 + 6 + 4)

### Critérios de Conclusão da Fase 3

- [x] 12 entidades de cadastro implementadas
- [x] CRUD + ativação/desativação para os 12 cadastros
- [x] Migration estrutural `AddCadastros` aplicada
- [x] Seed desacoplado com migration própria (`SeedPhase3Cadastros`)
- [x] Seed validado localmente via endpoints da API
- [x] Padrão único de paginação aplicado nos retornos de lista
- [ ] Commit final consolidando pendências da fase

| Prioridade | Entidade | Tabela |
|-----------|---------|--------|
| 1 | PortoOrigem | `PortosOrigem` |
| 2 | PortoDestino | `PortosDestino` |
| 3 | Cliente | `Clientes` |
| 4 | Importador | `Importadores` |
| 5 | Exportador | `Exportadores` |
| 6 | AgenteCarga | `AgentesCarga` |
| 7 | Fabricante | `Fabricantes` |
| 8 | Despachante | `Despachantes` |
| 9 | Ncm | `Ncms` |
| 10 | ListaPrecoLcl | `ListaPrecoLcl` |
| 11 | DespesaCatalogo | `DespesasCatalogo` |
| 12 | ModeloDespesa | `ModelosDespesa` |

---

## Fase 4 — Fluxo Operacional
*(Após estabilização dos cadastros da Fase 3)*

> **Status:** Em execução — incremento 1 concluído e validado em localhost (17/04/2026)

### Entregas do incremento 1 (Fase 4)

- Nova branch da fase criada: `feat/phase4-fluxo-operacional`
- Módulo `SolicitacoesOrcamento` implementado no backend com:
  - entidade principal (`SolicitacoesOrcamento`)
  - vínculo de despachantes (`SolicitacoesOrcamentoDespachantes`)
  - vínculo de documentos (`SolicitacoesOrcamentoDocumentos`)
  - service + validators + controller protegidos por `Admin`
- Migration criada e aplicada localmente:
  - `20260417011551_AddFase4SolicitacoesOrcamento`
- Endpoints validados em localhost:
  - `GET /api/solicitacoes-orcamento`
  - `POST /api/solicitacoes-orcamento`
  - `GET /api/solicitacoes-orcamento/{id}`
  - `POST /api/solicitacoes-orcamento/{id}/despachantes`
  - `GET /api/solicitacoes-orcamento/{id}/despachantes`
  - `POST /api/solicitacoes-orcamento/{id}/documentos`
  - `GET /api/solicitacoes-orcamento/{id}/documentos`

### Pendências da Fase 4

- Implementar módulos restantes: `CustoDespachante`, `OrcamentoVenda`, `EmbarqueAduana`, `ControleNavio`, `Documento`
- Definir e aplicar transições de status entre os módulos operacionais
- Executar validação integrada de ponta a ponta (solicitação -> custo -> orçamento -> embarque)
- Após validação funcional local completa, realizar deploy

| Entidade | Complexidade |
|---------|-------------|
| SolicitacaoOrcamento | Alta |
| CustoDespachante (Wizard 4 etapas) | Alta |
| OrcamentoVenda | Alta |
| EmbarqueAduana | Alta |
| ControleNavio | Média |
| Documento | Média |

---

## Fase 5 — Melhorias e Observabilidade
*(Fase anterior era Fase 4 — Autenticação, movida para Fase 2)*

- Trocar API Key fixa por JWT completo com refresh token (feito na Fase 2)
- Adicionar Health Checks detalhados (disco, memória, banco)
- Implementar versionamento de API (`/api/v1/`, `/api/v2/`)
- Adicionar logging estruturado (Serilog + seq ou Application Insights)
- Documentação Swagger com exemplos de request/response

---

## Critérios de Conclusão da Fase 1

- [x] `dotnet run` sobe sem erros
- [x] `GET /` redireciona para Swagger UI
- [x] `GET /api/health` retorna `database: connected` com SQL Server real
- [x] Migration `InitialCreate` aplicada com sucesso no banco `304_comex133_dev`
- [x] CRUD completo de `ParametroSistema` funcional via Swagger UI
- [x] `deploy.ps1` aponta corretamente para o projeto `comex133_api`
- [x] Healthcheck validado em **produção** (`environment: Production`, `database: connected`)
- [x] CRUD validado em **produção** (registro `DEPLOY_INICIAL` persistido no banco real)

**Fase 1 concluída em 16/04/2026. ✅**

---

## Próximo Passo

**→ Continuar Fase 4 com o módulo `CustoDespachante` (incremento 2), mantendo validação local antes de deploy.**
