import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUD_STYLES } from '../../../shared/styles/crud-page.styles';
import { PaginationComponent } from '../../../../core/components/pagination/pagination.component';
import { PagedResult, PaginationParams } from '../../../../core/api/models/api-response.model';
import { AuthService } from '../../../../features/auth/auth.providers';
import { CustoDespachanteService } from '../../custo-despachante/services/custo-despachante.service';
import { CustoDespachante } from '../../custo-despachante/models/custo-despachante.models';
import {
  SolicitacaoOrcamento,
  SolicitacaoOrcamentoDespachante,
  SolicitacaoOrcamentoDocumento,
  StatusSolicitacao
} from '../models/solicitacao-orcamento.models';
import { SolicitacaoOrcamentoService } from '../services/solicitacao-orcamento.service';
import { OrcamentoVendaService } from '../../orcamento-venda/services/orcamento-venda.service';
import { OrcamentoVenda } from '../../orcamento-venda/models/orcamento-venda.models';
import { EmbarqueAduanaService } from '../../embarque-aduana/services/embarque-aduana.service';
import { StatusEmbarqueService } from '../../embarque-aduana/services/status-embarque.service';
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
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../../core/services/confirm-dialog.service';


interface DespaForm {
  despachanteId: string;
  dataEnvio: string;
}

interface DocForm {
  nomeArquivo: string;
  linkDocumento: string;
  dataUpload: string;
  observacao: string;
}

const STATUS_COLORS: Record<StatusSolicitacao, string> = {
  AguardandoDespachante:       '#f59e0b',
  AguardandoReabertura:        '#f97316',
  AguardandoOrcamentoVenda:    '#8b5cf6',
  AguardandoAprovacaoCliente:  '#0ea5e9',
  Aprovada:                    '#22c55e',
  Cancelada:                   '#ef4444',
};

const STATUS_LABELS: Record<StatusSolicitacao, string> = {
  AguardandoDespachante:       'Aguardando Despachante',
  AguardandoReabertura:        'Aguardando Reabertura',
  AguardandoOrcamentoVenda:    'Aguardando Orçamento de Venda',
  AguardandoAprovacaoCliente:  'Aguardando Aprovação Cliente',
  Aprovada:                    'Aprovada',
  Cancelada:                   'Cancelada',
};

const OV_STATUS_COLORS: Record<string, string> = {
  EmAndamento:             '#f59e0b',
  Finalizado:              '#22c55e',
  Cancelado:               '#6b7280',
};

@Component({
  selector: 'app-solicitacao-orcamento',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, CurrencyPipe, PaginationComponent],
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
    /* ===== RESPONSIVE ===== */
    @media (max-width: 768px) {
      .section-card { padding:12px 14px; }
      .inline-form { flex-direction:column; align-items:stretch; }
      .inline-form .f { min-width:unset; flex:unset; width:100%; }
      .filter-select { width:100%; flex:unset; }
    }
    @media (max-width: 480px) {
      .dashboard-header { flex-direction:column; align-items:flex-start; gap:10px; }
      .dashboard-header button { width:100%; }
      .status-badge { font-size:10px; padding:2px 7px; }
      .section-card h3 { font-size:11px; }
      .sol-link { font-size:10px; }
    }
    `
  ],
  template: `
    <div class="container-standard">

      <div class="dashboard-header">
        <div>
          <h1>📋 Solicitações de Orçamento</h1>
          <p class="subtitle">Ponto de entrada do processo — cotações enviadas a N despachantes</p>
        </div>
        <button class="btn btn-primary" *ngIf="!isDespachante" (click)="openForm()">+ Nova Solicitação</button>
      </div>

      <!-- ── LISTAGEM ── -->
      <ng-container *ngIf="!showForm">
        <div class="content-section">
          <div class="toolbar">
            <input class="search" type="text" [(ngModel)]="q"
              (ngModelChange)="onFiltersChanged()"
              placeholder="🔎 Buscar por código, responsável ou porto" />
            <select class="filter-select" [(ngModel)]="filtroStatus" (ngModelChange)="onFiltersChanged()">
              <option value="">Todos os status</option>
              <option value="AguardandoDespachante">Aguardando Despachante</option>
              <option value="AguardandoReabertura">Aguardando Reabertura</option>
              <option value="AguardandoOrcamentoVenda">Aguardando Orçamento de Venda</option>
              <option value="AguardandoAprovacaoCliente">Aguardando Aprovação Cliente</option>
              <option value="Aprovada">Aprovada</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>

          <div class="empty-state" *ngIf="loading">Carregando solicitações...</div>

          <div class="empty-state" *ngIf="!loading && hasLoadError" style="color:#b91c1c">
            {{ loadErrorMessage }}
            <div style="margin-top:8px">
              <button class="btn btn-secondary" type="button" (click)="retryLoad()">Tentar novamente</button>
            </div>
          </div>

          <table class="data-table" *ngIf="!loading && !hasLoadError">
            <thead>
              <tr>
                <th>Código</th>
                <th>Porto Origem</th>
                <th>Porto Destino</th>
                <th>Responsável</th>
                <th>Container</th>
                <th>Data</th>
                <th>Custos</th>
                <th>Orçamento</th>
                <th>Status</th>
                <th style="width:100px">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="filteredCount === 0">
                <td colspan="10" class="empty-state">Nenhuma solicitação cadastrada</td>
              </tr>
              <tr *ngFor="let s of pagedItems">
                <td><span class="sol-link">{{ s.codigoInterno }}</span></td>
                <td>{{ nomePortoOrigem(s.portoOrigemId) }}</td>
                <td>{{ nomePortoDestino(s.portoDestinoId) }}</td>
                <td>{{ s.responsavel }}</td>
                <td><span class="badge">{{ s.tamContainer }}</span></td>
                <td>{{ s.data | date:'dd/MM/yyyy' }}</td>
                <td>
                  <span class="badge">{{ contarDespachantes(s.id) }}</span>
                  <span *ngIf="contarCustosFinalizados(s.id) > 0" style="font-size:11px;color:#22c55e;margin-left:6px;font-weight:700">✅ {{ contarCustosFinalizados(s.id) }} fin.</span>
                </td>
                <td>
                  <ng-container *ngIf="orcamentoPorSolicitacao(s.id) as ov">
                    <span class="sol-link" style="cursor:pointer;color:var(--color-primary,#3b82f6)"
                      title="Abrir Orçamento de Venda" (click)="abrirOrcamento(ov.id)">{{ ov.codigoInterno }}</span>
                  </ng-container>
                  <span *ngIf="!orcamentoPorSolicitacao(s.id)" style="color:var(--color-text-muted);font-size:12px">—</span>
                </td>
                <td>
                  <span class="status-badge" [ngStyle]="{ background: statusColor(s.status) }">
                    {{ statusLabel(s.status) }}
                  </span>
                </td>
                <td>
                  <div class="row-actions">
                    <button class="btn-icon" *ngIf="!isDespachante" (click)="openForm(s)" title="Editar">✏️</button>
                    <button class="btn-icon danger" *ngIf="!isDespachante" (click)="remover(s.id)" title="Excluir">🗑️</button>
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

      <!-- ── FORMULÁRIO ── -->
      <ng-container *ngIf="showForm">
        <div class="detail-header">
          <h2>{{ editando ? 'Editar Solicitação' : 'Nova Solicitação' }}</h2>
          <p *ngIf="editando"><span class="sol-link">{{ form.codigoInterno }}</span></p>
        </div>

        <div class="card">
        <!-- Resumo de erros de validação -->
        <div *ngIf="showErr" style="background:#fef2f2;border:1.5px solid #fca5a5;border-radius:8px;padding:10px 14px;margin-bottom:14px;font-size:13px;color:#b91c1c;">
          <strong>⚠️ Corrija os campos obrigatórios:</strong>
          <ul style="margin:6px 0 0 18px;padding:0">
            <li *ngIf="!form.portoOrigemId">Porto Origem é obrigatório</li>
            <li *ngIf="!form.portoDestinoId">Porto Destino é obrigatório</li>
            <li *ngIf="!form.data">Data é obrigatória</li>
            <li *ngIf="!editando && depachantesForm.length === 0">Adicione ao menos um Despachante</li>
            <li *ngFor="let apiMsg of getApiValidationSummary()">{{ apiMsg }}</li>
          </ul>
        </div>

          <!-- Dados básicos -->
          <div class="form-grid">
            <div class="field">
              <label>Porto Origem <span class="required">*</span></label>
              <select [(ngModel)]="form.portoOrigemId" [class.err]="showErr && (!form.portoOrigemId || hasApiFieldError('portoOrigemId', 'portoOrigem', 'portoorigemid'))">
                <option value="">— Selecione —</option>
                <option *ngFor="let p of portosOrigem" [value]="p.id">{{ p.nome }} ({{ p.codigo }})</option>
              </select>
              <span class="err-msg" *ngIf="showErr && !form.portoOrigemId">Obrigatório</span>
              <span class="err-msg" *ngIf="showErr && hasApiFieldError('portoOrigemId', 'portoOrigem', 'portoorigemid')">{{ firstApiFieldError('portoOrigemId', 'portoOrigem', 'portoorigemid') }}</span>
            </div>
            <div class="field">
              <label>Porto Destino <span class="required">*</span></label>
              <select [(ngModel)]="form.portoDestinoId" [class.err]="showErr && (!form.portoDestinoId || hasApiFieldError('portoDestinoId', 'portoDestino', 'portodestinoid'))">
                <option value="">— Selecione —</option>
                <option *ngFor="let p of portosDestino" [value]="p.id">{{ p.nome }} ({{ p.codigo }})</option>
              </select>
              <span class="err-msg" *ngIf="showErr && !form.portoDestinoId">Obrigatório</span>
              <span class="err-msg" *ngIf="showErr && hasApiFieldError('portoDestinoId', 'portoDestino', 'portodestinoid')">{{ firstApiFieldError('portoDestinoId', 'portoDestino', 'portodestinoid') }}</span>
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
              <input type="date" [(ngModel)]="form.data" [class.err]="showErr && (!form.data || hasApiFieldError('data'))" />
              <span class="err-msg" *ngIf="showErr && !form.data">Obrigatório</span>
              <span class="err-msg" *ngIf="showErr && hasApiFieldError('data')">{{ firstApiFieldError('data') }}</span>
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
            <div class="field" *ngIf="editando">
              <label>Status (processo)</label>
              <input type="text" [value]="statusLabel(form.status)" readonly
                style="background:var(--color-bg);cursor:default;opacity:.75" />
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
                    <th>Data Envio</th>
                    <th>Custo Gerado</th>
                    <th>Status Custo</th>
                    <th style="width:40px"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let d of depachantesForm; let i = index">
                    <td>{{ nomeDespachanteById(d.despachanteId) }}</td>
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
            <p *ngIf="showErr && !editando && depachantesForm.length === 0"
               style="font-size:12px;color:#ef4444;margin:6px 0 0;font-weight:600">
              ⚠️ Adicione ao menos um despachante para criar a solicitação.
            </p>
          </div>

          <!-- Seção orçamento de venda -->
          <div class="section-card" *ngIf="editando">
            <h3>💰 Orçamento de Venda</h3>
            <ng-container *ngIf="orcDaSolicitacao() as ov; else semOrcamento">
              <table class="sub-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Data</th>
                    <th>Total Geral</th>
                    <th>Status</th>
                    <th style="width:60px"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span class="sol-link">{{ ov.codigoInterno }}</span></td>
                    <td>{{ ov.data | date:'dd/MM/yyyy' }}</td>
                    <td>{{ ov.totalGeral | currency:'BRL':'symbol':'1.2-2' }}</td>
                    <td>
                      <span class="status-badge" [ngStyle]="{ background: ovStatusColor(ov.status) }">
                        {{ ovStatusLabel(ov.status) }}
                      </span>
                    </td>
                    <td>
                      <button class="btn-icon" (click)="abrirOrcamento(ov.id)" title="Abrir Orçamento">🔗</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </ng-container>
            <ng-template #semOrcamento>
              <p style="font-size:13px;color:var(--color-text-muted);margin:0">Nenhum orçamento de venda vinculado.</p>
            </ng-template>
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
            <button class="btn btn-primary" (click)="salvar()">{{ editando ? 'Salvar' : 'Criar' }}</button>
            <button class="btn" *ngIf="canDecidirSolicitacao()" style="background:#22c55e;color:#fff" (click)="aprovarSolicitacao()">✅ Aprovado Cliente</button>
            <button class="btn" *ngIf="canDecidirSolicitacao()" style="background:#ef4444;color:#fff" (click)="cancelarSolicitacao()">⛔ Cancelado</button>
            <button class="btn btn-secondary" (click)="cancelar()">Cancelar</button>
          </div>
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
  custos: CustoDespachante[] = [];
  orcamentosVenda: OrcamentoVenda[] = [];

  showForm = false;
  editando = false;
  showErr = false;
  apiFieldErrors: Record<string, string[]> = {};
  loading = false;
  isDespachante = false;
  hasLoadError = false;
  loadErrorMessage = '';

  q = '';
  filtroStatus = '';
  currentPage = 1;
  pageSize = 20;
  pagedResult: PagedResult<SolicitacaoOrcamento> | null = null;

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
    private orcVendaSvc: OrcamentoVendaService,
    private embarqueSvc: EmbarqueAduanaService,
    private statusEmbarqueSvc: StatusEmbarqueService,
    private auth: AuthService,
    private router: Router,
    private toast: ToastService,
    private confirmDialog: ConfirmDialogService
  ) {
    this.form = this.emptyForm();
  }

  ngOnInit(): void {
    this.isDespachante = this.auth.hasRole('despachante');
    void this.carregar();
  }

  /** Despachantes ainda não adicionados à solicitação (exclui os já na lista) */
  get despachantesDisponiveis(): DespachanteV2[] {
    const adicionados = new Set(this.depachantesForm.map(d => d.despachanteId));
    return this.despachantes.filter(d => !adicionados.has(d.id));
  }

  private async carregar(): Promise<void> {
    this.loading = true;
    this.hasLoadError = false;
    this.loadErrorMessage = '';

    try {
      await this.svc.refresh();
      this.solicitacoes = this.svc.getAll();
      await this.refreshFluxoData();
      this.portosOrigem = this.portoOrigemSvc.getAll().filter(p => p.ativo);
      this.portosDestino = this.portoDestinoSvc.getAll().filter(p => p.ativo);
      this.clientes = this.clienteSvc.getAll().filter(c => c.ativo);
      this.importadores = this.importadorSvc.getAll().filter(i => i.ativo);
      this.despachantes = this.despachanteSvc.getAll().filter(d => d.ativo);
      this.updatePagedResult();
    } catch (err: any) {
      this.hasLoadError = true;
      this.loadErrorMessage = err?.message ?? 'Erro ao carregar solicitações.';
      this.toast.error(this.loadErrorMessage);
    } finally {
      this.loading = false;
    }
  }

  private async refreshFluxoData(): Promise<void> {
    await Promise.all([
      this.custoDespachanteSvc.refresh(),
      this.orcVendaSvc.refresh(),
    ]);

    const [custos, orcamentos] = [
      this.custoDespachanteSvc.getAll(),
      this.orcVendaSvc.getAll(),
    ];
    this.custos = custos;
    this.orcamentosVenda = orcamentos;
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

  get filteredCount(): number {
    return this.filtered.length;
  }

  get pagedItems(): SolicitacaoOrcamento[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  onPageChange(params: PaginationParams): void {
    this.currentPage = params.page ?? 1;
    this.pageSize = params.pageSize ?? this.pageSize;
    this.updatePagedResult();
  }

  onFiltersChanged(): void {
    this.currentPage = 1;
    this.updatePagedResult();
  }

  retryLoad(): void {
    void this.carregar();
  }

  private updatePagedResult(): void {
    const totalCount = this.filtered.length;
    const safePageSize = this.pageSize > 0 ? this.pageSize : 20;
    const totalPages = Math.max(1, Math.ceil(totalCount / safePageSize));
    if (this.currentPage > totalPages) {
      this.currentPage = totalPages;
    }

    this.pagedResult = {
      items: this.pagedItems,
      totalCount,
      page: this.currentPage,
      pageSize: safePageSize,
      totalPages,
      hasNextPage: this.currentPage < totalPages,
      hasPreviousPage: this.currentPage > 1
    };
  }

  async openForm(sol?: SolicitacaoOrcamento): Promise<void> {
    this.showErr = false;
    this.apiFieldErrors = {};
    if (sol) {
      this.editando = true;
      this.form = { ...sol };
      // carregar sub-entidades
      const despas = await this.svc.loadDespachantes(sol.id);
      this.depachantesForm = despas.map(d => ({
        despachanteId: d.despachanteId,
        dataEnvio: d.dataEnvio
      }));
      const docs = await this.svc.loadDocumentos(sol.id);
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
    this.apiFieldErrors = {};
  }

  async salvar(): Promise<void> {
    this.apiFieldErrors = {};

    if (!this.form.portoOrigemId || !this.form.portoDestinoId || !this.form.data) {
      this.showErr = true;
      return;
    }

    const eraCriacao = !this.editando;

    // Despachante obrigatório na criação
    if (eraCriacao && this.depachantesForm.length === 0) {
      this.showErr = true;
      return;
    }

    try {
      if (this.editando) {
        await this.svc.update(this.form);
      } else {
        const criada = await this.svc.create({
          clienteId:       this.form.clienteId,
          importadorId:    this.form.importadorId,
          portoOrigemId:   this.form.portoOrigemId,
          portoDestinoId:  this.form.portoDestinoId,
          responsavel:     this.auth.currentUser?.username ?? '',
          tamContainer:    this.form.tamContainer,
          peso:            this.form.peso,
          observacao:      this.form.observacao,
          data:            this.form.data
        });
        this.form.id = criada.id;
        this.form.codigoInterno = criada.codigoInterno;
        this.editando = true;
      }

      // Sincronizar despachantes por diff (evita remover/recriar vínculos e duplicar custo despachante)
      await this.svc.loadDespachantes(this.form.id);
      const despachantesAtuais = this.svc.getDespachantes(this.form.id);

      const atuaisPorDespachante = new Map(despachantesAtuais.map(d => [d.despachanteId, d]));
      const formPorDespachante = new Map(this.depachantesForm.map(d => [d.despachanteId, d]));

      // Remove apenas vínculos que saíram do formulário
      for (const atual of despachantesAtuais) {
        if (!formPorDespachante.has(atual.despachanteId)) {
          await this.svc.removeDespachante(atual.id, atual.solicitacaoOrcamentoId);
        }
      }

      // Adiciona apenas novos vínculos
      for (const d of this.depachantesForm) {
        if (!atuaisPorDespachante.has(d.despachanteId)) {
          await this.svc.addDespachante({
            solicitacaoOrcamentoId: this.form.id,
            despachanteId: d.despachanteId,
            dataEnvio: d.dataEnvio
          });
        }
      }

      // Sincronizar documentos: remover tudo e recriar
      await this.svc.loadDocumentos(this.form.id);
      for (const d of this.svc.getDocumentos(this.form.id)) {
        await this.svc.removeDocumento(d.id, d.solicitacaoOrcamentoId);
      }
      for (const d of this.documentosForm) {
        await this.svc.addDocumento({
          solicitacaoOrcamentoId: this.form.id,
          nomeArquivo: d.nomeArquivo,
          linkDocumento: d.linkDocumento,
          dataUpload: d.dataUpload,
          observacao: d.observacao || undefined
        });
      }

      // Custos são criados automaticamente no backend ao vincular cada despachante.

      await this.carregar();
      this.showForm = false;
      this.showErr = false;
      this.apiFieldErrors = {};
      this.onFiltersChanged();
      this.toast.success(eraCriacao ? 'Solicitacao criada com sucesso.' : 'Solicitacao atualizada com sucesso.');
    } catch (err: any) {
      this.showErr = true;
      this.apiFieldErrors = this.collectFieldErrors(err);
      if (!Object.keys(this.apiFieldErrors).length && err?.message) {
        this.toast.error(err.message);
      }
    }
  }

  async remover(id: string): Promise<void> {
    const ok = await this.confirmDialog.confirm({
      title: 'Excluir solicitacao',
      message: 'Excluir esta solicitacao e todos os seus despachantes e documentos?',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      danger: true
    });
    if (!ok) return;

    try {
      await this.svc.remove(id);
      await this.carregar();
      this.onFiltersChanged();
      this.toast.success('Solicitacao removida com sucesso.');
    } catch (err: any) {
      this.toast.error(err?.message ?? 'Erro ao remover solicitacao.');
    }
  }

  // ── Despachantes inline ──────────────────────────────────────────────

  addDespachante(): void {
    if (!this.despaForm.despachanteId) return;
    this.depachantesForm.push({
      despachanteId: this.despaForm.despachanteId,
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

  canDecidirSolicitacao(): boolean {
    return this.editando && !this.isDespachante && this.form.status === 'AguardandoAprovacaoCliente';
  }

  async aprovarSolicitacao(): Promise<void> {
    if (!this.form?.id) return;

    const ok = await this.confirmDialog.confirm({
      title: 'Aprovar solicitação',
      message: 'Confirma a aprovação desta solicitação?',
      confirmText: 'Aprovar',
      cancelText: 'Cancelar',
      danger: false
    });
    if (!ok) return;

    try {
      await this.svc.aprovar(this.form.id);
      await this._criarEmbarqueParaSolicitacao();
      await this.carregar();
      this.form = this.svc.getById(this.form.id) ?? this.form;
      this.toast.success('Solicitação aprovada com sucesso.');
    } catch (err: any) {
      this.toast.error(err?.message ?? 'Erro ao aprovar solicitação.');
    }
  }

  async cancelarSolicitacao(): Promise<void> {
    if (!this.form?.id) return;

    const ok = await this.confirmDialog.confirm({
      title: 'Cancelar solicitação',
      message: 'Confirma o cancelamento desta solicitação? Custos e orçamentos vinculados serão cancelados.',
      confirmText: 'Cancelar solicitação',
      cancelText: 'Voltar',
      danger: true
    });
    if (!ok) return;

    try {
      await this.svc.cancelar(this.form.id);
      await this.carregar();
      this.form = this.svc.getById(this.form.id) ?? this.form;
      this.toast.success('Solicitação cancelada com sucesso.');
    } catch (err: any) {
      this.toast.error(err?.message ?? 'Erro ao cancelar solicitação.');
    }
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

  // ── Gerar CustoDespachante (chamado automaticamente na criação) ──

  private async _gerarCustos(): Promise<void> {
    const today = new Date().toISOString().slice(0, 10);
    for (const d of this.depachantesForm) {
      const jaExiste = this.custos.some(
        (c: CustoDespachante) => c.solicitacaoOrcamentoId === this.form.id && c.despachanteId === d.despachanteId
      );
      if (!jaExiste) {
        const created = await this.custoDespachanteSvc.create({
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
        });
        this.custos.push(created);
      }
    }
  }

  orcDaSolicitacao(): OrcamentoVenda | undefined {
    if (!this.form?.id) return undefined;
    return this.orcamentosVenda.find(o => o.solicitacaoOrcamentoId === this.form.id);
  }

  ovStatusColor(status?: string): string {
    return OV_STATUS_COLORS[status ?? ''] ?? '#6b7280';
  }

  ovStatusLabel(status?: string): string {
    const map: Record<string, string> = {
      EmAndamento:             'Em Andamento',
      Finalizado:              'Finalizado',
      Cancelado:               'Cancelado',
    };
    return map[status ?? ''] ?? (status ?? '—');
  }

  custoPorDespachante(despachanteId: string): CustoDespachante | undefined {
    if (!this.form?.id) return undefined;
    return this.custos.find(
      (c: CustoDespachante) => c.solicitacaoOrcamentoId === this.form.id && c.despachanteId === despachanteId
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

  contarCustosFinalizados(solId: string): number {
    return this.custos.filter(
      (c: CustoDespachante) => c.solicitacaoOrcamentoId === solId && c.status === 'Finalizado'
    ).length;
  }

  orcamentoPorSolicitacao(solId: string): OrcamentoVenda | undefined {
    return this.orcamentosVenda.find(o => o.solicitacaoOrcamentoId === solId);
  }

  abrirOrcamento(ovId: string): void {
    this.router.navigate(['/orcamentos-venda'], { queryParams: { editId: ovId } });
  }

  statusColor(status: StatusSolicitacao): string {
    return STATUS_COLORS[status] ?? '#6b7280';
  }

  statusLabel(status: StatusSolicitacao): string {
    return STATUS_LABELS[status] ?? status;
  }

  despStatusColor(_status: string): string { return ''; }

  despStatusLabel(_status: string): string { return ''; }

  truncateLink(link: string): string {
    return link.length > 40 ? link.slice(0, 40) + '...' : link;
  }

  // ── Criar EmbarqueAduana ao aprovar solicitação ──────────────────────

  private async _criarEmbarqueParaSolicitacao(): Promise<void> {
    // Evitar duplicatas
    const jaExiste = this.embarqueSvc.getAll().some(
      e => e.solicitacaoOrcamentoId === this.form.id
    );
    if (jaExiste) return;

    // OrcamentoVenda vinculado
    const ov = this.orcamentosVenda.find(o => o.solicitacaoOrcamentoId === this.form.id);

    // Despachante: preferir o do custo selecionado no OrcamentoVenda
    let despachanteId = '';
    let custoDespachanteId: string | undefined = undefined;
    const custosDaSolicitacao = this.custos.filter(c => c.solicitacaoOrcamentoId === this.form.id);
    const custo = custosDaSolicitacao.find(c => c.status === 'Finalizado') ?? custosDaSolicitacao[0];
    if (custo) {
      despachanteId = custo.despachanteId;
      custoDespachanteId = custo.id;
    }
    // Fallback: primeiro despachante da solicitação
    if (!despachanteId) {
      const despas = this.svc.getDespachantes(this.form.id);
      despachanteId = despas[0]?.despachanteId ?? '';
    }

    const statusPrevisto = this.statusEmbarqueSvc.getPrevisto();
    const created = this.embarqueSvc.create({
      clienteId:              this.form.clienteId ?? '',
      portoOrigemId:          this.form.portoOrigemId,
      portoDestinoId:         this.form.portoDestinoId,
      despachanteId,
      agenteCargaId:          '',
      controleNavioId:        '',
      usuarioResponsavelId:   this.auth.currentUser?.username ?? '',
      statusEmbarqueId:       statusPrevisto?.id ?? '',
      solicitacaoOrcamentoId: this.form.id,
      orcamentoVendaId:       ov?.id,
      custoDespachanteId,
      refOminium:             '',
      imp:                    '',
      bl:                     '',
      container:              this.form.tamContainer,
      li:                     '',
      kg:                     this.form.peso,
      etd:                    this.form.data,
      eta:                    this.form.data,
    });

    if (statusPrevisto) {
      this.embarqueSvc.alterarStatus(
        created.id,
        created.statusEmbarqueId,
        this.auth.currentUser?.username ?? '',
        `Embarque criado automaticamente — Solicitação ${this.form.codigoInterno} aprovada`
      );
    }
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
      status: 'AguardandoDespachante',
      data: today
    };
  }

  private emptyDespaForm(): DespaForm {
    return {
      despachanteId: '',
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

  hasApiFieldError(...keys: string[]): boolean {
    const normalized = this.normalizeKeys(keys);
    return normalized.some((key) => !!this.apiFieldErrors[key]?.length);
  }

  firstApiFieldError(...keys: string[]): string {
    const normalized = this.normalizeKeys(keys);
    for (const key of normalized) {
      const first = this.apiFieldErrors[key]?.[0];
      if (first) {
        return first;
      }
    }
    return '';
  }

  getApiValidationSummary(): string[] {
    const messages = new Set<string>();
    Object.values(this.apiFieldErrors).forEach((list) => {
      list.forEach((message) => {
        if (message) {
          messages.add(message);
        }
      });
    });
    return Array.from(messages).slice(0, 6);
  }

  private normalizeKeys(keys: string[]): string[] {
    return keys.map((key) => key.toLowerCase().replace(/[^a-z0-9]/g, ''));
  }

  private collectFieldErrors(err: any): Record<string, string[]> {
    const result: Record<string, string[]> = {};
    const incoming = err?.fieldErrors;

    if (incoming && typeof incoming === 'object') {
      Object.entries(incoming).forEach(([field, messages]) => {
        const safeField = this.normalizeKeys([field])[0];
        const safeMessages = Array.isArray(messages) ? messages : [messages];
        result[safeField] = safeMessages
          .map((item) => String(item || '').trim())
          .filter((item) => !!item);
      });
      return result;
    }

    const details = Array.isArray(err?.details) ? err.details : [];
    details.forEach((detail: any) => {
      const field = this.normalizeKeys([detail?.field || 'geral'])[0];
      const message = String(detail?.message || '').trim();
      if (!message) return;
      if (!result[field]) {
        result[field] = [];
      }
      if (!result[field].includes(message)) {
        result[field].push(message);
      }
    });

    return result;
  }
}
