# ♿ Acessibilidade - Import Costs

## 🎯 Padrões de Acessibilidade Implementados

Este documento descreve os padrões de acessibilidade seguidos em todos os componentes do catálogo Storybook.

## 📋 Checklist de Acessibilidade por Componente

### Estrutura HTML
- [ ] Usar elementos semânticos (button, a, form, etc.)
- [ ] Ordem de heading correta (h1, h2, h3...)
- [ ] Elementos de formulário têm labels associados
- [ ] Links e botões têm texto descritivo

### ARIA (Accessible Rich Internet Applications)
- [ ] `aria-label` para elementos sem texto visível
- [ ] `aria-labelledby` quando apropriado
- [ ] `aria-describedby` para descrições
- [ ] `aria-hidden="true"` para conteúdo decorativo
- [ ] `role` atributos quando necessário
- [ ] `aria-live="polite"` para conteúdo dinâmico
- [ ] `aria-expanded` para componentes expansíveis
- [ ] `aria-disabled` para estados de desabilitação

### Navegação por Teclado
- [ ] Tab order lógico (0 ou positivo)
- [ ] Escape para fechar modais
- [ ] Enter para confirmar ações
- [ ] Seta para navegar em menus
- [ ] Home/End para início/fim de lista

### Cores e Contraste
- [ ] Razão de contraste mínima 4.5:1 para texto normal
- [ ] Razão de contraste mínima 3:1 para texto grande
- [ ] Não usar apenas cor para transmitir informação
- [ ] Usar padrões, ícones ou texto adicional

### Responsividade
- [ ] Texto redimensionável até 200%
- [ ] Conteúdo não se perde em zoom
- [ ] Viewport meta tag configurado
- [ ] Touch targets mínimo 44x44 pixels

## 🎨 Implementação por Componente

### PageHeader
```typescript
// ✅ Implementado
<div class="dashboard-header" role="banner">
  <h1>{{ icon }} {{ title }}</h1>
  <p class="subtitle" *ngIf="subtitle">{{ subtitle }}</p>
  <ng-content></ng-content>
</div>

// O que testamos:
// - Estrutura de heading apropriada
// - Semântica do role="banner"
// - Descrição no subtitle
// - Navegação por teclado
```

### ResumoFinanceiro
```typescript
// ✅ Implementado
<div class="card summary-finance" role="region" aria-label="Resumo Financeiro">
  <h3 class="section-title">Resumo Financeiro</h3>
  <div class="stack">
    <div class="block">
      <div class="label" id="cif-usd-label">CIF (USD)</div>
      <div class="value usd" aria-labelledby="cif-usd-label">
        {{ cifUsd | currency:'USD' }}
      </div>
    </div>
    <!-- ... outros blocos ... -->
  </div>
</div>

// O que testamos:
// - role="region" para identificar área significativa
// - Labels associados com aria-labelledby
// - Formatação de moeda clara para leitores de tela
// - Contraste de cores WCAG AA
```

### TemplatesPacklistDetail
```typescript
// ✅ Implementado
<div class="modal-overlay" role="presentation">
  <div class="modal-content" role="dialog" aria-labelledby="modal-title">
    <div class="modal-header">
      <h2 id="modal-title">Mapear Packlist</h2>
      <button 
        class="close-btn" 
        (click)="onCancel()"
        aria-label="Fechar diálogo"
      >✕</button>
    </div>
    
    <form (ngSubmit)="save()" aria-label="Formulário de template">
      <div class="form-group">
        <label for="template-name">Nome do Template</label>
        <input 
          id="template-name"
          [(ngModel)]="form.nome"
          required
          aria-required="true"
          aria-invalid="false"
        />
      </div>
    </form>
  </div>
</div>

// O que testamos:
// - role="dialog" para modais
// - aria-labelledby para título
// - Labels associados com for/id
// - aria-required e aria-invalid
// - Escape para fechar modal
```

## 🔍 Ferramentas de Teste

### Testar Acessibilidade
```bash
# No Storybook, instalar addon de acessibilidade
npm install --save-dev @storybook/addon-a11y

# Executar testes automáticos
npm run test:a11y

# Verificar com axe DevTools
# Chrome: https://chrome.google.com/webstore/detail/axe-devtools/lhdoppojpmngadmnkpklempisson
```

### Navegação apenas por Teclado
1. Desabilitar mouse
2. Usar Tab para navegar
3. Usar Enter/Escape para interagir
4. Verificar se tudo é acessível

### Leitura por Leitor de Tela
1. Instalar NVDA (Windows) ou VoiceOver (Mac)
2. Navegar pela página
3. Verificar se descrições fazem sentido

## 📐 Proporções de Contraste Recomendadas

### Texto Normal
- **AAA**: 7:1 (excelente)
- **AA**: 4.5:1 (bom)
- **A**: 3:1 (mínimo)

### Texto Grande (18pt+ ou 14pt+ bold)
- **AAA**: 4.5:1
- **AA**: 3:1
- **A**: 2.5:1

### Elementos Gráficos
- **AA/AAA**: 3:1

## 🎯 Cores Seguras para Daltonismo

### Paleta Recomendada
```css
/* Não usar apenas estas cores para transmitir informação */
--safe-blue: #0173B2       /* Azul seguro */
--safe-red: #DE8F05        /* Vermelho seguro */
--safe-green: #CC78BC      /* Verde seguro */
--safe-yellow: #CA9161     /* Amarelo seguro */

/* Combinar com padrões, ícones ou texto */
```

## ♿ Tamanhos Mínimos de Touch

- **Botões**: 44x44px (ideal)
- **Links**: 44x44px (ideal)
- **Inputs**: 44px de altura (ideal)
- **Spacing**: 8px entre elementos interativos

## 🧪 Testes Manuais de Acessibilidade

### Teste 1: Navegação por Teclado
```
1. Abrir página do componente
2. Pressionar Tab para navegar
3. Verificar se ordem é lógica
4. Verificar se foco é visível
5. Testar Enter, Escape, Setas
```

### Teste 2: Leitor de Tela
```
1. Iniciar leitor de tela
2. Navegar com Home/End/Setas
3. Verificar descrições fazem sentido
4. Testar formulários
5. Testar navegação
```

### Teste 3: Zoom
```
1. Zoom até 200%
2. Verificar se texto é legível
3. Verificar se layout não quebra
4. Verificar se controles funcionam
```

### Teste 4: Daltonismo
```
1. Usar Stark plugin ou similar
2. Visualizar em diferentes tipos de daltonismo
3. Verificar se cores transmitem info
4. Adicionar padrões/ícones se necessário
```

## 📚 Recursos

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM](https://webaim.org/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [Angular a11y](https://angular.io/guide/accessibility)

## ✅ Checklist de Desenvolvimento

Ao criar novo componente:

- [ ] Usar elementos semânticos HTML
- [ ] Adicionar labels em formulários
- [ ] Testar com teclado
- [ ] Testar com leitor de tela
- [ ] Verificar contraste de cores
- [ ] Testar zoom até 200%
- [ ] Adicionar aria-labels quando necessário
- [ ] Testar em mobile (touch)
- [ ] Documentar no Storybook
- [ ] Adicionar testes a11y

## 🔗 Links Úteis

- [Accessibility Insights](https://accessibilityinsights.io/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [Axe DevTools](https://www.deque.com/axe/devtools/)
- [Chrome Lighthouse](https://developers.google.com/web/tools/lighthouse)

---

**Mantido por**: Equipe Import Costs  
**Última atualização**: Fevereiro 2026  
**Conformidade**: WCAG 2.1 AA
