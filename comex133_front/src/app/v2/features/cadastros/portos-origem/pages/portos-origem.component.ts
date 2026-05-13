import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PortoOrigemService } from '../services/porto-origem.service';
import { PortoOrigem } from '../models/porto-origem.models';
import { CRUD_STYLES } from '../../../../shared/styles/crud-page.styles';
import { PaginationComponent } from '../../../../../core/components/pagination/pagination.component';
import { PagedResult, PaginationParams } from '../../../../../core/api/models/api-response.model';
import { ToastService } from '../../../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../../../core/services/confirm-dialog.service';
import { ApiErrorMapper } from '../../../../../core/api/error-handler/api-error.mapper';
import { SkeletonListComponent } from '../../../../../core/components/skeleton-list/skeleton-list.component';
import { LoadingButtonDirective } from '../../../../../core/directives/loading-button.directive';

@Component({
  selector: 'app-portos-origem',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, SkeletonListComponent, LoadingButtonDirective],
  styles: CRUD_STYLES,
  template: `
    <div class="container-standard">

      <!-- Header -->
      <div class="dashboard-header">
        <div>
          <h1>🌐 Portos de Origem</h1>
          <p class="subtitle">Portos de embarque das mercadorias importadas</p>
        </div>
        <button class="btn btn-primary" (click)="openForm()">+ Novo Porto</button>
      </div>

      <!-- List -->
      <ng-container *ngIf="!showForm">
        <div class="content-section">
          <div class="toolbar">
            <input class="search" type="text" [(ngModel)]="q" placeholder="🔎 Buscar por nome, código ou país" />
          </div>
          <app-skeleton-list *ngIf="loading" [rowCount]="5" [cols]="3"></app-skeleton-list>

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
                <th>País</th>
                <th>Status</th>
                <th style="width:100px">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="filtered.length === 0">
                <td colspan="5" class="empty-state">Nenhum porto de origem cadastrado</td>
              </tr>
              <tr *ngFor="let p of filtered">
                <td><strong>{{ p.nome }}</strong></td>
                <td><code>{{ p.codigo }}</code></td>
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
          <h2>{{ editing ? 'Editar Porto de Origem' : 'Novo Porto de Origem' }}</h2>
          <p>{{ editing ? 'Atualize as informações do porto' : 'Preencha os dados do novo porto de origem' }}</p>
        </div>
        <div class="card">
          <div class="form-grid">
            <div class="field w2">
              <label>Nome do Porto <span class="required">*</span></label>
              <input type="text" [(ngModel)]="form.nome" placeholder="Ex: Porto de Shangai"
                [class.err]="showErrors && (!form.nome.trim() || hasApiFieldError('nome', 'name'))" />
              <span class="err-msg" *ngIf="showErrors && !form.nome.trim()">Nome é obrigatório</span>
              <span class="err-msg" *ngIf="showErrors && hasApiFieldError('nome', 'name')">{{ firstApiFieldError('nome', 'name') }}</span>
            </div>
            <div class="field">
              <label>Código <span class="required">*</span></label>
              <input type="text" [(ngModel)]="form.codigo" placeholder="Ex: SHA"
                [class.err]="showErrors && (!form.codigo.trim() || hasApiFieldError('codigo', 'code'))" />
              <span class="err-msg" *ngIf="showErrors && !form.codigo.trim()">Código é obrigatório</span>
              <span class="err-msg" *ngIf="showErrors && hasApiFieldError('codigo', 'code')">{{ firstApiFieldError('codigo', 'code') }}</span>
            </div>
            <div class="field w2">
              <label>País <span class="required">*</span></label>
              <input type="text" [(ngModel)]="form.pais" placeholder="Ex: China"
                [class.err]="showErrors && (!form.pais.trim() || hasApiFieldError('pais', 'country'))" />
              <span class="err-msg" *ngIf="showErrors && !form.pais.trim()">País é obrigatório</span>
              <span class="err-msg" *ngIf="showErrors && hasApiFieldError('pais', 'country')">{{ firstApiFieldError('pais', 'country') }}</span>
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
            <button class="btn btn-primary" (click)="save()" [appLoadingBtn]="isSaving">💾 Salvar</button>
            <button class="btn btn-secondary" (click)="cancel()">✖️ Cancelar</button>
          </div>
        </div>
      </ng-container>

    </div>
  `
})
export class PortosOrigemComponent implements OnInit {
  items: PortoOrigem[] = [];
  pagedResult: PagedResult<PortoOrigem> | null = null;
  q = '';
  loading = false;
  isSaving = false;
  hasLoadError = false;
  loadErrorMessage = '';
  showForm = false;
  showErrors = false;
  editing: PortoOrigem | null = null;
  apiFieldErrors: Record<string, string[]> = {};

  form = { nome: '', codigo: '', pais: '', ativo: true };

  constructor(
    private service: PortoOrigemService,
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
        this.loadErrorMessage = err?.message ?? 'Erro ao carregar portos de origem.';
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

  get filtered(): PortoOrigem[] {
    if (!this.q) return this.items;
    const s = this.q.toLowerCase();
    return this.items.filter(p =>
      p.nome.toLowerCase().includes(s) ||
      p.codigo.toLowerCase().includes(s) ||
      p.pais.toLowerCase().includes(s)
    );
  }

  openForm(item?: PortoOrigem): void {
    this.editing = item ?? null;
    this.showErrors = false;
    this.apiFieldErrors = {};
    this.form = item
      ? { nome: item.nome, codigo: item.codigo, pais: item.pais, ativo: item.ativo }
      : { nome: '', codigo: '', pais: '', ativo: true };
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

    this.isSaving = true;
    if (this.editing) {
      this.service.update({ ...this.editing, ...this.form }).subscribe({
        next: () => {
          this.isSaving = false;
          this.toast.success('Porto de origem atualizado com sucesso.');
          this.cancel();
          this.load(this.pagedResult?.page ?? 1, this.pagedResult?.pageSize ?? 20);
        },
        error: err => {
          this.isSaving = false;
          this.apiFieldErrors = this.collectFieldErrors(err);
          if (!Object.keys(this.apiFieldErrors).length) {
            this.toast.error(err?.message ?? 'Erro ao atualizar porto de origem.');
          }
        }
      });
    } else {
      this.service.create(this.form).subscribe({
        next: () => {
          this.isSaving = false;
          this.toast.success('Porto de origem criado com sucesso.');
          this.cancel();
          this.load(this.pagedResult?.page ?? 1, this.pagedResult?.pageSize ?? 20);
        },
        error: err => {
          this.isSaving = false;
          this.apiFieldErrors = this.collectFieldErrors(err);
          if (!Object.keys(this.apiFieldErrors).length) {
            this.toast.error(err?.message ?? 'Erro ao criar porto de origem.');
          }
        }
      });
    }
  }

  async remove(id: string): Promise<void> {
    const ok = await this.confirmDialog.confirm({
      title: 'Excluir porto de origem',
      message: 'Deseja excluir este porto de origem?',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      danger: true
    });
    if (!ok) return;

    this.service.remove(id).subscribe({
      next: () => {
        this.toast.success('Porto de origem removido com sucesso.');
        this.load(this.pagedResult?.page ?? 1, this.pagedResult?.pageSize ?? 20);
      },
      error: err => this.toast.error(err?.message ?? 'Erro ao remover porto de origem.')
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
