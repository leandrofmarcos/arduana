import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilePreviewData, FieldMapping, PacklistImportConfig } from '../models/packlist-mapping.models';
import { PacklistParserService } from '../services/packlist-parser.service';

@Component({
  standalone: true,
  selector: 'app-packlist-mapping-modal',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="onCancel()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="modal-header">
          <h2>Mapear Packlist</h2>
          <button class="close-btn" (click)="onCancel()">✕</button>
        </div>

        <!-- Content -->
        <div class="modal-body">
          <!-- Step 1: Select Header Line -->
          <div class="section" *ngIf="currentStep === 1">
            <h3>Passo 1: Definir linha de início dos dados</h3>
            <p class="help-text">O arquivo pode ter cabeçalho/logo nas primeiras linhas. Indique em qual linha efetivamente começam os dados.</p>
            
            <div class="form-group">
              <label>Linha de início (1-{{ preview?.lines?.length || 20 }}):</label>
              <input 
                type="number" 
                [(ngModel)]="config.headerLine" 
                min="1" 
                [max]="preview?.lines?.length || 20"
                class="input-field"
              />
            </div>

            <!-- Preview da linha selecionada -->
            <div class="preview-card" *ngIf="preview && config.headerLine > 0">
              <div class="preview-header">Preview - Linha {{ config.headerLine }}</div>
              <table class="preview-table">
                <tr>
                  <td *ngFor="let col of getHeaderColumns()" class="col-header">{{ col }}</td>
                </tr>
                <tr>
                  <td *ngFor="let val of getPreviewRow()" [class.empty]="!val">{{ val || '(vazio)' }}</td>
                </tr>
              </table>
            </div>
          </div>

          <!-- Step 2: Map Fields -->
          <div class="section" *ngIf="currentStep === 2">
            <h3>Passo 2: Mapear campos</h3>
            <p class="help-text">Selecione qual coluna corresponde a cada campo (cada coluna pode ser usada apenas uma vez).</p>

            <!-- Preview das primeiras 20 linhas -->
            <div class="preview-card">
              <div class="preview-header">Preview das primeiras 20 linhas (a partir da linha {{ config.headerLine }})</div>
              <div class="table-wrapper">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th class="line-num">#</th>
                      <th *ngFor="let col of getAvailableColumns()" [class.mapped]="isColumnMapped(col)">
                        {{ col }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let line of getPreviewLines(); let i = index">
                      <td class="line-num">{{ config.headerLine + i }}</td>
                      <td *ngFor="let col of getAvailableColumns()" [class.mapped]="isColumnMapped(col)">
                        {{ getColumnValue(line, col) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Form de mapeamento -->
            <div class="mapping-form">
              <div class="form-group">
                <label>Volumes (peças/unidades):</label>
                <select [(ngModel)]="config.fieldMapping.volumes" class="select-field">
                  <option [value]="undefined">-- Não mapeado --</option>
                  <option *ngFor="let col of getAvailableColumns()" [value]="col">
                    Coluna {{ col }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label>Peso Bruto (kg):</label>
                <select [(ngModel)]="config.fieldMapping.peso" class="select-field">
                  <option [value]="undefined">-- Não mapeado --</option>
                  <option *ngFor="let col of getAvailableColumns()" [value]="col">
                    Coluna {{ col }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label>CBM - Volume (m³):</label>
                <select [(ngModel)]="config.fieldMapping.cbm" class="select-field">
                  <option [value]="undefined">-- Não mapeado --</option>
                  <option *ngFor="let col of getAvailableColumns()" [value]="col">
                    Coluna {{ col }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label>Descrição Comercial:</label>
                <select [(ngModel)]="config.fieldMapping.descricao" class="select-field">
                  <option [value]="undefined">-- Não mapeado --</option>
                  <option *ngFor="let col of getAvailableColumns()" [value]="col">
                    Coluna {{ col }}
                  </option>
                </select>
              </div>

              <!-- Validação de mapeamento duplicado -->
              <div class="validation-message" *ngIf="mappingErrors.length > 0">
                <div class="error" *ngFor="let err of mappingErrors">
                  ⚠️ {{ err }}
                </div>
              </div>
            </div>
          </div>

          <!-- Step 3: Confirm -->
          <div class="section" *ngIf="currentStep === 3">
            <h3>Passo 3: Confirmar importação</h3>
            <p class="help-text">Revise a configuração antes de confirmar.</p>

            <div class="confirmation-card">
              <div class="conf-item">
                <strong>Linha de início:</strong> {{ config.headerLine }}
              </div>
              <div class="conf-item">
                <strong>Volumes:</strong> {{ config.fieldMapping.volumes || 'Não mapeado' }}
              </div>
              <div class="conf-item">
                <strong>Peso:</strong> {{ config.fieldMapping.peso || 'Não mapeado' }}
              </div>
              <div class="conf-item">
                <strong>CBM:</strong> {{ config.fieldMapping.cbm || 'Não mapeado' }}
              </div>
              <div class="conf-item">
                <strong>Descrição:</strong> {{ config.fieldMapping.descricao || 'Não mapeado' }}
              </div>
            </div>

            <p class="info-text">
              Serão importadas {{ preview?.lines?.length }} linhas de dados.<br/>
              Os dados serão armazenados no histórico do orçamento.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="prevStep()" *ngIf="currentStep > 1">
            ← Anterior
          </button>
          <button class="btn btn-secondary" (click)="onCancel()">
            Cancelar
          </button>
          <button class="btn btn-primary" (click)="nextStep()" *ngIf="currentStep < 3" [disabled]="!canProceed()">
            Próximo →
          </button>
          <button class="btn btn-success" (click)="onConfirm()" *ngIf="currentStep === 3" [disabled]="!canConfirm()">
            Importar Packlist
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }
    
    .modal-content {
      background: white;
      border-radius: 12px;
      width: 100%;
      max-width: 800px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    }
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
      border-bottom: 1px solid #e5e7eb;
      flex-shrink: 0;
    }
    
    .modal-header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
    }
    
    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #6b7280;
    }
    
    .close-btn:hover {
      color: #111;
    }
    
    .modal-body {
      padding: 24px;
      overflow-y: auto;
      flex: 1;
    }
    
    .section {
      margin-bottom: 24px;
    }
    
    .section h3 {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 700;
    }
    
    .help-text {
      color: #6b7280;
      font-size: 13px;
      margin: 8px 0 16px 0;
    }
    
    .form-group {
      margin-bottom: 16px;
    }
    
    .form-group label {
      display: block;
      font-weight: 500;
      margin-bottom: 6px;
      color: #111;
      font-size: 13px;
    }
    
    .input-field,
    .select-field {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 13px;
      font-family: inherit;
    }
    
    .input-field:focus,
    .select-field:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    .preview-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 12px;
      margin: 16px 0;
    }
    
    .preview-header {
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      margin-bottom: 8px;
    }
    
    .preview-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    
    .preview-table tr {
      border-bottom: 1px solid #e5e7eb;
    }
    
    .preview-table td {
      padding: 6px;
      border-right: 1px solid #e5e7eb;
    }
    
    .preview-table td:last-child {
      border-right: none;
    }
    
    .col-header {
      background: #eff6ff;
      font-weight: 600;
      color: #1e40af;
    }
    
    .empty {
      color: #d1d5db;
      font-style: italic;
    }
    
    .table-wrapper {
      max-height: 300px;
      overflow-y: auto;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      background: white;
    }
    
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    
    .data-table th,
    .data-table td {
      padding: 8px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
      border-right: 1px solid #e5e7eb;
    }
    
    .data-table th:last-child,
    .data-table td:last-child {
      border-right: none;
    }
    
    .data-table thead {
      background: #f3f4f6;
      position: sticky;
      top: 0;
      z-index: 10;
    }
    
    .data-table th {
      font-weight: 600;
      color: #111;
    }
    
    .data-table th.mapped {
      background: #dbeafe;
      color: #1e40af;
    }
    
    .data-table td.mapped {
      background: #eff6ff;
      font-weight: 500;
    }
    
    .line-num {
      width: 40px;
      text-align: center;
      color: #9ca3af;
      font-size: 11px;
      background: #f9fafb;
    }
    
    .mapping-form {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      margin: 16px 0;
    }
    
    .validation-message {
      margin-top: 12px;
      padding: 12px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 6px;
    }
    
    .validation-message .error {
      color: #dc2626;
      font-size: 13px;
      margin: 4px 0;
    }
    
    .confirmation-card {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 8px;
      padding: 16px;
      margin: 16px 0;
    }
    
    .conf-item {
      padding: 8px;
      font-size: 13px;
      border-bottom: 1px solid #bbf7d0;
    }
    
    .conf-item:last-child {
      border-bottom: none;
    }
    
    .info-text {
      color: #6b7280;
      font-size: 13px;
      margin: 16px 0 0 0;
    }
    
    .modal-footer {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      padding: 16px 24px;
      border-top: 1px solid #e5e7eb;
      flex-shrink: 0;
    }
    
    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      font-size: 13px;
      transition: all 0.2s;
    }
    
    .btn-primary {
      background: #3b82f6;
      color: white;
    }
    
    .btn-primary:hover:not(:disabled) {
      background: #2563eb;
    }
    
    .btn-primary:disabled {
      background: #cbd5e1;
      cursor: not-allowed;
      opacity: 0.5;
    }
    
    .btn-secondary {
      background: #e5e7eb;
      color: #111;
    }
    
    .btn-secondary:hover {
      background: #d1d5db;
    }
    
    .btn-success {
      background: #10b981;
      color: white;
    }
    
    .btn-success:hover:not(:disabled) {
      background: #059669;
    }
    
    .btn-success:disabled {
      background: #cbd5e1;
      cursor: not-allowed;
      opacity: 0.5;
    }
  `]
})
export class PacklistMappingModalComponent implements OnInit {
  @Input() file!: File;
  @Output() onMappingComplete = new EventEmitter<PacklistImportConfig>();
  @Output() onMappingCancelled = new EventEmitter<void>();

  currentStep = 1;
  preview: FilePreviewData | null = null;
  config: PacklistImportConfig = {
    headerLine: 1,
    fieldMapping: {}
  };
  mappingErrors: string[] = [];

  constructor(private parser: PacklistParserService) {}

  ngOnInit(): void {
    this.loadFilePreview();
  }

  private async loadFilePreview(): Promise<void> {
    try {
      this.preview = await this.parser.parseFile(this.file);
    } catch (error) {
      alert('Erro ao ler arquivo: ' + (error as any).message);
      this.onCancel();
    }
  }

  getHeaderColumns(): string[] {
    if (!this.preview || !this.preview.lines.length) return [];
    return Array.from({ length: this.preview.columnCount }, (_, i) => 
      this.parser.columnIndexToLetter(i)
    );
  }

  getAvailableColumns(): string[] {
    if (!this.preview) return [];
    return Array.from({ length: this.preview.columnCount }, (_, i) => 
      this.parser.columnIndexToLetter(i)
    );
  }

  getPreviewRow(): string[] {
    if (!this.preview || this.config.headerLine < 1) return [];
    const lineIndex = this.config.headerLine - 1;
    return this.preview.lines[lineIndex] || [];
  }

  getPreviewLines(): string[][] {
    if (!this.preview || this.config.headerLine < 1) return [];
    const startIndex = this.config.headerLine;
    return this.preview.lines.slice(startIndex, Math.min(startIndex + 20, this.preview.lines.length));
  }

  getColumnValue(line: string[], col: string): string {
    const idx = this.parser.columnLetterToIndex(col);
    return line[idx] || '';
  }

  isColumnMapped(col: string): boolean {
    const mapping = this.config.fieldMapping;
    return Object.values(mapping).includes(col);
  }

  validateMappingStep(): void {
    this.mappingErrors = [];
    const mapping = this.config.fieldMapping;
    const columns = Object.values(mapping).filter(Boolean) as string[];
    const columnSet = new Set(columns);

    if (columns.length !== columnSet.size) {
      this.mappingErrors.push('Uma coluna foi mapeada para múltiplos campos. Remova as duplicatas.');
    }
  }

  canProceed(): boolean {
    if (this.currentStep === 1) {
      return this.config.headerLine >= 1 && (this.preview?.lines.length || 0) >= this.config.headerLine;
    }
    if (this.currentStep === 2) {
      this.validateMappingStep();
      return this.mappingErrors.length === 0;
    }
    return true;
  }

  canConfirm(): boolean {
    return this.mappingErrors.length === 0;
  }

  nextStep(): void {
    if (this.canProceed()) {
      this.currentStep++;
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onCancel(): void {
    this.onMappingCancelled.emit();
  }

  onConfirm(): void {
    this.validateMappingStep();
    if (this.mappingErrors.length === 0) {
      this.onMappingComplete.emit(this.config);
    }
  }
}
