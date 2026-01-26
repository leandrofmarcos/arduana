import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PacklistRecord, PacklistStatus } from '../models/packlist.models';
import { PacklistService } from '../services/packlist.service';
import { keys, readJSON, writeJSON } from '../data/storage.helper';

@Component({
  standalone: true,
  selector: 'app-packlist-detalhe',
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="page">
      <div class="header">
        <div>
          <h1>📦 Upload Packlist</h1>
          <p class="subtitle">{{ codigo || orcamentoId }} • Cliente: {{ cliente || '-' }}</p>
        </div>
        <button class="btn btn-secondary" (click)="voltar()">← Voltar</button>
      </div>

      <div class="content-wrapper">
        <!-- Upload Section -->
        <div class="upload-section">
          <div class="card">
            <div class="card-header">Selecione o arquivo do packlist</div>
            <div class="file-upload-area">
              <input 
                type="file" 
                #fileInput 
                (change)="onFileSelect($event)" 
                class="file-input"
                accept=".xlsx,.xls,.csv"
              />
              <label for="fileInput" class="file-upload-label" (click)="fileInput.click()">
                <div class="file-icon">📄</div>
                <div class="file-text">
                  <span class="file-main">{{ selectedFileName || 'Clique para selecionar arquivo' }}</span>
                  <span class="file-sub">ou arraste aqui (XLSX, XLS, CSV)</span>
                </div>
                <button type="button" class="btn btn-primary">Escolher arquivo</button>
              </label>
            </div>
            <div class="upload-actions" *ngIf="selectedFileName">
              <button class="btn btn-primary" (click)="salvar()" [disabled]="!selectedFile">Salvar packlist</button>
            </div>
          </div>
        </div>

        <!-- Preview Section -->
        <div class="preview-section">
          <div class="card">
            <div class="card-header">Pré-visualização dos itens</div>
            <div class="preview-info">
              <p>Um arquivo por orçamento. Pré-visualização em breve.</p>
            </div>
            <div class="preview-grid">
              <div class="preview-item">
                <div class="preview-icon">🔨</div>
                <div class="preview-text">Em construção</div>
              </div>
              <div class="preview-item">
                <div class="preview-icon">🔨</div>
                <div class="preview-text">Em construção</div>
              </div>
              <div class="preview-item">
                <div class="preview-icon">🔨</div>
                <div class="preview-text">Em construção</div>
              </div>
              <div class="preview-item">
                <div class="preview-icon">🔨</div>
                <div class="preview-text">Em construção</div>
              </div>
              <div class="preview-item">
                <div class="preview-icon">🔨</div>
                <div class="preview-text">Em construção</div>
              </div>
              <div class="preview-item">
                <div class="preview-icon">🔨</div>
                <div class="preview-text">Em construção</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `.page{padding:24px;max-width:1200px;margin:0 auto}`,
    `.header{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;background:#fff;padding:20px;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.08)}`,
    `.header h1{margin:0;font-size:24px;font-weight:700}`,
    `.subtitle{color:#6b7280;margin:4px 0 0;font-size:14px}`,
    `.btn{border:none;border-radius:8px;padding:10px 16px;font-weight:600;cursor:pointer;font-size:14px;transition:all 0.2s}`,
    `.btn-primary{background:#2563eb;color:#fff}`,
    `.btn-primary:hover:not(:disabled){background:#1d4ed8}`,
    `.btn-primary:disabled{background:#cbd5e1;cursor:not-allowed;opacity:0.6}`,
    `.btn-secondary{background:#e5e7eb;color:#111}`,
    `.btn-secondary:hover{background:#d1d5db}`,
    `.content-wrapper{display:flex;flex-direction:column;gap:24px}`,
    `.upload-section{display:flex;flex-direction:column;gap:16px}`,
    `.preview-section{display:flex;flex-direction:column;gap:16px}`,
    `.card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px}`,
    `.card-header{font-weight:700;font-size:14px;margin-bottom:16px;color:#111}`,
    `.file-upload-area{border:2px dashed #cbd5e1;border-radius:10px;padding:24px;text-align:center;background:#f8fafc;transition:all 0.2s}`,
    `.file-upload-area:hover{border-color:#3b82f6;background:#eff6ff}`,
    `.file-input{display:none}`,
    `.file-upload-label{display:flex;flex-direction:column;align-items:center;gap:12px;cursor:pointer}`,
    `.file-icon{font-size:48px}`,
    `.file-text{display:flex;flex-direction:column;gap:4px}`,
    `.file-main{font-weight:600;color:#111;font-size:15px}`,
    `.file-sub{color:#9ca3af;font-size:13px}`,
    `.info-section{display:flex;flex-direction:column;gap:12px;margin-bottom:16px}`,
    `.info-row{display:flex;justify-content:space-between;align-items:center;padding:10px 0}`,
    `.label{color:#6b7280;font-size:13px;font-weight:500}`,
    `.value{color:#111;font-weight:600;font-size:14px}`,
    `.upload-actions{display:flex;gap:8px;margin-top:16px;padding-top:16px;border-top:1px solid #f3f4f6}`,
    `.upload-actions .btn{flex:1}`,
    `.preview-info{color:#6b7280;font-size:13px;margin-bottom:16px;padding:12px;background:#f9fafb;border-radius:8px;border-left:3px solid #3b82f6}`,
    `.preview-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:16px}`,
    `.preview-item{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:20px;border:1px solid #e5e7eb;border-radius:10px;background:#f9fafb;text-align:center}`,
    `.preview-icon{font-size:32px}`,
    `.preview-text{font-size:12px;color:#6b7280;font-weight:500}`
  ]
})
export class PacklistDetalheComponent implements OnInit {
  @ViewChild('fileInput') fileInputRef?: ElementRef<HTMLInputElement>;
  
  detalhe: PacklistRecord | null = null;
  orcamentoId = '';
  cliente?: string;
  codigo?: string;
  selectedFile: File | null = null;
  selectedFileName = '';
  selectedFilePath = '';

  constructor(private route: ActivatedRoute, private router: Router, private service: PacklistService) {}

  ngOnInit(): void {
    this.route.params.subscribe(p => {
      this.orcamentoId = p['id'] || '';
      this.loadMeta();
      this.loadPacklist();
    });
  }

  private loadMeta(): void {
    if (!this.orcamentoId) return;
    const meta = readJSON<any>(keys.orcamento(this.orcamentoId));
    this.cliente = meta?.cliente || this.cliente;
    this.codigo = meta?.codigo || this.codigo || `ORC-${this.orcamentoId}`;
  }

  private loadPacklist(): void {
    if (!this.orcamentoId) return;
    this.detalhe = this.service.getByOrcamentoId(this.orcamentoId);
    if (this.detalhe) {
      this.cliente = this.detalhe.cliente || this.cliente;
      this.codigo = this.detalhe.codigo || this.codigo;
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (file) {
      const validTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv', 'application/x-csv'];
      const validExtensions = ['.xlsx', '.xls', '.csv'];
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      if (!validTypes.includes(file.type) && !validExtensions.includes(ext)) {
        alert('Apenas arquivos XLSX, XLS e CSV são permitidos.');
        this.selectedFile = null;
        this.selectedFileName = '';
        this.selectedFilePath = '';
        if (this.fileInputRef) {
          this.fileInputRef.nativeElement.value = '';
        }
        return;
      }
      
      this.selectedFile = file;
      this.selectedFileName = file.name;
      this.selectedFilePath = input.value || file.name;
    }
  }

  salvar(): void {
    if (!this.orcamentoId) return;
    if (!this.selectedFile) {
      alert('Selecione um arquivo para enviar.');
      return;
    }
    
    const nome = this.selectedFile.name;
    const caminho = this.selectedFilePath || nome;
    const now = new Date().toISOString();
    
    const saved = this.service.save({
      id: this.detalhe?.id,
      orcamentoId: this.orcamentoId,
      codigo: this.codigo,
      cliente: this.cliente,
      despachante: undefined,
      arquivoNome: nome,
      arquivoCaminho: caminho,
      status: 'concluido',
      enviadoEm: now,
      enviadoPor: undefined,
      itens: this.detalhe?.itens || []
    });
    
    this.updateOrcamentoHistory(nome, caminho, now);
    
    this.detalhe = saved;
    this.loadPacklist();
    this.selectedFile = null;
    this.selectedFileName = '';
    this.selectedFilePath = '';
    if (this.fileInputRef) {
      this.fileInputRef.nativeElement.value = '';
    }
    setTimeout(() => {
      this.router.navigate(['/orcamento', this.orcamentoId]);
    }, 500);
  }

  private updateOrcamentoHistory(nomeArquivo: string, caminhoArquivo: string, timestamp: string): void {
    const meta = readJSON<any>(keys.orcamento(this.orcamentoId));
    if (!meta) return;
    
    const historico = readJSON<any[]>(keys.history(this.orcamentoId)) || [];
    historico.push({
      at: timestamp,
      acao: 'PACKLIST_ENVIADO',
      usuario: 'Sistema',
      descricao: `Packlist enviado: ${nomeArquivo}`,
      arquivo: nomeArquivo,
      caminho: caminhoArquivo
    });
    writeJSON(keys.history(this.orcamentoId), historico);
  }

  formatStatus(status?: string): string {
    const map: Record<string, string> = {
      'concluido': 'Concluído',
      'em-andamento': 'Em Andamento',
      'pendente': 'Pendente'
    };
    return status ? (map[status] || '-') : '-';
  }

  voltar(): void {
    this.router.navigate(['/orcamento']);
  }
}
