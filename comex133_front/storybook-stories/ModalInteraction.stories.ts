import type { Meta, StoryObj } from '@storybook/angular';
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { applicationConfig } from '@storybook/angular';
import { provideRouter } from '@angular/router';

@Component({
  selector: 'app-modal-interaction-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-demo">
      <div class="modal-backdrop" [style.display]="'flex'">
        <div class="modal modal-lg">
          <div class="modal-header-flex">
            <div>
              <h3>{{ title }}</h3>
              <p class="modal-subtitle">{{ subtitle }}</p>
            </div>
            <button class="btn-close">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Cliente *</label>
              <input type="text" placeholder="Selecione um cliente" [(ngModel)]="formData.cliente">
            </div>
            <div class="form-group">
              <label>Observações</label>
              <textarea placeholder="Digite observações opcionais" [(ngModel)]="formData.observacoes" rows="4"></textarea>
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" [(ngModel)]="formData.aceitar">
                Aceito os termos
              </label>
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
      min-height: 400px;
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
    .modal-lg {
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
      color: rgba(255,255,255,0.7);
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
    .form-group {
      margin-bottom: 16px;
    }
    .form-group label {
      display: block;
      margin-bottom: 6px;
      font-weight: 600;
      font-size: 14px;
      color: #333;
    }
    .form-group input[type="text"],
    .form-group textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-family: inherit;
      font-size: 14px;
      transition: border-color 0.2s;
      box-sizing: border-box;
    }
    .form-group input[type="text"]:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #0066cc;
      box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
    }
    .form-group input[type="checkbox"] {
      margin-right: 8px;
      cursor: pointer;
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
class ModalInteractionDemoComponent {
  @Input() title = 'Novo Orçamento';
  @Input() subtitle = '01/02/2026 14:30';
  @Input() actionLabel = 'Criar';

  formData = {
    cliente: '',
    observacoes: '',
    aceitar: false,
  };
}

const meta: Meta<ModalInteractionDemoComponent> = {
  title: 'Components/Modal Interaction',
  component: ModalInteractionDemoComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [provideRouter([])],
    }),
  ],
};

export default meta;
type Story = StoryObj<ModalInteractionDemoComponent>;

export const NovoOrcamento: Story = {
  args: {
    title: 'Novo Orçamento',
    subtitle: '01/02/2026 14:30',
    actionLabel: 'Criar Orçamento',
  }
};

export const NovoCusto: Story = {
  args: {
    title: 'Novo Custo',
    subtitle: '01/02/2026 14:30',
    actionLabel: 'Adicionar Custo',
  }
};

export const SelectCliente: Story = {
  args: {
    title: 'Selecionar Cliente',
    subtitle: 'Escolha um cliente para continuar',
    actionLabel: 'Próximo',
  }
};
