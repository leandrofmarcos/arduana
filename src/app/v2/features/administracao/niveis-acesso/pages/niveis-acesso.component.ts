import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NivelAcessoService } from '../services/nivel-acesso.service';
import { NivelAcesso } from '../models/nivel-acesso.models';
import { CRUD_STYLES } from '../../../../shared/styles/crud-page.styles';

@Component({
  selector: 'app-niveis-acesso',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: CRUD_STYLES,
  template: `
    <div class="container-standard">

      <div class="dashboard-header">
        <div>
          <h1>🔑 Níveis de Acesso</h1>
          <p class="subtitle">Hierarquia de permissões dos usuários do sistema</p>
        </div>
        <button class="btn btn-primary" (click)="openForm()">+ Novo Nível</button>
      </div>

      <!-- List -->
      <ng-container *ngIf="!showForm">
        <div class="content-section">
          <div class="toolbar">
            <input class="search" type="text" [(ngModel)]="q" placeholder="🔎 Buscar por nome ou descrição" />
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th style="width:80px;text-align:center">Ordem</th>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Status</th>
                <th style="width:100px">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="filtered.length === 0">
                <td colspan="5" class="empty-state">Nenhum nível de acesso cadastrado</td>
              </tr>
              <tr *ngFor="let n of filtered">
                <td style="text-align:center">
                  <span class="badge badge-muted">{{ n.ordem }}</span>
                </td>
                <td><strong>{{ n.nome }}</strong></td>
                <td>{{ n.descricao || '—' }}</td>
                <td>
                  <span [class]="n.ativo ? 'badge-active' : 'badge-inactive'">
                    {{ n.ativo ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>
                <td>
                  <div class="row-actions">
                    <button class="btn-icon" title="Editar" (click)="openForm(n)">✏️</button>
                    <button class="btn-icon danger" title="Excluir" (click)="remove(n.id)">🗑️</button>
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
          <h2>{{ editing ? 'Editar Nível de Acesso' : 'Novo Nível de Acesso' }}</h2>
          <p>{{ editing ? 'Atualize os dados do nível' : 'Preencha os dados do novo nível de acesso' }}</p>
        </div>
        <div class="card">
          <div class="form-grid">
            <div class="field w2">
              <label>Nome <span class="required">*</span></label>
              <input type="text" [(ngModel)]="form.nome" placeholder="Ex: Operacional"
                     [class.err]="showErrors && !form.nome.trim()" />
              <span class="err-msg" *ngIf="showErrors && !form.nome.trim()">Nome é obrigatório</span>
            </div>
            <div class="field">
              <label>Ordem <span class="required">*</span></label>
              <input type="number" [(ngModel)]="form.ordem" min="1" step="1" placeholder="1"
                     [class.err]="showErrors && form.ordem < 1" />
              <span class="err-msg" *ngIf="showErrors && form.ordem < 1">Ordem deve ser >= 1</span>
            </div>
            <div class="field w3">
              <label>Descrição</label>
              <input type="text" [(ngModel)]="form.descricao" placeholder="Ex: Operações do dia a dia" />
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
export class NiveisAcessoComponent implements OnInit {
  items: NivelAcesso[] = [];
  q = '';
  showForm = false;
  showErrors = false;
  editing: NivelAcesso | null = null;

  form = { nome: '', ordem: 1, descricao: '', ativo: true };

  constructor(private service: NivelAcessoService) {}

  ngOnInit(): void { this.load(); }

  load(): void { this.items = this.service.getAll(); }

  get filtered(): NivelAcesso[] {
    if (!this.q) return this.items;
    const s = this.q.toLowerCase();
    return this.items.filter(n =>
      n.nome.toLowerCase().includes(s) ||
      (n.descricao ?? '').toLowerCase().includes(s)
    );
  }

  openForm(item?: NivelAcesso): void {
    this.editing = item ?? null;
    this.showErrors = false;
    this.form = item
      ? { nome: item.nome, ordem: item.ordem, descricao: item.descricao, ativo: item.ativo }
      : { nome: '', ordem: (this.items.length > 0 ? Math.max(...this.items.map(i => i.ordem)) + 1 : 1), descricao: '', ativo: true };
    this.showForm = true;
  }

  cancel(): void { this.showForm = false; this.editing = null; }

  save(): void {
    this.showErrors = true;
    if (!this.form.nome.trim() || this.form.ordem < 1) return;
    const data: Omit<NivelAcesso, 'id'> = {
      nome: this.form.nome.trim(),
      ordem: Number(this.form.ordem),
      descricao: this.form.descricao.trim(),
      ativo: this.form.ativo
    };
    if (this.editing) {
      this.service.update({ ...this.editing, ...data });
    } else {
      this.service.create(data);
    }
    this.cancel();
    this.load();
  }

  remove(id: string): void {
    if (confirm('Deseja excluir este nível de acesso?')) {
      this.service.remove(id);
      this.load();
    }
  }
}
