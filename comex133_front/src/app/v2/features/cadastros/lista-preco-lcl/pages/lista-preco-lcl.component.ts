import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ListaPrecoLclService } from '../services/lista-preco-lcl.service';
import { ListaPrecoLcl } from '../models/lista-preco-lcl.models';
import { CRUD_STYLES } from '../../../../shared/styles/crud-page.styles';
import { ToastService } from '../../../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../../../core/services/confirm-dialog.service';
import { ApiErrorMapper } from '../../../../../core/api/error-handler/api-error.mapper';

@Component({
  selector: 'app-lista-preco-lcl',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: CRUD_STYLES,
  template: `
    <div class="container-standard">

      <div class="dashboard-header">
        <div>
          <h1>💲 Lista de Preços LCL</h1>
          <p class="subtitle">Tabela de preços para cargas fracionadas (LCL) em USD por CBM e KG</p>
        </div>
        <button class="btn btn-primary" (click)="openForm()">+ Novo Item</button>
      </div>

      <!-- List -->
      <ng-container *ngIf="!showForm">
        <div class="content-section">
          <div class="toolbar">
            <input class="search" type="text" [(ngModel)]="q" placeholder="🔎 Buscar por categoria, descrição ou nome chinês" />
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Categoria</th>
                <th>Descrição</th>
                <th>Nome Chinês</th>
                <th style="text-align:right">USD/CBM</th>
                <th style="text-align:right">USD/KG</th>
                <th>Vigência</th>
                <th>Status</th>
                <th style="width:100px">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="filtered.length === 0">
                <td colspan="8" class="empty-state">Nenhum item na lista de preços LCL</td>
              </tr>
              <tr *ngFor="let l of filtered">
                <td><strong>{{ l.categoria }}</strong></td>
                <td>{{ l.descricao }}</td>
                <td>{{ l.nomeChines || '—' }}</td>
                <td style="text-align:right"><strong>$ {{ l.precoUsdPorCbm | number:'1.2-2' }}</strong></td>
                <td style="text-align:right">$ {{ l.precoUsdPorKg | number:'1.2-2' }}</td>
                <td>{{ l.dataVigencia | date:'dd/MM/yyyy' }}</td>
                <td>
                  <span [class]="l.ativo ? 'badge-active' : 'badge-inactive'">
                    {{ l.ativo ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>
                <td>
                  <div class="row-actions">
                    <button class="btn-icon" title="Editar" (click)="openForm(l)">✏️</button>
                    <button class="btn-icon danger" title="Excluir" (click)="remove(l.id)">🗑️</button>
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
          <h2>{{ editing ? 'Editar Item LCL' : 'Novo Item LCL' }}</h2>
          <p>{{ editing ? 'Atualize os dados do item' : 'Preencha os dados do novo item da lista de preços' }}</p>
        </div>
        <div class="card">
          <div class="form-grid">
            <div class="field">
              <label>Categoria <span class="required">*</span></label>
              <input type="text" [(ngModel)]="form.categoria" placeholder="Ex: Eletrônicos"
                     [class.err]="showErrors && (!form.categoria.trim() || hasApiFieldError('categoria'))" />
              <span class="err-msg" *ngIf="showErrors && !form.categoria.trim()">Categoria é obrigatória</span>
              <span class="err-msg" *ngIf="showErrors && hasApiFieldError('categoria')">{{ firstApiFieldError('categoria') }}</span>
            </div>
            <div class="field w2">
              <label>Descrição <span class="required">*</span></label>
              <input type="text" [(ngModel)]="form.descricao" placeholder="Ex: Smartphones e acessórios"
                     [class.err]="showErrors && (!form.descricao.trim() || hasApiFieldError('descricao'))" />
              <span class="err-msg" *ngIf="showErrors && !form.descricao.trim()">Descrição é obrigatória</span>
              <span class="err-msg" *ngIf="showErrors && hasApiFieldError('descricao')">{{ firstApiFieldError('descricao') }}</span>
            </div>
            <div class="field w2">
              <label>Nome Chinês (opcional)</label>
              <input type="text" [(ngModel)]="form.nomeChines" placeholder="Ex: 手机及配件" />
            </div>
            <div class="field">
              <label>Preço USD/CBM <span class="required">*</span></label>
              <input type="number" [(ngModel)]="form.precoUsdPorCbm" min="0" step="0.01" placeholder="0.00" />
            </div>
            <div class="field">
              <label>Preço USD/KG <span class="required">*</span></label>
              <input type="number" [(ngModel)]="form.precoUsdPorKg" min="0" step="0.01" placeholder="0.00" />
            </div>
            <div class="field">
              <label>Data de Vigência <span class="required">*</span></label>
              <input type="date" [(ngModel)]="form.dataVigencia"
                     [class.err]="showErrors && (!form.dataVigencia || hasApiFieldError('dataVigencia'))" />
              <span class="err-msg" *ngIf="showErrors && !form.dataVigencia">Data de vigência é obrigatória</span>
              <span class="err-msg" *ngIf="showErrors && hasApiFieldError('dataVigencia')">{{ firstApiFieldError('dataVigencia') }}</span>
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
export class ListaPrecoLclComponent implements OnInit {
  items: ListaPrecoLcl[] = [];
  q = '';
  showForm = false;
  showErrors = false;
  apiFieldErrors: Record<string, string[]> = {};
  editing: ListaPrecoLcl | null = null;

  form = {
    categoria: '',
    descricao: '',
    nomeChines: '',
    precoUsdPorCbm: 0,
    precoUsdPorKg: 0,
    dataVigencia: '',
    ativo: true
  };

  constructor(
    private service: ListaPrecoLclService,
    private toast: ToastService,
    private confirmDialog: ConfirmDialogService
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void { this.items = this.service.getAll(); }

  get filtered(): ListaPrecoLcl[] {
    if (!this.q) return this.items;
    const s = this.q.toLowerCase();
    return this.items.filter(l =>
      l.categoria.toLowerCase().includes(s) ||
      l.descricao.toLowerCase().includes(s) ||
      (l.nomeChines ?? '').toLowerCase().includes(s)
    );
  }

  openForm(item?: ListaPrecoLcl): void {
    this.editing = item ?? null;
    this.showErrors = false;
    this.apiFieldErrors = {};
    this.form = item
      ? {
          categoria: item.categoria,
          descricao: item.descricao,
          nomeChines: item.nomeChines ?? '',
          precoUsdPorCbm: item.precoUsdPorCbm,
          precoUsdPorKg: item.precoUsdPorKg,
          dataVigencia: item.dataVigencia,
          ativo: item.ativo
        }
      : { categoria: '', descricao: '', nomeChines: '', precoUsdPorCbm: 0, precoUsdPorKg: 0, dataVigencia: '', ativo: true };
    this.showForm = true;
  }

  cancel(): void { this.showForm = false; this.editing = null; this.apiFieldErrors = {}; }

  save(): void {
    this.showErrors = true;
    this.apiFieldErrors = {};
    if (!this.form.categoria.trim() || !this.form.descricao.trim() || !this.form.dataVigencia) return;

    const data: Omit<ListaPrecoLcl, 'id'> = {
      categoria: this.form.categoria.trim(),
      descricao: this.form.descricao.trim(),
      nomeChines: this.form.nomeChines.trim() || undefined,
      precoUsdPorCbm: Number(this.form.precoUsdPorCbm),
      precoUsdPorKg: Number(this.form.precoUsdPorKg),
      dataVigencia: this.form.dataVigencia,
      ativo: this.form.ativo
    };

    try {
      if (this.editing) {
        this.service.update({ ...this.editing, ...data });
        this.toast.success('Item da lista de precos atualizado com sucesso.');
      } else {
        this.service.create(data);
        this.toast.success('Item da lista de precos criado com sucesso.');
      }
      this.cancel();
      this.load();
    } catch (err: any) {
      this.apiFieldErrors = this.collectFieldErrors(err);
      if (!Object.keys(this.apiFieldErrors).length) {
        this.toast.error(err?.message ?? 'Erro ao salvar item da lista de preços.');
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
      title: 'Excluir item da lista',
      message: 'Deseja excluir este item da lista de precos?',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      danger: true
    });
    if (!ok) return;

    this.service.remove(id);
    this.load();
    this.toast.success('Item removido com sucesso.');
  }
}
