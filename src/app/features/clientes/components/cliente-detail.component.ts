import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Cliente } from '../models/cliente.models';
import { ClientesService } from '../services/clientes.service';
import { TemplatesPacklistService } from '../../templates-packlist/services/templates-packlist.service';
import { TemplatePacklistListItem } from '../../templates-packlist/models/templates-packlist.models';

@Component({
  selector: 'app-cliente-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cliente-detail.component.html',
  styleUrls: ['./cliente-detail.component.scss']
})
export class ClienteDetailComponent implements OnInit {
  @Input() cliente: Cliente | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  form = {
    nome: '',
    documento: '',
    contato: '',
    templatePacklistId: ''
  };

  templates: TemplatePacklistListItem[] = [];
  showErrors = false;

  constructor(
    private service: ClientesService,
    private templatesService: TemplatesPacklistService
  ) {}

  ngOnInit(): void {
    this.loadTemplates();
    
    if (this.cliente) {
      this.form = {
        nome: this.cliente.nome || '',
        documento: this.cliente.documento || '',
        contato: this.cliente.contato || '',
        templatePacklistId: this.cliente.templatePacklistId || ''
      };
    }
  }

  loadTemplates(): void {
    this.templates = this.templatesService.getAll();
  }

  save(): void {
    this.showErrors = true;

    if (!this.form.nome.trim() || !this.form.documento.trim()) {
      return;
    }

    const dataToSave = {
      nome: this.form.nome.trim(),
      documento: this.form.documento.trim(),
      contato: this.form.contato.trim(),
      templatePacklistId: this.form.templatePacklistId || undefined
    };

    console.log('Salvando cliente com dados:', dataToSave);

    if (this.cliente) {
      // Atualizar cliente existente
      this.service.update(this.cliente.id, dataToSave);
      console.log('Cliente atualizado:', this.cliente.id);
    } else {
      // Criar novo cliente
      const novoId = this.service.create(
        this.form.nome.trim(),
        this.form.documento.trim(),
        this.form.contato.trim(),
        this.form.templatePacklistId || undefined
      );
      console.log('Novo cliente criado com ID:', novoId);
    }

    this.saved.emit();
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
