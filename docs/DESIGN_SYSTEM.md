# Design System - Documentação Técnica

## Informações do Projeto

- **Versão:** 2.0.0
- **Última Atualização:** Janeiro 2026
- **Framework:** Angular 17+ (Standalone Components)
- **Linguagem de Estilo:** SCSS + Inline Styles
- **Status:** Consolidado

---

## 1. Visão Geral

Este documento consolida todos os padrões visuais, componentes e guidelines técnicas da aplicação de gestão de importação. Serve como referência única para desenvolvimento e manutenção de interfaces.

### Princípios do Design System

✅ **Consistência Visual** - Todos os componentes seguem o mesmo padrão visual  
✅ **Componentização** - Uso de componentes reutilizáveis (PageHeaderComponent)  
✅ **Tokens CSS** - Variáveis CSS para cores, espaçamentos e tipografia  
✅ **Responsividade** - Layout adaptável a diferentes resoluções  
✅ **Acessibilidade** - Contraste adequado e elementos semânticos

---

## 2. Tokens CSS (Design Tokens)

### 2.1 Paleta de Cores

```scss
/* Cores Principais */
--color-primary:           #667eea    /* Azul principal - botões, links, destaques */
--color-primary-light:     #e0e7ff    /* Azul claro - backgrounds hover */
--color-secondary:         #374151    /* Cinza escuro - textos secundários */

/* Cores de Texto */
--color-text:              #1a1a1a    /* Texto principal (preto suave) */
--color-text-secondary:    #374151    /* Texto secundário */
--color-text-muted:        #6b7280    /* Texto desabilitado/placeholder */

/* Cores de Status */
--color-success:           #10b981    /* Verde - sucesso, confirmações */
--color-success-light:     #d1fae5    /* Verde claro - backgrounds */
--color-warning:           #f59e0b    /* Amarelo - avisos */
--color-warning-light:     #fef3c7    /* Amarelo claro */
--color-danger:            #ef4444    /* Vermelho - erros, exclusões */
--color-danger-light:      #fee2e2    /* Vermelho claro */
--color-info:              #3b82f6    /* Azul info - informações */
--color-info-light:        #dbeafe    /* Azul claro */

/* Cores de Interface */
--color-surface:           #ffffff    /* Branco - cards, modais, superfícies */
--color-bg:                #f5f7fa    /* Cinza claro - fundo da página */
--color-subtle-bg:         #f7fafc    /* Cinza muito claro - backgrounds sutis */
--color-border:            #e5e7eb    /* Cinza médio - bordas padrão */
--color-border-light:      #f3f4f6    /* Cinza claro - bordas sutis */
--color-muted:             #9ca3af    /* Cinza médio - elementos inativos */

/* Cores de Navegação */
--color-header-bg:         #1f2937    /* Cinza escuro - header superior */
--color-sidebar-bg:        #111827    /* Preto suave - sidebar lateral */
--color-sidebar-text:      #e5e7eb    /* Branco suave - texto sidebar */

/* Gradientes */
--gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### 2.2 Espaçamento (Sistema de 4px)

```scss
--spacing-xs:    4px      /* Micro - padding interno de badges */
--spacing-sm:    8px      /* Pequeno - gaps entre ícone e texto */
--spacing-md:    16px     /* Médio - padding de cards */
--spacing-lg:    24px     /* Grande - margem entre seções */
--spacing-xl:    32px     /* Extra grande - espaçamento de containers */
--spacing-2xl:   48px     /* Muito grande - margens principais */
```

### 2.3 Tipografia

```scss
--font-family:        'Segoe UI', system-ui, sans-serif;

/* Tamanhos */
--font-xs:     11px    /* Badges, labels pequenos */
--font-sm:     12px    /* Textos auxiliares */
--font-base:   14px    /* Texto padrão */
--font-lg:     16px    /* Textos de destaque */
--font-xl:     18px    /* Subtítulos */
--font-2xl:    24px    /* Títulos secundários */
--font-3xl:    28px    /* Títulos principais */

/* Pesos */
--font-normal:    400
--font-medium:    500
--font-semibold:  600
--font-bold:      700
```

### 2.4 Sombras (Elevação)

```scss
--shadow-sm:   0 1px 2px 0 rgba(0, 0, 0, 0.05);     /* Elevação sutil */
--shadow-md:   0 4px 6px -1px rgba(0, 0, 0, 0.1);   /* Elevação média - cards */
--shadow-lg:   0 10px 15px -3px rgba(0, 0, 0, 0.1); /* Elevação alta - modais */
--shadow-xl:   0 20px 25px -5px rgba(0, 0, 0, 0.1); /* Elevação muito alta */
```

### 2.5 Border Radius (Arredondamento)

```scss
--radius-sm:     6px      /* Badges, inputs pequenos */
--radius-md:     8px      /* Botões, cards padrão */
--radius-lg:     12px     /* Cards grandes, modais */
--radius-full:   9999px   /* Botões circulares, pills */
```

### 2.6 Transições

```scss
--transition-fast:   0.15s ease    /* Hover, micro-interações */
--transition-base:   0.3s ease     /* Animações padrão */
--transition-slow:   0.5s ease     /* Transições lentas */
```

---

## 3. Componentes Reutilizáveis

### 3.1 PageHeaderComponent

**Localização:** `src/app/core/layout/page-header.component.ts`

**Uso:** Header padronizado para todas as telas de CRUD e listagem.

**Props:**
- `icon` (string) - Emoji ou símbolo do ícone
- `title` (string) - Título principal (em negrito)
- `subtitle` (string) - Descrição/subtítulo

**Implementação:**

```typescript
import { PageHeaderComponent } from '@app/core/layout/page-header.component';

@Component({
  standalone: true,
  imports: [PageHeaderComponent],
  template: `
    <app-page-header
      icon="🚢"
      title="Portos"
      subtitle="Cadastro de portos de origem e destino">
      <button class="btn-primary">+ Novo Porto</button>
    </app-page-header>
  `
})
```

**Estrutura HTML:**

```html
<div class="page-header">
  <div class="page-header-content">
    <div class="page-header-icon">{{ icon }}</div>
    <div class="page-header-text">
      <h1 class="page-header-title">{{ title }}</h1>
      <p class="page-header-subtitle">{{ subtitle }}</p>
    </div>
  </div>
  <div class="page-header-actions">
    <ng-content></ng-content>
  </div>
</div>
```

**Estilos:**

```scss
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xl);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  margin-bottom: var(--spacing-xl);
}

.page-header-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.page-header-icon {
  font-size: 32px;
}

.page-header-text {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.page-header-title {
  margin: 0;
  font-size: var(--font-3xl);
  font-weight: var(--font-bold);
  color: var(--color-text);
}

.page-header-subtitle {
  margin: 0;
  font-size: var(--font-base);
  color: var(--color-text-muted);
}
```

---

## 4. Padrões de Layout

### 4.1 Data Table (Grid Padrão)

**Uso:** Listagem de dados em formato tabular com busca e ações.

**Estrutura HTML:**

```html
<!-- Toolbar com busca -->
<div class="search-toolbar">
  <div class="search-box">
    <span class="search-icon">🔎</span>
    <input 
      type="text" 
      placeholder="Buscar..."
      [(ngModel)]="termoBusca"
      class="search-input">
  </div>
</div>

<!-- Tabela de dados -->
<div class="table-wrapper">
  <table class="data-table">
    <thead>
      <tr>
        <th>Coluna 1</th>
        <th>Coluna 2</th>
        <th style="width: 80px; text-align: right;">Ações</th>
      </tr>
    </thead>
    <tbody>
      <tr *ngFor="let item of filteredItems">
        <td>{{ item.campo1 }}</td>
        <td>{{ item.campo2 }}</td>
        <td class="text-right">
          <button class="btn-icon" (click)="editar(item)">✏️</button>
          <button class="btn-icon" (click)="excluir(item)">🗑️</button>
        </td>
      </tr>
      <tr *ngIf="filteredItems.length === 0">
        <td colspan="3" class="empty-state">
          Nenhum registro encontrado
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

**Estilos:**

```scss
/* Toolbar de busca */
.search-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  gap: var(--spacing-md);
}

.search-box {
  display: flex;
  align-items: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0 var(--spacing-md);
  flex: 1;
  max-width: 400px;
}

.search-icon {
  font-size: 16px;
  color: var(--color-muted);
  margin-right: var(--spacing-sm);
}

.search-input {
  border: none;
  outline: none;
  padding: var(--spacing-md) 0;
  font-size: var(--font-base);
  width: 100%;
  background: transparent;
}

/* Tabela de dados */
.table-wrapper {
  overflow-x: auto;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-sm);
  background: var(--color-surface);
}

.data-table thead {
  background: var(--color-subtle-bg);
  border-bottom: 2px solid var(--color-border);
}

.data-table th {
  padding: var(--spacing-md) var(--spacing-lg);
  text-align: left;
  font-weight: var(--font-semibold);
  color: var(--color-text-secondary);
  font-size: var(--font-sm);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.data-table td {
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-border-light);
  color: var(--color-text);
}

.data-table tbody tr:hover {
  background: var(--color-subtle-bg);
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

/* Ações na tabela */
.text-right {
  text-align: right;
}

.btn-icon {
  background: none;
  border: none;
  padding: var(--spacing-xs);
  cursor: pointer;
  font-size: 16px;
  opacity: 0.7;
  transition: opacity var(--transition-fast);
}

.btn-icon:hover {
  opacity: 1;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--color-text-muted);
  font-style: italic;
}
```

**Pipe de Filtro:**

```typescript
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'itemFilter', standalone: true })
export class ItemFilterPipe implements PipeTransform {
  transform(items: any[], termo: string): any[] {
    if (!termo) return items;
    
    const lower = termo.toLowerCase();
    return items.filter(item => 
      JSON.stringify(item).toLowerCase().includes(lower)
    );
  }
}
```

---

## 5. Modais (Popups)

### 5.1 Modal Backdrop Pattern

**Uso:** Formulários de criação/edição em popup sobreposto.

**Estrutura HTML:**

```html
<!-- Backdrop (overlay escuro) -->
<div class="modal-backdrop" *ngIf="showModal" (click)="fecharModal()">
  
  <!-- Container do modal -->
  <div class="modal" (click)="$event.stopPropagation()">
    
    <!-- Header com título e botão fechar -->
    <div class="modal-header">
      <h2 class="modal-title">Título do Modal</h2>
      <button class="btn-close" (click)="fecharModal()">✕</button>
    </div>
    
    <!-- Corpo do modal -->
    <div class="modal-body">
      <!-- Conteúdo do formulário -->
    </div>
    
    <!-- Footer com ações -->
    <div class="modal-footer">
      <div class="actions-uniform">
        <button class="btn-secondary" (click)="fecharModal()">
          Cancelar
        </button>
        <button class="btn-primary" (click)="salvar()">
          Salvar
        </button>
      </div>
    </div>
    
  </div>
</div>
```

**Estilos:**

```scss
/* Backdrop (overlay) */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-lg);
}

/* Container do modal */
.modal {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Modal extra large (para workflows) */
.modal-xl {
  max-width: 1200px;
}

/* Header do modal */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xl);
  border-bottom: 1px solid var(--color-border);
}

.modal-title {
  margin: 0;
  font-size: var(--font-2xl);
  font-weight: var(--font-bold);
  color: var(--color-text);
}

/* Botão fechar (X) */
.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--color-muted);
  cursor: pointer;
  padding: var(--spacing-xs);
  line-height: 1;
  transition: color var(--transition-fast);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  color: var(--color-text);
}

/* Corpo do modal */
.modal-body {
  padding: var(--spacing-xl);
  overflow-y: auto;
  flex: 1;
}

/* Footer do modal */
.modal-footer {
  padding: var(--spacing-xl);
  border-top: 1px solid var(--color-border);
  background: var(--color-subtle-bg);
}

/* Ações com distribuição uniforme */
.actions-uniform {
  display: flex;
  gap: var(--spacing-md);
}

.actions-uniform button {
  flex: 1;
}
```

**Variantes de Modal Header:**

```scss
/* Para modais aninhados (modal dentro de modal) */
.modal-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
}

.modal-header-flex h3 {
  margin: 0;
  font-size: var(--font-lg);
  font-weight: var(--font-semibold);
}

.modal-header-flex .btn-close {
  font-size: 20px;
  width: 28px;
  height: 28px;
}
```

---

## 6. Botões

### 6.1 Hierarquia de Botões

```scss
/* Botão primário - ação principal */
.btn-primary {
  background: var(--gradient-primary);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: var(--radius-md);
  font-size: var(--font-base);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all var(--transition-base);
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.2);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Botão secundário - ação alternativa/cancelar */
.btn-secondary {
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  padding: 12px 24px;
  border-radius: var(--radius-md);
  font-size: var(--font-base);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--color-subtle-bg);
  border-color: var(--color-primary);
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Botão de perigo - ações destrutivas */
.btn-danger {
  background: var(--color-danger);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: var(--radius-md);
  font-size: var(--font-base);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-danger:hover:not(:disabled) {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
}

/* Botão outline - ação terciária */
.btn-outline {
  background: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
  padding: 10px 22px;
  border-radius: var(--radius-md);
  font-size: var(--font-base);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-outline:hover:not(:disabled) {
  background: var(--color-primary);
  color: white;
}

/* Botão pequeno - ações em tabelas/cards */
.btn-small {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  font-size: var(--font-sm);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-small:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(102, 126, 234, 0.3);
}
```

### 6.2 Grupos de Botões

```scss
/* Grupo de ações (lado a lado) */
.button-group {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
}

/* Botões empilhados (mobile) */
@media (max-width: 768px) {
  .button-group {
    flex-direction: column;
  }
  
  .button-group button {
    width: 100%;
  }
}
```

---

## 7. Formulários

### 7.1 Form Grid Layout

**Uso:** Formulários organizados em grid responsivo.

```html
<div class="form-grid">
  <div class="form-field">
    <label class="form-label">Nome</label>
    <input type="text" class="form-input" [(ngModel)]="model.nome">
  </div>
  
  <div class="form-field">
    <label class="form-label">Código</label>
    <input type="text" class="form-input" [(ngModel)]="model.codigo">
  </div>
  
  <div class="form-field full-width">
    <label class="form-label">Observações</label>
    <textarea class="form-textarea" [(ngModel)]="model.obs"></textarea>
  </div>
</div>
```

**Estilos:**

```scss
/* Grid de formulário */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-lg);
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.form-field.full-width {
  grid-column: 1 / -1;
}

/* Labels */
.form-label {
  font-size: var(--font-sm);
  font-weight: var(--font-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Inputs */
.form-input,
.form-select,
.form-textarea {
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-base);
  font-family: var(--font-family);
  color: var(--color-text);
  background: var(--color-surface);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.form-input:disabled,
.form-select:disabled,
.form-textarea:disabled {
  background: var(--color-subtle-bg);
  color: var(--color-text-muted);
  cursor: not-allowed;
}

.form-textarea {
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
}

/* Responsivo */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
```

---

## 8. Cards e Containers

### 8.1 Card Padrão

```scss
.card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-border-light);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-lg);
  border-bottom: 2px solid var(--color-border-light);
}

.card-title {
  margin: 0;
  font-size: var(--font-xl);
  font-weight: var(--font-bold);
  color: var(--color-text);
}

.card-body {
  /* Conteúdo do card */
}

.card-footer {
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-border-light);
}
```

### 8.2 Section Container

```scss
.section {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
  box-shadow: var(--shadow-md);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.section-title {
  margin: 0;
  font-size: var(--font-xl);
  font-weight: var(--font-semibold);
  color: var(--color-text);
}
```

---

## 9. Badges e Indicators

### 9.1 Status Badges

```scss
.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: var(--radius-sm);
  font-size: var(--font-xs);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Status de processo */
.badge.pendente {
  background: var(--color-warning-light);
  color: #92400e;
}

.badge.em-andamento {
  background: var(--color-info-light);
  color: #1e40af;
}

.badge.concluido {
  background: var(--color-success-light);
  color: #065f46;
}

.badge.cancelado {
  background: var(--color-danger-light);
  color: #991b1b;
}

/* Badge simples/neutro */
.badge-muted {
  background: var(--color-border-light);
  color: var(--color-text-muted);
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  font-size: var(--font-xs);
}

/* Badge de alerta */
.badge-alert {
  background: var(--color-danger);
  color: white;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: var(--font-xs);
  font-weight: var(--font-bold);
}
```

### 9.2 Template Badge (Packlist)

```scss
.template-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--color-primary-light);
  color: var(--color-primary);
  padding: 6px 12px;
  border-radius: var(--radius-full);
  font-size: var(--font-sm);
  font-weight: var(--font-semibold);
}

.template-badge::before {
  content: '📋';
  font-size: 14px;
}
```

---

## 10. Utilities Classes

### 10.1 Spacing Utilities

```scss
/* Margins */
.mt-0 { margin-top: 0; }
.mt-sm { margin-top: var(--spacing-sm); }
.mt-md { margin-top: var(--spacing-md); }
.mt-lg { margin-top: var(--spacing-lg); }
.mt-xl { margin-top: var(--spacing-xl); }

.mb-0 { margin-bottom: 0; }
.mb-sm { margin-bottom: var(--spacing-sm); }
.mb-md { margin-bottom: var(--spacing-md); }
.mb-lg { margin-bottom: var(--spacing-lg); }
.mb-xl { margin-bottom: var(--spacing-xl); }

/* Paddings */
.p-0 { padding: 0; }
.p-sm { padding: var(--spacing-sm); }
.p-md { padding: var(--spacing-md); }
.p-lg { padding: var(--spacing-lg); }
.p-xl { padding: var(--spacing-xl); }
```

### 10.2 Text Utilities

```scss
/* Alinhamento */
.text-left { text-align: left; }
.text-center { text-align: center; }
.text-right { text-align: right; }

/* Peso */
.font-normal { font-weight: var(--font-normal); }
.font-medium { font-weight: var(--font-medium); }
.font-semibold { font-weight: var(--font-semibold); }
.font-bold { font-weight: var(--font-bold); }

/* Cores */
.text-muted { color: var(--color-text-muted); }
.text-primary { color: var(--color-primary); }
.text-success { color: var(--color-success); }
.text-danger { color: var(--color-danger); }
.text-warning { color: var(--color-warning); }

/* Transformações */
.uppercase { text-transform: uppercase; }
.lowercase { text-transform: lowercase; }
.capitalize { text-transform: capitalize; }
```

### 10.3 Display Utilities

```scss
.d-none { display: none; }
.d-block { display: block; }
.d-flex { display: flex; }
.d-grid { display: grid; }

/* Flex utilities */
.flex-row { flex-direction: row; }
.flex-column { flex-direction: column; }
.align-center { align-items: center; }
.align-start { align-items: flex-start; }
.align-end { align-items: flex-end; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.justify-end { justify-content: flex-end; }
.gap-sm { gap: var(--spacing-sm); }
.gap-md { gap: var(--spacing-md); }
.gap-lg { gap: var(--spacing-lg); }
```

---

## 11. Componentes Especializados

### 11.1 Accordion (Seções Expansíveis)

**Uso:** Organizar formulários complexos em seções colapsáveis.

```html
<div class="accordion">
  <div class="accordion-item" [class.active]="section1Open">
    <div class="accordion-header" (click)="section1Open = !section1Open">
      <h3>Seção 1</h3>
      <span class="accordion-icon">{{ section1Open ? '▼' : '▶' }}</span>
    </div>
    <div class="accordion-body" *ngIf="section1Open">
      <!-- Conteúdo da seção -->
    </div>
  </div>
</div>
```

**Estilos:**

```scss
.accordion {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.accordion-item {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.accordion-item.active {
  border-color: var(--color-primary);
}

.accordion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  cursor: pointer;
  background: var(--color-subtle-bg);
  transition: background var(--transition-fast);
}

.accordion-header:hover {
  background: var(--color-border-light);
}

.accordion-header h3 {
  margin: 0;
  font-size: var(--font-lg);
  font-weight: var(--font-semibold);
  color: var(--color-text);
}

.accordion-icon {
  color: var(--color-primary);
  font-size: var(--font-sm);
}

.accordion-body {
  padding: var(--spacing-lg);
}
```

### 11.2 Resumo Financeiro

**Uso:** Exibir resumo de valores em formato destacado.

```html
<div class="resumo-financeiro">
  <div class="resumo-item">
    <span class="resumo-label">Custo Total</span>
    <span class="resumo-value">R$ 150.000,00</span>
  </div>
  <div class="resumo-item highlight">
    <span class="resumo-label">Valor de Venda</span>
    <span class="resumo-value">R$ 180.000,00</span>
  </div>
  <div class="resumo-item success">
    <span class="resumo-label">Margem de Lucro</span>
    <span class="resumo-value">20%</span>
  </div>
</div>
```

**Estilos:**

```scss
.resumo-financeiro {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
  margin-top: var(--spacing-xl);
}

.resumo-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-lg);
  background: var(--color-subtle-bg);
  border-radius: var(--radius-md);
  border: 2px solid var(--color-border);
}

.resumo-item.highlight {
  background: var(--gradient-primary);
  border: none;
  color: white;
}

.resumo-item.success {
  background: var(--color-success-light);
  border-color: var(--color-success);
}

.resumo-label {
  font-size: var(--font-sm);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: var(--spacing-sm);
  color: var(--color-text-muted);
}

.resumo-item.highlight .resumo-label {
  color: rgba(255, 255, 255, 0.9);
}

.resumo-value {
  font-size: var(--font-2xl);
  font-weight: var(--font-bold);
  color: var(--color-primary);
}

.resumo-item.highlight .resumo-value {
  color: white;
}

.resumo-item.success .resumo-value {
  color: var(--color-success);
}
```

### 11.3 Timeline (Eventos)

**Uso:** Exibir linha do tempo de eventos (fase Aduana).

```html
<div class="timeline">
  <div class="timeline-item" *ngFor="let evento of eventos">
    <div class="timeline-marker"></div>
    <div class="timeline-content">
      <div class="timeline-header">
        <span class="timeline-date">{{ evento.data | date:'dd/MM/yyyy HH:mm' }}</span>
      </div>
      <div class="timeline-body">
        {{ evento.descricao }}
      </div>
    </div>
  </div>
</div>
```

**Estilos:**

```scss
.timeline {
  position: relative;
  padding-left: var(--spacing-xl);
}

.timeline::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--color-border);
}

.timeline-item {
  position: relative;
  padding-bottom: var(--spacing-lg);
}

.timeline-marker {
  position: absolute;
  left: -28px;
  top: 4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-primary);
  border: 3px solid var(--color-surface);
  box-shadow: 0 0 0 2px var(--color-border);
}

.timeline-content {
  background: var(--color-subtle-bg);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.timeline-date {
  font-size: var(--font-xs);
  color: var(--color-text-muted);
  font-weight: var(--font-semibold);
}

.timeline-body {
  font-size: var(--font-sm);
  color: var(--color-text);
}
```

---

## 12. Padrões de Interação

### 12.1 Abertura de Popup/Modal

**Padrão:**
1. Usuário clica em botão de ação (ex: "Novo Porto", "Editar")
2. Flag booleana `showModal` é setada para `true`
3. Modal aparece com backdrop
4. Clicar no backdrop, no X ou em "Cancelar" fecha o modal

**Implementação TypeScript:**

```typescript
export class ComponenteComponent {
  showModal = false;
  
  abrirModal(): void {
    this.showModal = true;
  }
  
  fecharModal(): void {
    this.showModal = false;
  }
  
  salvar(): void {
    // Lógica de salvamento
    this.fecharModal();
  }
}
```

### 12.2 Confirmação de Exclusão

**Padrão:** Sempre exigir confirmação antes de deletar.

```typescript
excluir(item: any): void {
  if (confirm(`Tem certeza que deseja excluir "${item.nome}"?`)) {
    this.service.delete(item.id).subscribe({
      next: () => {
        this.carregarDados();
        alert('Registro excluído com sucesso');
      },
      error: (err) => {
        console.error('Erro ao excluir:', err);
        alert('Erro ao excluir registro');
      }
    });
  }
}
```

### 12.3 Workflow de Fases (Orçamento)

**Padrão:** Fases abertas em popups modais sem navegação.

```typescript
export class OrcamentoDetailComponent {
  modo: 'overview' | 'packlist' | 'custo' | 'venda' | 'aduana' = 'overview';
  
  abrirFase(fase: string): void {
    this.modo = fase as any;
  }
  
  voltarOverview(): void {
    this.modo = 'overview';
    this.carregarOrcamento(); // Recarregar dados
  }
}
```

**Template:**

```html
<!-- Overview sempre visível -->
<div class="overview" *ngIf="modo === 'overview' || modo === 'packlist' || ...">
  <!-- Conteúdo overview -->
</div>

<!-- Popup Packlist -->
<div class="modal-backdrop" *ngIf="modo === 'packlist'">
  <div class="modal modal-xl" (click)="$event.stopPropagation()">
    <app-packlist-detalhe 
      [orcamentoId]="orcamentoId"
      (voltarClicked)="voltarOverview()">
    </app-packlist-detalhe>
  </div>
</div>
```

---

## 13. Responsividade

### 13.1 Breakpoints

```scss
/* Mobile First Approach */

/* Mobile (até 767px) - Padrão */
.container {
  padding: var(--spacing-md);
}

/* Tablet (768px - 1023px) */
@media (min-width: 768px) {
  .container {
    padding: var(--spacing-lg);
  }
  
  .form-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .container {
    padding: var(--spacing-xl);
  }
  
  .form-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Wide Desktop (1440px+) */
@media (min-width: 1440px) {
  .container {
    max-width: 1400px;
    margin: 0 auto;
  }
}
```

### 13.2 Elementos Responsivos

```scss
/* Tabelas em mobile - scroll horizontal */
@media (max-width: 768px) {
  .table-wrapper {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .data-table {
    min-width: 600px;
  }
}

/* Modais em mobile - tela cheia */
@media (max-width: 768px) {
  .modal {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
    margin: 0;
  }
  
  .modal-backdrop {
    padding: 0;
  }
}

/* Botões em mobile - largura total */
@media (max-width: 768px) {
  .button-group {
    flex-direction: column;
  }
  
  .button-group button {
    width: 100%;
  }
  
  .actions-uniform {
    flex-direction: column;
  }
}
```

---

## 14. Checklist de Implementação

### 14.1 Ao Criar Nova Tela

- [ ] Usar `PageHeaderComponent` com ícone, título e subtítulo
- [ ] Aplicar `.data-table` para listagens
- [ ] Adicionar `.search-toolbar` com input de busca 🔎
- [ ] Implementar pipe de filtro standalone
- [ ] Usar `.btn-icon` para ações na tabela (editar ✏️, deletar 🗑️)
- [ ] Alinhar ações à direita com `text-align: right`
- [ ] Adicionar estado vazio com `.empty-state`
- [ ] Validar responsividade em mobile

### 14.2 Ao Criar Modal

- [ ] Usar estrutura `.modal-backdrop` + `.modal`
- [ ] Adicionar `.modal-header` com título e `.btn-close` (✕)
- [ ] Implementar `.modal-body` com scroll se necessário
- [ ] Adicionar `.modal-footer` com `.actions-uniform`
- [ ] Usar `.modal-xl` para modais de workflow
- [ ] Implementar fechamento via backdrop, X e Cancelar
- [ ] Emitir evento `@Output()` para voltar ao pai
- [ ] Testar overflow e scroll em conteúdos longos

### 14.3 Ao Criar Formulário

- [ ] Usar `.form-grid` com 2 colunas
- [ ] Aplicar `.form-field` para cada campo
- [ ] Usar `.form-label` com uppercase
- [ ] Aplicar `.form-input`, `.form-select`, `.form-textarea`
- [ ] Adicionar estados de foco (`:focus`)
- [ ] Implementar validação visual
- [ ] Usar `.full-width` para campos longos
- [ ] Testar layout em mobile (1 coluna)

### 14.4 Ao Aplicar Botões

- [ ] Usar `.btn-primary` para ação principal
- [ ] Usar `.btn-secondary` para cancelar
- [ ] Usar `.btn-danger` para exclusões
- [ ] Aplicar `:disabled` quando necessário
- [ ] Distribuir uniformemente com `.actions-uniform`
- [ ] Usar `.btn-icon` para ações em tabelas
- [ ] Testar hover e estados

---

## 15. Padrões de Nomenclatura

### 15.1 Classes CSS

```
Componentes Globais:
- .page-header          (Header de página)
- .data-table           (Tabela de dados)
- .search-toolbar       (Barra de busca)
- .modal-backdrop       (Overlay de modal)
- .modal                (Container de modal)
- .form-grid            (Grid de formulário)
- .accordion            (Accordion/expansível)
- .timeline             (Linha do tempo)
- .resumo-financeiro    (Resumo de valores)

Estados:
- .active               (Elemento ativo)
- .disabled             (Elemento desabilitado)
- .highlight            (Elemento destacado)
- .success              (Estado de sucesso)
- .pending              (Estado pendente)

Utilitários:
- .text-*               (Alinhamento de texto)
- .font-*               (Peso de fonte)
- .mt-*, .mb-*          (Margens)
- .p-*                  (Paddings)
- .d-*                  (Display)
```

### 15.2 Variáveis TypeScript

```typescript
// Flags booleanas
showModal: boolean = false;
isLoading: boolean = false;
isFinalizado: boolean = false;

// Dados
items: Item[] = [];
filteredItems: Item[] = [];
selectedItem: Item | null = null;

// Formulário
formData: FormModel = {};
modo: 'criar' | 'editar' = 'criar';

// Busca
termoBusca: string = '';
```

---

## 16. Referência Rápida

### 16.1 Cores Mais Usadas

```
Primária:     #667eea  (Botões, links, destaques)
Sucesso:      #10b981  (Confirmações, status concluído)
Perigo:       #ef4444  (Erros, exclusões)
Aviso:        #f59e0b  (Alertas, pendências)
Texto:        #1a1a1a  (Texto principal)
Texto Muted:  #6b7280  (Texto secundário)
Borda:        #e5e7eb  (Bordas padrão)
Superfície:   #ffffff  (Background de cards/modais)
```

### 16.2 Espaçamentos Mais Usados

```
xs (4px):    Padding de badges
sm (8px):    Gap entre ícone e texto
md (16px):   Padding de cards, inputs
lg (24px):   Margem entre seções
xl (32px):   Padding de containers principais
```

### 16.3 Componentes por Caso de Uso

```
Listagem CRUD:        PageHeaderComponent + data-table + search-toolbar
Criação/Edição:       Modal com form-grid
Workflow Multi-fase:  Modal xl com accordion
Resumo Financeiro:    resumo-financeiro component
Histórico/Eventos:    timeline component
Status/Tags:          badge components
```

---

**Versão do Documento:** 2.0.0  
**Última Atualização:** Janeiro 2026  
**Tipo:** Documentação Técnica - Design System
--spacing-sm:   8px      /* Pequenos espaços */
--spacing-md:   12px     /* Espaço médio */
--spacing-lg:   16px     /* Espaço padrão */
--spacing-xl:   24px     /* Espaço grande */
--spacing-2xl:  32px     /* Espaço extra grande */
```

**Uso:** Padding, margin, gaps em grids e flexbox.

### 3.3 Sombras

```scss
--shadow-sm:  0 1px 2px rgba(0, 0, 0, 0.05);      /* Elevação leve */
--shadow-md:  0 4px 6px rgba(0, 0, 0, 0.07);      /* Elevação média */
--shadow-lg:  0 10px 15px rgba(0, 0, 0, 0.1);     /* Elevação forte */
```

### 3.4 Border Radius

```scss
--radius-sm:     6px      /* Bordas levemente arredondadas */
--radius-md:     8px      /* Bordas moderadamente arredondadas */
--radius-lg:     12px     /* Bordas bastante arredondadas */
--radius-full:   999px    /* Bordas completamente circulares */
```

### 3.5 Transições

```scss
--transition-fast:  0.15s ease    /* Animações rápidas */
--transition-base:  0.3s ease     /* Animações padrão */
```

---

## 4. Sistema de Containers

O sistema de containers fornece 5 opções para diferentes tipos de layout. Cada container gerencia largura máxima, padding e comportamento responsivo.

### 4.1 Container Types

| Container | Largura Máxima | Padding H | Padding V | Uso Recomendado |
|-----------|---|---|---|---|
| `container-full` | 100% | 16px | 24px | Dashboards analíticos que usam todo espaço |
| `container-wide` | 1600px | 24px | 24px | Análises e relatórios extensos |
| `container-standard` | 1400px | 16px | 24px | Conteúdo focado (Orçamentos, Processos) |
| `container-compact` | 1200px | 12px | 24px | Modais, páginas de detalhes |
| `container-base` | 100% | 16px | 24px | Layout flexível customizado |

### 4.2 Seleção de Container

**Decisão em árvore:**

```
Precisa de espaço máximo?
├─ SIM → container-full
└─ NÃO → 
    Conteúdo é focado?
    ├─ SIM → container-standard ou container-compact
    └─ NÃO → container-wide
```

### 4.3 Implementação

```typescript
// Exemplo: Dashboard de Importações
<div class="container-standard">
  <div class="dashboard-header">
    <h1>Título</h1>
    <p class="subtitle">Descrição</p>
  </div>
  
  <div class="kpis-grid">
    <!-- KPI cards -->
  </div>
  
  <div class="content-section">
    <!-- Conteúdo -->
  </div>
</div>
```

### 4.4 Responsividade

```scss
@media (max-width: 1024px) {
  .container-* {
    padding: var(--spacing-lg) var(--spacing-lg);
  }
}

@media (max-width: 768px) {
  .container-* {
    padding: var(--spacing-md) var(--spacing-md);
  }
}
```

---

## 5. Layout Components

Componentes reutilizáveis para construir layouts.

### 5.1 Dashboard Header

```scss
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--color-surface);
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-xl);
  box-shadow: var(--shadow-md);
}

.dashboard-header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text);
}

.subtitle {
  margin: 4px 0 0 0;
  color: var(--color-text-muted);
  font-size: 14px;
}
```

### 5.2 Content Section

```scss
.content-section {
  background: var(--color-surface);
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-xl);
  box-shadow: var(--shadow-md);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-lg);
  border-bottom: 2px solid var(--color-border-light);
}

.section-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
}

.section-header.alert {
  border-bottom-color: var(--color-danger);
}

.section-header.alert h2 {
  color: var(--color-danger);
}
```

---

## 6. Grid Systems

### 6.1 KPI Grid

Para exibir métricas principais.

```scss
.kpis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.kpi-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  background: var(--color-surface);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  border-left: 4px solid var(--color-primary);
}

.kpi-icon {
  font-size: 32px;
}

.kpi-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1;
}

.kpi-label {
  font-size: 12px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: var(--spacing-xs);
}
```

### 6.2 Financial Grid

Para dados financeiros em cards.

```scss
.financial-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--spacing-lg);
}

.fin-card {
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  background: var(--color-subtle-bg);
  border: 1px solid var(--color-border);
  text-align: center;
}

.fin-card.highlight {
  background: var(--gradient-primary);
  border: none;
  color: white;
}

.fin-label {
  font-size: 12px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-bottom: var(--spacing-md);
}

.fin-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: var(--spacing-md);
  line-height: 1;
}

.fin-card.highlight .fin-value {
  color: white;
}
```

### 6.3 Cards Grid

Para layouts de cards genéricos.

```scss
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--spacing-lg);
}

.info-card {
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  background: var(--color-subtle-bg);
  border: 1px solid var(--color-border);
}
```

---

## 7. Tabelas

### 7.1 Data Table

```scss
.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.data-table thead {
  background: var(--color-border-light);
}

.data-table th {
  padding: var(--spacing-md) var(--spacing-lg);
  text-align: left;
  font-weight: 600;
  color: var(--color-text-secondary);
  border-bottom: 2px solid var(--color-border);
}

.data-table td {
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
}

.data-table .clickable {
  cursor: pointer;
  transition: background var(--transition-fast);
}

.data-table .clickable:hover {
  background: var(--color-subtle-bg);
}
```

---

## 8. Badges e Status

### 8.1 Badges

```scss
.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.badge.status-concluido {
  background: var(--color-success-light);
  color: #065f46;
}

.badge.status-em-andamento {
  background: var(--color-info-light);
  color: #0c4a6e;
}

.badge.status-pendente {
  background: var(--color-warning-light);
  color: #92400e;
}

.badge-alert {
  background: var(--color-danger);
  color: white;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 600;
}

.badge-muted {
  display: inline-block;
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  background: var(--color-border-light);
  color: var(--color-text-muted);
}
```

---

## 9. Forms

### 9.1 Form Elements

```scss
.filter-select {
  padding: var(--spacing-md) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 14px;
  background: var(--color-surface);
  cursor: pointer;
  transition: border-color var(--transition-fast);
}

.filter-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}
```

---

## 10. Botões

### 10.1 Button Variants

```scss
.btn {
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-primary {
  background: var(--gradient-primary);
  color: white;
  padding: 12px 24px;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: var(--color-border-light);
  color: var(--color-text);
  padding: 12px 24px;
}

.btn-secondary:hover {
  background: var(--color-border);
}

.btn-small {
  background: var(--color-danger);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-small:hover {
  background: #dc2626;
  transform: translateY(-1px);
}
```

---

## 11. Utilities

### 11.1 Numeric & Currency

```scss
.numeric {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.currency {
  font-weight: 600;
  color: var(--color-primary);
}
```

### 11.2 Empty States

```scss
.empty-state {
  text-align: center;
  color: var(--color-text-muted);
  padding: var(--spacing-2xl);
}
```

---

## 12. Padrões de Construção de Novas Telas

### 12.1 Template Base

Para construir uma nova tela, siga este template:

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Item {
  id: string;
  // Propriedades
}

@Component({
  standalone: true,
  selector: 'app-nova-tela',
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container-standard">
      <!-- Header -->
      <div class="dashboard-header">
        <div>
          <h1>Título da Tela</h1>
          <p class="subtitle">Descrição da tela</p>
        </div>
        <button class="btn btn-primary">Ação Principal</button>
      </div>

      <!-- KPIs -->
      <div class="kpis-grid">
        <div class="kpi-card">
          <div class="kpi-icon">📊</div>
          <div class="kpi-content">
            <div class="kpi-value">{{ valor }}</div>
            <div class="kpi-label">Métrica</div>
          </div>
        </div>
      </div>

      <!-- Content Section -->
      <div class="content-section">
        <div class="section-header">
          <h2>Seção de Conteúdo</h2>
          <div class="filters">
            <select [(ngModel)]="filtro" class="filter-select">
              <option value="">Todos</option>
            </select>
          </div>
        </div>

        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Coluna 1</th>
                <th>Coluna 2</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of items" class="clickable">
                <td>{{ item.prop1 }}</td>
                <td>{{ item.prop2 }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Apenas estilos específicos do componente aqui */
    /* Evitar replicar o que existe globalmente */
  `]
})
export class NovaTelaComponent implements OnInit {
  items: Item[] = [];
  filtro = '';

  ngOnInit(): void {
    this.carregarDados();
  }

  private carregarDados(): void {
    // Lógica de carregamento
  }
}
```

### 12.2 Checklist para Nova Tela

- [ ] Usar um dos containers (`container-standard`, `container-wide`, etc)
- [ ] Incluir `dashboard-header` se tiver título e ações
- [ ] Usar `content-section` para seções de conteúdo
- [ ] Aplicar `kpis-grid` para métricas
- [ ] Usar `data-table` para tabelas
- [ ] Aplicar `badges` para status
- [ ] Remover todos os inline styles do componente
- [ ] Usar variáveis CSS para qualquer estilo necessário
- [ ] Testar responsividade em 3 breakpoints (1920px, 1024px, 375px)

### 12.3 Padrão de Nomeação

```
Classes Globais:
- .container-*        → Containers
- .dashboard-header   → Header de dashboards
- .content-section    → Seções de conteúdo
- .kpis-grid         → Grid de KPIs
- .data-table        → Tabelas
- .fin-card          → Cards financeiros
- .badge             → Badges de status
- .btn-*             → Botões
- .filter-select     → Selects de filtro

Classes de Componente:
- .detail-header     → Header específico de componente
- .timeline-item     → Timeline (componente específico)
- .phase-card        → Card de fase (componente específico)
```

---

## 13. Breakpoints Responsivos

```scss
/* Desktop (padrão) */
1920px - 1025px

/* Tablet */
@media (max-width: 1024px) {
  // Ajustes para tablet
}

/* Mobile */
@media (max-width: 768px) {
  // Ajustes para mobile
}
```

---

## 14. Cores por Funcionalidade

### 14.1 Status de Processo

```
Pendente:      --color-warning         (#f59e0b - Amarelo)
Em Andamento:  --color-info            (#3b82f6 - Azul)
Concluído:     --color-success         (#10b981 - Verde)
Erro:          --color-danger          (#ef4444 - Vermelho)
```

### 14.2 Canais Aduaneiros

```
Verde:   --color-success    (#10b981)
Amarelo: --color-warning    (#f59e0b)
Vermelho: --color-danger    (#ef4444)
Cinza:   --color-secondary  (#6b7280)
```

---

## 15. Componentes Já Implementados

| Componente | Container | Status |
|-----------|-----------|--------|
| Aduana Dashboard | container-standard | ✅ Implementado |
| Dashboard Processos | container-standard | ✅ Implementado |
| Orçamento Detail | container-standard | ✅ Implementado |

---

## 16. Próximas Implementações

| Tela | Container Recomendado | Prioridade |
|------|---------------------|-----------|
| Aliquotas | container-standard | Alta |
| Clientes | container-standard | Alta |
| Portos | container-standard | Média |
| Despachantes | container-standard | Média |
| Relatórios | container-wide | Baixa |

---

## 17. Referência Rápida de Variáveis CSS

```scss
/* Cores Principais */
primary: #667eea | secondary: #374151 | text: #1a1a1a
success: #10b981 | warning: #f59e0b | danger: #ef4444 | info: #3b82f6

/* Espaçamento */
xs: 4px | sm: 8px | md: 12px | lg: 16px | xl: 24px | 2xl: 32px

/* Sombras */
sm: 0 1px 2px rgba(0,0,0,0.05) | md: 0 4px 6px rgba(0,0,0,0.07) | lg: 0 10px 15px rgba(0,0,0,0.1)

/* Border Radius */
sm: 6px | md: 8px | lg: 12px | full: 999px

/* Transições */
fast: 0.15s ease | base: 0.3s ease
```

---

**Versão:** 1.0.0  
**Última Atualização:** Janeiro 2026  
**Mantido por:** Equipe de Desenvolvimento
