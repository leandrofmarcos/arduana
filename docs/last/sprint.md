# Sprint — Implementação SolicitacaoOrcamento (Etapa 12)

**Início:** 08 de Abril de 2026  
**Branch:** `leandro/feat-refatoracao-tela-orcamento`  
**Status Geral:** ✅ Concluído

---

## Objetivo do Sprint

Implementar a entidade `SolicitacaoOrcamento` como ponto de entrada formal do processo, ajustar `CustoDespachante` com FK opcional e migrar `OrcamentoVenda` para suportar N custos via `OrcamentoVendaCusto`.

**Fluxo meta:**
```
SolicitacaoOrcamento → N SolicitacaoOrcamentoDespachante
                     → N SolicitacaoOrcamentoDocumento
                     → [gera] N CustoDespachante (com solicitacaoOrcamentoId)
                                    ↓
                          OrcamentoVendaCusto (N:N)
                                    ↓
                            OrcamentoVenda → EmbarqueAduana
```

---

## Etapas do Sprint

| # | Etapa | Descrição | Estimativa | Status |
|---|-------|-----------|------------|--------|
| 1 | **Infraestrutura** | `keysV2` + models novos | 15 min | ✅ concluído |
| 2 | **Model: CustoDespachante** | Adicionar `solicitacaoOrcamentoId?` | 5 min | ✅ concluído |
| 3 | **Model: OrcamentoVendaCusto** | Criar interface + adicionar ao models | 5 min | ✅ concluído |
| 4 | **Feature: SolicitacaoOrcamento** | Criar pasta, models, service, component | 90 min | ✅ concluído |
| 5 | **CustoDespachante: vincular** | Campo `solicitacaoOrcamentoId` no wizard + botão "vem de solicitação" | 20 min | ✅ concluído |
| 6 | **OrcamentoVenda: N custos** | Migrar seletor de 1:1 para N:N via OrcamentoVendaCusto | 45 min | ✅ concluído |
| 7 | **Rota + Menu** | Registrar rota `/solicitacoes` e link no menu Operação | 10 min | ✅ concluído |
| 8 | **Seed demo** | Adicionar 2 SolicitacaoOrcamento de exemplo ao SeedDemoService | 20 min | ✅ concluído |
| 9 | **Build + Testes** | Verificar compilação, navegar em todas as telas | 15 min | ✅ concluído |

**Total estimado:** ~225 min (~3h45)

---

## Detalhamento das Etapas

---

### Etapa 1 — Infraestrutura: `keysV2` + models novos
**Arquivo:** `import-costs/src/app/v2/core/helpers/storage-v2.helper.ts`

Adicionar ao objeto `keysV2`:
```typescript
// Solicitação de Orçamento
solicitacoes:             'v2_solicitacoes_orcamento',
solicitacaoDespachantes:  'v2_solicitacao_despachantes',
solicitacaoDocumentos:    'v2_solicitacao_documentos',
// Junction OrcamentoVenda ↔ CustoDespachante
orcCustos:                'v2_orc_custos',
```

**Status:** ⬜  
**Concluído em:** —

---

### Etapa 2 — Model: CustoDespachante
**Arquivo:** `import-costs/src/app/v2/features/custo-despachante/models/custo-despachante.models.ts`

Adicionar campo:
```typescript
solicitacaoOrcamentoId?: string;   // FK opcional — pré-preenchido ao vir de uma solicitação
```

**Status:** ⬜  
**Concluído em:** —

---

### Etapa 3 — Model: OrcamentoVendaCusto
**Arquivo:** `import-costs/src/app/v2/features/orcamento-venda/models/orcamento-venda.models.ts`

Adicionar interface:
```typescript
export interface OrcamentoVendaCusto {
  id: string;
  orcamentoVendaId: string;
  custoDespachanteId: string;
}
```
`OrcamentoVenda.custoDespachanteId` passa a ser `custoDespachanteId?: string` (mantida por retrocompatibilidade com seed, removida em versão futura).

**Status:** ⬜  
**Concluído em:** —

---

### Etapa 4 — Feature: SolicitacaoOrcamento (principal)
**Pasta a criar:** `import-costs/src/app/v2/features/solicitacao-orcamento/`

Sub-pastas e arquivos:
```
solicitacao-orcamento/
├── models/
│   └── solicitacao-orcamento.models.ts
├── services/
│   └── solicitacao-orcamento.service.ts
└── pages/
    └── solicitacao-orcamento.component.ts
```

**Models a definir:**
```typescript
export type StatusSolicitacao = 'Aberta' | 'EmAnalise' | 'Aprovada' | 'Cancelada';
export type StatusSolicitacaoDespachante = 'Pendente' | 'Respondido' | 'Recusado';

export interface SolicitacaoOrcamento {
  id: string;
  codigoInterno: string;        // SOL-AAAA-NNN
  clienteId?: string;
  importadorId?: string;
  portoOrigemId: string;
  portoDestinoId: string;
  responsavel: string;          // nome livre (mesmo padrão de CustoDespachante)
  tamContainer: '20' | '40' | 'LCL';
  peso: number;
  observacao?: string;
  status: StatusSolicitacao;
  data: string;                 // ISO YYYY-MM-DD
}

export interface SolicitacaoOrcamentoDespachante {
  id: string;
  solicitacaoOrcamentoId: string;
  despachanteId: string;
  status: StatusSolicitacaoDespachante;
  dataEnvio: string;
  dataResposta?: string;
}

export interface SolicitacaoOrcamentoDocumento {
  id: string;
  solicitacaoOrcamentoId: string;
  nomeArquivo: string;
  linkDocumento: string;
  dataUpload: string;
  observacao?: string;
}
```

**Service:** CRUD usando `readV2/writeV2/addV2/updateV2/deleteV2`

**Component:**
- Lista de solicitações com filtro por status
- Formulário / modal de criação e edição com:
  - Campos básicos (portos, container, peso, responsável, data, observação)
  - Seleção de cliente/importador (opcional)
  - Seção inline de despachantes: adicionar N pela lista, alterar status
  - Seção inline de documentos: adicionar link, nome, data
  - Botão **"➕ Gerar CustoDespachante"** — abre wizard de custo pré-preenchido
- Código automático SOL-AAAA-NNN

**Status:** ⬜  
**Concluído em:** —

---

### Etapa 5 — CustoDespachante: vínculo com Solicitação
**Arquivo:** `import-costs/src/app/v2/features/custo-despachante/pages/custo-despachante.component.ts`

- Persistir `solicitacaoOrcamentoId` ao salvar
- Na listagem, mostrar badge "SOL-XXXX" quando o custo veio de uma solicitação (com link para a solicitação)
- Wizard passo 1: campo somente-leitura "Solicitação de Origem" se `solicitacaoOrcamentoId` estiver preenchido

**Status:** ⬜  
**Concluído em:** —

---

### Etapa 6 — OrcamentoVenda: N custos via OrcamentoVendaCusto
**Arquivo:** `import-costs/src/app/v2/features/orcamento-venda/pages/orcamento-venda.component.ts`

Mudanças:
- Seletor de custo base passa a ser **multi-seleção** (checkbox por custo)
- `custosSelecionados: CustoDespachante[]` acumula os N selecionados
- Ao salvar, criar um registro `OrcamentoVendaCusto` por custo selecionado
- Na listagem, mostrar múltiplos códigos de custo (separados por vírgula)
- Preview mantém o primeiro custo selecionado como referência principal (FOB/CIF/taxa)
- Retrocompatibilidade: ao carregar `OrcamentoVenda` antigo com `custoDespachanteId`, popular `orcCustos` automaticamente ao abrir

**Status:** ⬜  
**Concluído em:** —

---

### Etapa 7 — Rota + Menu
**Arquivos:** `app.routes.ts` e `shell-v2.component.ts`

- Nova rota: `{ path: 'solicitacoes', loadComponent: ... }`
- Link no menu grupo "Operação" (acima de Embarques):
  ```html
  <a routerLink="/solicitacoes" routerLinkActive="active">
    <span class="icon">📋</span><span>Solicitações</span>
  </a>
  ```

**Status:** ⬜  
**Concluído em:** —

---

### Etapa 8 — Seed demo
**Arquivo:** `import-costs/src/app/v2/core/helpers/seed-demo.service.ts`

Adicionar 2 solicitações de exemplo com despachantes vinculados:
- `SOL-2026-001`: Shanghai → Santos | TechBrasil | container 40 | 2 despachantes (1 Respondido, 1 Pendente)
- `SOL-2026-002`: Ningbo → Paranaguá | Têxtil Sul | container 40 | 1 despachante (Respondido → CD-2026-002)

Vincular `CD-2026-001` e `CD-2026-002` a `SOL-2026-001` e `SOL-2026-002` respectivamente (`solicitacaoOrcamentoId`).

Criar `OrcamentoVendaCusto` para `OV-2026-001` → `CD-2026-001`.

**Status:** ⬜  
**Concluído em:** —

---

### Etapa 9 — Build + Testes
- `npm run build` sem erros
- Navegar em: Solicitações (lista, criar, editar), Custos (badge), Orçamentos (multi-seleção)
- Verificar seed demo: Dashboard mostra KPIs corretos

**Status:** ⬜  
**Concluído em:** —

---

## Posição Atual

```
[1]─[2]─[3]─[4]─[5]─[6]─[7]─[8]─[9]
 ⬜   ⬜   ⬜   ⬜   ⬜   ⬜   ⬜   ⬜   ⬜
```

**0 de 9 etapas concluídas (0%)**

---

## Log de Progresso

| Data/Hora | Etapa | Ação |
|-----------|-------|------|
| 08/04/2026 | — | Sprint criado |

---

## Notas Técnicas

- Manter retrocompatibilidade: `OrcamentoVenda.custoDespachanteId` fica como `?` por ora
- `responsavel` em `SolicitacaoOrcamento` é `string` livre (padrão de `CustoDespachante.responsavel`)
- `OrcamentoVendaCusto` usa `keysV2.orcCustos` = `'v2_orc_custos'`
- Seed demo já usa IDs fixos (`SOL-2026-001`, etc.) — garantir UUIDs reais no `SeedDemoService`
- Não commitar durante o sprint — tudo na branch atual
