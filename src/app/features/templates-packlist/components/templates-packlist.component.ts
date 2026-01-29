import { Component, OnInit, OnDestroy } from '@angular/core';
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
  isCreating = false;
  searchTerm = '';

  constructor(private service: TemplatesPacklistService) {}

  ngOnInit(): void {
    this.loadTemplates();
  }

  loadTemplates(): void {
    this.templates = this.service.getAll();
    console.log('Templates carregados:', this.templates);
    console.log('LocalStorage raw:', localStorage.getItem('templates_packlist'));
  }

  newTemplate(): void {
    this.isCreating = true;
    this.selectedTemplate = null;
  }

  selectTemplate(template: TemplatePacklistListItem): void {
    this.selectedTemplate = this.service.getById(template.id);
  }

  onSaveTemplate(): void {
    this.isCreating = false;
    this.selectedTemplate = null;
    this.loadTemplates();
  }

  onCancelTemplate(): void {
    this.isCreating = false;
    this.selectedTemplate = null;
  }

  deleteTemplate(id: string): void {
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
