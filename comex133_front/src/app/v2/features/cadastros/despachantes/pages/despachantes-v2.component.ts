import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DespachanteV2Service } from '../services/despachante-v2.service';
import { DespachanteV2 } from '../models/despachante-v2.models';
import { CRUD_STYLES } from '../../../../shared/styles/crud-page.styles';
import { ToastService } from '../../../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../../../core/services/confirm-dialog.service';
import { ApiErrorMapper } from '../../../../../core/api/error-handler/api-error.mapper';

@Component({
  selector: 'app-despachantes-v2',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: CRUD_STYLES,
  template: `
    <div class="container-standard">

      <!-- Header -->
      <div class="dashboard-header">
        <div>
          <h1>🧭 Despachantes</h1>
          <p class="subtitle">Despachantes aduaneiros responsáveis pelos processos</p>
        </div>
        <button class="btn btn-primary" (click)="openForm()">+ Novo Despachante</button>
      </div>

      <!-- List -->
      <ng-container *ngIf="!showForm">
        <div class="content-section">
          <div class="toolbar">
            <input class="search" type="text" [(ngModel)]="q" placeholder="🔎 Buscar por nome ou CRN" />
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>CRN</th>
                <th>E-mail</th>
                <th>Telefone</th>
                <th>Status</th>
                <th style="width:100px">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="filtered.length === 0">
                <td colspan="6" class="empty-state">Nenhum despachante cadastrado</td>
              </tr>
              <tr *ngFor="let d of filtered">
                <td><strong>{{ d.nome }}</strong></td>
                <td><code>{{ d.crn || '—' }}</code></td>
                <td>{{ d.email || '—' }}</td>
                <td>{{ d.telefone || '—' }}</td>
                <td>
                  <span [class]="d.ativo ? 'badge-active' : 'badge-inactive'">
                    {{ d.ativo ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>
                <td>
                  <div class="row-actions">
                    <button class="btn-icon" title="Editar" (click)="openForm(d)">✏️</button>
                    <button class="btn-icon danger" title="Excluir" (click)="remove(d.id)">🗑️</button>
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
          <h2>{{ editing ? 'Editar Despachante' : 'Novo Despachante' }}</h2>
          <p>{{ editing ? 'Atualize as informações do despachante' : 'Preencha os dados do novo despachante' }}</p>
        </div>
        <div class="card">
          <div class="form-grid">
            <div class="field w2">
              <label>Nome <span class="required">*</span></label>
              <input type="text" [(ngModel)]="form.nome" placeholder="Ex: João Silva Despachos"
                     [class.err]="showErrors && (!form.nome.trim() || hasApiFieldError('nome', 'name'))" />
              <span class="err-msg" *ngIf="showErrors && !form.nome.trim()">Nome é obrigatório</span>
              <span class="err-msg" *ngIf="showErrors && hasApiFieldError('nome', 'name')">{{ firstApiFieldError('nome', 'name') }}</span>
            </div>
            <div class="field">
              <label>CRN (nº do registro)</label>
              <input type="text" [(ngModel)]="form.crn" placeholder="Ex: SP-123456" />
            </div>
            <div class="field w2">
              <label>E-mail</label>
              <input type="email" [(ngModel)]="form.email" placeholder="despachante@email.com" />
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
export class DespachantesV2Component implements OnInit {
  items: DespachanteV2[] = [];
  q = '';
  showForm = false;
  showErrors = false;
  editing: DespachanteV2 | null = null;
  apiFieldErrors: Record<string, string[]> = {};

  form = { nome: '', crn: '', email: '', telefone: '', ativo: true };

  constructor(
    private service: DespachanteV2Service,
    private toast: ToastService,
    private confirmDialog: ConfirmDialogService,) {}

  ngOnInit(): void { this.load(); }

  load(): void { this.items = this.service.getAll(); }

  get filtered(): DespachanteV2[] {
    if (!this.q) return this.items;
    const s = this.q.toLowerCase();
    return this.items.filter(d =>
      d.nome.toLowerCase().includes(s) ||
      (d.crn ?? '').toLowerCase().includes(s) ||
      (d.email ?? '').toLowerCase().includes(s)
    );
  }

  openForm(item?: DespachanteV2): void {
    this.editing = item ?? null;
    this.showErrors = false;
    this.apiFieldErrors = {};
    this.form = item
      ? { nome: item.nome, crn: item.crn, email: item.email, telefone: item.telefone, ativo: item.ativo }
      : { nome: '', crn: '', email: '', telefone: '', ativo: true };
    this.showForm = true;
  }

  cancel(): void {
    this.showForm = false;
    this.editing = null;
  }

  save(): void {
    this.showErrors = true;
    this.apiFieldErrors = {};
    if (!this.form.nome.trim()) return;

    const data: Omit<DespachanteV2, 'id'> = {
      nome: this.form.nome.trim(),
      crn: this.form.crn.trim(),
      email: this.form.email.trim(),
      telefone: this.form.telefone.trim(),
      ativo: this.form.ativo
    };

    try {
      if (this.editing) {
        this.service.update({ ...this.editing, ...data });
        this.toast.success('Despachante atualizado com sucesso.');
      } else {
        this.service.create(data);
        this.toast.success('Despachante criado com sucesso.');
      }
    } catch (err: any) {
      this.apiFieldErrors = this.collectFieldErrors(err);
      if (!Object.keys(this.apiFieldErrors).length) {
        this.toast.error(err?.message ?? 'Erro ao salvar despachante.');
      }
      return;
    }

    this.cancel();
    this.load();
  }

  async remove(id: string): Promise<void> {
    const ok = await this.confirmDialog.confirm({
      title: 'Excluir despachante',
      message: 'Deseja excluir este despachante?',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      danger: true
    });
    if (!ok) return;

    this.service.remove(id);
    this.load();
    this.toast.success('Despachante removido com sucesso.');
  }

  hasApiFieldError(...keys: string[]): boolean {
    const normalized = keys.map((key) => key?.toLowerCase?.()).filter(Boolean) as string[];
    return normalized.some((key) => !!this.apiFieldErrors[key]?.length);
  }

  firstApiFieldError(...keys: string[]): string {
    const normalized = keys.map((key) => key?.toLowerCase?.()).filter(Boolean) as string[];
    for (const key of normalized) {
      const first = this.apiFieldErrors[key]?.[0];
      if (first) return first;
    }
    return '';
  }

  private collectFieldErrors(err: any): Record<string, string[]> {
    return ApiErrorMapper.mapError(err).fieldErrors;
  }
}
