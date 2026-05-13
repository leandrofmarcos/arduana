# COMEX133 — Documento de Arquitetura do Sistema

> **Versão:** 1.0 | **Atualizado:** 2026-05-12  
> **Referência permanente para sessões de desenvolvimento Claude Code**

---

## 1. VISÃO GERAL

**Comex133** é um sistema web para gestão de custos de importação internacional, orçamentos e logística de embarque. Opera sob a marca **Via Veritas Comex** (viaveritascomex.com.br).

**O que o sistema resolve:**
- Solicitar orçamentos de custo ao despachante (aduaneiro)
- Despachante preenche custos detalhados (FOB/CIF, despesas, impostos por NCM)
- Equipe comercial gera Orçamento de Venda para o cliente
- Vinculação do embarque a navios e rotas

---

## 2. STACK TECNOLÓGICA

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Frontend | Angular (SPA + PWA) | 18.2.0 |
| Linguagem FE | TypeScript | 5.5.2 |
| Backend | ASP.NET Core | 8.0 |
| Linguagem BE | C# | 12 (nullable enabled) |
| ORM | Entity Framework Core | 8.0 (Code-First) |
| Banco de dados | SQL Server | 2019+ |
| Autenticação | JWT Bearer + Refresh Tokens | — |
| Hashing | BCrypt.Net-Next | 4.0.3 |
| Validação BE | FluentValidation | 11.3.0 |
| Documentação API | Swagger/Swashbuckle | 6.4.0 |
| PDF | jspdf + html2canvas | — |
| Excel | xlsx | 0.18.5 |
| Push Notifications | WebPush | 1.0.12 |
| Testes FE | Jasmine + Karma | — |
| Storybook | Component stories | 8.4.7 |

---

## 3. ARQUITETURA DE IMPLANTAÇÃO

```
┌───────────────────────────────────────────────────┐
│           Navegador do Usuário                    │
│        Angular 18 SPA + PWA                       │
│   https://www.viaveritascomex.com.br              │
└──────────────────┬────────────────────────────────┘
                   │ HTTPS
                   ▼
        ┌──────────────────────┐
        │    IIS (Reverse)     │
        │    Proxy / CORS      │
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────────────────┐
        │  ASP.NET Core 8 API              │
        │  IIS + ASP.NET Core Module       │
        │  - JWT Auth (60 min)             │
        │  - RBAC (Admin/Despachante/...)  │
        │  - Swagger (todos envs)          │
        │  - Rate Limit (5 login/5min)     │
        └──────────┬───────────────────────┘
                   │ TDS / SQL Auth
                   ▼
        ┌──────────────────────────────────┐
        │  SQL Server                      │
        │  bd.iron.hostazul.com.br:3533    │
        │  Database: 304_comex133_dev      │
        │  User: 304_leandro               │
        └──────────────────────────────────┘
```

---

## 4. RESPONSABILIDADES: FRONTEND vs BACKEND

### 4.1 Frontend (Angular 18)

**Responsabilidade:** Experiência do usuário, formulários, validação visual, geração de PDF/Excel, PWA offline, roteamento SPA.

**Localização dos fontes:** `comex133_front/`

**Estrutura de pastas:**
```
src/app/
├── core/                    ← Auth, HTTP client, guards, interceptors
│   ├── api/                 ← ApiService (wrapper para HttpClient)
│   ├── auth/                ← AuthGuard, AdminGuard, AuthService
│   └── services/            ← ToastService, NotificacaoService, DialogService
│
├── v2/                      ← VERSÃO ATUAL ATIVA
│   ├── core/
│   │   ├── layout/          ← Sidebar, Header, Shell
│   │   └── notifications/   ← Push notifications UI
│   └── features/
│       ├── auth/            ← Login, Profile
│       ├── cadastros/       ← 13 telas de cadastro (CRUD)
│       ├── admin/           ← Roles, Usuarios, Push Test
│       └── operacional/
│           ├── solicitacao-orcamento/
│           ├── custo-despachante/   ← Wizard 4 etapas
│           ├── orcamento-venda/
│           ├── embarque-aduana/
│           └── controle-navios/
│
├── features/                ← V1 (legado, mantido para referência)
└── data/                    ← Repositórios (HTTP + LocalStorage cache)
```

**Padrão de feature:**
```
feature/
├── models/feature.models.ts          ← Interfaces TypeScript + Enums
├── services/feature.service.ts       ← HTTP + cache em memória
├── pages/feature.component.ts        ← Componente de página
└── components/feature-detail.ts      ← Sub-componentes
```

**Guards de rota:**
- `authGuard` → verifica token JWT válido
- `adminGuard` → verifica role "Admin"

**Interceptores HTTP:**
- `authInterceptor` → injeta `Authorization: Bearer <token>` em cada request
- `errorInterceptor` → captura 401, tenta refresh, retenta request original

### 4.2 Backend (ASP.NET Core 8)

**Responsabilidade:** Regras de negócio, persistência, autenticação, autorização, geração de tokens, validação server-side.

**Localização dos fontes:** `comex133_api/`

**Estrutura de pastas (Clean Architecture):**
```
comex133_api/
├── Program.cs               ← DI registration, middleware pipeline
├── Core/
│   ├── Auth/                ← CurrentUserContext (extrair userId/roles do JWT)
│   ├── Database/            ← AppDbContext, DbInitializer (auto-migration)
│   ├── Exceptions/          ← NotFoundException, BusinessException, ValidationException
│   ├── Middleware/          ← ExceptionMiddleware, RequestLogging, RateLimiting
│   ├── Models/              ← ApiResponse<T>, PagedResult<T>, Pagination
│   └── Extensions/          ← ServiceCollectionExtensions (DI helpers)
├── Domain/
│   └── Entities/            ← 50+ entidades mapeadas pelo EF
├── Features/                ← Serviços + DTOs + Validators por domínio
├── Controllers/             ← Endpoints REST
└── Migrations/              ← Histórico de migrations EF
```

**Camadas internas de cada feature no backend:**
```
Features/CustosDespachante/
├── CustoDespachanteService.cs    ← Regras de negócio + queries
├── CustoDespachanteDto.cs        ← Request/Response DTOs
└── CustoDespachanteValidator.cs  ← FluentValidation rules
```

**Tratamento de erros:**
- Middleware captura exceções → retorna `ApiResponse` padronizado
- `NotFoundException` → HTTP 404
- `BusinessException` → HTTP 422
- `ValidationException` → HTTP 400 com lista de erros
- Demais → HTTP 500 (sem stack trace em produção)

---

## 5. MODELAGEM DE DADOS

### 5.1 Diagrama ER (simplificado)

```
┌──────────┐    ┌─────────────┐    ┌──────┐
│ Usuario  │───▶│UsuarioRole  │◀───│ Role │
│          │    └─────────────┘    └──────┘
│          │    ┌──────────────────┐
│          │───▶│ UsuarioVinculo   │
│          │    │ TipoVinculo      │
│          │    │ EntidadeId       │
└──────────┘    └──────────────────┘
      │
      │ RefreshToken (1:N)
      ▼

┌─────────────────────────────────────────────────────┐
│                  CADASTROS (Master Data)             │
├─────────────────────────────────────────────────────┤
│ PortoOrigem  PortoDestino  Cliente  Importador       │
│ Exportador   Despachante   AgenteCarga  Fabricante   │
│ Ncm  ListaPrecoLcl  DespesaCatalogo  ParametroSistema│
│ ModeloDespesa → ModeloDespesaItem                   │
│ Navio → NavioTrajeto                                │
└─────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                        FLUXO OPERACIONAL                             │
│                                                                      │
│  SolicitacaoOrcamento                                                │
│  ┌──────────────────────────────────┐                               │
│  │ CodigoInterno (único)            │                               │
│  │ ClienteId → Cliente              │                               │
│  │ ImportadorId → Importador        │                               │
│  │ PortoOrigemId → PortoOrigem      │                               │
│  │ PortoDestinoId → PortoDestino    │                               │
│  │ TamContainer (20/40/LCL)         │                               │
│  │ Peso, Observacao                 │                               │
│  │ Status (Rascunho/Aguardando/...) │                               │
│  └────────┬─────────────────────────┘                               │
│           │ 1:N                                                      │
│           ▼                                                          │
│  CustoDespachante                                                    │
│  ┌──────────────────────────────────────────────────┐              │
│  │ CodigoInterno (único)                            │              │
│  │ DespachanteId → Despachante                      │              │
│  │ SolicitacaoOrcamentoId → Solicitacao (nullable)  │              │
│  │ PortoOrigemId, PortoDestinoId                    │              │
│  │ Responsavel, Peso                                │              │
│  │ FobUsd, FobReais, CifUsd, CifReais               │              │
│  │ SeguroUsd, FreteInternacionalUsd                 │              │
│  │ TaxaUsd, ParametroUsd, TotalGeralManual           │              │
│  │ Versao (int), VersaoAnteriorId (self-ref)         │              │
│  │ Status (Pendente/EmAndamento/Finalizado/          │              │
│  │         ReabertoPeloOV)                          │              │
│  ├──────────────────────────────────────────────────┤              │
│  │ → CustoDespachanteLi[] (mercadorias / LI)        │              │
│  │ → CustoDespachanteDespesa[] (despesas)           │              │
│  │ → NcmVinculadoCusto[] → ValorImpostoCusto[]      │              │
│  └────────┬─────────────────────────────────────────┘              │
│           │ N:M (via OrcamentoVendaCusto)                           │
│           ▼                                                          │
│  OrcamentoVenda                                                      │
│  ┌──────────────────────────────────────────────────┐              │
│  │ CodigoInterno (único)                            │              │
│  │ ClienteId → Cliente                              │              │
│  │ SolicitacaoOrcamentoId (nullable)                │              │
│  │ VersaoAnteriorId (self-ref)                      │              │
│  │ PesoBruto, PesoLiquido                           │              │
│  │ FreteInternacional, CifReais, FobReais           │              │
│  │ TaxaUsd, Honorarios                              │              │
│  │ TotalImpostos, TotalDespesas, TotalExtras        │              │
│  │ TotalGeral                                       │              │
│  │ Status (Aguardando/EmAndamento/Finalizado)        │              │
│  ├──────────────────────────────────────────────────┤              │
│  │ → OrcamentoVendaDespesa[]                        │              │
│  │ → OrcamentoVendaDespesaExtra[]                   │              │
│  │ → OrcamentoVendaCusto[] (links p/ CustoDesp.)    │              │
│  └────────┬─────────────────────────────────────────┘              │
│           │                                                          │
│           ▼                                                          │
│  EmbarqueNavioVinculo                                               │
│  ┌──────────────────────────────┐                                  │
│  │ SolicitacaoOrcamentoId       │                                  │
│  │ NavioId → Navio              │                                  │
│  │ NavioTrajetoId → NavioTrajeto│                                  │
│  │ NumeroViagem                 │                                  │
│  │ Status, DataVinculo          │                                  │
│  └──────────────────────────────┘                                  │
└──────────────────────────────────────────────────────────────────────┘
```

### 5.2 Entidades Detalhadas

#### Usuario
```
Id (Guid PK)
NomeCompleto (string)
Email (string, unique index)
SenhaHash (string — BCrypt)
Ativo (bool)
UltimoLoginEm (DateTime?)
CriadoEm, AtualizadoEm
→ Roles: UsuarioRole[] (M:N via pivot)
→ RefreshTokens: RefreshToken[]
→ Vinculos: UsuarioVinculo[]
```

#### RefreshToken
```
Id (Guid PK)
UsuarioId (FK)
Token (string, unique index)
ExpiresAt (DateTime — 7 dias)
RevokedAt (DateTime?)
ReplacedByToken (string?)  ← chain de rotação
CriadoEm
```

#### UsuarioVinculo
```
Id (Guid PK)
UsuarioId (FK)
TipoVinculo (string: "Despachante"|"Cliente"|"AgenteCarga"|"Exportador")
EntidadeId (Guid — id da entidade relacionada)
CriadoEm
```

#### SolicitacaoOrcamento
```
Id (Guid PK)
CodigoInterno (string, unique)
ClienteId (FK → Cliente)
ImportadorId (FK → Importador, nullable)
PortoOrigemId (FK → PortoOrigem)
PortoDestinoId (FK → PortoDestino)
TamContainer ("20"|"40"|"LCL")
Peso (decimal?)
Observacao (string?)
Status (enum string)
CriadoEm, AtualizadoEm
→ Despachantes: SolicitacaoOrcamentoDespachante[]
→ Documentos: SolicitacaoOrcamentoDocumento[]
→ CustosDespachante: CustoDespachante[]
→ OrcamentosVenda: OrcamentoVenda[]
→ NavioVinculos: EmbarqueNavioVinculo[]
```

**Status válidos para SolicitacaoOrcamento:**
`Rascunho` → `AguardandoDespachante` → `EmAndamento` → `Finalizado` | `Cancelado`

#### CustoDespachante
```
Id (Guid PK)
CodigoInterno (string, unique)
DespachanteId (FK → Despachante)
SolicitacaoOrcamentoId (FK nullable)
PortoOrigemId, PortoDestinoId (FK)
Responsavel (string)
Peso (decimal?)
FobUsd, FobReais (decimal)
CifUsd, CifReais (decimal)
SeguroUsd (decimal)
FreteInternacionalUsd (decimal)
TaxaUsd (decimal)
ParametroUsd (decimal)
TotalGeralManual (decimal?)
Versao (int, default 1)
VersaoAnteriorId (FK self-ref nullable)
Status (string)
CriadoEm, AtualizadoEm
→ Lis: CustoDespachanteLi[]
→ Despesas: CustoDespachanteDespesa[]
→ Ncms: NcmVinculadoCusto[]
→ OrcamentosVendaCusto: OrcamentoVendaCusto[]
```

**Status válidos para CustoDespachante:**
`Pendente` → `EmAndamento` → `Finalizado` | `ReabertoPeloOV`

#### NcmVinculadoCusto
```
Id (Guid PK)
CustoDespachanteId (FK)
NcmId (FK → Ncm)
CodigoNcm (string — desnormalizado p/ histórico)
Descricao (string)
→ ValoresImposto: ValorImpostoCusto[]
```

#### ValorImpostoCusto
```
Id (Guid PK)
NcmVinculadoCustoId (FK)
TipoImposto (string: "II"|"IPI"|"PIS"|"COFINS"|"ICMS")
Aliquota (decimal)
BaseCalculo (decimal)
ValorCalculado (decimal)
```

#### OrcamentoVenda
```
Id (Guid PK)
CodigoInterno (string, unique)
ClienteId (FK → Cliente)
SolicitacaoOrcamentoId (FK nullable)
VersaoAnteriorId (FK self-ref nullable)
PesoBruto, PesoLiquido (decimal)
FreteInternacional, CifReais, FobReais (decimal)
TaxaUsd, Honorarios (decimal)
TotalImpostos, TotalDespesas, TotalExtras, TotalGeral (decimal)
Status (string)
CriadoEm, AtualizadoEm
→ Despesas: OrcamentoVendaDespesa[]
→ Extras: OrcamentoVendaDespesaExtra[]
→ Custos: OrcamentoVendaCusto[]
```

**Status válidos para OrcamentoVenda:**
`Aguardando` → `EmAndamento` → `Finalizado` | `Cancelado`

#### Navio + NavioTrajeto
```
Navio:
  Id (Guid PK)
  NomeNavio, CodigoImo, Armador, Observacao (string)
  Ativo (bool)
  → Trajetos: NavioTrajeto[]
  → Vinculos: EmbarqueNavioVinculo[]

NavioTrajeto:
  Id (Guid PK)
  NavioId (FK)
  PortoOrigemId, PortoDestinoId (FK)
  → Vinculos: EmbarqueNavioVinculo[]
```

---

## 6. REGRAS DE NEGÓCIO PRINCIPAIS

### 6.1 Fluxo completo de importação

```
[Cliente solicita]
      │
      ▼
SolicitacaoOrcamento criada
  Status: Rascunho → AguardandoDespachante
      │
      ▼  (despachante é notificado/selecionado)
CustoDespachante criado para o Despachante
  Status: Pendente
      │
      ▼  (despachante inicia preenchimento)
  Status: EmAndamento
  [Wizard 4 etapas:]
  1. Valores FOB/CIF (USD e Reais)
  2. Mercadorias — LI (itens da declaração de importação)
  3. Despesas operacionais (porto, armazenagem, etc.)
  4. NCMs vinculados + alíquotas de impostos (II, IPI, PIS, COFINS, ICMS)
      │
      ▼  (despachante finaliza)
  Status: Finalizado
      │
      ▼
OrcamentoVenda criado (pela equipe comercial)
  Status: Aguardando → EmAndamento → Finalizado
  [Consolida 1..N CustosDespachante]
  [Adiciona honorários, despesas extras, totais]
      │
      ▼  (se precisar ajuste → ReAbertura)
  CustoDespachante.status = ReabertoPeloOV
  Nova versão criada (Versao++, VersaoAnteriorId=anterior)
      │
      ▼
EmbarqueNavioVinculo
  [Vincula Solicitacao → Navio → NavioTrajeto]
  [Tracking de voyage number]
```

### 6.2 Versionamento de CustoDespachante

- Cada reabertura gera **nova linha** com `Versao = anterior + 1`
- `VersaoAnteriorId` aponta para a versão anterior (forma linked list)
- Apenas a versão mais recente é editável
- Histórico completo preservado na mesma tabela

### 6.3 Versionamento de OrcamentoVenda

- Mesma lógica de `VersaoAnteriorId` auto-referencial
- Permite rastrear negociações e revisões de preço

### 6.4 RBAC — Controle de Acesso

| Role | Permissões |
|------|-----------|
| Admin | Tudo: cadastros, usuários, roles, todos os operacionais |
| Despachante | Apenas seus próprios CustosDespachante (filtrado por UsuarioVinculo) |
| Cliente | Visualização de SolicitacoesOrcamento e OrcamentosVenda do seu cliente |
| Exportador | Similar a Cliente, filtrado por entidade vinculada |

**Binding:** `UsuarioVinculo` liga `UsuarioId` + `TipoVinculo` + `EntidadeId`  
Exemplo: Despachante X tem `UsuarioVinculo { TipoVinculo="Despachante", EntidadeId=<id do despachante> }` — o backend filtra automaticamente os custos por esse id.

### 6.5 Cálculo de Impostos

Para cada NCM vinculado a um CustoDespachante:
- Base de cálculo varia por tipo de imposto
- Impostos: II (Imposto de Importação), IPI, PIS, COFINS, ICMS
- Valores calculados e armazenados em `ValorImpostoCusto`
- Total de impostos consolidado no OrcamentoVenda (`TotalImpostos`)

### 6.6 Regras de Exclusão

- Entidades de cadastro **não podem** ser excluídas se referenciadas por registros operacionais (FK restrict)
- Registros operacionais com filhos são excluídos com cascade nos filhos
- Não há soft delete implementado (exclusão é permanente)

---

## 7. ENDPOINTS DA API

### 7.1 Autenticação

```
POST   /api/auth/login           → { accessToken, refreshToken, expiresIn, usuario }
POST   /api/auth/refresh         → { accessToken, refreshToken, expiresIn }
POST   /api/auth/logout          → { success }
GET    /api/auth/me              → { id, email, nomeCompleto, roles }
```

**JWT:** expira em 60 min | **Refresh Token:** expira em 7 dias, single-use com rotação automática

### 7.2 Padrão REST dos Cadastros

```
GET    /api/{entidade}?page=1&pageSize=20   → PagedResult<T>
GET    /api/{entidade}/{id}
POST   /api/{entidade}
PUT    /api/{entidade}/{id}
PATCH  /api/{entidade}/{id}/ativar
PATCH  /api/{entidade}/{id}/desativar
DELETE /api/{entidade}/{id}
```

**Entidades cadastro:** `clientes`, `importadores`, `exportadores`, `despachantes`, `agentes-carga`, `fabricantes`, `navios`, `ncms`, `portos-origem`, `portos-destino`, `lista-preco-lcl`, `despesas-catalogo`, `modelos-despesa`

### 7.3 Operacional

```
── SolicitacoesOrcamento ──────────────────────────────────
GET/POST   /api/solicitacoes-orcamento
GET/PUT/DELETE  /api/solicitacoes-orcamento/{id}
POST/GET   /api/solicitacoes-orcamento/{id}/despachantes
POST/GET   /api/solicitacoes-orcamento/{id}/documentos

── CustosDespachante ──────────────────────────────────────
GET/POST          /api/custos-despachante
GET/PUT/DELETE    /api/custos-despachante/{id}
PATCH             /api/custos-despachante/{id}/iniciar
PATCH             /api/custos-despachante/{id}/finalizar
PATCH             /api/custos-despachante/{id}/reabrir
POST              /api/custos-despachante/{custoId}/lis
POST              /api/custos-despachante/{custoId}/despesas
POST              /api/custos-despachante/{custoId}/ncms
POST              /api/custos-despachante/{custoId}/ncms/{ncmId}/valores-imposto

── OrcamentosVenda ────────────────────────────────────────
GET/POST          /api/orcamentos-venda
GET/PUT/DELETE    /api/orcamentos-venda/{id}
PATCH             /api/orcamentos-venda/{id}/finalizar
PATCH             /api/orcamentos-venda/{id}/cancelar
PATCH             /api/orcamentos-venda/{id}/reabrir

── Embarque / Navios ──────────────────────────────────────
GET               /api/embarque-aduana
PATCH             /api/embarque-aduana/{id}/status
POST              /api/embarque-navio-vinculo
GET               /api/controle-navios
```

### 7.4 Admin

```
GET/POST          /api/usuarios
GET/PUT/DELETE    /api/usuarios/{id}
PATCH             /api/usuarios/{id}/senha
PATCH             /api/usuarios/{id}/ativo
POST              /api/usuarios/{id}/roles/{roleId}

GET/POST          /api/roles
PUT/DELETE        /api/roles/{id}
```

### 7.5 Utilitários

```
GET /api/health   → { status, timestamp, version, environment, database }
GET /            → Redirect 302 para /swagger
```

### 7.6 Formato padrão de respostas

**Sucesso:**
```json
{
  "success": true,
  "data": { ... },
  "message": null
}
```

**Erro:**
```json
{
  "success": false,
  "data": null,
  "message": "Descrição do erro",
  "errors": ["campo: mensagem", ...]
}
```

**Paginação:**
```json
{
  "items": [...],
  "totalCount": 150,
  "page": 1,
  "pageSize": 20,
  "totalPages": 8,
  "hasNextPage": true,
  "hasPreviousPage": false
}
```

---

## 8. ROTEAMENTO FRONTEND (V2)

```
/login                       → Público

/                            → Shell (authGuard)
├── /dashboard
├── /profile

├── Cadastros (adminGuard)
│   ├── /portos-origem
│   ├── /portos-destino
│   ├── /clientes
│   ├── /importadores
│   ├── /despachantes
│   ├── /exportadores
│   ├── /agentes-carga
│   ├── /fabricantes
│   ├── /navios
│   ├── /ncm
│   ├── /lista-preco-lcl
│   ├── /despesas-cadastro
│   └── /modelos-despesa

├── Administração (adminGuard)
│   ├── /admin/roles
│   ├── /admin/usuarios
│   └── /admin/push-test

└── Operacional
    ├── /controle-navios
    ├── /custos              ← Wizard CustoDespachante (4 etapas)
    ├── /orcamentos-venda
    ├── /embarques
    └── /solicitacoes
```

---

## 9. AUTENTICAÇÃO & SEGURANÇA

### Fluxo de Login

```
1. POST /api/auth/login { email, senha }
2. Backend valida credenciais + BCrypt
3. Gera JWT (60min) + RefreshToken (7 dias, persistido no DB)
4. Frontend armazena em localStorage
5. authInterceptor injeta Bearer em toda requisição
6. Em 401: tenta POST /api/auth/refresh automaticamente
7. Se refresh falhar: logout + redirect /login
```

### Proteções Implementadas

| Proteção | Detalhe |
|---------|---------|
| Rate Limit | 5 tentativas de login falhas por IP por 5 minutos |
| Refresh Token Rotation | Token single-use; reuso detectado revoga toda a sessão |
| BCrypt | Work factor 12+ |
| CORS | Whitelist: localhost:4200, viaveritascomex.com.br |
| HTTPS | Enforced em produção |
| RBAC | Role-based + entity-level filtering por UsuarioVinculo |
| JWT Claims | sub, email, name, role[], jti (JWT ID único) |

---

## 10. BANCO DE DADOS

### Conexão
```
Server=bd.iron.hostazul.com.br,3533
Database=304_comex133_dev
User=304_leandro
TrustServerCertificate=True
```

### Índices Únicos (constraints de negócio)
- `Usuario.Email`
- `RefreshToken.Token`
- `ParametroSistema.Chave`
- `Ncm.CodigoNcm`
- `SolicitacaoOrcamento.CodigoInterno`
- `CustoDespachante.CodigoInterno`
- `OrcamentoVenda.CodigoInterno`
- `ControleNavio.NumeroViagem`

### Cascade Rules
- **Delete cascade:** coleções filhas dos registros operacionais (Lis, Despesas, Ncms dentro do CustoDespachante)
- **Restrict:** FKs para dados de cadastro (impede exclusão de entidade em uso)
- **Sem soft delete:** exclusão é permanente; auditoria é enhancement futuro

### Migrations (ordem cronológica)
```
20260416225952_InitialCreate              ← Parametros
20260416234936_AddIdentity                ← Usuarios, Roles, RefreshTokens
20260417001626_AddCadastros               ← 12 tabelas de cadastro
20260417004453_SeedPhase3Cadastros        ← Dados semente
20260417011551_AddFase4SolicitacoesOrcamento
20260417135109_AddControleNavios
20260417185552_Phase5NaviosCadastroETrajetoOperacional
20260423194211_AddUsuarioVinculos
20260423235703_OP_FluxoOperacional        ← Status do fluxo operacional
20260424141201_OV_VersionamentoReabertura ← Auto-ref para versões
20260428193000_AddFreteInternacionalUsdToCustoDespachante
20260430223000_AddParametroUsdToCustoDespachante
20260430230000_AddTotalGeralManualToCustoDespachante
```

### Inicialização
- `DbInitializer.Initialize()` roda automaticamente no startup
- Aplica migrations pendentes
- Executa seeds se tabelas estiverem vazias

---

## 11. STATUS DAS FASES DE DESENVOLVIMENTO

| Fase | Nome | Status | Entregáveis |
|------|------|--------|-------------|
| 1 | Core Infrastructure | ✅ Completo | Swagger, Health, ParametroSistema |
| 2 | Auth & Authorization | ✅ Completo | JWT, Roles, Users, RBAC, Refresh |
| 3 | Cadastros | ✅ Completo | 12 cadastros + seed + ModeloDespesa |
| 4 | Fluxo Operacional | ✅ ~90% | Solicitacao, CustoDespachante, OrcamentoVenda, EmbarqueAduana |
| 5 | Navios | 🔄 Em andamento | Navio, NavioTrajeto, ControleNavio, UsuarioVinculos |
| 6 | Finalização | ⏳ Planejado | Polish, performance, deploy final |

---

## 12. PADRÕES DE CÓDIGO

### Backend
- Async/await em todo acesso a dados
- DTOs explícitos (sem expor entidades diretamente na API)
- Injeção de dependência via construtor
- FluentValidation para regras complexas
- Nomes: PascalCase para entidades/properties, kebab-case para rotas

### Frontend
- Componentes standalone (Angular 18)
- Lazy loading em todas as rotas (`loadComponent()`)
- Services com cache em memória + método `refresh()`
- Mappers explícitos API ↔ modelo frontend (normaliza datas, nulls, tipos)
- Nomes: PascalCase para classes, kebab-case para arquivos

### Documentação
- Swagger sempre ativo (dev e produção)
- Documento de arquitetura: este arquivo (`docs/ARQUITETURA_SISTEMA.md`)

---

## 13. DEPLOY & INFRAESTRUTURA

### Frontend
```
ng build --configuration production
# Saída: dist/import-costs/browser/  (estático)
#        dist/import-costs/server/   (SSR opcional)
# Hospedagem: IIS com web.config para SPA routing
```

### Backend
```
dotnet publish -c Release -o ./publish
# Hospedagem: IIS + ASP.NET Core Hosting Module
# DB: migração automática no startup
# Script: deploy.ps1 (FTP upload para hostazul)
```

---

## 14. PRÓXIMOS PASSOS / ROADMAP

**Imediato (Fase 5 conclusão):**
- Completar integração UI de Navios no fluxo operacional
- Notificações em tempo real (Web Sockets ou SSE)
- Upload de documentos (atualmente placeholder)

**Médio prazo:**
- Auditoria de alterações (who/what/when)
- Relatórios e dashboards (KPIs de custo, análise de importações)
- Operações em lote (geração em massa de orçamentos)

**Longo prazo:**
- Multi-tenancy
- Integração com APIs aduaneiras (status de portos, tarifas em tempo real)
- Previsão de custos por ML
