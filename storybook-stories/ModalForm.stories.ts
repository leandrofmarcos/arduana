import type { Meta, StoryObj } from '@storybook/angular';
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { applicationConfig } from '@storybook/angular';
import { provideRouter } from '@angular/router';

@Component({
  selector: 'app-modal-form-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-demo">
      <div class="modal-backdrop" [style.display]="'flex'">
        <div class="modal modal-form">
          <div class="modal-header-flex">
            <div>
              <h3>{{ title }}</h3>
              <p class="modal-subtitle">{{ subtitle }}</p>
            </div>
            <button class="btn-close">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-grid">
              <div class="field" style="grid-column: 1 / -1;">
                <label>Cliente *</label>
                <input type="text" placeholder="Selecione um cliente" [(ngModel)]="formData.cliente">
              </div>
              <div class="field">
                <label>Valor *</label>
                <input type="number" placeholder="0.00" [(ngModel)]="formData.valor">
              </div>
              <div class="field">
                <label>Data Vencimento</label>
                <input type="date" [(ngModel)]="formData.dataVencimento">
              </div>
              <div class="field" style="grid-column: 1 / -1;">
                <label>Descrição</label>
                <textarea placeholder="Descreva os detalhes" [(ngModel)]="formData.descricao" rows="4"></textarea>
              </div>
              <div class="field">
                <label>
                  <input type="checkbox" [(ngModel)]="formData.enviarEmail">
                  Enviar confirmação por email
                </label>
              </div>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary">Cancelar</button>
            <button class="btn btn-primary">{{ actionLabel }}</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-demo {
      background: rgba(0,0,0,0.05);
      padding: 20px;
      border-radius: 8px;
      min-height: 500px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
    }
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
    }
    .modal {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      max-width: 500px;
      width: 100%;
      overflow: hidden;
    }
    .modal-form {
      max-width: 600px;
    }
    .modal-header-flex {
      padding: 20px;
      background: #f5f5f5;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .modal-header-flex h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }
    .modal-subtitle {
      margin: 4px 0 0 0;
      font-size: 12px;
      color: #999;
    }
    .btn-close {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: #999;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: background 0.2s;
    }
    .btn-close:hover {
      background: rgba(0,0,0,0.1);
    }
    .modal-body {
      padding: 20px;
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .field {
      display: flex;
      flex-direction: column;
    }
    .field label {
      margin-bottom: 6px;
      font-weight: 600;
      font-size: 14px;
      color: #333;
    }
    .field input[type="text"],
    .field input[type="number"],
    .field input[type="date"],
    .field textarea,
    .field select {
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-family: inherit;
      font-size: 14px;
      transition: border-color 0.2s;
    }
    .field input:focus,
    .field textarea:focus,
    .field select:focus {
      outline: none;
      border-color: #0066cc;
      box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
    }
    .field input[type="checkbox"] {
      margin-right: 8px;
      cursor: pointer;
      width: fit-content;
    }
    .modal-actions {
      padding: 16px;
      background: #fafafa;
      border-top: 1px solid #eee;
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }
    .btn {
      padding: 10px 16px;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-primary {
      background: #0066cc;
      color: white;
    }
    .btn-primary:hover {
      background: #0052a3;
    }
    .btn-secondary {
      background: #e0e0e0;
      color: #333;
    }
    .btn-secondary:hover {
      background: #d0d0d0;
    }
  `]
})
class ModalFormDemoComponent {
  @Input() title = 'Novo Formulário';
  @Input() subtitle = '01/02/2026 14:30';
  @Input() actionLabel = 'Salvar';

  formData = {
    cliente: '',
    valor: '',
    dataVencimento: '',
    descricao: '',
    enviarEmail: false,
  };
}

const meta: Meta<ModalFormDemoComponent> = {
  title: 'Components/Modal Form',
  component: ModalFormDemoComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [provideRouter([])],
    }),
  ],
};

export default meta;
type Story = StoryObj<ModalFormDemoComponent>;

export const NovoOrcamento: Story = {
  args: {
    title: 'Criar Novo Orçamento',
    subtitle: '01/02/2026 14:30',
    actionLabel: 'Criar Orçamento',
  }
};

export const NovoCusto: Story = {
  args: {
    title: 'Adicionar Novo Custo',
    subtitle: '01/02/2026 14:30',
    actionLabel: 'Adicionar Custo',
  }
};

export const NovaVenda: Story = {
  args: {
    title: 'Registrar Nova Venda',
    subtitle: '01/02/2026 14:30',
    actionLabel: 'Registrar Venda',
  }
};

export const AdicionarDespesa: Story = {
  args: {
    title: 'Adicionar Despesa no Desembaraço',
    subtitle: 'Preencha os detalhes da despesa',
    actionLabel: 'Adicionar',
  }
};
