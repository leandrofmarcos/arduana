import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { EmbarqueNavioVinculoService, EmbarqueNavioVinculoDto, NavioTrajetoListItem } from '../services/embarque-navio-vinculo.service';

@Component({
  selector: 'app-embarque-navio-vinculo-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .vinculo-section {
      padding: 12px 0;
      border-bottom: 1px solid var(--color-border);
      margin-bottom: 16px;
    }

    .vinculo-section h4 {
      margin: 0 0 12px 0;
      font-size: 13px;
      font-weight: 700;
      color: var(--color-text);
    }

    .vinculo-display {
      padding: 12px;
      background: var(--color-background);
      border-radius: 6px;
      font-size: 13px;
      margin-bottom: 12px;
    }

    .vinculo-display .field {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--color-border);
    }

    .vinculo-display .field:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }

    .field-label {
      color: var(--color-text-muted);
      font-weight: 500;
    }

    .field-value {
      font-weight: 600;
      color: var(--color-primary);
    }

    .vinculo-form {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      padding: 12px;
      background: var(--color-background);
      border-radius: 6px;
      margin-bottom: 12px;
    }

    @media (max-width: 768px) {
      .vinculo-form {
        grid-template-columns: 1fr;
      }
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group label {
      font-size: 12px;
      color: var(--color-text-muted);
      margin-bottom: 4px;
      font-weight: 500;
    }

    .form-group select,
    .form-group input {
      padding: 8px 10px;
      border: 1px solid var(--color-border);
      border-radius: 4px;
      font-size: 13px;
      background: var(--color-surface);
      color: var(--color-text);
      font-family: inherit;
      transition: border-color 0.2s;
    }

    .form-group select:focus,
    .form-group input:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
    }

    .form-actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn-primary {
      background: var(--color-primary);
      color: white;
    }

    .btn-primary:hover {
      background: #2563eb;
      opacity: 0.9;
    }

    .btn-secondary {
      background: var(--color-border);
      color: var(--color-text);
    }

    .btn-secondary:hover {
      background: #e0e0e0;
    }

    .btn-danger {
      background: #ef4444;
      color: white;
    }

    .btn-danger:hover {
      background: #dc2626;
    }

    .error-msg {
      color: #dc2626;
      font-size: 12px;
      margin-bottom: 8px;
    }

    .success-msg {
      color: #16a34a;
      font-size: 12px;
      margin-bottom: 8px;
    }

    .loading {
      color: var(--color-text-muted);
      font-style: italic;
    }
  `],
  template: `
    <div class="vinculo-section">
      <h4>🚢 Vínculo Navio / Perna</h4>

      <!-- Display Mode -->
      <div *ngIf="!showForm && vinculo">
        <div class="vinculo-display">
          <div class="field">
            <span class="field-label">Navio</span>
            <span class="field-value">{{ vinculo.nomeNavio }}</span>
          </div>
          <div class="field">
            <span class="field-label">Perna</span>
            <span class="field-value">{{ vinculo.numeroViagem || '(Sem perna selecionada)' }}</span>
          </div>
          <div class="field" *ngIf="vinculo.observacao">
            <span class="field-label">Obs.</span>
            <span class="field-value">{{ vinculo.observacao }}</span>
          </div>
        </div>
        <div class="form-actions">
          <button class="btn btn-secondary" (click)="editVinculo()">✏️ Editar</button>
          <button class="btn btn-danger" (click)="confirmDelete()">🗑️ Desvincular</button>
        </div>
      </div>

      <!-- Display Mode (No Vinculo) -->
      <div *ngIf="!showForm && !vinculo">
        <p style="color: var(--color-text-muted); margin: 0; font-size: 12px;">
          Nenhum vínculo ativo. <a style="cursor: pointer; color: var(--color-primary);" (click)="startCreate()">Vincular navio</a>
        </p>
      </div>

      <!-- Edit/Create Mode -->
      <div *ngIf="showForm">
        <div *ngIf="errorMsg" class="error-msg">{{ errorMsg }}</div>
        <div *ngIf="successMsg" class="success-msg">{{ successMsg }}</div>

        <div class="vinculo-form">
          <div class="form-group">
            <label>Navio *</label>
            <select [(ngModel)]="formData.navioId" (change)="onNavioChange()" [disabled]="loading">
              <option [value]="null">— Selecione —</option>
              <option *ngFor="let n of navios" [value]="n.id">{{ n.nomeNavio }}</option>
            </select>
          </div>

          <div class="form-group">
            <label>Perna da Viagem</label>
            <select [(ngModel)]="formData.navioTrajetoId" [disabled]="!formData.navioId || loading">
              <option [value]="null">— Nenhuma (opcional) —</option>
              <option *ngFor="let t of trajetos" [value]="t.id">
                {{ t.numeroViagem }} | {{ t.portoOrigemNome }} → {{ t.portoDestinoNome }}
              </option>
            </select>
          </div>

          <div class="form-group" style="grid-column: 1 / -1;">
            <label>Observação</label>
            <input
              type="text"
              [(ngModel)]="formData.observacao"
              placeholder="Opcional"
              [disabled]="loading"
              maxlength="500"
            />
          </div>

          <div class="form-actions" style="grid-column: 1 / -1;">
            <button class="btn btn-primary" (click)="save()" [disabled]="!formData.navioId || loading">
              {{ loading ? '⏳ Salvando...' : '💾 Salvar' }}
            </button>
            <button class="btn btn-secondary" (click)="cancel()" [disabled]="loading">✖️ Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class EmbarqueNavioVinculoFormComponent implements OnInit, OnDestroy {
  @Input() embarqueId!: string | number;

  vinculo: any = null;
  showForm = false;
  loading = false;
  errorMsg = '';
  successMsg = '';
  private _subs = new Subscription();

  navios: any[] = [];
  trajetos: NavioTrajetoListItem[] = [];

  formData = {
    navioId: null as number | null,
    navioTrajetoId: null as number | null,
    observacao: ''
  };

  private isEditMode = false;

  constructor(private service: EmbarqueNavioVinculoService) {}

  ngOnInit(): void {
    this._subs.add(
      this.service.currentVinculo$.subscribe(v => {
        this.vinculo = v;
      })
    );
    this.loadVinculo();
    this.loadNavios();
  }

  ngOnDestroy(): void {
    this._subs.unsubscribe();
  }

  private loadVinculo(): void {
    this.loading = true;
    this.errorMsg = '';
    this._subs.add(
      this.service.getVinculo(this.embarqueId).subscribe({
        next: (v) => {
          this.vinculo = v;
          this.loading = false;
        },
        error: (err) => {
          console.error('Erro ao carregar vínculo:', err);
          this.loading = false;
        }
      })
    );
  }

  private loadNavios(): void {
    this._subs.add(
      this.service.getNaviosAtivos().subscribe({
        next: (navios) => {
          this.navios = navios;
        },
        error: (err) => {
          console.error('Erro ao carregar navios:', err);
        }
      })
    );
  }

  startCreate(): void {
    this.isEditMode = false;
    this.formData = { navioId: null, navioTrajetoId: null, observacao: '' };
    this.trajetos = [];
    this.errorMsg = '';
    this.successMsg = '';
    this.showForm = true;
  }

  editVinculo(): void {
    if (!this.vinculo) return;
    this.isEditMode = true;
    this.formData = {
      navioId: this.vinculo.navioId,
      navioTrajetoId: this.vinculo.navioTrajetoId || null,
      observacao: this.vinculo.observacao || ''
    };
    this.errorMsg = '';
    this.successMsg = '';
    this.loadTrajetosForNavio(this.vinculo.navioId);
    this.showForm = true;
  }

  cancel(): void {
    this.showForm = false;
    this.errorMsg = '';
    this.successMsg = '';
  }

  onNavioChange(): void {
    this.formData.navioTrajetoId = null;
    this.trajetos = [];
    if (this.formData.navioId) {
      this.loadTrajetosForNavio(this.formData.navioId);
    }
  }

  private loadTrajetosForNavio(navioId: number): void {
    this._subs.add(
      this.service.getTrajetos(navioId).subscribe({
        next: (trajetos) => {
          this.trajetos = trajetos;
        },
        error: (err) => {
          console.error('Erro ao carregar trajetos:', err);
          this.errorMsg = 'Erro ao carregar pernas do navio';
        }
      })
    );
  }

  save(): void {
    if (!this.formData.navioId) {
      this.errorMsg = 'Selecione um navio';
      return;
    }

    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    const request = {
      navioId: this.formData.navioId,
      navioTrajetoId: this.formData.navioTrajetoId || undefined,
      observacao: this.formData.observacao || undefined
    };

    if (this.isEditMode) {
      // Update
      this._subs.add(
        this.service.updateVinculo(this.embarqueId, {
          navioTrajetoId: request.navioTrajetoId,
          observacao: request.observacao
        }).subscribe({
          next: (updated) => {
            this.vinculo = updated;
            this.loading = false;
            this.successMsg = 'Vínculo atualizado com sucesso';
            setTimeout(() => this.cancel(), 1500);
          },
          error: (err) => {
            console.error('Erro ao atualizar vínculo:', err);
            this.loading = false;
            this.errorMsg = err?.error?.message || 'Erro ao atualizar vínculo';
          }
        })
      );
    } else {
      // Create
      this._subs.add(
        this.service.createVinculo(this.embarqueId, request as any).subscribe({
          next: (created) => {
            this.vinculo = created;
            this.loading = false;
            this.successMsg = 'Vínculo criado com sucesso';
            setTimeout(() => this.cancel(), 1500);
          },
          error: (err) => {
            console.error('Erro ao criar vínculo:', err);
            this.loading = false;
            this.errorMsg = err?.error?.message || 'Erro ao criar vínculo';
          }
        })
      );
    }
  }

  confirmDelete(): void {
    if (!confirm('Tem certeza que deseja desvincular este embarque do navio?')) {
      return;
    }

    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    this._subs.add(
      this.service.deleteVinculo(this.embarqueId).subscribe({
        next: () => {
          this.vinculo = null;
          this.loading = false;
          this.successMsg = 'Vínculo removido com sucesso';
          this.showForm = false;
          setTimeout(() => this.successMsg = '', 2000);
        },
        error: (err) => {
          console.error('Erro ao remover vínculo:', err);
          this.loading = false;
          this.errorMsg = err?.error?.message || 'Erro ao remover vínculo';
        }
      })
    );
  }
}
