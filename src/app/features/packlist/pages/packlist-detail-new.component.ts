import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PacklistRecord, PacklistStatus } from '../models/packlist.models';
import { PacklistService } from '../services/packlist.service';
import { PacklistParserService } from '../services/packlist-parser.service';
import { PacklistMappingModalComponent } from '../components/packlist-mapping-modal.component';
import { PacklistImportConfig, ImportedPacklistItem } from '../models/packlist-mapping.models';
import { keys, readJSON, writeJSON } from '../data/storage.helper';
import { ClientesService } from '../../clientes/services/clientes.service';
import { TemplatesPacklistService } from '../../templates-packlist/services/templates-packlist.service';
import { TemplatePacklist } from '../../templates-packlist/models/templates-packlist.models';

@Component({
  standalone: true,
  selector: 'app-packlist-detalhe',
  imports: [CommonModule, RouterModule, FormsModule, PacklistMappingModalComponent],
  template: `
    <div class="page">
      <div class="header">
        <div>
          <h1>📦 Upload Packlist</h1>
          <p class="subtitle">{{ codigo || orcamentoId }} • Cliente: {{ cliente || '-' }}</p>
          <div class="template-info-badge" *ngIf="templateAssociado">
            <span class="badge-icon">📋</span>
            <span class="badge-text">Template: <strong>{{ templateAssociado.nome }}</strong></span>
            <span class="badge-auto">Mapeamento Automático</span>
          </div>
          <div class="no-template-badge" *ngIf="!templateAssociado && clienteId">
            <span class="badge-icon">ℹ️</span>
            <span class="badge-text">Cliente sem template - Mapeamento manual necessário</span>
          </div>
        </div>
        <button class="btn btn-secondary" (click)="voltar()">← Voltar</button>
      </div>

      <div class="alert alert-error" *ngIf="errorMessages.length > 0">
        <div class="alert-title">Erros na importação</div>
        <ul>
          <li *ngFor="let msg of errorMessages">{{ msg }}</li>
        </ul>
        <button class="alert-close" (click)="clearErrors()">✕</button>
      </div>

      <!-- Mapping Modal -->
      <app-packlist-mapping-modal
        *ngIf="showMappingModal"
        [file]="selectedFile!"
        (onMappingComplete)="onMappingComplete($event)"
        (onMappingCancelled)="onMappingCancelled()"
      ></app-packlist-mapping-modal>

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
            <div class="upload-actions" *ngIf="importedItems.length > 0">
              <button class="btn btn-primary" (click)="salvar()" [disabled]="!selectedFile">Salvar packlist</button>
            </div>
          </div>
        </div>

        <!-- Preview Section -->
        <div class="preview-section">
          <div class="card">
            <div class="card-header">
              Pré-visualização dos itens importados
              <span class="items-count" *ngIf="importedItems.length > 0">
                {{ importedItems.length }} itens no total • Mostrando {{ previewItems.length }} primeiros
              </span>
            </div>
            <div class="preview-info" *ngIf="importedItems.length === 0">
              <p>Faça upload de um arquivo para visualizar os itens.</p>
            </div>
            <div class="items-table" *ngIf="importedItems.length > 0">
              <table class="table">
                <thead>
                  <tr>
                    <th>Linha</th>
                    <th>Volumes</th>
                    <th>Peso (kg)</th>
                    <th>CBM (m³)</th>
                    <th>Descrição</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of previewItems">
                    <td class="line-num">{{ item.lineNumber }}</td>
                    <td>{{ item.volumes || '-' }}</td>
                    <td>{{ item.peso || '-' }}</td>
                    <td>{{ item.cbm || '-' }}</td>
                    <td class="desc">{{ item.descricao || '-' }}</td>
                  </tr>
                </tbody>
              </table>
              <div class="items-info">Total: {{ importedItems.length }} itens importados</div>
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
    `.template-info-badge{display:inline-flex;align-items:center;gap:8px;margin-top:12px;padding:8px 14px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;border-radius:20px;font-size:13px}`,
    `.template-info-badge .badge-icon{font-size:16px}`,
    `.template-info-badge .badge-text strong{font-weight:700}`,
    `.template-info-badge .badge-auto{margin-left:8px;padding:2px 8px;background:rgba(255,255,255,0.25);border-radius:10px;font-size:11px;font-weight:600}`,
    `.no-template-badge{display:inline-flex;align-items:center;gap:8px;margin-top:12px;padding:8px 14px;background:#f3f4f6;color:#6b7280;border:2px dashed #d1d5db;border-radius:20px;font-size:13px}`,
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
    `.card-header{font-weight:700;font-size:14px;margin-bottom:16px;color:#111;display:flex;justify-content:space-between;align-items:center}`,
    `.items-count{font-size:12px;font-weight:500;color:#6b7280;background:#f3f4f6;padding:4px 10px;border-radius:12px}`,
    `.file-upload-area{border:2px dashed #cbd5e1;border-radius:10px;padding:24px;text-align:center;background:#f8fafc;transition:all 0.2s}`,
    `.file-upload-area:hover{border-color:#3b82f6;background:#eff6ff}`,
    `.file-input{display:none}`,
    `.file-meta{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:8px;padding:12px 14px;margin:0 0 12px;border:1px solid #e5e7eb;background:#f9fafb;border-radius:10px;font-size:13px;color:#374151}`,
    `.file-meta .meta-label{font-weight:700;margin-right:6px;color:#111}`,
    `.file-upload-label{display:flex;flex-direction:column;align-items:center;gap:12px;cursor:pointer}`,
    `.file-icon{font-size:48px}`,
    `.file-text{display:flex;flex-direction:column;gap:4px}`,
    `.file-main{font-weight:600;color:#111;font-size:15px}`,
    `.file-sub{color:#9ca3af;font-size:13px}`,
    `.upload-actions{display:flex;gap:8px;margin-top:16px;padding-top:16px;border-top:1px solid #f3f4f6}`,
    `.upload-actions .btn{flex:1}`,
    `.preview-info{color:#6b7280;font-size:13px;margin-bottom:16px;padding:12px;background:#f9fafb;border-radius:8px;border-left:3px solid #3b82f6}`,
    `.items-table{margin-top:12px}`,
    `.table{width:100%;border-collapse:collapse;font-size:13px}`,
    `.table th{background:#f3f4f6;font-weight:600;padding:10px;text-align:left;border-bottom:2px solid #e5e7eb}`,
    `.table td{padding:10px;border-bottom:1px solid #e5e7eb}`,
    `.table td.line-num{background:#f9fafb;color:#9ca3af;text-align:center;width:50px;font-weight:500}`,
    `.table td.desc{color:#6b7280;font-size:12px}`,
    `.items-info{margin-top:12px;padding:8px 12px;background:#eff6ff;border-left:3px solid #3b82f6;color:#1e40af;font-size:12px;border-radius:4px}`,
    `.alert{position:relative;border-radius:12px;padding:14px 16px 14px 16px;margin-bottom:16px;border:1px solid #fecdd3;background:linear-gradient(135deg,#fff1f2 0%,#ffe4e6 100%);color:#7f1d1d;box-shadow:0 6px 20px rgba(255,76,96,0.1)}`,
    `.alert-title{font-weight:700;margin-bottom:6px;font-size:14px;color:#991b1b}`,
    `.alert ul{margin:0;padding-left:18px;line-height:1.4}`,
    `.alert-close{position:absolute;top:10px;right:10px;background:transparent;border:none;color:#991b1b;font-size:14px;cursor:pointer;padding:4px}`
  ]
})
export class PacklistDetalheComponent implements OnInit {
  @ViewChild('fileInput') fileInputRef?: ElementRef<HTMLInputElement>;
  
  detalhe: PacklistRecord | null = null;
  orcamentoId = '';
  cliente?: string;
  codigo?: string;
  clienteId?: string;
  templateAssociado: TemplatePacklist | null = null;
  selectedFile: File | null = null;
  selectedFileName = '';
  selectedFilePath = '';
  showMappingModal = false;
  importedItems: ImportedPacklistItem[] = [];
  mappingConfig: PacklistImportConfig | null = null;
  errorMessages: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: PacklistService,
    private parser: PacklistParserService,
    private clientesService: ClientesService,
    private templatesService: TemplatesPacklistService
  ) {}

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
        this.templateAssociado = this.templatesService.getById(cliente.templatePacklistId);
        console.log('✅ Template packlist associado encontrado:', this.templateAssociado);
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
      if (this.detalhe.previewItems && this.detalhe.previewItems.length > 0) {
        this.importedItems = this.detalhe.previewItems as ImportedPacklistItem[];
      }
      if (this.detalhe.mappingConfig) {
        this.mappingConfig = this.detalhe.mappingConfig as PacklistImportConfig;
      }
    }
  }

  onFileSelect(event: Event): void {
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
        this.importedItems = [];
        this.mappingConfig = null;
        if (this.fileInputRef) {
          this.fileInputRef.nativeElement.value = '';
        }
        return;
      }
      
      this.selectedFile = file;
      this.selectedFileName = file.name;
      this.selectedFilePath = input.value || file.name;
      
      // Se tem template associado, processar automaticamente
      if (this.templateAssociado) {
        console.log('🚀 Processando arquivo automaticamente com template:', this.templateAssociado.nome);
        this.processarComTemplate(file);
      } else {
        console.log('📋 Abrindo modal de mapeamento manual');
        this.showMappingModal = true;
      }
    }
  }

  async processarComTemplate(file: File): Promise<void> {
    if (!this.templateAssociado) return;

    try {
      // Criar config a partir do template
      const config: PacklistImportConfig = {
        headerLine: this.templateAssociado.config.linhaInicio,
        fieldMapping: {
          volumes: this.templateAssociado.config.fieldMapping.volumes 
            ? this.templateAssociado.config.fieldMapping.volumes 
            : undefined,
          peso: this.templateAssociado.config.fieldMapping.peso 
            ? this.templateAssociado.config.fieldMapping.peso 
            : undefined,
          cbm: this.templateAssociado.config.fieldMapping.cbm 
            ? this.templateAssociado.config.fieldMapping.cbm 
            : undefined,
          descricao: this.templateAssociado.config.fieldMapping.descricaoComercial 
            ? this.templateAssociado.config.fieldMapping.descricaoComercial 
            : undefined
        }
      };

      console.log('Config gerado do template:', config);

      const result = await this.parser.processFile(file, config);
      
      if (result.errors.length > 0) {
        const errorMsg = result.errors.map(e => `Linha ${e.line}: ${e.message}`).join('\n');
        console.warn('Erros na importação:', result.errors);
        this.showErrors(errorMsg.split('\n'));
        this.importedItems = [];
        this.mappingConfig = null;
        return; // não prosseguir nem habilitar salvar
      }
      
      this.mappingConfig = config;
      this.importedItems = result.items;
      
      console.log(`✅ ${result.items.length} itens processados com sucesso usando template`);
      
    } catch (error) {
      console.error('Erro ao processar com template:', error);
      this.showErrors(['Erro ao processar arquivo com template: ' + (error as any).message]);
    }
  }

  async onMappingComplete(config: PacklistImportConfig): Promise<void> {
    if (!this.selectedFile) return;

    try {
      const result = await this.parser.processFile(this.selectedFile, config);
      
      if (result.errors.length > 0) {
        const errorMsg = result.errors.map(e => `Linha ${e.line}: ${e.message}`).join('\n');
        this.showErrors(errorMsg.split('\n'));
        this.importedItems = [];
        this.mappingConfig = null;
        return; // não prosseguir nem habilitar salvar
      }
      
      this.mappingConfig = config;
      this.importedItems = result.items;
      this.showMappingModal = false;
    } catch (error) {
      this.showErrors(['Erro ao processar arquivo: ' + (error as any).message]);
    }
  }

  onMappingCancelled(): void {
    this.showMappingModal = false;
    this.selectedFile = null;
    this.selectedFileName = '';
    this.selectedFilePath = '';
    this.importedItems = [];
    this.mappingConfig = null;
    if (this.fileInputRef) {
      this.fileInputRef.nativeElement.value = '';
    }
  }

  salvar(): void {
    if (!this.orcamentoId) return;
    if (!this.selectedFile) {
      this.showErrors(['Selecione um arquivo para enviar.']);
      return;
    }
    
    if (this.importedItems.length === 0) {
      this.showErrors(['Nenhum item foi mapeado. Revise a configuração.']);
      return;
    }
    if (this.errorMessages.length > 0) {
      // bloqueia salvamento se houver erros pendentes
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
      itens: this.importedItems as any,
      previewItems: this.importedItems,
      mappingConfig: this.mappingConfig || undefined
    });
    
    this.updateOrcamentoHistory(nome, caminho, now, this.mappingConfig || undefined);
    
    this.detalhe = saved;
    this.loadPacklist();
    this.selectedFile = null;
    this.selectedFileName = '';
    this.selectedFilePath = '';
    this.importedItems = [];
    this.mappingConfig = null;
    if (this.fileInputRef) {
      this.fileInputRef.nativeElement.value = '';
    }
    setTimeout(() => {
      this.router.navigate(['/orcamento', this.orcamentoId]);
    }, 500);
  }

  private updateOrcamentoHistory(
    nomeArquivo: string,
    caminhoArquivo: string,
    timestamp: string,
    config?: PacklistImportConfig
  ): void {
    const meta = readJSON<any>(keys.orcamento(this.orcamentoId));
    if (!meta) return;
    
    const historico = readJSON<any[]>(keys.history(this.orcamentoId)) || [];
    historico.push({
      at: timestamp,
      acao: 'PACKLIST_ENVIADO',
      usuario: 'Sistema',
      descricao: `Packlist enviado: ${nomeArquivo} (${this.importedItems.length} itens)`,
      arquivo: nomeArquivo,
      caminho: caminhoArquivo,
      itemsCount: this.importedItems.length,
      mappingConfig: config,
      items: this.importedItems
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

  get previewItems(): ImportedPacklistItem[] {
    return this.importedItems.slice(0, 10);
  }

  get totalItems(): number {
    return this.importedItems.length;
  }

  showErrors(msgs: string[]): void {
    this.errorMessages = msgs.filter(Boolean);
  }

  clearErrors(): void {
    this.errorMessages = [];
  }
}
