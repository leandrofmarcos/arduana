import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PortoDestinoService } from '../services/porto-destino.service';
import { PortoDestino } from '../models/porto-destino.models';
import { CRUD_STYLES } from '../../../../shared/styles/crud-page.styles';
import { PaginationComponent } from '../../../../../core/components/pagination/pagination.component';
import { PagedResult, PaginationParams } from '../../../../../core/api/models/api-response.model';
import { NotificationService } from '../../../../../core/services/notification.service';

@Component({
  selector: 'app-portos-destino',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  styles: CRUD_STYLES,
  template: `
    <div class="container-standard">

      <!-- Header -->
      <div class="dashboard-header">
        <div>
          <h1>🏢 Portos de Destino</h1>
          <p class="subtitle">Portos de desembarque / destino final das mercadorias</p>
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
                <th>Estado</th>
                <th>País</th>
                <th>Status</th>
                <th style="width:100px">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="filtered.length === 0">
                <td colspan="6" class="empty-state">Nenhum porto de destino cadastrado</td>
              </tr>
              <tr *ngFor="let p of filtered">
                <td><strong>{{ p.nome }}</strong></td>
                <td><code>{{ p.codigo }}</code></td>
                <td>{{ p.estado || '—' }}</td>
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
          <app-pagination
            *ngIf="pagedResult"
            [pagedResult]="pagedResult"
            (pageChanged)="onPageChange($event)"
          />
        </div>
      </ng-container>

      <!-- Form -->
      <ng-container *ngIf="showForm">
        <div class="detail-header">
          <h2>{{ editing ? 'Editar Porto de Destino' : 'Novo Porto de Destino' }}</h2>
          <p>{{ editing ? 'Atualize as informações do porto' : 'Preencha os dados do novo porto de destino' }}</p>
        </div>
        <div class="card">
          <div class="form-grid">
            <div class="field w2">
              <label>Nome do Porto <span class="required">*</span></label>
              <input type="text" [(ngModel)]="form.nome" placeholder="Ex: Porto de Santos"
                     [class.err]="showErrors && !form.nome.trim()" />
              <span class="err-msg" *ngIf="showErrors && !form.nome.trim()">Nome é obrigatório</span>
            </div>
            <div class="field">
              <label>Código <span class="required">*</span></label>
              <input type="text" [(ngModel)]="form.codigo" placeholder="Ex: SSZ"
                     [class.err]="showErrors && !form.codigo.trim()" />
              <span class="err-msg" *ngIf="showErrors && !form.codigo.trim()">Código é obrigatório</span>
            </div>
            <div class="field w2">
              <label>País <span class="required">*</span></label>
              <input type="text" [(ngModel)]="form.pais" placeholder="Ex: Brasil"
                     [class.err]="showErrors && !form.pais.trim()" />
              <span class="err-msg" *ngIf="showErrors && !form.pais.trim()">País é obrigatório</span>
            </div>
            <div class="field">
              <label>Estado / UF</label>
              <input type="text" [(ngModel)]="form.estado" placeholder="Ex: SP" />
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
export class PortosDestinoComponent implements OnInit {
  items: PortoDestino[] = [];
  pagedResult: PagedResult<PortoDestino> | null = null;
  q = '';
  loading = false;
  showForm = false;
  showErrors = false;
  editing: PortoDestino | null = null;

  form = { nome: '', codigo: '', estado: '', pais: '', ativo: true };

  constructor(
    private service: PortoDestinoService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void { this.load(); }

  load(page = 1, pageSize = 20): void {
    this.loading = true;
    this.service.getPaged(page, pageSize).subscribe({
      next: result => {
        this.pagedResult = result;
        this.items = result.items;
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        this.notification.error(err?.message ?? 'Erro ao carregar portos de destino');
      }
    });
  }

  onPageChange(params: PaginationParams): void {
    this.load(params.page ?? 1, params.pageSize ?? 20);
  }

  get filtered(): PortoDestino[] {
    if (!this.q) return this.items;
    const s = this.q.toLowerCase();
    return this.items.filter(p =>
      p.nome.toLowerCase().includes(s) ||
      p.codigo.toLowerCase().includes(s) ||
      p.pais.toLowerCase().includes(s) ||
      (p.estado ?? '').toLowerCase().includes(s)
    );
  }

  openForm(item?: PortoDestino): void {
    this.editing = item ?? null;
    this.showErrors = false;
    this.form = item
      ? { nome: item.nome, codigo: item.codigo, estado: item.estado ?? '', pais: item.pais, ativo: item.ativo }
      : { nome: '', codigo: '', estado: '', pais: '', ativo: true };
    this.showForm = true;
  }

  cancel(): void {
    this.showForm = false;
    this.editing = null;
  }

  save(): void {
    this.showErrors = true;
    if (!this.form.nome.trim() || !this.form.codigo.trim() || !this.form.pais.trim()) return;

    const data = {
      nome: this.form.nome.trim(),
      codigo: this.form.codigo.trim().toUpperCase(),
      estado: this.form.estado.trim() || undefined,
      pais: this.form.pais.trim(),
      ativo: this.form.ativo
    };

    if (this.editing) {
      this.service.update({ ...this.editing, ...data }).subscribe({
        next: () => {
          this.notification.success('Porto de destino atualizado com sucesso');
          this.cancel();
          this.load(this.pagedResult?.page ?? 1, this.pagedResult?.pageSize ?? 20);
        },
        error: err => this.notification.error(err?.message ?? 'Erro ao atualizar porto de destino')
      });
    } else {
      this.service.create(data).subscribe({
        next: () => {
          this.notification.success('Porto de destino criado com sucesso');
          this.cancel();
          this.load(this.pagedResult?.page ?? 1, this.pagedResult?.pageSize ?? 20);
        },
        error: err => this.notification.error(err?.message ?? 'Erro ao criar porto de destino')
      });
    }
  }

  remove(id: string): void {
    if (confirm('Deseja excluir este porto de destino?')) {
      this.service.remove(id).subscribe({
        next: () => {
          this.notification.success('Porto de destino removido com sucesso');
          this.load(this.pagedResult?.page ?? 1, this.pagedResult?.pageSize ?? 20);
        },
        error: err => this.notification.error(err?.message ?? 'Erro ao remover porto de destino')
      });
    }
  }
}
