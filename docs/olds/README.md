# 📚 Documentação - Design System e Padrões

## 📖 Índice de Documentos

### 🎨 Design System

1. **[DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)** ⭐ **PRINCIPAL**
   - Documentação técnica completa
   - Tokens (cores, espaçamento, sombras, radius)
   - Layout components (headers, sections, grids)
   - Tabelas e formulários
   - Badges e botões
   - Padrões de construção de novas telas
   - **Use este para:** Referência técnica completa, implementação de novos componentes

2. **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** ⚡ **RÁPIDO**
   - Guia de 5 passos para nova tela
   - Exemplos de código prontos para copiar/colar
   - Cores por contexto (status, canais)
   - Espaçamento rápido
   - Checklist de validação
   - **Use este para:** Desenvolvimento rápido, referência durante implementação

3. **[CONTAINER_SYSTEM.md](CONTAINER_SYSTEM.md)** 📦
   - Referência rápida dos 5 containers
   - Tabela de uso por tipo de tela
   - Responsividade automática
   - **Use este para:** Escolher o container certo, verificar responsividade

### 🚀 Implementação

4. **[IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md)** ✅
   - Status de telas implementadas
   - Lista de próximas telas a implementar
   - Estrutura padrão
   - Componentes CSS reutilizáveis
   - Checklist para novas telas
   - **Use este para:** Visão geral do progresso, planejamento de próximas tarefas

---

## 🎯 Como Usar Esta Documentação

### Cenário 1: Implementar Nova Tela
```
1. Abra QUICK_REFERENCE.md
2. Siga os "5 Passos"
3. Use exemplos de código
4. Se tiver dúvidas, consulte DESIGN_SYSTEM.md
```

### Cenário 2: Entender o Design System Completo
```
1. Comece por DESIGN_SYSTEM.md seção "Visão Geral"
2. Aprenda os tokens (cores, espaçamento)
3. Estude os layout components
4. Consulte exemplos em QUICK_REFERENCE.md
```

### Cenário 3: Escolher Container para Nova Tela
```
1. Abra CONTAINER_SYSTEM.md
2. Verifique a tabela de containers
3. Leia a descrição do recomendado
4. Implemente seguindo o padrão
```

### Cenário 4: Verificar Padrões Implementados
```
1. Abra IMPLEMENTATION_STATUS.md
2. Veja telas já implementadas
3. Use-as como referência
4. Consulte o código-fonte do componente
```

---

## 📋 Telas Implementadas

✅ **Aduana Dashboard** (`src/app/features/aduana/pages/aduana.component.ts`)
   - Container: `container-standard`
   - Componentes: KPI grid, Financial grid, Data table, Canals analysis, Ports grid

✅ **Dashboard Processos** (`src/app/features/dashboard/pages/dashboard.component.ts`)
   - Container: `container-standard`
   - Componentes: KPI grid, Financial grid, Data table, Aduana cards, Timeline

✅ **Orçamento Detail** (`src/app/features/orcamento/pages/orcamento-detail.component.ts`)
   - Container: `container-standard`
   - Componentes: Timeline visual, Phase cards, Quick info, History section

---

## 🚀 Próximas Telas (Priorizadas)

| Prioridade | Tela | Container |
|-----------|------|-----------|
| 🔴 Alta | Aliquotas | container-standard |
| 🔴 Alta | Clientes | container-standard |
| 🟡 Média | Portos | container-standard |
| 🟡 Média | Despachantes | container-standard |
| 🟢 Baixa | Relatórios | container-wide |

---

## 💡 Dicas Importantes

### Ao Implementar Nova Tela:
```
✅ SEMPRE use container-standard como padrão
✅ SEMPRE use classes globais (.kpis-grid, .content-section, etc)
✅ NUNCA hardcode cores - use variáveis CSS
✅ NUNCA hardcode espaçamento - use variáveis CSS
❌ NUNCA adicione inline styles longos no componente
❌ NUNCA replique estilos já existentes
```

### Estrutura Padrão:
```typescript
<div class="container-standard">
  <div class="dashboard-header">...</div>      // Header
  <div class="kpis-grid">...</div>             // Métricas (opcional)
  <div class="content-section">...</div>       // Conteúdo
  <div class="content-section">...</div>       // Mais conteúdo
</div>
```

### CSS do Componente:
```typescript
styles: [`
  /* APENAS estilos específicos desta tela */
  /* Evitar: padding, color (padrão), background */
  /* OK: transformações, animações específicas, layouts customizados */
`]
```

---

## 📞 Referência Rápida de Variáveis CSS

### Cores
```css
--color-primary:    #667eea    /* Azul - Ações principais */
--color-success:    #10b981    /* Verde - Concluído */
--color-warning:    #f59e0b    /* Amarelo - Pendente */
--color-danger:     #ef4444    /* Vermelho - Erro */
--color-info:       #3b82f6    /* Azul - Em andamento */
```

### Espaçamento
```css
--spacing-xs:   4px
--spacing-sm:   8px
--spacing-md:   12px      /* Mobile */
--spacing-lg:   16px      /* Padrão */
--spacing-xl:   24px      /* Principal */
--spacing-2xl:  32px      /* Grandes */
```

### Sombras
```css
--shadow-sm:  0 1px 2px rgba(0,0,0,0.05)
--shadow-md:  0 4px 6px rgba(0,0,0,0.07)
--shadow-lg:  0 10px 15px rgba(0,0,0,0.1)
```

---

## 🔧 Arquivos Técnicos

- `src/styles.scss` - Implementação global de todos os estilos
- `src/app/features/*/pages/*.component.ts` - Componentes de telas

---

## 📈 Benefícios do Design System

✅ **78% menos linhas de código por componente** (930 → 200 linhas)
✅ **Mudanças centralizadas** - Altere uma variável, afeta tudo
✅ **Consistência garantida** - Mesmo look & feel em todas as telas
✅ **Onboarding rápido** - Novos devs aprendem padrão rapidinho
✅ **Manutenção fácil** - Menos código para manter
✅ **Escalável** - Pronto para crescimento futuro

---

## 🎓 Leitura Recomendada

**Para Iniciantes:**
1. QUICK_REFERENCE.md
2. CONTAINER_SYSTEM.md
3. IMPLEMENTATION_STATUS.md

**Para Avançados:**
1. DESIGN_SYSTEM.md (seção completa)
2. Código-fonte em src/styles.scss
3. Componentes implementados

**Para Designers:**
1. DESIGN_SYSTEM.md (seção 3 - Token System)
2. QUICK_REFERENCE.md (seção cores)

---

**Versão:** 1.0.0  
**Última Atualização:** Janeiro 2026  
**Mantido por:** Equipe de Desenvolvimento  
**Status:** Ativo em Produção
