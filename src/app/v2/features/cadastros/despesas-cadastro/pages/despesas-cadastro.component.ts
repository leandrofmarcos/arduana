import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DespesaCadastroService } from '../services/despesa-cadastro.service';
import { DespesaCadastro, CATEGORIAS_DESPESA, CategoriaDespesa } from '../models/despesa-cadastro.models';
import { CRUD_STYLES } from '../../../../shared/styles/crud-page.styles';

const CAT_BG: Record<string, string> = {
  'Agência Marítima': '#dbeafe',
  'Despachante':      '#fef3c7',
  'Tributos':         '#fee2e2',
  'Portos':           '#d1fae5',
  'Outras Despesas':  '#f3f4f6',
};
const CAT_COLOR: Record<string, string> = {
  'Agência Marítima': '#1d4ed8',
  'Despachante':      '#92400e',
  'Tributos':         '#991b1b',
  'Portos':           '#065f46',
  'Outras Despesas':  '#374151',
};

@Component({
  selector: 'app-despesas-cadastro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [
    ...CRUD_STYLES,
    `
    .cat-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      white-space: nowrap;
    }
    .total-row td { font-weight: 700; background: var(--color-border); }
    `
  ],
  template: `
    <div class="container-standard">

      <!-- Header -->
      <div class="dashboard-header">
        <div>
          <h1>💰 Despesas — Catálogo</h1>
          <p class="subtitle">Tabela de referência de despesas aduaneiras por categoria</p>
        </div>
        <button class="btn btn-primary" (click)="openForm()">+ Nova Despesa</button>
      </div>

      <!-- Lista -->
      <ng-container *ngIf="!showForm">
        <div class="content-section">
          <div class="toolbar">
            <input class="search" type="text" [(ngModel)]="q" placeholder="🔎 Buscar por descrição" />
            <select style="margin-left:12px;padding:9px 12px;border:2px solid var(--color-border);border-radius:8px;background:var(--color-surface);color:var(--color-text)"
                    [(ngModel)]="catFiltro">
              <option value="">Todas as categorias</option>
              <option *ngFor="let c of categorias" [value]="c">{{ c }}</option>
            </select>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Descrição</th>
                <th style="width:160px">Categoria</th>
                <th style="width:130px;text-align:right">Valor (R$)</th>
                <th style="width:80px">Status</th>
                <th style="width:80px">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="filtered.length === 0">
                <td colspan="5" class="empty-state">Nenhuma despesa encontrada</td>
              </tr>
              <tr *ngFor="let d of filtered">
                <td>{{ d.descricao }}</td>
                <td>
                  <span class="cat-badge" [ngStyle]="catNgStyle(d.categoria)">
                    {{ d.categoria }}
                  </span>
                </td>
                <td style="text-align:right;font-variant-numeric:tabular-nums">
                  {{ d.valor | currency:'BRL':'symbol':'1.2-2' }}
                </td>
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
              <tr class="total-row" *ngIf="filtered.length > 0">
                <td colspan="2">Total ({{ filtered.length }} itens)</td>
                <td style="text-align:right">{{ total | currency:'BRL':'symbol':'1.2-2' }}</td>
                <td colspan="2"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </ng-container>

      <!-- Formulário -->
      <ng-container *ngIf="showForm">
        <div class="detail-header">
          <h2>{{ editing ? 'Editar Despesa' : 'Nova Despesa' }}</h2>
          <p>{{ editing ? 'Atualize os dados da despesa' : 'Cadastre um novo item de despesa aduaneira' }}</p>
        </div>
        <div class="card">
          <div class="form-grid">
            <div class="field w2">
              <label>Descrição <span class="required">*</span></label>
              <input type="text" [(ngModel)]="form.descricao" placeholder="Ex: THC"
                     [class.err]="showErrors && !form.descricao.trim()" />
              <span class="err-msg" *ngIf="showErrors && !form.descricao.trim()">Descrição é obrigatória</span>
            </div>
            <div class="field">
              <label>Categoria <span class="required">*</span></label>
              <select [(ngModel)]="form.categoria" [class.err]="showErrors && !form.categoria">
                <option value="">Selecione...</option>
                <option *ngFor="let c of categorias" [value]="c">{{ c }}</option>
              </select>
              <span class="err-msg" *ngIf="showErrors && !form.categoria">Categoria é obrigatória</span>
            </div>
            <div class="field">
              <label>Valor de Referência (R$) <span class="required">*</span></label>
              <input type="number" min="0" step="0.01" [(ngModel)]="form.valor"
                     placeholder="0,00" [class.err]="showErrors && form.valor == null" />
              <span class="err-msg" *ngIf="showErrors && form.valor == null">Valor é obrigatório</span>
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
export class DespesasCadastroComponent implements OnInit {
  items: DespesaCadastro[] = [];
  categorias = CATEGORIAS_DESPESA;
  q = '';
  catFiltro = '';
  showForm = false;
  showErrors = false;
  editing: DespesaCadastro | null = null;

  form: { descricao: string; valor: number; categoria: string; ativo: boolean } = {
    descricao: '', valor: 0, categoria: '', ativo: true
  };

  constructor(private service: DespesaCadastroService) {}

  ngOnInit(): void { this.load(); }

  load(): void { this.items = this.service.getAll(); }

  get filtered(): DespesaCadastro[] {
    return this.items.filter(d => {
      const matchQ = !this.q || d.descricao.toLowerCase().includes(this.q.toLowerCase());
      const matchCat = !this.catFiltro || d.categoria === this.catFiltro;
      return matchQ && matchCat;
    });
  }

  get total(): number {
    return this.filtered.reduce((acc, d) => acc + (d.valor ?? 0), 0);
  }

  catNgStyle(cat: string): { [key: string]: string } {
    return {
      background: CAT_BG[cat] ?? '#f3f4f6',
      color:      CAT_COLOR[cat] ?? '#374151',
    };
  }

  openForm(item?: DespesaCadastro): void {
    this.editing = item ?? null;
    this.showErrors = false;
    this.form = item
      ? { descricao: item.descricao, valor: item.valor, categoria: item.categoria, ativo: item.ativo }
      : { descricao: '', valor: 0, categoria: '', ativo: true };
    this.showForm = true;
  }

  cancel(): void {
    this.showForm = false;
    this.editing = null;
  }

  save(): void {
    this.showErrors = true;
    if (!this.form.descricao.trim() || !this.form.categoria || this.form.valor == null) return;

    const data: Omit<DespesaCadastro, 'id'> = {
      descricao: this.form.descricao.trim(),
      valor:     this.form.valor,
      categoria: this.form.categoria as CategoriaDespesa,
      ativo:     this.form.ativo,
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
    if (confirm('Deseja excluir esta despesa do catálogo?')) {
      this.service.remove(id);
      this.load();
    }
  }
}
