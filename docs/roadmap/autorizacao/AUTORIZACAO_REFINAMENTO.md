# Autorização — Documento de Refinamento

**Criado em**: 2026-04-23  
**Atualizado em**: 2026-04-23  
**Status**: Fase 1 — em implementação (`feat/autorizacao`)  
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

### Fase AUT-P3 — Relaxamento completo de roles nos controllers
- [ ] AUT-P3.1: `LogisticaController` / `ControleNaviosController` — abrir para Analista, Gerente
- [ ] AUT-P3.2: `CustoDespachanteController` (quando criado) — abrir para Despachante com ownership
- [ ] AUT-P3.3: `OrcamentoVendaController` — abrir para Analista, Gerente
- [ ] AUT-P3.4: `EmbarqueAduanaController` — abrir para Analista, Gerente
- [ ] AUT-P3.5: Cadastros — abrir leitura (GET) para Analista/Gerente, escrita Admin/Gerente

### Fase AUT-P4 — Frontend avançado
- [ ] AUT-P4.1: Esconder botões de ação (editar/excluir) por role
- [ ] AUT-P4.2: Tela de gerenciamento de vínculos usuário ↔ despachante (Admin)
- [ ] AUT-P4.3: Tratar 403 Forbidden nos services Angular com mensagem amigável

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
