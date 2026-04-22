import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FabricanteService } from '../services/fabricante.service';
import { Fabricante } from '../models/fabricante.models';
import { CRUD_STYLES } from '../../../../shared/styles/crud-page.styles';
import { ToastService } from '../../../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-fabricantes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: CRUD_STYLES,
  template: `
    <div class="container-standard">

      <div class="dashboard-header">
        <div>
          <h1>🏭 Fabricantes</h1>
          <p class="subtitle">Fabricantes e produtores vinculados às mercadorias importadas</p>
        </div>
        <button class="btn btn-primary" (click)="openForm()">+ Novo Fabricante</button>
      </div>

      <!-- List -->
      <ng-container *ngIf="!showForm">
        <div class="content-section">
          <div class="toolbar">
            <input class="search" type="text" [(ngModel)]="q" placeholder="🔎 Buscar por nome, país ou cidade" />
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>País</th>
                <th>Cidade</th>
                <th>Contato</th>
                <th>Status</th>
                <th style="width:100px">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="filtered.length === 0">
                <td colspan="6" class="empty-state">Nenhum fabricante cadastrado</td>
              </tr>
              <tr *ngFor="let f of filtered">
                <td><strong>{{ f.nome }}</strong></td>
                <td>{{ f.pais || '—' }}</td>
                <td>{{ f.cidade || '—' }}</td>
                <td>{{ f.contato || '—' }}</td>
                <td>
                  <span [class]="f.ativo ? 'badge-active' : 'badge-inactive'">
                    {{ f.ativo ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>
                <td>
                  <div class="row-actions">
                    <button class="btn-icon" title="Editar" (click)="openForm(f)">✏️</button>
                    <button class="btn-icon danger" title="Excluir" (click)="remove(f.id)">🗑️</button>
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
          <h2>{{ editing ? 'Editar Fabricante' : 'Novo Fabricante' }}</h2>
          <p>{{ editing ? 'Atualize os dados do fabricante' : 'Preencha os dados do novo fabricante' }}</p>
        </div>
        <div class="card">
          <div class="form-grid">
            <div class="field w2">
              <label>Nome <span class="required">*</span></label>
              <input type="text" [(ngModel)]="form.nome" placeholder="Ex: Shenzhen Electronics Ltd."
                     [class.err]="showErrors && !form.nome.trim()" />
              <span class="err-msg" *ngIf="showErrors && !form.nome.trim()">Nome é obrigatório</span>
            </div>
            <div class="field w2">
              <label>País</label>
              <input type="text" [(ngModel)]="form.pais" placeholder="Ex: China" />
            </div>
            <div class="field">
              <label>Cidade</label>
              <input type="text" [(ngModel)]="form.cidade" placeholder="Ex: Shenzhen" />
            </div>
            <div class="field w2">
              <label>Contato</label>
              <input type="text" [(ngModel)]="form.contato" placeholder="Ex: contact@factory.cn" />
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
export class FabricantesComponent implements OnInit {
  items: Fabricante[] = [];
  q = '';
  showForm = false;
  showErrors = false;
  editing: Fabricante | null = null;

  form = { nome: '', pais: '', cidade: '', contato: '', ativo: true };

  constructor(
    private service: FabricanteService,
    private toast: ToastService,
    private confirmDialog: ConfirmDialogService
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void { this.items = this.service.getAll(); }

  get filtered(): Fabricante[] {
    if (!this.q) return this.items;
    const s = this.q.toLowerCase();
    return this.items.filter(f =>
      f.nome.toLowerCase().includes(s) ||
      (f.pais ?? '').toLowerCase().includes(s) ||
      (f.cidade ?? '').toLowerCase().includes(s)
    );
  }

  openForm(item?: Fabricante): void {
    this.editing = item ?? null;
    this.showErrors = false;
    this.form = item
      ? { nome: item.nome, pais: item.pais, cidade: item.cidade, contato: item.contato, ativo: item.ativo }
      : { nome: '', pais: '', cidade: '', contato: '', ativo: true };
    this.showForm = true;
  }

  cancel(): void { this.showForm = false; this.editing = null; }

  save(): void {
    this.showErrors = true;
    if (!this.form.nome.trim()) return;
    const data: Omit<Fabricante, 'id'> = { ...this.form, nome: this.form.nome.trim() };
    if (this.editing) {
      this.service.update({ ...this.editing, ...data });
      this.toast.success('Fabricante atualizado com sucesso.');
    } else {
      this.service.create(data);
      this.toast.success('Fabricante criado com sucesso.');
    }
    this.cancel();
    this.load();
  }

  async remove(id: string): Promise<void> {
    const ok = await this.confirmDialog.confirm({
      title: 'Excluir fabricante',
      message: 'Deseja excluir este fabricante?',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      danger: true
    });
    if (!ok) return;

    this.service.remove(id);
    this.load();
    this.toast.success('Fabricante removido com sucesso.');
  }
}
