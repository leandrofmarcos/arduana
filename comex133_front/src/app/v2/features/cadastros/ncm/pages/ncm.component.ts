import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NcmService } from '../services/ncm.service';
import { Ncm } from '../models/ncm.models';
import { CRUD_STYLES } from '../../../../shared/styles/crud-page.styles';

@Component({
  selector: 'app-ncm',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: CRUD_STYLES,
  template: `
    <div class="container-standard">

      <div class="dashboard-header">
        <div>
          <h1>🔖 NCM</h1>
          <p class="subtitle">Nomenclatura Comum do Mercosul — alíquotas de importação</p>
        </div>
        <button class="btn btn-primary" (click)="openForm()">+ Novo NCM</button>
      </div>

      <!-- List -->
      <ng-container *ngIf="!showForm">
        <div class="content-section">
          <div class="toolbar">
            <input class="search" type="text" [(ngModel)]="q" placeholder="🔎 Buscar por código ou descrição" />
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Código NCM</th>
                <th>Descrição</th>
                <th style="width:70px;text-align:center">II%</th>
                <th style="width:70px;text-align:center">IPI%</th>
                <th style="width:70px;text-align:center">PIS%</th>
                <th style="width:70px;text-align:center">COFINS%</th>
                <th style="width:70px;text-align:center">ICMS%</th>
                <th>Status</th>
                <th style="width:100px">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="filtered.length === 0">
                <td colspan="9" class="empty-state">Nenhum NCM cadastrado</td>
              </tr>
              <tr *ngFor="let n of filtered">
                <td><code><strong>{{ n.codigoNcm }}</strong></code></td>
                <td>{{ n.descricao }}</td>
                <td style="text-align:center">{{ n.aliqII }}%</td>
                <td style="text-align:center">{{ n.aliqIPI }}%</td>
                <td style="text-align:center">{{ n.aliqPIS }}%</td>
                <td style="text-align:center">{{ n.aliqCOFINS }}%</td>
                <td style="text-align:center">{{ n.aliqICMS }}%</td>
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
          <h2>{{ editing ? 'Editar NCM' : 'Novo NCM' }}</h2>
          <p>{{ editing ? 'Atualize os dados do NCM' : 'Preencha o código, descrição e alíquotas' }}</p>
        </div>
        <div class="card">
          <div class="form-grid">
            <div class="field">
              <label>Código NCM <span class="required">*</span></label>
              <input type="text" [(ngModel)]="form.codigoNcm" maxlength="8" placeholder="00000000"
                     [class.err]="showErrors && !codigoValido" />
              <span class="err-msg" *ngIf="showErrors && !codigoValido">
                {{ !form.codigoNcm.trim() ? 'Código é obrigatório' : 'Deve ter exatamente 8 dígitos numéricos' }}
              </span>
            </div>
            <div class="field w2">
              <label>Descrição <span class="required">*</span></label>
              <input type="text" [(ngModel)]="form.descricao" placeholder="Ex: Aparelhos elétricos para telefonia"
                     [class.err]="showErrors && !form.descricao.trim()" />
              <span class="err-msg" *ngIf="showErrors && !form.descricao.trim()">Descrição é obrigatória</span>
            </div>

            <!-- Alíquotas -->
            <div class="field">
              <label>Alíq. II (%)</label>
              <input type="number" [(ngModel)]="form.aliqII" min="0" max="100" step="0.01" placeholder="0" />
            </div>
            <div class="field">
              <label>Alíq. IPI (%)</label>
              <input type="number" [(ngModel)]="form.aliqIPI" min="0" max="100" step="0.01" placeholder="0" />
            </div>
            <div class="field">
              <label>Alíq. PIS (%)</label>
              <input type="number" [(ngModel)]="form.aliqPIS" min="0" max="100" step="0.01" placeholder="0" />
            </div>
            <div class="field">
              <label>Alíq. COFINS (%)</label>
              <input type="number" [(ngModel)]="form.aliqCOFINS" min="0" max="100" step="0.01" placeholder="0" />
            </div>
            <div class="field">
              <label>Alíq. ICMS (%)</label>
              <input type="number" [(ngModel)]="form.aliqICMS" min="0" max="100" step="0.01" placeholder="0" />
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
export class NcmComponent implements OnInit {
  items: Ncm[] = [];
  q = '';
  showForm = false;
  showErrors = false;
  editing: Ncm | null = null;

  form = {
    codigoNcm: '',
    descricao: '',
    aliqII: 0,
    aliqIPI: 0,
    aliqPIS: 0,
    aliqCOFINS: 0,
    aliqICMS: 0,
    ativo: true
  };

  constructor(private service: NcmService) {}

  ngOnInit(): void { this.load(); }

  load(): void { this.items = this.service.getAll(); }

  get codigoValido(): boolean {
    return /^\d{8}$/.test(this.form.codigoNcm.trim());
  }

  get filtered(): Ncm[] {
    if (!this.q) return this.items;
    const s = this.q.toLowerCase();
    return this.items.filter(n =>
      n.codigoNcm.includes(s) ||
      n.descricao.toLowerCase().includes(s)
    );
  }

  openForm(item?: Ncm): void {
    this.editing = item ?? null;
    this.showErrors = false;
    this.form = item
      ? { codigoNcm: item.codigoNcm, descricao: item.descricao, aliqII: item.aliqII, aliqIPI: item.aliqIPI, aliqPIS: item.aliqPIS, aliqCOFINS: item.aliqCOFINS, aliqICMS: item.aliqICMS, ativo: item.ativo }
      : { codigoNcm: '', descricao: '', aliqII: 0, aliqIPI: 0, aliqPIS: 0, aliqCOFINS: 0, aliqICMS: 0, ativo: true };
    this.showForm = true;
  }

  cancel(): void { this.showForm = false; this.editing = null; }

  save(): void {
    this.showErrors = true;
    if (!this.codigoValido || !this.form.descricao.trim()) return;

    const data: Omit<Ncm, 'id'> = {
      codigoNcm: this.form.codigoNcm.trim(),
      descricao: this.form.descricao.trim(),
      aliqII: Number(this.form.aliqII),
      aliqIPI: Number(this.form.aliqIPI),
      aliqPIS: Number(this.form.aliqPIS),
      aliqCOFINS: Number(this.form.aliqCOFINS),
      aliqICMS: Number(this.form.aliqICMS),
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
    if (confirm('Deseja excluir este NCM?')) {
      this.service.remove(id);
      this.load();
    }
  }
}
