import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TipoDocumentoService } from '../services/tipo-documento.service';
import { DocumentoService } from '../services/documento.service';
import { TipoDocumento, CategoriaDocumento, Documento } from '../models/documento.models';
import { CRUD_STYLES } from '../../../shared/styles/crud-page.styles';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../../core/services/confirm-dialog.service';
import { ApiErrorMapper } from '../../../../core/api/error-handler/api-error.mapper';

type TabType = 'tipos' | 'todos';
type CategoriaFilter = '' | CategoriaDocumento;

@Component({
  selector: 'app-documentos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h1 class="page-title">📁 Documentos</h1>
      <p class="page-subtitle">Tipos de documento e consulta de todos os arquivos anexados</p>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button class="tab" [class.active]="tab === 'tipos'" (click)="tab = 'tipos'">Tipos de Documento</button>
      <button class="tab" [class.active]="tab === 'todos'" (click)="tab = 'todos'; loadTodos()">Todos os Documentos</button>
    </div>

    <!-- ═══════════════════════════════════════ TAB: TIPOS ════════════════════════════════════════ -->
    <div *ngIf="tab === 'tipos'">
      <div class="toolbar">
        <input class="search" [(ngModel)]="searchTipos" placeholder="🔍 Buscar por nome ou código..." style="max-width:340px" />
        <button class="btn-primary" (click)="novoTipo()">+ Novo Tipo</button>
      </div>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nome</th>
              <th>Categoria</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let t of tiposFiltrados">
              <td><span class="badge badge-code">{{ t.codigo }}</span></td>
              <td>{{ t.nome }}</td>
              <td><span class="badge" [ngClass]="catClass(t.categoria)">{{ t.categoria }}</span></td>
              <td>
                <span class="badge" [class.badge-success]="t.ativo" [class.badge-muted]="!t.ativo">
                  {{ t.ativo ? 'Ativo' : 'Inativo' }}
                </span>
              </td>
              <td>
                <button class="btn-icon-sm" (click)="editarTipo(t)" title="Editar">✏️</button>
                <button class="btn-icon-sm btn-danger" (click)="removerTipo(t)" title="Remover">🗑️</button>
              </td>
            </tr>
            <tr *ngIf="tiposFiltrados.length === 0">
              <td colspan="5" class="empty-cell">Nenhum resultado encontrado.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ═════════════════════════════════════ TAB: TODOS ══════════════════════════════════════════ -->
    <div *ngIf="tab === 'todos'">
      <div class="toolbar" style="gap:10px">
        <input class="search" [(ngModel)]="searchTodos" placeholder="🔍 Buscar por nome..." style="max-width:280px" />
        <select class="form-select" [(ngModel)]="filterCategoria" style="width:170px">
          <option value="">Todas as categorias</option>
          <option value="Embarque">Embarque</option>
          <option value="Fiscal">Fiscal</option>
          <option value="Aduana">Aduana</option>
          <option value="Contrato">Contrato</option>
          <option value="Outro">Outro</option>
        </select>
        <span class="count-label">{{ todosFiltrados.length }} documento(s)</span>
      </div>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Nome Original</th>
              <th>Tipo</th>
              <th>Tamanho</th>
              <th>Upload</th>
              <th>Observação</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let d of todosFiltrados">
              <td class="icon-cell">{{ getIcon(d) }}</td>
              <td class="name-cell">{{ d.nomeOriginal }}</td>
              <td>
                <span class="badge badge-code" *ngIf="getTipo(d)">{{ getTipo(d)?.codigo }}</span>
                <span *ngIf="!getTipo(d)" class="text-muted">—</span>
              </td>
              <td class="text-muted">{{ svc.formatarTamanho(d.tamanhoBytes) }}</td>
              <td class="text-muted">{{ d.dataUpload | date:'dd/MM/yyyy HH:mm' }}</td>
              <td class="text-muted">{{ d.observacao || '—' }}</td>
              <td>
                <button class="btn-icon-sm" (click)="svc.baixar(d)" title="Baixar">⬇️</button>
                <button class="btn-icon-sm btn-danger" (click)="removerDocumento(d)" title="Remover">🗑️</button>
              </td>
            </tr>
            <tr *ngIf="todosFiltrados.length === 0">
              <td colspan="7" class="empty-cell">Nenhum documento encontrado.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ════════════════════════════════ MODAL TIPO DOCUMENTO ════════════════════════════════════ -->
    <div class="modal-overlay" *ngIf="showModal" (click)="fecharModal()">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ editId ? 'Editar Tipo de Documento' : 'Novo Tipo de Documento' }}</h3>
          <button class="btn-close" (click)="fecharModal()">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group col-2">
              <label>Nome *</label>
              <input type="text" [(ngModel)]="form.nome" class="form-control" placeholder="Ex: Bill of Lading" />
              <div class="form-error" *ngIf="hasApiFieldError('nome', 'name')">{{ firstApiFieldError('nome', 'name') }}</div>
            </div>
            <div class="form-group">
              <label>Código *</label>
              <input type="text" [(ngModel)]="form.codigo" class="form-control" placeholder="Ex: BL" style="text-transform:uppercase" />
              <div class="form-error" *ngIf="hasApiFieldError('codigo', 'code')">{{ firstApiFieldError('codigo', 'code') }}</div>
            </div>
            <div class="form-group">
              <label>Categoria *</label>
              <select [(ngModel)]="form.categoria" class="form-control">
                <option value="">Selecione...</option>
                <option value="Embarque">Embarque</option>
                <option value="Fiscal">Fiscal</option>
                <option value="Aduana">Aduana</option>
                <option value="Contrato">Contrato</option>
                <option value="Outro">Outro</option>
              </select>
              <div class="form-error" *ngIf="hasApiFieldError('categoria', 'category')">{{ firstApiFieldError('categoria', 'category') }}</div>
            </div>
            <div class="form-group">
              <label>Status</label>
              <select [(ngModel)]="form.ativo" class="form-control">
                <option [ngValue]="true">Ativo</option>
                <option [ngValue]="false">Inativo</option>
              </select>
            </div>
          </div>
          <div class="form-error" *ngIf="formError">{{ formError }}</div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" (click)="fecharModal()">Cancelar</button>
          <button class="btn-primary" (click)="salvarTipo()">{{ editId ? 'Salvar Alterações' : 'Criar Tipo' }}</button>
        </div>
      </div>
    </div>
  `,
  styles: [...CRUD_STYLES, `
    .page-header { margin-bottom: 24px; }
    .page-title { font-size: 24px; font-weight: 700; color: var(--color-text); margin: 0 0 4px; }
    .page-subtitle { color: var(--color-muted); font-size: 14px; margin: 0; }

    .tabs {
      display: flex;
      gap: 4px;
      margin-bottom: 20px;
      border-bottom: 2px solid var(--color-border);
    }
    .tab {
      padding: 8px 20px;
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      color: var(--color-muted);
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
      border-radius: 6px 6px 0 0;
      transition: .15s;
    }
    .tab.active { color: var(--color-primary); border-bottom-color: var(--color-primary); }
    .tab:hover:not(.active) { color: var(--color-text); background: var(--color-bg); }

    .toolbar {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }
    .search {
      padding: 8px 12px;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      font-size: 13px;
      background: var(--color-surface);
      color: var(--color-text);
    }
    .form-select {
      padding: 8px 10px;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      font-size: 13px;
      background: var(--color-surface);
      color: var(--color-text);
    }
    .count-label { font-size: 13px; color: var(--color-muted); margin-left: auto; }

    .table-wrapper { overflow-x: auto; border: 1px solid var(--color-border); border-radius: 10px; }
    table { border-collapse: collapse; width: 100%; background: var(--color-surface); }
    th {
      background: var(--color-bg);
      padding: 10px 14px;
      text-align: left;
      font-size: 12px;
      font-weight: 700;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: .5px;
      border-bottom: 1px solid var(--color-border);
    }
    td { padding: 10px 14px; font-size: 13px; color: var(--color-text); border-bottom: 1px solid var(--color-border); }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: var(--color-bg); }
    .icon-cell { font-size: 18px; width: 32px; }
    .name-cell { max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .empty-cell { text-align: center; color: var(--color-muted); padding: 28px; }
    .text-muted { color: var(--color-muted, #94a3b8); }

    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 5px;
      font-size: 11px;
      font-weight: 700;
    }
    .badge-code { background: #ede9fe; color: #6d28d9; }
    .badge-success { background: #dcfce7; color: #166534; }
    .badge-muted { background: #f1f5f9; color: #64748b; }
    .badge-embarque { background: #dbeafe; color: #1d4ed8; }
    .badge-fiscal   { background: #fef9c3; color: #854d0e; }
    .badge-aduana   { background: #fce7f3; color: #9d174d; }
    .badge-contrato { background: #ede9fe; color: #5b21b6; }
    .badge-outro    { background: #f1f5f9; color: #475569; }

    .btn-primary {
      background: var(--color-primary, #3b82f6);
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-primary:hover { opacity: .85; }
    .btn-secondary {
      background: var(--color-bg);
      color: var(--color-text);
      border: 1px solid var(--color-border);
      border-radius: 8px;
      padding: 8px 16px;
      font-size: 13px;
      cursor: pointer;
    }
    .btn-icon-sm {
      background: transparent;
      border: 1px solid var(--color-border);
      border-radius: 6px;
      padding: 3px 7px;
      cursor: pointer;
      font-size: 12px;
      margin-right: 3px;
    }
    .btn-icon-sm:hover { background: var(--color-bg); }
    .btn-icon-sm.btn-danger { color: var(--color-danger, #ef4444); border-color: var(--color-danger, #ef4444); }
    .btn-icon-sm.btn-danger:hover { background: #fef2f2; }

    /* Modal */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,.4);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .modal-box {
      background: var(--color-surface);
      border-radius: 12px;
      width: 480px;
      max-width: 95vw;
      box-shadow: 0 20px 60px rgba(0,0,0,.25);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid var(--color-border);
    }
    .modal-header h3 { margin: 0; font-size: 16px; font-weight: 700; }
    .btn-close {
      background: transparent;
      border: none;
      font-size: 18px;
      cursor: pointer;
      color: var(--color-muted);
      padding: 2px 6px;
      border-radius: 4px;
    }
    .btn-close:hover { background: var(--color-bg); }
    .modal-body { padding: 20px; }
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 14px 20px;
      border-top: 1px solid var(--color-border);
    }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .form-group { display: flex; flex-direction: column; gap: 4px; }
    .form-group.col-2 { grid-column: span 2; }
    .form-group label { font-size: 12px; font-weight: 600; color: var(--color-text-muted); }
    .form-control {
      border: 1px solid var(--color-border);
      border-radius: 6px;
      padding: 7px 10px;
      font-size: 13px;
      background: var(--color-surface);
      color: var(--color-text);
    }
    .form-error { color: var(--color-danger, #ef4444); font-size: 12px; margin-top: 10px; }
    /* ===== RESPONSIVE ===== */
    @media (max-width: 768px) {
      .tabs { overflow-x:auto; flex-wrap:nowrap; }
      .tab { flex-shrink:0; }
      .form-grid { grid-template-columns:1fr; }
      .form-group.col-2 { grid-column:1; }
      .count-label { margin-left:0; width:100%; }
    }
    @media (max-width: 480px) {
      .modal-box { max-width:calc(100vw - 24px); }
      .modal-body { padding:12px; }
      .modal-footer { padding:10px 12px; flex-wrap:wrap; }
      .modal-footer button { flex:1; }
      .page-title { font-size:18px; }
    }
  `]
})
export class DocumentosComponent implements OnInit {
  tab: TabType = 'tipos';

  // Tipos tab
  searchTipos = '';
  tipos: TipoDocumento[] = [];
  showModal = false;
  editId: string | null = null;
  form: { nome: string; codigo: string; categoria: CategoriaDocumento | ''; ativo: boolean } = this.emptyForm();
  formError = '';
  apiFieldErrors: Record<string, string[]> = {};

  // Todos tab
  searchTodos = '';
  filterCategoria: CategoriaFilter = '';
  todos: Documento[] = [];

  constructor(
    private tipoSvc: TipoDocumentoService,
    public svc: DocumentoService,
    private toast: ToastService,
    private confirmDialog: ConfirmDialogService,) {}

  ngOnInit(): void {
    this.loadTipos();
  }

  // ── Tipos ────────────────────────────────────────────────────────────────
  loadTipos(): void {
    this.tipos = this.tipoSvc.getAll();
  }

  get tiposFiltrados(): TipoDocumento[] {
    const q = this.searchTipos.toLowerCase().trim();
    if (!q) return this.tipos;
    return this.tipos.filter(t =>
      t.nome.toLowerCase().includes(q) || t.codigo.toLowerCase().includes(q)
    );
  }

  novoTipo(): void {
    this.editId = null;
    this.form = this.emptyForm();
    this.formError = '';
    this.apiFieldErrors = {};
    this.showModal = true;
  }

  editarTipo(t: TipoDocumento): void {
    this.editId = t.id;
    this.form = { nome: t.nome, codigo: t.codigo, categoria: t.categoria, ativo: t.ativo };
    this.formError = '';
    this.apiFieldErrors = {};
    this.showModal = true;
  }

  salvarTipo(): void {
    this.apiFieldErrors = {};
    if (!this.form.nome.trim() || !this.form.codigo.trim() || !this.form.categoria) {
      this.formError = 'Preencha todos os campos obrigatórios.';
      return;
    }
    const data: Omit<TipoDocumento, 'id'> = {
      nome: this.form.nome.trim(),
      codigo: this.form.codigo.trim().toUpperCase(),
      categoria: this.form.categoria as CategoriaDocumento,
      ativo: this.form.ativo
    };
    try {
      if (this.editId) {
        this.tipoSvc.update({ ...data, id: this.editId });
        this.toast.success('Tipo de documento atualizado com sucesso.');
      } else {
        this.tipoSvc.create(data);
        this.toast.success('Tipo de documento criado com sucesso.');
      }
    } catch (err: any) {
      this.apiFieldErrors = this.collectFieldErrors(err);
      this.formError = Object.keys(this.apiFieldErrors).length
        ? 'Corrija os campos destacados e tente novamente.'
        : (err?.message ?? 'Erro ao salvar tipo de documento.');
      return;
    }

    this.loadTipos();
    this.fecharModal();
  }

  async removerTipo(t: TipoDocumento): Promise<void> {
    const ok = await this.confirmDialog.confirm({
      title: 'Remover tipo de documento',
      message: `Remover o tipo "${t.nome}"?`,
      confirmText: 'Remover',
      cancelText: 'Cancelar',
      danger: true
    });
    if (!ok) return;

    this.tipoSvc.remove(t.id);
    this.loadTipos();
    this.toast.success('Tipo de documento removido com sucesso.');
  }

  fecharModal(): void {
    this.showModal = false;
    this.formError = '';
    this.apiFieldErrors = {};
  }

  // ── Todos os documentos ───────────────────────────────────────────────────
  loadTodos(): void {
    this.todos = this.svc.getAll();
  }

  get todosFiltrados(): Documento[] {
    let result = this.todos;
    const q = this.searchTodos.toLowerCase().trim();
    if (q) {
      result = result.filter(d => d.nomeOriginal.toLowerCase().includes(q));
    }
    if (this.filterCategoria) {
      const tiposIds = this.tipoSvc.getAll()
        .filter(t => t.categoria === this.filterCategoria)
        .map(t => t.id);
      result = result.filter(d => tiposIds.includes(d.tipoDocumentoId));
    }
    return result;
  }

  async removerDocumento(d: Documento): Promise<void> {
    const ok = await this.confirmDialog.confirm({
      title: 'Remover documento',
      message: `Remover o documento "${d.nomeOriginal}" e todos seus vinculos?`,
      confirmText: 'Remover',
      cancelText: 'Cancelar',
      danger: true
    });
    if (!ok) return;

    this.svc.removeDocumento(d.id);
    this.loadTodos();
    this.toast.success('Documento removido com sucesso.');
  }

  getTipo(d: Documento): TipoDocumento | undefined {
    return this.tipoSvc.getById(d.tipoDocumentoId);
  }

  catClass(cat: CategoriaDocumento): string {
    const map: Record<CategoriaDocumento, string> = {
      Embarque: 'badge-embarque',
      Fiscal:   'badge-fiscal',
      Aduana:   'badge-aduana',
      Contrato: 'badge-contrato',
      Outro:    'badge-outro',
    };
    return map[cat] ?? 'badge-outro';
  }

  getIcon(d: Documento): string {
    if (this.svc.isImagem(d)) return '🖼️';
    if (this.svc.isPdf(d))    return '📄';
    if (['xlsx','xls','csv'].includes(d.extensao)) return '📊';
    if (['docx','doc'].includes(d.extensao)) return '📝';
    return '📎';
  }

  private emptyForm(): { nome: string; codigo: string; categoria: CategoriaDocumento | ''; ativo: boolean } {
    return { nome: '', codigo: '', categoria: '', ativo: true };
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
