# 📚 Guia Storybook - Import Costs

## 🎯 Objetivo

Este catálogo Storybook foi criado para documentar e testar todos os componentes reutilizáveis da aplicação Import Costs, facilitando o desenvolvimento, manutenção e reutilização de componentes.

## 🚀 Como Executar

### Iniciar Storybook
```bash
cd import-costs
npm run storybook
```
Acesse: http://localhost:6006

### Build do Storybook
```bash
npm run build-storybook
```
Gera build estático em `storybook-static/`

## 📁 Estrutura de Pastas

```
import-costs/
├── .storybook/              # Configurações do Storybook
│   ├── main.ts             # Configuração principal
│   ├── preview.ts          # Configuração global de preview
│   └── tsconfig.json       # TypeScript config
├── src/
│   ├── app/                # Componentes da aplicação
│   │   ├── core/           # Componentes core/layout
│   │   └── features/       # Componentes de features
│   └── stories/            # Stories do Storybook
│       ├── core/           # Stories de componentes core
│       ├── features/       # Stories de features
│       └── Introduction.mdx # Documentação introdutória
```

## 📝 Como Criar uma Nova Story

### 1. Template Básico

```typescript
import type { Meta, StoryObj } from '@storybook/angular';
import { MeuComponente } from '../../app/.../meu-componente.component';

/**
 * # MeuComponente
 * 
 * Descrição detalhada do componente e seu propósito.
 * 
 * ## Inputs
 * - **prop1**: Descrição da propriedade
 * - **prop2**: Outra propriedade
 * 
 * ## Outputs
 * - **evento1**: Quando este evento é disparado
 * 
 * ## Acessibilidade
 * - ARIA labels utilizados
 * - Suporte a teclado
 * 
 * ## Casos de Uso
 * - Quando usar este componente
 * - Exemplos práticos
 */
const meta: Meta<MeuComponente> = {
  title: 'Categoria/SubCategoria/MeuComponente',
  component: MeuComponente,
  tags: ['autodocs'],
  argTypes: {
    prop1: {
      control: 'text',
      description: 'Descrição da propriedade',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: "''" }
      }
    }
  }
};

export default meta;
type Story = StoryObj<MeuComponente>;

// Estado Default
export const Default: Story = {
  args: {
    prop1: 'valor padrão'
  }
};

// Estado Loading
export const Loading: Story = {
  args: {
    isLoading: true
  }
};

// Estado Error
export const Error: Story = {
  args: {
    hasError: true,
    errorMessage: 'Erro ao carregar dados'
  }
};
```

### 2. Categorias Recomendadas

#### Core
- `Core/Layout/*` - Componentes de layout (Shell, PageHeader, etc.)
- `Core/Forms/*` - Componentes de formulário
- `Core/UI/*` - Componentes UI básicos

#### Features
- `Features/Packlist/*` - Componentes de packlist
- `Features/Orcamento/*` - Componentes de orçamento
- `Features/Aduana/*` - Componentes de aduana
- `Features/Templates/*` - Componentes de templates

## 🎨 Padrões de Documentação

### O Que Documentar

Cada story deve incluir:

#### 1. **Descrição Geral**
```typescript
/**
 * # NomeDoComponente
 * 
 * Descrição clara do propósito e funcionalidade do componente.
 */
```

#### 2. **Inputs e Outputs**
```typescript
/**
 * ## Inputs
 * - **@Input() title**: string - Título principal
 * - **@Input() subtitle**: string - Subtítulo opcional
 * 
 * ## Outputs
 * - **@Output() clicked**: EventEmitter<void> - Disparado ao clicar
 */
```

#### 3. **Estados Principais**
- **Default**: Estado padrão
- **Loading**: Carregando dados
- **Success**: Operação bem-sucedida
- **Error**: Estado de erro
- **Disabled**: Componente desabilitado
- **Empty**: Sem dados

#### 4. **Variações**
- **Tamanhos**: Small, Medium, Large
- **Tipos**: Primary, Secondary, Danger, Warning
- **Modos**: Edit, View, Create

#### 5. **Acessibilidade**
```typescript
/**
 * ## Acessibilidade
 * - Usa ARIA labels apropriados
 * - Navegação por teclado (Tab, Enter, Escape)
 * - Contraste de cores WCAG AA
 * - Compatível com leitores de tela
 */
```

#### 6. **Casos de Uso**
```typescript
/**
 * ## Casos de Uso
 * - Cabeçalho de páginas principais
 * - Seções de dashboard
 * - Páginas de listagem
 */
```

## 🔧 Controls (ArgTypes)

### Tipos de Controles

```typescript
argTypes: {
  // Texto
  texto: { control: 'text' },
  
  // Número
  numero: { control: 'number' },
  
  // Boolean
  flag: { control: 'boolean' },
  
  // Select
  tipo: { 
    control: 'select',
    options: ['primary', 'secondary', 'danger']
  },
  
  // Radio
  tamanho: {
    control: 'radio',
    options: ['small', 'medium', 'large']
  },
  
  // Cor
  cor: { control: 'color' },
  
  // Data
  data: { control: 'date' },
  
  // Range
  opacity: {
    control: { type: 'range', min: 0, max: 1, step: 0.1 }
  },
  
  // Objeto
  config: { control: 'object' },
  
  // Array
  items: { control: 'array' }
}
```

## 📊 Exemplos de Stories por Tipo

### Componente Simples (Presentation)

```typescript
// PageHeader.stories.ts
export const Default: Story = {
  args: {
    icon: '📊',
    title: 'Dashboard'
  }
};

export const WithSubtitle: Story = {
  args: {
    icon: '📦',
    title: 'Packlists',
    subtitle: 'Gerencie suas packlists'
  }
};
```

### Componente com Estados

```typescript
// Button.stories.ts
export const Primary: Story = {
  args: {
    label: 'Botão Primário',
    variant: 'primary'
  }
};

export const Loading: Story = {
  args: {
    label: 'Carregando...',
    isLoading: true
  }
};

export const Disabled: Story = {
  args: {
    label: 'Desabilitado',
    disabled: true
  }
};
```

### Componente com Dados Complexos

```typescript
// ResumoFinanceiro.stories.ts
export const WithCompleteData: Story = {
  args: {
    form: {
      fobUsd: 50000,
      freteUsd: 3000,
      taxaUsd: 5.20
    },
    despesas: [
      { id: '1', descricao: 'ICMS', valor: 12000 }
    ]
  }
};
```

## 🎯 Boas Práticas

### ✅ Fazer

1. **Documentar todos os inputs/outputs**
2. **Criar stories para todos os estados**
3. **Incluir exemplos de dados reais**
4. **Documentar acessibilidade**
5. **Usar nomes descritivos para stories**
6. **Agrupar stories relacionadas**
7. **Testar responsividade**

### ❌ Evitar

1. **Stories sem documentação**
2. **Dados mock irreais ou vazios**
3. **Omitir estados de erro/loading**
4. **Ignorar acessibilidade**
5. **Stories muito complexas**
6. **Falta de variações**

## 📋 Checklist para Nova Story

- [ ] Componente criado em `src/app/`
- [ ] Story criada em `src/stories/`
- [ ] Documentação JSDoc completa
- [ ] Descrição de inputs/outputs
- [ ] Estado Default
- [ ] Estado Loading (se aplicável)
- [ ] Estado Error (se aplicável)
- [ ] Estado Empty (se aplicável)
- [ ] Variações de tamanho/tipo
- [ ] Documentação de acessibilidade
- [ ] Casos de uso documentados
- [ ] ArgTypes configurados
- [ ] Testado no Storybook

## 🎨 Design System

### Cores (Variáveis CSS)

```css
--color-primary: #667eea
--color-secondary: #764ba2
--color-danger: #ef4444
--color-success: #10b981
--color-warning: #f59e0b
--color-muted: #9ca3af
```

### Espaçamento

- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px

### Typography

- **Heading 1**: 24px
- **Heading 2**: 20px
- **Heading 3**: 18px
- **Body**: 14px
- **Small**: 12px

## 🔍 Addons Disponíveis

- **Controls**: Editar props interativamente
- **Actions**: Ver eventos disparados
- **Docs**: Documentação automática
- **Viewport**: Testar responsividade
- **Backgrounds**: Testar em fundos diferentes

## 📚 Recursos

- [Documentação Storybook](https://storybook.js.org/)
- [Storybook for Angular](https://storybook.js.org/docs/angular/get-started/introduction)
- [Writing Stories](https://storybook.js.org/docs/angular/writing-stories/introduction)
- [ArgTypes](https://storybook.js.org/docs/angular/api/argtypes)

## 🤝 Contribuindo

1. Crie componentes seguindo os padrões
2. Documente completamente nas stories
3. Teste todos os estados
4. Garanta acessibilidade
5. Revise antes de commitar

---

**Mantido por**: Equipe Import Costs  
**Última atualização**: Fevereiro 2026
