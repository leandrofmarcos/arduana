import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CRUD_STYLES } from '../../../../shared/styles/crud-page.styles';
import { NavioCadastro } from '../models/navio.models';
import { NaviosCadastroService } from '../services/navios-cadastro.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../../../core/services/confirm-dialog.service';
import { ApiErrorMapper } from '../../../../../core/api/error-handler/api-error.mapper';
import { SkeletonListComponent } from '../../../../../core/components/skeleton-list/skeleton-list.component';

@Component({
  selector: 'app-navios-cadastro',
  standalone: true,
  imports: [CommonModule, FormsModule, SkeletonListComponent],
  styles: CRUD_STYLES,
  template: `
    <div class="container-standard">

      <div class="dashboard-header">
        <div>
          <h1>🚢 Cadastro de Navios</h1>
          <p class="subtitle">Cadastro mestre de navios para vinculação nos embarques</p>
        </div>
        <button class="btn btn-primary" (click)="openForm()">+ Novo Navio</button>
      </div>

      <ng-container *ngIf="!showForm">
        <div class="content-section">
          <div class="toolbar">
            <input class="search" type="text" [(ngModel)]="q" placeholder="🔎 Buscar por nome, IMO ou armador" />
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
                <th>IMO</th>
                <th>Armador</th>
                <th>Status</th>
                <th style="width:100px">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="filtered.length === 0">
                <td colspan="5" class="empty-state">Nenhum navio cadastrado</td>
              </tr>
              <tr *ngFor="let n of filtered">
                <td><strong>{{ n.nomeNavio }}</strong></td>
                <td><code>{{ n.codigoImo || '—' }}</code></td>
                <td>{{ n.armador || '—' }}</td>
                <td>
                  <span [class]="n.ativo ? 'badge-active' : 'badge-inactive'">
                    {{ n.ativo ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>
                <td>
                  <div class="row-actions">
                    <button class="btn-icon" title="Editar" (click)="openForm(n)">✏️</button>
                    <button class="btn-icon danger" title="Excluir" (click)="remove(n.id)">🗑️</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </ng-container>

      <ng-container *ngIf="showForm">
        <div class="detail-header">
          <h2>{{ editing ? 'Editar Navio' : 'Novo Navio' }}</h2>
          <p>{{ editing ? 'Atualize as informações do navio' : 'Preencha os dados do novo navio' }}</p>
        </div>

        <div class="card">
          <div class="form-grid">
            <div class="field w2">
              <label>Nome do Navio <span class="required">*</span></label>
              <input type="text" [(ngModel)]="form.nomeNavio" [class.err]="showErrors && (!form.nomeNavio.trim() || hasApiFieldError('nomeNavio', 'nome', 'name'))" />
              <span class="err-msg" *ngIf="showErrors && !form.nomeNavio.trim()">Nome é obrigatório</span>
              <span class="err-msg" *ngIf="showErrors && hasApiFieldError('nomeNavio', 'nome', 'name')">{{ firstApiFieldError('nomeNavio', 'nome', 'name') }}</span>
            </div>
            <div class="field">
              <label>Código IMO</label>
              <input type="text" [(ngModel)]="form.codigoImo" placeholder="Ex: 9876543" />
            </div>
            <div class="field">
              <label>Armador</label>
              <input type="text" [(ngModel)]="form.armador" placeholder="Ex: MSC" />
            </div>
            <div class="field w3">
              <label>Observação</label>
              <input type="text" [(ngModel)]="form.observacao" placeholder="Opcional" />
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
export class NaviosComponent implements OnInit, OnDestroy {
  items: NavioCadastro[] = [];
  q = '';
  loading = true;
  hasLoadError = false;
  loadErrorMessage = '';

  showForm = false;
  showErrors = false;
  editing: NavioCadastro | null = null;
  apiFieldErrors: Record<string, string[]> = {};

  private readonly subs = new Subscription();

  form = {
    nomeNavio: '',
    codigoImo: '',
    armador: '',
    observacao: '',
    ativo: true
  };

  constructor(
    private service: NaviosCadastroService,
    private toast: ToastService,
    private confirmDialog: ConfirmDialogService,) {}

  ngOnInit(): void {
    this.subs.add(this.service.navios$.subscribe(items => this.items = [...items]));
    this.subs.add(this.service.loading$.subscribe((loading) => this.loading = loading));
    this.subs.add(this.service.loadError$.subscribe((message) => {
      this.hasLoadError = !!message;
      this.loadErrorMessage = message ?? '';
    }));
    this.service.reload();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  get filtered(): NavioCadastro[] {
    if (!this.q) return this.items;
    const s = this.q.toLowerCase();
    return this.items.filter(n =>
      n.nomeNavio.toLowerCase().includes(s) ||
      (n.codigoImo ?? '').toLowerCase().includes(s) ||
      (n.armador ?? '').toLowerCase().includes(s)
    );
  }

  openForm(item?: NavioCadastro): void {
    this.editing = item ?? null;
    this.showErrors = false;
    this.apiFieldErrors = {};
    this.form = item
      ? {
          nomeNavio: item.nomeNavio,
          codigoImo: item.codigoImo ?? '',
          armador: item.armador ?? '',
          observacao: item.observacao ?? '',
          ativo: item.ativo
        }
      : {
          nomeNavio: '',
          codigoImo: '',
          armador: '',
          observacao: '',
          ativo: true
        };
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
    if (!this.form.nomeNavio.trim()) return;

    const payload: Omit<NavioCadastro, 'id'> = {
      nomeNavio: this.form.nomeNavio.trim(),
      codigoImo: this.form.codigoImo.trim(),
      armador: this.form.armador.trim(),
      observacao: this.form.observacao.trim(),
      ativo: this.form.ativo
    };

    if (this.editing) {
      this.service.update({ ...this.editing, ...payload }).subscribe({
        next: () => this.toast.success('Navio atualizado com sucesso.'),
        error: (err) => {
          this.apiFieldErrors = this.collectFieldErrors(err);
          if (!Object.keys(this.apiFieldErrors).length) {
            this.toast.error(err?.message ?? 'Erro ao atualizar navio.');
          }
        }
      });
    } else {
      this.service.create(payload).subscribe({
        next: () => this.toast.success('Navio criado com sucesso.'),
        error: (err) => {
          this.apiFieldErrors = this.collectFieldErrors(err);
          if (!Object.keys(this.apiFieldErrors).length) {
            this.toast.error(err?.message ?? 'Erro ao criar navio.');
          }
        }
      });
    }

    this.cancel();
  }

  async remove(id: string): Promise<void> {
    const ok = await this.confirmDialog.confirm({
      title: 'Excluir navio',
      message: 'Deseja excluir este navio?',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      danger: true
    });
    if (!ok) return;

    this.service.remove(id).subscribe({
      next: () => this.toast.success('Navio removido com sucesso.'),
      error: (err) => this.toast.error(err?.message ?? 'Erro ao remover navio.')
    });
  }

  retryLoad(): void {
    this.service.reload();
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
