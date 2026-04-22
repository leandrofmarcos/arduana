import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CRUD_STYLES } from '../../../../shared/styles/crud-page.styles';
import { NavioCadastro } from '../models/navio.models';
import { NaviosCadastroService } from '../services/navios-cadastro.service';

@Component({
  selector: 'app-navios-cadastro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: CRUD_STYLES,
  template: `
    <div class="container-standard">

      <div class="dashboard-header">
        <div>
          <h1>🚢 Cadastro de Navios</h1>
          <p class="subtitle">Cadastro mestre de navios para vinculação nos embarques</p>
        </div>
        <button class="btn btn-primary" (click)="openForm()">+ Novo Navio</button>
      </div>

      <ng-container *ngIf="!showForm">
        <div class="content-section">
          <div class="toolbar">
            <input class="search" type="text" [(ngModel)]="q" placeholder="🔎 Buscar por nome, IMO ou armador" />
          </div>

          <table class="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>IMO</th>
                <th>Armador</th>
                <th>Status</th>
                <th style="width:100px">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="filtered.length === 0">
                <td colspan="5" class="empty-state">Nenhum navio cadastrado</td>
              </tr>
              <tr *ngFor="let n of filtered">
                <td><strong>{{ n.nomeNavio }}</strong></td>
                <td><code>{{ n.codigoImo || '—' }}</code></td>
                <td>{{ n.armador || '—' }}</td>
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

      <ng-container *ngIf="showForm">
        <div class="detail-header">
          <h2>{{ editing ? 'Editar Navio' : 'Novo Navio' }}</h2>
          <p>{{ editing ? 'Atualize as informações do navio' : 'Preencha os dados do novo navio' }}</p>
        </div>

        <div class="card">
          <div class="form-grid">
            <div class="field w2">
              <label>Nome do Navio <span class="required">*</span></label>
              <input type="text" [(ngModel)]="form.nomeNavio" [class.err]="showErrors && !form.nomeNavio.trim()" />
              <span class="err-msg" *ngIf="showErrors && !form.nomeNavio.trim()">Nome é obrigatório</span>
            </div>
            <div class="field">
              <label>Código IMO</label>
              <input type="text" [(ngModel)]="form.codigoImo" placeholder="Ex: 9876543" />
            </div>
            <div class="field">
              <label>Armador</label>
              <input type="text" [(ngModel)]="form.armador" placeholder="Ex: MSC" />
            </div>
            <div class="field w3">
              <label>Observação</label>
              <input type="text" [(ngModel)]="form.observacao" placeholder="Opcional" />
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
export class NaviosComponent implements OnInit, OnDestroy {
  items: NavioCadastro[] = [];
  q = '';

  showForm = false;
  showErrors = false;
  editing: NavioCadastro | null = null;

  private readonly subs = new Subscription();

  form = {
    nomeNavio: '',
    codigoImo: '',
    armador: '',
    observacao: '',
    ativo: true
  };

  constructor(private service: NaviosCadastroService) {}

  ngOnInit(): void {
    this.subs.add(this.service.navios$.subscribe(items => this.items = [...items]));
    this.service.reload();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  get filtered(): NavioCadastro[] {
    if (!this.q) return this.items;
    const s = this.q.toLowerCase();
    return this.items.filter(n =>
      n.nomeNavio.toLowerCase().includes(s) ||
      (n.codigoImo ?? '').toLowerCase().includes(s) ||
      (n.armador ?? '').toLowerCase().includes(s)
    );
  }

  openForm(item?: NavioCadastro): void {
    this.editing = item ?? null;
    this.showErrors = false;
    this.form = item
      ? {
          nomeNavio: item.nomeNavio,
          codigoImo: item.codigoImo ?? '',
          armador: item.armador ?? '',
          observacao: item.observacao ?? '',
          ativo: item.ativo
        }
      : {
          nomeNavio: '',
          codigoImo: '',
          armador: '',
          observacao: '',
          ativo: true
        };
    this.showForm = true;
  }

  cancel(): void {
    this.showForm = false;
    this.editing = null;
  }

  save(): void {
    this.showErrors = true;
    if (!this.form.nomeNavio.trim()) return;

    const payload: Omit<NavioCadastro, 'id'> = {
      nomeNavio: this.form.nomeNavio.trim(),
      codigoImo: this.form.codigoImo.trim(),
      armador: this.form.armador.trim(),
      observacao: this.form.observacao.trim(),
      ativo: this.form.ativo
    };

    if (this.editing) {
      this.service.update({ ...this.editing, ...payload });
    } else {
      this.service.create(payload).subscribe();
    }

    this.cancel();
  }

  remove(id: string): void {
    if (confirm('Deseja excluir este navio?')) {
      this.service.remove(id);
    }
  }
}
