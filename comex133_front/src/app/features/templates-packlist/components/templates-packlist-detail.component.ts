import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TemplatePacklist } from '../models/templates-packlist.models';
import { TemplatesPacklistParserService } from '../services/templates-packlist-parser.service';
import { TemplatesPacklistService } from '../services/templates-packlist.service';
import { TemplatesPacklistUploadModalComponent } from './templates-packlist-upload-modal.component';

@Component({
  selector: 'app-templates-packlist-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, TemplatesPacklistUploadModalComponent],
  templateUrl: './templates-packlist-detail.component.html',
  styleUrls: ['./templates-packlist-detail.component.scss']
})
export class TemplatesPacklistDetailComponent implements OnInit {
  @Input() template: TemplatePacklist | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  form = {
    nome: '',
    descricao: ''
  };

  showUploadModal = false;
  isEditMode = false;
  validationError = '';

  constructor(
    private parserService: TemplatesPacklistParserService,
    private storageService: TemplatesPacklistService
  ) {}

  ngOnInit(): void {
    if (this.template) {
      this.isEditMode = true;
      this.form.nome = this.template.nome;
      this.form.descricao = this.template.descricao || '';
    }
  }

  openUploadModal(): void {
    this.showUploadModal = true;
  }

  onUploadModalClose(): void {
    this.showUploadModal = false;
  }

  onUploadComplete(templateData: TemplatePacklist): void {
    this.template = templateData;
    if (!this.form.nome) {
      this.form.nome = templateData.nome || '';
    }
    this.showUploadModal = false;
    this.validationError = '';
  }

  save(): void {
    this.validationError = '';

    // Validação: nome obrigatório
    if (!this.form.nome || !this.form.nome.trim()) {
      this.validationError = 'Nome do template é obrigatório';
      return;
    }

    // Validação: template precisa ter configuração
    if (!this.template || !this.template.config) {
      this.validationError = 'Configure o template através do upload de arquivo';
      return;
    }

    // Validação: arquivo deve ter sido enviado
    if (!this.template.nomeArquivo) {
      this.validationError = 'Arquivo de template é obrigatório';
      return;
    }

    // Validação: mapeamento deve ter pelo menos um campo
    const fieldMapping = this.template.config?.fieldMapping;
    if (!fieldMapping || Object.keys(fieldMapping).length === 0) {
      this.validationError = 'Configure pelo menos um mapeamento de coluna';
      return;
    }

    // Validação: linha de início válida
    if (!this.template.config?.linhaInicio || this.template.config.linhaInicio < 1) {
      this.validationError = 'Linha de início deve ser >= 1';
      return;
    }

    const toSave = {
      nome: this.form.nome.trim(),
      descricao: this.form.descricao?.trim() || '',
      nomeArquivo: this.template.nomeArquivo,
      config: {
        linhaInicio: this.template.config.linhaInicio,
        fieldMapping: { ...this.template.config.fieldMapping }
      }
    };

    try {
      if (this.isEditMode && this.template.id) {
        this.storageService.update(this.template.id, toSave);
      } else {
        this.storageService.create(toSave);
      }
      this.saved.emit();
    } catch (error) {
      this.validationError = 'Erro ao salvar template';
      console.error('Erro ao salvar:', error);
    }
  }

  cancel(): void {
    this.validationError = '';
    this.cancelled.emit();
  }

  get hasConfig(): boolean {
    return !!(this.template && this.template.config);
  }

  get columnLabels(): { [key: string]: string } {
    if (!this.template?.config?.fieldMapping) return {};
    
    const mapping = this.template.config.fieldMapping;
    return {
      '#': mapping.numeroSequencial || '—',
      'Volumes': mapping.volumes || '—',
      'Peso': mapping.peso || '—',
      'CBM': mapping.cbm || '—',
      'Descrição': mapping.descricaoComercial || '—'
    };
  }
}
