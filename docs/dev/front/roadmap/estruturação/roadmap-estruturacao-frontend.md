# Roadmap — Estruturação do Frontend (Angular V2)

> **Classificação:** Manutenção Técnica / Qualidade de Código  
> **Objetivo:** Tornar o frontend fácil de ajustar, manter, corrigir e componentizar, sem reescritas de regra de negócio  
> **Critério de sucesso:** Qualquer desenvolvedor consegue encontrar, alterar e testar qualquer parte da UI sem efeitos colaterais

---

## Diagnóstico do Estado Atual

### Problemas Identificados

| # | Problema | Impacto | Exemplos |
|---|---------|--------|---------|
| P-01 | **God Components** — componentes com 500–1500 linhas misturando template HTML, lógica e estilos | Alto | `custo-despachante.component.ts` (1524 ln), `orcamento-detail.component.ts` (1367 ln), `embarque-aduana.component.ts` (1188 ln) |
| P-02 | **Estilos inline em TypeScript** — CSS embutido no array `styles: []` de cada componente | Alto | Todos os componentes V2 usam template string de CSS — impossível reutilizar ou sobrescrever |
| P-03 | **Duplicação de CSS** — classes como `.toolbar`, `.search`, `.section-header`, `.btn-icon` redefinidas em múltiplos componentes | Médio | `crud-page.styles.ts` existe mas não é adotado consistentemente |
| P-04 | **Ausência de biblioteca de UI compartilhada** — não há componentes reutilizáveis para botões, badges, modais, campos de formulário, tabelas | Alto | Cada feature reimplementa botões, badges de status, spinners |
| P-05 | **Tokens de design parcialmente usados** — CSS variables definidas em `styles.scss` mas ignoradas em partes do inline CSS | Médio | Cores hardcoded como `#667eea`, `#ef4444` em estilos dos componentes |
| P-06 | **Nenhuma separação template/lógica** — todo HTML está em template string dentro do `.ts` | Médio | Faz busca, diff, formatação HTML impossíveis nos componentes de operação |
| P-07 | **SCSS usado de forma inconsistente** — apenas `templates-packlist` e features legadas usam `.scss`; V2 usa inline | Baixo | Mix de abordagens gera confusão |

---

## Arquitetura-Alvo

```
src/
├── styles.scss                    ← tokens globais (CSS vars) + reset
├── styles/
│   ├── _tokens.scss               ← NOVO: todas as CSS variables documentadas
│   ├── _typography.scss           ← NOVO: headings, body, labels
│   ├── _buttons.scss              ← NOVO: .btn, .btn-primary, .btn-icon etc.
│   ├── _badges.scss               ← NOVO: .badge-* status
│   ├── _tables.scss               ← NOVO: tabela padrão
│   ├── _forms.scss                ← NOVO: inputs, selects, fieldsets
│   ├── _modals.scss               ← NOVO: overlay, modal-box
│   └── _layout.scss               ← NOVO: containers, grid utilitários
└── app/
    └── v2/
        ├── shared/
        │   ├── styles/
        │   │   └── crud-page.styles.ts    ← manter como fallback / migrar
        │   └── components/              ← NOVO: biblioteca de UI
        │       ├── ui-badge/
        │       ├── ui-button/
        │       ├── ui-modal/
        │       ├── ui-table/
        │       ├── ui-empty-state/
        │       ├── ui-page-header/
        │       └── ui-status-badge/
        ├── core/
        └── features/
            └── [feature]/
                ├── pages/
                │   ├── [page].component.ts   ← apenas lógica
                │   └── [page].component.html ← template extraído
                ├── components/           ← NOVO: sub-componentes da feature
                ├── models/
                └── services/
```

---

## Fases do Roadmap

---

### FASE 1 — Fundação de Estilos
**Objetivo:** Centralizar todos os estilos em arquivos SCSS separados para eliminar duplicação e tornar qualquer ajuste de UI um ponto único de mudança.

**Estimativa:** 2–3 dias  
**Risco:** Baixo (apenas reorganização, sem tocar lógica)

#### ATI-01 — Extrair tokens para `_tokens.scss`
Mover todas as CSS variables de `styles.scss` para um arquivo dedicado `src/styles/_tokens.scss`. Adicionar tokens faltantes com documentação por categoria.

**Tokens a documentar:**
- Cores: `--color-*`
- Espaçamentos: `--spacing-*`
- Raios: `--radius-*`
- Sombras: `--shadow-*`
- Transições: `--transition-*`
- Gradiente: `--gradient-*`

**Critério de aceite:** `styles.scss` importa `_tokens.scss` com `@use` e funciona igual.

---

#### ATI-02 — Criar `_buttons.scss`
Definir todas as variantes de botão em um único arquivo.

**Classes a padronizar:**

| Classe | Uso |
|--------|-----|
| `.btn` | base — padding, border-radius, cursor, transition |
| `.btn-primary` | fundo gradient-primary, texto branco |
| `.btn-secondary` | borda, fundo transparente |
| `.btn-danger` | fundo --color-danger |
| `.btn-ghost` | sem borda, fundo ao hover |
| `.btn-icon` | quadrado, apenas ícone |
| `.btn-sm` | tamanho reduzido |
| `.btn-lg` | tamanho ampliado |
| `.btn[disabled]` | opacidade + cursor not-allowed |

**Critério de aceite:** todos os botões do sistema rendem com classes do `_buttons.scss`; nenhum botão com `style=""` inline.

---

#### ATI-03 — Criar `_badges.scss`
Centralizar todos os badges de status.

**Classes a padronizar:**

| Classe | Cor | Uso |
|--------|-----|-----|
| `.badge` | base | padding, border-radius, font-size, font-weight |
| `.badge-success` | verde | Finalizado, Entregue, Aprovado, Ativo |
| `.badge-warning` | âmbar | AguardandoCusto, Previsto, Pendente |
| `.badge-info` | azul | Registrado, AguardandoDespachante |
| `.badge-neutral` | cinza | Rascunho, Inativo |
| `.badge-danger` | vermelho | Cancelado, Erro |
| `.badge-primary` | roxo/azul | Atracado, Aprovada |

**Critério de aceite:** todo status badge no sistema usa classe de `_badges.scss`.

---

#### ATI-04 — Criar `_tables.scss`
Tabela com aparência consistente em todas as listagens.

**Elementos:**
- `.table-wrapper` — scroll horizontal
- `.data-table` — `width: 100%`, `border-collapse`
- `.data-table thead th` — fundo, cor, padding, uppercase
- `.data-table tbody tr:hover` — highlight
- `.data-table td` — padding, border-bottom
- `.col-actions` — alinhamento à direita

**Critério de aceite:** todas as tabelas de listagem usam `data-table`; nenhuma com `style=""` inline na tag `<table>`.

---

#### ATI-05 — Criar `_forms.scss`
Inputs, selects, labels e fieldsets padronizados.

**Elementos:**
- `.form-group` — label + input empilhados
- `.form-label` — tipografia de label
- `.form-control` — input/select/textarea com border, padding, focus ring
- `.form-control:focus` — `--color-primary` border + shadow
- `.form-control[disabled]` — bg muted
- `.form-hint` — texto auxiliar abaixo do campo
- `.form-error` — mensagem de erro (vermelho)
- `.form-row` — `display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))`
- `.form-section` — bloco com título e campos agrupados

**Critério de aceite:** formulário do CustoDespachante (wizard etapa 1) usa exclusivamente classes de `_forms.scss`.

---

#### ATI-06 — Criar `_modals.scss`
Overlay e caixas de modal padronizados.

**Elementos:**
- `.modal-overlay` — fixed, backdrop blur/escurecimento
- `.modal-box` — card branco, border-radius, shadow-lg, max-width parametrizável via `--modal-width`
- `.modal-header` — título + botão de fechar
- `.modal-body` — padding, scroll se necessário
- `.modal-footer` — ações alinhadas à direita
- Variantes: `.modal-box.sm`, `.modal-box.lg`, `.modal-box.xl`

**Critério de aceite:** modais de CustoDespachante, EmbarqueAduana e SolicitacaoOrcamento usam classes de `_modals.scss`.

---

#### ATI-07 — Atualizar `styles.scss` para importar todos os parciais
```scss
// styles.scss
@use 'styles/tokens'     as *;
@use 'styles/typography';
@use 'styles/buttons';
@use 'styles/badges';
@use 'styles/tables';
@use 'styles/forms';
@use 'styles/modals';
@use 'styles/layout';
```

**Critério de aceite:** build sem erros; visual idêntico ao estado anterior.

---

### FASE 2 — Biblioteca de Componentes Compartilhados (UI Kit)
**Objetivo:** Criar componentes Angular para os padrões de UI repetidos, eliminando duplicação de HTML/CSS entre features.

**Estimativa:** 4–6 dias  
**Risco:** Médio (componentes novos, features existentes não são tocadas nesta fase)

#### ATI-08 — `UiPageHeaderComponent`
Cabeçalho padronizado de página com título, subtítulo e slot de ações.

```typescript
// Uso
<ui-page-header title="Solicitações de Orçamento" subtitle="Gestão comercial">
  <button class="btn btn-primary">+ Nova Solicitação</button>
</ui-page-header>
```

**Inputs:** `title: string`, `subtitle?: string`  
**Slots:** `ng-content` para ações

---

#### ATI-09 — `UiStatusBadgeComponent`
Badge de status genérico com mapeamento de cor por valor.

```typescript
// Uso
<ui-status-badge [value]="custo.status" [map]="statusMap" />
```

**Inputs:** `value: string`, `map: Record<string, {label: string, class: string}>`

**Benefício:** centraliza todos os maps de status; mudança de cor de um status é feita em um único lugar.

---

#### ATI-10 — `UiEmptyStateComponent`
Estado vazio padronizado com ícone, mensagem e ação opcional.

```typescript
// Uso
<ui-empty-state icon="📋" message="Nenhuma solicitação encontrada">
  <button class="btn btn-primary">Criar primeira solicitação</button>
</ui-empty-state>
```

---

#### ATI-11 — `UiConfirmModalComponent`
Modal de confirmação de exclusão/ação — usado em todos os cadastros.

```typescript
// Uso via serviço
this.confirmModal.open({
  title: 'Excluir CustoDespachante',
  message: 'Esta ação não pode ser desfeita.',
  confirmLabel: 'Excluir',
  danger: true
}).then(confirmed => { ... });
```

---

#### ATI-12 — `UiSearchBarComponent`
Campo de busca padronizado com debounce e ícone.

```typescript
// Uso
<ui-search-bar placeholder="Buscar solicitações..." (search)="onSearch($event)" />
```

---

#### ATI-13 — `UiLoadingSpinnerComponent`
Spinner de carregamento padronizado com overlay opcional.

```typescript
// Uso inline
<ui-loading-spinner *ngIf="loading" />
// Uso overlay de tela
<ui-loading-spinner overlay *ngIf="saving" />
```

---

### FASE 3 — Extração de Templates HTML
**Objetivo:** Separar o HTML de cada componente do arquivo `.ts`, tornando templates editáveis sem mexer na lógica.

**Estimativa:** 3–4 dias  
**Risco:** Baixo (o Angular compila igual; é apenas reorganização de arquivo)  
**Prioridade:** Componentes maiores primeiro

#### ATI-14 — Extrair templates dos God Components (ordem de prioridade)

| Prioridade | Componente | Linhas | Arquivo HTML gerado |
|-----------|-----------|--------|---------------------|
| 1 | `custo-despachante.component.ts` | 1524 | `custo-despachante.component.html` |
| 2 | `orcamento-detail.component.ts` | 1367 | `orcamento-detail.component.html` |
| 3 | `orcamento-venda.component.ts` | 1255 | `orcamento-venda.component.html` |
| 4 | `embarque-aduana.component.ts` | 1188 | `embarque-aduana.component.html` |
| 5 | `solicitacao-orcamento.component.ts` | 956 | `solicitacao-orcamento.component.html` |
| 6 | `aduana-detail.component.ts` | 768 | `aduana-detail.component.html` |
| 7 | `aduana.component.ts` | 684 | `aduana.component.html` |
| 8 | `embarque-acompanhamento.component.ts` | 654 | `embarque-acompanhamento.component.html` |
| 9 | `controle-navios.component.ts` | 572 | `controle-navios.component.html` |
| 10 | `dashboard.component.ts` (v2) | 523 | `dashboard.component.html` |

**Procedimento por componente:**
1. Copiar o conteúdo de `template: \`...\`` para `[nome].component.html`
2. Alterar o decorator: `templateUrl: './[nome].component.html'`
3. Remover a propriedade `template`
4. Verificar build sem erros

---

#### ATI-15 — Migrar estilos inline para SCSS por feature
Para cada componente da fase anterior, criar `[nome].component.scss` e mover os estilos do array `styles: []`.

**Procedimento:**
1. Copiar o conteúdo de `styles: [\`...\`]` para `[nome].component.scss`
2. Alterar o decorator: `styleUrls: ['./[nome].component.scss']`
3. Substituir classes duplicadas por imports de `_buttons`, `_badges`, `_tables`, `_forms`, `_modals`
4. Excluir estilos que já existem globalmente — não redefinir

---

### FASE 4 — Decomposição de God Components
**Objetivo:** Dividir os componentes maiores em sub-componentes menores e focados, facilitando manutenção isolada de cada seção.

**Estimativa:** 6–10 dias  
**Risco:** Médio-Alto (mexe em lógica e bindings)  
**Pré-requisito:** Fases 1, 2 e 3 concluídas

#### ATI-16 — Decomposição do `embarque-aduana.component` (1188 ln)

Criar sub-componentes dentro de `features/embarque-aduana/components/`:

| Sub-componente | Responsabilidade |
|----------------|-----------------|
| `embarque-timeline.component` | Renderiza a timeline visual dos 7 status + clique para transição |
| `embarque-free-time.component` | Listagem e CRUD de períodos de Free Time |
| `embarque-pagamentos.component` | Listagem e CRUD de pagamentos do processo |
| `embarque-historico.component` | Feed cronológico do histórico de status |
| `embarque-form.component` | Formulário de edição dos campos operacionais (BL, container, datas) |

**Contrato:** cada sub-componente recebe o `embarque` como `@Input()` e emite eventos via `@Output()` para o page component coordenar.

---

#### ATI-17 — Decomposição do `custo-despachante.component` (1524 ln)

Criar sub-componentes dentro de `features/custo-despachante/components/`:

| Sub-componente | Responsabilidade |
|----------------|-----------------|
| `custo-wizard-step1.component` | Dados Gerais do custo |
| `custo-wizard-step2.component` | Licenças de Importação |
| `custo-wizard-step3.component` | Despesas |
| `custo-wizard-step4.component` | NCMs e Impostos |
| `custo-wizard-nav.component` | Navegação entre etapas (indicador de passo + botões) |
| `custo-imposto-detail.component` | Card de cálculo de imposto por NCM |

---

#### ATI-18 — Decomposição do `solicitacao-orcamento.component` (956 ln)

Criar sub-componentes dentro de `features/solicitacao-orcamento/components/`:

| Sub-componente | Responsabilidade |
|----------------|-----------------|
| `solicitacao-form.component` | Campos principais da SOL |
| `solicitacao-despachantes.component` | Tabela de despachantes + add/remove |
| `solicitacao-orcamento-venda.component` | Seção do OV vinculado |
| `solicitacao-documentos.component` | Lista de documentos anexos |

---

#### ATI-19 — Decomposição do `controle-navios.component` (572 ln)

Criar sub-componentes dentro de `features/logistica/controle-navios/components/`:

| Sub-componente | Responsabilidade |
|----------------|-----------------|
| `navio-card.component` | Linha de navio com sub-tabela de embarques e trajectórias |
| `navio-embarques-table.component` | Sub-tabela de embarques por navio |
| `navio-trajetos-list.component` | Sub-lista de trajetos por navio |
| `navio-form.component` | Formulário de criação/edição de navio + trajetos |

---

### FASE 5 — Padronização de Cadastros (CRUD Pattern)
**Objetivo:** Criar um padrão único de CRUD para todas as telas de cadastro, reduzindo código duplicado de ~12 cadastros.

**Estimativa:** 3–5 dias  
**Risco:** Baixo-Médio

#### ATI-20 — Criar componente genérico `CrudPageComponent`
Encapsular o padrão de listagem + formulário inline em um componente configurável.

```typescript
// Uso hipotético
<app-crud-page
  [title]="'Despachantes'"
  [columns]="despachantesColumns"
  [items]="despachantes()"
  [formTemplate]="despachanteForm"
  (save)="onSave($event)"
  (delete)="onDelete($event)"
/>
```

**Aplica-se a todos os 12 cadastros** que seguem o padrão lista + form inline.

---

#### ATI-21 — Unificar `crud-page.styles.ts` nos arquivos SCSS
Migrar o conteúdo de `shared/styles/crud-page.styles.ts` para os parciais SCSS correspondentes (`_tables.scss`, `_forms.scss`, `_badges.scss`). Remover o arquivo `.ts`.

---

### FASE 6 — Qualidade e Documentação Técnica
**Objetivo:** Garantir que as convenções sejam preservadas por novos desenvolvedores.

**Estimativa:** 2–3 dias

#### ATI-22 — Criar `CONVENTIONS.md` de Frontend
Arquivo `docs/dev/front/CONVENTIONS.md` com:
- Onde criar cada tipo de arquivo (page vs. component vs. shared)
- Convenção de nomenclatura de arquivos e classes
- Como usar os parciais SCSS
- Como criar um novo cadastro seguindo o padrão
- Regra: sem estilos inline em TypeScript
- Regra: template HTML sempre em arquivo `.html` separado

#### ATI-23 — Criar storybook stories para o UI Kit
Para cada componente criado nas ATI-08 a ATI-13, criar uma story em `storybook-stories/`:
- `UiBadge.stories.ts`
- `UiPageHeader.stories.ts`
- `UiEmptyState.stories.ts`
- `UiConfirmModal.stories.ts`

#### ATI-24 — Lint CSS — proibir estilos hardcoded
Configurar regra no projeto (via comentário de PR ou lint custom) para rejeitar:
- Cores hexadecimais fora de `_tokens.scss`
- `style=""` em templates HTML
- `styles: []` com conteúdo em arquivos de página/feature

---

## Ordem de Execução Recomendada

```
FASE 1 (Fundação SCSS)
  ATI-01 → ATI-02 → ATI-03 → ATI-04 → ATI-05 → ATI-06 → ATI-07
      ↓
FASE 2 (UI Kit — pode ser paralela à Fase 3)
  ATI-08 → ATI-09 → ATI-10 → ATI-11 → ATI-12 → ATI-13
      ↓
FASE 3 (Extração de Templates)
  ATI-14 → ATI-15  (componente por componente, prioridade de tamanho)
      ↓
FASE 4 (Decomposição)  ← maior esforço e risco
  ATI-16 → ATI-17 → ATI-18 → ATI-19
      ↓
FASE 5 (Padronização CRUD)
  ATI-20 → ATI-21
      ↓
FASE 6 (Qualidade)
  ATI-22 → ATI-23 → ATI-24
```

---

## Impacto por Atividade

| Atividade | Esforço | Risco | Impacto na Manutenção |
|-----------|---------|-------|-----------------------|
| ATI-01 Tokens | Baixo | Nenhum | Alto — ponto único para trocar paleta |
| ATI-02 Buttons | Baixo | Nenhum | Alto — botão alterado uma vez reflete em todo o sistema |
| ATI-03 Badges | Baixo | Nenhum | Alto — cor de status alterada em um arquivo |
| ATI-04 Tables | Baixo | Nenhum | Alto |
| ATI-05 Forms | Médio | Baixo | Alto |
| ATI-06 Modals | Médio | Baixo | Alto |
| ATI-08–13 UI Kit | Médio | Baixo | Muito Alto — elimina duplicação entre features |
| ATI-14 Extract HTML | Médio | Nenhum | Médio — melhora legibilidade, habilita formatação HTML |
| ATI-15 Extract SCSS | Médio | Baixo | Alto — permite `@extend`, `@mixin`, IDE autocomplete CSS |
| ATI-16–19 Decomposição | Alto | Médio | Muito Alto — isolamento total de cada seção |
| ATI-20 CRUD genérico | Alto | Médio | Muito Alto — novo cadastro = zero código de UI |

---

## Critérios de Conclusão do Roadmap

- [ ] Nenhum componente com mais de **400 linhas** de TypeScript
- [ ] Zero estilos com cores hexadecimais fora de `_tokens.scss`
- [ ] Zero `styles: [...]` não-vazios em componentes de feature
- [ ] Zero templates HTML inline (template string) em componentes de feature
- [ ] Todo badge de status usa `UiStatusBadgeComponent` ou classe de `_badges.scss`
- [ ] Todo botão usa classe de `_buttons.scss`
- [ ] Código de novo cadastro não duplica HTML de listagem/formulário existente
