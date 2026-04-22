import type { Meta, StoryObj } from '@storybook/angular';
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { applicationConfig } from '@storybook/angular';
import { provideRouter } from '@angular/router';

@Component({
  selector: 'app-grid-demo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid-demo">
      <table class="data-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Cliente</th>
            <th>Status</th>
            <th>Valor</th>
            <th style="width:140px">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let item of items" class="row-clickable">
            <td>{{ item.data | date:'short' }}</td>
            <td>{{ item.cliente }}</td>
            <td><span [ngClass]="'status-' + item.status.toLowerCase()">{{ item.status }}</span></td>
            <td>R$ {{ item.valor | number:'1.2-2' }}</td>
            <td>
              <div class="row-actions">
                <button class="btn-icon info" title="Ver">👁️</button>
                <button class="btn-icon" title="Editar">✏️</button>
                <button class="btn-icon danger" title="Deletar">🗑️</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .grid-demo {
      background: white;
      padding: 16px;
      border-radius: 8px;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
      font-size: 14px;
    }
    .data-table thead {
      background: #f5f5f5;
      border-bottom: 2px solid #ddd;
    }
    .data-table th {
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #333;
    }
    .data-table td {
      padding: 12px;
      border-bottom: 1px solid #eee;
    }
    .data-table tbody tr:hover {
      background: #f9f9f9;
    }
    .row-actions {
      display: flex;
      gap: 8px;
    }
    .btn-icon {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 18px;
      padding: 4px 8px;
      border-radius: 4px;
      transition: background 0.2s;
    }
    .btn-icon:hover {
      background: #e8e8e8;
    }
    .btn-icon.info { color: #0066cc; }
    .btn-icon.danger { color: #cc0000; }
    .status-pendente { background: #fff3cd; color: #856404; padding: 4px 8px; border-radius: 4px; font-weight: 600; }
    .status-aprovado { background: #d4edda; color: #155724; padding: 4px 8px; border-radius: 4px; font-weight: 600; }
    .status-rejeitado { background: #f8d7da; color: #721c24; padding: 4px 8px; border-radius: 4px; font-weight: 600; }
  `]
})
class GridDemoComponent {
  @Input() items: any[] = [];
}

const meta: Meta<GridDemoComponent> = {
  title: 'Components/Grid',
  component: GridDemoComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [provideRouter([])],
    }),
  ],
};

export default meta;
type Story = StoryObj<GridDemoComponent>;

export const DataTable: Story = {
  args: {
    items: [
      { data: new Date('2024-01-15'), cliente: 'Empresa A', status: 'Aprovado', valor: 1500.50 },
      { data: new Date('2024-01-14'), cliente: 'Empresa B', status: 'Pendente', valor: 2300.00 },
      { data: new Date('2024-01-13'), cliente: 'Empresa C', status: 'Rejeitado', valor: 890.25 },
    ]
  }
};

export const EmptyGrid: Story = {
  args: {
    items: []
  }
};
