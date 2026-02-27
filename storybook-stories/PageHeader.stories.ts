import type { Meta, StoryObj } from '@storybook/angular';
import { PageHeaderComponent } from '../src/app/core/layout/page-header.component';
import { applicationConfig } from '@storybook/angular';
import { provideRouter } from '@angular/router';

const meta: Meta<PageHeaderComponent> = {
  title: 'Core/PageHeader',
  component: PageHeaderComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [provideRouter([])],
    }),
  ],
};

export default meta;
type Story = StoryObj<PageHeaderComponent>;

export const Default: Story = {
  args: {
    icon: '📊',
    title: 'Dashboard',
    subtitle: 'Bem-vindo ao Import Costs',
  },
};

export const WithoutSubtitle: Story = {
  args: {
    icon: '📦',
    title: 'Packlists',
    subtitle: '',
  },
};

export const Finance: Story = {
  args: {
    icon: '💰',
    title: 'Financeiro',
    subtitle: 'Controle de custos',
  },
};

export const Customs: Story = {
  args: {
    icon: '🛃',
    title: 'Aduanas',
    subtitle: 'Desembaraço aduaneiro',
  },
};
