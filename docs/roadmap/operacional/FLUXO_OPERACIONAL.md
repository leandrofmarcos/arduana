# Fluxo Operacional — Documento de Refinamento

**Criado em**: 2026-04-23  
**Status**: Rascunho — aguardando validação  
**Escopo**: `comex133_api` + `comex133_front`

---

## 1. Visão Geral do Processo

O fluxo operacional central do sistema é:

```
SolicitacaoOrcamento  (criada por Analista / Gerente / Admin)
  └── CustoDespachante (1..N — um por despachante associado)
  └── OrcamentoVenda   (1..1 — gerado automaticamente quando o primeiro custo é finalizado)
  └── EmbarqueAduana   (1..1 — gerado ao aprovar a solicitação pelo cliente)
```

O **estado da Solicitação** é derivado dos estados dos seus dependentes (CustosDespachante e OrcamentoVenda). Toda mudança de status relevante ocorre **automaticamente** quando as condições são satisfeitas, ou **manualmente** quando a ação é exclusivamente humana (ex: aprovação do cliente).

---

## 2. Tabelas de Status

### 2.1 Status da Solicitação de Orçamento

| Status | Descrição | Transição de entrada | Transição de saída |
|--------|-----------|---------------------|-------------------|
| `Rascunho` | Criada mas sem despachantes associados | — criação sem despachantes | Adicionar ≥1 despachante → `AguardandoDespachante` |
| `AguardandoDespachante` | ≥1 custo despachante ainda aberto | Associar despachante; reabertura de custo | Todos os custos entram em estado final (`Finalizado` ou `CanceladoPeloOV`) e existe ≥1 `Finalizado` → `AguardandoOrcamentoVenda` |
| `AguardandoReabertura` | Orçamento de vendas solicitou reabertura de ≥1 custo | OV solicitar refazer | Despachante finaliza nova versão → `AguardandoOrcamentoVenda` |
| `AguardandoOrcamentoVenda` | Todos os custos estão em estado final e o OV já existe em `Aguardando` ou `EmAndamento` | Último custo finalizado (ou nova versão finalizada) | OV finalizado → `AguardandoAprovacaoCliente` |
| `AguardandoAprovacaoCliente` | OV finalizado; aguardando decisão manual do cliente | OV finalizado | Aprovado → `Aprovada`; Cancelado → `Cancelada` |
| `Aprovada` | Cliente aprovou — gera EmbarqueAduana | Aprovação manual | Embarque gerado (automático); imutável a partir daqui |
| `Cancelada` | Encerrada sem aprovação | Cancelamento manual | — (estado terminal) |

> **Regra chave**: A solicitação **nunca retroage** a status anterior sem ação explícita de reabertura.

---

### 2.2 Status do CustoDespachante

| Status | Descrição | Transição de entrada | Transição de saída |
|--------|-----------|---------------------|-------------------|
| `Pendente` | Gerado, ninguém iniciou o trabalho | Criação automática ao associar despachante | Despachante salva → `EmAndamento` |
| `EmAndamento` | Despachante está editando | Primeiro save do despachante | Finalizar → `Finalizado`; reabertura pelo OV → `ReabertoPeloOV` |
| `Finalizado` | Custo submetido ao OV | Despachante finaliza | Reabertura pelo OV → `ReabertoPeloOV` |
| `ReabertoPeloOV` | OV solicitou refazer | OV aciona reabertura | Despachante finaliza nova versão → `Finalizado` |
| `CanceladoPeloOV` | OV descartou este custo (optou por outro) | OV cancela um custo específico | — (estado terminal para este custo) |

> **Regra chave**: A reabertura de um custo `Finalizado` pode ser acionada na tela de Custos ou na tela de OV, desde que a solicitação ainda não esteja `Aprovada` (sem embarque gerado). A reabertura sempre cria uma nova versão e essa nova versão passa a ser a corrente.

---

### 2.3 Status do OrcamentoVenda

| Status | Descrição | Transição de entrada | Transição de saída |
|--------|-----------|---------------------|-------------------|
| `Aguardando` | OV recém-criado e ainda sem alteração operacional | Primeiro custo despachante finalizado gera o OV | Primeira alteração em cabeçalho, despesas, extras ou custos → `EmAndamento`; Cancelar → `Cancelado` |
| `EmAndamento` | OV já sofreu ao menos uma alteração e segue em edição | Primeira alteração após criação | Finalizar → `Finalizado`; Cancelar → `Cancelado` |
| `Finalizado` | OV submetido para aprovação do cliente | Comercial finaliza | Reaberto → `EmAndamento`; aprovação cliente → imutável |
| `Cancelado` | OV descartado | Cancelamento manual | — (estado terminal) |

> **Nota**: Não existe status `Rascunho` no OV. Ele nasce em `Aguardando`, muda para `EmAndamento` na primeira alteração e permanece assim até a finalização ou cancelamento.

---

### 2.4 Status do EmbarqueAduana

O embarque possui seu próprio ciclo de status via `StatusEmbarque` (tabela de catálogo existente). Não é gerenciado por este fluxo, apenas **criado** automaticamente quando a Solicitação é aprovada.

> **Regra chave**: Uma vez criado o embarque, **nenhum** dos registros anteriores (CustoDespachante, OrcamentoVenda) pode ser editado.

---

## 3. Fluxo Completo com Condições de Guarda

```
[Solicitação criada]
    │
    ├── sem despachantes → status: Rascunho
    │
    └── com ≥1 despachante → status: AguardandoDespachante
            │
            │   [Para cada despachante associado]
                │   ├── CustoDespachante criado (status: Pendente)
                │   ├── Despachante salva → EmAndamento
                │   └── Despachante finaliza → Finalizado
                │       └── se ainda não existir OV da solicitação: gerar OV automaticamente em Aguardando
            │
            ├── ≥1 custo ainda NÃO Finalizado → Solicitação: AguardandoDespachante
            │
            └── TODOS os custos Finalizados (ou CanceladoPeloOV, com ≥1 Finalizado)
                    │
                    └── Solicitação: AguardandoOrcamentoVenda
                    │
                    └── OV: Aguardando
                                    │
                                    ├── Primeira alteração no OV → EmAndamento
                                    │   Solicitação permanece: AguardandoOrcamentoVenda
                                    │
                                    ├── OV salva novamente (sem finalizar) → permanece EmAndamento
                                    │   Solicitação permanece: AguardandoOrcamentoVenda
                                    │
                                    ├── OV cancela custo específico → CustoDespachante: CanceladoPeloOV
                                    │   GUARDA: deve restar ≥1 custo Finalizado
                                    │
                                    ├── OV solicita reabertura de custo
                                    │   → CustoDespachante: ReabertoPeloOV
                                    │   → Solicitação: AguardandoReabertura
                                    │   → Despachante finaliza nova versão → CustoDespachante: Finalizado
                                    │   → Solicitação volta: AguardandoOrcamentoVenda
                                    │
                                    └── OV finaliza   ← GUARDA: ≥1 custo Finalizado
                                            │
                                            └── OV: Finalizado
                                                Solicitação: AguardandoAprovacaoCliente
                                                    │
                                                    ├── OV pode ser reaberto ← GUARDA: Solicitação != Aprovada/Cancelada
                                                    │   → cria nova versão do OV (vN+1) em EmAndamento
                                                    │   → versão anterior fica imutável
                                                    │   → Solicitação: AguardandoOrcamentoVenda
                                                    │
                                                    ├── Cliente aprova (manual)
                                                    │   → Solicitação: Aprovada
                                                    │   → EmbarqueAduana criado automaticamente
                                                    │   → TUDO IMUTÁVEL a partir daqui
                                                    │
                                                    └── Cliente cancela (manual)
                                                        → Solicitação: Cancelada
```

---

## 4. Versionamento de CustoDespachante

Quando o OV solicita reabertura de um custo **já finalizado**:

1. O registro original (`CustoDespachante`) é **marcado como imutável** (flag `Imutavel = true` ou status `FinalizadoVersaoAnterior`).
2. Um **novo registro** é criado como cópia do anterior, com `Versao = N+1`.
3. O despachante trabalha no novo registro normalmente.
4. A UI exibe badge de versão (ex: `v2`, `v3`) e permite navegar entre versões (somente leitura nas anteriores).

Quando a reabertura é acionada pela tela de Custos, aplica-se a mesma regra: é criada nova versão, a versão anterior fica imutável e os vínculos ativos de OV passam a apontar para a versão corrente.

**Campos sugeridos em `CustoDespachante`:**
- `Versao` (int, default 1)
- `VersaoAnteriorId` (int?, FK para si mesmo)
- `Imutavel` (bool, default false)

---

## 5. Impacto no Modelo de Dados

### 5.1 CustoDespachante — mudanças necessárias

**Estado atual (frontend `custo-despachante.models.ts`):**
```ts
export type StatusCustoDespachante = 'AguardandoCusto' | 'Rascunho' | 'Finalizado';
```

| Campo | Situação atual | Mudança necessária |
|-------|---------------|-------------------|
| `Status` (string) | `'AguardandoCusto'`, `'Rascunho'`, `'Finalizado'` | Substituir por: `Pendente`, `EmAndamento`, `Finalizado`, `ReabertoPeloOV`, `CanceladoPeloOV` |
| `Versao` | Ausente na entidade e no modelo TS | Adicionar `INT NOT NULL DEFAULT 1` (API) + campo `versao: number` (TS) |
| `VersaoAnteriorId` | Ausente | Adicionar `INT NULL FK → CustoDespachante(Id)` (API) + `versaoAnteriorId?: string` (TS) |
| `Imutavel` | Ausente | Adicionar `BIT NOT NULL DEFAULT 0` (API) + `imutavel: boolean` (TS) |

### 5.2 SolicitacaoOrcamento — mudanças necessárias

**Estado atual (frontend `solicitacao-orcamento.models.ts`):**
```ts
export type StatusSolicitacao =
  'Rascunho' | 'Aberta' | 'AguardandoCusto' | 'AguardandoOrcamentoVenda' |
  'AguardandoAprovacaoCliente' | 'EmAnalise' | 'Aprovada' | 'Cancelada' |
  'EmbarquePrevisto' | 'EmbarqueAguardando' | 'EmbarqueAtracado' |
  'EmbarqueRegistrado' | 'EmbarqueDesembaraçado' | 'EmbarqueEntregue' | 'EmbarqueFinalizado';
export type StatusSolicitacaoDespachante = 'PendenteDespachante' | 'FinalizadoDespachante' | 'Respondido' | 'Recusado';
```

| Campo | Situação atual | Mudança necessária |
|-------|---------------|-------------------|
| `Status` (string na entidade C#, type no TS) | Vários valores misturados (inclui status de embarque) | Reduzir ao conjunto da seção 2.1: `Rascunho`, `AguardandoDespachante`, `AguardandoReabertura`, `AguardandoOrcamentoVenda`, `AguardandoAprovacaoCliente`, `Aprovada`, `Cancelada` |
| `StatusSolicitacaoDespachante` (tabela `SolicitacaoOrcamentoDespachantes`) | `PendenteDespachante`, `FinalizadoDespachante`, `Respondido`, `Recusado` | Campo deixa de ser o status operacional — o status vive em `CustoDespachante.Status` |

> Os status relacionados a embarque (`EmbarquePrevisto`, `EmbarqueAtracado`, etc.) devem ser movidos para o próprio `EmbarqueAduana` e removidos da `SolicitacaoOrcamento`.

### 5.3 OrcamentoVenda — mudanças necessárias

**Estado atual (frontend `orcamento-venda.models.ts`):**
```ts
status?: 'Rascunho' | 'Finalizado' | 'AguardandoDespachante' | 'AguardandoOrcamentoVenda';
```

| Campo | Situação atual | Mudança necessária |
|-------|---------------|-------------------|
| `Status` | `'Rascunho'`, `'Finalizado'`, `'AguardandoDespachante'`, `'AguardandoOrcamentoVenda'` | Simplificar para: `Aguardando`, `EmAndamento`, `Finalizado`, `Cancelado` |
| `custoDespachanteId` (FK direto) | Presente (retrocompatibilidade) | Manter por agora — mas a relação oficial é via `OrcamentoVendaCusto` (tabela N:N já existente) |

### 5.4 Tabelas sem alteração estrutural

- `EmbarqueAduana` — sem mudança de modelo; apenas regra de imutabilidade após criação.
- `SolicitacaoOrcamentoDespachante` — sem mudança de estrutura; o status operacional migra para `CustoDespachante`.
- `SolicitacaoOrcamentoDocumento` — sem mudança.

---

## 6. Regras de Negócio e Guards na API

### 6.1 CustoDespachante

| Operação | Condição de guarda |
|----------|-------------------|
| `PUT /custo-despachante/{id}` (salvar) | `Custo.Imutavel == false` AND `Custo.Status IN (Pendente, EmAndamento, ReabertoPeloOV)` |
| `PATCH /custo-despachante/{id}/finalizar` | `Custo.Status IN (EmAndamento, ReabertoPeloOV)` AND `Custo.Imutavel == false` |
| `PATCH /custo-despachante/{id}/iniciar` | `Custo.Status == Pendente` |
| `PATCH /custo-despachante/{id}/reabrir` | `Custo.Status == Finalizado` AND `Solicitacao.Status != Aprovada` AND não existir versão mais nova do custo. Efeito: cria nova versão `ReabertoPeloOV`, imutabiliza a anterior e migra vínculos ativos de OV para a nova versão |
| Criar novo custo (via reabertura) | Somente `OrcamentoVenda` pode acionar — não endpoint direto |
| Editar custo `Finalizado` diretamente | ❌ Bloqueado — erro 422 |

### 6.2 OrcamentoVenda

| Operação | Condição de guarda |
|----------|-------------------|
| `PUT /orcamento-venda/{id}` (salvar) | `OV.Status IN (Aguardando, EmAndamento)`; ao salvar pela primeira vez, promove para `EmAndamento` |
| `PATCH /orcamento-venda/{id}/finalizar` | `OV.Status == EmAndamento` AND ≥1 custo `Finalizado` associado (não cancelado) |
| `PATCH /orcamento-venda/{id}/reabrir` | `OV.Status == Finalizado` AND `Solicitacao.Status NOT IN (Aprovada, Cancelada)` AND não existir versão mais nova. Efeito: cria nova versão do OV em `EmAndamento`, imutabiliza a anterior e mantém nova versão como corrente |
| `PATCH /orcamento-venda/{id}/solicitar-reabertura-custo/{custoId}` | `OV.Status == EmAndamento` AND custo `Status == Finalizado` |
| `PATCH /orcamento-venda/{id}/cancelar-custo/{custoId}` | `OV.Status == EmAndamento` AND restarão ≥1 custo `Finalizado` após o cancelamento |

### 6.3 SolicitacaoOrcamento

| Operação | Condição de guarda |
|----------|-------------------|
| Aprovar (→ `Aprovada`) | `Solicitacao.Status == AguardandoAprovacaoCliente` AND OV `Finalizado` |
| Cancelar | `Solicitacao.Status != Aprovada` (não pode cancelar após aprovação) |
| Adicionar despachante | `Solicitacao.Status IN (Rascunho, AguardandoDespachante)` AND nenhum embarque criado |
| Qualquer edição nos campos da solicitação | `Solicitacao.Status != Aprovada` (imutável após aprovação) |

---

## 7. Mensagens de Erro Esperadas

| Situação | HTTP | Mensagem sugerida |
|----------|------|-------------------|
| Tentar editar custo imutável | 422 | "Este custo foi finalizado e está imutável. Solicite reabertura pelo Orçamento de Vendas." |
| Tentar finalizar OV sem custo finalizado | 422 | "É necessário pelo menos um Custo Despachante finalizado para finalizar o Orçamento de Vendas." |
| Tentar cancelar o único custo finalizado no OV | 422 | "Não é possível cancelar este custo — o Orçamento de Vendas precisa de ao menos um custo finalizado." |
| Tentar reabrir OV após aprovação do cliente | 422 | "O Orçamento de Vendas não pode ser reaberto após a aprovação pelo cliente." |
| Tentar editar embarque ou seus dependentes | 422 | "Este processo foi finalizado (Embarque criado) e não pode ser editado." |
| Tentar iniciar OV sem custo finalizado | 422 | "Para iniciar o Orçamento de Vendas é necessário pelo menos um Custo Despachante finalizado." |

---

## 8. Impacto no Frontend

### 8.1 Tela de Solicitações

- **Badge de status** atualizado com os novos valores (cores distintas por urgência).
- **Botão "Aprovar"**: visível apenas quando `status == AguardandoAprovacaoCliente`; role `Admin/Gerente`.
- **Botão "Cancelar"**: visível apenas quando `status != Aprovada`.
- **Indicador de reabertura**: badge especial `🔄 Reabertura v{N}` quando `AguardandoReabertura`.

### 8.2 Tela de Custos (Despachante)

- Lista exibe por padrão apenas versões correntes.
- Filtro "Mostrar versões anteriores" habilita visualização de histórico.
- Cada custo exibe label de versão (`vX`) e marcador de "corrente".
- Botão "Reabrir" aparece apenas para custo finalizado da versão corrente.

### 8.3 Tela de Orçamento de Venda

- Lista de OV exibe por padrão apenas versões correntes.
- Filtro "Mostrar versões anteriores" permite histórico em modo consulta.
- Cada orçamento exibe label de versão (`vX`) e marcador de versão corrente.
- Edição/reabertura só disponível para a versão corrente.
- Reabertura de OV cria nova versão (`vN+1`) e a edição segue sempre na versão corrente.
- Seletor de custos usa por padrão apenas versões correntes.
- Filtro "Mostrar versões anteriores" permite consultar histórico.
- Custo exibe versão (`vX`) e indicação de versão corrente.
- Reabertura de custo no OV sempre cria nova versão e passa a trabalhar na versão corrente.

### 8.2 Tela de Custo Despachante

- **Badge de status** com `EmAndamento` (amarelo), `Finalizado` (verde), `ReabertoPeloOV` (laranja), `CanceladoPeloOV` (cinza).
- **Botão "Salvar"**: só ativo se `!custo.imutavel && status IN (Pendente, EmAndamento)`.
- **Botão "Finalizar"**: só ativo se `status == EmAndamento && !imutavel`.
- **Banner de versão**: exibir `Versão {N}` e link para versões anteriores (somente leitura).
- **Remover botão "Salvar Rascunho"** — salvar já muda para `EmAndamento`; não existe estado intermediário entre `Pendente` e `EmAndamento` no custo.

### 8.3 Tela de Orçamento de Vendas

- **Remover botão "Salvar Rascunho"** — OV nasce em `Aguardando` automaticamente.
- **OV nasce automaticamente** quando o primeiro custo da solicitação é finalizado.
- **Primeira alteração no OV**: promove o status de `Aguardando` para `EmAndamento`.
- **Botão "Finalizar"**: guarda: `≥1 custo Finalizado` vinculado.
- **Botão "Reabrir"**: visível apenas se `status == Finalizado && solicitacao.status != Aprovada`.
- **Ação "Solicitar Reabertura de Custo"**: lista custos finalizados; ao acionar cria nova versão.
- **Ação "Cancelar Custo"**: visível por custo; guarda: restarão ≥1 custo finalizado.

---

## 9. Estratégia de Implementação (Fases)

> **Ordem obrigatória**: P1 → P2 → P3 → P4 → P5 → P6.  
> Cada fase deve ser integrada e validada antes de iniciar a próxima.  
> Nomenclatura de arquivos usa caminhos relativos à raiz do workspace.

---

### Fase OP-P1 — Modelo de Dados e Migrations

Objetivo: atualizar entidades C#, sincronizar o banco e preparar dados existentes para o novo fluxo.

#### P1.1 — Atualizar entidade `CustoDespachante`

**Arquivo**: `comex133_api/Domain/Entities/CustoDespachante.cs`

- Renomear/substituir o campo `Status` para usar os novos valores de string:
  `Pendente` | `EmAndamento` | `Finalizado` | `ReabertoPeloOV` | `CanceladoPeloOV`
- Adicionar campo `Versao` (`int`, default `1`, `NOT NULL`)
- Adicionar campo `VersaoAnteriorId` (`int?`, FK para `CustoDespachante(Id)`, `NULL`)
- Adicionar campo `Imutavel` (`bool`, default `false`, `NOT NULL`)
- Adicionar propriedade de navegação `VersaoAnterior` (`CustoDespachante?`)
- Manter o campo `SolicitacaoOrcamentoId` (FK para solicitação de origem)

#### P1.2 — Atualizar entidade `SolicitacaoOrcamento`

**Arquivo**: `comex133_api/Domain/Entities/SolicitacaoOrcamento.cs`

- O campo `Status` (string) já existe; ajustar o valor default para `"Rascunho"`
- Remover/deprecar status de embarque deste enum — eles pertencem ao `EmbarqueAduana`
- Os novos valores válidos são: `Rascunho`, `AguardandoDespachante`, `AguardandoReabertura`, `AguardandoOrcamentoVenda`, `AguardandoAprovacaoCliente`, `Aprovada`, `Cancelada`

#### P1.3 — Atualizar entidade `OrcamentoVenda`

**Arquivo**: `comex133_api/Domain/Entities/OrcamentoVenda.cs` (verificar existência ou criar)

- Status válidos: `Aguardando` | `EmAndamento` | `Finalizado` | `Cancelado`
- Remover `Rascunho` do tipo — OV sempre começa como `Aguardando`
- Confirmar que existe relacionamento `OrcamentoVendaCusto` (tabela N:N) para rastrear quais custos estão vinculados ao OV

#### P1.4 — Criar migration: novos campos em `CustoDespachante`

**Comando**: `dotnet ef migrations add OP_CustoDespachante_Versioning`

Alterações esperadas na migration:
```csharp
migrationBuilder.AddColumn<int>("Versao", "CustosDespachante", defaultValue: 1, nullable: false);
migrationBuilder.AddColumn<int?>("VersaoAnteriorId", "CustosDespachante", nullable: true);
migrationBuilder.AddColumn<bool>("Imutavel", "CustosDespachante", defaultValue: false, nullable: false);
migrationBuilder.AddForeignKey("FK_CustosDespachante_VersaoAnterior", "CustosDespachante",
    "VersaoAnteriorId", "CustosDespachante", "Id", onDelete: ReferentialAction.SetNull);
```

#### P1.5 — Criar migration: seed de migração de dados existentes

**Comando**: `dotnet ef migrations add OP_StatusMigrationSeed`

Lógica de migração de status para registros existentes:

```sql
-- CustoDespachante: mapear status antigos
UPDATE CustosDespachante SET Status = 'Finalizado'   WHERE Status IN ('FinalizadoDespachante', 'Respondido');
UPDATE CustosDespachante SET Status = 'EmAndamento'  WHERE Status IN ('Rascunho', 'AguardandoCusto');
UPDATE CustosDespachante SET Status = 'Pendente'     WHERE Status NOT IN ('Finalizado','EmAndamento','ReabertoPeloOV','CanceladoPeloOV');

-- SolicitacaoOrcamento: mapear status antigos
UPDATE SolicitacoesOrcamento SET Status = 'AguardandoDespachante' WHERE Status IN ('Aberta','AguardandoCusto');
UPDATE SolicitacoesOrcamento SET Status = 'AguardandoOrcamentoVenda' WHERE Status = 'AguardandoOrcamentoVenda'; -- já correto
UPDATE SolicitacoesOrcamento SET Status = 'AguardandoAprovacaoCliente' WHERE Status = 'EmAnalise';
-- Status de embarque: limpar — solicitação aprovada fica como 'Aprovada'
UPDATE SolicitacoesOrcamento SET Status = 'Aprovada'
  WHERE Status IN ('EmbarquePrevisto','EmbarqueAguardando','EmbarqueAtracado',
                   'EmbarqueRegistrado','EmbarqueDesembaraçado','EmbarqueEntregue','EmbarqueFinalizado');

-- OrcamentoVenda: mapear status antigos
UPDATE OrcamentosVenda SET Status = 'EmAndamento' WHERE Status IN ('Rascunho','AguardandoDespachante','AguardandoOrcamentoVenda');
```

#### P1.6 — Atualizar `AppDbContext`

**Arquivo**: `comex133_api/Core/Database/AppDbContext.cs`

- Adicionar índice em `CustoDespachante.VersaoAnteriorId`
- Confirmar que `CustoDespachante.Status` tem índice para queries de filtragem por status
- Confirmar configuração do self-referencing FK `VersaoAnteriorId`

---

### Fase OP-P2 — Lógica de Negócio na API

Objetivo: implementar todos os serviços, guards e endpoints do fluxo operacional.

#### P2.1 — `CustoDespachante`: novos métodos de ciclo de vida

**Arquivo**: `comex133_api/Features/SolicitacoesOrcamento/` (ou criar `Features/CustosDespachante/` se não existir)

Métodos a implementar:

| Método | Assinatura | Guard |
|--------|-----------|-------|
| `IniciarAsync` | `(int custoId, int usuarioId)` | `Status == Pendente` AND `!Imutavel` |
| `SalvarAsync` (update) | `(int custoId, UpdateCustoDto dto)` | `Status IN (Pendente, EmAndamento)` AND `!Imutavel` |
| `FinalizarAsync` | `(int custoId, int usuarioId)` | `Status == EmAndamento` AND `!Imutavel` → seta `Status = Finalizado`; garante criação do OV da solicitação (se ainda não existir); depois chama `RecalcularStatusSolicitacaoAsync` |

> Após `FinalizarAsync`: verificar se todos os custos da solicitação estão `Finalizado` ou `CanceladoPeloOV` com ≥1 `Finalizado` → se sim, solicitação → `AguardandoOrcamentoVenda`.

#### P2.2 — Guard global: bloqueio de custo imutável

**Arquivo**: `comex133_api/Features/SolicitacoesOrcamento/SolicitacoesOrcamentoService.cs` (e onde `CustoDespachante` for atualizado)

```csharp
if (custo.Imutavel)
    throw new ValidationException("Este custo foi finalizado e está imutável. Solicite reabertura pelo Orçamento de Vendas.");
```

Aplicar em: qualquer operação de PUT/PATCH em `CustoDespachante` (exceto operações internas do sistema como reabertura pelo OV).

#### P2.3 — `OrcamentoVenda`: novos métodos de ciclo de vida

**Arquivo**: `comex133_api/Features/SolicitacoesOrcamento/SolicitacoesOrcamentoService.cs` (ou `Features/OrcamentosVenda/OrcamentosVendaService.cs`)

| Método | Guard | Efeito |
|--------|-------|--------|
| `CreateAsync(CreateOvDto dto)` | Solicitação tem ≥1 `CustoDespachante.Status == Finalizado` ou criação operacional do sistema | Cria `OV.Status = Aguardando`; solicitação permanece `AguardandoOrcamentoVenda` |
| `SalvarAsync(int ovId, UpdateOvDto dto)` | `OV.Status IN (Aguardando, EmAndamento)` | Persiste dados; se estiver em `Aguardando`, promove para `EmAndamento` |
| `FinalizarAsync(int ovId)` | `OV.Status == EmAndamento` AND ≥1 custo `Finalizado` vinculado | `OV.Status = Finalizado`; solicitação → `AguardandoAprovacaoCliente` |
| `ReabrirAsync(int ovId)` | `OV.Status == Finalizado` AND `Solicitacao.Status != Aprovada` | `OV.Status = EmAndamento`; solicitação → `AguardandoOrcamentoVenda` |
| `CancelarCustoAsync(int ovId, int custoId)` | `OV.Status == EmAndamento` AND restarão ≥1 custo `Finalizado` após cancelar | `CustoDespachante.Status = CanceladoPeloOV` |
| `SolicitarReaberturaCustoAsync(int ovId, int custoId)` | `OV.Status == EmAndamento` AND `Custo.Status == Finalizado` | Cria nova versão do custo (ver P2.4); solicitação → `AguardandoReabertura` |

#### P2.4 — Lógica de versionamento de `CustoDespachante` (reabertura)

**Arquivo**: mesmo serviço do OV (P2.3)

Ao executar `SolicitarReaberturaCustoAsync`:
1. Setar `custoOriginal.Imutavel = true` (torna imutável o registro atual)
2. Criar novo `CustoDespachante` como cópia do original, com:
   - `Versao = custoOriginal.Versao + 1`
   - `VersaoAnteriorId = custoOriginal.Id`
   - `Status = Pendente`
   - `Imutavel = false`
   - Copiar todos os itens/despesas vinculados (LIs, despesas, NCMs)
3. Vincular o novo custo à solicitação
4. Atualizar `Solicitacao.Status = AguardandoReabertura`

#### P2.5 — `SolicitacaoOrcamento`: recálculo automático de status

**Arquivo**: `comex133_api/Features/SolicitacoesOrcamento/SolicitacoesOrcamentoService.cs`

Criar método `RecalcularStatusAsync(int solicitacaoId)`:

```
regras (em ordem de prioridade):
1. Se Solicitacao.Status == Aprovada → NÃO alterar (imutável)
2. Se Solicitacao.Status == Cancelada → NÃO alterar
3. Se ≥1 CustoDespachante.Status == ReabertoPeloOV → AguardandoReabertura
4. Se TODOS custos IN (Finalizado, CanceladoPeloOV) AND ≥1 Finalizado
      E OV.Status == Finalizado → AguardandoAprovacaoCliente
      E OV.Status == EmAndamento → AguardandoOrcamentoVenda
      E OV não existe → AguardandoOrcamentoVenda
5. Se ≥1 custo NOT IN (Finalizado, CanceladoPeloOV) → AguardandoDespachante
6. Se nenhum despachante associado → Rascunho
```

Chamar `RecalcularStatusAsync` no **final** de cada operação que muda status de `CustoDespachante` ou `OrcamentoVenda`. Executar dentro da mesma transação.

#### P2.6 — Guard de imutabilidade pós-aprovação (transversal)

Aplicar em todos os controllers/serviços que manipulam:
- `CustoDespachante` (qualquer PUT/PATCH)
- `OrcamentoVenda` (qualquer PUT/PATCH/reabertura)
- `SolicitacaoOrcamento` (campos editáveis)

```csharp
var solicitacao = await _ctx.SolicitacoesOrcamento.FindAsync(solicitacaoId);
if (solicitacao?.Status == "Aprovada")
    throw new ValidationException("Este processo foi finalizado (Embarque criado) e não pode ser editado.");
```

#### P2.7 — Novos endpoints em `OrcamentosVendaController`

**Arquivo**: `comex133_api/Controllers/SolicitacoesOrcamentoController.cs` (ou criar `OrcamentosVendaController.cs`)

```
PATCH /orcamentos-venda/{id}/colocar-em-andamento
PATCH /orcamentos-venda/{id}/finalizar
PATCH /orcamentos-venda/{id}/reabrir
PATCH /orcamentos-venda/{id}/cancelar-custo/{custoId}
POST  /orcamentos-venda/{id}/solicitar-reabertura-custo/{custoId}
```

Todos devem retornar o `OrcamentoVendaDto` atualizado + o novo `statusSolicitacao` no response body para o frontend atualizar o estado sem reload.

#### P2.8 — Novos endpoints em `CustoDespachanteController`

**Arquivo**: `comex133_api/Controllers/SolicitacoesOrcamentoController.cs` (ou criar `CustoDespachanteController.cs`)

```
PATCH /custo-despachante/{id}/iniciar
PATCH /custo-despachante/{id}/finalizar
```

Retornar o `CustoDespachanteDto` atualizado + `statusSolicitacao`.

#### P2.9 — Endpoint de aprovação manual da solicitação

**Arquivo**: `comex133_api/Controllers/SolicitacoesOrcamentoController.cs`

```
PATCH /solicitacoes-orcamento/{id}/aprovar     [Roles: Admin, Gerente]
PATCH /solicitacoes-orcamento/{id}/cancelar    [Roles: Admin, Gerente]
```

`AprovarAsync`:
- Guard: `Solicitacao.Status == AguardandoAprovacaoCliente`
- Setar `Solicitacao.Status = Aprovada`
- Criar `EmbarqueAduana` automaticamente (copiar dados relevantes da solicitação e do OV `Finalizado`)
- Chamar `MarcarTudoImutavelAsync` (setar `Imutavel = true` em todos os custos e bloquear OV)

#### P2.10 — Criar `CustoDespachante` automaticamente ao associar despachante

**Arquivo**: serviço de vínculo de despachante à solicitação

Ao adicionar um despachante a uma solicitação (endpoint existente):
- Criar automaticamente um `CustoDespachante` com `Status = Pendente`, `Versao = 1`
- Atualizar status da solicitação via `RecalcularStatusAsync`

---

### Fase OP-P3 — Frontend: Modelos e Serviços

Objetivo: sincronizar tipos TypeScript com os novos status e atualizar serviços HTTP.

#### P3.1 — Atualizar `StatusSolicitacao`

**Arquivo**: `comex133_front/src/app/v2/features/solicitacao-orcamento/models/solicitacao-orcamento.models.ts`

```ts
export type StatusSolicitacao =
  | 'Rascunho'
  | 'AguardandoDespachante'
  | 'AguardandoReabertura'
  | 'AguardandoOrcamentoVenda'
  | 'AguardandoAprovacaoCliente'
  | 'Aprovada'
  | 'Cancelada';

// Remover: 'Aberta' | 'AguardandoCusto' | 'EmAnalise' e todos os status de embarque

export const STATUS_SOLICITACAO_LABEL: Record<StatusSolicitacao, string> = {
  Rascunho: 'Rascunho',
  AguardandoDespachante: 'Aguardando Despachante',
  AguardandoReabertura: 'Aguardando Reabertura',
  AguardandoOrcamentoVenda: 'Aguardando Orçamento',
  AguardandoAprovacaoCliente: 'Aguardando Aprovação',
  Aprovada: 'Aprovada',
  Cancelada: 'Cancelada',
};

export const STATUS_SOLICITACAO_COLOR: Record<StatusSolicitacao, string> = {
  Rascunho: 'gray',
  AguardandoDespachante: 'orange',
  AguardandoReabertura: 'red',
  AguardandoOrcamentoVenda: 'blue',
  AguardandoAprovacaoCliente: 'purple',
  Aprovada: 'green',
  Cancelada: 'gray',
};
```

Remover `StatusSolicitacaoDespachante` (já não é o status operacional principal).

#### P3.2 — Atualizar `StatusCustoDespachante`

**Arquivo**: `comex133_front/src/app/v2/features/custo-despachante/models/custo-despachante.models.ts`

```ts
export type StatusCustoDespachante =
  | 'Pendente'
  | 'EmAndamento'
  | 'Finalizado'
  | 'ReabertoPeloOV'
  | 'CanceladoPeloOV';

// Remover: 'AguardandoCusto' | 'Rascunho'
```

Adicionar campos de versionamento à interface `CustoDespachante`:
```ts
export interface CustoDespachante {
  // ... campos existentes ...
  versao: number;
  versaoAnteriorId?: string;
  imutavel: boolean;
  status: StatusCustoDespachante;
}
```

Labels e cores:
```ts
export const STATUS_CUSTO_LABEL: Record<StatusCustoDespachante, string> = {
  Pendente: 'Pendente',
  EmAndamento: 'Em Andamento',
  Finalizado: 'Finalizado',
  ReabertoPeloOV: 'Reabertura Solicitada',
  CanceladoPeloOV: 'Cancelado pelo OV',
};
```

#### P3.3 — Atualizar `StatusOrcamentoVenda`

**Arquivo**: `comex133_front/src/app/v2/features/orcamento-venda/models/orcamento-venda.models.ts`

```ts
export type StatusOrcamentoVenda = 'EmAndamento' | 'Finalizado' | 'Cancelado';

export interface OrcamentoVenda {
  // ... campos existentes ...
  status: StatusOrcamentoVenda;
}
```

Remover: `'Rascunho' | 'AguardandoDespachante' | 'AguardandoOrcamentoVenda'`.

#### P3.4 — Atualizar `CustoDespachanteService`

**Arquivo**: `comex133_front/src/app/v2/features/custo-despachante/services/custo-despachante.service.ts`

Adicionar métodos:
```ts
iniciar(id: string): Observable<CustoDespachante>      // PATCH .../iniciar
finalizar(id: string): Observable<CustoDespachante>    // PATCH .../finalizar
```

O método `save` (PUT) deve ser renomeado de `saveRascunho` para simplesmente `save` — não existe mais "rascunho".

#### P3.5 — Atualizar `OrcamentoVendaService`

**Arquivo**: `comex133_front/src/app/v2/features/orcamento-venda/services/orcamento-venda.service.ts`

Adicionar métodos:
```ts
colocarEmAndamento(id: string): Observable<OrcamentoVenda>
finalizar(id: string): Observable<OrcamentoVenda>
reabrir(id: string): Observable<OrcamentoVenda>
cancelarCusto(ovId: string, custoId: string): Observable<OrcamentoVenda>
solicitarReaberturaCusto(ovId: string, custoId: string): Observable<OrcamentoVenda>
```

#### P3.6 — Atualizar `SolicitacaoOrcamentoService`

**Arquivo**: `comex133_front/src/app/v2/features/solicitacao-orcamento/services/solicitacao-orcamento.service.ts`

Adicionar métodos:
```ts
aprovar(id: string): Observable<SolicitacaoOrcamento>    // PATCH .../aprovar
cancelar(id: string): Observable<SolicitacaoOrcamento>   // PATCH .../cancelar
```

---

### Fase OP-P4 — Frontend: Telas e Interações

Objetivo: atualizar os componentes de página para refletir o novo fluxo nos botões, badges e ações.

#### P4.1 — Tela de Solicitações (`solicitacao-orcamento.component.ts`)

**Arquivo**: `comex133_front/src/app/v2/features/solicitacao-orcamento/pages/solicitacao-orcamento.component.ts`

- Badge de status: usar `STATUS_SOLICITACAO_LABEL` e `STATUS_SOLICITACAO_COLOR`
- Badge especial `🔄 Reabertura v{N}` quando `status == AguardandoReabertura`
- Botão **"Aprovar"**: visível apenas quando `status == AguardandoAprovacaoCliente` + role `Admin/Gerente`
- Botão **"Cancelar"**: visível apenas quando `status != Aprovada`
- Remover botões de transição que eram manuais (status agora é automático)
- Lista de solicitações: adicionar filtro por status

#### P4.2 — Tela de Custo Despachante (`custo-despachante.component.ts`)

**Arquivo**: `comex133_front/src/app/v2/features/custo-despachante/pages/custo-despachante.component.ts`

- Badge de status com cores da seção P3.2
- **Remover botão "Salvar Rascunho"** — substituir por botão **"Salvar"** (ativo se `!imutavel && status IN (Pendente, EmAndamento)`)
- Botão **"Iniciar"**: visível se `status == Pendente && !imutavel`; ao clicar → `IniciarAsync` → status muda para `EmAndamento`
- Botão **"Finalizar"**: visível se `status == EmAndamento && !imutavel`
- Banner de versão: `Versão {N}` + link "Ver versões anteriores" (somente leitura)
- Formulário desabilitado quando `imutavel == true` com banner explicativo
- Formulário desabilitado quando `status == CanceladoPeloOV`

#### P4.3 — Tela de Orçamento de Vendas (`orcamento-venda.component.ts`)

**Arquivo**: `comex133_front/src/app/v2/features/orcamento-venda/pages/orcamento-venda.component.ts`

- **Remover botão "Salvar Rascunho"** — botão **"Salvar"** persiste sem mudar status
- Botão **"Colocar em Andamento"**: visível quando OV ainda não iniciado (solicitação em `AguardandoOrcamentoVenda`); guarda: ≥1 custo `Finalizado`
- Botão **"Finalizar"**: visível quando `status == EmAndamento`; guarda: ≥1 custo `Finalizado`
- Botão **"Reabrir"**: visível quando `status == Finalizado && solicitacao.status != Aprovada`
- Seção **"Custos Vinculados"**: listar cada custo com status badge
  - Ação **"Cancelar Custo"** (ícone ✕): visível quando `OV.status == EmAndamento && custo.status == Finalizado`; guarda: restará ≥1 custo finalizado
  - Ação **"Solicitar Reabertura"** (ícone 🔄): visível quando `OV.status == EmAndamento && custo.status == Finalizado`
  - Ação **"Ver Versões"**: sempre visível se `custo.versao > 1`

#### P4.4 — Tratamento de erros 422 (transversal)

**Arquivo**: criar ou atualizar interceptor de HTTP / `ApiErrorMapper`

Mapear as mensagens da seção 7 para notificações `toast`/`snackbar` amigáveis. Nunca exibir a mensagem técnica crua ao usuário.

Exemplos:
```ts
422 → toast.error(response.detail ?? 'Operação não permitida neste momento.')
```

---

### Fase OP-P5 — Validação e Smoke Tests

Objetivo: garantir que todos os cenários do fluxo funcionam corretamente de ponta a ponta.

#### P5.1 — Fluxo principal completo (happy path)

1. Criar solicitação sem despachantes → `Rascunho`
2. Adicionar ≥1 despachante → `CustoDespachante` criado como `Pendente`; solicitação → `AguardandoDespachante`
3. Despachante salva custo → status `EmAndamento`
4. Despachante finaliza → `Finalizado`; solicitação → `AguardandoOrcamentoVenda` (se único despachante)
5. Comercial coloca OV em andamento → `OV.EmAndamento`
6. Comercial salva OV (sem finalizar) → status permanece `EmAndamento`
7. Comercial finaliza OV → `Finalizado`; solicitação → `AguardandoAprovacaoCliente`
8. Admin/Gerente aprova → `Aprovada`; `EmbarqueAduana` criado
9. Verificar que custo e OV ficam imutáveis após aprovação

#### P5.2 — Fluxo de reabertura de custo pelo OV

1. OV solicita reabertura de custo `Finalizado`
2. Verificar que `custoOriginal.Imutavel == true`
3. Verificar que nova versão criada tem `Versao = N+1` e `VersaoAnteriorId = custoOriginal.Id`
4. Solicitação → `AguardandoReabertura`
5. Despachante finaliza nova versão → solicitação → `AguardandoOrcamentoVenda`
6. OV retoma e finaliza normalmente

#### P5.3 — Guards e bloqueios

| Cenário | Resultado esperado |
|---------|-------------------|
| Editar custo imutável | HTTP 422 com mensagem amigável |
| Finalizar OV sem custo finalizado | HTTP 422 |
| Cancelar único custo finalizado no OV | HTTP 422 |
| Reabrir OV após `Aprovada` | HTTP 422 |
| Tentar aprovar solicitação no status errado | HTTP 422 |
| Despachante tentar reabrir custo por conta própria | HTTP 422 ou botão oculto no frontend |

#### P5.4 — Consistência de status após operações concorrentes

- Finalizar 2 custos simultaneamente → verificar que solicitação só avança para `AguardandoOrcamentoVenda` uma vez
- Validar que `RecalcularStatusAsync` é idempotente (chamar N vezes → mesmo resultado)

#### P5.5 — Regressão em telas existentes

- Lista de solicitações: confirmar que badges exibem os novos status sem erros de tipo TS
- Lista de custos despachantes: confirmar filtro por status funcional
- Lista de OVs: confirmar exibição de `EmAndamento` / `Finalizado` / `Cancelado`

---

### Fase OP-P6 — Deslegacização de Status (Sem Compatibilidade Antiga)

Objetivo: remover completamente status legados do frontend e da experiência de usuário, deixando somente o padrão oficial definido neste documento.

#### P6.1 — Planejamento de Remoção

1. Congelar catálogo oficial de status por módulo:
  - Solicitação: `Rascunho`, `AguardandoDespachante`, `AguardandoReabertura`, `AguardandoOrcamentoVenda`, `AguardandoAprovacaoCliente`, `Aprovada`, `Cancelada`
  - CustoDespachante: `Pendente`, `EmAndamento`, `Finalizado`, `ReabertoPeloOV`, `CanceladoPeloOV`
  - OrcamentoVenda: `EmAndamento`, `Finalizado`, `Cancelado`
2. Definir política de corte:
  - Remover unions, labels, cores e filtros para status legados.
  - Bloquear criação de novos registros com status fora do catálogo oficial.
3. Definir janela de validação:
  - Build limpo sem fallback de tipos legados.
  - Smoke test obrigatório nas telas de Solicitação, Custo e OV.

#### P6.2 — Atividades Técnicas de Limpeza

1. Models TypeScript:
  - Remover de `StatusSolicitacao`: `Aberta`, `AguardandoCusto`, `EmAnalise` e todos os status `Embarque*`.
  - Remover de `StatusCustoDespachante`: `AguardandoCusto`, `Rascunho`.
  - Remover de `OrcamentoVenda.status`: `Rascunho`, `AguardandoDespachante`, `AguardandoOrcamentoVenda`.
2. Tela de Solicitações:
  - Ajustar filtros, selects e badges para exibir apenas status oficiais.
  - Remover qualquer mapeamento visual de status de embarque na solicitação.
3. Tela de Custo Despachante:
  - Trocar ações de salvar para `EmAndamento` (sem “Salvar Rascunho”).
  - Ajustar badges para `Pendente`, `EmAndamento`, `Finalizado`, `ReabertoPeloOV`, `CanceladoPeloOV`.
  - Recalcular avanço da solicitação com base no status dos custos, não em status legado do vínculo de despachante.
4. Tela de Orçamento de Venda:
  - Trocar default de status para `EmAndamento`.
  - Ao finalizar OV, mover solicitação para `AguardandoAprovacaoCliente` (sem aprovar automaticamente).
5. Tela de Embarque:
  - Parar de propagar `Embarque*` para `Solicitacao.Status`.
  - Solicitação permanece no ciclo operacional oficial (`Aprovada` ou `Cancelada`).

#### P6.3 — Mensagens e Feedback de Regra (UX)

Quando uma regra de fluxo for inferida durante uma ação do usuário, sempre retornar feedback explícito:

1. Finalização de OV:
  - `toast.info("Orçamento finalizado. A solicitação agora aguarda aprovação do cliente.")`
2. Conclusão de todos os custos da solicitação:
  - `toast.info("Todos os custos foram finalizados. Solicitação movida para Aguardando Orçamento de Venda.")`
3. Tentativa de edição em entidade imutável:
  - `toast.warning("Este processo está bloqueado para edição conforme regra do fluxo operacional.")`
4. Falha de regra de transição (422):
  - Mensagem amigável + indicação do próximo passo permitido (ex.: finalizar custo antes de finalizar OV).

#### P6.4 — Critérios de Conclusão

1. Nenhum arquivo frontend com referência a status legados removidos.
2. Build sem erros de tipo relacionados a status.
3. Fluxo funcional ponta a ponta:
  - Solicitação → Custo → OV → Aprovação cliente → Embarque.
4. Feedbacks de transição visíveis para o usuário em todas as ações críticas.

#### P6.5 — Execução Atual (2026-04-24)

Status: **Concluída** no frontend para os módulos operacionais principais.

Atividades concluídas:
1. Remoção dos status legados dos tipos TS de Solicitação, Custo e OV.
2. Ajuste das telas para usar apenas o catálogo oficial deste documento.
3. Remoção da sincronização de `StatusSolicitacao` com estados de embarque (`Embarque*`).
4. Inclusão de feedback de regra nas transições críticas (ex.: finalização de OV e avanço para aprovação cliente).

Evidência de validação:
1. Comando `npm run build` em `comex133_front` com `EXIT_CODE=0`.
2. Comando filtrado com `Select-String` também retornando `EXIT_CODE=0`.

Comando recomendado de validação (sem ambiguidade):
```powershell
cd comex133_front
npm run build
Write-Output "EXIT_CODE=$LASTEXITCODE"
```

---

## 10. Pontos de Atenção / Riscos

1. **Migração de dados existentes**: registros com status antigos precisam ser mapeados para os novos status via migration seed com `UPDATE` condicionado.
2. **CustoDespachante sem `Versao`**: registros existentes devem receber `Versao = 1`, `Imutavel = 0`.
3. **Recalculo de status da Solicitação**: a lógica deve ser chamada sempre que um `CustoDespachante` ou `OrcamentoVenda` muda de status — usar Domain Events ou chamar explicitamente no final de cada operação de serviço.
4. **Concorrência**: se dois despachantes finalizam ao mesmo tempo, o recalculo do status da solicitação deve ser feito dentro de uma transação com lock otimista.
5. **Embarque imutável**: a regra de imutabilidade após `Aprovada` deve ser verificada em **todos** os controllers relevantes (CustoDespachante, OrcamentoVenda, SolicitacaoOrcamento).

---

## 11. Dependências

- Este documento **não depende** do módulo de Autorização (já implementado P1–P7).
- Este documento **não afeta** o módulo de Notificações Push (será implementado separadamente).
- A lógica de ownership por Despachante (P3) permanece válida e compatível com o novo fluxo.
