import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CargoService } from '../services/cargo.service';
import { Cargo } from '../models/cargo.models';
import { CRUD_STYLES } from '../../../../shared/styles/crud-page.styles';
import { ToastService } from '../../../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-cargos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: CRUD_STYLES,
  template: `
    <div class="container-standard">

      <div class="dashboard-header">
        <div>
          <h1>🎖️ Cargos</h1>
          <p class="subtitle">Cargos e funções dos colaboradores cadastrados no sistema</p>
        </div>
        <button class="btn btn-primary" (click)="openForm()">+ Novo Cargo</button>
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
                <th>Nome</th>
                <th>Descrição</th>
                <th>Status</th>
                <th style="width:100px">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="filtered.length === 0">
                <td colspan="4" class="empty-state">Nenhum cargo cadastrado</td>
              </tr>
              <tr *ngFor="let c of filtered">
                <td><strong>{{ c.nome }}</strong></td>
                <td>{{ c.descricao || '—' }}</td>
                <td>
                  <span [class]="c.ativo ? 'badge-active' : 'badge-inactive'">
                    {{ c.ativo ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>
                <td>
                  <div class="row-actions">
                    <button class="btn-icon" title="Editar" (click)="openForm(c)">✏️</button>
                    <button class="btn-icon danger" title="Excluir" (click)="remove(c.id)">🗑️</button>
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
          <h2>{{ editing ? 'Editar Cargo' : 'Novo Cargo' }}</h2>
          <p>{{ editing ? 'Atualize os dados do cargo' : 'Preencha os dados do novo cargo' }}</p>
        </div>
        <div class="card">
          <div class="form-grid">
            <div class="field w2">
              <label>Nome <span class="required">*</span></label>
              <input type="text" [(ngModel)]="form.nome" placeholder="Ex: Despachante"
                     [class.err]="showErrors && !form.nome.trim()" />
              <span class="err-msg" *ngIf="showErrors && !form.nome.trim()">Nome é obrigatório</span>
            </div>
            <div class="field w2">
              <label>Descrição</label>
              <input type="text" [(ngModel)]="form.descricao" placeholder="Ex: Operador de despacho aduaneiro" />
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
export class CargosComponent implements OnInit {
  items: Cargo[] = [];
  q = '';
  showForm = false;
  showErrors = false;
  editing: Cargo | null = null;

  form = { nome: '', descricao: '', ativo: true };

  constructor(
    private service: CargoService,
    private toast: ToastService,
    private confirmDialog: ConfirmDialogService
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void { this.items = this.service.getAll(); }

  get filtered(): Cargo[] {
    if (!this.q) return this.items;
    const s = this.q.toLowerCase();
    return this.items.filter(c =>
      c.nome.toLowerCase().includes(s) ||
      (c.descricao ?? '').toLowerCase().includes(s)
    );
  }

  openForm(item?: Cargo): void {
    this.editing = item ?? null;
    this.showErrors = false;
    this.form = item
      ? { nome: item.nome, descricao: item.descricao, ativo: item.ativo }
      : { nome: '', descricao: '', ativo: true };
    this.showForm = true;
  }

  cancel(): void { this.showForm = false; this.editing = null; }

  save(): void {
    this.showErrors = true;
    if (!this.form.nome.trim()) return;
    const data: Omit<Cargo, 'id'> = { ...this.form, nome: this.form.nome.trim() };
    if (this.editing) {
      this.service.update({ ...this.editing, ...data });
      this.toast.success('Cargo atualizado com sucesso.');
    } else {
      this.service.create(data);
      this.toast.success('Cargo criado com sucesso.');
    }
    this.cancel();
    this.load();
  }

  async remove(id: string): Promise<void> {
    const ok = await this.confirmDialog.confirm({
      title: 'Excluir cargo',
      message: 'Deseja excluir este cargo?',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      danger: true
    });
    if (!ok) return;

    this.service.remove(id);
    this.load();
    this.toast.success('Cargo removido com sucesso.');
  }
}
