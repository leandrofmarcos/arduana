import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImportadorService } from '../services/importador.service';
import { Importador } from '../models/importador.models';
import { CRUD_STYLES } from '../../../../shared/styles/crud-page.styles';
import { ToastService } from '../../../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-importadores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: CRUD_STYLES,
  template: `
    <div class="container-standard">

      <!-- Header -->
      <div class="dashboard-header">
        <div>
          <h1>📦 Importadores</h1>
          <p class="subtitle">Empresas importadoras vinculadas aos custos de despacho</p>
        </div>
        <button class="btn btn-primary" (click)="openForm()">+ Novo Importador</button>
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
                <td colspan="6" class="empty-state">Nenhum importador cadastrado</td>
              </tr>
              <tr *ngFor="let i of filtered">
                <td><strong>{{ i.razaoSocial }}</strong></td>
                <td><code>{{ i.cnpj || '—' }}</code></td>
                <td>{{ i.email || '—' }}</td>
                <td>{{ i.telefone || '—' }}</td>
                <td>
                  <span [class]="i.ativo ? 'badge-active' : 'badge-inactive'">
                    {{ i.ativo ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>
                <td>
                  <div class="row-actions">
                    <button class="btn-icon" title="Editar" (click)="openForm(i)">✏️</button>
                    <button class="btn-icon danger" title="Excluir" (click)="remove(i.id)">🗑️</button>
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
          <h2>{{ editing ? 'Editar Importador' : 'Novo Importador' }}</h2>
          <p>{{ editing ? 'Atualize as informações do importador' : 'Preencha os dados do novo importador' }}</p>
        </div>
        <div class="card">
          <div class="form-grid">
            <div class="field w2">
              <label>Razão Social <span class="required">*</span></label>
              <input type="text" [(ngModel)]="form.razaoSocial" placeholder="Ex: Importadora ABC Ltda"
                     [class.err]="showErrors && !form.razaoSocial.trim()" />
              <span class="err-msg" *ngIf="showErrors && !form.razaoSocial.trim()">Razão social é obrigatória</span>
            </div>
            <div class="field">
              <label>CNPJ</label>
              <input type="text" [(ngModel)]="form.cnpj" placeholder="00.000.000/0001-00" />
            </div>
            <div class="field w2">
              <label>E-mail</label>
              <input type="email" [(ngModel)]="form.email" placeholder="financeiro@importadora.com.br" />
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
export class ImportadoresComponent implements OnInit {
  items: Importador[] = [];
  q = '';
  showForm = false;
  showErrors = false;
  editing: Importador | null = null;

  form = { razaoSocial: '', cnpj: '', email: '', telefone: '', ativo: true };

  constructor(
    private service: ImportadorService,
    private toast: ToastService,
    private confirmDialog: ConfirmDialogService
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void { this.items = this.service.getAll(); }

  get filtered(): Importador[] {
    if (!this.q) return this.items;
    const s = this.q.toLowerCase();
    return this.items.filter(i =>
      i.razaoSocial.toLowerCase().includes(s) ||
      (i.cnpj ?? '').toLowerCase().includes(s) ||
      (i.email ?? '').toLowerCase().includes(s)
    );
  }

  openForm(item?: Importador): void {
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

    const data: Omit<Importador, 'id'> = {
      razaoSocial: this.form.razaoSocial.trim(),
      cnpj: this.form.cnpj.trim(),
      email: this.form.email.trim(),
      telefone: this.form.telefone.trim(),
      ativo: this.form.ativo
    };

    if (this.editing) {
      this.service.update({ ...this.editing, ...data });
      this.toast.success('Importador atualizado com sucesso.');
    } else {
      this.service.create(data);
      this.toast.success('Importador criado com sucesso.');
    }
    this.cancel();
    this.load();
  }

  async remove(id: string): Promise<void> {
    const ok = await this.confirmDialog.confirm({
      title: 'Excluir importador',
      message: 'Deseja excluir este importador?',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      danger: true
    });
    if (!ok) return;

    this.service.remove(id);
    this.load();
    this.toast.success('Importador removido com sucesso.');
  }
}
