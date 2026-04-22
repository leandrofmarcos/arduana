import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoleService } from '../services/role.service';
import { Role } from '../models/role.models';
import { CRUD_STYLES } from '../../../../shared/styles/crud-page.styles';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: CRUD_STYLES,
  template: `
    <div class="container-standard">

      <div class="dashboard-header">
        <div>
          <h1>🛡️ Roles</h1>
          <p class="subtitle">Administração de perfis de acesso do sistema</p>
        </div>
        <button class="btn btn-primary" (click)="openForm()">+ Nova Role</button>
      </div>

      <ng-container *ngIf="!showForm">
        <div class="content-section">
          <div class="toolbar">
            <input class="search" type="text" [(ngModel)]="q" placeholder="🔎 Buscar por nome ou descrição" />
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Criado em</th>
                <th style="width:100px">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="filtered.length === 0">
                <td colspan="4" class="empty-state">Nenhuma role cadastrada</td>
              </tr>
              <tr *ngFor="let r of filtered">
                <td><strong>{{ r.nome }}</strong></td>
                <td>{{ r.descricao || '—' }}</td>
                <td>{{ formatDate(r.criadoEm) }}</td>
                <td>
                  <div class="row-actions">
                    <button class="btn-icon" title="Editar" (click)="openForm(r)">✏️</button>
                    <button class="btn-icon danger" title="Excluir" (click)="remove(r.id)">🗑️</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </ng-container>

      <ng-container *ngIf="showForm">
        <div class="detail-header">
          <h2>{{ editing ? 'Editar Role' : 'Nova Role' }}</h2>
          <p>{{ editing ? 'Atualize os dados da role' : 'Preencha os dados da nova role' }}</p>
        </div>
        <div class="card">
          <div class="form-grid">
            <div class="field w2">
              <label>Nome <span class="required">*</span></label>
              <input
                type="text"
                [(ngModel)]="form.nome"
                placeholder="Ex: Admin"
                [class.err]="showErrors && !form.nome.trim()"
              />
              <span class="err-msg" *ngIf="showErrors && !form.nome.trim()">Nome é obrigatório</span>
            </div>
            <div class="field w3">
              <label>Descrição</label>
              <input type="text" [(ngModel)]="form.descricao" placeholder="Ex: Perfil com acesso total ao sistema" />
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
export class RolesComponent implements OnInit {
  items: Role[] = [];
  q = '';
  showForm = false;
  showErrors = false;
  editing: Role | null = null;

  form = { nome: '', descricao: '' };

  constructor(private service: RoleService) {}

  ngOnInit(): void { this.load(); }

  load(): void { this.items = this.service.getAll(); }

  get filtered(): Role[] {
    if (!this.q) return this.items;
    const s = this.q.toLowerCase();
    return this.items.filter(r =>
      r.nome.toLowerCase().includes(s) ||
      (r.descricao ?? '').toLowerCase().includes(s)
    );
  }

  openForm(item?: Role): void {
    this.editing = item ?? null;
    this.showErrors = false;
    this.form = item
      ? { nome: item.nome, descricao: item.descricao ?? '' }
      : { nome: '', descricao: '' };
    this.showForm = true;
  }

  cancel(): void {
    this.showForm = false;
    this.editing = null;
  }

  save(): void {
    this.showErrors = true;
    if (!this.form.nome.trim()) return;

    if (this.editing) {
      this.service.update({
        ...this.editing,
        nome: this.form.nome.trim(),
        descricao: this.form.descricao.trim() || undefined
      });
    } else {
      this.service.create({
        nome: this.form.nome.trim(),
        descricao: this.form.descricao.trim() || undefined
      });
    }

    this.cancel();
    this.load();
  }

  remove(id: string): void {
    if (confirm('Deseja excluir esta role?')) {
      this.service.remove(id);
      this.load();
    }
  }

  formatDate(value?: string): string {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('pt-BR');
  }
}
