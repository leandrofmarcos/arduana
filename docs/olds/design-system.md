# Design System

## Paleta de Cores

- Primária: `--color-primary` (`#667eea`) e `--gradient-primary` (de `#667eea` para `#764ba2`)
- Texto: `--color-text` (`#111827`) e `--color-muted` (`#6b7280`)
- Fundo: `--color-bg` (`#f3f4f6`) e `--color-surface` (`#ffffff`)
- Bordas: `--color-border` (`#e5e7eb`)
- Sucesso: `--color-success` (`#48bb78`)
- Alert `--color-sidebar-bg` (`#111827`), `--color-sidebar-text` (`#e5e7eb`)

## Tipografia

- Família: `Segoe UI, Roboto, Arial, sans-serif`
- Títulos: peso 700; cor `--color-text` ou `--color-primary-ink`
- Texto padrão: cor `--color-text`
- Texto auxiliar: cor `--color-muted`

## Espaçamentos

- Grid base: 4px
- Botões: padding inline 16–20px; radius 8px
- Cards: padding 18–30px; radius 10–12px

## Componentes

### Botões

- Classe base: `.btn`
- Variações: `.btn-primary`, `.btn-secondary`
- Recomendações: evitar inline styles; preferir classes globais

### Chips

- Classe: `.chip` e estado `.chip.active`
- Uso em filtros e seletores rápidos

### Cards

- Classe: `.card`
- Uso para agrupar conteúdo com borda e radius

### Toast

- Classe: `.toast`
- Posição: top-right
- Uso para feedback curto e não intrusivo

### Badge

- Classe: `.badge`
- Uso para estados e contadores pequenos

## Layout

- Header: fundo `--color-header-bg`; texto branco
- Sidebar: fundo `--color-sidebar-bg`; texto `--color-sidebar-text`
- Conteúdo: fundo `--color-bg`; superfícies `--color-surface`

### Grid utilitário

- `.grid-3`: 3 colunas iguais; quebra automático por linha
- Usar em grupos de ação (ex.: botões no editor)

## Convenções de Uso

- Usar variáveis CSS do `:root` definidas em `src/styles.scss`
- Evitar hex direto nos componentes; referenciar `var(--...)`
- Gradientes devem usar `--gradient-primary`
- Classes globais disponíveis em `src/styles.scss` (botões, chips, cards, toast, badge, grid)

## Acessibilidade

- Contraste mínimo AA para texto em superfícies claras
- Estados de foco visíveis em inputs e botões

## Responsividade

- Grid fluido e gaps consistentes (16–25px)
- Evitar scroll global; usar `overflow:auto` apenas em contêineres específicos

## Padrão: Editor de Planilha de Custo

- Header: usar `header-card` com fundo `--gradient-primary`, título forte e subtítulo.
- Info chips: agrupar metadados (processo, cliente, despachante) com classe `chip` em `info-chips`.
- Seções: cada bloco usa `card` e título com `section-title` e `section-number`.
- Formulário: usar `form-grid` com `grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))` e campos `field` + `input`.
- Tabela de despesas: conter com `table-wrapper`; usar `table` com cabeçalho leve e `category-badge` nas categorias.
- Resumo: `summary-card` com `summary-grid` e valores em `summary-value` (usar variações `.large` para destaque).
- Ações: alinhar à direita em `actions`; reutilizar `btn` e variantes do global.
- Cores: sempre via variáveis (`--color-bg`, `--color-surface`, `--color-text`, `--color-muted`, `--color-border`, `--color-primary`, `--gradient-primary`).
- Foco: inputs com realce de borda `--color-primary` e `box-shadow` suave; obedecer acessibilidade.
- Responsividade: evitar colunas fixas; preferir `auto-fit/minmax` nos grids.