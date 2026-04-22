# Roadmap — Responsividade Frontend (comex133_front)

> **Branch de trabalho:** `feat/responsividade-layout`  
> **Início:** 22/04/2026  
> **Meta:** 100% das telas responsivas em mobile (≤480px), tablet (481–768px) e desktop (≥769px)  
> **Política de commit:** ao final de cada fase, commit com mensagem padronizada e decisão de continuidade documentada aqui.

---

## Índice

1. [Contexto e Diagnóstico Inicial](#1-contexto-e-diagnóstico-inicial)
2. [Breakpoints e Convenções Adotados](#2-breakpoints-e-convenções-adotados)
3. [Inventário Completo de Telas e Componentes](#3-inventário-completo-de-telas-e-componentes)
4. [Pontos Críticos e Riscos](#4-pontos-críticos-e-riscos)
5. [Plano de Fases](#5-plano-de-fases)
6. [Progresso por Fase](#6-progresso-por-fase)
7. [Log de Commits](#7-log-de-commits)
8. [Checklist Geral de Conclusão](#8-checklist-geral-de-conclusão)

---

## 1. Contexto e Diagnóstico Inicial

### Tecnologias
- Angular 17+ (Standalone Components, Signals)
- SCSS global (`src/styles.scss`) + estilos inline nas components
- CSS Grid / Flexbox para layout
- Estilos CRUD compartilhados via `crud-page.styles.ts`

### O que já existe de responsividade
| Arquivo | O que cobre | Estado |
|---|---|---|
| `styles.scss` | containers, kpis-grid, cards-grid, data-table font/padding | Parcial — faltam shell, forms, toolbars |
| `custo-despachante.component.ts` | resumo-dados-grid quebra em 2 colunas em ≤800px | Parcial — faltam tabelas e form |
| `orcamento-venda.component.ts` | ov-layout quebra em 1 coluna em ≤1100px | Parcial — faltam tabelas, modal, form |
| `embarque-aduana.component.ts` | detail-grid quebra em 1 coluna em ≤768px | Parcial |
| `embarque-navio-vinculo-form.component.ts` | grid do form em ≤768px | Parcial |
| `controle-navios.component.ts` | grid quebra em ≤900px | Parcial |
| `pagination.component.ts` | esconde botões em ≤768px | OK |
| `toast-container.component.ts` | position/width em ≤480px | OK |

### O que NÃO existe (gaps críticos)
- **Shell V2** (`shell-v2.component.ts`): sidebar fixa de 260px, sem nenhum media query → inutilizável em mobile
- **`crud-page.styles.ts`**: `form-grid` fixo em 3 colunas, sem breakpoints → todos os 13 CRUDs ficam cortados em telas estreitas
- **Toolbar responsiva**: botão "Novo" empilha com campo de busca em telas pequenas
- **Tabelas de dados**: a maioria não tem scroll horizontal nem colapso de colunas em mobile
- **Forms de detalhe**: nenhuma tela de CRUD tem formulário adaptado para 1 coluna em mobile
- **Modals/Drawers**: não há padrão responsivo nos painéis laterais/modals de detalhe
- **Fontes e espaçamentos**: em 480px o conteúdo ainda usa paddings de desktop

---

## 2. Breakpoints e Convenções Adotados

```
xs   : ≤ 480px   (mobile portrait)
sm   : 481–768px (mobile landscape / tablet portrait)
md   : 769–1024px (tablet landscape)
lg   : ≥ 1025px  (desktop)
```

### Mixins SCSS a definir em `styles.scss`
```scss
// adicionar ao bloco de variáveis/utilitários
$bp-xs: 480px;
$bp-sm: 768px;
$bp-md: 1024px;

@mixin mobile { @media (max-width: #{$bp-xs}) { @content; } }
@mixin tablet { @media (max-width: #{$bp-sm}) { @content; } }
@mixin tablet-up { @media (min-width: calc(#{$bp-xs} + 1px)) { @content; } }
@mixin desktop-down { @media (max-width: #{$bp-md}) { @content; } }
```

### Convenções de classe responsiva utilitária
| Classe | Descrição |
|---|---|
| `.hide-mobile` | `display:none` em ≤480px |
| `.hide-tablet` | `display:none` em ≤768px |
| `.show-mobile` | `display:block` apenas em ≤480px |
| `.stack-mobile` | flex-direction:column em ≤480px |

---

## 3. Inventário Completo de Telas e Componentes

### 3.1 Componentes de Layout / Core

| # | Componente | Arquivo | Prioridade | Status |
|---|---|---|---|---|
| L1 | Shell V2 (sidebar + header + grid) | `v2/core/layout/shell-v2.component.ts` | 🔴 CRÍTICO | ⬜ Pendente |
| L2 | Paginação | `core/components/pagination/pagination.component.ts` | 🟡 Média | ✅ OK |
| L3 | Toast | `core/components/toast/toast-container.component.ts` | 🟢 Baixa | ✅ OK |

### 3.2 Estilos Compartilhados

| # | Componente | Arquivo | Prioridade | Status |
|---|---|---|---|---|
| S1 | Estilos globais | `src/styles.scss` | 🔴 CRÍTICO | ⬜ Parcial (shell, forms faltam) |
| S2 | Estilos CRUD compartilhados | `v2/shared/styles/crud-page.styles.ts` | 🔴 CRÍTICO | ⬜ Pendente |

### 3.3 Páginas Operacionais (Alta Complexidade)

| # | Tela | Arquivo | Prioridade | Status |
|---|---|---|---|---|
| P1 | Solicitações de Orçamento | `v2/features/solicitacao-orcamento/pages/solicitacao-orcamento.component.ts` | 🔴 ALTA | ⬜ Pendente |
| P2 | Orçamentos de Venda | `v2/features/orcamento-venda/pages/orcamento-venda.component.ts` | 🔴 ALTA | ⬜ Parcial |
| P3 | Custo Despachante | `v2/features/custo-despachante/pages/custo-despachante.component.ts` | 🔴 ALTA | ⬜ Parcial |
| P4 | Embarque / Aduana | `v2/features/embarque-aduana/pages/embarque-aduana.component.ts` | 🔴 ALTA | ⬜ Parcial |
| P5 | Embarque Acompanhamento | `v2/features/embarque-aduana/pages/embarque-acompanhamento.component.ts` | 🟡 MÉDIA | ⬜ Pendente |
| P6 | Controle de Navios | `v2/features/logistica/controle-navios/pages/controle-navios.component.ts` | 🟡 MÉDIA | ⬜ Parcial |

### 3.4 Dashboard

| # | Tela | Arquivo | Prioridade | Status |
|---|---|---|---|---|
| D1 | Dashboard | `v2/features/dashboard/dashboard.component.ts` | 🟡 MÉDIA | ⬜ Pendente |

### 3.5 Cadastros (13 CRUDs — todos afetados por S2)

| # | Tela | Arquivo | Prioridade | Status |
|---|---|---|---|---|
| C1 | Clientes | `v2/features/cadastros/clientes/` | 🟡 MÉDIA | ⬜ Pendente |
| C2 | Importadores | `v2/features/cadastros/importadores/` | 🟡 MÉDIA | ⬜ Pendente |
| C3 | Exportadores | `v2/features/cadastros/exportadores/` | 🟡 MÉDIA | ⬜ Pendente |
| C4 | Despachantes | `v2/features/cadastros/despachantes/` | 🟡 MÉDIA | ⬜ Pendente |
| C5 | Agentes de Carga | `v2/features/cadastros/agentes-carga/` | 🟡 MÉDIA | ⬜ Pendente |
| C6 | Fabricantes | `v2/features/cadastros/fabricantes/` | 🟡 MÉDIA | ⬜ Pendente |
| C7 | Navios | `v2/features/cadastros/navios/` | 🟡 MÉDIA | ⬜ Pendente |
| C8 | Portos de Origem | `v2/features/cadastros/portos-origem/` | 🟡 MÉDIA | ⬜ Pendente |
| C9 | Portos de Destino | `v2/features/cadastros/portos-destino/` | 🟡 MÉDIA | ⬜ Pendente |
| C10 | NCM | `v2/features/cadastros/ncm/` | 🟡 MÉDIA | ⬜ Pendente |
| C11 | Despesas — Catálogo | `v2/features/cadastros/despesas-cadastro/` | 🟡 MÉDIA | ⬜ Pendente |
| C12 | Modelos de Despesa | `v2/features/cadastros/modelos-despesa/` | 🟡 MÉDIA | ⬜ Pendente |
| C13 | Lista Preço LCL | `v2/features/cadastros/lista-preco-lcl/` | 🟡 MÉDIA | ⬜ Pendente |

### 3.6 Administração e Documentos

| # | Tela | Arquivo | Prioridade | Status |
|---|---|---|---|---|
| A1 | Usuários | `v2/features/administracao/usuarios/` | 🟡 MÉDIA | ⬜ Pendente |
| A2 | Roles | `v2/features/administracao/roles/` | 🟢 BAIXA | ⬜ Pendente |
| A3 | Documentos | `v2/features/documentos/` | 🟡 MÉDIA | ⬜ Pendente |

### 3.7 Autenticação

| # | Tela | Arquivo | Prioridade | Status |
|---|---|---|---|---|
| AU1 | Login | `features/auth/` | 🔴 CRÍTICO | ⬜ Verificar |
| AU2 | Perfil | `features/auth/pages/profile.component.ts` | 🟡 MÉDIA | ⬜ Parcial (tem @media 600px) |

---

## 4. Pontos Críticos e Riscos

### 4.1 Riscos Técnicos

| Risco | Impacto | Probabilidade | Mitigação |
|---|---|---|---|
| **Shell V2 sem breakpoints** — sidebar ocupa 260px em mobile, não há overlay/drawer | BLOQUEANTE | Alto | Fase 1 resolve. Testar em iOS Safari e Android Chrome antes de avançar. |
| **`crud-page.styles.ts` é string literal** — CRUD_STYLES é um array de strings TypeScript inline; media queries dentro de template literals têm limitações de escopo em Shadow DOM | Médio | Médio | Migrar estilos para arquivo `.scss` separado ou usar `::ng-deep` controlado. |
| **Tabelas largas sem scroll horizontal** — tabelas com muitas colunas (Solicitações, Custo Despachante) vão "vazar" em mobile | Alto | Alto | Envolver em `.table-wrapper { overflow-x: auto }` como solução global. |
| **Formulários com `grid-template-columns: repeat(3, 1fr)`** — 3 colunas em 320px gera campos de ~90px de largura, inutilizáveis | BLOQUEANTE | Alto | Fase 2 resolve com breakpoint para 1 coluna em mobile. |
| **Componentes de mapa/print** — Custo Despachante e Orçamento Venda têm estilos de impressão; responsividade não deve quebrar o `@media print` | Médio | Baixo | Preservar blocos `@media print` e não misturar com blocos de tela. |
| **Telas complexas com estado** — Solicitações de Orçamento tem ≥1500 linhas de template; alterar estilos pode quebrar comportamento do painel de detalhe | Alto | Médio | Fazer ajuste incremental; testar com dados reais após cada sub-fase. |
| **Scrolling em iOS Safari** — `-webkit-overflow-scrolling` pode causar comportamento inesperado em sidebars com `position:fixed` | Médio | Baixo | Usar `overflow-y: auto` + testar em dispositivo real ou BrowserStack. |
| **Testes** — projeto não tem testes e2e para layout | Médio | Alto | Verificação visual manual por breakpoint após cada fase; manter checklist. |

### 4.2 Pontos Críticos de UX

- **Sidebar em mobile**: deve colapsar para um drawer/overlay que abre sobre o conteúdo, não empurra
- **Tabelas de dados**: em mobile a experiência ideal é scroll horizontal + sticky primeira coluna; não remover colunas pois dados são necessários
- **Formulários**: em mobile empilhar todos os campos em 1 coluna
- **Botões de ação em tabela** (editar/excluir): em mobile considerar menu contextual ou ícones maiores (mín. 44x44px por diretrizes de toque)
- **Header**: em mobile reduzir para só o botão de menu e o logo; esconder nome do usuário ou colapsar em dropdown
- **Modais e Drawers**: em mobile devem ocupar 100% da tela ou 90% com scroll interno

---

## 5. Plano de Fases

### FASE 0 — Auditoria e Fundação CSS
**Objetivo:** Estabelecer a base técnica antes de qualquer ajuste visual.  
**Estimativa:** 1 sessão de trabalho  
**Commit esperado:** `chore: setup breakpoints e utilitarios responsivos em styles.scss`

**Atividades:**
- [ ] 0.1 — Adicionar variáveis de breakpoint em `styles.scss` (`$bp-xs`, `$bp-sm`, `$bp-md`)
- [ ] 0.2 — Adicionar classes utilitárias: `.hide-mobile`, `.hide-tablet`, `.show-mobile`, `.stack-mobile`
- [ ] 0.3 — Adicionar `.table-wrapper { overflow-x: auto; -webkit-overflow-scrolling: touch; }` como padrão global
- [ ] 0.4 — Revisar e documentar todos os media queries já existentes no projeto (consolidar na seção de diagnóstico acima)
- [ ] 0.5 — Verificar se a tela de Login (`features/auth/`) já é responsiva

**Critério de aceite:**
- styles.scss compila sem erros
- Classe `.table-wrapper` funciona no browser (tabela com scroll horizontal em mobile)
- Build de produção passa

---

### FASE 1 — Shell V2: Layout Mobile (CRÍTICO — desbloqueia tudo)
**Objetivo:** Shell V2 funcional em qualquer tamanho de tela.  
**Estimativa:** 1–2 sessões de trabalho  
**Commit esperado:** `feat(shell): sidebar responsiva com overlay em mobile`

**Atividades:**
- [ ] 1.1 — Adicionar `BreakpointObserver` do Angular CDK (ou escuta de `window.innerWidth` via Signal) para detectar mobile
- [ ] 1.2 — Em mobile (≤768px): grid do wrapper muda para `grid-template-columns: 1fr` (sem sidebar fixa)
- [ ] 1.3 — Sidebar em mobile vira drawer `position: fixed; left: 0; top: 0; z-index: 1000; transform: translateX(-100%)` — aberta com toggle
- [ ] 1.4 — Overlay escuro semitransparente quando sidebar está aberta em mobile; clique no overlay fecha a sidebar
- [ ] 1.5 — Header em mobile: manter botão `☰`, logo/brand e botão de logout; esconder nome do usuário (ou mover para dentro da sidebar)
- [ ] 1.6 — Sidebar colapsada em desktop (estado atual) continua funcionando igual
- [ ] 1.7 — Sidebar em tablet (481–768px): mesmo comportamento de mobile (drawer overlay)
- [ ] 1.8 — Fechar automaticamente a sidebar ao navegar para outra rota em mobile
- [ ] 1.9 — Garantir `touch-action` e que `overflow: hidden` no body quando sidebar está aberta (evitar scroll duplo)

**Critério de aceite:**
- Em 320px: sidebar escondida por padrão, botão hamburguer abre drawer com overlay
- Em 768px: mesmo comportamento de mobile
- Em 1024px+: comportamento original preservado (sidebar fixa com collapse)
- Footer responsivo (não quebra em mobile)

---

### FASE 2 — Estilos CRUD Compartilhados
**Objetivo:** Todos os 13 CRUDs automaticamente responsivos via `crud-page.styles.ts`.  
**Estimativa:** 1 sessão de trabalho  
**Commit esperado:** `feat(crud-styles): form-grid e toolbar responsivos em mobile e tablet`

**Atividades:**
- [ ] 2.1 — Adicionar breakpoints em `crud-page.styles.ts` para `.form-grid`:
  - Desktop: `repeat(3, 1fr)` (mantém)
  - Tablet (≤768px): `repeat(2, 1fr)`
  - Mobile (≤480px): `1fr`
- [ ] 2.2 — Adicionar breakpoint para `.field.w2` e `.field.w3`: em mobile ambos viram `grid-column: 1` (sem span)
- [ ] 2.3 — Toolbar responsiva: em mobile `flex-wrap: wrap; gap: 8px` + botão "Novo" fica em linha separada ou à direita com `width: auto`
- [ ] 2.4 — Campo `.search` em mobile: `width: 100%` ao invés de `flex: 1`
- [ ] 2.5 — Ações da tabela (`.row-actions`): em mobile aumentar `min-height` dos botões para 36px (toque)
- [ ] 2.6 — Bloco `.card` em mobile: padding reduzido de 24px → 16px
- [ ] 2.7 — Testar visualmente em pelo menos 3 CRUDs (Clientes, Importadores, Navios)

**Critério de aceite:**
- Formulário de Clientes em 320px: todos os campos empilhados em 1 coluna, legíveis
- Toolbar em 320px: busca e botão não se sobrepõem
- 13 CRUDs verificados visualmente sem overflow horizontal

---

### FASE 3 — Dashboard
**Objetivo:** Dashboard responsivo em todos os breakpoints.  
**Estimativa:** 0,5 sessão de trabalho  
**Commit esperado:** `feat(dashboard): layout responsivo mobile e tablet`

**Atividades:**
- [ ] 3.1 — KPI Grid (`kpi-grid`): verificar se já funciona em mobile (styles.scss tem `auto-fit, minmax`); ajustar se necessário
- [ ] 3.2 — Page header (`page-title` + `page-subtitle`): verificar tamanho de fonte em mobile (máx 22px)
- [ ] 3.3 — Cards de status (se existirem): garantir que não quebram em 320px
- [ ] 3.4 — Links de navegação rápida do dashboard: verificar que são clicáveis em touch (min 44px)
- [ ] 3.5 — Testar em 320px, 375px, 768px, 1024px

**Critério de aceite:**
- Dashboard sem overflow horizontal em 320px
- KPIs visíveis e legíveis em mobile

---

### FASE 4 — Solicitações de Orçamento (Tela Mais Complexa)
**Objetivo:** Tela de Solicitações completamente responsiva.  
**Estimativa:** 2–3 sessões de trabalho  
**Commit esperado:** `feat(solicitacoes): responsividade completa mobile e tablet`

**Atividades:**
- [ ] 4.1 — Identificar todos os grids e tabelas no componente (≥1500 linhas — fazer leitura completa antes)
- [ ] 4.2 — Tabela principal de solicitações: adicionar `.table-wrapper` + `overflow-x: auto`
- [ ] 4.3 — Painel de detalhe lateral (se existir): em mobile deve virar modal full-screen ou accordion
- [ ] 4.4 — Formulários de filtro/busca: empilhar em mobile
- [ ] 4.5 — Seção de despachantes vinculados: tabela interna responsiva
- [ ] 4.6 — Seção de documentos: lista responsiva
- [ ] 4.7 — Botões de ação principal: garantir que não saem da tela em mobile
- [ ] 4.8 — Status chips/badges: verificar overflow em nomes longos
- [ ] 4.9 — Testar fluxo completo: criar → detalhar → adicionar despachante → adicionar documento

**Critério de aceite:**
- Fluxo principal navegável em iPhone SE (320px)
- Sem overflow horizontal em nenhum breakpoint
- Ações principais acessíveis por touch

---

### FASE 5 — Orçamentos de Venda
**Objetivo:** Complementar os ajustes parciais existentes.  
**Estimativa:** 1–2 sessões de trabalho  
**Commit esperado:** `feat(orcamentos-venda): responsividade completa mobile e tablet`

**Atividades:**
- [ ] 5.1 — Verificar o que já funciona (`ov-layout` tem breakpoint em 1100px)
- [ ] 5.2 — Tabela de orçamentos: scroll horizontal em mobile
- [ ] 5.3 — Painel/form de detalhe do orçamento: garantir 1 coluna em mobile
- [ ] 5.4 — Tabela de itens do orçamento (NCMs, despesas): scroll horizontal
- [ ] 5.5 — Botões de ação (Gerar PDF, Aprovar, etc.): empilhar em mobile
- [ ] 5.6 — Seção de totais/resumo financeiro: verificar alinhamento em mobile
- [ ] 5.7 — Garantir que `@media print` não é afetado

**Critério de aceite:**
- Orçamento criado e visualizado em 375px sem problemas
- Seção de totais legível em mobile

---

### FASE 6 — Custo Despachante
**Objetivo:** Complementar os ajustes parciais; garantir mobile completo.  
**Estimativa:** 1–2 sessões de trabalho  
**Commit esperado:** `feat(custo-despachante): responsividade completa mobile e tablet`

**Atividades:**
- [ ] 6.1 — Verificar o que já funciona (`resumo-dados-grid` tem breakpoint em 800px)
- [ ] 6.2 — Tabela de despesas: scroll horizontal em mobile
- [ ] 6.3 — Form de adição de despesa: 1 coluna em mobile
- [ ] 6.4 — Cabeçalho do custo (dados do processo): responsivo em mobile
- [ ] 6.5 — Seção de totais por categoria: responsivo
- [ ] 6.6 — Garantir `@media print` preservado

**Critério de aceite:**
- Tela de custo navegável em 375px
- Print layout não afetado

---

### FASE 7 — Embarque / Aduana + Acompanhamento
**Objetivo:** Embarque completamente responsivo.  
**Estimativa:** 1–2 sessões de trabalho  
**Commit esperado:** `feat(embarque): responsividade completa mobile e tablet`

**Atividades:**
- [ ] 7.1 — Verificar o que já funciona (`detail-grid` em 768px)
- [ ] 7.2 — Tabela de embarques: scroll horizontal em mobile
- [ ] 7.3 — Form de detalhe do embarque: verificar campos em 1 coluna
- [ ] 7.4 — Componente `embarque-navio-vinculo-form`: verificar breakpoint existente em 768px
- [ ] 7.5 — Tela de Acompanhamento: tabela + filtros responsivos
- [ ] 7.6 — Timeline de status (se existir): adaptação em mobile

**Critério de aceite:**
- Criar e editar embarque em 375px sem overflow

---

### FASE 8 — Controle de Navios
**Objetivo:** Controle de Navios completamente responsivo.  
**Estimativa:** 1 sessão de trabalho  
**Commit esperado:** `feat(controle-navios): responsividade completa mobile e tablet`

**Atividades:**
- [ ] 8.1 — Verificar o que já funciona (tem breakpoint em 900px)
- [ ] 8.2 — Grid de navios: verificar comportamento abaixo de 480px
- [ ] 8.3 — Form de detalhe do navio/vinculo: 1 coluna em mobile
- [ ] 8.4 — Tabela de vínculos: scroll horizontal

**Critério de aceite:**
- Tela navegável em 375px sem overflow

---

### FASE 9 — Documentos + Administração
**Objetivo:** Telas secundárias responsivas.  
**Estimativa:** 1 sessão de trabalho  
**Commit esperado:** `feat(admin-docs): responsividade telas de administracao e documentos`

**Atividades:**
- [ ] 9.1 — Documentos: lista de documentos + upload responsivos
- [ ] 9.2 — Usuários: tabela + form responsivos (já coberto parcialmente pelo CRUD compartilhado da Fase 2)
- [ ] 9.3 — Roles: tabela + form responsivos
- [ ] 9.4 — Perfil (`profile.component.ts`): verificar o breakpoint existente em 600px; completar para 480px

**Critério de aceite:**
- Todas as telas administrativas navegáveis em 375px

---

### FASE 10 — Autenticação (Login)
**Objetivo:** Tela de Login responsiva.  
**Estimativa:** 0,5 sessão de trabalho  
**Commit esperado:** `feat(auth): tela de login responsiva`

**Atividades:**
- [ ] 10.1 — Verificar layout atual do login (card centralizado)
- [ ] 10.2 — Em mobile: card deve ocupar 90% da tela
- [ ] 10.3 — Campos do formulário: `width: 100%` em mobile
- [ ] 10.4 — Logo e título: ajustar tamanhos para mobile

**Critério de aceite:**
- Login usável em 320px sem overflow

---

### FASE 11 — Testes e Polimento Final
**Objetivo:** Varredura completa cross-device antes de mergear na main.  
**Estimativa:** 1 sessão de trabalho  
**Commit esperado:** `fix(responsividade): ajustes finais pos-auditoria cross-device`

**Atividades:**
- [ ] 11.1 — Testar todas as telas em 320px (iPhone SE)
- [ ] 11.2 — Testar todas as telas em 375px (iPhone 14)
- [ ] 11.3 — Testar todas as telas em 768px (iPad portrait)
- [ ] 11.4 — Testar todas as telas em 1024px (iPad landscape)
- [ ] 11.5 — Verificar orientação landscape em mobile (567px)
- [ ] 11.6 — Verificar se não há regressões no desktop (1440px)
- [ ] 11.7 — Verificar print layouts (Custo Despachante, Orçamento Venda)
- [ ] 11.8 — Verificar acessibilidade de toque (elementos ≥44x44px)
- [ ] 11.9 — Build de produção limpo (sem erros)
- [ ] 11.10 — PR para main com descrição das mudanças

**Critério de aceite:**
- Nenhuma tela com overflow horizontal em nenhum breakpoint
- Build de produção passa sem warnings relevantes
- Checklist geral da seção 8 preenchido a 100%

---

## 6. Progresso por Fase

| Fase | Nome | % Completo | Início | Término | Decisão |
|---|---|---|---|---|---|
| 0 | Fundação CSS | ✅ 100% | 22/04/2026 | 22/04/2026 | ✅ Continuar |
| 1 | Shell V2 Mobile | ✅ 100% | 22/04/2026 | 22/04/2026 | ✅ Continuar |
| 2 | CRUD Compartilhado | ✅ 100% | 22/04/2026 | 22/04/2026 | ✅ Continuar |
| 3 | Dashboard | ✅ 100% | 22/04/2026 | 22/04/2026 | ✅ Continuar |
| 4 | Solicitações de Orçamento | ✅ 100% | 22/04/2026 | 22/04/2026 | ✅ Continuar |
| 5 | Orçamentos de Venda | ✅ 100% | 22/04/2026 | 22/04/2026 | ✅ Continuar |
| 6 | Custo Despachante | ✅ 100% | 22/04/2026 | 22/04/2026 | ✅ Continuar |
| 7 | Embarque / Aduana | ✅ 100% | 22/04/2026 | 22/04/2026 | ✅ Continuar |
| 8 | Controle de Navios | ✅ 100% | 22/04/2026 | 22/04/2026 | ✅ Continuar |
| 9 | Documentos + Administração | ✅ 100% | 22/04/2026 | 22/04/2026 | ✅ Continuar |
| 10 | Autenticação | ✅ 100% — já responsivo (verificado) | 22/04/2026 | 22/04/2026 | ✅ Continuar |
| 11 | Testes e Polimento | 0% | — | — | Próxima |
| **TOTAL** | | **91%** | 22/04/2026 | — | — |

---

## 7. Log de Commits

> Preencher ao final de cada fase com hash do commit, o que foi feito e a decisão de continuar.

| Data | Fase | Commit Hash | Mensagem | Decisão |
|---|---|---|---|---|
| 22/04/2026 | 0+1+2+3 | `c833795` | feat(responsividade): fases 0-3 - fundacao CSS, shell drawer mobile, CRUD styles e dashboard | ✅ Continuar para Fase 4 |
| 22/04/2026 | 4+5+6+7+8+9 | `9a97bf2` | feat(responsividade): fases 4-9 - solicitacoes, orcamentos, custos, embarque, navios, docs | ✅ Continuar para Fase 11 |

---

## 8. Checklist Geral de Conclusão

### Layout e Navegação
- [ ] Shell: sidebar como drawer em mobile com overlay
- [ ] Shell: header compacto em mobile
- [ ] Shell: footer responsivo
- [ ] Navegação: sidebar fecha ao navegar em mobile
- [ ] Navegação: `routerLinkActive` funciona com sidebar colapsada

### Formulários
- [ ] Todos os formulários em 1 coluna em ≤480px
- [ ] Todos os formulários em 2 colunas em 481–768px
- [ ] Campos com `width: 100%` em mobile
- [ ] Labels legíveis em mobile (mín 12px)
- [ ] Botões de submissão com altura mínima de 44px

### Tabelas
- [ ] Toda tabela envolve em `.table-wrapper` com `overflow-x: auto`
- [ ] Padding de células reduzido em mobile
- [ ] Botões de ação acessíveis por toque (mín 36px)

### Imagens e Ícones
- [ ] Ícones emoji (`📊`, `🚢` etc.) não causam overflow
- [ ] Nenhuma imagem extrapola o container

### Performance
- [ ] Não foram adicionados recursos pesados só para mobile
- [ ] Build de produção com bundle size aceitável

### Cross-browser
- [ ] Chrome (desktop + Android)
- [ ] Safari (desktop + iOS)
- [ ] Firefox (desktop)
- [ ] Edge (desktop)

### Acessibilidade Touch
- [ ] Todos os elementos interativos ≥ 44×44px em mobile
- [ ] Sem elementos clicáveis sobrepostos em mobile

---

*Documento criado em: 22/04/2026*  
*Última atualização: 22/04/2026 — após commit fases 4-9 (91% concluído)*  
*Branch: feat/responsividade-layout*
