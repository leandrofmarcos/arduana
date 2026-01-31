# Quick Reference - Design System

## 🚀 Construir Nova Tela em 5 Passos

### 1️⃣ Escolher Container
```typescript
<div class="container-standard">  // Use para a maioria das telas
</div>
```

### 2️⃣ Adicionar Header
```typescript
<div class="dashboard-header">
  <div>
    <h1>Título da Tela</h1>
    <p class="subtitle">Descrição</p>
  </div>
  <button class="btn btn-primary">Ação</button>
</div>
```

### 3️⃣ Adicionar KPIs (se necessário)
```typescript
<div class="kpis-grid">
  <div class="kpi-card">
    <div class="kpi-icon">📊</div>
    <div class="kpi-content">
      <div class="kpi-value">{{ valor }}</div>
      <div class="kpi-label">Métrica</div>
    </div>
  </div>
</div>
```

### 4️⃣ Adicionar Conteúdo
```typescript
<div class="content-section">
  <div class="section-header">
    <h2>Dados</h2>
  </div>
  
  <div class="table-wrapper">
    <table class="data-table">
      <!-- Tabela -->
    </table>
  </div>
</div>
```

### 5️⃣ Remover Inline Styles
```typescript
// ❌ ERRADO
styles: [`
  .meu-componente { padding: 20px; color: red; }
`]

// ✅ CORRETO
styles: [`
  /* Apenas estilos específicos, muito específicos */
`]
```

---

## 📦 Componentes Prontos

### Headers
```html
<!-- Dashboard/Page Header -->
<div class="dashboard-header">
  <div>
    <h1>Título</h1>
    <p class="subtitle">Subtítulo</p>
  </div>
  <button class="btn btn-primary">Ação</button>
</div>

<!-- Section Header -->
<div class="section-header">
  <h2>Seção</h2>
  <div class="filters">
    <select class="filter-select">
      <option>Opção</option>
    </select>
  </div>
</div>

<!-- Alert Header -->
<div class="section-header alert">
  <h2>Atenção</h2>
  <span class="badge-alert">5 itens</span>
</div>
```

### Grids
```html
<!-- KPI Grid -->
<div class="kpis-grid">
  <div class="kpi-card">
    <div class="kpi-icon">📊</div>
    <div class="kpi-content">
      <div class="kpi-value">{{ valor }}</div>
      <div class="kpi-label">Métrica</div>
    </div>
  </div>
</div>

<!-- Financial Grid -->
<div class="financial-grid">
  <div class="fin-card">
    <div class="fin-label">Total</div>
    <div class="fin-value">R$ 1.000</div>
    <div class="fin-sub">Descrição</div>
  </div>
  <div class="fin-card highlight">
    <div class="fin-label">Destacado</div>
    <div class="fin-value">R$ 2.000</div>
  </div>
</div>

<!-- Cards Grid -->
<div class="cards-grid">
  <div class="info-card">
    <strong>Título</strong>
    <p>Conteúdo</p>
  </div>
</div>
```

### Tabelas
```html
<div class="table-wrapper">
  <table class="data-table">
    <thead>
      <tr>
        <th>Coluna 1</th>
        <th>Coluna 2</th>
      </tr>
    </thead>
    <tbody>
      <tr class="clickable">
        <td>Dado 1</td>
        <td>Dado 2</td>
      </tr>
    </tbody>
  </table>
</div>
```

### Badges
```html
<!-- Status Badges -->
<span class="badge status-concluido">Concluído</span>
<span class="badge status-em-andamento">Em Andamento</span>
<span class="badge status-pendente">Pendente</span>

<!-- Alert Badge -->
<span class="badge-alert">5 alertas</span>

<!-- Muted Badge -->
<span class="badge-muted">Info</span>
```

### Botões
```html
<!-- Primary (Gradient) -->
<button class="btn btn-primary">Ação Principal</button>

<!-- Secondary -->
<button class="btn btn-secondary">Voltar</button>

<!-- Small -->
<button class="btn btn-small">Mini Ação</button>
```

---

## 🎨 Cores por Contexto

### Status de Processo
```
Pendente       → --color-warning    (#f59e0b) Amarelo
Em Andamento   → --color-info       (#3b82f6) Azul
Concluído      → --color-success    (#10b981) Verde
Erro           → --color-danger     (#ef4444) Vermelho
```

### Canais Aduaneiros
```
Verde   → --color-success    (#10b981)
Amarelo → --color-warning    (#f59e0b)
Vermelho→ --color-danger     (#ef4444)
Cinza   → --color-secondary  (#6b7280)
```

---

## 📏 Espaçamento

```scss
--spacing-xs:   4px
--spacing-sm:   8px     // Pequenas lacunas
--spacing-md:   12px    // Padding mobile
--spacing-lg:   16px    // Padding padrão
--spacing-xl:   24px    // Padding principal
--spacing-2xl:  32px    // Espaços grandes
```

**Regra:** Sempre usar variáveis, nunca hardcode valores!

---

## 🔍 Containers Resumido

| Container | Uso |
|-----------|-----|
| `container-standard` | **PADRÃO** - Maioria das telas |
| `container-wide` | Relatórios, análises extensas |
| `container-full` | Uso máximo de espaço |
| `container-compact` | Modais, detalhes |
| `container-base` | Casos especiais |

---

## ✅ Checklist Rápido

```
Nova Tela?

[ ] Usar container-standard
[ ] Adicionar dashboard-header
[ ] Remover TODOS os inline styles
[ ] Usar classes globais (.kpis-grid, .content-section, etc)
[ ] Nenhum hardcode de cores (usar variáveis CSS)
[ ] Nenhum hardcode de espaçamento (usar variáveis CSS)
[ ] Testar em 3 resoluções: 1920px, 1024px, 375px
```

---

## 🔗 Referências Completas

Para informações detalhadas:
- **DESIGN_SYSTEM.md** → Documentação técnica completa
- **CONTAINER_SYSTEM.md** → Detalhes de containers
- **IMPLEMENTATION_STATUS.md** → Status de implementação
- **styles.scss** → Código fonte dos estilos

---

## 📝 Exemplos Completos

### Exemplo 1: Dashboard Simples
```typescript
@Component({
  template: `
    <div class="container-standard">
      <div class="dashboard-header">
        <div>
          <h1>Meu Dashboard</h1>
          <p class="subtitle">Descrição</p>
        </div>
        <button class="btn btn-primary">Novo</button>
      </div>
      
      <div class="kpis-grid">
        <div class="kpi-card">
          <div class="kpi-icon">📊</div>
          <div class="kpi-content">
            <div class="kpi-value">42</div>
            <div class="kpi-label">Total</div>
          </div>
        </div>
      </div>
      
      <div class="content-section">
        <div class="section-header">
          <h2>Dados</h2>
        </div>
        <!-- Conteúdo -->
      </div>
    </div>
  `,
  styles: [`
    /* APENAS estilos muito específicos aqui */
  `]
})
```

### Exemplo 2: Com Filtros
```typescript
<div class="content-section">
  <div class="section-header">
    <h2>Listagem</h2>
    <div class="filters">
      <select [(ngModel)]="filtro" class="filter-select">
        <option value="">Todos</option>
        <option value="ativo">Ativos</option>
      </select>
    </div>
  </div>
  
  <!-- Tabela ou grid -->
</div>
```

### Exemplo 3: Com Dados Financeiros
```typescript
<div class="content-section">
  <div class="financial-grid">
    <div class="fin-card">
      <div class="fin-label">Receita</div>
      <div class="fin-value">R$ 10.000</div>
      <div class="fin-sub">Janeiro</div>
    </div>
    <div class="fin-card highlight">
      <div class="fin-label">Total</div>
      <div class="fin-value">R$ 50.000</div>
    </div>
  </div>
</div>
```

---

**Última Atualização:** Janeiro 2026  
**Versão:** 1.0.0
