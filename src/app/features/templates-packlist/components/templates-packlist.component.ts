import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TemplatesPacklistService } from '../services/templates-packlist.service';
import { TemplatePacklistListItem } from '../models/templates-packlist.models';
import { TemplatesPacklistDetailComponent } from './templates-packlist-detail.component';
import { PageHeaderComponent } from '../../../core/layout/page-header.component';

@Component({
  selector: 'app-templates-packlist',
  standalone: true,
  imports: [CommonModule, FormsModule, TemplatesPacklistDetailComponent, PageHeaderComponent],
  templateUrl: './templates-packlist.component.html',
  styleUrls: ['./templates-packlist.component.scss']
})
export class TemplatesPacklistComponent implements OnInit {
  templates: TemplatePacklistListItem[] = [];
  selectedTemplate: any = null;
  showModal = false;
  searchTerm = '';

  constructor(private service: TemplatesPacklistService) {}

  ngOnInit(): void {
    this.loadTemplates();
  }

  loadTemplates(): void {
    this.templates = this.service.getAll();
  }

  abrirNovoTemplate(): void {
    this.showModal = true;
    this.selectedTemplate = null;
  }

  abrirEditar(template: TemplatePacklistListItem): void {
    this.showModal = true;
    this.selectedTemplate = this.service.getById(template.id);
  }

  fecharModal(): void {
    this.showModal = false;
    this.selectedTemplate = null;
  }

  onSaveTemplate(): void {
    this.fecharModal();
    this.loadTemplates();
  }

  onCancelTemplate(): void {
    this.fecharModal();
  }

  deleteTemplate(id: string, event: Event): void {
    event.preventDefault();
    if (confirm('Deseja realmente deletar este template?')) {
      this.service.delete(id);
      this.loadTemplates();
    }
  }

  get filteredTemplates(): TemplatePacklistListItem[] {
    if (!this.searchTerm) return this.templates;
    
    const term = this.searchTerm.toLowerCase();
    return this.templates.filter(t => 
      t.nome.toLowerCase().includes(term) || 
      (t.descricao?.toLowerCase().includes(term) ?? false)
    );
  }
}
