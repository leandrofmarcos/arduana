import type { Meta, StoryObj } from '@storybook/angular';
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { applicationConfig } from '@storybook/angular';
import { provideRouter } from '@angular/router';

@Component({
  selector: 'app-modal-alert-demo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-demo">
      <div class="modal-backdrop" [style.display]="'flex'">
        <div class="modal">
          <div class="modal-header">
            {{ icon }} {{ title }}
          </div>
          <div class="modal-body">
            {{ message }}
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary" (click)="onCancel()">Cancelar</button>
            <button class="btn btn-primary" (click)="onConfirm()">Confirmar</button>
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
      min-height: 300px;
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
      max-width: 400px;
      width: 100%;
      overflow: hidden;
    }
    .modal-header {
      background: #f5f5f5;
      padding: 16px;
      font-size: 16px;
      font-weight: 600;
      color: #333;
      border-bottom: 1px solid #eee;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .modal-body {
      padding: 20px;
      font-size: 14px;
      color: #555;
      line-height: 1.5;
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
class ModalAlertDemoComponent {
  @Input() icon = '⚠️';
  @Input() title = 'Confirmar exclusão';
  @Input() message = 'Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.';

  onCancel() {}
  onConfirm() {}
}

const meta: Meta<ModalAlertDemoComponent> = {
  title: 'Components/Modal Alert',
  component: ModalAlertDemoComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [provideRouter([])],
    }),
  ],
};

export default meta;
type Story = StoryObj<ModalAlertDemoComponent>;

export const ConfirmDelete: Story = {
  args: {
    icon: '⚠️',
    title: 'Confirmar exclusão',
    message: 'Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.',
  }
};

export const SuccessAlert: Story = {
  args: {
    icon: '✅',
    title: 'Sucesso',
    message: 'Operação realizada com sucesso!',
  }
};

export const ErrorAlert: Story = {
  args: {
    icon: '❌',
    title: 'Erro',
    message: 'Ocorreu um erro ao processar sua solicitação. Tente novamente.',
  }
};

export const InfoAlert: Story = {
  args: {
    icon: 'ℹ️',
    title: 'Informação',
    message: 'Este é um alerta informativo para o usuário.',
  }
};
