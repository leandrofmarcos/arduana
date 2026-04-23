# Autorização — Documento de Refinamento

**Criado em**: 2026-04-23  
**Atualizado em**: 2026-04-23  
**Status**: P1 ✅ P2 ✅ P3 ✅ P5 ✅ P6 ✅ P7 ✅ | Feature concluída — commit `2b3f007`  
**Escopo**: `comex133_api` + `comex133_front`

---

## 1. Contexto e Objetivo

A aplicação é um sistema de **gerenciamento de aduana** (comex133). O fluxo central é:

```
SolicitacaoOrcamento
    └── SolicitacaoOrcamentoDespachante (N despachantes convidados)
            └── CustoDespachante (custo produzido pelo despachante)
    └── OrcamentoVenda (orçamento de venda produzido pelo comercial/analista)
    └── EmbarqueAduana (embarque gerado após aprovação)
            └── Documentos
            └── Vínculo com Navio (NavioTrajeto)
```

O objetivo desta feature é implementar **autorização baseada em papéis e propriedade de dados** (_role-based + ownership-based access control_), garantindo que:

- Um usuário só acessa e manipula os dados pertinentes ao seu papel.
- A propriedade de um recurso (ex.: custo de despacho) determina quem pode editar.
- Administradores têm visão e controle total.
- A mecânica é auditável e extensível.

---

## 2. Papéis Existentes

As 4 roles já seedadas no banco:

| ID | Nome | Descrição atual |
|----|------|-----------------|
| 1  | `Despachante`   | Acesso às telas operacionais de despacho aduaneiro |
| 2  | `Analista`      | Acesso à análise de solicitações e custos |
| 3  | `Gerente`       | Acesso gerencial com visualizações consolidadas |
| 4  | `Administrador` | Acesso total ao sistema, incluindo administração |

---

## 3. Gap Atual

### 3.1 Problema na API
Todos os controllers hoje estão com `[Authorize(Roles = "Administrador")]`. Isso significa:
- Somente admins conseguem chamar qualquer endpoint.
- Nenhum despachante, analista ou gerente consegue operar o sistema.

### 3.2 Ausência de vínculo usuário ↔ entidade
Não existe relação entre `Usuario` e `Despachante` (nem `Cliente`, `AgenteCarga`, etc.).  
Para que um usuário com role `Despachante` saiba **quais custos ele pode editar**, é preciso saber **a qual despachante ele representa**.

### 3.3 Sem autorização por ownership (row-level)
Não há verificação de "este recurso pertence a este usuário?" — toda lógica de autorização é apenas de role.

---

## 4. Modelagem Proposta

### 4.1 Nova tabela: `UsuarioVinculos`

Para associar um usuário a uma entidade de negócio concreta:

```sql
CREATE TABLE UsuarioVinculos (
    Id              INT PRIMARY KEY IDENTITY,
    UsuarioId       INT NOT NULL REFERENCES Usuarios(Id),
    TipoVinculo     VARCHAR(50) NOT NULL,  -- 'Despachante' | 'Cliente' | 'AgenteCarga' | 'Exportador'
    EntidadeId      INT NOT NULL,
    Ativo           BIT NOT NULL DEFAULT 1,
    CriadoEm       DATETIME2 NOT NULL,
    AtualizadoEm   DATETIME2 NOT NULL,
    UNIQUE (UsuarioId, TipoVinculo, EntidadeId)
);
```

**Rationale**: Abordagem polimórfica com `TipoVinculo + EntidadeId` é mais simples de evoluir do que criar uma FK específica por tipo de entidade na tabela `Usuarios`.  
Alternativa (mais forte em FK): colunas nullable direto no `Usuario` (`DespachanteId?`, `ClienteId?`, etc.) — mais explícita, porém mais rígida.

> ⚠️ **A decidir**: abordagem polimórfica (`UsuarioVinculos`) ou FKs nullable em `Usuario`? Ver seção 7.

### 4.2 Entidade C# correspondente

```csharp
[Table("UsuarioVinculos")]
public class UsuarioVinculo : IHasTimestamps
{
    [Key]
    public int Id { get; set; }

    public int UsuarioId { get; set; }
    public Usuario Usuario { get; set; } = null!;

    [Required, MaxLength(50)]
    public string TipoVinculo { get; set; } = string.Empty; // "Despachante", "Cliente", etc.

    public int EntidadeId { get; set; }

    public bool Ativo { get; set; } = true;

    public DateTime CriadoEm { get; set; }
    public DateTime AtualizadoEm { get; set; }
}
```

### 4.3 Extensão na entidade `Usuario`

Adicionar navegação reversa:

```csharp
public ICollection<UsuarioVinculo> Vinculos { get; set; } = new List<UsuarioVinculo>();
```

---

## 5. Permissões por Papel e Recurso

### Legenda
- ✅ Permitido
- 🔒 Somente próprios registros (ownership)
- 👁️ Somente leitura
- ❌ Negado

### 5.1 SolicitacaoOrcamento

| Ação | Administrador | Gerente | Analista | Despachante |
|------|:---:|:---:|:---:|:---:|
| Listar todas | ✅ | ✅ | ✅ | 👁️ (apenas vinculadas a ele) |
| Ver detalhe | ✅ | ✅ | ✅ | 🔒 |
| Criar | ✅ | ✅ | ✅ | ❌ |
| Editar | ✅ | ✅ | ✅ | ❌ |
| Excluir | ✅ | ❌ | ❌ | ❌ |
| Alterar status | ✅ | ✅ | ✅ | ❌ |
| Vincular Despachante | ✅ | ✅ | ✅ | ❌ |

> Um Despachante vê somente as solicitações às quais foi associado via `SolicitacaoOrcamentoDespachante`.

### 5.2 CustoDespachante

| Ação | Administrador | Gerente | Analista | Despachante |
|------|:---:|:---:|:---:|:---:|
| Listar | ✅ | ✅ | 👁️ | 🔒 (apenas os seus) |
| Ver detalhe | ✅ | ✅ | ✅ | 🔒 |
| Criar | ✅ | ❌ | ❌ | 🔒 (apenas para si) |
| Editar | ✅ | ❌ | ❌ | 🔒 |
| Finalizar | ✅ | ❌ | ❌ | 🔒 |
| Excluir | ✅ | ❌ | ❌ | ❌ |

> A verificação de ownership: `CustoDespachante.DespachanteId == UsuarioVinculo(TipoVinculo="Despachante").EntidadeId` do usuário logado.

### 5.3 OrcamentoVenda

| Ação | Administrador | Gerente | Analista | Despachante |
|------|:---:|:---:|:---:|:---:|
| Listar | ✅ | ✅ | ✅ | 👁️ (limitado) |
| Ver detalhe | ✅ | ✅ | ✅ | ❌ |
| Criar | ✅ | ✅ | ✅ | ❌ |
| Editar | ✅ | ✅ | ✅ | ❌ |
| Excluir | ✅ | ❌ | ❌ | ❌ |
| Finalizar | ✅ | ✅ | ✅ | ❌ |

> OrcamentoVenda é domínio do time comercial (Analista/Gerente/Admin).

### 5.4 EmbarqueAduana

| Ação | Administrador | Gerente | Analista | Despachante |
|------|:---:|:---:|:---:|:---:|
| Listar | ✅ | ✅ | ✅ | 👁️ (vinculados) |
| Ver detalhe | ✅ | ✅ | ✅ | 🔒 |
| Criar/Editar | ✅ | ✅ | ✅ | ❌ |
| Upload documentos | ✅ | ✅ | ✅ | 🔒 (próprios) |
| Excluir | ✅ | ❌ | ❌ | ❌ |

### 5.5 Logística / Controle de Navios

| Ação | Administrador | Gerente | Analista | Despachante |
|------|:---:|:---:|:---:|:---:|
| Visualizar painel | ✅ | ✅ | ✅ | ❌ |
| Editar trajeto | ✅ | ✅ | ❌ | ❌ |
| Vincular embarque a navio | ✅ | ✅ | ✅ | ❌ |

### 5.6 Cadastros (Despachantes, Clientes, Navios, NCMs, etc.)

| Ação | Administrador | Gerente | Analista | Despachante |
|------|:---:|:---:|:---:|:---:|
| Listar/Visualizar | ✅ | ✅ | ✅ | 👁️ (limitado) |
| Criar | ✅ | ✅ | ❌ | ❌ |
| Editar | ✅ | ✅ | ❌ | ❌ |
| Excluir/Inativar | ✅ | ❌ | ❌ | ❌ |

### 5.7 Administração (Usuários, Roles, Parâmetros)

| Ação | Administrador | Gerente | Analista | Despachante |
|------|:---:|:---:|:---:|:---:|
| Todas as ações | ✅ | ❌ | ❌ | ❌ |

---

## 6. Mecanismo de Ownership na API

### 6.1 Serviço auxiliar: `ICurrentUserContext`

```csharp
public interface ICurrentUserContext
{
    int UsuarioId { get; }
    IEnumerable<string> Roles { get; }
    bool IsAdmin { get; }
    bool HasRole(string role);

    // Retorna o EntidadeId vinculado, ou null se não houver vínculo
    Task<int?> GetVinculoIdAsync(string tipoVinculo);
}
```

Implementado via injeção de `IHttpContextAccessor` + consulta ao banco para recuperar vínculos do usuário logado (com cache por request).

### 6.2 Filtro de ownership nos services

Exemplo em `CustoDespachanteService.GetAllAsync`:

```csharp
public async Task<PagedResult<CustoDespachanteDto>> GetAllAsync(PaginationQuery pagination)
{
    var query = _db.Set<CustoDespachante>().AsNoTracking();

    if (!_currentUser.IsAdmin && !_currentUser.HasRole("Gerente"))
    {
        var despachanteId = await _currentUser.GetVinculoIdAsync("Despachante");
        if (despachanteId == null)
            return PagedResult<CustoDespachanteDto>.Empty();

        query = query.Where(x => x.DespachanteId == despachanteId);
    }

    // ... orderby, select, paginate
}
```

### 6.3 Verificação de ownership em operações de escrita

```csharp
public async Task<CustoDespachanteDto> UpdateAsync(int id, UpdateCustoDespachanteRequest request)
{
    var entity = await FindOrThrowAsync(id);

    if (!_currentUser.IsAdmin)
    {
        var despachanteId = await _currentUser.GetVinculoIdAsync("Despachante");
        if (entity.DespachanteId != despachanteId)
            throw new ForbiddenException("Você não tem permissão para editar este custo.");
    }

    // ... atualização
}
```

---

## 7. Questões em Aberto (A Refinar)

### Q1 — Abordagem de vínculo: polimórfica vs. FKs diretas

**Opção A — Polimórfica** (`UsuarioVinculos` com `TipoVinculo + EntidadeId`):
- ✅ Uma única tabela, evolui sem migration por novo tipo
- ❌ Sem FK real para as tabelas de entidade (integridade referencial fraca)
- ❌ Sem type safety no banco

**Opção B — FKs nullable em `Usuario`**:
```sql
ALTER TABLE Usuarios ADD DespachanteId INT NULL REFERENCES Despachantes(Id);
ALTER TABLE Usuarios ADD ClienteId     INT NULL REFERENCES Clientes(Id);
-- etc.
```
- ✅ FK real com integridade garantida pelo banco
- ✅ Queries mais diretas
- ❌ Uma migration para cada novo tipo de entidade vinculável
- ❌ Proliferação de colunas nullable em `Usuarios`

> **Recomendação inicial**: Opção A para protótipo; migrar para B se houver mais de 4 tipos de vínculo.

---

### Q2 — Um usuário pode representar múltiplos despachantes?

Cenário: um gestor interno da empresa que gerencia custos de 2 despachantes terceiros.

- **Sim** → a tabela `UsuarioVinculos` já suporta N vínculos por usuário.
- **Não** → adicionar `UNIQUE(UsuarioId, TipoVinculo)` para garantir 1 vínculo por tipo.

> **A definir pelo negócio.**

---

### Q3 — Despachante externo vs. interno

O `Despachante` na base representa empresa/profissional externo. Os usuários do sistema são internos (equipe da empresa) — ou também despachantes externos terão login?

- Se **externos com login**: a feature de vínculo é crítica e precisa de onboarding controlado.
- Se **somente internos**: o vínculo é para controle de quem operacionaliza o custo de cada despachante.

> **A definir pelo negócio.**

---

### Q4 — Gerente tem acesso de leitura a OrcamentoVenda mas não a CustoDespachante?

Na tabela 5.2, Gerente não edita CustoDespachante. Confirmar se faz sentido ou se Gerente deveria ter leitura (👁️) nos custos para fins de aprovação.

---

### Q5 — Solicitação: quem pode criar?

Na tabela 5.1, `Despachante` não pode criar solicitação. Confirmar: a solicitação sempre é iniciada pelo time interno (Analista/Gerente)?

---

## 8. Impacto em Tabelas Existentes

| Tabela | Mudança necessária |
|--------|--------------------|
| `Usuarios` | Adicionar `ICollection<UsuarioVinculo>` (se Opção A) |
| `UsuarioVinculos` | **Nova tabela** |
| `SolicitacoesOrcamento` | Adicionar `CriadoPorUsuarioId INT NULL` (auditoria de criação) |
| `CustoDespachante` | Campo `DespachanteId` já existe — ownership já é derivável |
| `OrcamentoVenda` | Adicionar `ResponsavelUsuarioId INT NULL` (proprietário comercial) |
| Controllers (todos) | Substituir `[Authorize(Roles = "Administrador")]` por policies granulares |

---

## 9. Estratégia de Implementação (Fases)

---

### ✅ Fase AUT-P1 — Distinção Admin × Despachante: bloquear Cadastros

> **Escopo deliberado**: apenas uma distinção — Despachante não acessa Cadastros (dados mestres).  
> **Papéis ativos**: `Administrador` (acesso total) e `Despachante` (acesso operacional, sem cadastros).

#### API (`comex133_api`)

| # | Atividade | Arquivo | Status |
|---|-----------|---------|--------|
| P1-A1 | Cadastro controllers já têm `[Authorize(Roles = "Administrador")]` — manter | todos em `Controllers/` (AgentesCarga, Clientes, Despachantes, DespesasCatalogo, Exportadores, Fabricantes, Importadores, ListaPrecoLcl, ModelosDespesa, Navios, Ncms, Parametros, PortosDestino, PortosOrigem) | ✅ Já correto |
| P1-A2 | `SolicitacoesOrcamentoController` — abrir para `Despachante` | `Controllers/SolicitacoesOrcamentoController.cs` | ✅ Implementado |

#### Frontend (`comex133_front`)

| # | Atividade | Arquivo | Status |
|---|-----------|---------|--------|
| P1-F1 | `mapUser`: detectar role `Despachante` da API → `role: 'despachante'` com permissões corretas | `features/auth/data/auth.repository.http.ts` | ✅ Implementado |
| P1-F2 | `app.routes.ts`: adicionar `canActivate: [adminGuard]` em todas as rotas de cadastros | `app/app.routes.ts` | ✅ Implementado |
| P1-F3 | `shell-v2.component.ts`: esconder bloco "Cadastros" para usuários não-admin | `v2/core/layout/shell-v2.component.ts` | ✅ Implementado |

---

### Fase AUT-P2 — Fundação de Ownership ✅ CONCLUÍDA

| ID | Tarefa | Arquivo(s) | Status |
|----|--------|-----------|--------|
| P2.1 | Criar tabela `UsuarioVinculos` (migration EF Core) | `Migrations/…AddUsuarioVinculos.cs` | ✅ Implementado |
| P2.2 | Criar entidade `UsuarioVinculo` + adicionar ao `AppDbContext` | `Domain/Entities/UsuarioVinculo.cs`, `AppDbContext.cs` | ✅ Implementado |
| P2.3 | Criar `ICurrentUserContext` + `CurrentUserContext` | `Core/Auth/ICurrentUserContext.cs`, `CurrentUserContext.cs` | ✅ Implementado |
| P2.4 | Registrar no DI via `IHttpContextAccessor` | `Core/Extensions/ServiceCollectionExtensions.cs` | ✅ Implementado |
| P2.5 | Endpoints CRUD `UsuarioVinculos` (Admin only) | `Features/UsuarioVinculos/`, `Controllers/UsuarioVinculosController.cs` | ✅ Implementado |
| P2.6 | `SolicitacoesOrcamentoService`: filtrar por vínculo Despachante | `Features/SolicitacoesOrcamento/SolicitacoesOrcamentoService.cs` | ✅ Implementado |
| P2.7 | `ForbiddenException` (HTTP 403) + middleware | `Core/Exceptions/ForbiddenException.cs`, `ExceptionHandlingMiddleware.cs` | ✅ Implementado |

### Fase AUT-P3 — Isolamento de dados por Despachante ✅ CONCLUÍDA (commit `2519698`)

| ID | Tarefa | Arquivo(s) | Status |
|----|--------|-----------|--------|
| P3.1 | `SolicitacoesOrcamentoService`: `EnsureSolicitacaoAccessAsync` (ownership check para sub-recursos) | `Features/SolicitacoesOrcamento/SolicitacoesOrcamentoService.cs` | ✅ |
| P3.2 | `GetDespachantesAsync`: filtrar ao próprio registro quando Despachante | idem | ✅ |
| P3.3 | `GetDocumentosAsync`: usar `EnsureSolicitacaoAccessAsync` | idem | ✅ |
| P3.4 | Operações de escrita em Solicitações → `[Authorize(Roles = "Administrador")]` (Create/Update/Delete/AddDespachante/RemoveDespachante/AddDocumento/RemoveDocumento) | `Controllers/SolicitacoesOrcamentoController.cs` | ✅ |
| P3.5 | `EmbarqueNavioVinculoController` GET → aberto para `Administrador,Despachante` | `Controllers/EmbarqueNavioVinculoController.cs` | ✅ |
| P3.6 | `NaviosService`: injetar `ICurrentUserContext`; ownership check em `GetVinculoAsync`; filtro por despachante em `GetControleNaviosOperacionalCoreAsync` | `Features/Navios/NaviosService.cs` | ✅ |
| P3.7 | `LogisticaController` → `[Authorize(Roles = "Administrador,Despachante")]` | `Controllers/LogisticaController.cs` | ✅ |

> **Observação**: `SetStatus` (PATCH `/{id}/status`) ficou sem a restrição de Despachante — corrigir em P5.

---

### Fase AUT-P4 — Frontend avançado
- [ ] AUT-P4.1: Esconder botões de ação (editar/excluir) por role
- [ ] AUT-P4.2: Tela de gerenciamento de vínculos usuário ↔ despachante (Admin)
- [ ] AUT-P4.3: Tratar 403 Forbidden nos services Angular com mensagem amigável

---

### Fase AUT-P5 — Correção do Eager Loading dos Serviços de Catálogo

#### Problema identificado

Todos os 13 serviços de cadastro (`ClienteV2Service`, `ImportadorService`, `DespachanteV2Service`, `PortoOrigemService`, `PortoDestinoService`, `NcmService`, `DespesaCadastroService`, `AgenteCargaService`, `ExportadorService`, `FabricanteService`, `NaviosCadastroService`, `ModeloDespesaService`, `ListaPrecoLclService`) são `@Injectable({ providedIn: 'root' })` — **singletons globais** — e chamam `this.refresh()` **no constructor**.

O `DashboardV2Component` (rota padrão pós-login) injeta 7 desses serviços → Angular os instancia ao renderizar o dashboard → **7 requisições GET simultâneas** disparam para endpoints de cadastro → todas retornam **403 Forbidden** para usuários Despachante.

**Causa raiz dupla**:
1. Serviços fazem fetch no constructor (eager load), não no primeiro acesso (lazy load).
2. O Dashboard carrega dados de cadastro independente do papel do usuário.

#### Serviços afetados (fetch no constructor)

| Serviço | Endpoint disparado | Quem instancia primeiro |
|---------|-------------------|------------------------|
| `ClienteV2Service` | `GET /clientes?page=1&pageSize=100` | Dashboard |
| `ImportadorService` | `GET /importadores?…` | Dashboard |
| `DespachanteV2Service` | `GET /despachantes?…` | Dashboard |
| `PortoOrigemService` | `GET /portos-origem?…` | Dashboard / Solicitações |
| `PortoDestinoService` | `GET /portos-destino?…` | Dashboard / Solicitações |
| `NcmService` | `GET /ncms?…` | Dashboard |
| `DespesaCadastroService` | `GET /despesas-catalogo?…` | Dashboard |
| `AgenteCargaService` | `GET /agentes-carga?…` | Solicitações / Embarque |
| `ExportadorService` | `GET /exportadores?…` | Solicitações |
| `FabricanteService` | `GET /fabricantes?…` | Solicitações |
| `NaviosCadastroService` | `GET /navios?…` | Embarque / Controle |
| `ModeloDespesaService` | `GET /modelos-despesa?…` | Custo Despachante |
| `ListaPrecoLclService` | `GET /lista-preco-lcl?…` | Orçamento Venda |

#### Solução proposta

**A — Lazy load nos serviços**: Remover `this.refresh()` do constructor; disparar fetch na primeira chamada real de `getAll()`. Serviços nunca mais carregam automaticamente ao iniciar.

**B — Dashboard role-aware**: `DashboardV2Component` não usa serviços de cadastro para Despachante. Exibe um dashboard alternativo com as solicitações vinculadas ao despachante logado.

**C — Silenciar 403 nos serviços**: Quando o fetch retorna 403, marcar `loaded = true` com array vazio (não tentar novamente, não logar como erro).

#### Atividades

| ID | Tarefa | Arquivo(s) |
|----|--------|-----------|
| P5-A1 | Remover `this.refresh()` do constructor dos 13 serviços de cadastro; implementar lazy-load em `getAll()` (if not loaded → fetch; else return cache) | Todos os `*.service.ts` de `cadastros/` |
| P5-A2 | Silenciar 403 no handler `error` dos serviços: `if (err.status === 403) { this.loaded = true; return; }` | idem |
| P5-A3 | `DashboardV2Component`: detectar role via `AuthService`; para Admin/Gerente/Analista manter KPIs de cadastro; para Despachante exibir painel alternativo com contagem de solicitações próprias | `v2/features/dashboard/dashboard.component.ts` |
| P5-A4 | Corrigir bug: `SetStatus` (PATCH `/{id}/status`) em `SolicitacoesOrcamentoController` — adicionar `[Authorize(Roles = "Administrador")]` (Despachante não deve alterar status) | `Controllers/SolicitacoesOrcamentoController.cs` |

---

### Fase AUT-P6 — Backend: Abertura Completa de Roles (Gerente e Analista)

#### Problema

Atualmente todos os endpoints ainda têm `[Authorize(Roles = "Administrador")]` no nível de controller, ou estão abertos apenas para `Administrador,Despachante`. Usuários com roles `Gerente` e `Analista` **não conseguem usar nenhuma funcionalidade operacional do sistema**.

#### Política por controller (visão completa)

| Controller / Endpoint | Administrador | Gerente | Analista | Despachante |
|----------------------|:---:|:---:|:---:|:---:|
| **Cadastros — GET (listar/buscar)** | ✅ | ✅ | ✅ | ❌ (exceto Despachantes: 👁️) |
| **Cadastros — POST/PUT/DELETE** | ✅ | ✅ | ❌ | ❌ |
| **Cadastros — PATCH ativo** | ✅ | ✅ | ❌ | ❌ |
| **SolicitacoesOrcamento — GET** | ✅ | ✅ | ✅ | 🔒 (ownership) |
| **SolicitacoesOrcamento — POST Create** | ✅ | ✅ | ✅ | ❌ |
| **SolicitacoesOrcamento — PUT Update** | ✅ | ✅ | ✅ | ❌ |
| **SolicitacoesOrcamento — PATCH Status** | ✅ | ✅ | ✅ | ❌ |
| **SolicitacoesOrcamento — DELETE** | ✅ | ❌ | ❌ | ❌ |
| **SolicitacoesOrcamento — POST/DELETE Despachante** | ✅ | ✅ | ✅ | ❌ |
| **SolicitacoesOrcamento — GET Documentos** | ✅ | ✅ | ✅ | 🔒 |
| **SolicitacoesOrcamento — POST/DELETE Documentos** | ✅ | ✅ | ✅ | ❌ |
| **EmbarqueNavioVinculo — GET** | ✅ | ✅ | ✅ | 🔒 (ownership) |
| **EmbarqueNavioVinculo — POST/PUT/DELETE** | ✅ | ✅ | ✅ | ❌ |
| **Logística controle-navios — GET** | ✅ | ✅ | ✅ | 🔒 (filtrado) |
| **ControleNavios — CRUD** | ✅ | ✅ | ❌ | ❌ |
| **Navios — GET** | ✅ | ✅ | ✅ | 👁️ |
| **Navios — POST/PUT/DELETE** | ✅ | ✅ | ❌ | ❌ |
| **Usuarios — CRUD** | ✅ | ❌ | ❌ | ❌ |
| **Roles — GET** | ✅ | ✅ | ❌ | ❌ |
| **Parametros** | ✅ | ❌ | ❌ | ❌ |

#### Atividades

| ID | Tarefa | Arquivo(s) |
|----|--------|-----------|
| P6-A1 | Cadastros GET → `[Authorize(Roles = "Administrador,Gerente,Analista")]` nos GET de todos os 14 cadastros controllers | `Controllers/Clientes`, `Importadores`, `Despachantes`, `PortosOrigem`, `PortosDestino`, `Ncms`, `DespesasCatalogo`, `AgentesCarga`, `Exportadores`, `Fabricantes`, `Navios`, `ModelosDespesa`, `ListaPrecoLcl`, `ControleNavios` |
| P6-A2 | Cadastros POST/PUT/PATCH/DELETE → `[Authorize(Roles = "Administrador,Gerente")]` | idem |
| P6-A3 | `SolicitacoesOrcamentoController` — Create/Update/SetStatus/AddDespachante/RemoveDespachante/AddDocumento/RemoveDocumento → `[Authorize(Roles = "Administrador,Gerente,Analista")]`; Delete → `[Authorize(Roles = "Administrador")]` | `Controllers/SolicitacoesOrcamentoController.cs` |
| P6-A4 | `EmbarqueNavioVinculoController` — POST/PUT/DELETE → `[Authorize(Roles = "Administrador,Gerente,Analista")]` | `Controllers/EmbarqueNavioVinculoController.cs` |
| P6-A5 | `ControleNaviosController` — GET já abre para todos (P6-A1); POST/PUT/DELETE → `[Authorize(Roles = "Administrador,Gerente")]` | `Controllers/ControleNaviosController.cs` |
| P6-A6 | `NaviosController` — GET → `[Authorize(Roles = "Administrador,Gerente,Analista,Despachante")]`; escrita → `[Authorize(Roles = "Administrador,Gerente")]` | `Controllers/NaviosController.cs` |
| P6-A7 | `RolesController` — GET → `[Authorize(Roles = "Administrador,Gerente")]` | `Controllers/RolesController.cs` |
| P6-A8 | Regression: smoke-test com usuário Gerente e Analista cobrindo os endpoints principais | — |

> **Dependência**: P6 não altera regras de ownership (Despachante), apenas abre roles faltantes. A lógica de row-level security da P3 permanece intacta.

---

### Fase AUT-P7 — Frontend: Proteção de UI e Dashboard Role-Aware ✅ CONCLUÍDA (commit `2b3f007`)

> Esta fase substitui e expande a antiga AUT-P4.

| ID | Tarefa | Arquivo(s) | Status |
|----|--------|-----------|--------|
| P7-A1 | Dashboard role-aware — Despachante vê painel alternativo; Admin/Gerente/Analista veem KPIs completos | `dashboard.component.ts` | ✅ (feito em P5-A3) |
| P7-A2 | Esconder botões de escrita (Criar / Editar / Excluir) para Despachante em todas as telas operacionais | `solicitacao-orcamento.component.ts`, `embarque-aduana.component.ts`, `orcamento-venda.component.ts` | ✅ Implementado |
| P7-A3 | Shell: seção Cadastros visível para Admin e Gerente; oculta para Analista e Despachante | `shell-v2.component.ts` | ✅ Implementado |
| P7-A4 | Silenciar 403 nos serviços de catálogo (lazy-load + marcação `loaded=true`) | serviços em `cadastros/` | ✅ (feito em P5-A2) |
| P7-A5 | Painel de vínculos usuário ↔ entidade (Admin) — CRUD de `UsuarioVinculos` na tela de Usuários | `usuarios.component.ts` | ✅ (feito em P2.5) |



---

## 10. Resumo do Modelo de Dados (Diagrama Textual)

```
Usuarios (1) ──────────────── (N) UsuarioRoles (N) ──── (1) Roles
     │
     └──── (N) UsuarioVinculos
                  │  TipoVinculo = "Despachante"  → EntidadeId → Despachantes.Id
                  │  TipoVinculo = "Cliente"      → EntidadeId → Clientes.Id
                  │  TipoVinculo = "AgenteCarga"  → EntidadeId → AgentesCarga.Id

SolicitacoesOrcamento (1) ── (N) SolicitacaoOrcamentoDespachante
                                        │
                                        └─── (1) Despachantes  ←── ownership do CustoDespachante
                             │
                             └── (N) OrcamentoVenda
                             └── (N) EmbarqueAduana
                                        └── (N) Documentos
                                        └── (1) EmbarqueNavioVinculo → NavioTrajeto → Navios
```

---

## 11. Referências

- `comex133_api/Domain/Entities/` — entidades atuais
- `comex133_api/Controllers/` — controllers com `[Authorize(Roles = "Administrador")]` a revisar
- `docs/roadmap/roles/ROADMAP_ROLES_USUARIOS.md` — contexto das roles e usuários
- `comex133_front/src/app/v2/features/` — features do frontend: `solicitacao-orcamento`, `custo-despachante`, `orcamento-venda`, `embarque-aduana`, `logistica`

---

*Este documento está em refinamento. As seções marcadas com ⚠️ ou "A definir" aguardam decisão de negócio.*
