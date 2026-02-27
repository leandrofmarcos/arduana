# Storybook Setup - Import Costs

## Overview
Storybook é um catálogo visual de componentes Angular para documentação e desenvolvimento isolado.

## Directories

- **`.storybook/`** - Configuração central do Storybook
  - `main.ts` - Entrada principal, aponta para histórias em `storybook-stories/`
  - `preview.ts` - Configuração global (controles, parâmetros)
  - `tsconfig.json` - TypeScript config para Storybook

- **`storybook-stories/`** - Histórias de componentes (fora de `src/` para evitar compilação Angular)
  - `PageHeader.stories.ts` - Documentação do componente PageHeader com 4 variantes

## Running Storybook

```bash
cd import-costs
npm run storybook
```

Acessa em: **http://localhost:6006**

## Adding New Stories

1. Criar arquivo `.stories.ts` em `storybook-stories/`
2. Importar componente e decorator `applicationConfig`
3. Definir histórias com `args` e `decorators`

Exemplo:
```typescript
import type { Meta, StoryObj } from '@storybook/angular';
import { MyComponent } from '../src/app/path/my.component';
import { applicationConfig } from '@storybook/angular';
import { provideRouter } from '@angular/router';

const meta: Meta<MyComponent> = {
  title: 'Category/MyComponent',
  component: MyComponent,
  decorators: [
    applicationConfig({
      providers: [provideRouter([])],
    }),
  ],
};

export default meta;
type Story = StoryObj<MyComponent>;

export const Default: Story = {
  args: { prop: 'value' },
};
```

## Configuration Files

- `.storybook/main.ts` - Aponta para `../storybook-stories/**/*.stories.ts`
- `.storybook/tsconfig.json` - Inclui apenas `storybook-stories/`
- `package.json` - Script `npm run storybook`

## Notes

- **Histórias em `storybook-stories/`** não `src/stories` para evitar conflitos com compilação Angular
- Componentes standalone precisam de `applicationConfig` com providers
- HMR (Hot Module Reload) ativado por padrão
