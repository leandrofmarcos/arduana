import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ControleNavioService } from '../services/controle-navio.service';
import { ControleNavio, ControleNavioTrajeto } from '../models/controle-navio.models';
import { PortoOrigemService } from '../../../cadastros/portos-origem/services/porto-origem.service';
import { PortoDestinoService } from '../../../cadastros/portos-destino/services/porto-destino.service';
import { PortoOrigem } from '../../../cadastros/portos-origem/models/porto-origem.models';
import { PortoDestino } from '../../../cadastros/portos-destino/models/porto-destino.models';
import { CRUD_STYLES } from '../../../../shared/styles/crud-page.styles';

interface TrajetoForm {
  portoOrigemId: string;
  portoDestinoId: string;
  etd: string;
  eta: string;
  trajetoDescricao: string;
}

@Component({
  selector: 'app-controle-navios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [
    ...CRUD_STYLES,
    `
    .trajetos-section {
      border: 2px solid var(--color-border);
      border-radius: 10px;
      padding: 16px;
      margin-top: 8px;
      background: var(--color-bg);
    }
    .trajetos-section h3 {
      margin: 0 0 12px;
      font-size: 14px;
      font-weight: 700;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: .05em;
    }
    .trajeto-add-form {
      display: grid;
      grid-template-columns: 1fr 1fr 140px 140px 1fr auto;
      gap: 8px;
      align-items: end;
      padding: 12px;
      background: var(--color-surface);
      border-radius: 8px;
      margin-bottom: 12px;
    }
    .trajeto-add-form label { font-size: 11px; color: var(--color-text-muted); display:block; margin-bottom:4px; }
    .trajeto-add-form input,
    .trajeto-add-form select { width:100%; padding: 8px 10px; border: 1.5px solid var(--color-border); border-radius:6px; font-size:13px; background:var(--color-bg); color:var(--color-text); }
    .trajetos-list { list-style: none; margin:0; padding:0; }
    .trajetos-list li {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 8px;
      background: var(--color-surface);
      margin-bottom: 6px;
      font-size: 13px;
    }
    .trajeto-num {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--color-primary, #3b82f6);
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .trajeto-info { flex: 1; }
    .trajeto-rota { font-weight: 700; }
    .trajeto-datas { font-size: 12px; color: var(--color-text-muted); }
    .trajeto-duracao {
      font-size: 12px;
      background: var(--color-bg);
      border: 1px solid var(--color-border);
      padding: 3px 8px;
      border-radius: 12px;
      white-space: nowrap;
    }
    .err-trajeto { color: #e53e3e; font-size: 12px; margin-top: 4px; }
    .expand-toggle { cursor:pointer; font-size:12px; color:var(--color-primary, #3b82f6); }
    .trajetos-summary { font-size:12px; color:var(--color-text-muted); margin-left:8px; }
    `
  ],
  template: `
    <div class="container-standard">

      <div class="dashboard-header">
        <div>
          <h1>⚓ Controle de Navios</h1>
          <p class="subtitle">Viagens e trajetórias dos navios vinculados aos embarques</p>
        </div>
        <button class="btn btn-primary" (click)="openForm()">+ Nova Viagem</button>
      </div>

      <!-- ── LISTAGEM ── -->
      <ng-container *ngIf="!showForm">
        <div class="content-section">
          <div class="toolbar">
            <input class="search" type="text" [(ngModel)]="q"
              placeholder="🔎 Buscar por nº viagem ou nome do navio" />
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Nº Viagem</th>
                <th>Navio</th>
                <th>Trajetórias</th>
                <th>Status</th>
                <th style="width:100px">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="filtered.length === 0">
                <td colspan="5" class="empty-state">Nenhuma viagem cadastrada</td>
              </tr>
              <ng-container *ngFor="let n of filtered">
                <tr>
                  <td><code><strong>{{ n.numeroViagem }}</strong></code></td>
                  <td>{{ n.nomeNavio }}</td>
                  <td>
                    <span *ngIf="trajetosPorNavio[n.id]?.length" class="expand-toggle"
                      (click)="toggleExpand(n.id)">
                      {{ expanded[n.id] ? '▲' : '▶' }}
                      {{ trajetosPorNavio[n.id].length }} trajetória(s)
                    </span>
                    <span *ngIf="!trajetosPorNavio[n.id]?.length" class="trajetos-summary">Sem trajetórias</span>
                  </td>
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
                <!-- Trajetórias expandidas -->
                <tr *ngIf="expanded[n.id] && trajetosPorNavio[n.id]?.length">
                  <td colspan="5" style="padding: 0 16px 12px;">
                    <ul class="trajetos-list">
                      <li *ngFor="let t of trajetosPorNavio[n.id]; let i = index">
                        <div class="trajeto-num">{{ i + 1 }}</div>
                        <div class="trajeto-info">
                          <div class="trajeto-rota">
                            {{ portoNome(t.portoOrigemId, 'origem') }} → {{ portoNome(t.portoDestinoId, 'destino') }}
                          </div>
                          <div class="trajeto-datas">
                            ETD {{ t.etd | date:'dd/MM/yy' }} · ETA {{ t.eta | date:'dd/MM/yy' }}
                            <span *ngIf="t.trajetoDescricao"> · {{ t.trajetoDescricao }}</span>
                          </div>
                        </div>
                        <span class="trajeto-duracao">{{ calcDias(t.etd, t.eta) }} dias</span>
                      </li>
                    </ul>
                  </td>
                </tr>
              </ng-container>
            </tbody>
          </table>
        </div>
      </ng-container>

      <!-- ── FORMULÁRIO ── -->
      <ng-container *ngIf="showForm">
        <div class="detail-header">
          <h2>{{ editing ? 'Editar Viagem' : 'Nova Viagem' }}</h2>
          <p>{{ editing ? 'Atualize dados do navio e trajetórias' : 'Preencha os dados da viagem e adicione trajetórias' }}</p>
        </div>
        <div class="card">
          <div class="form-grid">
            <div class="field">
              <label>Nº da Viagem <span class="required">*</span></label>
              <input type="text" [(ngModel)]="form.numeroViagem" placeholder="Ex: VGM-2026-001"
                     [class.err]="showErrors && !form.numeroViagem.trim()" />
              <span class="err-msg" *ngIf="showErrors && !form.numeroViagem.trim()">Obrigatório</span>
            </div>
            <div class="field w2">
              <label>Nome do Navio <span class="required">*</span></label>
              <input type="text" [(ngModel)]="form.nomeNavio" placeholder="Ex: MSC Gülsün"
                     [class.err]="showErrors && !form.nomeNavio.trim()" />
              <span class="err-msg" *ngIf="showErrors && !form.nomeNavio.trim()">Obrigatório</span>
            </div>
            <div class="field w3">
              <label>Observação</label>
              <input type="text" [(ngModel)]="form.observacao" placeholder="Observações gerais da viagem" />
            </div>
            <div class="field">
              <label>Status</label>
              <select [(ngModel)]="form.ativo">
                <option [ngValue]="true">Ativo</option>
                <option [ngValue]="false">Inativo</option>
              </select>
            </div>
          </div>

          <!-- Trajetórias -->
          <div class="trajetos-section">
            <h3>⚓ Trajetórias</h3>

            <!-- Form de adição -->
            <div class="trajeto-add-form">
              <div>
                <label>Porto Origem</label>
                <select [(ngModel)]="trajetoForm.portoOrigemId">
                  <option value="">— Selecione —</option>
                  <option *ngFor="let p of portosOrigem" [value]="p.id">{{ p.nome }} ({{ p.codigo }})</option>
                </select>
              </div>
              <div>
                <label>Porto Destino</label>
                <select [(ngModel)]="trajetoForm.portoDestinoId">
                  <option value="">— Selecione —</option>
                  <option *ngFor="let p of portosDestino" [value]="p.id">{{ p.nome }} ({{ p.codigo }})</option>
                </select>
              </div>
              <div>
                <label>ETD</label>
                <input type="date" [(ngModel)]="trajetoForm.etd" />
              </div>
              <div>
                <label>ETA</label>
                <input type="date" [(ngModel)]="trajetoForm.eta" />
              </div>
              <div>
                <label>Descrição</label>
                <input type="text" [(ngModel)]="trajetoForm.trajetoDescricao" placeholder="Opcional" />
              </div>
              <div>
                <button class="btn btn-secondary" (click)="addTrajeto()" style="white-space:nowrap">+ Adicionar</button>
              </div>
            </div>
            <p class="err-trajeto" *ngIf="trajetoErro">{{ trajetoErro }}</p>

            <!-- Lista de trajetórias adicionadas -->
            <ul class="trajetos-list" *ngIf="trajetosForm.length > 0">
              <li *ngFor="let t of trajetosForm; let i = index">
                <div class="trajeto-num">{{ i + 1 }}</div>
                <div class="trajeto-info">
                  <div class="trajeto-rota">
                    {{ portoNome(t.portoOrigemId, 'origem') }} → {{ portoNome(t.portoDestinoId, 'destino') }}
                  </div>
                  <div class="trajeto-datas">
                    ETD {{ t.etd | date:'dd/MM/yyyy' }} · ETA {{ t.eta | date:'dd/MM/yyyy' }}
                    <span *ngIf="t.trajetoDescricao"> · {{ t.trajetoDescricao }}</span>
                  </div>
                </div>
                <span class="trajeto-duracao">{{ calcDias(t.etd, t.eta) }} dias</span>
                <button class="btn-icon danger" title="Remover trajetória" (click)="removeTrajeto(i)">🗑️</button>
              </li>
            </ul>
            <p style="font-size:13px;color:var(--color-text-muted);margin:8px 0 0"
               *ngIf="trajetosForm.length === 0">Nenhuma trajetória adicionada ainda.</p>
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
export class ControleNaviosComponent implements OnInit {
  navios: ControleNavio[] = [];
  trajetosPorNavio: Record<string, ControleNavioTrajeto[]> = {};
  expanded: Record<string, boolean> = {};
  portosOrigem: PortoOrigem[] = [];
  portosDestino: PortoDestino[] = [];

  q = '';
  showForm = false;
  showErrors = false;
  editing: ControleNavio | null = null;

  form = { numeroViagem: '', nomeNavio: '', observacao: '', ativo: true };
  trajetosForm: TrajetoForm[] = [];
  trajetoForm: TrajetoForm = { portoOrigemId: '', portoDestinoId: '', etd: '', eta: '', trajetoDescricao: '' };
  trajetoErro = '';

  constructor(
    private service: ControleNavioService,
    private portoOrigemSvc: PortoOrigemService,
    private portoDestinoSvc: PortoDestinoService
  ) {}

  ngOnInit(): void {
    this.portosOrigem  = this.portoOrigemSvc.getAtivos();
    this.portosDestino = this.portoDestinoSvc.getAtivos();
    this.load();
  }

  load(): void {
    this.navios = this.service.getAll();
    this.trajetosPorNavio = {};
    this.navios.forEach(n => {
      this.trajetosPorNavio[n.id] = this.service.getTrajetos(n.id);
    });
  }

  get filtered(): ControleNavio[] {
    if (!this.q) return this.navios;
    const s = this.q.toLowerCase();
    return this.navios.filter(n =>
      n.numeroViagem.toLowerCase().includes(s) ||
      n.nomeNavio.toLowerCase().includes(s)
    );
  }

  toggleExpand(id: string): void {
    this.expanded[id] = !this.expanded[id];
  }

  portoNome(id: string, tipo: 'origem' | 'destino'): string {
    if (tipo === 'origem') {
      return this.portosOrigem.find(p => p.id === id)?.nome ?? id;
    }
    return this.portosDestino.find(p => p.id === id)?.nome ?? id;
  }

  calcDias(etd: string, eta: string): number {
    if (!etd || !eta) return 0;
    const diff = new Date(eta).getTime() - new Date(etd).getTime();
    return Math.max(0, Math.round(diff / 86_400_000));
  }

  // ── Trajetórias ────────────────────────────────────────────────────────

  addTrajeto(): void {
    const t = this.trajetoForm;
    if (!t.portoOrigemId || !t.portoDestinoId || !t.etd || !t.eta) {
      this.trajetoErro = 'Porto origem, destino, ETD e ETA são obrigatórios.';
      return;
    }
    if (t.eta < t.etd) {
      this.trajetoErro = 'ETA não pode ser anterior ao ETD.';
      return;
    }
    this.trajetoErro = '';
    this.trajetosForm.push({ ...t });
    this.trajetoForm = { portoOrigemId: '', portoDestinoId: '', etd: '', eta: '', trajetoDescricao: '' };
  }

  removeTrajeto(index: number): void {
    this.trajetosForm.splice(index, 1);
  }

  // ── CRUD ───────────────────────────────────────────────────────────────

  openForm(item?: ControleNavio): void {
    this.editing = item ?? null;
    this.showErrors = false;
    this.trajetoErro = '';
    this.trajetoForm = { portoOrigemId: '', portoDestinoId: '', etd: '', eta: '', trajetoDescricao: '' };

    if (item) {
      this.form = { numeroViagem: item.numeroViagem, nomeNavio: item.nomeNavio, observacao: item.observacao ?? '', ativo: item.ativo };
      this.trajetosForm = (this.trajetosPorNavio[item.id] ?? []).map(t => ({
        portoOrigemId:     t.portoOrigemId,
        portoDestinoId:    t.portoDestinoId,
        etd:               t.etd,
        eta:               t.eta,
        trajetoDescricao:  t.trajetoDescricao ?? ''
      }));
    } else {
      this.form = { numeroViagem: '', nomeNavio: '', observacao: '', ativo: true };
      this.trajetosForm = [];
    }
    this.showForm = true;
  }

  cancel(): void { this.showForm = false; this.editing = null; }

  save(): void {
    this.showErrors = true;
    if (!this.form.numeroViagem.trim() || !this.form.nomeNavio.trim()) return;

    const data: Omit<ControleNavio, 'id'> = {
      numeroViagem: this.form.numeroViagem.trim(),
      nomeNavio:    this.form.nomeNavio.trim(),
      observacao:   this.form.observacao.trim() || undefined,
      ativo:        this.form.ativo
    };

    let navioId: string;
    if (this.editing) {
      this.service.update({ ...this.editing, ...data });
      navioId = this.editing.id;
    } else {
      const created = this.service.create(data);
      navioId = created.id;
    }

    // salva trajetórias (substitui todas)
    this.service.replaceTrajetos(navioId, this.trajetosForm.map(t => ({
      controleNavioId:  navioId,
      portoOrigemId:    t.portoOrigemId,
      portoDestinoId:   t.portoDestinoId,
      etd:              t.etd,
      eta:              t.eta,
      trajetoDescricao: t.trajetoDescricao || undefined
    })));

    this.cancel();
    this.load();
  }

  remove(id: string): void {
    if (confirm('Deseja excluir este navio e todas as suas trajetórias?')) {
      this.service.remove(id);
      this.load();
    }
  }
}
