import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PacklistRecord } from '../models/packlist.models';
import { PacklistService } from '../services/packlist.service';
import { PacklistParserService } from '../services/packlist-parser.service';
import { PacklistImportConfig, ImportedPacklistItem, PacklistImportResult } from '../models/packlist-mapping.models';
import { keys, readJSON, writeJSON } from '../data/storage.helper';
import { ClientesService } from '../../clientes/services/clientes.service';
import { TemplatesPacklistService } from '../../templates-packlist/services/templates-packlist.service';
import { TemplatePacklist } from '../../templates-packlist/models/templates-packlist.models';

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
          <div class="template-info-badge" *ngIf="templateAssociado">
            <span class="badge-icon">📋</span>
            <span class="badge-text">Template: <strong>{{ templateAssociado.nome }}</strong></span>
          </div>
          <div class="no-template-badge" *ngIf="!templateAssociado && clienteId">
            <span class="badge-icon">ℹ️</span>
            <span class="badge-text">Cliente sem template</span>
          </div>
        </div>
        <button class="btn-close" (click)="voltar()" title="Fechar">✕</button>
      </div>

      <div class="alert alert-error" *ngIf="errorMessages.length > 0">
        <div class="alert-title">Erros na importação</div>
        <ul>
          <li *ngFor="let msg of errorMessages">{{ msg }}</li>
        </ul>
        <button class="alert-close" (click)="clearErrors()">✕</button>
      </div>

      <div class="content-wrapper">
        <!-- Upload Section -->
        <div class="upload-section">
          <div class="card">
            <div class="card-header">Selecione o arquivo do packlist</div>
            <div class="file-meta" *ngIf="(selectedFileName || detalhe)">
              <div><span class="meta-label">Arquivo:</span> {{ selectedFileName || detalhe?.arquivoNome || '-' }}</div>
              <div><span class="meta-label">Caminho:</span> {{ selectedFilePath || detalhe?.arquivoCaminho || '-' }}</div>
              <div><span class="meta-label">Cliente:</span> {{ cliente || '-' }}</div>
            </div>
            <div class="file-upload-area" [class.disabled-area]="isFinalizado">
              <input 
                type="file" 
                #fileInput 
                (change)="onFileSelect($event)" 
                class="file-input"
                accept=".xlsx,.xls,.csv"
                [disabled]="isFinalizado"
              />
              <label for="fileInput" class="file-upload-label" (click)="abrirArquivo(fileInput)">
                <div class="file-icon">📄</div>
                <div class="file-text">
                  <span class="file-main">{{ selectedFileName || 'Clique para selecionar arquivo' }}</span>
                  <span class="file-sub">ou arraste aqui (XLSX, XLS, CSV)</span>
                </div>
                <button type="button" class="btn btn-primary">Escolher arquivo</button>
              </label>
            </div>
            <div class="upload-actions">
              <button class="btn btn-secondary" (click)="voltar()">Cancelar</button>
              <button class="btn btn-secondary" (click)="salvarRascunho()" [disabled]="!selectedFile || isFinalizado">Salvar rascunho</button>
              <button class="btn btn-primary" (click)="finalizarPacklist()" [disabled]="isFinalizado">Finalizar packlist</button>
            </div>
          </div>
        </div>

        <!-- Preview Section (apenas quando há template e itens processados) -->
        <div class="preview-section" *ngIf="importedItems.length > 0 && templateAssociado">
          <div class="card">
            <div class="card-header">
              <span>📋 Preview dos dados importados</span>
              <span class="preview-count">{{ importedItems.length }} itens (amostra)</span>
            </div>
            <div class="preview-table-wrapper">
              <table class="preview-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Volumes</th>
                    <th>Peso (KG)</th>
                    <th>CBM (M³)</th>
                    <th>Descrição</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of importedItems; let i = index">
                    <td>{{ i + 1 }}</td>
                    <td>{{ item.volumes || '-' }}</td>
                    <td>{{ item.peso || '-' }}</td>
                    <td>{{ item.cbm || '-' }}</td>
                    <td>{{ item.descricao || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `.page{padding:24px;max-width:1200px;margin:0 auto}`,
    `.header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:24px;background:#fff;padding:20px;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.08)}`,
    `.header h1{margin:0;font-size:24px;font-weight:700}`,
    `.subtitle{color:#6b7280;margin:4px 0 0;font-size:14px}`,
    `.template-info-badge{display:inline-flex;align-items:center;gap:8px;margin-top:10px;padding:6px 10px;background:#f3f4f6;color:#374151;border:1px solid #e5e7eb;border-radius:999px;font-size:12px}`,
    `.template-info-badge .badge-icon{font-size:14px}`,
    `.template-info-badge .badge-text strong{font-weight:600}`,
    `.no-template-badge{display:inline-flex;align-items:center;gap:8px;margin-top:10px;padding:6px 10px;background:#f8fafc;color:#6b7280;border:1px dashed #e5e7eb;border-radius:999px;font-size:12px}`,
    `.btn{border:none;border-radius:8px;padding:10px 16px;font-weight:600;cursor:pointer;font-size:14px;transition:all 0.2s}`,
    `.btn-primary{background:#2563eb;color:#fff}`,
    `.btn-primary:hover:not(:disabled){background:#1d4ed8}`,
    `.btn-primary:disabled{background:#cbd5e1;cursor:not-allowed;opacity:0.6}`,
    `.btn-secondary{background:#e5e7eb;color:#111}`,
    `.btn-secondary:hover{background:#d1d5db}`,
    `.btn-close{background:transparent;border:none;color:#6b7280;font-size:18px;line-height:1;cursor:pointer;padding:6px 8px;border-radius:8px}`,
    `.btn-close:hover{background:#f3f4f6;color:#111}`,
    `.content-wrapper{display:flex;flex-direction:column;gap:24px}`,
    `.upload-section{display:flex;flex-direction:column;gap:16px}`,
    `.card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px}`,
    `.card-header{font-weight:700;font-size:14px;margin-bottom:16px;color:#111;display:flex;justify-content:space-between;align-items:center}`,
    `.file-upload-area{border:2px dashed #cbd5e1;border-radius:10px;padding:24px;text-align:center;background:#f8fafc;transition:all 0.2s}`,
    `.file-upload-area.disabled-area{opacity:.6;filter:grayscale(.2);pointer-events:none}`,
    `.file-upload-area:hover{border-color:#3b82f6;background:#eff6ff}`,
    `.file-input{display:none}`,
    `.file-meta{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:8px;padding:12px 14px;margin:0 0 12px;border:1px solid #e5e7eb;background:#f9fafb;border-radius:10px;font-size:13px;color:#374151}`,
    `.file-meta .meta-label{font-weight:700;margin-right:6px;color:#111}`,
    `.file-upload-label{display:flex;flex-direction:column;align-items:center;gap:12px;cursor:pointer}`,
    `.file-icon{font-size:48px}`,
    `.file-text{display:flex;flex-direction:column;gap:4px}`,
    `.file-main{font-weight:600;color:#111;font-size:15px}`,
    `.file-sub{color:#9ca3af;font-size:13px}`,
    `.upload-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px;padding-top:16px;border-top:1px solid #f3f4f6}`,
    `.upload-actions .btn{flex:1}`,
    `.alert{position:relative;border-radius:12px;padding:14px 16px 14px 16px;margin-bottom:16px;border:1px solid #fecdd3;background:linear-gradient(135deg,#fff1f2 0%,#ffe4e6 100%);color:#7f1d1d;box-shadow:0 6px 20px rgba(255,76,96,0.1)}`,
    `.alert-title{font-weight:700;margin-bottom:6px;font-size:14px;color:#991b1b}`,
    `.alert ul{margin:0;padding-left:18px;line-height:1.4}`,
    `.alert-close{position:absolute;top:10px;right:10px;background:transparent;border:none;color:#991b1b;font-size:14px;cursor:pointer;padding:4px}`,
    `.preview-section{margin-top:24px}`,
    `.preview-count{font-size:12px;color:#6b7280;font-weight:400}`,
    `.preview-table-wrapper{overflow-x:auto;margin-top:12px}`,
    `.preview-table{width:100%;border-collapse:collapse;font-size:13px}`,
    `.preview-table thead{background:#f9fafb;border-bottom:2px solid #e5e7eb}`,
    `.preview-table th{padding:10px 12px;text-align:left;font-weight:600;color:#374151}`,
    `.preview-table tbody tr{border-bottom:1px solid #f3f4f6}`,
    `.preview-table tbody tr:hover{background:#f9fafb}`,
    `.preview-table td{padding:10px 12px;color:#6b7280}`,
    `.preview-table td:first-child{color:#111;font-weight:600}`
  ]
})
export class PacklistDetalheComponent implements OnInit {
  @ViewChild('fileInput') fileInputRef?: ElementRef<HTMLInputElement>;
  @Input() orcamentoId = '';
  @Output() voltarClicked = new EventEmitter<void>();
  
  detalhe: PacklistRecord | null = null;
  cliente?: string;
  codigo?: string;
  clienteId?: string;
  templateAssociado: TemplatePacklist | null = null;
  selectedFile: File | null = null;
  selectedFileName = '';
  selectedFilePath = '';
  errorMessages: string[] = [];
  importedItems: ImportedPacklistItem[] = [];
  mappingConfig?: PacklistImportConfig;
  totalItems = 0;
  isFinalizado = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: PacklistService,
    private clientesService: ClientesService,
    private templatesService: TemplatesPacklistService,
    private parser: PacklistParserService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(p => {
      if (!this.orcamentoId) {
        this.orcamentoId = p['id'] || '';
      }
      this.loadMeta();
      this.loadPacklist();
    });
  }

  private loadMeta(): void {
    if (!this.orcamentoId) return;
    const meta = readJSON<any>(keys.orcamento(this.orcamentoId));
    this.cliente = meta?.cliente || this.cliente;
    this.codigo = meta?.codigo || this.codigo || `ORC-${this.orcamentoId}`;
    this.clienteId = meta?.clienteId;
    
    console.log('Meta do orçamento carregado:', meta);
    console.log('ClienteId do orçamento:', this.clienteId);
    
    // Carregar template associado ao cliente
    this.carregarTemplateDoCliente();
  }

  private carregarTemplateDoCliente(): void {
    if (!this.clienteId) {
      console.log('Orçamento sem cliente associado');
      return;
    }

    this.clientesService.list$().subscribe(clientes => {
      const cliente = clientes.find(c => c.id === this.clienteId);
      
      if (!cliente) {
        console.log('Cliente não encontrado:', this.clienteId);
        return;
      }

      console.log('Cliente encontrado:', cliente);
      console.log('Template ID do cliente:', cliente.templatePacklistId);

      if (cliente.templatePacklistId) {
        this.templatesService.getById$(cliente.templatePacklistId).subscribe(template => {
          this.templateAssociado = template;
          console.log('✅ Template packlist associado encontrado:', this.templateAssociado);
        });
      } else {
        console.log('ℹ️ Cliente não possui template packlist associado');
      }
    });
  }

  private loadPacklist(): void {
    if (!this.orcamentoId) return;
    this.detalhe = this.service.getByOrcamentoId(this.orcamentoId);
    if (this.detalhe) {
      this.cliente = this.detalhe.cliente || this.cliente;
      this.codigo = this.detalhe.codigo || this.codigo;
      this.selectedFileName = this.detalhe.arquivoNome || '';
      this.selectedFilePath = this.detalhe.arquivoCaminho || '';
      
      // Restaurar preview e mapping se existirem
      if (this.detalhe.previewItems && this.detalhe.previewItems.length > 0) {
        this.importedItems = this.detalhe.previewItems;
      }
      if (this.detalhe.mappingConfig) {
        this.mappingConfig = this.detalhe.mappingConfig;
      }
      if (typeof this.detalhe.totalItems === 'number') {
        this.totalItems = this.detalhe.totalItems;
      }
      this.isFinalizado = this.detalhe.status === 'concluido';
    }
  }

  onFileSelect(event: Event): void {
    if (this.isFinalizado) return;
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (file) {
      this.clearErrors();
      const validTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv', 'application/x-csv'];
      const validExtensions = ['.xlsx', '.xls', '.csv'];
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      if (!validTypes.includes(file.type) && !validExtensions.includes(ext)) {
        this.showErrors(['Apenas arquivos XLSX, XLS e CSV são permitidos.']);
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
      
      // Se existe template associado, processar automaticamente
      // Se NÃO existe template, apenas armazena o arquivo sem processar
      if (this.templateAssociado) {
        this.processarComTemplate(file);
      } else {
        console.log('ℹ️ Upload simples sem template - arquivo não será processado');
        this.importedItems = [];
        this.mappingConfig = undefined;
        this.totalItems = 0;
      }
    }
  }

  abrirArquivo(input: HTMLInputElement): void {
    if (this.isFinalizado) return;
    input.click();
  }

  private processarComTemplate(file: File): void {
    if (!this.templateAssociado) return;
    
    // Converter config do template para formato de importação
    const config: PacklistImportConfig = {
      headerLine: this.templateAssociado.config.linhaInicio || 2,
      fieldMapping: {
        volumes: this.templateAssociado.config.fieldMapping.volumes || 'A',
        peso: this.templateAssociado.config.fieldMapping.peso || 'B',
        cbm: this.templateAssociado.config.fieldMapping.cbm || 'C',
        descricao: this.templateAssociado.config.fieldMapping.descricaoComercial || 'D'
      }
    };
    
    console.log('🔄 Processando arquivo com template:', this.templateAssociado.nome);
    console.log('Config de mapeamento:', config);
    
    this.parser.processFile(file, config).then((result: PacklistImportResult) => {
      console.log('✅ Processamento concluído:', result);
      
      if (result.errors.length > 0) {
        this.showErrors(result.errors.map((e: { line: number; message: string }) => `Linha ${e.line}: ${e.message}`));
        this.importedItems = [];
        this.mappingConfig = undefined;
        this.totalItems = 0;
      } else {
        this.importedItems = result.items.slice(0, 10); // Preview de 10 itens
        this.mappingConfig = config;
        this.totalItems = result.items.length;
        console.log(`📋 Preview com ${this.importedItems.length} itens carregado`);
      }
    }).catch((err: Error) => {
      console.error('❌ Erro ao processar arquivo:', err);
      this.showErrors([`Erro ao processar arquivo: ${err.message || 'Erro desconhecido'}`]);
      this.importedItems = [];
      this.mappingConfig = undefined;
      this.totalItems = 0;
    });
  }

  salvarRascunho(): void {
    if (!this.orcamentoId) return;
    if (!this.selectedFile) {
      this.showErrors(['Selecione um arquivo para enviar.']);
      return;
    }
    // Permitir salvamento mesmo sem processamento (cliente sem template)
    
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
      status: 'em-andamento',
      enviadoEm: now,
      enviadoPor: undefined,
      itens: undefined,
      previewItems: this.importedItems.length > 0 ? this.importedItems : undefined,
      mappingConfig: this.mappingConfig,
      totalItems: this.totalItems || (this.importedItems?.length || 0)
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
    this.isFinalizado = saved.status === 'concluido';
    this.fecharAposSalvar();
  }

  finalizarPacklist(): void {
    if (!this.orcamentoId) return;
    if (this.isFinalizado) return;
    if (this.selectedFile) {
      this.salvarComStatus('concluido');
    } else if (this.detalhe) {
      const now = new Date().toISOString();
      const saved = this.service.save({
        ...this.detalhe,
        status: 'concluido',
        enviadoEm: this.detalhe.enviadoEm || now
      });
      this.updateOrcamentoHistory(this.detalhe.arquivoNome, this.detalhe.arquivoCaminho, now);
      this.detalhe = saved;
      this.isFinalizado = true;
      this.fecharAposSalvar();
    } else {
      const now = new Date().toISOString();
      const saved = this.service.save({
        id: undefined,
        orcamentoId: this.orcamentoId,
        codigo: this.codigo,
        cliente: this.cliente,
        despachante: undefined,
        arquivoNome: '',
        arquivoCaminho: '',
        status: 'concluido',
        enviadoEm: now,
        enviadoPor: undefined,
        itens: undefined,
        previewItems: undefined,
        mappingConfig: undefined,
        totalItems: 0
      });
      this.detalhe = saved;
      this.isFinalizado = true;
      this.fecharAposSalvar();
    }
  }

  private salvarComStatus(status: 'em-andamento' | 'concluido'): void {
    if (!this.selectedFile) return;
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
      status,
      enviadoEm: now,
      enviadoPor: undefined,
      itens: undefined,
      previewItems: this.importedItems.length > 0 ? this.importedItems : undefined,
      mappingConfig: this.mappingConfig,
      totalItems: this.totalItems || (this.importedItems?.length || 0)
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
    this.isFinalizado = saved.status === 'concluido';
    if (status === 'concluido') {
      this.fecharAposSalvar();
    }
  }

  private fecharAposSalvar(): void {
    if (this.voltarClicked.observed) {
      this.voltarClicked.emit();
    } else {
      setTimeout(() => {
        this.router.navigate(['/orcamento', this.orcamentoId]);
      }, 400);
    }
  }

  private updateOrcamentoHistory(
    nomeArquivo: string,
    caminhoArquivo: string,
    timestamp: string
  ): void {
    const meta = readJSON<any>(keys.orcamento(this.orcamentoId));
    if (!meta) return;
    
    const historico = readJSON<any[]>(keys.history(this.orcamentoId)) || [];
    historico.push({
      at: timestamp,
      acao: 'PACKLIST_ENVIADO',
      usuario: 'Sistema',
      descricao: `Packlist enviado: ${nomeArquivo}`,
      arquivo: nomeArquivo,
      caminho: caminhoArquivo,
      itemsCount: this.totalItems
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
    if (this.voltarClicked.observed) {
      this.voltarClicked.emit();
    } else {
      this.router.navigate(['/orcamento', this.orcamentoId]);
    }
  }

  showErrors(msgs: string[]): void {
    this.errorMessages = msgs.filter(Boolean);
  }

  clearErrors(): void {
    this.errorMessages = [];
  }
}
