import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { take } from 'rxjs/operators';
import { ClientesService } from '../services/clientes.service';
import { Cliente } from '../models/cliente.models';
import { ClienteDetailComponent } from './cliente-detail.component';
import { TemplatesPacklistService } from '../../templates-packlist/services/templates-packlist.service';
import { TemplatePacklistListItem } from '../../templates-packlist/models/templates-packlist.models';
import { PageHeaderComponent } from '../../../core/layout/page-header.component';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ClienteDetailComponent, PageHeaderComponent],
  templateUrl: './clientes-list.component.html',
  styleUrls: ['./clientes-list.component.scss']
})
export class ClientesListComponent implements OnInit {
  clientes: Cliente[] = [];
  templates: TemplatePacklistListItem[] = [];
  selectedCliente: Cliente | null = null;
  isCreating = false;
  searchTerm = '';

  constructor(
    private service: ClientesService,
    private templatesService: TemplatesPacklistService
  ) {}

  ngOnInit(): void {
    this.loadClientes();
    this.loadTemplates();
  }

  loadClientes(): void {
    this.service.list$().subscribe(clientes => {
      this.clientes = clientes;
      console.log('Clientes carregados na lista:', clientes);
      
      // Verificar localStorage
      try {
        const stored = localStorage.getItem('import_costs_clients');
        console.log('Dados brutos do localStorage:', stored);
        if (stored) {
          const parsed = JSON.parse(stored);
          console.log('Clientes parseados do storage:', parsed);
        }
      } catch (e) {
        console.error('Erro ao ler localStorage:', e);
      }
    });
  }

  loadTemplates(): void {
    this.templatesService.list$().pipe(take(1)).subscribe(templates => {
      this.templates = templates;
    });
  }

  getTemplateName(templateId: string): string {
    const template = this.templates.find(t => t.id === templateId);
    return template ? template.nome : 'Template não encontrado';
  }

  createNew(): void {
    this.selectedCliente = null;
    this.isCreating = true;
  }

  selectCliente(cliente: Cliente): void {
    this.selectedCliente = cliente;
    this.isCreating = false;
  }

  deleteCliente(id: string): void {
    if (confirm('Deseja realmente excluir este cliente?')) {
      this.service.remove(id);
      this.loadClientes();
    }
  }

  onSaved(): void {
    this.selectedCliente = null;
    this.isCreating = false;
    this.loadClientes();
  }

  onCancelled(): void {
    this.selectedCliente = null;
    this.isCreating = false;
  }

  get filteredClientes(): Cliente[] {
    if (!this.searchTerm) return this.clientes;
    
    const term = this.searchTerm.toLowerCase();
    return this.clientes.filter(c => 
      (c.nome?.toLowerCase().includes(term) ?? false) || 
      (c.documento?.toLowerCase().includes(term) ?? false)
    );
  }
}
