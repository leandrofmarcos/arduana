import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExportadorService } from '../services/exportador.service';
import { Exportador } from '../models/exportador.models';
import { CRUD_STYLES } from '../../../../shared/styles/crud-page.styles';
import { ToastService } from '../../../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../../../core/services/confirm-dialog.service';
import { ApiErrorMapper } from '../../../../../core/api/error-handler/api-error.mapper';

@Component({
  selector: 'app-exportadores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: CRUD_STYLES,
  template: `
    <div class="container-standard">

      <div class="dashboard-header">
        <div>
          <h1>🚀 Exportadores</h1>
          <p class="subtitle">Empresas exportadoras / fornecedores externos vinculados aos embarques</p>
        </div>
        <button class="btn btn-primary" (click)="openForm()">+ Novo Exportador</button>
      </div>

      <!-- List -->
      <ng-container *ngIf="!showForm">
        <div class="content-section">
          <div class="toolbar">
            <input class="search" type="text" [(ngModel)]="q" placeholder="🔎 Buscar por nome, país ou cidade" />
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Documento</th>
                <th>País</th>
                <th>Cidade</th>
                <th>Status</th>
                <th style="width:100px">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="filtered.length === 0">
                <td colspan="6" class="empty-state">Nenhum exportador cadastrado</td>
              </tr>
              <tr *ngFor="let e of filtered">
                <td><strong>{{ e.nome }}</strong></td>
                <td><code>{{ e.documento || '—' }}</code></td>
                <td>{{ e.pais || '—' }}</td>
                <td>{{ e.cidade || '—' }}</td>
                <td>
                  <span [class]="e.ativo ? 'badge-active' : 'badge-inactive'">
                    {{ e.ativo ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>
                <td>
                  <div class="row-actions">
                    <button class="btn-icon" title="Editar" (click)="openForm(e)">✏️</button>
                    <button class="btn-icon danger" title="Excluir" (click)="remove(e.id)">🗑️</button>
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
          <h2>{{ editing ? 'Editar Exportador' : 'Novo Exportador' }}</h2>
          <p>{{ editing ? 'Atualize os dados do exportador' : 'Preencha os dados do novo exportador' }}</p>
        </div>
        <div class="card">
          <div class="form-grid">
            <div class="field w2">
              <label>Nome <span class="required">*</span></label>
              <input type="text" [(ngModel)]="form.nome" placeholder="Ex: Zhongshan Manufacturing Co."
                     [class.err]="showErrors && (!form.nome.trim() || hasApiFieldError('nome'))" />
              <span class="err-msg" *ngIf="showErrors && !form.nome.trim()">Nome é obrigatório</span>
              <span class="err-msg" *ngIf="showErrors && hasApiFieldError('nome')">{{ firstApiFieldError('nome') }}</span>
            </div>
            <div class="field">
              <label>Documento (CNPJ / Tax ID)</label>
              <input type="text" [(ngModel)]="form.documento" placeholder="Ex: 91234567890" />
            </div>
            <div class="field w2">
              <label>País</label>
              <input type="text" [(ngModel)]="form.pais" placeholder="Ex: China" />
            </div>
            <div class="field">
              <label>Cidade</label>
              <input type="text" [(ngModel)]="form.cidade" placeholder="Ex: Guangzhou" />
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
export class ExportadoresComponent implements OnInit {
  items: Exportador[] = [];
  q = '';
  showForm = false;
  showErrors = false;
  apiFieldErrors: Record<string, string[]> = {};
  editing: Exportador | null = null;

  form = { nome: '', documento: '', pais: '', cidade: '', ativo: true };

  constructor(
    private service: ExportadorService,
    private toast: ToastService,
    private confirmDialog: ConfirmDialogService
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void { this.items = this.service.getAll(); }

  get filtered(): Exportador[] {
    if (!this.q) return this.items;
    const s = this.q.toLowerCase();
    return this.items.filter(e =>
      e.nome.toLowerCase().includes(s) ||
      (e.pais ?? '').toLowerCase().includes(s) ||
      (e.cidade ?? '').toLowerCase().includes(s)
    );
  }

  openForm(item?: Exportador): void {
    this.editing = item ?? null;
    this.showErrors = false;
    this.apiFieldErrors = {};
    this.form = item
      ? { nome: item.nome, documento: item.documento, pais: item.pais, cidade: item.cidade, ativo: item.ativo }
      : { nome: '', documento: '', pais: '', cidade: '', ativo: true };
    this.showForm = true;
  }

  cancel(): void { this.showForm = false; this.editing = null; this.apiFieldErrors = {}; }

  save(): void {
    this.showErrors = true;
    this.apiFieldErrors = {};
    if (!this.form.nome.trim()) return;
    const data: Omit<Exportador, 'id'> = { ...this.form, nome: this.form.nome.trim() };
    try {
      if (this.editing) {
        this.service.update({ ...this.editing, ...data });
        this.toast.success('Exportador atualizado com sucesso.');
      } else {
        this.service.create(data);
        this.toast.success('Exportador criado com sucesso.');
      }
      this.cancel();
      this.load();
    } catch (err: any) {
      this.apiFieldErrors = this.collectFieldErrors(err);
      if (!Object.keys(this.apiFieldErrors).length) {
        this.toast.error(err?.message ?? 'Erro ao salvar exportador.');
      }
    }
  }

  hasApiFieldError(...keys: string[]): boolean {
    const normalized = keys.map(k => k?.toLowerCase?.()).filter(Boolean) as string[];
    return normalized.some(k => !!this.apiFieldErrors[k]?.length);
  }

  firstApiFieldError(...keys: string[]): string {
    const normalized = keys.map(k => k?.toLowerCase?.()).filter(Boolean) as string[];
    for (const k of normalized) { const f = this.apiFieldErrors[k]?.[0]; if (f) return f; }
    return '';
  }

  private collectFieldErrors(err: any): Record<string, string[]> {
    return ApiErrorMapper.mapError(err).fieldErrors;
  }

  async remove(id: string): Promise<void> {
    const ok = await this.confirmDialog.confirm({
      title: 'Excluir exportador',
      message: 'Deseja excluir este exportador?',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      danger: true
    });
    if (!ok) return;

    this.service.remove(id);
    this.load();
    this.toast.success('Exportador removido com sucesso.');
  }
}
