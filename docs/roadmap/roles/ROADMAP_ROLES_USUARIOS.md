# Roadmap — Roles e Usuários: Seed Padrão + Role Obrigatória

**Criado em**: 2026-04-22  
**Branch de trabalho**: `feat/roles-usuarios`  
**Repositório**: `comex133_api` + `comex133_front`

---

## 🎯 RESUMO EXECUTIVO

### Objetivo
Garantir que a aplicação tenha as **4 roles padrão** pré-cadastradas no banco e que todo
usuário criado possua **obrigatoriamente exatamente 1 role** associada — base para o
controle de autorização futuro.

### Roles padrão do sistema

| Nome | Descrição | Tipo |
|---|---|---|
| **Despachante** | Operador de despacho aduaneiro | Padrão |
| **Analista** | Analista operacional | Padrão |
| **Gerente** | Gestão de operações | Padrão |
| **Administrador** | Admin do sistema | Padrão |

### Regra de negócio central
> Um usuário **deve ter exatamente 1 role** no momento do cadastro.  
> O campo role é obrigatório e validado tanto na API quanto no frontend.

---

## 📊 STATUS CONSOLIDADO

```
ROL-001  DB: Seed das 4 roles padrão (migration):              ✅ CONCLUÍDO
ROL-002  API: RoleId obrigatório em CreateUsuario:              ✅ CONCLUÍDO
ROL-003  API: Validator exige RoleId único:                     ✅ CONCLUÍDO
ROL-004  API: UsuarioService usa RoleId singular:               ✅ CONCLUÍDO
ROL-005  Front: Model/Service – roleId obrigatório:             ✅ CONCLUÍDO
ROL-006  Front: UI – seletor único de role no cadastro:         ✅ CONCLUÍDO
ROL-007  Front: Validação inline de role obrigatória:           ✅ CONCLUÍDO
ROL-008  Build + testes manuais (fase 1):                      ✅ CONCLUÍDO

── Fase 2: Campo Descrição nas Roles ────────────────────────────────────
ROL-009  DB: Migration para atualizar descrições padrão:        ✅ CONCLUÍDO
ROL-010  Front: Descrição visível no select de criação de usuário: ✅ CONCLUÍDO
ROL-011  Front: Descrição visível nos checkboxes Gerenciar Roles: ✅ CONCLUÍDO
ROL-012  Build de validação final (fase 2):                    ✅ CONCLUÍDO

Progresso total: 12 / 12 atividades (100%)
```

---

## 1. DIAGNÓSTICO DO ESTADO ATUAL

### 1.1 Banco de Dados

| Item | Estado atual |
|---|---|
| Tabela `Roles` | ✅ Existe |
| Tabela `UsuarioRoles` (N-N) | ✅ Existe |
| Seed das 4 roles padrão | ✅ Aplicado (migration `SeedDefaultRoles`) |
| Descrições das roles padrão | ✅ Atualizadas (migration `UpdateDefaultRoleDescriptions`) |
| Restrição de role única por usuário | ✅ Regra de negócio no validator e service |

### 1.2 API (`comex133_api`)

| Arquivo | Estado atual |
|---|---|
| `RoleDtos` — `RoleDto`, `CreateRoleRequest`, `UpdateRoleRequest` | ✅ Campo `Descricao` presente |
| `RoleService` — `CreateAsync`, `UpdateAsync` | ✅ Persiste e atualiza `Descricao` |
| `RoleValidators` — max 200 chars | ✅ Validação de `Descricao` presente |
| `CreateUsuarioRequest` | ✅ `int RoleId` (obrigatório, singular) |
| `CreateUsuarioRequestValidator` | ✅ Exige `RoleId > 0` |
| `UsuarioService.CreateAsync` | ✅ Atribui role única com validação de existência |
| `AtribuirRolesRequest` | ✅ Mantido com `IEnumerable<int>` (flexibilidade admin) |

### 1.3 Frontend (`comex133_front`)

| Arquivo | Estado atual |
|---|---|
| `roles/models/role.models.ts` | ✅ `descricao?: string` presente |
| `roles/services/role.service.ts` | ✅ Envia/recebe `descricao` |
| `roles/pages/roles.component.ts` | ✅ Tabela exibe descrição; formulário tem campo descrição |
| `usuarios/models/usuario.models.ts` | ✅ `roleId: string` (obrigatório) |
| `usuarios/services/usuario.service.ts` | ✅ Envia `roleId: number` |
| `usuarios.component.ts` — select criação | ✅ Exibe `nome — descrição` nas opções |
| `usuarios.component.ts` — Gerenciar Roles | ✅ Checkboxes exibem descrição ao lado do nome |

---

## 2. ATIVIDADES DETALHADAS

---

### ROL-001 — DB: Migration de Seed das 4 Roles Padrão
**Camada**: Banco de dados (EF Core migration)  
**Arquivo**: novo arquivo em `comex133_api/Migrations/`  
**Status**: ⬜ PENDENTE

#### O que fazer
Criar uma migration EF Core que insere as 4 roles padrão usando `migrationBuilder.InsertData`.
As roles devem ter IDs fixos (1–4) para que o seed seja idempotente.

#### Detalhes técnicos
```csharp
// Migration: SeedDefaultRoles
// Tabela: Roles
// Colunas: Id, Nome, Descricao, CriadoEm, AtualizadoEm

Rows a inserir:
  Id=1, Nome="Despachante",   Descricao="Acesso às telas operacionais de despacho aduaneiro"
  Id=2, Nome="Analista",      Descricao="Acesso à análise de solicitações e custos"
  Id=3, Nome="Gerente",       Descricao="Acesso gerencial com visualizações consolidadas"
  Id=4, Nome="Administrador", Descricao="Acesso total ao sistema, incluindo administração"
```

#### Down (rollback)
Deletar os 4 registros pelo ID (somente se não estiverem em uso).

#### Critério de conclusão
- [ ] Migration gerada e aplicada com `dotnet ef database update`
- [ ] Tabela `Roles` contém as 4 rows com IDs 1–4
- [ ] Build da API sem erros de migration

---

### ROL-002 — API: Alterar `CreateUsuarioRequest` para RoleId obrigatório
**Camada**: API — DTOs  
**Arquivo**: `comex133_api/Features/Usuarios/UsuarioDtos.cs`  
**Status**: ⬜ PENDENTE

#### O que fazer
Substituir `IEnumerable<int>? RoleIds` por `int RoleId` no record `CreateUsuarioRequest`.

#### Alteração
```csharp
// Antes
public record CreateUsuarioRequest(
    string Email,
    string NomeCompleto,
    string Senha,
    IEnumerable<int>? RoleIds);

// Depois
public record CreateUsuarioRequest(
    string Email,
    string NomeCompleto,
    string Senha,
    int RoleId);
```

#### Critério de conclusão
- [ ] Record alterado
- [ ] Sem erros de compilação

---

### ROL-003 — API: Validator exige `RoleId > 0`
**Camada**: API — Validators  
**Arquivo**: `comex133_api/Features/Usuarios/UsuarioValidators.cs`  
**Status**: ⬜ PENDENTE

#### O que fazer
Adicionar regra de validação em `CreateUsuarioRequestValidator` para garantir que
`RoleId` seja um inteiro positivo válido.

#### Alteração
```csharp
RuleFor(x => x.RoleId)
    .GreaterThan(0).WithMessage("Uma role deve ser selecionada.");
```

#### Critério de conclusão
- [ ] Regra adicionada ao validator
- [ ] POST sem `roleId` (ou com `roleId=0`) retorna 400 com campo `roleId` no payload de erro

---

### ROL-004 — API: Atualizar `UsuarioService.CreateAsync`
**Camada**: API — Service  
**Arquivo**: `comex133_api/Features/Usuarios/UsuarioService.cs`  
**Status**: ⬜ PENDENTE

#### O que fazer
Substituir o bloco `if (request.RoleIds?.Any() == true)` pelo tratamento
do único `request.RoleId`, sem condicional (é sempre obrigatório após ROL-003).

#### Alteração lógica
```csharp
// Antes: if (request.RoleIds?.Any() == true) { foreach ... }

// Depois: direto, sem if
if (!await _db.Roles.AnyAsync(r => r.Id == request.RoleId))
    throw new NotFoundException($"Role {request.RoleId} não encontrada.");

_db.UsuarioRoles.Add(new UsuarioRole
{
    UsuarioId   = usuario.Id,
    RoleId      = request.RoleId,
    AtribuidoEm = DateTime.UtcNow
});
await _db.SaveChangesAsync();
```

#### Critério de conclusão
- [ ] Service atualizado
- [ ] `POST /api/usuarios` com `roleId` válido cria usuário com a role associada
- [ ] `POST /api/usuarios` com `roleId` inválido retorna 404

---

### ROL-005 — Front: Atualizar Model e Service
**Camada**: Frontend — models + service  
**Arquivos**:
- `comex133_front/src/app/v2/features/administracao/usuarios/models/usuario.models.ts`
- `comex133_front/src/app/v2/features/administracao/usuarios/services/usuario.service.ts`

**Status**: ⬜ PENDENTE

#### O que fazer — `usuario.models.ts`
```typescript
// Antes
export interface CreateUsuarioInput {
  email: string;
  nomeCompleto: string;
  senha: string;
  roleIds?: string[];
}

// Depois
export interface CreateUsuarioInput {
  email: string;
  nomeCompleto: string;
  senha: string;
  roleId: string;   // obrigatório, única role
}
```

#### O que fazer — `usuario.service.ts`
```typescript
// Interface interna CreateUsuarioRequest:
// Antes: roleIds?: number[];
// Depois: roleId: number;

// Método create():
// Antes: roleIds: (data.roleIds ?? []).map(r => Number(r))
// Depois: roleId: Number(data.roleId)
```

#### Critério de conclusão
- [ ] Interface `CreateUsuarioInput` usa `roleId: string`
- [ ] `create()` no service envia `{ ..., roleId: number }`
- [ ] Sem erros de TypeScript

---

### ROL-006 — Front: Substituir checkboxes por seletor único no formulário
**Camada**: Frontend — component  
**Arquivo**: `comex133_front/src/app/v2/features/administracao/usuarios/pages/usuarios.component.ts`  
**Status**: ⬜ PENDENTE

#### O que fazer
Substituir o `<div class="role-picker">` com checkboxes múltiplos por um
`<select>` (ou radio buttons) que aceita apenas uma role, tornando o campo visualmente
obrigatório com label "Role *".

#### Estrutura alvo (template)
```html
<!-- Antes: role-picker com checkboxes -->
<div class="field role-picker" *ngIf="!editing">
  <label *ngFor="let r of roles">
    <input type="checkbox" [checked]="isRoleSelecionada(r.id)" .../>
    <span>{{ r.nome }}</span>
  </label>
</div>

<!-- Depois: select único obrigatório -->
<div class="field w2" *ngIf="!editing">
  <label>Role <span class="required">*</span></label>
  <select
    [(ngModel)]="form.roleId"
    [class.err]="showErrors && !form.roleId"
  >
    <option value="">— Selecione uma role —</option>
    <option *ngFor="let r of roles" [value]="r.id">{{ r.nome }}</option>
  </select>
  <span class="err-msg" *ngIf="showErrors && !form.roleId">Role é obrigatória</span>
  <span class="err-msg" *ngIf="showErrors && hasApiFieldError('roleId', 'role')">
    {{ firstApiFieldError('roleId', 'role') }}
  </span>
</div>
```

#### Alterações no TypeScript do component
- Remover `isRoleSelecionada()` e `toggleRoleSelecionada()`
- Alterar `form` para incluir `roleId: ''` (string vazia = não selecionado)
- Remover estilos CSS de `.role-picker`

#### Critério de conclusão
- [ ] `<select>` renderiza todas as roles disponíveis
- [ ] Campo exibe "* obrigatório" visualmente
- [ ] Sem checkboxes múltiplos no formulário de criação

---

### ROL-007 — Front: Validação inline de role obrigatória
**Camada**: Frontend — component  
**Arquivo**: `usuarios.component.ts` (método `save()`)  
**Status**: ⬜ PENDENTE

#### O que fazer
No método `save()`, antes de chamar `usuarioService.create()`, validar que
`form.roleId` não está vazio. Exibir erro inline conforme padrão USAB-010 já aplicado.

#### Lógica de validação
```typescript
// No método save(), no bloco de validação local:
if (!this.form.roleId) {
  this.showErrors = true;
  return;
}
```

> Nota: o campo já estará marcado como `.err` pelo `[class.err]="showErrors && !form.roleId"`
> definido na ROL-006. Esta atividade garante que o fluxo de save seja travado.

#### Critério de conclusão
- [ ] Tentar salvar sem role selecionada exibe borda vermelha no select e mensagem de erro
- [ ] Com role selecionada, o save prossegue normalmente
- [ ] API retornando `roleId` inválido exibe mensagem de erro inline via `apiFieldErrors`

---

### ROL-008 — Build + Testes Manuais
**Camada**: Transversal  
**Status**: ⬜ PENDENTE

#### Checklist de testes manuais

**Banco / API:**
- [ ] `GET /api/roles` retorna as 4 roles (Despachante, Analista, Gerente, Administrador)
- [ ] `POST /api/usuarios` sem `roleId` → 400 com campo `roleId` no erro
- [ ] `POST /api/usuarios` com `roleId=0` → 400 com campo `roleId` no erro
- [ ] `POST /api/usuarios` com `roleId=99` (inexistente) → 404
- [ ] `POST /api/usuarios` com `roleId=1` (Despachante) → 201, usuário criado com role

**Frontend:**
- [ ] Lista de roles no select exibe as 4 roles padrão
- [ ] Tentar salvar usuário sem role: mensagem de erro + borda vermelha visíveis
- [ ] Salvar com role selecionada: usuário aparece na lista com chip da role
- [ ] Edição de usuário existente: formulário de edição NÃO exibe o campo role (sem regressão)

**Build:**
- [ ] `npm run build` (production) — 0 erros
- [ ] Build output: rotas prerendered sem erro

### ROL-009 — DB: Atualizar descrições das roles padrão
**Camada**: Banco de dados (EF Core migration)  
**Arquivo**: `comex133_api/Migrations/20260422182952_UpdateDefaultRoleDescriptions.cs`  
**Status**: ✅ CONCLUÍDO

#### O que foi feito
Nova migration com `UPDATE` para corrigir as descrições conforme regra de negócio definida.
A migration `SeedDefaultRoles` também foi atualizada para instalações futuras.

| Role | Descrição final |
|---|---|
| Despachante | Operador de despacho aduaneiro |
| Analista | Analista operacional |
| Gerente | Gestão de operações |
| Administrador | Admin do sistema |

---

### ROL-010 — Front: Descrição no select de criação de usuário
**Camada**: Frontend — component  
**Arquivo**: `usuarios.component.ts`  
**Status**: ✅ CONCLUÍDO

#### O que foi feito
Cada `<option>` do select de role agora exibe `Nome — Descrição`:
```html
<option *ngFor="let r of roles" [value]="r.id">
  {{ r.nome }}{{ r.descricao ? ' — ' + r.descricao : '' }}
</option>
```

---

### ROL-011 — Front: Descrição nos checkboxes de Gerenciar Roles
**Camada**: Frontend — component  
**Arquivo**: `usuarios.component.ts`  
**Status**: ✅ CONCLUÍDO

#### O que foi feito
Cada checkbox de seleção de role agora exibe a descrição em tom muted ao lado do nome:
```html
<span>{{ r.nome }}
  <small class="role-desc-hint">— {{ r.descricao }}</small>
</span>
```

---

### ROL-012 — Build de validação final (Fase 2)
**Camada**: Transversal  
**Status**: ⬜ PENDENTE

#### Checklist
- [x] `npx ng build --configuration=production` — 0 erros
- [ ] `GET /api/roles` retorna descrições corretas para as 4 roles
- [ ] Select de role em Usuários exibe `Nome — Descrição`
- [ ] Tela de Roles exibe coluna Descrição e campo no formulário
- [ ] Checkboxes de Gerenciar Roles exibem descrição em texto muted

---

```
ROL-001 (DB migration)
    ↓
ROL-002 + ROL-003 + ROL-004 (API — podem ser feitos juntos)
    ↓
ROL-005 + ROL-006 + ROL-007 (Front — podem ser feitos juntos)
    ↓
ROL-008 (Build + testes manuais)
```

---

## 4. ARQUIVOS IMPACTADOS

### API (`comex133_api`)
| Arquivo | Tipo de alteração |
|---|---|
| `Migrations/[timestamp]_SeedDefaultRoles.cs` | Novo — migration de seed |
| `Features/Usuarios/UsuarioDtos.cs` | Alterar `CreateUsuarioRequest` |
| `Features/Usuarios/UsuarioValidators.cs` | Adicionar regra `RoleId > 0` |
| `Features/Usuarios/UsuarioService.cs` | Simplificar lógica de atribuição de role |

### Frontend (`comex133_front`)
| Arquivo | Tipo de alteração |
|---|---|
| `administracao/usuarios/models/usuario.models.ts` | `roleIds?` → `roleId` |
| `administracao/usuarios/services/usuario.service.ts` | Payload create atualizado |
| `administracao/usuarios/pages/usuarios.component.ts` | Checkboxes → select único + validação |

---

## 5. DECISÕES DE DESIGN REGISTRADAS

| # | Decisão | Motivo |
|---|---|---|
| D1 | `AtribuirRolesRequest` mantém `IEnumerable<int>` | Flexibilidade admin para futuro multi-role sem migration |
| D2 | IDs das roles padrão são fixos (1–4) | Seed idempotente; evita duplicação em re-run |
| D3 | Role única enforçada na criação via validator, não por constraint DB | Regra de negócio gerenciável sem alterar schema |
| D4 | Frontend usa `<select>` em vez de radio buttons | Melhor UX quando a lista de roles pode crescer |
| D5 | Roles padrão NÃO são protegidas contra exclusão por código | Responsabilidade do operador; deletar role em uso já retorna 400 |
| D6 | Descrição exibida nas opções do select de usuário | Melhora UX ao identificar a role sem abrir a tela de Roles |
| D7 | Descrição nos checkboxes de Gerenciar Roles em texto muted | Informa sem poluir visualmente o campo de seleção |

---

## 6. PROGRESSO (TRACKING)

| ID | Atividade | Status | Concluído em |
|---|---|---|---|
| ROL-001 | DB: Seed das 4 roles padrão | ✅ CONCLUÍDO | 2026-04-22 |
| ROL-002 | API: `CreateUsuarioRequest` com `RoleId` | ✅ CONCLUÍDO | 2026-04-22 |
| ROL-003 | API: Validator exige `RoleId > 0` | ✅ CONCLUÍDO | 2026-04-22 |
| ROL-004 | API: `UsuarioService.CreateAsync` atualizado | ✅ CONCLUÍDO | 2026-04-22 |
| ROL-005 | Front: Model + Service atualizados | ✅ CONCLUÍDO | 2026-04-22 |
| ROL-006 | Front: Seletor único de role no formulário | ✅ CONCLUÍDO | 2026-04-22 |
| ROL-007 | Front: Validação inline de role obrigatória | ✅ CONCLUÍDO | 2026-04-22 |
| ROL-008 | Build + testes manuais (fase 1) | ✅ CONCLUÍDO | 2026-04-22 |
| ROL-009 | DB: Atualizar descrições das roles padrão | ✅ CONCLUÍDO | 2026-04-22 |
| ROL-010 | Front: Descrição no select de criação de usuário | ✅ CONCLUÍDO | 2026-04-22 |
| ROL-011 | Front: Descrição nos checkboxes Gerenciar Roles | ✅ CONCLUÍDO | 2026-04-22 |
| ROL-012 | Build de validação final (fase 2) | ✅ CONCLUÍDO | 2026-04-22 |

**Progresso: 12 / 12 (100%)**

---

*Documento criado em 2026-04-22. Atualizar a tabela de progresso a cada atividade concluída.*
