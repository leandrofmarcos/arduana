import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteV2Service } from '../services/cliente-v2.service';
import { ClienteV2 } from '../models/cliente-v2.models';
import { CRUD_STYLES } from '../../../../shared/styles/crud-page.styles';

@Component({
  selector: 'app-clientes-v2',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: CRUD_STYLES,
  template: `
    <div class="container-standard">

      <!-- Header -->
      <div class="dashboard-header">
        <div>
          <h1>👥 Clientes</h1>
          <p class="subtitle">Clientes para uso nos orçamentos de venda e embarques</p>
        </div>
        <button class="btn btn-primary" (click)="openForm()">+ Novo Cliente</button>
      </div>

      <!-- List -->
      <ng-container *ngIf="!showForm">
        <div class="content-section">
          <div class="toolbar">
            <input class="search" type="text" [(ngModel)]="q" placeholder="🔎 Buscar por razão social ou CNPJ" />
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Razão Social</th>
                <th>CNPJ</th>
                <th>E-mail</th>
                <th>Telefone</th>
                <th>Status</th>
                <th style="width:100px">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="filtered.length === 0">
                <td colspan="6" class="empty-state">Nenhum cliente cadastrado</td>
              </tr>
              <tr *ngFor="let c of filtered">
                <td><strong>{{ c.razaoSocial }}</strong></td>
                <td><code>{{ c.cnpj || '—' }}</code></td>
                <td>{{ c.email || '—' }}</td>
                <td>{{ c.telefone || '—' }}</td>
                <td>
                  <span [class]="c.ativo ? 'badge-active' : 'badge-inactive'">
                    {{ c.ativo ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>
                <td>
                  <div class="row-actions">
                    <button class="btn-icon" title="Editar" (click)="openForm(c)">✏️</button>
                    <button class="btn-icon danger" title="Excluir" (click)="remove(c.id)">🗑️</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </ng-container>

      <!-- Form -->
      <ng-container *ngIf="showForm">
        <div class="detail-header">
          <h2>{{ editing ? 'Editar Cliente' : 'Novo Cliente' }}</h2>
          <p>{{ editing ? 'Atualize as informações do cliente' : 'Preencha os dados do novo cliente' }}</p>
        </div>
        <div class="card">
          <div class="form-grid">
            <div class="field w2">
              <label>Razão Social <span class="required">*</span></label>
              <input type="text" [(ngModel)]="form.razaoSocial" placeholder="Ex: Importadora XYZ Ltda"
                     [class.err]="showErrors && !form.razaoSocial.trim()" />
              <span class="err-msg" *ngIf="showErrors && !form.razaoSocial.trim()">Razão social é obrigatória</span>
            </div>
            <div class="field">
              <label>CNPJ</label>
              <input type="text" [(ngModel)]="form.cnpj" placeholder="00.000.000/0001-00" />
            </div>
            <div class="field w2">
              <label>E-mail</label>
              <input type="email" [(ngModel)]="form.email" placeholder="contato@empresa.com.br" />
            </div>
            <div class="field">
              <label>Telefone</label>
              <input type="text" [(ngModel)]="form.telefone" placeholder="(11) 9 0000-0000" />
            </div>
            <div class="field">
              <label>Status</label>
              <select [(ngModel)]="form.ativo">
                <option [ngValue]="true">Ativo</option>
                <option [ngValue]="false">Inativo</option>
              </select>
            </div>
          </div>
          <div class="actions">
            <button class="btn btn-primary" (click)="save()">💾 Salvar</button>
            <button class="btn btn-secondary" (click)="cancel()">✖️ Cancelar</button>
          </div>
        </div>
      </ng-container>

    </div>
  `
})
export class ClientesV2Component implements OnInit {
  items: ClienteV2[] = [];
  q = '';
  showForm = false;
  showErrors = false;
  editing: ClienteV2 | null = null;

  form = { razaoSocial: '', cnpj: '', email: '', telefone: '', ativo: true };

  constructor(private service: ClienteV2Service) {}

  ngOnInit(): void { this.load(); }

  load(): void { this.items = this.service.getAll(); }

  get filtered(): ClienteV2[] {
    if (!this.q) return this.items;
    const s = this.q.toLowerCase();
    return this.items.filter(c =>
      c.razaoSocial.toLowerCase().includes(s) ||
      (c.cnpj ?? '').toLowerCase().includes(s) ||
      (c.email ?? '').toLowerCase().includes(s)
    );
  }

  openForm(item?: ClienteV2): void {
    this.editing = item ?? null;
    this.showErrors = false;
    this.form = item
      ? { razaoSocial: item.razaoSocial, cnpj: item.cnpj, email: item.email, telefone: item.telefone, ativo: item.ativo }
      : { razaoSocial: '', cnpj: '', email: '', telefone: '', ativo: true };
    this.showForm = true;
  }

  cancel(): void {
    this.showForm = false;
    this.editing = null;
  }

  save(): void {
    this.showErrors = true;
    if (!this.form.razaoSocial.trim()) return;

    const data: Omit<ClienteV2, 'id'> = {
      razaoSocial: this.form.razaoSocial.trim(),
      cnpj: this.form.cnpj.trim(),
      email: this.form.email.trim(),
      telefone: this.form.telefone.trim(),
      ativo: this.form.ativo
    };

    if (this.editing) {
      this.service.update({ ...this.editing, ...data });
    } else {
      this.service.create(data);
    }
    this.cancel();
    this.load();
  }

  remove(id: string): void {
    if (confirm('Deseja excluir este cliente?')) {
      this.service.remove(id);
      this.load();
    }
  }
}
