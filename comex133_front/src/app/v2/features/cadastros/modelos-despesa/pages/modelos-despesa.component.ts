import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModeloDespesaService } from '../services/modelo-despesa.service';
import { DespesaCadastroService } from '../../despesas-cadastro/services/despesa-cadastro.service';
import { ModeloDespesa, ModeloDespesaItem } from '../models/modelo-despesa.models';
import { DespesaCadastro, CategoriaDespesa } from '../../despesas-cadastro/models/despesa-cadastro.models';
import { CRUD_STYLES } from '../../../../shared/styles/crud-page.styles';
import { ToastService } from '../../../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../../../core/services/confirm-dialog.service';
import { ApiErrorMapper } from '../../../../../core/api/error-handler/api-error.mapper';

interface ModeloVM extends ModeloDespesa {
  expanded: boolean;
  itens: ModeloDespesaItem[];
  despesas: DespesaCadastro[];
  total: number;
}

@Component({
  selector: 'app-modelos-despesa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [
    ...CRUD_STYLES,
    `
    /* ── Accordion list ── */
    .modelo-card {
      border: 1px solid var(--color-border);
      border-radius: 10px;
      margin-bottom: 12px;
      overflow: hidden;
    }
    .modelo-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 18px;
      background: var(--color-surface);
      cursor: pointer;
      user-select: none;
      transition: background .15s;
    }
    .modelo-header:hover { background: var(--color-bg); }
    .modelo-chevron { font-size: 12px; transition: transform .2s; }
    .modelo-chevron.open { transform: rotate(90deg); }
    .modelo-nome { font-weight: 700; font-size: 15px; flex: 1; }
    .modelo-meta { font-size: 12px; color: var(--color-text-muted, #6b7280); }
    .modelo-total { font-weight: 700; color: var(--color-primary); font-size: 14px; min-width: 110px; text-align: right; }
    .modelo-body { padding: 0; }
    .modelo-itens-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .modelo-itens-table th {
      background: var(--color-bg);
      padding: 8px 14px;
      text-align: left;
      color: var(--color-text-muted, #6b7280);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: .5px;
    }
    .modelo-itens-table td { padding: 9px 14px; border-top: 1px solid var(--color-border); }
    .modelo-itens-table tr:last-child td { border-bottom: none; }
    .cat-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 600;
      white-space: nowrap;
    }

    /* ── Modal ── */
    .modal-backdrop {
      position: fixed; inset: 0;
      background: rgba(0,0,0,.45);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000;
    }
    .modal-box {
      background: var(--color-surface);
      border-radius: 12px;
      padding: 28px;
      width: 680px;
      max-width: 96vw;
      max-height: 88vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0,0,0,.3);
    }
    .modal-title { font-size: 18px; font-weight: 700; margin-bottom: 20px; }
    .despesas-picker { border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden; margin-top: 8px; max-height: 340px; overflow-y: auto; }
    .picker-row {
      display: flex; align-items: center; gap: 10px;
      padding: 9px 14px;
      border-bottom: 1px solid var(--color-border);
      cursor: pointer;
      transition: background .12s;
    }
    .picker-row:last-child { border-bottom: none; }
    .picker-row:hover { background: var(--color-bg); }
    .picker-row.selected { background: #eff6ff; }
    .picker-cat { font-size: 11px; color: var(--color-text-muted, #6b7280); min-width: 120px; }
    .picker-desc { flex: 1; }
    .picker-val { font-variant-numeric: tabular-nums; min-width: 80px; text-align: right; }
    .picker-check { width: 16px; height: 16px; }
    .selected-total { margin-top: 10px; font-weight: 700; text-align: right; color: var(--color-primary); }
    .picker-search { width: 100%; padding: 9px 12px; border: 1px solid var(--color-border); border-radius: 8px 8px 0 0; font-size: 13px; background: var(--color-bg); color: var(--color-text); }
    .picker-search:focus { outline: none; border-color: var(--color-primary); }
    .picker-select-all { display: flex; align-items: center; gap: 10px; padding: 8px 14px; background: #f0f4ff; border-bottom: 1px solid var(--color-border); font-size: 12px; font-weight: 600; color: var(--color-primary); cursor: pointer; user-select: none; }
    .picker-select-all:hover { background: #e0eaff; }
    .picker-select-all input { width: 15px; height: 15px; cursor: pointer; accent-color: var(--color-primary); }
    .group-header { background: var(--color-bg); padding: 6px 14px; font-size: 11px; font-weight: 700; color: var(--color-text-muted,#6b7280); text-transform: uppercase; letter-spacing: .5px; }
    `
  ],
  template: `
    <div class="container-standard">

      <!-- Header -->
      <div class="dashboard-header">
        <div>
          <h1>📋 Modelos de Despesas</h1>
          <p class="subtitle">Agrupe despesas em templates reutilizáveis para agilizar o preenchimento</p>
        </div>
        <button class="btn btn-primary" (click)="openModal()">+ Novo Modelo</button>
      </div>

      <!-- Lista de Modelos (Accordion) -->
      <div class="content-section">
        <div *ngIf="modelos.length === 0" class="empty-state">
          Nenhum modelo cadastrado. Crie o primeiro modelo clicando em "Novo Modelo".
        </div>

        <div class="modelo-card" *ngFor="let m of modelos">
          <!-- Cabeçalho expansível -->
          <div class="modelo-header" (click)="toggle(m)">
            <span class="modelo-chevron" [class.open]="m.expanded">▶</span>
            <span class="modelo-nome">{{ m.nome }}</span>
            <span class="modelo-meta">{{ m.itens.length }} {{ m.itens.length === 1 ? 'item' : 'itens' }}</span>
            <span class="modelo-total">{{ m.total | currency:'BRL':'symbol':'1.2-2' }}</span>
            <div class="row-actions" (click)="$event.stopPropagation()">
              <button class="btn-icon" title="Editar" (click)="openModal(m)">✏️</button>
              <button class="btn-icon danger" title="Excluir" (click)="removeModelo(m.id)">🗑️</button>
            </div>
          </div>

          <!-- Corpo expansível -->
          <div class="modelo-body" *ngIf="m.expanded">
            <table class="modelo-itens-table">
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th style="width:150px">Categoria</th>
                  <th style="width:120px;text-align:right">Valor (R$)</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngIf="m.despesas.length === 0">
                  <td colspan="3" class="empty-state" style="padding:16px">Nenhuma despesa vinculada</td>
                </tr>
                <tr *ngFor="let d of m.despesas">
                  <td>{{ d.descricao }}</td>
                  <td>
                    <span class="cat-badge" [ngStyle]="{ background: catBg(d.categoria), color: catColor(d.categoria) }">
                      {{ d.categoria }}
                    </span>
                  </td>
                  <td style="text-align:right;font-variant-numeric:tabular-nums">
                    {{ d.valor | currency:'BRL':'symbol':'1.2-2' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Modal Novo/Editar Modelo -->
      <div class="modal-backdrop" *ngIf="showModal" (click)="closeModal()">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <div class="modal-title">{{ editingModelo ? 'Editar Modelo' : 'Novo Modelo de Despesas' }}</div>

          <div class="form-grid">
            <div class="field w2">
              <label>Nome do Modelo <span class="required">*</span></label>
              <input type="text" [(ngModel)]="form.nome" placeholder="Ex: Desembaraço Padrão FCL"
                     [class.err]="showErrors && (!form.nome.trim() || hasApiFieldError('nome'))" />
              <span class="err-msg" *ngIf="showErrors && !form.nome.trim()">Nome é obrigatório</span>
              <span class="err-msg" *ngIf="showErrors && hasApiFieldError('nome')">{{ firstApiFieldError('nome') }}</span>
            </div>
            <div class="field w2">
              <label>Descrição (opcional)</label>
              <input type="text" [(ngModel)]="form.descricao" placeholder="Breve descrição do modelo" />
            </div>
          </div>

          <!-- Seletor de despesas -->
          <div style="margin-top:20px">
            <label style="font-weight:600;font-size:13px">Despesas vinculadas <span class="required">*</span></label>
            <span class="err-msg" *ngIf="showErrors && selectedIds.size === 0" style="margin-left:8px">
              Selecione ao menos uma despesa
            </span>
            <div class="despesas-picker">
              <input class="picker-search" type="text" [(ngModel)]="pickerQ" placeholder="🔎 Filtrar despesas..." />
              <div class="picker-select-all" (click)="toggleSelectAll()">
                <input type="checkbox"
                       [checked]="isAllVisibleSelected()"
                       [indeterminate]="isSomeVisibleSelected()"
                       (click)="$event.stopPropagation()" />
                <span>{{ isAllVisibleSelected() ? 'Desmarcar todos' : 'Selecionar todos' }}</span>
                <span style="margin-left:auto;font-weight:400;color:var(--color-text-muted,#6b7280)">
                  {{ visibleCount() }} {{ visibleCount() === 1 ? 'item visível' : 'itens visíveis' }}
                </span>
              </div>
              <ng-container *ngFor="let cat of categorias">
                <ng-container *ngIf="pickerByCategoria(cat).length > 0">
                  <div class="group-header">{{ cat }}</div>
                  <div class="picker-row"
                       *ngFor="let d of pickerByCategoria(cat)"
                       [class.selected]="selectedIds.has(d.id)"
                       (click)="togglePicker(d.id)">
                    <input class="picker-check" type="checkbox" [checked]="selectedIds.has(d.id)" (click)="$event.stopPropagation()" readonly />
                    <span class="picker-desc">{{ d.descricao }}</span>
                    <span class="picker-val">{{ d.valor | currency:'BRL':'symbol':'1.2-2' }}</span>
                  </div>
                </ng-container>
              </ng-container>
            </div>
            <div class="selected-total" *ngIf="selectedIds.size > 0">
              {{ selectedIds.size }} {{ selectedIds.size === 1 ? 'item selecionado' : 'itens selecionados' }} —
              Total: {{ selectedTotal | currency:'BRL':'symbol':'1.2-2' }}
            </div>
          </div>

          <div class="actions" style="margin-top:24px">
            <button class="btn btn-primary" (click)="saveModelo()">💾 Salvar</button>
            <button class="btn btn-secondary" (click)="closeModal()">✖️ Cancelar</button>
          </div>
        </div>
      </div>

    </div>
  `
})
export class ModelosDespesaComponent implements OnInit {
  modelos: ModeloVM[] = [];
  allDespesas: DespesaCadastro[] = [];
  categorias: CategoriaDespesa[] = [
    'Agência Marítima', 'Despachante', 'Tributos', 'Portos', 'Outras Despesas'
  ];

  showModal = false;
  showErrors = false;
  apiFieldErrors: Record<string, string[]> = {};
  editingModelo: ModeloVM | null = null;

  form = { nome: '', descricao: '' };
  selectedIds = new Set<string>();
  pickerQ = '';

  private readonly CAT_BG: Record<CategoriaDespesa, string> = {
    'Agência Marítima': '#dbeafe',
    'Despachante':      '#fef3c7',
    'Tributos':         '#fee2e2',
    'Portos':           '#d1fae5',
    'Outras Despesas':  '#f3f4f6',
  };
  private readonly CAT_COLOR: Record<CategoriaDespesa, string> = {
    'Agência Marítima': '#1d4ed8',
    'Despachante':      '#92400e',
    'Tributos':         '#991b1b',
    'Portos':           '#065f46',
    'Outras Despesas':  '#374151',
  };

  constructor(
    private service: ModeloDespesaService,
    private despesaService: DespesaCadastroService,
    private toast: ToastService,
    private confirmDialog: ConfirmDialogService
  ) {}

  ngOnInit(): void {
    this.allDespesas = this.despesaService.getAtivos();
    this.load();
  }

  load(): void {
    const raw = this.service.getAll();
    this.modelos = raw.map(m => this.toVM(m));
  }

  private toVM(m: ModeloDespesa): ModeloVM {
    const itens = this.service.getItensByModelo(m.id);
    const despesas = itens
      .map(i => this.allDespesas.find(d => d.id === i.despesaCadastroId))
      .filter((d): d is DespesaCadastro => !!d);
    return {
      ...m,
      expanded: false,
      itens,
      despesas,
      total: despesas.reduce((acc, d) => acc + d.valor, 0),
    };
  }

  toggle(m: ModeloVM): void { m.expanded = !m.expanded; }

  catBg(cat: CategoriaDespesa): string { return this.CAT_BG[cat] ?? '#f3f4f6'; }
  catColor(cat: CategoriaDespesa): string { return this.CAT_COLOR[cat] ?? '#374151'; }

  // ── Picker ─────────────────────────────────────────────────────────────

  pickerByCategoria(cat: CategoriaDespesa): DespesaCadastro[] {
    return this.allDespesas.filter(d =>
      d.categoria === cat &&
      (!this.pickerQ || d.descricao.toLowerCase().includes(this.pickerQ.toLowerCase()))
    );
  }

  togglePicker(id: string): void {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
    this.selectedIds = new Set(this.selectedIds); // trigger CD
  }

  /** Returns all despesas currently visible in the picker (respecting search filter) */
  private visibleDespesas(): DespesaCadastro[] {
    return this.allDespesas.filter(d =>
      !this.pickerQ || d.descricao.toLowerCase().includes(this.pickerQ.toLowerCase())
    );
  }

  visibleCount(): number { return this.visibleDespesas().length; }

  isAllVisibleSelected(): boolean {
    const vis = this.visibleDespesas();
    return vis.length > 0 && vis.every(d => this.selectedIds.has(d.id));
  }

  isSomeVisibleSelected(): boolean {
    const vis = this.visibleDespesas();
    return !this.isAllVisibleSelected() && vis.some(d => this.selectedIds.has(d.id));
  }

  toggleSelectAll(): void {
    const vis = this.visibleDespesas();
    if (this.isAllVisibleSelected()) {
      vis.forEach(d => this.selectedIds.delete(d.id));
    } else {
      vis.forEach(d => this.selectedIds.add(d.id));
    }
    this.selectedIds = new Set(this.selectedIds);
  }

  get selectedTotal(): number {
    return this.allDespesas
      .filter(d => this.selectedIds.has(d.id))
      .reduce((acc, d) => acc + d.valor, 0);
  }

  // ── Modal ───────────────────────────────────────────────────────────────

  openModal(m?: ModeloVM): void {
    this.allDespesas = this.despesaService.getAtivos(); // always refresh
    this.editingModelo = m ?? null;
    this.showErrors = false;
    this.apiFieldErrors = {};
    this.pickerQ = '';
    this.form = m
      ? { nome: m.nome, descricao: m.descricao ?? '' }
      : { nome: '', descricao: '' };
    this.selectedIds = m
      ? new Set(m.itens.map(i => i.despesaCadastroId))
      : new Set();
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingModelo = null;
    this.apiFieldErrors = {};
  }

  saveModelo(): void {
    this.showErrors = true;
    this.apiFieldErrors = {};
    if (!this.form.nome.trim() || this.selectedIds.size === 0) return;

    if (this.editingModelo) {
      try {
        this.service.update({
          ...this.editingModelo,
          nome:      this.form.nome.trim(),
          descricao: this.form.descricao.trim() || undefined,
        });
        this.service.replaceItens(this.editingModelo.id, Array.from(this.selectedIds));
        this.toast.success('Modelo de despesas atualizado com sucesso.');
        this.closeModal();
        this.load();
      } catch (err: any) {
        this.apiFieldErrors = this.collectFieldErrors(err);
        if (!Object.keys(this.apiFieldErrors).length) {
          this.toast.error(err?.message ?? 'Erro ao atualizar modelo.');
        }
      }
    } else {
      this.service.create({
        nome:      this.form.nome.trim(),
        descricao: this.form.descricao.trim() || undefined,
        ativo:     true,
      }).subscribe({
        next: novo => {
          this.service.replaceItens(novo.id, Array.from(this.selectedIds));
          this.closeModal();
          this.toast.success('Modelo de despesas criado com sucesso.');
          setTimeout(() => this.load(), 100);
        },
        error: (err: any) => {
          this.apiFieldErrors = this.collectFieldErrors(err);
          if (!Object.keys(this.apiFieldErrors).length) {
            this.toast.error(err?.message ?? 'Erro ao criar modelo.');
          }
        }
      });
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

  async removeModelo(id: string): Promise<void> {
    const ok = await this.confirmDialog.confirm({
      title: 'Excluir modelo de despesas',
      message: 'Deseja excluir este modelo e todos os seus itens?',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      danger: true
    });
    if (!ok) return;

    this.service.remove(id);
    this.load();
    this.toast.success('Modelo de despesas removido com sucesso.');
  }
}
