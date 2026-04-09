import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUD_STYLES } from '../../../shared/styles/crud-page.styles';
import { AuthService } from '../../../../features/auth/auth.providers';
import { CustoDespachanteService } from '../../custo-despachante/services/custo-despachante.service';
import { CustoDespachante } from '../../custo-despachante/models/custo-despachante.models';
import {
  SolicitacaoOrcamento,
  SolicitacaoOrcamentoDespachante,
  SolicitacaoOrcamentoDocumento,
  StatusSolicitacao,
  StatusSolicitacaoDespachante
} from '../models/solicitacao-orcamento.models';
import { SolicitacaoOrcamentoService } from '../services/solicitacao-orcamento.service';
import { PortoOrigemService } from '../../cadastros/portos-origem/services/porto-origem.service';
import { PortoDestinoService } from '../../cadastros/portos-destino/services/porto-destino.service';
import { ClienteV2Service } from '../../cadastros/clientes/services/cliente-v2.service';
import { ImportadorService } from '../../cadastros/importadores/services/importador.service';
import { DespachanteV2Service } from '../../cadastros/despachantes/services/despachante-v2.service';
import { PortoOrigem } from '../../cadastros/portos-origem/models/porto-origem.models';
import { PortoDestino } from '../../cadastros/portos-destino/models/porto-destino.models';
import { ClienteV2 } from '../../cadastros/clientes/models/cliente-v2.models';
import { Importador } from '../../cadastros/importadores/models/importador.models';
import { DespachanteV2 } from '../../cadastros/despachantes/models/despachante-v2.models';


interface DespaForm {
  despachanteId: string;
  status: StatusSolicitacaoDespachante;
  dataEnvio: string;
}

interface DocForm {
  nomeArquivo: string;
  linkDocumento: string;
  dataUpload: string;
  observacao: string;
}

const STATUS_COLORS: Record<StatusSolicitacao, string> = {
  Rascunho:   '#6b7280',
  Aberta:     '#3b82f6',
  EmAnalise:  '#f59e0b',
  Aprovada:   '#22c55e',
  Cancelada:  '#ef4444',
};

const DESP_STATUS_COLORS: Record<StatusSolicitacaoDespachante, string> = {
  PendenteDespachante:   '#f59e0b',
  FinalizadoDespachante: '#22c55e',
  Respondido:            '#22c55e',
  Recusado:              '#ef4444',
};

@Component({
  selector: 'app-solicitacao-orcamento',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  styles: [
    ...CRUD_STYLES,
    `
    .status-badge { display:inline-block; padding:2px 10px; border-radius:12px; font-size:11px; font-weight:700; color:#fff; }
    .section-card { border:1.5px solid var(--color-border); border-radius:10px; padding:16px 20px; margin-top:20px; background:var(--color-surface); }
    .section-card h3 { font-size:12px; text-transform:uppercase; letter-spacing:.06em; color:var(--color-text-muted); margin:0 0 14px; }
    .inline-form { display:flex; gap:10px; align-items:flex-end; flex-wrap:wrap; margin-bottom:12px; }
    .inline-form .f { display:flex; flex-direction:column; gap:4px; min-width:110px; flex:1; }
    .inline-form label { font-size:11px; font-weight:600; color:var(--color-text-muted); }
    .inline-form input, .inline-form select { padding:8px 10px; border:2px solid var(--color-border); border-radius:8px; font-size:13px; background:var(--color-surface); color:var(--color-text); width:100%; transition:.2s; }
    .inline-form input:focus, .inline-form select:focus { outline:none; border-color:var(--color-primary); box-shadow:0 0 0 3px rgba(102,126,234,.12); }
    .sub-table { width:100%; border-collapse:collapse; font-size:13px; margin-top:4px; }
    .sub-table th { text-align:left; padding:8px; background:var(--color-bg); font-size:11px; text-transform:uppercase; letter-spacing:.04em; color:var(--color-text-muted); border-bottom:1px solid var(--color-border); }
    .sub-table td { padding:8px; border-bottom:1px solid var(--color-border); }
    .sub-table tr:last-child td { border-bottom:none; }
    .sol-link { font-family:monospace; font-size:11px; background:var(--color-surface); border:1px solid var(--color-border); padding:2px 7px; border-radius:5px; }
    .form-header { display:flex; align-items:center; gap:12px; margin-bottom:20px; }
    .form-header h2 { font-size:20px; margin:0; color:var(--color-text); }
    `
  ],
  template: `
    <div class="container-standard">

      <div class="dashboard-header">
        <div>
          <h1>📋 Solicitações de Orçamento</h1>
          <p class="subtitle">Ponto de entrada do processo — cotações enviadas a N despachantes</p>
        </div>
        <button class="btn btn-primary" (click)="openForm()">+ Nova Solicitação</button>
      </div>

      <!-- ── LISTAGEM ── -->
      <ng-container *ngIf="!showForm">
        <div class="content-section">
          <div class="toolbar">
            <input class="search" type="text" [(ngModel)]="q"
              placeholder="🔎 Buscar por código, responsável ou porto" />
            <select class="filter-select" [(ngModel)]="filtroStatus">
              <option value="">Todos os status</option>
              <option value="Rascunho">Rascunho</option>
              <option value="Aberta">Aberta</option>
              <option value="EmAnalise">Em Análise</option>
              <option value="Aprovada">Aprovada</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Porto Origem</th>
                <th>Porto Destino</th>
                <th>Responsável</th>
                <th>Container</th>
                <th>Data</th>
                <th>Despachantes</th>
                <th>Status</th>
                <th style="width:100px">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="filtered.length === 0">
                <td colspan="9" class="empty-state">Nenhuma solicitação cadastrada</td>
              </tr>
              <tr *ngFor="let s of filtered">
                <td><span class="sol-link">{{ s.codigoInterno }}</span></td>
                <td>{{ nomePortoOrigem(s.portoOrigemId) }}</td>
                <td>{{ nomePortoDestino(s.portoDestinoId) }}</td>
                <td>{{ s.responsavel }}</td>
                <td><span class="badge">{{ s.tamContainer }}</span></td>
                <td>{{ s.data | date:'dd/MM/yyyy' }}</td>
                <td>
                  <span class="badge">{{ contarDespachantes(s.id) }}</span>
                </td>
                <td>
                  <span class="status-badge" [ngStyle]="{ background: statusColor(s.status) }">
                    {{ s.status }}
                  </span>
                </td>
                <td>
                  <div class="row-actions">
                    <button class="btn-icon" (click)="openForm(s)" title="Editar">✏️</button>
                    <button class="btn-icon danger" (click)="remover(s.id)" title="Excluir">🗑️</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </ng-container>

      <!-- ── FORMULÁRIO ── -->
      <ng-container *ngIf="showForm">
        <div class="detail-header">
          <h2>{{ editando ? 'Editar Solicitação' : 'Nova Solicitação' }}</h2>
          <p *ngIf="editando"><span class="sol-link">{{ form.codigoInterno }}</span></p>
        </div>

        <div class="card">
          <!-- Dados básicos -->
          <div class="form-grid">
            <div class="field">
              <label>Porto Origem <span class="required">*</span></label>
              <select [(ngModel)]="form.portoOrigemId" [class.err]="showErr && !form.portoOrigemId">
                <option value="">— Selecione —</option>
                <option *ngFor="let p of portosOrigem" [value]="p.id">{{ p.nome }} ({{ p.codigo }})</option>
              </select>
              <span class="err-msg" *ngIf="showErr && !form.portoOrigemId">Obrigatório</span>
            </div>
            <div class="field">
              <label>Porto Destino <span class="required">*</span></label>
              <select [(ngModel)]="form.portoDestinoId" [class.err]="showErr && !form.portoDestinoId">
                <option value="">— Selecione —</option>
                <option *ngFor="let p of portosDestino" [value]="p.id">{{ p.nome }} ({{ p.codigo }})</option>
              </select>
              <span class="err-msg" *ngIf="showErr && !form.portoDestinoId">Obrigatório</span>
            </div>
            <div class="field">
              <label>Cliente (opcional)</label>
              <select [(ngModel)]="form.clienteId">
                <option value="">— nenhum —</option>
                <option *ngFor="let c of clientes" [value]="c.id">{{ c.razaoSocial }}</option>
              </select>
            </div>
            <div class="field">
              <label>Importador (opcional)</label>
              <select [(ngModel)]="form.importadorId">
                <option value="">— nenhum —</option>
                <option *ngFor="let i of importadores" [value]="i.id">{{ i.razaoSocial }}</option>
              </select>
            </div>
            <div class="field">
              <label>Responsável</label>
              <input type="text" [value]="form.responsavel" readonly
                style="background:var(--color-bg);cursor:default;opacity:.75" />
            </div>
            <div class="field">
              <label>Data <span class="required">*</span></label>
              <input type="date" [(ngModel)]="form.data" [class.err]="showErr && !form.data" />
              <span class="err-msg" *ngIf="showErr && !form.data">Obrigatório</span>
            </div>
            <div class="field">
              <label>Container</label>
              <select [(ngModel)]="form.tamContainer">
                <option value="20">20'</option>
                <option value="40">40'</option>
                <option value="LCL">LCL</option>
              </select>
            </div>
            <div class="field">
              <label>Peso (kg)</label>
              <input type="number" [(ngModel)]="form.peso" min="0" />
            </div>
            <div class="field">
              <label>Status</label>
              <select [(ngModel)]="form.status">
                <option value="Rascunho">Rascunho</option>
                <option value="Aberta">Aberta</option>
                <option value="EmAnalise">Em Análise</option>
                <option value="Aprovada">Aprovada</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>
            <div class="field w2">
              <label>Observação</label>
              <input type="text" [(ngModel)]="form.observacao" placeholder="Observações gerais..." />
            </div>
          </div>

          <!-- Seção despachantes -->
          <div class="section-card">
            <h3>🧭 Despachantes consultados</h3>

            <div class="inline-form">
              <div class="f">
                <label>Despachante</label>
                <select [(ngModel)]="despaForm.despachanteId">
                  <option value="">— Selecione —</option>
                  <option *ngFor="let d of despachantesDisponiveis" [value]="d.id">{{ d.nome }}</option>
                </select>
              </div>
              <div class="f" style="max-width:145px">
                <label>Data Envio</label>
                <input type="date" [(ngModel)]="despaForm.dataEnvio" />
              </div>
              <div class="f" style="max-width:120px">
                <label>&nbsp;</label>
                <button class="btn btn-secondary" (click)="addDespachante()"
                  [disabled]="!despaForm.despachanteId">+ Adicionar</button>
              </div>
            </div>

            <ng-container *ngIf="depachantesForm.length > 0">
              <table class="sub-table">
                <thead>
                  <tr>
                    <th>Despachante</th>
                    <th>Status Solicitação</th>
                    <th>Data Envio</th>
                    <th>Custo Gerado</th>
                    <th>Status Custo</th>
                    <th style="width:40px"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let d of depachantesForm; let i = index">
                    <td>{{ nomeDespachanteById(d.despachanteId) }}</td>
                    <td>
                      <span class="status-badge" [ngStyle]="{ background: despStatusColor(d.status) }">
                        {{ despStatusLabel(d.status) }}
                      </span>
                    </td>
                    <td>{{ d.dataEnvio | date:'dd/MM/yyyy' }}</td>
                    <td>
                      <ng-container *ngIf="custoPorDespachante(d.despachanteId) as custo">
                        <span class="sol-link">{{ custo.codigoInterno }}</span>
                      </ng-container>
                      <span *ngIf="!custoPorDespachante(d.despachanteId)" style="color:var(--color-text-muted);font-size:12px">— Não gerado</span>
                    </td>
                    <td>
                      <ng-container *ngIf="custoPorDespachante(d.despachanteId) as custo">
                        <span class="status-badge" [ngStyle]="{ background: custo.status === 'Finalizado' ? '#22c55e' : '#f59e0b' }">
                          {{ custo.status }}
                        </span>
                      </ng-container>
                    </td>
                    <td>
                      <button class="btn-icon danger" (click)="removeDespachante(i)"
                        [disabled]="!!custoPorDespachante(d.despachanteId)"
                        [title]="custoPorDespachante(d.despachanteId) ? 'Não é possível remover — custo já gerado' : 'Remover'">🗑️</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </ng-container>
            <p *ngIf="depachantesForm.length === 0" style="font-size:13px;color:var(--color-text-muted);margin:0">
              Nenhum despachante adicionado.
            </p>
          </div>

          <!-- Seção documentos -->
          <div class="section-card">
            <h3>� Packlist</h3>

            <div class="inline-form">
              <div class="f">
                <label>Nome do arquivo</label>
                <input type="text" [(ngModel)]="docForm.nomeArquivo" placeholder="Ex: Proforma Invoice" />
              </div>
              <div class="f" style="flex:2">
                <label>Arquivo</label>
                <div style="display:flex;gap:6px;align-items:center">
                  <input #fileInput type="file" style="display:none" (change)="onFileSelected($event)" />
                  <input type="text" [value]="docForm.linkDocumento" readonly
                    placeholder="Clique em Buscar para selecionar..."
                    style="flex:1;cursor:pointer;background:var(--color-bg);padding:8px 10px;border:2px solid var(--color-border);border-radius:8px;font-size:13px;color:var(--color-text)"
                    (click)="fileInput.click()" />
                  <button class="btn btn-secondary" type="button" style="white-space:nowrap" (click)="fileInput.click()">📂 Buscar</button>
                </div>
              </div>
              <div class="f" style="max-width:145px">
                <label>Data Upload</label>
                <input type="date" [(ngModel)]="docForm.dataUpload" />
              </div>
              <div class="f">
                <label>Observação</label>
                <input type="text" [(ngModel)]="docForm.observacao" placeholder="Opcional" />
              </div>
              <div class="f" style="max-width:120px">
                <label>&nbsp;</label>
                <button class="btn btn-secondary" (click)="addDocumento()"
                  [disabled]="!docForm.nomeArquivo">+ Adicionar</button>
              </div>
            </div>

            <ng-container *ngIf="documentosForm.length > 0">
              <table class="sub-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Link</th>
                    <th>Data</th>
                    <th>Observação</th>
                    <th style="width:40px"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let d of documentosForm; let i = index">
                    <td>{{ d.nomeArquivo }}</td>
                    <td>
                      <span style="font-size:12px;font-family:monospace;color:var(--color-text-muted)">{{ d.linkDocumento || '—' }}</span>
                    </td>
                    <td>{{ d.dataUpload | date:'dd/MM/yyyy' }}</td>
                    <td>{{ d.observacao || '—' }}</td>
                    <td>
                      <button class="btn-icon danger" (click)="removeDocumento(i)" title="Remover">🗑️</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </ng-container>
            <p *ngIf="documentosForm.length === 0" style="font-size:13px;color:var(--color-text-muted);margin:0">
              Nenhum documento adicionado.
            </p>
          </div>

          <!-- Ações do form -->
          <div class="actions">
            <button class="btn btn-primary" (click)="salvar()">Salvar</button>
            <button class="btn btn-secondary" (click)="cancelar()">Cancelar</button>
            <div style="flex:1"></div>
            <button class="btn btn-secondary" (click)="gerarCustoDespachante()" [disabled]="!editando"
              [title]="editando ? 'Abrir wizard de custo pré-preenchido' : 'Salve primeiro para gerar custo'">
              💼 Gerar CustoDespachante
            </button>
          </div>
          <p *ngIf="!editando" style="font-size:11px;color:var(--color-text-muted);margin-top:8px">
            * Salve a solicitação antes de gerar um CustoDespachante
          </p>
        </div>
      </ng-container>

    </div>
  `
})
export class SolicitacaoOrcamentoComponent implements OnInit {

  solicitacoes: SolicitacaoOrcamento[] = [];
  portosOrigem: PortoOrigem[] = [];
  portosDestino: PortoDestino[] = [];
  clientes: ClienteV2[] = [];
  importadores: Importador[] = [];
  despachantes: DespachanteV2[] = [];

  showForm = false;
  editando = false;
  showErr = false;

  q = '';
  filtroStatus = '';

  form!: SolicitacaoOrcamento;

  // sub-entidades em memória durante edição
  depachantesForm: DespaForm[] = [];
  documentosForm: DocForm[] = [];

  despaForm: DespaForm = this.emptyDespaForm();
  docForm: DocForm = this.emptyDocForm();

  constructor(
    private svc: SolicitacaoOrcamentoService,
    private portoOrigemSvc: PortoOrigemService,
    private portoDestinoSvc: PortoDestinoService,
    private clienteSvc: ClienteV2Service,
    private importadorSvc: ImportadorService,
    private despachanteSvc: DespachanteV2Service,
    private custoDespachanteSvc: CustoDespachanteService,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.emptyForm();
  }

  ngOnInit(): void {
    this.carregar();
  }

  /** Despachantes ainda não adicionados à solicitação (exclui os já na lista) */
  get despachantesDisponiveis(): DespachanteV2[] {
    const adicionados = new Set(this.depachantesForm.map(d => d.despachanteId));
    return this.despachantes.filter(d => !adicionados.has(d.id));
  }

  private carregar(): void {
    this.solicitacoes = this.svc.getAll();
    this.portosOrigem = this.portoOrigemSvc.getAll().filter(p => p.ativo);
    this.portosDestino = this.portoDestinoSvc.getAll().filter(p => p.ativo);
    this.clientes = this.clienteSvc.getAll().filter(c => c.ativo);
    this.importadores = this.importadorSvc.getAll().filter(i => i.ativo);
    this.despachantes = this.despachanteSvc.getAll().filter(d => d.ativo);
  }

  get filtered(): SolicitacaoOrcamento[] {
    const s = this.q.toLowerCase();
    return this.solicitacoes.filter(sol => {
      const matchQ = !s
        || sol.codigoInterno.toLowerCase().includes(s)
        || sol.responsavel.toLowerCase().includes(s)
        || this.nomePortoOrigem(sol.portoOrigemId).toLowerCase().includes(s)
        || this.nomePortoDestino(sol.portoDestinoId).toLowerCase().includes(s);
      const matchStatus = !this.filtroStatus || sol.status === this.filtroStatus;
      return matchQ && matchStatus;
    });
  }

  openForm(sol?: SolicitacaoOrcamento): void {
    this.showErr = false;
    if (sol) {
      this.editando = true;
      this.form = { ...sol };
      // carregar sub-entidades
      const despas = this.svc.getDespachantes(sol.id);
      this.depachantesForm = despas.map(d => ({
        despachanteId: d.despachanteId,
        status: d.status,
        dataEnvio: d.dataEnvio
      }));
      const docs = this.svc.getDocumentos(sol.id);
      this.documentosForm = docs.map(d => ({
        nomeArquivo: d.nomeArquivo,
        linkDocumento: d.linkDocumento,
        dataUpload: d.dataUpload,
        observacao: d.observacao ?? ''
      }));
    } else {
      this.editando = false;
      this.form = this.emptyForm();
      this.depachantesForm = [];
      this.documentosForm = [];
    }
    this.despaForm = this.emptyDespaForm();
    this.docForm = this.emptyDocForm();
    this.showForm = true;
  }

  cancelar(): void {
    this.showForm = false;
    this.showErr = false;
  }

  salvar(): void {
    if (!this.form.portoOrigemId || !this.form.portoDestinoId || !this.form.data) {
      this.showErr = true;
      return;
    }

    if (this.editando) {
      this.svc.update(this.form);
    } else {
      const criada = this.svc.create({
        clienteId:       this.form.clienteId,
        importadorId:    this.form.importadorId,
        portoOrigemId:   this.form.portoOrigemId,
        portoDestinoId:  this.form.portoDestinoId,
        responsavel:     this.auth.currentUser?.username ?? '',
        tamContainer:    this.form.tamContainer,
        peso:            this.form.peso,
        observacao:      this.form.observacao,
        status:          'Rascunho',
        data:            this.form.data
      });
      this.form.id = criada.id;
      this.form.codigoInterno = criada.codigoInterno;
      this.editando = true;
    }

    // Sincronizar despachantes: preserva status atual do storage para não perder atualizações do custo
    const liveStatuses = new Map<string, StatusSolicitacaoDespachante>();
    this.svc.getDespachantes(this.form.id).forEach(d => {
      liveStatuses.set(d.despachanteId, d.status);
      this.svc.removeDespachante(d.id);
    });
    this.depachantesForm.forEach(d => {
      this.svc.addDespachante({
        solicitacaoOrcamentoId: this.form.id,
        despachanteId: d.despachanteId,
        status: liveStatuses.get(d.despachanteId) ?? d.status,
        dataEnvio: d.dataEnvio
      });
    });

    // Sincronizar documentos: remover tudo e recriar
    this.svc.getDocumentos(this.form.id).forEach(d => this.svc.removeDocumento(d.id));
    this.documentosForm.forEach(d => {
      this.svc.addDocumento({
        solicitacaoOrcamentoId: this.form.id,
        nomeArquivo: d.nomeArquivo,
        linkDocumento: d.linkDocumento,
        dataUpload: d.dataUpload,
        observacao: d.observacao || undefined
      });
    });

    this.carregar();
    this.showForm = false;
    this.showErr = false;
  }

  remover(id: string): void {
    if (!confirm('Excluir esta solicitação e todos os seus despachantes e documentos?')) return;
    this.svc.remove(id);
    this.carregar();
  }

  // ── Despachantes inline ──────────────────────────────────────────────

  addDespachante(): void {
    if (!this.despaForm.despachanteId) return;
    this.depachantesForm.push({
      despachanteId: this.despaForm.despachanteId,
      status: 'PendenteDespachante',
      dataEnvio: this.despaForm.dataEnvio
    });
    this.despaForm = this.emptyDespaForm();
  }

  removeDespachante(i: number): void {
    this.depachantesForm.splice(i, 1);
  }

  // ── Documentos inline ────────────────────────────────────────────────

  addDocumento(): void {
    if (!this.docForm.nomeArquivo) return;
    this.documentosForm.push({ ...this.docForm });
    this.docForm = this.emptyDocForm();
  }

  removeDocumento(i: number): void {
    this.documentosForm.splice(i, 1);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.docForm.linkDocumento = file.name;
      if (!this.docForm.nomeArquivo) {
        this.docForm.nomeArquivo = file.name;
      }
    }
  }

  // ── Gerar CustoDespachante ───────────────────────────────────────────

  gerarCustoDespachante(): void {
    if (!this.editando) return;
    if (this.depachantesForm.length === 0) {
      alert('Adicione ao menos um despachante antes de gerar os custos.');
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    let criados = 0;
    this.depachantesForm.forEach(d => {
      const jaExiste = this.custoDespachanteSvc.getAll().some(
        c => c.solicitacaoOrcamentoId === this.form.id && c.despachanteId === d.despachanteId
      );
      if (!jaExiste) {
        this.custoDespachanteSvc.create({
          despachanteId:          d.despachanteId,
          importadorId:           this.form.importadorId ?? '',
          portoOrigemId:          this.form.portoOrigemId,
          portoDestinoId:         this.form.portoDestinoId,
          responsavel:            this.form.responsavel,
          tamContainer:           this.form.tamContainer,
          peso:                   this.form.peso,
          fobUsd:                 0,
          fobReais:               0,
          cifUsd:                 0,
          cifReais:               0,
          seguroUsd:              0,
          taxaUsd:                0,
          data:                   today,
          observacao:             this.form.observacao,
          solicitacaoOrcamentoId: this.form.id,
          status:                 'Rascunho'
        });
        criados++;
      }
    });
    // Transitar status para Aberta
    this.form.status = 'Aberta';
    this.svc.update(this.form);
    this.carregar();
    if (criados > 0) {
      alert(`${criados} custo(s) despachante gerado(s). Solicitação agora está Aberta.`);
    }
    this.router.navigate(['/custos']);
  }

  custoPorDespachante(despachanteId: string): CustoDespachante | undefined {
    if (!this.form?.id) return undefined;
    return this.custoDespachanteSvc.getAll().find(
      c => c.solicitacaoOrcamentoId === this.form.id && c.despachanteId === despachanteId
    );
  }

  // ── Helpers de lookup ────────────────────────────────────────────────

  nomePortoOrigem(id: string): string {
    return this.portosOrigem.find(p => p.id === id)?.nome ?? id;
  }

  nomePortoDestino(id: string): string {
    return this.portosDestino.find(p => p.id === id)?.nome ?? id;
  }

  nomeDespachanteById(id: string): string {
    return this.despachantes.find(d => d.id === id)?.nome ?? id;
  }

  contarDespachantes(solId: string): number {
    return this.svc.getDespachantes(solId).length;
  }

  statusColor(status: StatusSolicitacao): string {
    return STATUS_COLORS[status] ?? '#6b7280';
  }

  despStatusColor(status: StatusSolicitacaoDespachante): string {
    return DESP_STATUS_COLORS[status] ?? '#6b7280';
  }

  despStatusLabel(status: StatusSolicitacaoDespachante): string {
    const map: Record<StatusSolicitacaoDespachante, string> = {
      PendenteDespachante:   'Pendente Despachante',
      FinalizadoDespachante: 'Finalizado Despachante',
      Respondido:            'Respondido',
      Recusado:              'Recusado',
    };
    return map[status] ?? status;
  }

  truncateLink(link: string): string {
    return link.length > 40 ? link.slice(0, 40) + '...' : link;
  }

  // ── Formulários vazios ───────────────────────────────────────────────

  private emptyForm(): SolicitacaoOrcamento {
    const today = new Date().toISOString().slice(0, 10);
    return {
      id: '',
      codigoInterno: '',
      clienteId: '',
      importadorId: '',
      portoOrigemId: '',
      portoDestinoId: '',
      responsavel: this.auth.currentUser?.username ?? '',
      tamContainer: '40',
      peso: 0,
      observacao: '',
      status: 'Rascunho',
      data: today
    };
  }

  private emptyDespaForm(): DespaForm {
    return {
      despachanteId: '',
      status: 'PendenteDespachante',
      dataEnvio: new Date().toISOString().slice(0, 10)
    };
  }

  private emptyDocForm(): DocForm {
    return {
      nomeArquivo: '',
      linkDocumento: '',
      dataUpload: new Date().toISOString().slice(0, 10),
      observacao: ''
    };
  }
}
