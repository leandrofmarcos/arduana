import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PortoDestinoService } from '../services/porto-destino.service';
import { PortoDestino } from '../models/porto-destino.models';
import { CRUD_STYLES } from '../../../../shared/styles/crud-page.styles';
import { PaginationComponent } from '../../../../../core/components/pagination/pagination.component';
import { PagedResult, PaginationParams } from '../../../../../core/api/models/api-response.model';
import { ToastService } from '../../../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../../../core/services/confirm-dialog.service';
import { ApiErrorMapper } from '../../../../../core/api/error-handler/api-error.mapper';

@Component({
  selector: 'app-portos-destino',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  styles: CRUD_STYLES,
  template: `
    <div class="container-standard">

      <!-- Header -->
      <div class="dashboard-header">
        <div>
          <h1>🏢 Portos de Destino</h1>
          <p class="subtitle">Portos de desembarque / destino final das mercadorias</p>
        </div>
        <button class="btn btn-primary" (click)="openForm()">+ Novo Porto</button>
      </div>

      <!-- List -->
      <ng-container *ngIf="!showForm">
        <div class="content-section">
          <div class="toolbar">
            <input class="search" type="text" [(ngModel)]="q" placeholder="🔎 Buscar por nome, código ou país" />
          </div>
          <div class="empty-state" *ngIf="loading">Carregando portos de destino...</div>

          <div class="empty-state" *ngIf="!loading && hasLoadError" style="color:#b91c1c">
            {{ loadErrorMessage }}
            <div style="margin-top:8px">
              <button class="btn btn-secondary" type="button" (click)="retryLoad()">Tentar novamente</button>
            </div>
          </div>

          <table class="data-table" *ngIf="!loading && !hasLoadError">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Código</th>
                <th>Estado</th>
                <th>País</th>
                <th>Status</th>
                <th style="width:100px">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="filtered.length === 0">
                <td colspan="6" class="empty-state">Nenhum porto de destino cadastrado</td>
              </tr>
              <tr *ngFor="let p of filtered">
                <td><strong>{{ p.nome }}</strong></td>
                <td><code>{{ p.codigo }}</code></td>
                <td>{{ p.estado || '—' }}</td>
                <td>{{ p.pais }}</td>
                <td>
                  <span [class]="p.ativo ? 'badge-active' : 'badge-inactive'">
                    {{ p.ativo ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>
                <td>
                  <div class="row-actions">
                    <button class="btn-icon" title="Editar" (click)="openForm(p)">✏️</button>
                    <button class="btn-icon danger" title="Excluir" (click)="remove(p.id)">🗑️</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <app-pagination
            *ngIf="pagedResult"
            [pagedResult]="pagedResult"
            (pageChanged)="onPageChange($event)"
          />
        </div>
      </ng-container>

      <!-- Form -->
      <ng-container *ngIf="showForm">
        <div class="detail-header">
          <h2>{{ editing ? 'Editar Porto de Destino' : 'Novo Porto de Destino' }}</h2>
          <p>{{ editing ? 'Atualize as informações do porto' : 'Preencha os dados do novo porto de destino' }}</p>
        </div>
        <div class="card">
          <div class="form-grid">
            <div class="field w2">
              <label>Nome do Porto <span class="required">*</span></label>
              <input type="text" [(ngModel)]="form.nome" placeholder="Ex: Porto de Santos"
                [class.err]="showErrors && (!form.nome.trim() || hasApiFieldError('nome', 'name'))" />
              <span class="err-msg" *ngIf="showErrors && !form.nome.trim()">Nome é obrigatório</span>
              <span class="err-msg" *ngIf="showErrors && hasApiFieldError('nome', 'name')">{{ firstApiFieldError('nome', 'name') }}</span>
            </div>
            <div class="field">
              <label>Código <span class="required">*</span></label>
              <input type="text" [(ngModel)]="form.codigo" placeholder="Ex: SSZ"
                [class.err]="showErrors && (!form.codigo.trim() || hasApiFieldError('codigo', 'code'))" />
              <span class="err-msg" *ngIf="showErrors && !form.codigo.trim()">Código é obrigatório</span>
              <span class="err-msg" *ngIf="showErrors && hasApiFieldError('codigo', 'code')">{{ firstApiFieldError('codigo', 'code') }}</span>
            </div>
            <div class="field w2">
              <label>País <span class="required">*</span></label>
              <input type="text" [(ngModel)]="form.pais" placeholder="Ex: Brasil"
                [class.err]="showErrors && (!form.pais.trim() || hasApiFieldError('pais', 'country'))" />
              <span class="err-msg" *ngIf="showErrors && !form.pais.trim()">País é obrigatório</span>
              <span class="err-msg" *ngIf="showErrors && hasApiFieldError('pais', 'country')">{{ firstApiFieldError('pais', 'country') }}</span>
            </div>
            <div class="field">
              <label>Estado / UF</label>
              <input type="text" [(ngModel)]="form.estado" placeholder="Ex: SP" />
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
export class PortosDestinoComponent implements OnInit {
  items: PortoDestino[] = [];
  pagedResult: PagedResult<PortoDestino> | null = null;
  q = '';
  loading = false;
  hasLoadError = false;
  loadErrorMessage = '';
  showForm = false;
  showErrors = false;
  editing: PortoDestino | null = null;
  apiFieldErrors: Record<string, string[]> = {};

  form = { nome: '', codigo: '', estado: '', pais: '', ativo: true };

  constructor(
    private service: PortoDestinoService,
    private toast: ToastService,
    private confirmDialog: ConfirmDialogService,) {}

  ngOnInit(): void { this.load(); }

  load(page = 1, pageSize = 20): void {
    this.loading = true;
    this.service.getPaged(page, pageSize).subscribe({
      next: result => {
        this.pagedResult = result;
        this.items = result.items;
        this.loading = false;
        this.hasLoadError = false;
        this.loadErrorMessage = '';
      },
      error: err => {
        this.loading = false;
        this.hasLoadError = true;
        this.loadErrorMessage = err?.message ?? 'Erro ao carregar portos de destino.';
        this.toast.error(this.loadErrorMessage);
      }
    });
  }

  retryLoad(): void {
    this.load(this.pagedResult?.page ?? 1, this.pagedResult?.pageSize ?? 20);
  }

  onPageChange(params: PaginationParams): void {
    this.load(params.page ?? 1, params.pageSize ?? 20);
  }

  get filtered(): PortoDestino[] {
    if (!this.q) return this.items;
    const s = this.q.toLowerCase();
    return this.items.filter(p =>
      p.nome.toLowerCase().includes(s) ||
      p.codigo.toLowerCase().includes(s) ||
      p.pais.toLowerCase().includes(s) ||
      (p.estado ?? '').toLowerCase().includes(s)
    );
  }

  openForm(item?: PortoDestino): void {
    this.editing = item ?? null;
    this.showErrors = false;
    this.apiFieldErrors = {};
    this.form = item
      ? { nome: item.nome, codigo: item.codigo, estado: item.estado ?? '', pais: item.pais, ativo: item.ativo }
      : { nome: '', codigo: '', estado: '', pais: '', ativo: true };
    this.showForm = true;
  }

  cancel(): void {
    this.showForm = false;
    this.editing = null;
    this.apiFieldErrors = {};
  }

  save(): void {
    this.showErrors = true;
    this.apiFieldErrors = {};
    if (!this.form.nome.trim() || !this.form.codigo.trim() || !this.form.pais.trim()) return;

    const data = {
      nome: this.form.nome.trim(),
      codigo: this.form.codigo.trim().toUpperCase(),
      estado: this.form.estado.trim() || undefined,
      pais: this.form.pais.trim(),
      ativo: this.form.ativo
    };

    if (this.editing) {
      this.service.update({ ...this.editing, ...data }).subscribe({
        next: () => {
          this.toast.success('Porto de destino atualizado com sucesso.');
          this.cancel();
          this.load(this.pagedResult?.page ?? 1, this.pagedResult?.pageSize ?? 20);
        },
        error: err => {
          this.apiFieldErrors = this.collectFieldErrors(err);
          if (!Object.keys(this.apiFieldErrors).length) {
            this.toast.error(err?.message ?? 'Erro ao atualizar porto de destino.');
          }
        }
      });
    } else {
      this.service.create(data).subscribe({
        next: () => {
          this.toast.success('Porto de destino criado com sucesso.');
          this.cancel();
          this.load(this.pagedResult?.page ?? 1, this.pagedResult?.pageSize ?? 20);
        },
        error: err => {
          this.apiFieldErrors = this.collectFieldErrors(err);
          if (!Object.keys(this.apiFieldErrors).length) {
            this.toast.error(err?.message ?? 'Erro ao criar porto de destino.');
          }
        }
      });
    }
  }

  async remove(id: string): Promise<void> {
    const ok = await this.confirmDialog.confirm({
      title: 'Excluir porto de destino',
      message: 'Deseja excluir este porto de destino?',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      danger: true
    });
    if (!ok) return;

    this.service.remove(id).subscribe({
      next: () => {
        this.toast.success('Porto de destino removido com sucesso.');
        this.load(this.pagedResult?.page ?? 1, this.pagedResult?.pageSize ?? 20);
      },
      error: err => this.toast.error(err?.message ?? 'Erro ao remover porto de destino.')
    });
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
