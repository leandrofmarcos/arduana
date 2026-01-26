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
    // Não sobrescreve o nome se já foi preenchido
    if (!this.form.nome) {
      this.form.nome = templateData.nome || '';
    }
    this.showUploadModal = false;
  }

  save(): void {
    if (!this.form.nome.trim()) {
      alert('Por favor, preencha o nome do template');
      return;
    }

    if (!this.template || !this.template.config) {
      alert('Por favor, configure o template através do upload');
      return;
    }

    const toSave: TemplatePacklist = {
      ...this.template,
      nome: this.form.nome,
      descricao: this.form.descricao
    };

    this.storageService.save(toSave);
    this.saved.emit();
  }

  cancel(): void {
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
