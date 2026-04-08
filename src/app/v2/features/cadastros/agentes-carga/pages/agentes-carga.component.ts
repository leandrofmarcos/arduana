import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgenteCargaService } from '../services/agente-carga.service';
import { AgenteCarga } from '../models/agente-carga.models';
import { CRUD_STYLES } from '../../../../shared/styles/crud-page.styles';

@Component({
  selector: 'app-agentes-carga',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: CRUD_STYLES,
  template: `
    <div class="container-standard">

      <div class="dashboard-header">
        <div>
          <h1>🤝 Agentes de Carga</h1>
          <p class="subtitle">Freight forwarders e agentes internacionais de logística</p>
        </div>
        <button class="btn btn-primary" (click)="openForm()">+ Novo Agente</button>
      </div>

      <!-- List -->
      <ng-container *ngIf="!showForm">
        <div class="content-section">
          <div class="toolbar">
            <input class="search" type="text" [(ngModel)]="q" placeholder="🔎 Buscar por nome ou país" />
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Documento</th>
                <th>País</th>
                <th>Contato</th>
                <th>Status</th>
                <th style="width:100px">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="filtered.length === 0">
                <td colspan="6" class="empty-state">Nenhum agente de carga cadastrado</td>
              </tr>
              <tr *ngFor="let a of filtered">
                <td><strong>{{ a.nome }}</strong></td>
                <td><code>{{ a.documento || '—' }}</code></td>
                <td>{{ a.pais || '—' }}</td>
                <td>{{ a.contato || '—' }}</td>
                <td>
                  <span [class]="a.ativo ? 'badge-active' : 'badge-inactive'">
                    {{ a.ativo ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>
                <td>
                  <div class="row-actions">
                    <button class="btn-icon" title="Editar" (click)="openForm(a)">✏️</button>
                    <button class="btn-icon danger" title="Excluir" (click)="remove(a.id)">🗑️</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </ng-container>

      <!-- Form -->
      <ng-container *ngIf="showForm">
        <div class="detail-header">
          <h2>{{ editing ? 'Editar Agente de Carga' : 'Novo Agente de Carga' }}</h2>
          <p>{{ editing ? 'Atualize os dados do agente' : 'Preencha os dados do novo agente de carga' }}</p>
        </div>
        <div class="card">
          <div class="form-grid">
            <div class="field w2">
              <label>Nome <span class="required">*</span></label>
              <input type="text" [(ngModel)]="form.nome" placeholder="Ex: Sino-Brazil Freight Co."
                     [class.err]="showErrors && !form.nome.trim()" />
              <span class="err-msg" *ngIf="showErrors && !form.nome.trim()">Nome é obrigatório</span>
            </div>
            <div class="field">
              <label>Documento</label>
              <input type="text" [(ngModel)]="form.documento" placeholder="Ex: Tax ID / CNPJ" />
            </div>
            <div class="field w2">
              <label>País</label>
              <input type="text" [(ngModel)]="form.pais" placeholder="Ex: China" />
            </div>
            <div class="field w2">
              <label>Contato (e-mail / telefone)</label>
              <input type="text" [(ngModel)]="form.contato" placeholder="Ex: agent@freight.cn" />
            </div>
            <div class="field">
              <label>Status</label>
              <select [(ngModel)]="form.ativo">
                <option [ngValue]="true">Ativo</option>
                <option [ngValue]="false">Inativo</option>
              </select>
            </div>
          </div>
          <div class="actions">
            <button class="btn btn-primary" (click)="save()">💾 Salvar</button>
            <button class="btn btn-secondary" (click)="cancel()">✖️ Cancelar</button>
          </div>
        </div>
      </ng-container>

    </div>
  `
})
export class AgentesCargaComponent implements OnInit {
  items: AgenteCarga[] = [];
  q = '';
  showForm = false;
  showErrors = false;
  editing: AgenteCarga | null = null;

  form = { nome: '', documento: '', pais: '', contato: '', ativo: true };

  constructor(private service: AgenteCargaService) {}

  ngOnInit(): void { this.load(); }

  load(): void { this.items = this.service.getAll(); }

  get filtered(): AgenteCarga[] {
    if (!this.q) return this.items;
    const s = this.q.toLowerCase();
    return this.items.filter(a =>
      a.nome.toLowerCase().includes(s) ||
      (a.pais ?? '').toLowerCase().includes(s) ||
      (a.contato ?? '').toLowerCase().includes(s)
    );
  }

  openForm(item?: AgenteCarga): void {
    this.editing = item ?? null;
    this.showErrors = false;
    this.form = item
      ? { nome: item.nome, documento: item.documento, pais: item.pais, contato: item.contato, ativo: item.ativo }
      : { nome: '', documento: '', pais: '', contato: '', ativo: true };
    this.showForm = true;
  }

  cancel(): void { this.showForm = false; this.editing = null; }

  save(): void {
    this.showErrors = true;
    if (!this.form.nome.trim()) return;
    const data: Omit<AgenteCarga, 'id'> = { ...this.form, nome: this.form.nome.trim() };
    if (this.editing) {
      this.service.update({ ...this.editing, ...data });
    } else {
      this.service.create(data);
    }
    this.cancel();
    this.load();
  }

  remove(id: string): void {
    if (confirm('Deseja excluir este agente de carga?')) {
      this.service.remove(id);
      this.load();
    }
  }
}
