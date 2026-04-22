import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentoService } from '../services/documento.service';
import { TipoDocumentoService } from '../services/tipo-documento.service';
import { DocumentoComVinculo, TipoDocumento } from '../models/documento.models';
import { AuthService } from '../../../../features/auth/auth.providers';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../../core/services/confirm-dialog.service';
import { ApiErrorMapper } from '../../../../core/api/error-handler/api-error.mapper';

@Component({
  selector: 'app-documento-anexo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="doc-widget">
      <!-- Header -->
      <div class="doc-header">
        <span class="doc-title">📎 Documentos Anexados ({{ docs.length }})</span>
        <button class="btn-sm btn-primary" (click)="showUpload = !showUpload">
          {{ showUpload ? '✕ Cancelar' : '+ Anexar Novo' }}
        </button>
      </div>

      <!-- Upload Form -->
      <div class="upload-form" *ngIf="showUpload">
        <div class="form-row">
          <div class="form-group">
            <label>Tipo de Documento *</label>
            <select [(ngModel)]="uploadTipoId" class="form-control">
              <option value="">Selecione...</option>
              <option *ngFor="let t of tiposAtivos" [value]="t.id">{{ t.codigo }} — {{ t.nome }}</option>
            </select>
            <div class="upload-error" *ngIf="hasApiFieldError('uploadTipoId', 'tipoDocumentoId', 'tipo')">{{ firstApiFieldError('uploadTipoId', 'tipoDocumentoId', 'tipo') }}</div>
          </div>
          <div class="form-group">
            <label>Arquivo *</label>
            <input
              type="file"
              #fileInput
              class="form-control"
              (change)="onFileSelected($event)"
              accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.xlsx,.xls,.docx,.doc,.txt,.csv"
            />
            <div class="upload-error" *ngIf="hasApiFieldError('arquivo', 'file', 'selectedFile')">{{ firstApiFieldError('arquivo', 'file', 'selectedFile') }}</div>
          </div>
        </div>
        <div class="form-group">
          <label>Observação</label>
          <input type="text" [(ngModel)]="uploadObs" class="form-control" placeholder="Opcional" />
        </div>
        <div class="form-group" *ngIf="selectedFile">
          <span class="file-info">
            📄 {{ selectedFile.name }} — {{ svc.formatarTamanho(selectedFile.size) }}
          </span>
        </div>
        <div class="upload-actions">
          <button class="btn-sm btn-success" (click)="anexar()" [disabled]="uploading || !selectedFile || !uploadTipoId">
            {{ uploading ? '⏳ Enviando...' : '✔ Confirmar Anexo' }}
          </button>
        </div>
        <div class="upload-error" *ngIf="uploadError">{{ uploadError }}</div>
      </div>

      <!-- Empty state -->
      <div class="empty-state" *ngIf="docs.length === 0 && !showUpload">
        <span>Nenhum documento anexado.</span>
      </div>

      <!-- Document list -->
      <div class="doc-list" *ngIf="docs.length > 0">
        <div class="doc-item" *ngFor="let doc of docs">
          <div class="doc-info">
            <span class="doc-icon">{{ getIcon(doc) }}</span>
            <div class="doc-meta">
              <span class="doc-name">{{ doc.nomeOriginal }}</span>
              <span class="doc-sub">
                <span class="badge badge-cat">{{ doc.tipoDocumentoCodigo }}</span>
                {{ svc.formatarTamanho(doc.tamanhoBytes) }}
                · {{ doc.dataUpload | date:'dd/MM/yyyy HH:mm' }}
                <span *ngIf="doc.observacao"> · {{ doc.observacao }}</span>
              </span>
            </div>
          </div>
          <div class="doc-actions">
            <button class="btn-icon" title="Baixar" (click)="svc.baixar(doc)">⬇</button>
            <button class="btn-icon btn-preview" title="Visualizar" (click)="preview(doc)"
              *ngIf="svc.isImagem(doc) || svc.isPdf(doc)">👁</button>
            <button class="btn-icon btn-danger" title="Remover" (click)="remover(doc)">✕</button>
          </div>
        </div>
      </div>

      <!-- Preview Modal -->
      <div class="modal-overlay" *ngIf="previewDoc" (click)="closePreview()">
        <div class="preview-modal" (click)="$event.stopPropagation()">
          <div class="preview-header">
            <span>{{ previewDoc.nomeOriginal }}</span>
            <button class="btn-icon" (click)="closePreview()">✕</button>
          </div>
          <div class="preview-body">
            <img *ngIf="svc.isImagem(previewDoc)" [src]="previewDoc.caminhoArquivo" class="preview-img" />
            <iframe *ngIf="svc.isPdf(previewDoc)" [src]="previewDoc.caminhoArquivo" class="preview-pdf"></iframe>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .doc-widget {
      border: 1px solid var(--color-border, #e2e8f0);
      border-radius: 10px;
      overflow: hidden;
      background: var(--color-surface, #fff);
    }
    .doc-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: var(--color-bg, #f8fafc);
      border-bottom: 1px solid var(--color-border, #e2e8f0);
    }
    .doc-title { font-weight: 600; font-size: 14px; color: var(--color-text, #1e293b); }
    .upload-form {
      padding: 16px;
      background: #f0f9ff;
      border-bottom: 1px solid var(--color-border, #e2e8f0);
    }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .form-group { display: flex; flex-direction: column; gap: 4px; margin-bottom: 10px; }
    .form-group label { font-size: 12px; font-weight: 600; color: var(--color-text-muted, #64748b); }
    .form-control {
      border: 1px solid var(--color-border, #cbd5e1);
      border-radius: 6px;
      padding: 6px 10px;
      font-size: 13px;
      background: #fff;
    }
    .file-info { font-size: 12px; color: var(--color-primary, #3b82f6); font-weight: 500; }
    .upload-actions { text-align: right; }
    .upload-error { color: var(--color-danger, #ef4444); font-size: 12px; margin-top: 6px; }
    .empty-state {
      padding: 24px;
      text-align: center;
      color: var(--color-muted, #94a3b8);
      font-size: 13px;
    }
    .doc-list { display: flex; flex-direction: column; }
    .doc-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 16px;
      border-bottom: 1px solid var(--color-border, #e2e8f0);
    }
    .doc-item:last-child { border-bottom: none; }
    .doc-info { display: flex; align-items: center; gap: 10px; min-width: 0; }
    .doc-icon { font-size: 20px; flex-shrink: 0; }
    .doc-meta { display: flex; flex-direction: column; min-width: 0; }
    .doc-name { font-size: 13px; font-weight: 600; color: var(--color-text, #1e293b); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .doc-sub { font-size: 11px; color: var(--color-muted, #94a3b8); display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
    .badge { display: inline-block; padding: 1px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; }
    .badge-cat { background: #dbeafe; color: #1d4ed8; }
    .doc-actions { display: flex; gap: 4px; flex-shrink: 0; }
    .btn-sm {
      padding: 5px 12px;
      border: none;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
      font-weight: 600;
    }
    .btn-primary { background: var(--color-primary, #3b82f6); color: #fff; }
    .btn-primary:hover { opacity: .85; }
    .btn-success { background: var(--color-success, #22c55e); color: #fff; }
    .btn-success:disabled { opacity: .5; cursor: not-allowed; }
    .btn-icon {
      background: transparent;
      border: 1px solid var(--color-border, #e2e8f0);
      border-radius: 6px;
      width: 28px;
      height: 28px;
      cursor: pointer;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .btn-icon:hover { background: var(--color-bg, #f8fafc); }
    .btn-danger { color: var(--color-danger, #ef4444); border-color: var(--color-danger, #ef4444); }
    .btn-danger:hover { background: #fef2f2; }
    .btn-preview { color: var(--color-primary, #3b82f6); border-color: var(--color-primary, #3b82f6); }
    /* Preview Modal */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,.55);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .preview-modal {
      background: #fff;
      border-radius: 12px;
      width: 90vw;
      max-width: 900px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .preview-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid var(--color-border, #e2e8f0);
      font-weight: 600;
      font-size: 14px;
    }
    .preview-body { flex: 1; overflow: auto; display: flex; align-items: center; justify-content: center; padding: 16px; }
    .preview-img { max-width: 100%; max-height: 70vh; border-radius: 6px; }
    .preview-pdf { width: 100%; height: 70vh; border: none; }
  `]
})
export class DocumentoAnexoComponent implements OnInit, OnChanges {
  @Input() entidade!: string;
  @Input() entidadeId!: string;

  docs: DocumentoComVinculo[] = [];
  tiposAtivos: TipoDocumento[] = [];

  showUpload = false;
  uploading = false;
  uploadTipoId = '';
  uploadObs = '';
  selectedFile: File | null = null;
  uploadError = '';
  previewDoc: DocumentoComVinculo | null = null;
  apiFieldErrors: Record<string, string[]> = {};

  constructor(
    public svc: DocumentoService,
    private tipoSvc: TipoDocumentoService,
    private auth: AuthService,
    private toast: ToastService,
    private confirmDialog: ConfirmDialogService,) {}

  ngOnInit(): void {
    this.tiposAtivos = this.tipoSvc.getAtivos();
    this.loadDocs();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['entidadeId'] && !changes['entidadeId'].firstChange) {
      this.loadDocs();
    }
  }

  loadDocs(): void {
    if (this.entidade && this.entidadeId) {
      this.docs = this.svc.getDocumentosByEntidade(this.entidade, this.entidadeId);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
    this.uploadError = '';
    this.apiFieldErrors = {};
  }

  async anexar(): Promise<void> {
    this.apiFieldErrors = {};
    if (!this.selectedFile || !this.uploadTipoId) return;

    const MAX_BYTES = 8 * 1024 * 1024; // 8 MB safety limit for localStorage
    if (this.selectedFile.size > MAX_BYTES) {
      this.uploadError = 'Arquivo muito grande. Limite: 8 MB.';
      return;
    }

    this.uploading = true;
    this.uploadError = '';
    try {
      await this.svc.uploadEVincular(
        this.selectedFile,
        this.uploadTipoId,
        this.auth.currentUser?.id ?? '0',
        this.entidade,
        this.entidadeId,
        undefined,
        this.uploadObs || undefined
      );
      this.loadDocs();
      this.showUpload = false;
      this.selectedFile = null;
      this.uploadTipoId = '';
      this.uploadObs = '';
      this.toast.success('Documento anexado com sucesso.');
    } catch (err: any) {
      this.apiFieldErrors = this.collectFieldErrors(err);
      this.uploadError = Object.keys(this.apiFieldErrors).length
        ? 'Corrija os campos destacados e tente novamente.'
        : 'Erro ao processar o arquivo.';
      this.toast.error(err?.message ?? 'Erro ao anexar documento.');
    } finally {
      this.uploading = false;
    }
  }

  async remover(doc: DocumentoComVinculo): Promise<void> {
    const ok = await this.confirmDialog.confirm({
      title: 'Remover documento anexado',
      message: `Remover o documento "${doc.nomeOriginal}"?`,
      confirmText: 'Remover',
      cancelText: 'Cancelar',
      danger: true
    });
    if (!ok) return;

    this.svc.desvincular(doc.vinculoId);
    this.svc.removeDocumento(doc.id);
    this.loadDocs();
    this.toast.success('Documento removido com sucesso.');
  }

  preview(doc: DocumentoComVinculo): void {
    this.previewDoc = doc;
  }

  closePreview(): void {
    this.previewDoc = null;
  }

  getIcon(doc: DocumentoComVinculo): string {
    if (this.svc.isImagem(doc)) return '🖼️';
    if (this.svc.isPdf(doc))    return '📄';
    const xlsExts = ['xlsx', 'xls', 'csv'];
    if (xlsExts.includes(doc.extensao)) return '📊';
    const wordExts = ['docx', 'doc'];
    if (wordExts.includes(doc.extensao)) return '📝';
    return '📎';
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
