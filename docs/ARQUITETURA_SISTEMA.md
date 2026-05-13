# Comex133 — Arquitetura e Guia de Desenvolvimento

> **Versão:** 2.0 | **Atualizado:** 2026-05-13  
> **Fonte de verdade para desenvolvimento, onboarding e sessões Claude Code**

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Stack Tecnológica](#2-stack-tecnológica)
3. [Arquitetura de Implantação](#3-arquitetura-de-implantação)
4. [Estrutura do Frontend](#4-estrutura-do-frontend)
5. [Estrutura do Backend](#5-estrutura-do-backend)
6. [Modelagem de Dados](#6-modelagem-de-dados)
7. [Fluxo Operacional e Regras de Negócio](#7-fluxo-operacional-e-regras-de-negócio)
8. [API — Endpoints e Padrões](#8-api--endpoints-e-padrões)
9. [Autenticação e Segurança](#9-autenticação-e-segurança)
10. [Banco de Dados](#10-banco-de-dados)
11. [Componentes e Padrões de UI](#11-componentes-e-padrões-de-ui)
12. [Padrões de Código](#12-padrões-de-código)
13. [Como Adicionar uma Nova Feature](#13-como-adicionar-uma-nova-feature)
14. [Storage e Upload de Arquivos](#14-storage-e-upload-de-arquivos)
15. [Status das Fases de Desenvolvimento](#15-status-das-fases-de-desenvolvimento)
16. [Deploy e Infraestrutura](#16-deploy-e-infraestrutura)

---

## 1. Visão Geral

**Comex133** é um sistema web para gestão de custos de importação internacional, orçamentos e logística de embarque. Opera sob a marca **Via Veritas Comex** (`viaveritascomex.com.br`).

**Problema que resolve:**
- Solicitar cotações de custo a despachantes aduaneiros
- Despachante preenche custos detalhados (FOB/CIF, despesas operacionais, impostos por NCM)
- Equipe comercial consolida os custos e gera Orçamento de Venda para o cliente
- Vinculação do embarque a navios e rotas; acompanhamento da aduana

**Papéis de usuário:**
| Role | Acesso |
|------|--------|
| Admin | Tudo: cadastros, usuários, roles, todos os operacionais |
| Despachante | Somente seus próprios `CustoDespachante` (filtrado por `UsuarioVinculo`) |
| Cliente | Visualização de `SolicitacoesOrcamento` e `OrcamentosVenda` do seu cliente |

---

## 2. Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Frontend | Angular SPA | 18.2.0 |
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

---

## 3. Arquitetura de Implantação

```
┌───────────────────────────────────────────┐
│         Navegador do Usuário              │
│        Angular 18 SPA                     │
│   https://www.viaveritascomex.com.br      │
└──────────────────┬────────────────────────┘
                   │ HTTPS
                   ▼
        ┌──────────────────────┐
        │  IIS (Reverse Proxy) │
        │  CORS, SSL offload   │
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────────────────┐
        │  ASP.NET Core 8 API              │
        │  - JWT Auth (60 min)             │
        │  - RBAC (Admin/Despachante/...)  │
        │  - Swagger (todos os envs)       │
        │  - Rate Limit (5 login/5 min)    │
        │  - Static Files (wwwroot)        │
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

## 4. Estrutura do Frontend

**Localização:** `comex133_front/src/app/`

```
src/app/
│
├── core/                            ← Infraestrutura global
│   ├── api/
│   │   ├── client/
│   │   │   └── api-client.service.ts   ← Wrapper HttpClient (get/post/put/patch/delete/uploadFile)
│   │   ├── error-handler/
│   │   │   └── api-error.mapper.ts     ← Mapeia erros HTTP → { message, fieldErrors }
│   │   ├── interceptors/
│   │   │   ├── auth.interceptor.ts     ← Injeta Bearer token
│   │   │   └── error.interceptor.ts    ← Captura 401/403/500
│   │   └── models/
│   │       └── api-response.model.ts   ← ApiResponse<T>, PagedResult<T>, PaginationParams
│   ├── auth/
│   │   ├── auth.service.ts             ← Login, logout, getToken, currentUser$
│   │   ├── auth.guard.ts
│   │   └── admin.guard.ts
│   ├── components/
│   │   ├── spinner/
│   │   │   └── spinner.component.ts    ← <app-spinner size="sm|md|lg" [color]="...">
│   │   ├── skeleton-list/
│   │   │   └── skeleton-list.component.ts  ← <app-skeleton-list [rowCount]="5" [cols]="3">
│   │   ├── empty-loading/
│   │   │   └── empty-loading.component.ts  ← <app-empty-loading mensagem="...">
│   │   └── pagination/
│   │       └── pagination.component.ts     ← <app-pagination [pagedResult] (pageChanged)>
│   ├── directives/
│   │   └── loading-button.directive.ts ← [appLoadingBtn]="bool" — desabilita + spinner no botão
│   └── services/
│       ├── toast.service.ts            ← success/error/info/warning
│       ├── confirm-dialog.service.ts   ← await confirmDialog.confirm({ title, message, danger })
│       └── parametro-sistema.service.ts ← cache em memória de ParametroSistema
│
├── v2/                              ← VERSÃO ATIVA DO SISTEMA
│   ├── core/
│   │   └── layout/                  ← Shell, Sidebar, Header
│   └── features/
│       ├── auth/                    ← login.component.ts
│       ├── cadastros/               ← CRUDs de dados mestre
│       │   ├── navios/
│       │   ├── ncm/
│       │   ├── portos-origem/
│       │   ├── portos-destino/
│       │   ├── clientes/
│       │   ├── importadores/
│       │   ├── despachantes/
│       │   ├── exportadores/
│       │   ├── agentes-carga/
│       │   ├── fabricantes/
│       │   ├── lista-preco-lcl/
│       │   ├── despesas-cadastro/
│       │   └── modelos-despesa/
│       ├── admin/                   ← Usuários, roles
│       ├── solicitacao-orcamento/
│       ├── custo-despachante/       ← Wizard 5 etapas
│       ├── orcamento-venda/
│       └── embarque-aduana/
│
├── features/                        ← V1 (legado — não tocar)
│   ├── clientes/
│   └── templates-packlist/
│
└── shared/
    └── styles/
        └── crud-page.styles.ts      ← CRUD_STYLES: estilos inline compartilhados
```

### 4.1 Roteamento V2

```
/login                        → público

/                             → Shell (authGuard)
├── /dashboard
├── /profile
├── Cadastros (adminGuard)
│   ├── /portos-origem, /portos-destino
│   ├── /clientes, /importadores, /despachantes
│   ├── /exportadores, /agentes-carga, /fabricantes
│   ├── /navios, /ncm, /lista-preco-lcl
│   ├── /despesas-cadastro, /modelos-despesa
├── Admin (adminGuard)
│   ├── /admin/usuarios, /admin/roles
└── Operacional
    ├── /solicitacoes
    ├── /custos              ← CustoDespachante (wizard)
    ├── /orcamentos-venda
    └── /embarques
```

---

## 5. Estrutura do Backend

**Localização:** `comex133_api/`

```
comex133_api/
├── Program.cs                  ← DI, middleware pipeline, Kestrel config
├── Core/
│   ├── Auth/
│   │   └── CurrentUserContext.cs   ← Extrai userId/roles do JWT (IHttpContextAccessor)
│   ├── Database/
│   │   ├── AppDbContext.cs         ← EF DbContext + configurações de FK/índices
│   │   └── DbInitializer.cs        ← Auto-migrate + seeds na startup
│   ├── Exceptions/
│   │   ├── NotFoundException.cs    → HTTP 404
│   │   ├── BusinessException.cs    → HTTP 422
│   │   └── ValidationException.cs  → HTTP 400 com lista de erros por campo
│   ├── Middleware/
│   │   └── ExceptionMiddleware.cs  ← Captura exceções → ApiResponse padronizado
│   ├── Models/
│   │   └── ApiResponse.cs          ← ApiResponse<T>, PagedResult<T>
│   └── Extensions/
│       └── ServiceCollectionExtensions.cs  ← DI: EF, Auth, Swagger, CORS, Storage
│
├── Domain/
│   └── Entities/               ← 50+ entidades EF (só propriedades + navegação)
│
├── Features/                   ← Serviços + DTOs + Validators por domínio
│   ├── Auth/
│   ├── Cadastros/*             ← Padrão: Service + Dtos + (opcional) Validator
│   ├── CustosDespachante/
│   ├── OrcamentosVenda/
│   ├── SolicitacoesOrcamento/
│   ├── Parametros/
│   └── Uploads/
│
├── Controllers/                ← Controllers REST; sem lógica de negócio
│   └── *.cs
│
├── Infrastructure/
│   └── Storage/
│       ├── IStorageService.cs      ← interface: SaveAsync, DeleteAsync
│       ├── StorageResult.cs        ← DTO: RelativePath, Url, FileName
│       └── LocalStorageService.cs  ← Implementação local (wwwroot/uploads/)
│
└── Migrations/                 ← Histórico EF (não editar manualmente)
```

### 5.1 Padrão de feature no backend

```csharp
// Features/MeuDominio/
MeuDominioService.cs    ← Lógica de negócio + queries EF; injetado nos controllers
MeuDominioDto.cs        ← Request e Response DTOs; nunca expor entidades diretamente
MeuDominioValidator.cs  ← FluentValidation (opcional; só quando regras são complexas)
```

### 5.2 Tratamento de erros (backend)

| Exceção | HTTP | Quando usar |
|---------|------|-------------|
| `NotFoundException` | 404 | Registro não encontrado |
| `BusinessException` | 422 | Regra de negócio violada (ex: status inválido) |
| `ValidationException` | 400 | Dados inválidos com lista de erros por campo |
| Exceção genérica | 500 | Erros inesperados (stack trace omitido em produção) |

---

## 6. Modelagem de Dados

### 6.1 Diagrama ER simplificado

```
AUTENTICAÇÃO
────────────
Usuario ─── UsuarioRole ─── Role
Usuario ─── RefreshToken
Usuario ─── UsuarioVinculo (TipoVinculo + EntidadeId)

CADASTROS (Master Data)
───────────────────────
PortoOrigem   PortoDestino   Cliente   Importador
Exportador    Despachante    AgenteCarga  Fabricante
Ncm           ListaPrecoLcl  DespesaCatalogo  ParametroSistema
ModeloDespesa ─── ModeloDespesaItem
Navio ─── NavioTrajeto

FLUXO OPERACIONAL
─────────────────
SolicitacaoOrcamento
  ├─ SolicitacaoOrcamentoDespachante[]
  ├─ SolicitacaoOrcamentoDocumento[]     ← upload de packlist
  ├─ CustoDespachante[] (1:N)
  │    ├─ CustoDespachanteLi[]           ← itens de LI (mercadorias)
  │    ├─ CustoDespachanteDespesa[]      ← despesas operacionais
  │    └─ NcmVinculadoCusto[]
  │         └─ ValorImpostoCusto[]       ← II, IPI, PIS, COFINS, ICMS
  └─ OrcamentoVenda[] (1:N)
       ├─ OrcamentoVendaDespesa[]
       ├─ OrcamentoVendaDespesaExtra[]
       ├─ OrcamentoVendaCusto[]          ← link N:M com CustoDespachante
       └─ custoInternoId (FK nullable)   ← custo posterior pós-aprovação
           → CustoDespachante

EmbarqueNavioVinculo
  SolicitacaoOrcamentoId + NavioId + NavioTrajetoId
```

### 6.2 Campos-chave das entidades operacionais

**SolicitacaoOrcamento:**
```
CodigoInterno (único, gerado automaticamente)
ClienteId, ImportadorId (nullable), PortoOrigemId, PortoDestinoId
TamContainer ("20"|"40"|"LCL"), Peso, Observacao
Status: Rascunho → AguardandoDespachante → EmAndamento → Finalizado | Cancelado
```

**CustoDespachante:**
```
CodigoInterno (único, gerado automaticamente)
DespachanteId, SolicitacaoOrcamentoId (nullable — custo pode ser avulso)
PortoOrigemId, PortoDestinoId, Responsavel, Data
Peso, FobUsd, FobReais, CifUsd, CifReais
SeguroUsd, FreteInternacionalUsd, TaxaUsd, ParametroUsd
TotalGeralManual (nullable — override manual do total)
Versao (int, default 1), VersaoAnteriorId (FK self-ref nullable)
Status: Pendente → EmAndamento → Finalizado | ReabertoPeloOV
```

**OrcamentoVenda:**
```
CodigoInterno (único, gerado automaticamente)
ClienteId, SolicitacaoOrcamentoId (nullable)
VersaoAnteriorId (FK self-ref nullable)
PesoBruto, PesoLiquido, FreteInternacional, CifReais, FobReais
TaxaUsd, Honorarios, TotalImpostos, TotalDespesas, TotalExtras, TotalGeral
CustoInternoId (FK nullable → CustoDespachante) ← custo pós-aprovação
Status: Aguardando → EmAndamento → Finalizado | Cancelado
```

### 6.3 Versionamento (CustoDespachante e OrcamentoVenda)

- Cada reabertura cria **nova linha** com `Versao = N+1`
- `VersaoAnteriorId` forma linked-list para histórico completo
- Apenas a versão mais recente é editável
- No frontend, a árvore de versões é exibida inline com CSS `.version-tree`

---

## 7. Fluxo Operacional e Regras de Negócio

### 7.1 Fluxo completo

```
1. Comercial cria SolicitacaoOrcamento
   Status: Rascunho → AguardandoDespachante
   (vincula despachantes + faz upload do packlist)

2. Para cada despachante selecionado:
   CustoDespachante criado → Status: Pendente

3. Despachante abre o wizard e preenche:
   Status: EmAndamento
   Passo 1: Dados Básicos (FOB/CIF, taxa, peso, portos)
   Passo 2: Mercadorias / LI (itens da declaração de importação)
   Passo 3: Despesas operacionais (porto, armazenagem, etc.)
   Passo 4: NCMs + alíquotas (II, IPI, PIS, COFINS, ICMS)
   Passo 5: Resumo + Finalizar
   Status: Finalizado

4. Com ≥ 1 custo finalizado:
   Comercial cria OrcamentoVenda (consolida custos + honorários)
   Status: Aguardando → EmAndamento → Finalizado

5. Se ajuste necessário:
   OV reabre custo → CustoDespachante.Status = ReabertoPeloOV
   Nova versão criada (Versao++, VersaoAnteriorId = versão anterior)

6. Pós-aprovação do cliente:
   OV finalizada pode vincular custo interno adicional
   via OrcamentoVenda.CustoInternoId (sem gerar nova versão da OV)

7. Embarque:
   EmbarqueNavioVinculo associa a solicitação a um navio + trajeto
```

### 7.2 Cálculos financeiros (CustoDespachante)

```
CIF USD  = FOB USD + Frete Internacional + Seguro
FOB R$   = FOB USD × Taxa Dólar
CIF R$   = CIF USD × Taxa Dólar

Bidirecional:
  Preencher FOB USD → Parâmetro deriva (Parâmetro = FOB / Peso)
  Preencher Parâmetro → FOB USD calcula (FOB = Peso × Parâmetro)
  Taxa Dólar: 4 casas decimais (ex: 5,2239)
```

### 7.3 RBAC — Controle de acesso

**`UsuarioVinculo`** liga `UsuarioId + TipoVinculo + EntidadeId`

Exemplo: Despachante X tem `{ TipoVinculo="Despachante", EntidadeId=<id do despachante> }`.  
O backend filtra `CustoDespachante` pelo `DespachanteId` vinculado automaticamente.

### 7.4 ParametroSistema

Configurações do sistema armazenadas como chave/valor no banco.

| Chave | Valor padrão | Uso |
|-------|-------------|-----|
| `empresa.nomeExibicao` | `Ominium S/A` | Nome exibido no preview de OrcamentoVenda |

**Frontend:** `parametro-sistema.service.ts` faz cache em memória após o primeiro `GET /api/parametros/chave/{chave}`.

Para adicionar uma nova configuração: inserir seed em `DbInitializer.cs` + buscar via `ParametroSistemaService.GetValor(chave)`.

---

## 8. API — Endpoints e Padrões

### 8.1 Padrão REST

```
GET    /api/{entidade}?page=1&pageSize=20  → PagedResult<T>
GET    /api/{entidade}/{id}               → T
POST   /api/{entidade}                    → T criado
PUT    /api/{entidade}/{id}               → T atualizado
DELETE /api/{entidade}/{id}               → { success }

Ações de estado:
PATCH  /api/{entidade}/{id}/iniciar
PATCH  /api/{entidade}/{id}/finalizar
PATCH  /api/{entidade}/{id}/reabrir
PATCH  /api/{entidade}/{id}/cancelar
```

### 8.2 Endpoints de autenticação

```
POST  /api/auth/login    { email, senha }    → { accessToken, refreshToken, expiresIn }
POST  /api/auth/refresh  { refreshToken }    → { accessToken, refreshToken, expiresIn }
POST  /api/auth/logout   { refreshToken }    → { success }
GET   /api/auth/me                           → { id, email, nomeCompleto, roles }
```

JWT expira em 60 min. Refresh Token: 7 dias, single-use com rotação automática.

### 8.3 Endpoints operacionais

```
── SolicitacoesOrcamento ──────────────────────────────────────
GET/POST/PUT/DELETE   /api/solicitacoes-orcamento[/{id}]
POST/GET              /api/solicitacoes-orcamento/{id}/despachantes
POST/GET              /api/solicitacoes-orcamento/{id}/documentos

── CustosDespachante ──────────────────────────────────────────
GET/POST/PUT/DELETE   /api/custos-despachante[/{id}]
PATCH                 /api/custos-despachante/{id}/iniciar
PATCH                 /api/custos-despachante/{id}/finalizar
PATCH                 /api/custos-despachante/{id}/reabrir
POST                  /api/custos-despachante/{id}/lis
POST                  /api/custos-despachante/{id}/despesas
POST                  /api/custos-despachante/{id}/ncms
POST                  /api/custos-despachante/{id}/ncms/{ncmId}/valores-imposto

── OrcamentosVenda ────────────────────────────────────────────
GET/POST/PUT/DELETE   /api/orcamentos-venda[/{id}]
PATCH                 /api/orcamentos-venda/{id}/finalizar
PATCH                 /api/orcamentos-venda/{id}/cancelar
PATCH                 /api/orcamentos-venda/{id}/reabrir
PATCH                 /api/orcamentos-venda/{id}/custo-interno  ← vincular custo pós-aprovação

── Uploads ────────────────────────────────────────────────────
POST                  /api/uploads?subfolder=packlist   → { url, relativePath, fileName }
DELETE                /api/uploads?relativePath=...

── Parâmetros ─────────────────────────────────────────────────
GET                   /api/parametros/chave/{chave}     → { chave, valor }

── Utilitários ────────────────────────────────────────────────
GET /api/health   → { status, timestamp, version, environment, database }
GET /             → redirect /swagger
```

### 8.4 Entidades de cadastro disponíveis

```
clientes, importadores, exportadores, despachantes, agentes-carga,
fabricantes, navios, ncms, portos-origem, portos-destino,
lista-preco-lcl, despesas-catalogo, modelos-despesa,
usuarios, roles
```

### 8.5 Formato padrão de respostas

**Sucesso:**
```json
{ "success": true, "data": { ... }, "message": null }
```

**Erro:**
```json
{ "success": false, "data": null, "message": "Descrição", "errors": ["campo: msg"] }
```

**Paginado:**
```json
{ "items": [...], "totalCount": 150, "page": 1, "pageSize": 20,
  "totalPages": 8, "hasNextPage": true, "hasPreviousPage": false }
```

---

## 9. Autenticação e Segurança

### 9.1 Estado atual (protótipo)

O **`AuthService`** do frontend é uma implementação em memória com usuários hardcoded:

```typescript
// auth.service.ts — protótipo
usuarios = [
  { username: 'admin',      senha: 'admin123',    role: 'admin' },
  { username: 'despachante', senha: 'desp123',   role: 'despachante' },
  { username: 'cliente',    senha: 'cliente123',  role: 'cliente' },
]
// token armazenado em localStorage como "fake-jwt-{id}-{timestamp}"
```

O **`AuthInterceptor`** injeta esse token via `Authorization: Bearer ...` em todas as requisições HTTP. **Em produção**, o `AuthService` deve ser substituído por implementação real que consuma `/api/auth/login` e `/api/auth/refresh`.

### 9.2 Backend (produção)

| Proteção | Detalhe |
|---------|---------|
| JWT | expira em 60 min; claims: sub, email, name, role[], jti |
| Refresh Token Rotation | single-use; reuso detectado revoga toda a sessão |
| BCrypt | work factor 12+ |
| Rate Limit | 5 falhas de login por IP a cada 5 min |
| CORS | whitelist: localhost:4200, viaveritascomex.com.br |
| RBAC | role-based + filtro de entidade via UsuarioVinculo |

---

## 10. Banco de Dados

### 10.1 Conexão (desenvolvimento)

```
Server=bd.iron.hostazul.com.br,3533
Database=304_comex133_dev
User=304_leandro
TrustServerCertificate=True
```

### 10.2 Índices únicos (constraints de negócio)

```
Usuario.Email
RefreshToken.Token
ParametroSistema.Chave
Ncm.CodigoNcm
SolicitacaoOrcamento.CodigoInterno
CustoDespachante.CodigoInterno
OrcamentoVenda.CodigoInterno
ControleNavio.NumeroViagem
```

### 10.3 Regras de cascade

- **Cascade delete:** filhos de registros operacionais (Lis, Despesas, Ncms dentro do CustoDespachante)
- **Restrict:** FKs para dados de cadastro — impede excluir entidade em uso
- **SetNull:** `OrcamentoVenda.CustoInternoId` ao excluir o custo vinculado
- **Sem soft delete:** exclusão é permanente (auditoria é melhoria futura)

### 10.4 Histórico de migrations

```
20260416225952_InitialCreate
20260416234936_AddIdentity
20260417001626_AddCadastros
20260417004453_SeedPhase3Cadastros
20260417011551_AddFase4SolicitacoesOrcamento
20260417135109_AddControleNavios
20260417185552_Phase5NaviosCadastroETrajetoOperacional
20260423194211_AddUsuarioVinculos
20260423235703_OP_FluxoOperacional
20260424141201_OV_VersionamentoReabertura
20260428193000_AddFreteInternacionalUsdToCustoDespachante
20260430223000_AddParametroUsdToCustoDespachante
20260430230000_AddTotalGeralManualToCustoDespachante
20260512120000_AddCustoInternoIdToOrcamentoVenda      ← custo pós-aprovação
```

### 10.5 Startup automático

`DbInitializer.Initialize()` roda na startup e:
1. Aplica migrations pendentes (`MigrateAsync()`)
2. Executa seeds se tabelas-chave estiverem vazias

---

## 11. Componentes e Padrões de UI

### 11.1 Biblioteca de componentes (core)

#### `<app-spinner>`
Spinner CSS puro para indicar carregamento inline.

```html
<app-spinner size="sm|md|lg" [color]="'#fff'"></app-spinner>
```

Tamanhos: `sm` = 14px, `md` = 20px (padrão), `lg` = 32px.  
Cor padrão: `--color-primary`. Aceita qualquer cor via `color`.

#### `<app-skeleton-list>`
Linhas animadas (shimmer) para substituir tabelas durante carregamento.

```html
<app-skeleton-list [rowCount]="6" [cols]="4"></app-skeleton-list>
```

`cols` controla quantas células por linha (1–4). Tamanhos das células variam para simular colunas reais.

#### `<app-empty-loading>`
Bloco centralizado com spinner + mensagem para estados de espera dentro de seções.

```html
<app-empty-loading mensagem="Carregando dados..."></app-empty-loading>
```

#### `[appLoadingBtn]`
Diretiva aplicada a `<button>`: desabilita o botão e exibe spinner CSS enquanto `true`.

```html
<button class="btn btn-primary" (click)="salvar()" [appLoadingBtn]="isSaving">
  💾 Salvar
</button>
```

O spinner do botão usa `::after` com `--btn-spinner-color`:
- `btn-primary` → spinner branco (padrão)
- `btn-secondary` / `btn-icon` → spinner na cor primária

#### `<app-pagination>`
Componente de paginação para resultados paginados.

```html
<app-pagination
  *ngIf="pagedResult"
  [pagedResult]="pagedResult"
  (pageChanged)="onPageChange($event)"
/>
```

`pageChanged` emite `PaginationParams { page, pageSize }`.

### 11.2 Padrões globais de CSS (`styles.scss`)

#### Loading Overlay
Para bloquear uma seção durante operação assíncrona:

```html
<div class="card loading-overlay-host">
  <div class="loading-overlay" *ngIf="isSaving">
    <app-spinner size="lg"></app-spinner>
  </div>
  <!-- conteúdo da seção -->
</div>
```

A classe `.loading-overlay-host` exige `position: relative` no container;  
`.loading-overlay` fica `position: absolute; inset: 0` com fundo semitransparente.

#### CRUD_STYLES (inline styles compartilhados)

Importar em qualquer componente de página:

```typescript
import { CRUD_STYLES } from '../../../../shared/styles/crud-page.styles';

@Component({
  styles: CRUD_STYLES,
})
```

Inclui: `.container-standard`, `.dashboard-header`, `.content-section`, `.toolbar`,  
`.data-table`, `.form-grid`, `.field`, `.field.w2`, `.field.w3`,  
`.card`, `.actions`, `.badge-active`, `.badge-inactive`, `.row-actions`,  
`.btn`, `.btn-primary`, `.btn-secondary`, `.btn-icon`, `.btn-icon.danger`,  
`.empty-state`, `.detail-header`, `.required`, `.err-msg`, `.search`.

### 11.3 Toast Service

```typescript
this.toast.success('Registro salvo com sucesso.');
this.toast.error('Erro ao salvar. Tente novamente.');
this.toast.info('Este registro está em modo somente leitura.');
this.toast.warning('Atenção: campo obrigatório não preenchido.');
```

### 11.4 Confirm Dialog

```typescript
const ok = await this.confirmDialog.confirm({
  title: 'Excluir registro',
  message: 'Esta ação não pode ser desfeita.',
  confirmText: 'Excluir',
  cancelText: 'Cancelar',
  danger: true  // botão vermelho
});
if (!ok) return;
```

---

## 12. Padrões de Código

### 12.1 Padrão de componente CRUD

Todo componente de CRUD segue esta estrutura:

```typescript
@Component({ standalone: true, styles: CRUD_STYLES, ... })
export class MinhaEntidadeComponent implements OnInit {
  items: MinhaEntidade[] = [];
  q = '';                            // busca local (filter client-side)
  loading = false;                   // skeleton durante load
  isSaving = false;                  // loading button durante save
  hasLoadError = false;
  loadErrorMessage = '';
  showForm = false;
  showErrors = false;                // exibir erros de validação local
  editing: MinhaEntidade | null = null;
  apiFieldErrors: Record<string, string[]> = {};

  form = { campo1: '', campo2: '', ativo: true };

  // Filtragem client-side
  get filtered(): MinhaEntidade[] { ... }

  // Abrir formulário (novo ou edição)
  openForm(item?: MinhaEntidade): void {
    this.editing = item ?? null;
    this.showErrors = false;
    this.apiFieldErrors = {};
    this.form = item ? { ...mapeamento } : { ...vazio };
    this.showForm = true;
  }

  // Salvar (create ou update)
  save(): void {
    this.showErrors = true;
    this.apiFieldErrors = {};
    if (!this.form.campo1.trim()) return;  // validação local

    this.isSaving = true;
    const op = this.editing
      ? this.service.update({ ...this.editing, ...data })
      : this.service.create(data);

    op.subscribe({
      next: () => { this.isSaving = false; this.toast.success('...'); this.cancel(); this.load(); },
      error: err => {
        this.isSaving = false;
        this.apiFieldErrors = this.collectFieldErrors(err);
        if (!Object.keys(this.apiFieldErrors).length)
          this.toast.error(err?.message ?? 'Erro ao salvar.');
      }
    });
  }

  async remove(id: string): Promise<void> {
    const ok = await this.confirmDialog.confirm({ ... });
    if (!ok) return;
    this.service.remove(id).subscribe({ next: () => this.load(), error: ... });
  }

  // Erros de campo da API (normaliza chave para lowercase)
  hasApiFieldError(...keys: string[]): boolean { ... }
  firstApiFieldError(...keys: string[]): string { ... }
  private collectFieldErrors(err: any): Record<string, string[]> {
    return ApiErrorMapper.mapError(err).fieldErrors;
  }
}
```

### 12.2 Padrão de loading em lista + tabela

```html
<!-- Skeleton enquanto carrega -->
<app-skeleton-list *ngIf="loading" [rowCount]="5" [cols]="3"></app-skeleton-list>

<!-- Erro de carga -->
<div class="empty-state" *ngIf="!loading && hasLoadError" style="color:#b91c1c">
  {{ loadErrorMessage }}
  <button class="btn btn-secondary" (click)="retryLoad()">Tentar novamente</button>
</div>

<!-- Tabela após carregar -->
<table class="data-table" *ngIf="!loading && !hasLoadError">
  ...
</table>
```

### 12.3 Padrão de erros de campo da API

No template, aplicar em cada campo:

```html
<input
  [(ngModel)]="form.nome"
  [class.err]="showErrors && (!form.nome.trim() || hasApiFieldError('nome', 'name'))"
/>
<!-- Erro de validação local -->
<span class="err-msg" *ngIf="showErrors && !form.nome.trim()">Nome é obrigatório</span>
<!-- Erro retornado pela API -->
<span class="err-msg" *ngIf="showErrors && hasApiFieldError('nome', 'name')">
  {{ firstApiFieldError('nome', 'name') }}
</span>
```

`hasApiFieldError` e `firstApiFieldError` aceitam múltiplas chaves porque a API pode retornar em português (`nome`) ou inglês (`name`) dependendo do FluentValidation.

### 12.4 ApiErrorMapper

`ApiErrorMapper.mapError(err)` retorna `{ message: string, fieldErrors: Record<string, string[]> }`.

- `fieldErrors` é normalizado para lowercase nas chaves
- Se a API retornar erros de campo: exibir por campo (não usar toast)
- Se não houver erros de campo: usar `toast.error(err?.message ?? 'Erro genérico')`

### 12.5 Padrão de serviço HTTP

```typescript
@Injectable({ providedIn: 'root' })
export class MinhaEntidadeService {
  private readonly baseUrl = '/api/minha-entidade';

  constructor(private api: ApiClientService) {}

  getAll(): Observable<MinhaEntidade[]> {
    return this.api.get<ApiResponse<MinhaEntidade[]>>(this.baseUrl)
      .pipe(map(r => r.data ?? []));
  }

  getPaged(page: number, pageSize: number): Observable<PagedResult<MinhaEntidade>> {
    return this.api.get<PagedResult<MinhaEntidade>>(
      `${this.baseUrl}?page=${page}&pageSize=${pageSize}`
    );
  }

  create(data: Omit<MinhaEntidade, 'id'>): Observable<MinhaEntidade> {
    return this.api.post<ApiResponse<MinhaEntidade>>(this.baseUrl, data)
      .pipe(map(r => r.data!));
  }

  update(data: MinhaEntidade): Observable<MinhaEntidade> {
    return this.api.put<ApiResponse<MinhaEntidade>>(`${this.baseUrl}/${data.id}`, data)
      .pipe(map(r => r.data!));
  }

  remove(id: string): Observable<void> {
    return this.api.delete<void>(`${this.baseUrl}/${id}`);
  }
}
```

### 12.6 Convenções gerais

**Frontend:**
- Componentes standalone (Angular 18); sem `NgModule`
- Lazy loading em todas as rotas (`loadComponent(() => import(...))`)
- `[(ngModel)]` para formulários simples; sem `ReactiveFormsModule` no padrão atual
- PascalCase para classes/interfaces; kebab-case para arquivos e rotas
- Nenhum `console.log` em código de produção (exceto componentes v1 legados)

**Backend:**
- Async/await em todo acesso a dados
- DTOs explícitos — nunca retornar entidades EF diretamente
- Injeção de dependência via construtor
- Nomes: PascalCase para classes/propriedades; kebab-case para rotas
- `[Authorize]` em todos os controllers; exceções marcadas com `[AllowAnonymous]`

---

## 13. Como Adicionar uma Nova Feature

### 13.1 Nova tela de cadastro (CRUD simples)

**1. Modelo (`models/`):**
```typescript
export interface MinhaEntidade {
  id: string;
  nome: string;
  ativo: boolean;
}
```

**2. Serviço (`services/`):**
Seguir padrão da seção 12.5 acima.

**3. Componente de página (`pages/`):**
Seguir padrão da seção 12.1 acima.

**4. Rota (`app.routes.ts` ou arquivo de rotas da feature):**
```typescript
{
  path: 'minha-entidade',
  canActivate: [adminGuard],
  loadComponent: () => import('./v2/features/cadastros/minha-entidade/pages/minha-entidade.component')
    .then(m => m.MinhaEntidadeComponent)
}
```

**5. Sidebar** (`v2/core/layout/sidebar.component.ts`): adicionar item de menu.

**6. Backend:** `Controller` + `Service` + `DTOs` + registrar DI em `ServiceCollectionExtensions.cs`.

### 13.2 Nova tela operacional (com wizard)

O `CustoDespachante` é o modelo de referência para wizards multi-step:
- Estado do passo: `step = 1..N`, `completedSteps = new Set<number>()`
- Dados por passo em objetos separados: `p1 = {...}`, `p2 = [...]`, etc.
- `validateP1()`, `validateP2()` ... validações por passo
- Salvar parcial ("Salvar" → status `EmAndamento`) vs finalizar ("Finalizar" → valida tudo)
- `modoVisualizacao = true` torna tudo readonly

### 13.3 Novo endpoint da API

1. Criar/editar `Service` em `Features/`
2. Criar `Controller` em `Controllers/` — injetar o service, nenhuma lógica de negócio no controller
3. Registrar o service em `ServiceCollectionExtensions.cs`
4. Se alterar o banco: criar migration com `dotnet ef migrations add NomeDaMigration`

---

## 14. Storage e Upload de Arquivos

### 14.1 Abstração de armazenamento

O backend usa a interface `IStorageService` para desacoplar o provedor de armazenamento:

```csharp
public interface IStorageService {
  Task<StorageResult> SaveAsync(IFormFile file, string subfolder);
  Task<bool> DeleteAsync(string relativePath);
}
```

**Implementação atual:** `LocalStorageService` — salva em `wwwroot/uploads/{subfolder}/`.  
**Trocar de provedor:** criar `AzureBlobStorageService : IStorageService` e alterar 1 linha em `ServiceCollectionExtensions.cs`. Zero impacto nos controllers ou frontend.

### 14.2 Endpoint de upload

```
POST /api/uploads?subfolder=packlist
Content-Type: multipart/form-data
Body: { file: File }
→ { url: "https://...", relativePath: "packlist/arquivo.xlsx", fileName: "arquivo.xlsx" }

DELETE /api/uploads?relativePath=packlist/arquivo.xlsx
```

Limite: 50 MB por arquivo (configurado no Kestrel e no controller).

### 14.3 Frontend — upload de arquivo

```typescript
const formData = new FormData();
formData.append('file', file);
this.api.uploadFile<{ url: string }>('/api/uploads?subfolder=packlist', formData)
  .subscribe({ next: r => this.form.linkDocumento = r.url, error: ... });
```

`uploadFile` no `ApiClientService` não define `Content-Type` (deixa o browser setar o boundary do multipart automaticamente).

### 14.4 Arquivos não versionados

`comex133_api/wwwroot/uploads/` está no `.gitignore`. Arquivos enviados por usuários **nunca** são commitados.

---

## 15. Status das Fases de Desenvolvimento

| Fase | Nome | Status |
|------|------|--------|
| 1 | Core Infrastructure | ✅ Completo |
| 2 | Auth & Authorization | ✅ Completo (backend produção) |
| 3 | Cadastros (13 telas) | ✅ Completo |
| 4 | Fluxo Operacional | ✅ Completo |
| 5 | Navios e Embarque | ✅ Completo |
| 6 | UX Loading & Feedback | ✅ Completo |
| 7 | Upload real de arquivos | ✅ Completo |
| 8 | Custo interno pós-aprovação | ✅ Completo |
| 9 | ParametroSistema configurável | ✅ Completo |

**Melhorias futuras (não priorizadas):**
- Auditoria de alterações (log who/what/when)
- Relatórios e dashboards (KPIs de custo, análise de importações)
- Substituição do auth de protótipo por JWT real no frontend
- Multi-tenancy
- Integração com APIs aduaneiras (cotações em tempo real)
- Notificações em tempo real (WebSockets / SSE)

---

## 16. Deploy e Infraestrutura

### 16.1 Frontend

```bash
ng build --configuration production
# Saída: dist/import-costs/browser/   (HTML/CSS/JS estático)
# Hospedagem: IIS com web.config configurado para SPA routing (rewrite rules)
```

### 16.2 Backend

```bash
dotnet publish -c Release -o ./publish
# Hospedagem: IIS + ASP.NET Core Hosting Module
# Migrations: aplicadas automaticamente no startup via DbInitializer
# Script: deploy.ps1 (FTP upload para hostazul)
```

### 16.3 Variáveis de ambiente

```json
// appsettings.json (versionado — valores genéricos)
{
  "ConnectionStrings": { "DefaultConnection": "..." },
  "JwtSettings": { "SecretKey": "...", "Issuer": "...", "Audience": "..." },
  "Kestrel": { "Limits": { "MaxRequestBodySize": 52428800 } }
}

// appsettings.Development.json (NÃO versionado — .gitignore)
// appsettings.*.local.json    (NÃO versionado)
```

Nunca commitar credenciais. Arquivos de configuração local estão no `.gitignore`.
