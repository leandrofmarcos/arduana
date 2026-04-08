import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PortoOrigemService } from '../services/porto-origem.service';
import { PortoOrigem } from '../models/porto-origem.models';
import { CRUD_STYLES } from '../../../../shared/styles/crud-page.styles';

@Component({
  selector: 'app-portos-origem',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: CRUD_STYLES,
  template: `
    <div class="container-standard">

      <!-- Header -->
      <div class="dashboard-header">
        <div>
          <h1>🌐 Portos de Origem</h1>
          <p class="subtitle">Portos de embarque das mercadorias importadas</p>
        </div>
        <button class="btn btn-primary" (click)="openForm()">+ Novo Porto</button>
      </div>

      <!-- List -->
      <ng-container *ngIf="!showForm">
        <div class="content-section">
          <div class="toolbar">
            <input class="search" type="text" [(ngModel)]="q" placeholder="🔎 Buscar por nome, código ou país" />
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Código</th>
                <th>País</th>
                <th>Status</th>
                <th style="width:100px">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="filtered.length === 0">
                <td colspan="5" class="empty-state">Nenhum porto de origem cadastrado</td>
              </tr>
              <tr *ngFor="let p of filtered">
                <td><strong>{{ p.nome }}</strong></td>
                <td><code>{{ p.codigo }}</code></td>
                <td>{{ p.pais }}</td>
                <td>
                  <span [class]="p.ativo ? 'badge-active' : 'badge-inactive'">
                    {{ p.ativo ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>
                <td>
                  <div class="row-actions">
                    <button class="btn-icon" title="Editar" (click)="openForm(p)">✏️</button>
                    <button class="btn-icon danger" title="Excluir" (click)="remove(p.id)">🗑️</button>
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
          <h2>{{ editing ? 'Editar Porto de Origem' : 'Novo Porto de Origem' }}</h2>
          <p>{{ editing ? 'Atualize as informações do porto' : 'Preencha os dados do novo porto de origem' }}</p>
        </div>
        <div class="card">
          <div class="form-grid">
            <div class="field w2">
              <label>Nome do Porto <span class="required">*</span></label>
              <input type="text" [(ngModel)]="form.nome" placeholder="Ex: Porto de Shangai"
                     [class.err]="showErrors && !form.nome.trim()" />
              <span class="err-msg" *ngIf="showErrors && !form.nome.trim()">Nome é obrigatório</span>
            </div>
            <div class="field">
              <label>Código <span class="required">*</span></label>
              <input type="text" [(ngModel)]="form.codigo" placeholder="Ex: SHA"
                     [class.err]="showErrors && !form.codigo.trim()" />
              <span class="err-msg" *ngIf="showErrors && !form.codigo.trim()">Código é obrigatório</span>
            </div>
            <div class="field w2">
              <label>País <span class="required">*</span></label>
              <input type="text" [(ngModel)]="form.pais" placeholder="Ex: China"
                     [class.err]="showErrors && !form.pais.trim()" />
              <span class="err-msg" *ngIf="showErrors && !form.pais.trim()">País é obrigatório</span>
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
export class PortosOrigemComponent implements OnInit {
  items: PortoOrigem[] = [];
  q = '';
  showForm = false;
  showErrors = false;
  editing: PortoOrigem | null = null;

  form = { nome: '', codigo: '', pais: '', ativo: true };

  constructor(private service: PortoOrigemService) {}

  ngOnInit(): void { this.load(); }

  load(): void { this.items = this.service.getAll(); }

  get filtered(): PortoOrigem[] {
    if (!this.q) return this.items;
    const s = this.q.toLowerCase();
    return this.items.filter(p =>
      p.nome.toLowerCase().includes(s) ||
      p.codigo.toLowerCase().includes(s) ||
      p.pais.toLowerCase().includes(s)
    );
  }

  openForm(item?: PortoOrigem): void {
    this.editing = item ?? null;
    this.showErrors = false;
    this.form = item
      ? { nome: item.nome, codigo: item.codigo, pais: item.pais, ativo: item.ativo }
      : { nome: '', codigo: '', pais: '', ativo: true };
    this.showForm = true;
  }

  cancel(): void {
    this.showForm = false;
    this.editing = null;
  }

  save(): void {
    this.showErrors = true;
    if (!this.form.nome.trim() || !this.form.codigo.trim() || !this.form.pais.trim()) return;

    if (this.editing) {
      this.service.update({ ...this.editing, ...this.form });
    } else {
      this.service.create(this.form);
    }
    this.cancel();
    this.load();
  }

  remove(id: string): void {
    if (confirm('Deseja excluir este porto de origem?')) {
      this.service.remove(id);
      this.load();
    }
  }
}
