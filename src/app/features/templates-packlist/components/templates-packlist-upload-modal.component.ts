import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TemplatePacklist, FilePreviewData, TemplatePacklistFieldMapping, TemplatePacklistConfig } from '../models/templates-packlist.models';
import { TemplatesPacklistParserService } from '../services/templates-packlist-parser.service';

@Component({
  selector: 'app-templates-packlist-upload-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './templates-packlist-upload-modal.component.html',
  styleUrls: ['./templates-packlist-upload-modal.component.scss']
})
export class TemplatesPacklistUploadModalComponent implements OnInit {
  @Input() templateToEdit: TemplatePacklist | null = null;
  @Output() complete = new EventEmitter<TemplatePacklist>();
  @Output() close = new EventEmitter<void>();

  currentStep = 1;
  preview: FilePreviewData | null = null;
  selectedFile: File | null = null;
  
  linhaInicio = 1;
  fieldMapping: TemplatePacklistFieldMapping = {};
  
  error: string | null = null;
  loading = false;

  columns: string[] = [];

  constructor(private parserService: TemplatesPacklistParserService) {}

  ngOnInit(): void {
    if (this.templateToEdit?.config) {
      this.linhaInicio = this.templateToEdit.config.linhaInicio;
      this.fieldMapping = { ...this.templateToEdit.config.fieldMapping };
    }
  }

  onFileSelect(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ['text/csv', 'application/vnd.ms-excel', 
                       'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                       'application/x-csv'];
    const validExts = ['.csv', '.xlsx', '.xls'];
    
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validTypes.includes(file.type) && !validExts.includes(ext)) {
      this.error = 'Arquivo inválido. Aceitos: CSV, XLSX, XLS';
      return;
    }

    this.selectedFile = file;
    this.error = null;
    this.loadPreview();
  }

  private loadPreview(): void {
    if (!this.selectedFile) return;

    this.loading = true;
    this.parserService.parseFile(this.selectedFile).then(
      (data) => {
        this.preview = data;
        this.currentStep = 1;
        this.generateColumns();
        this.loading = false;
      },
      (error) => {
        this.error = error.message;
        this.loading = false;
      }
    );
  }

  private generateColumns(): void {
    if (!this.preview) return;
    this.columns = Array.from({ length: this.preview.columnCount }, (_, i) => 
      String.fromCharCode(65 + i)
    );
  }

  nextStep(): void {
    if (this.currentStep === 1) {
      if (this.linhaInicio < 1) {
        this.error = 'Linha de início deve ser >= 1';
        return;
      }
      this.currentStep = 2;
    } else if (this.currentStep === 2) {
      this.validateMapping();
      if (!this.error) {
        this.currentStep = 3;
      }
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.error = null;
    }
  }

  private validateMapping(): void {
    const columns = Object.values(this.fieldMapping).filter(Boolean) as string[];
    const columnSet = new Set(columns);
    
    if (columns.length !== columnSet.size) {
      this.error = 'Uma coluna foi mapeada para múltiplos campos';
      return;
    }

    this.error = null;
  }

  confirm(): void {
    if (!this.selectedFile || !this.preview) return;

    const config: TemplatePacklistConfig = {
      linhaInicio: this.linhaInicio,
      fieldMapping: this.fieldMapping
    };

    // Converter arquivo para base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      
      const template: TemplatePacklist = {
        id: this.templateToEdit?.id || '',
        nome: this.templateToEdit?.nome || '', // Deixa vazio para preencher no formulário
        descricao: this.templateToEdit?.descricao,
        nomeArquivo: this.selectedFile!.name,
        fileContent: base64,
        config: config,
        dataCriacao: this.templateToEdit?.dataCriacao || new Date(),
        dataAtualizacao: new Date()
      };

      this.complete.emit(template);
    };
    reader.readAsDataURL(this.selectedFile);
  }

  cancel(): void {
    this.close.emit();
  }

  get previewLines(): string[][] {
    if (!this.preview) return [];
    return this.preview.lines.slice(0, 20);
  }

  get headerPreview(): string[] {
    if (this.preview && this.previewLines.length > 0) {
      return this.previewLines[this.linhaInicio - 1] || [];
    }
    return [];
  }

  get dataPreview(): string[][] {
    if (!this.preview) return [];
    return this.previewLines.slice(this.linhaInicio);
  }
}
