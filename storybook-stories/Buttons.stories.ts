import type { Meta, StoryObj } from '@storybook/angular';
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { applicationConfig } from '@storybook/angular';
import { provideRouter } from '@angular/router';

@Component({
  selector: 'app-buttons-demo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="buttons-demo">
      <div class="button-group">
        <h4>Botões Primários</h4>
        <button class="btn btn-primary">Criar novo</button>
        <button class="btn btn-primary" disabled>Desabilitado</button>
      </div>

      <div class="button-group">
        <h4>Botões Secundários</h4>
        <button class="btn btn-secondary">Cancelar</button>
        <button class="btn btn-secondary" disabled>Desabilitado</button>
      </div>

      <div class="button-group">
        <h4>Botões de Ação</h4>
        <button class="btn btn-danger">Excluir</button>
        <button class="btn btn-success">Salvar</button>
        <button class="btn btn-warning">Atenção</button>
      </div>

      <div class="button-group">
        <h4>Botões Ícone</h4>
        <button class="btn-icon info">👁️</button>
        <button class="btn-icon">✏️</button>
        <button class="btn-icon danger">🗑️</button>
        <button class="btn-icon">⚙️</button>
      </div>

      <div class="button-group">
        <h4>Variações de Tamanho</h4>
        <button class="btn btn-primary btn-sm">Pequeno</button>
        <button class="btn btn-primary">Normal</button>
        <button class="btn btn-primary btn-lg">Grande</button>
      </div>
    </div>
  `,
  styles: [`
    .buttons-demo {
      background: white;
      padding: 24px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
    }
    .button-group {
      margin-bottom: 24px;
    }
    .button-group h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 600;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .button-group > button {
      margin-right: 8px;
      margin-bottom: 8px;
    }

    .btn {
      padding: 10px 16px;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      font-family: inherit;
    }

    .btn-primary {
      background: #0066cc;
      color: white;
    }
    .btn-primary:hover:not(:disabled) {
      background: #0052a3;
    }

    .btn-secondary {
      background: #e0e0e0;
      color: #333;
    }
    .btn-secondary:hover:not(:disabled) {
      background: #d0d0d0;
    }

    .btn-danger {
      background: #cc0000;
      color: white;
    }
    .btn-danger:hover:not(:disabled) {
      background: #990000;
    }

    .btn-success {
      background: #00b366;
      color: white;
    }
    .btn-success:hover:not(:disabled) {
      background: #008c4d;
    }

    .btn-warning {
      background: #ff9900;
      color: white;
    }
    .btn-warning:hover:not(:disabled) {
      background: #e68a00;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 12px;
    }

    .btn-lg {
      padding: 12px 20px;
      font-size: 16px;
    }

    .btn-icon {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 20px;
      padding: 8px 12px;
      border-radius: 4px;
      transition: background 0.2s;
    }
    .btn-icon:hover {
      background: #e8e8e8;
    }
    .btn-icon.info {
      color: #0066cc;
    }
    .btn-icon.danger {
      color: #cc0000;
    }
  `]
})
class ButtonsDemoComponent {}

const meta: Meta<ButtonsDemoComponent> = {
  title: 'Components/Buttons',
  component: ButtonsDemoComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [provideRouter([])],
    }),
  ],
};

export default meta;
type Story = StoryObj<ButtonsDemoComponent>;

export const AllButtons: Story = {};
