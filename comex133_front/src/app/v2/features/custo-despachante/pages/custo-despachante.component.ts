import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CRUD_STYLES } from '../../../shared/styles/crud-page.styles';
import { PaginationComponent } from '../../../../core/components/pagination/pagination.component';
import { PagedResult, PaginationParams } from '../../../../core/api/models/api-response.model';
import {
  CustoDespachante, CustoDespachanteLi, CustoDespachanteDespesa,
  NcmVinculadoOrcamento, ValorImposto, StatusCustoDespachante
} from '../models/custo-despachante.models';
import { CustoDespachanteService } from '../services/custo-despachante.service';
import { ImpostoCalculatorService } from '../services/imposto-calculator.service';
import { DespachanteV2Service } from '../../cadastros/despachantes/services/despachante-v2.service';
import { ImportadorService } from '../../cadastros/importadores/services/importador.service';
import { PortoOrigemService } from '../../cadastros/portos-origem/services/porto-origem.service';
import { PortoDestinoService } from '../../cadastros/portos-destino/services/porto-destino.service';
import { NcmService } from '../../cadastros/ncm/services/ncm.service';
import { ModeloDespesaService } from '../../cadastros/modelos-despesa/services/modelo-despesa.service';
import { DespesaCadastroService } from '../../cadastros/despesas-cadastro/services/despesa-cadastro.service';
import { SolicitacaoOrcamentoService } from '../../solicitacao-orcamento/services/solicitacao-orcamento.service';
import { SolicitacaoOrcamento } from '../../solicitacao-orcamento/models/solicitacao-orcamento.models';

import { DespachanteV2 } from '../../cadastros/despachantes/models/despachante-v2.models';
import { Importador } from '../../cadastros/importadores/models/importador.models';
import { PortoOrigem } from '../../cadastros/portos-origem/models/porto-origem.models';
import { PortoDestino } from '../../cadastros/portos-destino/models/porto-destino.models';
import { Ncm } from '../../cadastros/ncm/models/ncm.models';
import { ModeloDespesa } from '../../cadastros/modelos-despesa/models/modelo-despesa.models';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../../core/services/confirm-dialog.service';
import { ApiErrorMapper } from '../../../../core/api/error-handler/api-error.mapper';
import { CurrencyMaskDirective } from '../../../../core/directives/currency-mask.directive';

type LiForm = { ncm: string; descricao: string; valor: number; data: string };
type DespesaForm = { descricao: string; valor: number; data: string; entraBaseIcms: boolean };
type NcmVinculadoForm = { ncmId: string; numeroNcm: string; descricao: string; aliIi: number; aliIpi: number; aliPis: number; aliCofins: number; aliIcms: number; baseCalculo: number };
type CustoGroupDespachante = {
  despachanteId: string;
  despachanteNome: string;
  custos: CustoDespachante[];
  totalCustos: number;
  totalCorrentes: number;
};
type CustoGroupSolicitacao = {
  solicitacaoId?: string;
  solicitacaoCodigo: string;
  hasSolicitacao: boolean;
  totalCustos: number;
  despachantes: CustoGroupDespachante[];
};

@Component({
  selector: 'app-custo-despachante',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, CurrencyMaskDirective, PaginationComponent],
  styles: [
    ...CRUD_STYLES,
    `
    .wizard-steps {
      display: flex;
      align-items: center;
      gap: 0;
      margin-bottom: 24px;
    }
    .wizard-step {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
    }
    .step-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 700;
      flex-shrink: 0;
      border: 2px solid var(--color-border);
      background: var(--color-bg);
      color: var(--color-text-muted);
      cursor: pointer;
      transition: opacity .15s;
    }
    .step-circle:hover { opacity: .8; }
    .step-circle.active {
      background: var(--color-primary, #3b82f6);
      border-color: var(--color-primary, #3b82f6);
      color: #fff;
    }
    .step-circle.done {
      background: #22c55e;
      border-color: #22c55e;
      color: #fff;
    }
    .step-label { font-size: 12px; white-space: nowrap; color: var(--color-text-muted); }
    .step-label.active { color: var(--color-text); font-weight: 700; }
    .step-connector { flex: 1; height: 2px; background: var(--color-border); margin: 0 4px; }
    .step-connector.done { background: #22c55e; }
    .inline-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .inline-table th { text-align: left; padding: 8px; background: var(--color-surface); font-size: 11px; text-transform: uppercase; letter-spacing:.04em; color: var(--color-text-muted); border-bottom: 1px solid var(--color-border); }
    .inline-table td { padding: 8px; border-bottom: 1px solid var(--color-border); }
    .inline-form { display: grid; gap: 8px; padding: 12px; background: var(--color-surface); border-radius: 8px; margin-bottom: 12px; }
    .inline-form-row { display: flex; gap: 8px; align-items: end; flex-wrap: wrap; }
    .inline-form-row .f { display: flex; flex-direction: column; gap: 4px; min-width: 120px; flex: 1; }
    .inline-form-row label { font-size: 11px; color: var(--color-text-muted); }
    .inline-form-row input, .inline-form-row select { padding: 8px 10px; border: 1.5px solid var(--color-border); border-radius: 6px; font-size: 13px; background: var(--color-bg); color: var(--color-text); width: 100%; }
    .tag-icms-sim { background: #fef3c7; color: #92400e; border-radius: 999px; padding: 2px 10px; font-size: 11px; font-weight: 600; }
    .tag-icms-nao { background: var(--color-surface); color: var(--color-text-muted); border-radius: 999px; padding: 2px 10px; font-size: 11px; }
    .resumo-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--color-border); font-size: 13px; }
    .resumo-total { display: flex; justify-content: space-between; padding: 12px 0; font-size: 15px; font-weight: 800; }
    .imposto-detalhe { font-size: 12px; color: var(--color-text-muted); padding: 4px 0 4px 16px; }
    .cod-badge { background: var(--color-surface); border: 1px solid var(--color-border); padding: 2px 8px; border-radius: 6px; font-family: monospace; font-size: 12px; }
    .sol-badge { background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; padding: 2px 8px; border-radius: 6px; font-family: monospace; font-size: 11px; }
    .packlist-box { background: var(--color-surface); border: 1.5px solid var(--color-border); border-radius: 8px; padding: 12px 16px; margin-top: 16px; }
    .packlist-box h4 { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--color-text-muted); margin: 0 0 10px; }
    .packlist-row { display: flex; align-items: center; gap: 10px; padding: 6px 0; border-bottom: 1px solid var(--color-border); font-size: 13px; }
    .packlist-row:last-child { border-bottom: none; }
    .packlist-name { flex: 1; }
    .packlist-obs { font-size: 12px; color: var(--color-text-muted); flex: 1; }
    .packlist-date { font-size: 12px; color: var(--color-text-muted); white-space: nowrap; }
    .status-custo-badge { display:inline-block; padding:2px 10px; border-radius:12px; font-size:11px; font-weight:700; color:#fff; }
    .view-toggle { display:flex; align-items:center; gap:8px; margin-left:auto; }
    .grouped-wrap { display:grid; gap:14px; }
    .solic-group { border:1.5px solid var(--color-border); border-radius:10px; background:var(--color-bg); overflow:hidden; }
    .solic-group-head { display:flex; justify-content:space-between; align-items:center; padding:10px 12px; background:#eef6ff; border-bottom:1px solid #dbeafe; }
    .solic-group-title { display:flex; align-items:center; gap:8px; font-size:13px; font-weight:700; color:#1e3a8a; }
    .solic-group-meta { font-size:12px; color:#334155; }
    .desp-group { padding:10px 12px; border-top:1px solid var(--color-border); }
    .desp-group:first-child { border-top:none; }
    .desp-group-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
    .desp-name { font-size:13px; font-weight:700; color:var(--color-text); }
    .desp-meta { font-size:12px; color:var(--color-text-muted); }
    .mini-table { width:100%; border-collapse:collapse; font-size:12px; }
    .mini-table th { text-align:left; padding:7px 8px; background:var(--color-surface); border-bottom:1px solid var(--color-border); color:var(--color-text-muted); text-transform:uppercase; letter-spacing:.04em; font-size:10px; }
    .mini-table td { padding:7px 8px; border-bottom:1px solid var(--color-border); }
    .mini-table tr:last-child td { border-bottom:none; }
    .version-tree-row.historical { background: linear-gradient(90deg, #f8fafc 0%, rgba(248, 250, 252, 0) 58%); }
    .version-tree-row td:first-child { overflow: visible; }
    .version-tree {
      --level: 0;
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding-left: calc(var(--level) * 18px + 6px);
    }
    .version-tree.node-root { padding-left: 6px; }
    .version-branch {
      display: none;
    }
    .version-node-dot {
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: #f59e0b;
      border: 1px solid #d97706;
      flex-shrink: 0;
      box-shadow: 0 0 0 2px #ffffff;
    }
    .version-node-dot.current {
      background: #22c55e;
      border-color: #16a34a;
    }
    /* Resumo consolidado */
    .resumo-section { margin-bottom:20px; }
    .resumo-section-title { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.07em; color:var(--color-text-muted); margin:0 0 10px; padding-bottom:6px; border-bottom:1.5px solid var(--color-border); display:flex; align-items:center; gap:6px; }
    .resumo-dados-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px 20px; font-size:13px; }
    @media (max-width:800px) { .resumo-dados-grid { grid-template-columns:1fr 1fr; } }
    .resumo-dado { display:flex; flex-direction:column; gap:2px; }
    .resumo-dado label { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:var(--color-text-muted); }
    .resumo-dado span { font-size:13px; color:var(--color-text); font-weight:500; }
    .resumo-table { width:100%; border-collapse:collapse; font-size:12px; margin-bottom:4px; }
    .resumo-table th { text-align:left; padding:6px 8px; background:var(--color-bg); font-size:10px; text-transform:uppercase; letter-spacing:.04em; color:var(--color-text-muted); border-bottom:1px solid var(--color-border); }
    .resumo-table td { padding:7px 8px; border-bottom:1px solid var(--color-border); vertical-align:middle; }
    .resumo-table tr:last-child td { border-bottom:none; }
    .resumo-table .total-row td { background:var(--color-bg); font-weight:800; border-top:1.5px solid var(--color-border); }
    .imposto-breakdown { display:grid; grid-template-columns:repeat(5,1fr); gap:4px; margin-top:4px; }
    .imposto-item { background:var(--color-bg); border-radius:6px; padding:4px 6px; text-align:center; }
    .imposto-item .ali { font-size:10px; color:var(--color-text-muted); }
    .imposto-item .val { font-size:12px; font-weight:700; color:#059669; }
    .imposto-item .lab { font-size:10px; font-weight:700; color:var(--color-text-muted); }
    .total-geral-box { background:linear-gradient(135deg,#1e3a5f,#2563eb); color:#fff; border-radius:10px; padding:16px 20px; display:flex; justify-content:space-between; align-items:center; margin-top:4px; }
    .total-geral-box .label { font-size:13px; opacity:.85; }
    .total-geral-box .valor { font-size:22px; font-weight:800; }
    .subtotal-row { display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid var(--color-border); font-size:13px; }
    .subtotal-row:last-child { border-bottom:none; }
    .sol-card { background:#eff6ff; border:1.5px solid #bfdbfe; border-radius:8px; padding:10px 14px; display:flex; align-items:center; gap:12px; font-size:13px; margin-bottom:0; }
    .ncm-card { border:1.5px solid var(--color-border); border-radius:8px; padding:12px 14px; margin-bottom:10px; }
    .preview-overlay { position:fixed; inset:0; background:rgba(0,0,0,.65); z-index:1000; display:flex; align-items:center; justify-content:center; padding:16px; }
    .preview-modal { background:#fff; border-radius:12px; width:96%; max-width:1280px; height:92vh; display:flex; flex-direction:column; box-shadow:0 24px 72px rgba(0,0,0,.4); overflow:hidden; transition:width .2s,height .2s,border-radius .2s; }
    .preview-modal.maximized { width:100%; max-width:100%; height:100vh; border-radius:0; }
    .preview-toolbar { display:flex; align-items:center; justify-content:space-between; padding:10px 16px; background:#f8fafc; border-bottom:1.5px solid #e2e8f0; flex-shrink:0; }
    .preview-toolbar h4 { margin:0; font-size:14px; font-weight:700; color:#1e293b; }
    .preview-toolbar .pt-actions { display:flex; gap:8px; align-items:center; }
    .btn-icon-sm { background:none; border:1.5px solid #cbd5e1; border-radius:6px; padding:4px 8px; font-size:14px; cursor:pointer; color:#475569; transition:background .15s; line-height:1; }
    .btn-icon-sm:hover { background:#f1f5f9; }
    .preview-body { flex:1; overflow:auto; background:#d1d5db; padding:12px; }
    .preview-body iframe { width:100%; height:100%; border:none; border-radius:4px; background:#fff; min-height:600px; box-shadow:0 2px 16px rgba(0,0,0,.18); display:block; }
    /* ===== RESPONSIVE ===== */
    @media (max-width: 768px) {
      .wizard-steps { overflow-x:auto; padding-bottom:8px; }
      .wizard-step { flex-shrink:0; }
      .inline-form-row { flex-wrap:wrap; }
      .inline-form-row .f { min-width:calc(50% - 4px); }
      .resumo-dados-grid { grid-template-columns:1fr 1fr; }
      .imposto-breakdown { grid-template-columns:repeat(3,1fr); }
      .total-geral-box { flex-direction:column; align-items:flex-start; gap:4px; }
      .total-geral-box .valor { font-size:18px; }
      .sol-card { flex-wrap:wrap; }
      .preview-modal { width:100%; max-width:100%; height:100vh; border-radius:0; }
    }
    @media (max-width: 480px) {
      .dashboard-header { flex-direction:column; align-items:flex-start; gap:10px; }
      .resumo-dados-grid { grid-template-columns:1fr; }
      .imposto-breakdown { grid-template-columns:repeat(2,1fr); }
      .inline-form-row .f { min-width:100%; }
      .step-label { display:none; }
      .step-connector { min-width:12px; }
      .ncm-card { padding:8px 10px; }
    }
    `
  ],
  template: `
    <div class="container-standard">

      <div class="dashboard-header">
        <div>
          <h1>🧾 Custos Despachante</h1>
          <p class="subtitle">Cálculo de custo interno para importações</p>
        </div>
        <button class="btn btn-primary" disabled title="Feature desabilitada" style="opacity:.45;cursor:not-allowed">+ Novo Custo (desabilitado)</button>
      </div>

      <!-- ── LISTAGEM ── -->
      <ng-container *ngIf="!showWizard">
        <div class="content-section">
          <div class="toolbar">
            <input class="search" type="text" [(ngModel)]="q" (ngModelChange)="onFiltersChanged()"
              placeholder="🔎 Buscar por código, despachante ou importador" />
            <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--color-text-muted)">
              <input type="checkbox" [(ngModel)]="showHistoricoVersoes" (ngModelChange)="onShowHistoricoChange()" />
              Mostrar versões anteriores
            </label>
            <div class="view-toggle">
              <button class="btn btn-secondary" (click)="toggleListView()">
                {{ listViewMode === 'agrupado' ? 'Ver tabela clássica' : 'Ver agrupado por solicitação' }}
              </button>
            </div>
          </div>

          <ng-container *ngIf="listViewMode === 'agrupado'; else tableView">
            <div class="grouped-wrap" *ngIf="pagedGroupedFiltered.length > 0; else emptyGridGrouped">
              <div class="solic-group" *ngFor="let sg of pagedGroupedFiltered">
                <div class="solic-group-head">
                  <div class="solic-group-title">
                    <span>Solicitação</span>
                    <span class="sol-badge" *ngIf="sg.hasSolicitacao">{{ sg.solicitacaoCodigo }}</span>
                    <span class="badge" *ngIf="!sg.hasSolicitacao">Sem solicitação</span>
                  </div>
                  <div class="solic-group-meta">{{ sg.totalCustos }} custo(s)</div>
                </div>

                <div class="desp-group" *ngFor="let dg of sg.despachantes">
                  <div class="desp-group-head">
                    <div class="desp-name">{{ dg.despachanteNome }}</div>
                    <div class="desp-meta">{{ dg.totalCustos }} custo(s) • {{ dg.totalCorrentes }} corrente(s)</div>
                  </div>
                  <table class="mini-table">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Importador</th>
                        <th>Container</th>
                        <th>Data</th>
                        <th>Status</th>
                        <th>Total Impostos</th>
                        <th style="width:100px">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let c of dg.custos" class="version-tree-row" [class.historical]="showHistoricoVersoes && !isCurrentVersion(c.id)">
                        <td>
                          <div class="version-tree" [style.--level]="versionLevel(c.id, c.versao)" [class.node-root]="versionLevel(c.id, c.versao) === 0">
                            <span class="version-node-dot" [class.current]="isCurrentVersion(c.id)"></span>
                            <span class="cod-badge">{{ c.codigoInterno }}</span>
                          </div>
                          <span class="badge" style="margin-left:6px">v{{ c.versao }}</span>
                          <span *ngIf="isCurrentVersion(c.id)" class="badge" style="margin-left:6px;background:#dcfce7;color:#166534;border-color:#86efac">corrente</span>
                        </td>
                        <td>{{ nomeImportadorById(c.importadorId) }}</td>
                        <td><span class="badge">{{ c.tamContainer }}</span></td>
                        <td>{{ c.data | date:'dd/MM/yyyy' }}</td>
                        <td>
                          <span class="status-custo-badge" [ngStyle]="{ background: c.status === 'Finalizado' ? '#22c55e' : c.status === 'Pendente' ? '#64748b' : c.status === 'CanceladoPeloOV' ? '#6b7280' : '#f59e0b' }">
                            {{ c.status === 'Finalizado' ? 'Finalizado' : c.status === 'Pendente' ? 'Pendente' : c.status === 'CanceladoPeloOV' ? 'Cancelado pelo OV' : c.status === 'ReabertoPeloOV' ? 'Reaberto pelo OV' : 'Em Andamento' }}
                          </span>
                        </td>
                        <td>{{ totalImpostosCusto(c.id) | currency:'BRL':'symbol':'1.2-2' }}</td>
                        <td>
                          <div class="row-actions">
                            <button class="btn-icon" [title]="isCustoEditavel(c) ? 'Editar' : 'Somente visualização'" (click)="openWizard(c)">{{ isCustoEditavel(c) ? '✏️' : '👁️' }}</button>
                            <button class="btn-icon warning" *ngIf="canReabrir(c)" title="Reabrir custo para edição" (click)="reabrir(c.id)">🔓</button>
                            <button class="btn-icon danger" [disabled]="!canDelete(c)" [title]="canDelete(c) ? 'Excluir' : 'Custos finalizados não podem ser excluídos'" (click)="remove(c.id)">🗑️</button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </ng-container>

          <ng-template #emptyGridGrouped>
            <div class="empty-state" style="padding:28px 10px">Nenhum custo cadastrado</div>
          </ng-template>

          <ng-template #tableView>
          <table class="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Despachante</th>
                <th>Importador</th>
                <th>Solicitação</th>
                <th>Container</th>
                <th>Data</th>
                <th>Status</th>
                <th>Total Impostos</th>
                <th style="width:100px">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="filtered.length === 0">
                <td colspan="9" class="empty-state">Nenhum custo cadastrado</td>
              </tr>
              <tr *ngFor="let c of pagedFiltered" class="version-tree-row" [class.historical]="showHistoricoVersoes && !isCurrentVersion(c.id)">
                <td>
                  <div class="version-tree" [style.--level]="versionLevel(c.id, c.versao)" [class.node-root]="versionLevel(c.id, c.versao) === 0">
                    <span class="version-branch"
                      [class.root]="isVersionRoot(c.id, c.versao)"
                      [class.leaf]="isVersionLeaf(c.versao)"
                      [class.single]="versionCount(c.id) <= 1"></span>
                    <span class="version-node-dot" [class.current]="isCurrentVersion(c.id)"></span>
                    <span class="cod-badge">{{ c.codigoInterno }}</span>
                  </div>
                  <span class="badge" style="margin-left:6px">v{{ c.versao }}</span>
                  <span *ngIf="isCurrentVersion(c.id)" class="badge" style="margin-left:6px;background:#dcfce7;color:#166534;border-color:#86efac">corrente</span>
                  <span *ngIf="versionCount(c.id) > 1" class="badge" style="margin-left:6px;background:#eff6ff;color:#1d4ed8;border-color:#93c5fd">{{ versionCount(c.id) }} versões</span>
                </td>
                <td>{{ nomeDespachanteById(c.despachanteId) }}</td>
                <td>{{ nomeImportadorById(c.importadorId) }}</td>
                <td><span *ngIf="c.solicitacaoOrcamentoId" class="sol-badge">{{ codSolById(c.solicitacaoOrcamentoId) }}</span><span *ngIf="!c.solicitacaoOrcamentoId" style="color:var(--color-text-muted);font-size:12px">—</span></td>
                <td><span class="badge">{{ c.tamContainer }}</span></td>
                <td>{{ c.data | date:'dd/MM/yyyy' }}</td>
                <td>
                  <span class="status-custo-badge" [ngStyle]="{ background: c.status === 'Finalizado' ? '#22c55e' : c.status === 'Pendente' ? '#64748b' : c.status === 'CanceladoPeloOV' ? '#6b7280' : '#f59e0b' }">
                    {{ c.status === 'Finalizado' ? 'Finalizado' : c.status === 'Pendente' ? 'Pendente' : c.status === 'CanceladoPeloOV' ? 'Cancelado pelo OV' : c.status === 'ReabertoPeloOV' ? 'Reaberto pelo OV' : 'Em Andamento' }}
                  </span>
                </td>
                <td>{{ totalImpostosCusto(c.id) | currency:'BRL':'symbol':'1.2-2' }}</td>
                <td>
                  <div class="row-actions">
                    <button class="btn-icon" [title]="isCustoEditavel(c) ? 'Editar' : 'Somente visualização'" (click)="openWizard(c)">{{ isCustoEditavel(c) ? '✏️' : '👁️' }}</button>
                    <button
                      class="btn-icon warning"
                      *ngIf="canReabrir(c)"
                      title="Reabrir custo para edição"
                      (click)="reabrir(c.id)">🔓</button>
                    <button
                      class="btn-icon danger"
                      [disabled]="!canDelete(c)"
                      [title]="canDelete(c) ? 'Excluir' : 'Custos finalizados não podem ser excluídos'"
                      (click)="remove(c.id)">🗑️</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          </ng-template>

          <app-pagination
            *ngIf="pagedResult"
            [pagedResult]="pagedResult"
            (pageChanged)="onPageChange($event)"
          />
        </div>
      </ng-container>

      <!-- ── WIZARD ── -->
      <ng-container *ngIf="showWizard">
        <div class="detail-header">
          <h2>{{ editing ? (modoVisualizacao ? 'Visualizar Custo — ' : 'Editar Custo — ') + editing.codigoInterno : 'Novo Custo Despachante' }}</h2>
        </div>
        <div *ngIf="modoVisualizacao" style="margin:-4px 0 12px;padding:10px 12px;border-radius:10px;border:1px solid #fde68a;background:#fffbeb;color:#92400e;font-size:12px;font-weight:700">
          VERSAO HISTORICA - SOMENTE LEITURA
        </div>

        <!-- Steps indicator -->
        <div class="wizard-steps">
          <ng-container *ngFor="let s of stepLabels; let i = index; let last = last">
            <div class="wizard-step">
              <div class="step-circle" [class.active]="step === i+1" [class.done]="completedSteps.has(i+1) && step !== i+1" (click)="goToStep(i+1)">
                {{ completedSteps.has(i+1) && step !== i+1 ? '✓' : i+1 }}
              </div>
              <span class="step-label" [class.active]="step === i+1" style="cursor:pointer" (click)="goToStep(i+1)">{{ s }}</span>
            </div>
            <div class="step-connector" [class.done]="completedSteps.has(i+1)" *ngIf="!last"></div>
          </ng-container>
        </div>

        <!-- ─ PASSO 1 — Dados Básicos ─ -->
        <div class="card" *ngIf="step === 1">
          <div class="form-grid">
            <div class="field w2">
              <label>Despachante <span class="required">*</span></label>
              <select [(ngModel)]="p1.despachanteId" [disabled]="true" [class.err]="showErr && (!p1.despachanteId || hasApiFieldError('despachanteId', 'despachante'))">
                <option value="">— Selecione —</option>
                <option *ngFor="let d of despachantes" [value]="d.id">{{ d.nome }}</option>
              </select>
              <span class="err-msg" *ngIf="showErr && !p1.despachanteId">Obrigatório</span>
              <span class="err-msg" *ngIf="showErr && hasApiFieldError('despachanteId', 'despachante')">{{ firstApiFieldError('despachanteId', 'despachante') }}</span>
            </div>
            <div class="field">
              <label>Importador</label>
              <select [(ngModel)]="p1.importadorId" [class.err]="showErr && hasApiFieldError('importadorId', 'importador')">
                <option value="">— Selecione —</option>
                <option *ngFor="let im of importadores" [value]="im.id">{{ im.razaoSocial }}</option>
              </select>
              <span class="err-msg" *ngIf="showErr && hasApiFieldError('importadorId', 'importador')">{{ firstApiFieldError('importadorId', 'importador') }}</span>
            </div>
            <div class="field">
              <label>Porto Origem <span class="required">*</span></label>
              <select [(ngModel)]="p1.portoOrigemId" [class.err]="showErr && (!p1.portoOrigemId || hasApiFieldError('portoOrigemId', 'portoOrigem'))">
                <option value="">— Selecione —</option>
                <option *ngFor="let p of portosOrigem" [value]="p.id">{{ p.nome }} ({{ p.codigo }})</option>
              </select>
              <span class="err-msg" *ngIf="showErr && !p1.portoOrigemId">Obrigatório</span>
              <span class="err-msg" *ngIf="showErr && hasApiFieldError('portoOrigemId', 'portoOrigem')">{{ firstApiFieldError('portoOrigemId', 'portoOrigem') }}</span>
            </div>
            <div class="field">
              <label>Porto Destino <span class="required">*</span></label>
              <select [(ngModel)]="p1.portoDestinoId" [class.err]="showErr && (!p1.portoDestinoId || hasApiFieldError('portoDestinoId', 'portoDestino'))">
                <option value="">— Selecione —</option>
                <option *ngFor="let pd of portosDestino" [value]="pd.id">{{ pd.nome }} ({{ pd.codigo }})</option>
              </select>
              <span class="err-msg" *ngIf="showErr && !p1.portoDestinoId">Obrigatório</span>
              <span class="err-msg" *ngIf="showErr && hasApiFieldError('portoDestinoId', 'portoDestino')">{{ firstApiFieldError('portoDestinoId', 'portoDestino') }}</span>
            </div>
            <div class="field">
              <label>Responsável <span class="required">*</span></label>
              <input type="text" [(ngModel)]="p1.responsavel" [readonly]="true" placeholder="Nome do responsável"
                     [class.err]="showErr && (!p1.responsavel.trim() || hasApiFieldError('responsavel', 'responsável'))" />
              <span class="err-msg" *ngIf="showErr && !p1.responsavel.trim()">Obrigatório</span>
              <span class="err-msg" *ngIf="showErr && hasApiFieldError('responsavel', 'responsável')">{{ firstApiFieldError('responsavel', 'responsável') }}</span>
            </div>
            <div class="field">
              <label>Data <span class="required">*</span></label>
              <input type="date" [(ngModel)]="p1.data" [class.err]="showErr && (!p1.data || hasApiFieldError('data'))" />
              <span class="err-msg" *ngIf="showErr && !p1.data">Obrigatório</span>
              <span class="err-msg" *ngIf="showErr && hasApiFieldError('data')">{{ firstApiFieldError('data') }}</span>
            </div>
            <div class="field">
              <label>Container</label>
              <select [(ngModel)]="p1.tamContainer">
                <option value="20">20'</option>
                <option value="40">40'</option>
                <option value="LCL">LCL</option>
              </select>
            </div>
            <div class="field">
              <label>Peso (kg) <span class="required">*</span></label>
              <input type="text" [(ngModel)]="p1.peso" appCurrencyMask="BRL" [currencyMaskMode]="'number'" [currencyMaskUnit]="'kg'" min="0" step="0.01" placeholder="0 kg" />
            </div>
            <div class="field">
              <label>Taxa Dólar <span class="required">*</span></label>
              <input type="text" [(ngModel)]="p1.taxaUsd" (ngModelChange)="recalculateFinancials()" appCurrencyMask="USD" min="0" step="0.01" placeholder="$0.00"
                     [class.err]="showErr && ((!p1.taxaUsd || p1.taxaUsd <= 0) || hasApiFieldError('taxaUsd'))" />
              <span class="err-msg" *ngIf="showErr && (!p1.taxaUsd || p1.taxaUsd <= 0)">Obrigatório</span>
              <span class="err-msg" *ngIf="showErr && hasApiFieldError('taxaUsd')">{{ firstApiFieldError('taxaUsd') }}</span>
            </div>
            <div class="field">
              <label>FOB (USD)</label>
              <input type="text" [(ngModel)]="p1.fobUsd" (ngModelChange)="recalculateFinancials()" appCurrencyMask="USD" min="0" step="0.01" placeholder="$0.00" />
            </div>
            <div class="field">
              <label>FOB (R$)</label>
              <input type="text" [(ngModel)]="p1.fobReais" appCurrencyMask="BRL" min="0" step="0.01" placeholder="R$ 0,00" [readonly]="true" />
            </div>
            <div class="field">
              <label>Seguro (USD)</label>
              <input type="text" [(ngModel)]="p1.seguroUsd" (ngModelChange)="recalculateFinancials()" appCurrencyMask="USD" min="0" step="0.01" placeholder="$0.00" />
            </div>
            <div class="field">
              <label>Frete Internacional (USD)</label>
              <input type="text" [(ngModel)]="p1.freteInternacionalUsd" (ngModelChange)="recalculateFinancials()" appCurrencyMask="USD" min="0" step="0.01" placeholder="$0.00" />
            </div>
            <div class="field">
              <label>CIF (USD)</label>
              <input type="text" [(ngModel)]="p1.cifUsd" appCurrencyMask="USD" min="0" step="0.01" placeholder="$0.00" [readonly]="true" />
            </div>
            <div class="field">
              <label>CIF (R$)</label>
              <input type="text" [(ngModel)]="p1.cifReais" appCurrencyMask="BRL" min="0" step="0.01" placeholder="R$ 0,00" [readonly]="true" />
            </div>
            <div class="field">
              <label>Taxa USD Agente</label>
              <input type="text" [(ngModel)]="p1.taxaUsdAgente" appCurrencyMask="USD" min="0" step="0.01" placeholder="Opcional" />
            </div>
            <div class="field w3">
              <label>Observação</label>
              <input type="text" [(ngModel)]="p1.observacao" placeholder="Observações gerais" />
            </div>
          </div>

          <div class="actions">
            <button class="btn btn-primary" (click)="nextStep()">Próximo →</button>
            <button class="btn btn-secondary" (click)="salvarTudo('EmAndamento')">💾 Salvar</button>
            <button class="btn btn-secondary" (click)="salvarTudo('Finalizado')">✅ Finalizar</button>
            <button class="btn btn-secondary" (click)="cancelWizard()">Cancelar</button>
          </div>
        </div>

        <!-- ─ PASSO 2 — LI ─ -->
        <div class="card" *ngIf="step === 2">
          <p style="font-size:13px;color:var(--color-text-muted);margin-bottom:16px">
            Adicione os itens da Licença de Importação com NCM e valores.
          </p>
          <div class="inline-form">
            <div class="inline-form-row">
              <div class="f" style="min-width:140px;max-width:160px">
                <label>NCM (livre)</label>
                <input type="text" [(ngModel)]="liForm.ncm" placeholder="00000000" maxlength="8" />
              </div>
              <div class="f" style="flex:2">
                <label>Descrição <span class="required">*</span></label>
                <input type="text" [(ngModel)]="liForm.descricao" placeholder="Descrição do item" />
              </div>
              <div class="f" style="min-width:130px;max-width:160px">
                <label>Valor (R$) <span class="required">*</span></label>
                <input type="text" [(ngModel)]="liForm.valor" appCurrencyMask="BRL" min="0" step="0.01" placeholder="R$ 0,00" />
              </div>
              <div class="f" style="min-width:130px;max-width:150px">
                <label>Data</label>
                <input type="date" [(ngModel)]="liForm.data" />
              </div>
              <div class="f" style="min-width:80px;max-width:80px">
                <label>&nbsp;</label>
                <button class="btn btn-secondary" (click)="addLi()">+ Add</button>
              </div>
            </div>
            <p class="err-msg" *ngIf="liErro">{{ liErro }}</p>
          </div>

          <table class="inline-table" *ngIf="lisForm.length > 0">
            <thead>
              <tr>
                <th style="width:120px">NCM</th>
                <th>Descrição</th>
                <th style="width:140px;text-align:right">Valor</th>
                <th style="width:110px">Data</th>
                <th style="width:50px"></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let li of lisForm; let i = index">
                <td><code>{{ li.ncm || '—' }}</code></td>
                <td>{{ li.descricao }}</td>
                <td style="text-align:right">{{ li.valor | currency:'BRL':'symbol':'1.2-2' }}</td>
                <td>{{ li.data | date:'dd/MM/yyyy' }}</td>
                <td><button class="btn-icon danger" (click)="removeLi(i)">🗑️</button></td>
              </tr>
              <tr>
                <td colspan="2" style="font-weight:700">Total LI</td>
                <td style="text-align:right;font-weight:700">{{ totalLis() | currency:'BRL':'symbol':'1.2-2' }}</td>
                <td colspan="2"></td>
              </tr>
            </tbody>
          </table>
          <p *ngIf="lisForm.length === 0" style="font-size:13px;color:var(--color-text-muted);margin-top:8px">Nenhum item adicionado.</p>

          <!-- Packlist da Solicitação (somente leitura) -->
          <ng-container *ngIf="p1.solicitacaoOrcamentoId">
            <div class="packlist-box" style="margin-top:20px">
              <h4>📦 Packlist da Solicitação</h4>
              <ng-container *ngIf="packlistDocs(p1.solicitacaoOrcamentoId).length > 0; else semDocs">
                <div class="packlist-row" *ngFor="let doc of packlistDocs(p1.solicitacaoOrcamentoId)">
                  <span class="packlist-name">{{ doc.nomeArquivo }}</span>
                  <span class="packlist-obs">{{ doc.observacao || '' }}</span>
                  <span class="packlist-date">{{ doc.dataUpload | date:'dd/MM/yyyy' }}</span>
                  <button class="btn-icon" title="Baixar / Ver arquivo"
                    (click)="downloadPacklist(doc.linkDocumento, doc.nomeArquivo)">⬇️</button>
                </div>
              </ng-container>
              <ng-template #semDocs>
                <p style="font-size:12px;color:var(--color-text-muted);margin:0">Nenhum arquivo cadastrado nesta solicitação.</p>
              </ng-template>
            </div>
          </ng-container>

          <div class="actions">
            <button class="btn btn-primary" (click)="nextStep()">Próximo →</button>
            <button class="btn btn-secondary" (click)="salvarTudo('EmAndamento')">💾 Salvar</button>
            <button class="btn btn-secondary" (click)="salvarTudo('Finalizado')">✅ Finalizar</button>
            <button class="btn btn-secondary" (click)="prevStep()">← Voltar</button>
            <button class="btn btn-secondary" style="margin-left:auto" (click)="cancelWizard()">Cancelar</button>
          </div>
        </div>

        <!-- ─ PASSO 3 — Despesas ─ -->
        <div class="card" *ngIf="step === 3">
          <p style="font-size:13px;color:var(--color-text-muted);margin-bottom:16px">
            Registre as despesas do despachante. Marque se entra na base de cálculo do ICMS.
          </p>

          <!-- Carregar de modelo -->
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;padding:12px 14px;background:var(--color-surface);border:1px solid var(--color-border);border-radius:8px">
            <span style="font-size:12px;font-weight:600;color:var(--color-text-muted);white-space:nowrap">📋 Carregar modelo:</span>
            <select [(ngModel)]="modeloSelId"
                    style="flex:1;padding:8px 10px;border:1.5px solid var(--color-border);border-radius:6px;font-size:13px;background:var(--color-bg);color:var(--color-text)">
              <option value="">— Selecione um modelo —</option>
              <option *ngFor="let m of modelos" [value]="m.id">{{ m.nome }}</option>
            </select>
            <button class="btn btn-secondary" (click)="carregarDoModelo()" [disabled]="!modeloSelId"
                    style="white-space:nowrap">⬇️ Carregar</button>
          </div>

          <div class="inline-form">
            <div class="inline-form-row">
              <div class="f" style="flex:2">
                <label>Descrição <span class="required">*</span></label>
                <input type="text" [(ngModel)]="despesaForm.descricao" placeholder="Ex: Honorários, Armazenagem..." />
              </div>
              <div class="f" style="min-width:130px;max-width:160px">
                <label>Valor (R$) <span class="required">*</span></label>
                <input type="text" [(ngModel)]="despesaForm.valor" appCurrencyMask="BRL" min="0" step="0.01" placeholder="R$ 0,00" />
              </div>
              <div class="f" style="min-width:130px;max-width:150px">
                <label>Data</label>
                <input type="date" [(ngModel)]="despesaForm.data" />
              </div>
              <div class="f" style="min-width:140px;max-width:150px">
                <label>Entra base ICMS</label>
                <select [(ngModel)]="despesaForm.entraBaseIcms">
                  <option [ngValue]="true">Sim</option>
                  <option [ngValue]="false">Não</option>
                </select>
              </div>
              <div class="f" style="min-width:80px;max-width:80px">
                <label>&nbsp;</label>
                <button class="btn btn-secondary" (click)="addDespesa()">+ Add</button>
              </div>
            </div>
            <p class="err-msg" *ngIf="despesaErro">{{ despesaErro }}</p>
          </div>

          <table class="inline-table" *ngIf="despesasForm.length > 0">
            <thead>
              <tr>
                <th>Descrição</th>
                <th style="width:140px;text-align:right">Valor</th>
                <th style="width:110px">Data</th>
                <th style="width:120px;text-align:center">Base ICMS</th>
                <th style="width:80px"></th>
              </tr>
            </thead>
            <tbody>
              <ng-container *ngFor="let d of despesasForm; let i = index">
                <!-- Modo visualização -->
                <tr *ngIf="editingDespesaIdx !== i">
                  <td>{{ d.descricao }}</td>
                  <td style="text-align:right">{{ d.valor | currency:'BRL':'symbol':'1.2-2' }}</td>
                  <td>{{ d.data | date:'dd/MM/yyyy' }}</td>
                  <td style="text-align:center">
                    <span [class]="d.entraBaseIcms ? 'tag-icms-sim' : 'tag-icms-nao'">
                      {{ d.entraBaseIcms ? 'Sim' : 'Não' }}
                    </span>
                  </td>
                  <td>
                    <div class="row-actions">
                      <button class="btn-icon" title="Editar" (click)="startEditDespesa(i)">✏️</button>
                      <button class="btn-icon danger" title="Remover" (click)="removeDespesa(i)">🗑️</button>
                    </div>
                  </td>
                </tr>
                <!-- Modo edição inline -->
                <tr *ngIf="editingDespesaIdx === i" style="background:#f0f7ff">
                  <td>
                    <input type="text" [(ngModel)]="editingDespesaForm.descricao"
                           style="width:100%;padding:5px 8px;border:1.5px solid var(--color-primary);border-radius:5px;font-size:13px" />
                  </td>
                  <td>
                    <input type="text" [(ngModel)]="editingDespesaForm.valor" appCurrencyMask="BRL" min="0" step="0.01"
                           style="width:110px;padding:5px 8px;border:1.5px solid var(--color-primary);border-radius:5px;font-size:13px;text-align:right" />
                  </td>
                  <td>
                    <input type="date" [(ngModel)]="editingDespesaForm.data"
                           style="padding:5px 8px;border:1.5px solid var(--color-primary);border-radius:5px;font-size:13px" />
                  </td>
                  <td style="text-align:center">
                    <select [(ngModel)]="editingDespesaForm.entraBaseIcms"
                            style="padding:5px 8px;border:1.5px solid var(--color-primary);border-radius:5px;font-size:13px">
                      <option [ngValue]="true">Sim</option>
                      <option [ngValue]="false">Não</option>
                    </select>
                  </td>
                  <td>
                    <div class="row-actions">
                      <button class="btn-icon" title="Confirmar" (click)="confirmEditDespesa(i)">✔️</button>
                      <button class="btn-icon" title="Cancelar" (click)="cancelEditDespesa()">✖️</button>
                    </div>
                  </td>
                </tr>
              </ng-container>
              <tr>
                <td style="font-weight:700">Total Despesas</td>
                <td style="text-align:right;font-weight:700">{{ totalDespesas() | currency:'BRL':'symbol':'1.2-2' }}</td>
                <td colspan="3"></td>
              </tr>
            </tbody>
          </table>
          <p *ngIf="despesasForm.length === 0" style="font-size:13px;color:var(--color-text-muted);margin-top:8px">Nenhuma despesa adicionada.</p>

          <div class="actions">
            <button class="btn btn-primary" (click)="nextStep()">Próximo →</button>
            <button class="btn btn-secondary" (click)="salvarTudo('EmAndamento')">💾 Salvar</button>
            <button class="btn btn-secondary" (click)="salvarTudo('Finalizado')">✅ Finalizar</button>
            <button class="btn btn-secondary" (click)="prevStep()">← Voltar</button>
            <button class="btn btn-secondary" style="margin-left:auto" (click)="cancelWizard()">Cancelar</button>
          </div>
        </div>

        <!-- ─ PASSO 4 — NCM / Impostos ─ -->
        <div class="card" *ngIf="step === 4">
          <p style="font-size:13px;color:var(--color-text-muted);margin-bottom:16px">
            Vincule NCMs cadastrados. As alíquotas são pré-preenchidas e o sistema calcula os impostos automaticamente.
          </p>
          <div class="inline-form">
            <div class="inline-form-row">
              <div class="f" style="flex:2">
                <label>NCM <span class="required">*</span></label>
                <select [(ngModel)]="ncmSel" (ngModelChange)="onNcmSelecionado($event)">
                  <option value="">— Selecione um NCM cadastrado —</option>
                  <option *ngFor="let n of ncms" [value]="n.id">{{ n.codigoNcm }} — {{ n.descricao }}</option>
                </select>
              </div>
              <div class="f" style="min-width:140px;max-width:180px">
                <label>Base de Cálculo (R$) <span class="required">*</span></label>
                <input type="text" [(ngModel)]="ncvForm.baseCalculo" appCurrencyMask="BRL" min="0" step="0.01" placeholder="R$ 0,00" />
              </div>
            </div>
            <!-- Alíquotas pré-preenchidas (editáveis) -->
            <div class="inline-form-row" *ngIf="ncvForm.ncmId">
              <div class="f">
                <label>I.I. (%)</label>
                <input type="number" [(ngModel)]="ncvForm.aliIi" min="0" max="100" step="0.01" />
              </div>
              <div class="f">
                <label>IPI (%)</label>
                <input type="number" [(ngModel)]="ncvForm.aliIpi" min="0" max="100" step="0.01" />
              </div>
              <div class="f">
                <label>PIS (%)</label>
                <input type="number" [(ngModel)]="ncvForm.aliPis" min="0" max="100" step="0.01" />
              </div>
              <div class="f">
                <label>COFINS (%)</label>
                <input type="number" [(ngModel)]="ncvForm.aliCofins" min="0" max="100" step="0.01" />
              </div>
              <div class="f">
                <label>ICMS (%)</label>
                <input type="number" [(ngModel)]="ncvForm.aliIcms" min="0" max="100" step="0.01" />
              </div>
              <div class="f" style="min-width:80px;max-width:80px">
                <label>&nbsp;</label>
                <button class="btn btn-secondary" (click)="addNcmVinculado()">+ Add</button>
              </div>
            </div>
            <p class="err-msg" *ngIf="ncvErro">{{ ncvErro }}</p>
          </div>

          <table class="inline-table" *ngIf="ncvsForm.length > 0">
            <thead>
              <tr>
                <th>NCM</th>
                <th>Descrição</th>
                <th style="text-align:right;width:100px">Base</th>
                <th style="text-align:right;width:110px">Total Impostos</th>
                <th style="width:50px"></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let nv of ncvsForm; let i = index">
                <td><code>{{ nv.numeroNcm }}</code></td>
                <td>{{ nv.descricao }}</td>
                <td style="text-align:right">{{ nv.baseCalculo | currency:'BRL':'symbol':'1.2-2' }}</td>
                <td style="text-align:right;font-weight:700;color:#059669">
                  {{ calcTotal(nv) | currency:'BRL':'symbol':'1.2-2' }}
                </td>
                <td><button class="btn-icon danger" (click)="removeNcv(i)">🗑️</button></td>
              </tr>
              <tr>
                <td colspan="3" style="font-weight:700">Total Impostos</td>
                <td style="text-align:right;font-weight:800;color:#059669">
                  {{ totalNcvs() | currency:'BRL':'symbol':'1.2-2' }}
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
          <p *ngIf="ncvsForm.length === 0" style="font-size:13px;color:var(--color-text-muted);margin-top:8px">Nenhum NCM vinculado.</p>

          <div class="actions">
            <button class="btn btn-primary" (click)="nextStep()">Próximo →</button>
            <button class="btn btn-secondary" (click)="salvarTudo('EmAndamento')">💾 Salvar</button>
            <button class="btn btn-secondary" (click)="salvarTudo('Finalizado')">✅ Finalizar</button>
            <button class="btn btn-secondary" (click)="prevStep()">← Voltar</button>
            <button class="btn btn-secondary" style="margin-left:auto" (click)="cancelWizard()">Cancelar</button>
          </div>
        </div>

        <!-- ─ PASSO 5 — Resumo Consolidado ─ -->
        <div class="card" *ngIf="step === 5">

          <!-- Cabeçalho do resumo -->
          <div style="display:flex;align-items:center;gap:14px;margin-bottom:22px;padding-bottom:16px;border-bottom:2px solid var(--color-border)">
            <div style="flex:1">
              <h3 style="margin:0 0 4px;font-size:16px;font-weight:800">📋 Resumo Consolidado</h3>
              <p style="margin:0;font-size:12px;color:var(--color-text-muted)">Visão completa de todos os dados do custo despachante</p>
            </div>
            <span class="status-custo-badge" [ngStyle]="{ background: wizardStatus === 'Finalizado' ? '#22c55e' : wizardStatus === 'Pendente' ? '#64748b' : wizardStatus === 'CanceladoPeloOV' ? '#6b7280' : '#f59e0b' }">{{ wizardStatus === 'Finalizado' ? 'Finalizado' : wizardStatus === 'Pendente' ? 'Pendente' : wizardStatus === 'CanceladoPeloOV' ? 'Cancelado pelo OV' : wizardStatus === 'ReabertoPeloOV' ? 'Reaberto pelo OV' : 'Em Andamento' }}</span>
          </div>

          <!-- Solicitação vinculada -->
          <div class="resumo-section" *ngIf="p1.solicitacaoOrcamentoId">
            <div class="resumo-section-title">🔗 Solicitação de Origem</div>
            <div class="sol-card">
              <span style="font-family:monospace;font-size:13px;font-weight:700;color:#1d4ed8">{{ codSolById(p1.solicitacaoOrcamentoId) }}</span>
              <span style="color:var(--color-text-muted);font-size:12px">Custo vinculado a esta solicitação de orçamento</span>
            </div>
          </div>

          <!-- Dados básicos -->
          <div class="resumo-section">
            <div class="resumo-section-title">📝 Dados Básicos</div>
            <div class="resumo-dados-grid">
              <div class="resumo-dado">
                <label>Despachante</label>
                <span>{{ nomeDespachanteById(p1.despachanteId) }}</span>
              </div>
              <div class="resumo-dado">
                <label>Importador</label>
                <span>{{ nomeImportadorById(p1.importadorId) }}</span>
              </div>
              <div class="resumo-dado">
                <label>Responsável</label>
                <span>{{ p1.responsavel }}</span>
              </div>
              <div class="resumo-dado">
                <label>Porto Origem</label>
                <span>{{ nomePortoOrigemById(p1.portoOrigemId) }}</span>
              </div>
              <div class="resumo-dado">
                <label>Porto Destino</label>
                <span>{{ nomePortoDestinoById(p1.portoDestinoId) }}</span>
              </div>
              <div class="resumo-dado">
                <label>Data</label>
                <span>{{ p1.data | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="resumo-dado">
                <label>Container</label>
                <span>{{ p1.tamContainer }}</span>
              </div>
              <div class="resumo-dado">
                <label>Peso</label>
                <span>{{ p1.peso | number:'1.0-2' }} kg</span>
              </div>
              <div class="resumo-dado" *ngIf="p1.observacao">
                <label>Observação</label>
                <span>{{ p1.observacao }}</span>
              </div>
            </div>

            <!-- Valores financeiros -->
            <div style="margin-top:14px;display:grid;grid-template-columns:repeat(4,1fr);gap:8px">
              <div style="background:var(--color-bg);border:1px solid var(--color-border);border-radius:8px;padding:10px 12px;text-align:center">
                <div style="font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:var(--color-text-muted)">Taxa USD</div>
                <div style="font-size:14px;font-weight:700;margin-top:2px">{{ p1.taxaUsd | currency:'USD':'symbol':'1.2-2' }}</div>
              </div>
              <div style="background:var(--color-bg);border:1px solid var(--color-border);border-radius:8px;padding:10px 12px;text-align:center">
                <div style="font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:var(--color-text-muted)">FOB USD</div>
                <div style="font-size:14px;font-weight:700;margin-top:2px">{{ p1.fobUsd | currency:'USD':'symbol':'1.2-2' }}</div>
              </div>
              <div style="background:var(--color-bg);border:1px solid var(--color-border);border-radius:8px;padding:10px 12px;text-align:center">
                <div style="font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:var(--color-text-muted)">FOB R$</div>
                <div style="font-size:14px;font-weight:700;margin-top:2px">{{ p1.fobReais | currency:'BRL':'symbol':'1.2-2' }}</div>
              </div>
              <div style="background:var(--color-bg);border:1px solid var(--color-border);border-radius:8px;padding:10px 12px;text-align:center">
                <div style="font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:var(--color-text-muted)">CIF USD</div>
                <div style="font-size:14px;font-weight:700;margin-top:2px">{{ p1.cifUsd | currency:'USD':'symbol':'1.2-2' }}</div>
              </div>
              <div style="background:var(--color-bg);border:1px solid var(--color-border);border-radius:8px;padding:10px 12px;text-align:center">
                <div style="font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:var(--color-text-muted)">CIF R$</div>
                <div style="font-size:14px;font-weight:700;margin-top:2px">{{ p1.cifReais | currency:'BRL':'symbol':'1.2-2' }}</div>
              </div>
              <div style="background:var(--color-bg);border:1px solid var(--color-border);border-radius:8px;padding:10px 12px;text-align:center">
                <div style="font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:var(--color-text-muted)">Seguro USD</div>
                <div style="font-size:14px;font-weight:700;margin-top:2px">{{ p1.seguroUsd | currency:'USD':'symbol':'1.2-2' }}</div>
              </div>
              <div style="background:var(--color-bg);border:1px solid var(--color-border);border-radius:8px;padding:10px 12px;text-align:center">
                <div style="font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:var(--color-text-muted)">Frete USD</div>
                <div style="font-size:14px;font-weight:700;margin-top:2px">{{ p1.freteInternacionalUsd | currency:'USD':'symbol':'1.2-2' }}</div>
              </div>
              <div style="background:var(--color-bg);border:1px solid var(--color-border);border-radius:8px;padding:10px 12px;text-align:center" *ngIf="p1.taxaUsdAgente">
                <div style="font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:var(--color-text-muted)">Taxa USD Agente</div>
                <div style="font-size:14px;font-weight:700;margin-top:2px">{{ p1.taxaUsdAgente | currency:'USD':'symbol':'1.2-2' }}</div>
              </div>
            </div>
          </div>

          <!-- LI -->
          <div class="resumo-section">
            <div class="resumo-section-title">
              📄 Licença de Importação (LI)
              <span style="margin-left:auto;font-size:11px;font-weight:400;text-transform:none;letter-spacing:0;color:var(--color-text)">{{ lisForm.length }} item(ns) — Total: <strong>{{ totalLis() | currency:'BRL':'symbol':'1.2-2' }}</strong></span>
            </div>
            <ng-container *ngIf="lisForm.length > 0; else semLi">
              <table class="resumo-table">
                <thead>
                  <tr>
                    <th style="width:120px">NCM</th>
                    <th>Descrição</th>
                    <th style="width:130px;text-align:right">Data</th>
                    <th style="width:150px;text-align:right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let li of lisForm">
                    <td><code style="font-size:12px">{{ li.ncm || '—' }}</code></td>
                    <td>{{ li.descricao }}</td>
                    <td style="text-align:right">{{ li.data | date:'dd/MM/yyyy' }}</td>
                    <td style="text-align:right;font-weight:600">{{ li.valor | currency:'BRL':'symbol':'1.2-2' }}</td>
                  </tr>
                  <tr class="total-row">
                    <td colspan="3">Total LI</td>
                    <td style="text-align:right">{{ totalLis() | currency:'BRL':'symbol':'1.2-2' }}</td>
                  </tr>
                </tbody>
              </table>
            </ng-container>
            <ng-template #semLi>
              <p style="font-size:12px;color:var(--color-text-muted);margin:0">Nenhum item de LI adicionado.</p>
            </ng-template>
          </div>

          <!-- Despesas -->
          <div class="resumo-section">
            <div class="resumo-section-title">
              💸 Despesas
              <span style="margin-left:auto;font-size:11px;font-weight:400;text-transform:none;letter-spacing:0;color:var(--color-text)">{{ despesasForm.length }} item(ns) — Total: <strong>{{ totalDespesas() | currency:'BRL':'symbol':'1.2-2' }}</strong></span>
            </div>
            <ng-container *ngIf="despesasForm.length > 0; else semDespesas">
              <table class="resumo-table">
                <thead>
                  <tr>
                    <th>Descrição</th>
                    <th style="width:130px;text-align:right">Data</th>
                    <th style="width:130px;text-align:center">Base ICMS</th>
                    <th style="width:150px;text-align:right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let d of despesasForm">
                    <td>{{ d.descricao }}</td>
                    <td style="text-align:right">{{ d.data | date:'dd/MM/yyyy' }}</td>
                    <td style="text-align:center">
                      <span [class]="d.entraBaseIcms ? 'tag-icms-sim' : 'tag-icms-nao'">
                        {{ d.entraBaseIcms ? 'Sim' : 'Não' }}
                      </span>
                    </td>
                    <td style="text-align:right;font-weight:600">{{ d.valor | currency:'BRL':'symbol':'1.2-2' }}</td>
                  </tr>
                  <tr class="total-row">
                    <td colspan="3">Total Despesas</td>
                    <td style="text-align:right">{{ totalDespesas() | currency:'BRL':'symbol':'1.2-2' }}</td>
                  </tr>
                </tbody>
              </table>
            </ng-container>
            <ng-template #semDespesas>
              <p style="font-size:12px;color:var(--color-text-muted);margin:0">Nenhuma despesa adicionada.</p>
            </ng-template>
          </div>

          <!-- NCM / Impostos -->
          <div class="resumo-section">
            <div class="resumo-section-title">
              🧮 NCM / Impostos
              <span style="margin-left:auto;font-size:11px;font-weight:400;text-transform:none;letter-spacing:0;color:var(--color-text)">{{ ncvsForm.length }} NCM(s) — Total Impostos: <strong style="color:#059669">{{ totalNcvs() | currency:'BRL':'symbol':'1.2-2' }}</strong></span>
            </div>
            <ng-container *ngIf="ncvsForm.length > 0; else semNcv">
              <div class="ncm-card" *ngFor="let nv of ncvsForm">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
                  <code style="font-size:13px;font-weight:700;background:var(--color-bg);padding:2px 8px;border-radius:5px;border:1px solid var(--color-border)">{{ nv.numeroNcm }}</code>
                  <span style="font-size:13px;font-weight:600">{{ nv.descricao }}</span>
                  <span style="margin-left:auto;font-size:12px;color:var(--color-text-muted)">Base: <strong>{{ nv.baseCalculo | currency:'BRL':'symbol':'1.2-2' }}</strong></span>
                </div>
                <div class="imposto-breakdown">
                  <div class="imposto-item">
                    <div class="lab">I.I.</div>
                    <div class="ali">{{ nv.aliIi }}%</div>
                    <div class="val">{{ (nv.baseCalculo * (nv.aliIi / 100)) | currency:'BRL':'symbol':'1.2-2' }}</div>
                  </div>
                  <div class="imposto-item">
                    <div class="lab">IPI</div>
                    <div class="ali">{{ nv.aliIpi }}%</div>
                    <div class="val">{{ ((nv.baseCalculo + nv.baseCalculo * (nv.aliIi/100)) * (nv.aliIpi / 100)) | currency:'BRL':'symbol':'1.2-2' }}</div>
                  </div>
                  <div class="imposto-item">
                    <div class="lab">PIS</div>
                    <div class="ali">{{ nv.aliPis }}%</div>
                    <div class="val">{{ (nv.baseCalculo * (nv.aliPis / 100)) | currency:'BRL':'symbol':'1.2-2' }}</div>
                  </div>
                  <div class="imposto-item">
                    <div class="lab">COFINS</div>
                    <div class="ali">{{ nv.aliCofins }}%</div>
                    <div class="val">{{ (nv.baseCalculo * (nv.aliCofins / 100)) | currency:'BRL':'symbol':'1.2-2' }}</div>
                  </div>
                  <div class="imposto-item" style="background:#f0fdf4;border:1px solid #bbf7d0">
                    <div class="lab">ICMS</div>
                    <div class="ali">{{ nv.aliIcms }}%</div>
                    <div class="val">{{ ((nv.baseCalculo + nv.baseCalculo*(nv.aliIi/100) + (nv.baseCalculo+nv.baseCalculo*(nv.aliIi/100))*(nv.aliIpi/100)) * (nv.aliIcms / 100)) | currency:'BRL':'symbol':'1.2-2' }}</div>
                  </div>
                </div>
                <div style="text-align:right;margin-top:8px;font-size:13px;font-weight:700;color:#059669">
                  Total do NCM: {{ calcTotal(nv) | currency:'BRL':'symbol':'1.2-2' }}
                </div>
              </div>
            </ng-container>
            <ng-template #semNcv>
              <p style="font-size:12px;color:var(--color-text-muted);margin:0">Nenhum NCM vinculado.</p>
            </ng-template>
          </div>

          <!-- Totalizador final -->
          <div class="resumo-section" style="margin-bottom:0">
            <div class="resumo-section-title">💰 Totalizador</div>
            <div style="border:1.5px solid var(--color-border);border-radius:10px;padding:14px 18px;margin-bottom:12px">
              <div class="subtotal-row">
                <span style="color:var(--color-text-muted)">CIF (R$)</span>
                <span style="font-weight:600">{{ p1.cifReais | currency:'BRL':'symbol':'1.2-2' }}</span>
              </div>
              <div class="subtotal-row">
                <span style="color:var(--color-text-muted)">Total LI ({{ lisForm.length }} itens)</span>
                <span style="font-weight:600">{{ totalLis() | currency:'BRL':'symbol':'1.2-2' }}</span>
              </div>
              <div class="subtotal-row">
                <span style="color:var(--color-text-muted)">Total Despesas ({{ despesasForm.length }} itens)</span>
                <span style="font-weight:600">{{ totalDespesas() | currency:'BRL':'symbol':'1.2-2' }}</span>
              </div>
              <div class="subtotal-row" style="color:#059669">
                <span style="font-weight:600">Total Impostos ({{ ncvsForm.length }} NCMs)</span>
                <span style="font-weight:700">{{ totalNcvs() | currency:'BRL':'symbol':'1.2-2' }}</span>
              </div>
            </div>
            <div class="total-geral-box">
              <span class="label">TOTAL GERAL</span>
              <span class="valor">{{ totalGeral() | currency:'BRL':'symbol':'1.2-2' }}</span>
            </div>
          </div>

          <!-- Packlist da Solicitação -->
          <ng-container *ngIf="p1.solicitacaoOrcamentoId && packlistDocs(p1.solicitacaoOrcamentoId).length > 0">
            <div class="resumo-section" style="margin-top:20px;margin-bottom:0">
              <div class="resumo-section-title">📦 Packlist da Solicitação</div>
              <div class="packlist-box" style="margin-top:0">
                <div class="packlist-row" *ngFor="let doc of packlistDocs(p1.solicitacaoOrcamentoId)">
                  <span class="packlist-name">{{ doc.nomeArquivo }}</span>
                  <span class="packlist-obs">{{ doc.observacao || '' }}</span>
                  <span class="packlist-date">{{ doc.dataUpload | date:'dd/MM/yyyy' }}</span>
                  <button class="btn-icon" title="Baixar / Ver arquivo"
                    (click)="downloadPacklist(doc.linkDocumento, doc.nomeArquivo)">⬇️</button>
                </div>
              </div>
            </div>
          </ng-container>

          <div class="actions" style="margin-top:24px">
            <button class="btn btn-secondary" *ngIf="!modoVisualizacao" (click)="salvarTudo('EmAndamento')">💾 Salvar</button>
            <button class="btn btn-primary" *ngIf="!modoVisualizacao" (click)="salvarTudo('Finalizado')">✅ Finalizar</button>
            <button class="btn btn-secondary" *ngIf="!modoVisualizacao" (click)="prevStep()">← Voltar</button>
            <button class="btn btn-outline" (click)="openPreview()">👁 Preview</button>
            <button class="btn btn-secondary" style="margin-left:auto" (click)="cancelWizard()">Cancelar</button>
          </div>
        </div>
      </ng-container>

      <!-- PREVIEW MODAL -->
      <div class="preview-overlay" *ngIf="showPreview" (click)="showPreview=false">
        <div class="preview-modal" [class.maximized]="previewMaximized" (click)="$event.stopPropagation()">
          <div class="preview-toolbar">
            <h4>📋 Preview — Planilha de Custos</h4>
            <div class="pt-actions">
              <button class="btn btn-primary" (click)="exportarPDF()">📄 Exportar PDF</button>
              <button class="btn-icon-sm" (click)="previewMaximized=!previewMaximized" [title]="previewMaximized ? 'Restaurar' : 'Maximizar'">{{ previewMaximized ? '⊡' : '⛶' }}</button>
              <button class="btn-icon-sm" (click)="showPreview=false" title="Fechar">✕</button>
            </div>
          </div>
          <div class="preview-body">
            <iframe [srcdoc]="previewSrcdoc!" title="Preview Planilha de Custos" style="width:100%;height:100%;border:none;"></iframe>
          </div>
        </div>
      </div>

    </div>
  `
})
export class CustoDespachanteComponent implements OnInit {

  readonly stepLabels = ['Dados Básicos', 'LI', 'Despesas', 'NCM/Impostos', 'Resumo'];

  // ── List ──────────────────────────────────────────────────────────────
  custos: CustoDespachante[] = [];
  q = '';
  showHistoricoVersoes = false;
  listViewMode: 'agrupado' | 'tabela' = 'agrupado';
  currentPage = 1;
  pageSize = 20;
  pagedResult: PagedResult<any> | null = null;
  showWizard = false;
  editing: CustoDespachante | null = null;
  modoVisualizacao = false;

  // ── Lookup data ───────────────────────────────────────────────────────
  despachantes: DespachanteV2[] = [];
  importadores: Importador[] = [];
  portosOrigem: PortoOrigem[] = [];
  portosDestino: PortoDestino[] = [];
  ncms: Ncm[] = [];
  modelos: ModeloDespesa[] = [];
  modeloSelId = '';

  // ── Preview state ─────────────────────────────────────────────────────
  showPreview = false;
  previewMaximized = false;
  previewSrcdoc: SafeHtml = '';

  // ── Wizard state ──────────────────────────────────────────────────────
  step = 1;
  completedSteps = new Set<number>();
  showErr = false;
  wizardStatus: StatusCustoDespachante = 'Pendente';
  apiFieldErrors: Record<string, string[]> = {};

  p1 = {
    despachanteId: '', importadorId: '', portoOrigemId: '', portoDestinoId: '',
    responsavel: '', data: new Date().toISOString().slice(0, 10), tamContainer: '40' as '20' | '40' | 'LCL', peso: 0,
    fobUsd: 0, fobReais: 0, cifUsd: 0, cifReais: 0, seguroUsd: 0, freteInternacionalUsd: 0,
    taxaUsd: 0, taxaUsdAgente: undefined as number | undefined, observacao: '',
    solicitacaoOrcamentoId: undefined as string | undefined
  };

  // LI
  lisForm: LiForm[] = [];
  liForm: LiForm = { ncm: '', descricao: '', valor: 0, data: new Date().toISOString().slice(0, 10) };
  liErro = '';

  // Despesas
  despesasForm: DespesaForm[] = [];
  despesaForm: DespesaForm = { descricao: '', valor: 0, data: new Date().toISOString().slice(0, 10), entraBaseIcms: false };
  despesaErro = '';
  editingDespesaIdx: number | null = null;
  editingDespesaForm: DespesaForm = { descricao: '', valor: 0, data: '', entraBaseIcms: false };

  // NCMs vinculados
  ncvsForm: NcmVinculadoForm[] = [];
  ncvForm: NcmVinculadoForm = { ncmId: '', numeroNcm: '', descricao: '', aliIi: 0, aliIpi: 0, aliPis: 0, aliCofins: 0, aliIcms: 0, baseCalculo: 0 };
  ncmSel = '';
  ncvErro = '';

  constructor(
    private sanitizer: DomSanitizer,
    private service: CustoDespachanteService,
    private calculator: ImpostoCalculatorService,
    private despachanteSvc: DespachanteV2Service,
    private importadorSvc: ImportadorService,
    private portoOrigemSvc: PortoOrigemService,
    private portoDestinoSvc: PortoDestinoService,
    private ncmSvc: NcmService,
    private modeloSvc: ModeloDespesaService,
    private despesaCadastroSvc: DespesaCadastroService,
    private solicitacaoSvc: SolicitacaoOrcamentoService,
    private route: ActivatedRoute,
    private toast: ToastService,
    private confirmDialog: ConfirmDialogService,) {}

  private todayStr(): string { return new Date().toISOString().slice(0, 10); }

  async ngOnInit(): Promise<void> {
    this.despachantes  = this.despachanteSvc.getAtivos();
    this.importadores  = this.importadorSvc.getAtivos();
    this.portosOrigem  = this.portoOrigemSvc.getAtivos();
    this.portosDestino = this.portoDestinoSvc.getAtivos();
    this.ncms          = this.ncmSvc.getAtivos();
    this.modelos       = this.modeloSvc.getAll().filter(m => m.ativo);
    await this.load();
    // Reload catalogs after main data load (async catalog services have had time to populate)
    this.despachantes  = this.despachanteSvc.getAtivos();
    this.importadores  = this.importadorSvc.getAtivos();
    this.portosOrigem  = this.portoOrigemSvc.getAtivos();
    this.portosDestino = this.portoDestinoSvc.getAtivos();
    this.ncms          = this.ncmSvc.getAtivos();
    this.modelos       = this.modeloSvc.getAll().filter(m => m.ativo);
    this.normalizeImportadorSelection();
    // Pré-preencher wizard se vier de uma Solicitação de Orçamento
    const qp = this.route.snapshot.queryParams;
    if (qp['solicitacaoId']) {
      this.p1.solicitacaoOrcamentoId = qp['solicitacaoId'];
      this.p1.despachanteId = qp['despachanteId'] ?? '';
      this.p1.portoOrigemId  = qp['portoOrigemId']  ?? '';
      this.p1.portoDestinoId = qp['portoDestinoId'] ?? '';
      this.p1.importadorId   = '';
      this.p1.tamContainer   = (['20','40','LCL'].includes(qp['tamContainer']) ? qp['tamContainer'] : '40') as '20'|'40'|'LCL';
      this.p1.peso           = Number(qp['peso']) || 0;
      this.p1.responsavel    = qp['responsavel']    ?? '';
      this.normalizeImportadorSelection();
      this.recalculateFinancials();
      this.showWizard = true;
    }
  }

  private normalizeImportadorSelection(): void {
    const selectedId = this.p1.importadorId as string | null | undefined;
    if (!selectedId) {
      this.p1.importadorId = '';
      return;
    }
    const exists = this.importadores.some(i => i.id === selectedId);
    this.p1.importadorId = exists ? selectedId : '';
  }

  async load(): Promise<void> {
    await this.service.refresh();
    this.syncCustosView();
  }

  syncCustosView(): void {
    const base = this.showHistoricoVersoes
      ? this.service.getAll()
      : this.service.getAllCurrent();
    this.custos = this.sortByVersionGroups(base);
    this.updatePagedResult();
  }

  get filtered(): CustoDespachante[] {
    if (!this.q) return this.custos;
    const s = this.q.toLowerCase();
    const filtered = this.custos.filter(c =>
      c.codigoInterno.toLowerCase().includes(s) ||
      this.nomeDespachanteById(c.despachanteId).toLowerCase().includes(s) ||
      this.nomeImportadorById(c.importadorId).toLowerCase().includes(s)
    );
    return this.sortByVersionGroups(filtered);
  }

  get pagedFiltered(): CustoDespachante[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  get groupedFiltered(): CustoGroupSolicitacao[] {
    const solicitacaoMap = new Map<string, {
      solicitacaoId?: string;
      solicitacaoCodigo: string;
      hasSolicitacao: boolean;
      despMap: Map<string, CustoGroupDespachante>;
    }>();

    for (const custo of this.filtered) {
      const hasSolicitacao = !!custo.solicitacaoOrcamentoId;
      const solicitacaoId = custo.solicitacaoOrcamentoId;
      const solicitacaoKey = solicitacaoId ?? '__SEM_SOLICITACAO__';
      const solicitacaoCodigo = hasSolicitacao
        ? this.codSolById(solicitacaoId)
        : 'Sem solicitação';

      let solicGroup = solicitacaoMap.get(solicitacaoKey);
      if (!solicGroup) {
        solicGroup = {
          solicitacaoId,
          solicitacaoCodigo,
          hasSolicitacao,
          despMap: new Map<string, CustoGroupDespachante>()
        };
        solicitacaoMap.set(solicitacaoKey, solicGroup);
      }

      const despKey = custo.despachanteId || '__SEM_DESPACHANTE__';
      let despGroup = solicGroup.despMap.get(despKey);
      if (!despGroup) {
        despGroup = {
          despachanteId: custo.despachanteId,
          despachanteNome: this.nomeDespachanteById(custo.despachanteId),
          custos: [],
          totalCustos: 0,
          totalCorrentes: 0
        };
        solicGroup.despMap.set(despKey, despGroup);
      }

      despGroup.custos.push(custo);
      despGroup.totalCustos += 1;
      if (this.isCurrentVersion(custo.id)) despGroup.totalCorrentes += 1;
    }

    const groups: CustoGroupSolicitacao[] = [];
    solicitacaoMap.forEach((group) => {
      const despachantes = Array.from(group.despMap.values())
        .sort((a, b) => {
          if (b.totalCustos !== a.totalCustos) return b.totalCustos - a.totalCustos;
          return a.despachanteNome.localeCompare(b.despachanteNome, 'pt-BR');
        });
      const totalCustos = despachantes.reduce((sum, d) => sum + d.totalCustos, 0);
      groups.push({
        solicitacaoId: group.solicitacaoId,
        solicitacaoCodigo: group.solicitacaoCodigo,
        hasSolicitacao: group.hasSolicitacao,
        totalCustos,
        despachantes
      });
    });

    return groups.sort((a, b) => {
      if (b.totalCustos !== a.totalCustos) return b.totalCustos - a.totalCustos;
      return a.solicitacaoCodigo.localeCompare(b.solicitacaoCodigo, 'pt-BR');
    });
  }

  get pagedGroupedFiltered(): CustoGroupSolicitacao[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.groupedFiltered.slice(start, start + this.pageSize);
  }

  toggleListView(): void {
    this.listViewMode = this.listViewMode === 'agrupado' ? 'tabela' : 'agrupado';
    this.currentPage = 1;
    this.updatePagedResult();
  }

  onShowHistoricoChange(): void {
    this.currentPage = 1;
    this.syncCustosView();
  }

  onFiltersChanged(): void {
    this.currentPage = 1;
    this.updatePagedResult();
  }

  onPageChange(params: PaginationParams): void {
    this.currentPage = params.page ?? 1;
    this.pageSize = params.pageSize ?? this.pageSize;
    this.updatePagedResult();
  }

  private updatePagedResult(): void {
    const totalCount = this.listViewMode === 'agrupado'
      ? this.groupedFiltered.length
      : this.filtered.length;
    const safePageSize = this.pageSize > 0 ? this.pageSize : 20;
    const totalPages = Math.max(1, Math.ceil(totalCount / safePageSize));
    if (this.currentPage > totalPages) {
      this.currentPage = totalPages;
    }

    this.pagedResult = {
      items: this.listViewMode === 'agrupado' ? this.pagedGroupedFiltered : this.pagedFiltered,
      totalCount,
      page: this.currentPage,
      pageSize: safePageSize,
      totalPages,
      hasNextPage: this.currentPage < totalPages,
      hasPreviousPage: this.currentPage > 1
    };
  }

  private sortByVersionGroups(items: CustoDespachante[]): CustoDespachante[] {
    if (items.length <= 1) return items;

    const byId = new Map(items.map(item => [item.id, item]));
    const referencedPreviousIds = new Set(
      items
        .map(item => item.versaoAnteriorId != null ? String(item.versaoAnteriorId) : '')
        .filter(Boolean)
    );

    const currentItems = items
      .filter(item => !referencedPreviousIds.has(item.id))
      .sort((a, b) => this.compareByRecency(a, b));

    const ordered: CustoDespachante[] = [];
    const seen = new Set<string>();

    for (const current of currentItems) {
      const chain = this.service.getVersionChain(current.id)
        .filter(version => byId.has(version.id));
      for (const version of chain) {
        if (seen.has(version.id)) continue;
        seen.add(version.id);
        ordered.push(version);
      }
    }

    const leftovers = items
      .filter(item => !seen.has(item.id))
      .sort((a, b) => this.compareByRecency(a, b));

    return [...ordered, ...leftovers];
  }

  private compareByRecency(a: CustoDespachante, b: CustoDespachante): number {
    const aTime = new Date(a.data).getTime();
    const bTime = new Date(b.data).getTime();
    if (bTime !== aTime) return bTime - aTime;
    if ((b.versao ?? 0) !== (a.versao ?? 0)) return (b.versao ?? 0) - (a.versao ?? 0);
    return Number(b.id) - Number(a.id);
  }

  // ── Lookup helpers ────────────────────────────────────────────────────

  nomeDespachanteById(id: string): string { return this.despachantes.find(d => d.id === id)?.nome ?? id; }
  nomeImportadorById(id: string): string  { return this.importadores.find(i => i.id === id)?.razaoSocial ?? id; }
  nomePortoOrigemById(id: string): string { return this.portosOrigem.find(p => p.id === id)?.nome ?? id; }
  nomePortoDestinoById(id: string): string { return this.portosDestino.find(p => p.id === id)?.nome ?? id; }
  codSolById(id: string | undefined): string {
    if (!id) return '';
    return this.solicitacaoSvc.getById(id)?.codigoInterno ?? id;
  }

  packlistDocs(solicitacaoId: string | undefined) {
    if (!solicitacaoId) return [];
    return this.solicitacaoSvc.getDocumentos(solicitacaoId);
  }

  downloadPacklist(linkDocumento: string, nomeArquivo: string): void {
    if (!linkDocumento) {
      this.toast.info(`Arquivo ${nomeArquivo}: URL ainda nao disponivel.`);
      return;
    }
    const a = document.createElement('a');
    a.href = linkDocumento;
    a.download = nomeArquivo;
    a.target = '_blank';
    a.rel = 'noopener';
    a.click();
  }

  totalImpostosCusto(custoId: string): number {
    return this.service.getNcmsVinculados(custoId).reduce((acc, nv) => {
      const vals = this.service.getValoresImposto(nv.id);
      return acc + vals.reduce((a, v) => a + v.totalImpostos, 0);
    }, 0);
  }

  // ── Wizard navigation ─────────────────────────────────────────────────

  nextStep(): void {
    if (this.modoVisualizacao) return;
    if (this.step === 1 && !this.validateP1()) return;
    this.showErr = false;
    this.completedSteps.add(this.step);
    this.step++;
  }

  prevStep(): void {
    if (this.modoVisualizacao) return;
    this.step--;
  }

  goToStep(target: number): void {
    if (this.modoVisualizacao) return;
    if (target === this.step) return;
    this.showErr = false;
    this.step = target;
  }

  validateP1(): boolean {
    this.showErr = true;
    return !!(this.p1.despachanteId &&
              this.p1.portoOrigemId && this.p1.portoDestinoId &&
              this.p1.responsavel.trim() && this.p1.data && (this.p1.taxaUsd || 0) > 0);
  }

  // ── LI ────────────────────────────────────────────────────────────────

  addLi(): void {
    if (!this.liForm.descricao.trim() || this.liForm.valor <= 0) {
      this.liErro = 'Descrição e valor são obrigatórios.'; return;
    }
    this.liErro = '';
    this.lisForm.push({ ...this.liForm });
    this.liForm = { ncm: '', descricao: '', valor: 0, data: this.todayStr() };
  }

  removeLi(i: number): void { this.lisForm.splice(i, 1); }
  totalLis(): number { return this.lisForm.reduce((a, l) => a + (l.valor || 0), 0); }

  // ── Despesas ──────────────────────────────────────────────────────────

  addDespesa(): void {
    if (!this.despesaForm.descricao.trim() || this.despesaForm.valor <= 0) {
      this.despesaErro = 'Descrição e valor são obrigatórios.'; return;
    }
    this.despesaErro = '';
    this.despesasForm.push({ ...this.despesaForm });
    this.despesaForm = { descricao: '', valor: 0, data: this.todayStr(), entraBaseIcms: false };
  }

  carregarDoModelo(): void {
    if (!this.modeloSelId) return;
    const itens = this.modeloSvc.getItensByModelo(this.modeloSelId);
    const allDesp = this.despesaCadastroSvc.getAtivos();
    const today = this.todayStr();
    itens.forEach(item => {
      const desp = allDesp.find(d => d.id === item.despesaCadastroId);
      if (!desp) return;
      // Avoid duplicates by description
      const jaExiste = this.despesasForm.some(f => f.descricao === desp.descricao);
      if (jaExiste) return;
      this.despesasForm.push({ descricao: desp.descricao, valor: desp.valor, data: today, entraBaseIcms: false });
    });
    this.modeloSelId = ''; // reset selector after loading
  }

  removeDespesa(i: number): void { this.despesasForm.splice(i, 1); if (this.editingDespesaIdx === i) this.cancelEditDespesa(); }
  totalDespesas(): number { return this.despesasForm.reduce((a, d) => a + (d.valor || 0), 0); }

  startEditDespesa(i: number): void {
    this.editingDespesaIdx = i;
    this.editingDespesaForm = { ...this.despesasForm[i] };
  }

  confirmEditDespesa(i: number): void {
    if (!this.editingDespesaForm.descricao.trim()) return;
    this.despesasForm[i] = { ...this.editingDespesaForm };
    this.cancelEditDespesa();
  }

  cancelEditDespesa(): void {
    this.editingDespesaIdx = null;
    this.editingDespesaForm = { descricao: '', valor: 0, data: '', entraBaseIcms: false };
  }

  // ── NCM vinculado ──────────────────────────────────────────────────────

  onNcmSelecionado(ncmId: string): void {
    const ncm = this.ncms.find(n => n.id === ncmId);
    if (ncm) {
      this.ncvForm = {
        ncmId: ncm.id,
        numeroNcm: ncm.codigoNcm,
        descricao: ncm.descricao,
        aliIi: ncm.aliqII,
        aliIpi: ncm.aliqIPI,
        aliPis: ncm.aliqPIS,
        aliCofins: ncm.aliqCOFINS,
        aliIcms: ncm.aliqICMS,
        baseCalculo: this.ncvForm.baseCalculo
      };
    }
  }

  addNcmVinculado(): void {
    if (!this.ncvForm.ncmId) { this.ncvErro = 'Selecione um NCM.'; return; }
    if (this.ncvForm.baseCalculo <= 0) { this.ncvErro = 'Base de cálculo deve ser maior que zero.'; return; }
    this.ncvErro = '';
    this.ncvsForm.push({ ...this.ncvForm });
    this.ncmSel = '';
    this.ncvForm = { ncmId: '', numeroNcm: '', descricao: '', aliIi: 0, aliIpi: 0, aliPis: 0, aliCofins: 0, aliIcms: 0, baseCalculo: 0 };
  }

  removeNcv(i: number): void { this.ncvsForm.splice(i, 1); }

  calcTotal(nv: NcmVinculadoForm): number {
    const base = nv.baseCalculo;
    const ii   = base * (nv.aliIi / 100);
    const ipi  = (base + ii) * (nv.aliIpi / 100);
    const pis  = base * (nv.aliPis / 100);
    const cof  = base * (nv.aliCofins / 100);
    const icms = (base + ii + ipi) * (nv.aliIcms / 100);
    return ii + ipi + pis + cof + icms;
  }

  totalNcvs(): number { return this.ncvsForm.reduce((a, nv) => a + this.calcTotal(nv), 0); }

  totalGeral(): number {
    return this.totalLis() + this.totalDespesas() + this.totalNcvs() +
           (this.p1.cifReais || 0);
  }

  recalculateFinancials(): void {
    const taxa = Number(this.p1.taxaUsd) || 0;
    const fobUsd = Number(this.p1.fobUsd) || 0;
    const seguroUsd = Number(this.p1.seguroUsd) || 0;
    const freteInternacionalUsd = Number(this.p1.freteInternacionalUsd) || 0;

    this.p1.fobReais = this.roundCurrency(fobUsd * taxa);
    this.p1.cifUsd = this.roundCurrency(fobUsd + seguroUsd + freteInternacionalUsd);
    this.p1.cifReais = this.roundCurrency(this.p1.cifUsd * taxa);
  }

  private roundCurrency(value: number): number {
    return Math.round((Number(value) || 0) * 100) / 100;
  }

  // ── CRUD ──────────────────────────────────────────────────────────────

  openWizard(item?: CustoDespachante): void {
    this.modoVisualizacao = false;
    this.editing = item ?? null;
    this.step = 1;
    this.completedSteps = new Set<number>();
    this.showErr = false;
    this.apiFieldErrors = {};
    this.liErro = '';
    this.despesaErro = '';
    this.ncvErro = '';
    this.ncmSel = '';
    this.cancelEditDespesa();

    if (item) {
      this.wizardStatus = item.status ?? 'Pendente';
      this.p1 = {
        despachanteId: item.despachanteId,
        importadorId:  item.importadorId ?? '',
        portoOrigemId: item.portoOrigemId,
        portoDestinoId: item.portoDestinoId,
        responsavel:   item.responsavel,
        data:          item.data,
        tamContainer:  item.tamContainer,
        solicitacaoOrcamentoId: item.solicitacaoOrcamentoId,
        peso:          item.peso,
        fobUsd:        item.fobUsd,
        fobReais:      item.fobReais,
        cifUsd:        item.cifUsd,
        cifReais:      item.cifReais,
        seguroUsd:     item.seguroUsd,
        freteInternacionalUsd: item.freteInternacionalUsd,
        taxaUsd:       item.taxaUsd,
        taxaUsdAgente: item.taxaUsdAgente,
        observacao:    item.observacao ?? ''
      };
      this.lisForm = this.service.getLis(item.id).map(li => ({
        ncm: li.ncm, descricao: li.descricao, valor: li.valor, data: li.data
      }));
      this.despesasForm = this.service.getDespesas(item.id).map(d => ({
        descricao: d.descricao, valor: d.valor, data: d.data, entraBaseIcms: d.entraBaseIcms
      }));
      this.ncvsForm = this.service.getNcmsVinculados(item.id).map(nv => ({
        ncmId: nv.ncmId, numeroNcm: nv.numeroNcm, descricao: nv.descricao,
        aliIi: nv.aliIi, aliIpi: nv.aliIpi, aliPis: nv.aliPis, aliCofins: nv.aliCofins,
        aliIcms: nv.aliIcms, baseCalculo: nv.baseCalculo
      }));
      // Mark all data-bearing steps as complete when editing an existing record
      this.completedSteps.add(1);
      if (this.lisForm.length > 0) this.completedSteps.add(2);
      if (this.despesasForm.length > 0) this.completedSteps.add(3);
      if (this.ncvsForm.length > 0) this.completedSteps.add(4);
      this.normalizeImportadorSelection();
      this.recalculateFinancials();
    } else {
      this.wizardStatus = 'Pendente';
      this.p1 = {
        despachanteId: '', importadorId: '', portoOrigemId: '', portoDestinoId: '',
        responsavel: '', data: this.todayStr(), tamContainer: '40', peso: 0,
        fobUsd: 0, fobReais: 0, cifUsd: 0, cifReais: 0, seguroUsd: 0, freteInternacionalUsd: 0,
        taxaUsd: 0, taxaUsdAgente: undefined, observacao: '',
        solicitacaoOrcamentoId: undefined
      };
      this.normalizeImportadorSelection();
      this.recalculateFinancials();
      this.lisForm = [];
      this.despesasForm = [];
      this.ncvsForm = [];
    }

    if (item && !this.isCustoEditavel(item)) {
      this.modoVisualizacao = true;
      this.step = 5;
      this.completedSteps = new Set<number>([1, 2, 3, 4, 5]);
    }

    this.liForm = { ncm: '', descricao: '', valor: 0, data: this.todayStr() };
    this.despesaForm = { descricao: '', valor: 0, data: this.todayStr(), entraBaseIcms: false };
    this.ncvForm = { ncmId: '', numeroNcm: '', descricao: '', aliIi: 0, aliIpi: 0, aliPis: 0, aliCofins: 0, aliIcms: 0, baseCalculo: 0 };
    this.showWizard = true;
  }

  cancelWizard(): void { this.showWizard = false; this.editing = null; this.modoVisualizacao = false; this.apiFieldErrors = {}; }

  async salvarTudo(status: StatusCustoDespachante = 'EmAndamento'): Promise<void> {
    if (this.modoVisualizacao) {
      this.toast.info('Este custo está em modo somente leitura.');
      return;
    }

    const eraEdicao = !!this.editing;
    this.apiFieldErrors = {};
    if (!this.validateP1()) return;

    const today = new Date().toISOString().split('T')[0];

    let custoId: string;
    let saved: CustoDespachante;
    try {
      if (this.editing) {
        saved = await this.service.update({
          ...this.editing,
          importadorId:   this.p1.importadorId,
          portoOrigemId:  this.p1.portoOrigemId,
          portoDestinoId: this.p1.portoDestinoId,
          responsavel:    this.p1.responsavel.trim(),
          data:           this.p1.data,
          tamContainer:   this.p1.tamContainer,
          peso:           this.p1.peso || 0,
          fobUsd:         this.p1.fobUsd || 0,
          fobReais:       this.p1.fobReais || 0,
          cifUsd:         this.p1.cifUsd || 0,
          cifReais:       this.p1.cifReais || 0,
          seguroUsd:      this.p1.seguroUsd || 0,
          freteInternacionalUsd: this.p1.freteInternacionalUsd || 0,
          taxaUsd:        this.p1.taxaUsd || 0,
          taxaUsdAgente:  this.p1.taxaUsdAgente,
          observacao:     this.p1.observacao.trim() || undefined,
        });
        custoId = this.editing.id;
      } else {
        saved = await this.service.create({
          despachanteId:          this.p1.despachanteId,
          importadorId:           this.p1.importadorId,
          portoOrigemId:          this.p1.portoOrigemId,
          portoDestinoId:         this.p1.portoDestinoId,
          responsavel:            this.p1.responsavel.trim(),
          data:                   this.p1.data,
          tamContainer:           this.p1.tamContainer,
          peso:                   this.p1.peso || 0,
          fobUsd:                 this.p1.fobUsd || 0,
          fobReais:               this.p1.fobReais || 0,
          cifUsd:                 this.p1.cifUsd || 0,
          cifReais:               this.p1.cifReais || 0,
          seguroUsd:              this.p1.seguroUsd || 0,
          freteInternacionalUsd:  this.p1.freteInternacionalUsd || 0,
          taxaUsd:                this.p1.taxaUsd || 0,
          taxaUsdAgente:          this.p1.taxaUsdAgente,
          observacao:             this.p1.observacao.trim() || undefined,
          solicitacaoOrcamentoId: this.p1.solicitacaoOrcamentoId || undefined,
        });
        custoId = saved.id;
      }
    } catch (err: any) {
      this.apiFieldErrors = this.collectFieldErrors(err);
      if (!Object.keys(this.apiFieldErrors).length) {
        this.toast.error(err?.message ?? 'Erro ao salvar custo despachante.');
      }
      return;
    }

    try {
      // Salva LIs, Despesas e NCMs (antes de finalizar, pois finalizar torna imutável)
      await this.service.replaceLis(custoId, this.lisForm.map(li => ({
        ncm: li.ncm, descricao: li.descricao, valor: li.valor, data: li.data || today
      })));

      await this.service.replaceDespesas(custoId, this.despesasForm.map(d => ({
        descricao: d.descricao, valor: d.valor, data: d.data || today, entraBaseIcms: d.entraBaseIcms
      })));

      const ncvsSalvos = await this.service.replaceNcmsVinculados(custoId, this.ncvsForm.map(nv => ({
        ncmId: nv.ncmId, numeroNcm: nv.numeroNcm, descricao: nv.descricao,
        aliIi: nv.aliIi, aliIpi: nv.aliIpi, aliPis: nv.aliPis, aliCofins: nv.aliCofins,
        aliIcms: nv.aliIcms, baseCalculo: nv.baseCalculo
      })));

      for (const nv of ncvsSalvos) {
        const valor = this.calculator.calcularImpostos(nv);
        await this.service.saveValorImposto(custoId, nv.id, valor);
      }

      // Transição de status
      if (status === 'EmAndamento' && saved.status === 'Pendente') {
        await this.service.iniciar(custoId);
      } else if (status === 'Finalizado') {
        let statusAtual = saved.status;

        if (statusAtual === 'Pendente') {
          await this.service.iniciar(custoId);
          statusAtual = 'EmAndamento';
        }

        // Aceita Finalizar a partir de EmAndamento ou ReabertoPeloOV
        if (statusAtual === 'EmAndamento' || statusAtual === 'ReabertoPeloOV') {
          await this.service.finalizar(custoId);
        }
      }

      this.wizardStatus = status;
      for (let i = 1; i <= 5; i++) this.completedSteps.add(i);

      this.cancelWizard();
      this.syncCustosView();
      this.toast.success(status === 'Finalizado'
        ? 'Custo finalizado com sucesso.'
        : (eraEdicao ? 'Custo atualizado com sucesso.' : 'Custo criado com sucesso.'));
    } catch (err: any) {
      this.toast.error(err?.message ?? 'Erro ao salvar os dados do custo.');
    }
  }

  hasApiFieldError(...keys: string[]): boolean {
    const normalized = keys.map((key) => key?.toLowerCase?.()).filter(Boolean) as string[];
    return normalized.some((key) => !!this.apiFieldErrors[key]?.length);
  }

  firstApiFieldError(...keys: string[]): string {
    const normalized = keys.map((key) => key?.toLowerCase?.()).filter(Boolean) as string[];
    for (const key of normalized) {
      const first = this.apiFieldErrors[key]?.[0];
      if (first) return first;
    }
    return '';
  }

  private collectFieldErrors(err: any): Record<string, string[]> {
    return ApiErrorMapper.mapError(err).fieldErrors;
  }

  canDelete(item: CustoDespachante): boolean {
    return !item.imutavel && item.status !== 'Finalizado' && item.status !== 'CanceladoPeloOV';
  }

  isCustoEditavel(item: CustoDespachante): boolean {
    return !item.imutavel && item.status !== 'Finalizado' && item.status !== 'CanceladoPeloOV';
  }

  canReabrir(item: CustoDespachante): boolean {
    return item.status === 'Finalizado' && this.isCurrentVersion(item.id);
  }

  isCurrentVersion(custoId: string): boolean {
    return this.service.isCurrentVersion(custoId);
  }

  versionCount(custoId: string): number {
    return this.service.getVersionCount(custoId);
  }

  versionLevel(custoId: string, versao: number | undefined): number {
    const total = this.versionCount(custoId);
    return Math.max(total - (versao ?? 1), 0);
  }

  isVersionRoot(custoId: string, versao: number | undefined): boolean {
    return (versao ?? 1) >= this.versionCount(custoId);
  }

  isVersionLeaf(versao: number | undefined): boolean {
    return (versao ?? 1) <= 1;
  }

  abrirVersaoCorrente(custoId: string): void {
    const corrente = this.service.getCurrentVersion(custoId);
    if (!corrente) {
      this.toast.error('Não foi possível localizar a versão corrente.');
      return;
    }
    this.openWizard(corrente);
  }

  async reabrir(id: string): Promise<void> {
    const ok = await this.confirmDialog.confirm({
      title: 'Reabrir custo',
      message: 'Reabrir este custo para edição? Ele ficará com status "Reaberto" e poderá ser editado novamente.',
      confirmText: 'Reabrir',
      cancelText: 'Cancelar',
      danger: false
    });
    if (!ok) return;
    try {
      await this.service.reabrir(id);
      this.syncCustosView();
      this.toast.success('Custo reaberto com sucesso.');
    } catch (err: any) {
      this.toast.error(err?.message ?? 'Erro ao reabrir custo.');
    }
  }

  async remove(id: string): Promise<void> {
    const item = this.custos.find((c) => c.id === id);
    if (item && !this.canDelete(item)) {
      this.toast.error('Custos finalizados não podem ser excluídos.');
      return;
    }

    const ok = await this.confirmDialog.confirm({
      title: 'Excluir custo',
      message: 'Deseja excluir este custo e todos os seus dados vinculados?',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      danger: true
    });
    if (!ok) return;

    try {
      await this.service.remove(id);
      this.syncCustosView();
      this.toast.success('Custo removido com sucesso.');
    } catch (err: any) {
      this.toast.error(err?.message ?? 'Erro ao excluir custo.');
    }
  }

  openPreview(): void {
    this.previewSrcdoc = this.sanitizer.bypassSecurityTrustHtml(this.buildPlanilhaHtml(false));
    this.previewMaximized = false;
    this.showPreview = true;
  }

  exportarPDF(): void {
    const win = window.open('', '_blank');
    if (!win) {
      this.toast.error('Popup bloqueado. Permita pop-ups para este site e tente novamente.');
      return;
    }
    win.document.write(this.buildPlanilhaHtml(true));
    win.document.close();
  }

  private buildPlanilhaHtml(autoPrint = false): string {
    const fmtBRL  = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const fmtUSD  = (v: number) => v.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    const fmtNum  = (v: number, dec = 2) => v.toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    const fmtKg   = (v: number) => `${v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} kg`;
    const fmtPct  = (v: number) => fmtNum(v, 2) + '%';
    const fmtDate = (s: string | undefined) => {
      if (!s) return '—';
      const [y, m, d] = s.split('-');
      return d && m && y ? `${d}/${m}/${y}` : s;
    };

    const codigo = this.editing?.codigoInterno ?? 'NOVO';
    const solCod = this.codSolById(this.p1.solicitacaoOrcamentoId);
    const despachante = this.nomeDespachanteById(this.p1.despachanteId);
    const importador  = this.nomeImportadorById(this.p1.importadorId);
    const portoOrg    = this.nomePortoOrigemById(this.p1.portoOrigemId);
    const portoDst    = this.nomePortoDestinoById(this.p1.portoDestinoId);

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <title>Planilha de Custos</title>
  <style>
    * { box-sizing:border-box; margin:0; padding:0; }
    body { font-family:Arial,'Helvetica Neue',sans-serif; font-size:9px; color:#111; background:#fff; }
    .sheet { width:100%; border-collapse:collapse; }
    .sheet td, .sheet th { border:1px solid #aaa; padding:2px 5px; vertical-align:middle; font-size:9px; }
    .sec-blue  { background:#17375e; color:#fff; font-weight:700; font-size:9px; text-align:center; text-transform:uppercase; letter-spacing:.06em; padding:4px 6px; }
    .sec-green { background:#375623; color:#fff; font-weight:700; font-size:9px; text-align:center; text-transform:uppercase; letter-spacing:.06em; padding:4px 6px; }
    .cat-li    { background:#ffd966; font-weight:700; text-align:center; font-size:8.5px; }
    .cat-desp  { background:#92d050; font-weight:700; text-align:center; font-size:8.5px; }
    .cat-trib  { background:#f4b942; font-weight:700; text-align:center; font-size:8.5px; }
    .val-r     { text-align:right; white-space:nowrap; }
    .val-b     { font-weight:700; }
    .sub-row td { background:#cfe2f3 !important; font-weight:700; border-top:2px solid #4472c4; }
    .tot-y td  { background:#ffff00 !important; font-weight:800; font-size:10px; }
    .tot-r td  { background:#c00050 !important; color:#fff; font-weight:800; font-size:9.5px; }
    .page-title { background:#fffde0; text-align:center; font-size:14px; font-weight:800; letter-spacing:.04em; padding:7px; }
    .ref-row   { background:#fffde0; padding:3px 8px; }
    .ref-cod   { color:#c00; font-weight:700; font-size:10px; font-family:monospace; }
    .sol-cod   { color:#1d4ed8; font-weight:700; font-size:9.5px; font-family:monospace; margin-left:12px; }
    .cli-td    { background:#f9f9f9; font-size:9px; padding:3px 7px; }
    .lbl       { color:#666; }
    .ita { width:100%; border-collapse:collapse; font-size:8.5px; }
    .ita td, .ita th { border:1px solid #ccc; padding:2px 5px; }
    .ita th { background:#dce6f1; font-size:8px; font-weight:700; text-align:center; }
    .ita tr:nth-child(even) td { background:#f5f9ff; }
    .imp-hd { background:#17375e !important; color:#fff !important; text-align:center; font-size:8px; }
    code { font-family:monospace; font-size:8px; background:#f3f4f6; padding:0 3px; border-radius:2px; }
    small { font-size:7.5px; color:#888; }
    @media print { @page { margin:6mm 5mm; size:A4 portrait; } }
  </style>
</head>
<body>
<table class="sheet">
  <tr><td colspan="6" class="page-title">PLANILHA DE CUSTOS</td></tr>
  <tr>
    <td colspan="4" class="ref-row">
      <span class="ref-cod">REF.: ${codigo}</span>${solCod ? `<span class="sol-cod">SOL.: ${solCod}</span>` : ''}
    </td>
    <td colspan="2" class="ref-row" style="text-align:right;font-size:8px;color:#555">
      ${this.wizardStatus === 'Finalizado' ? '<span style="color:#166534;font-weight:700">&#10004; FINALIZADO</span>' : '<span style="color:#92400e;font-weight:700">&#8987; EM ANDAMENTO</span>'}
      &nbsp; Gerado em: ${new Date().toLocaleDateString('pt-BR')}
    </td>
  </tr>
  <tr>
    <td colspan="2" class="cli-td"><span class="lbl">Cliente: </span><strong>${importador}</strong></td>
    <td colspan="2" class="cli-td"><span class="lbl">Importacao por: </span><strong>${despachante}</strong></td>
    <td colspan="2" class="cli-td"><span class="lbl">Data da Simulacao: </span><strong>${fmtDate(this.p1.data)}</strong></td>
  </tr>
  <tr><td colspan="6" class="sec-blue">1 &mdash; PREMISSAS DA OPERACAO</td></tr>
  <tr>
    <td colspan="2" style="vertical-align:top;padding:0">
      <table class="ita">
        <tr><th colspan="3">VALORES</th></tr>
        <tr><th style="text-align:left">Item</th><th>USD</th><th>R$</th></tr>
        <tr><td>FOB</td><td class="val-r">${fmtUSD(this.p1.fobUsd||0)}</td><td class="val-r">${fmtBRL(this.p1.fobReais||0)}</td></tr>
        <tr><td>CIF</td><td class="val-r">${fmtUSD(this.p1.cifUsd||0)}</td><td class="val-r">${fmtBRL(this.p1.cifReais||0)}</td></tr>
        <tr><td>Taxa USD</td><td colspan="2" class="val-r">${fmtUSD(this.p1.taxaUsd||0)}</td></tr>
        <tr><td>Seguro</td><td class="val-r">${fmtUSD(this.p1.seguroUsd||0)}</td><td>&mdash;</td></tr>
        <tr><td>Frete Internacional</td><td class="val-r">${fmtUSD(this.p1.freteInternacionalUsd||0)}</td><td>&mdash;</td></tr>
        ${this.p1.taxaUsdAgente!=null ? `<tr><td>Taxa USD Agente</td><td colspan="2" class="val-r">${fmtUSD(this.p1.taxaUsdAgente)}</td></tr>` : ''}
      </table>
    </td>
    <td colspan="2" style="vertical-align:top;padding:0">
      <table class="ita">
        <tr><th colspan="2">DADOS DA OPERACAO</th></tr>
        <tr><td class="lbl">Porto Origem</td><td class="val-r val-b">${portoOrg}</td></tr>
        <tr><td class="lbl">Porto Destino</td><td class="val-r val-b">${portoDst}</td></tr>
        <tr><td class="lbl">Container</td><td class="val-r val-b">${this.p1.tamContainer}</td></tr>
        <tr><td class="lbl">Peso</td><td class="val-r val-b">${fmtKg(this.p1.peso||0)}</td></tr>
        <tr><td class="lbl">Responsavel</td><td class="val-r val-b">${this.p1.responsavel||'&mdash;'}</td></tr>
        ${this.p1.observacao ? `<tr><td class="lbl">Obs.</td><td style="font-size:8px">${this.p1.observacao}</td></tr>` : ''}
      </table>
    </td>
    <td colspan="2" style="vertical-align:top;padding:0">
      <table class="ita">
        <tr><th colspan="2" class="imp-hd">IMPOSTO DE IMPORTACAO</th></tr>
        ${this.ncvsForm.length === 0
          ? `<tr><td colspan="2" style="text-align:center;color:#888;font-style:italic">Nenhum NCM</td></tr>`
          : `<tr><td>I.I.</td><td class="val-r val-b">${fmtPct(this.ncvsForm[0].aliIi)}</td></tr><tr><td>I.P.I.</td><td class="val-r val-b">${fmtPct(this.ncvsForm[0].aliIpi)}</td></tr><tr><td>ICMS</td><td class="val-r val-b">${fmtPct(this.ncvsForm[0].aliIcms)}</td></tr><tr><td>PIS</td><td class="val-r val-b">${fmtPct(this.ncvsForm[0].aliPis)}</td></tr><tr><td>COFINS</td><td class="val-r val-b">${fmtPct(this.ncvsForm[0].aliCofins)}</td></tr>${this.ncvsForm.length > 1 ? `<tr><td colspan="2" style="font-size:7px;color:#888;text-align:center">${this.ncvsForm.length} NCMs &mdash; aliq. do 1o NCM</td></tr>` : ''}`
        }
      </table>
    </td>
  </tr>
  ${this.ncvsForm.length > 0 ? `<tr style="background:#dce6f1"><td style="font-weight:700;font-size:8px;color:#17375e">NCM</td><td colspan="5" style="font-size:8.5px">${this.ncvsForm.map(nv => `<code>${nv.numeroNcm}</code> <strong>${nv.descricao}</strong> <small>(Base: ${fmtBRL(nv.baseCalculo)})</small>`).join(' &nbsp;|&nbsp; ')}</td></tr>` : ''}
  <tr><td colspan="6" class="sec-green">2 &mdash; DESPESAS NO DESEMBARACO</td></tr>
  <tr style="background:#e2efda">
    <td colspan="2" style="font-weight:700;font-size:8px;color:#375623">CATEGORIA</td>
    <td colspan="3" style="font-weight:700;font-size:8px;color:#375623">DESCRICAO</td>
    <td style="font-weight:700;font-size:8px;color:#375623;text-align:right">VALOR</td>
  </tr>
  ${(()=>{
    const liR = this.lisForm.length === 0
      ? `<tr><td class="cat-li" colspan="2">LI</td><td colspan="4" style="color:#888;font-style:italic;font-size:8px">Nenhum item de LI.</td></tr>`
      : this.lisForm.map((li, i) => `<tr>${i === 0 ? `<td class="cat-li" colspan="2" rowspan="${this.lisForm.length}">LICENCA DE<br/>IMPORTACAO</td>` : ''}<td colspan="3">${li.descricao}${li.ncm ? ` <code>${li.ncm}</code>` : ''} <small style="float:right">${fmtDate(li.data)}</small></td><td class="val-r">${fmtBRL(li.valor||0)}</td></tr>`).join('');
    const liTot = this.lisForm.length > 0 ? `<tr class="sub-row"><td colspan="5" style="text-align:right">Subtotal LI</td><td class="val-r">${fmtBRL(this.totalLis())}</td></tr>` : '';
    const despR = this.despesasForm.length === 0
      ? `<tr><td class="cat-desp" colspan="2">DESPESAS</td><td colspan="4" style="color:#888;font-style:italic;font-size:8px">Nenhuma despesa.</td></tr>`
      : this.despesasForm.map((d, i) => `<tr>${i === 0 ? `<td class="cat-desp" colspan="2" rowspan="${this.despesasForm.length}">DESPESAS</td>` : ''}<td colspan="3">${d.descricao}${d.entraBaseIcms ? ` <span style="background:#dcfce7;color:#166534;font-size:7px;border-radius:2px;padding:0 3px">Base ICMS</span>` : ''} <small style="float:right">${fmtDate(d.data)}</small></td><td class="val-r">${fmtBRL(d.valor||0)}</td></tr>`).join('');
    const despTot = this.despesasForm.length > 0 ? `<tr class="sub-row"><td colspan="5" style="text-align:right">Subtotal Despesas</td><td class="val-r">${fmtBRL(this.totalDespesas())}</td></tr>` : '';
    const ncvR = this.ncvsForm.length === 0 ? '' : this.ncvsForm.map((nv, i) => { const b=nv.baseCalculo, ii=b*(nv.aliIi/100), ipi=(b+ii)*(nv.aliIpi/100), pis=b*(nv.aliPis/100), cof=b*(nv.aliCofins/100), icms=(b+ii+ipi)*(nv.aliIcms/100); return `<tr>${i===0?`<td class="cat-trib" colspan="2" rowspan="${this.ncvsForm.length}">TRIBUTOS<br/>(IMPOSTOS)</td>`:''}<td colspan="3"><code>${nv.numeroNcm}</code> ${nv.descricao} &mdash; II ${fmtPct(nv.aliIi)} IPI ${fmtPct(nv.aliIpi)} PIS ${fmtPct(nv.aliPis)} COFINS ${fmtPct(nv.aliCofins)} ICMS ${fmtPct(nv.aliIcms)}</td><td class="val-r" style="color:#166534">${fmtBRL(ii+ipi+pis+cof+icms)}</td></tr>`; }).join('');
    const ncvTot = this.ncvsForm.length > 0 ? `<tr class="sub-row"><td colspan="5" style="text-align:right">Subtotal Impostos</td><td class="val-r" style="color:#166534">${fmtBRL(this.totalNcvs())}</td></tr>` : '';
    return liR + liTot + despR + despTot + ncvR + ncvTot;
  })()}
  <tr class="sub-row"><td colspan="5" style="text-align:right">2.1 &mdash; Total das despesas com desembaraco</td><td class="val-r">${fmtBRL(this.totalLis()+this.totalDespesas()+this.totalNcvs())}</td></tr>
  <tr><td colspan="6" class="sec-blue">3 &mdash; CUSTOS DO PRODUTO IMPORTADO</td></tr>
  <tr style="background:#dce6f1"><td colspan="4" style="font-weight:700;font-size:8px">EVENTO</td><td colspan="2" style="font-weight:700;font-size:8px;text-align:right">VALOR</td></tr>
  <tr><td colspan="4">CIF (R$)</td><td colspan="2" class="val-r">${fmtBRL(this.p1.cifReais||0)}</td></tr>
  <tr><td colspan="4">Total LI <small>(${this.lisForm.length} item(ns))</small></td><td colspan="2" class="val-r">${fmtBRL(this.totalLis())}</td></tr>
  <tr><td colspan="4">Total Despesas <small>(${this.despesasForm.length} item(ns))</small></td><td colspan="2" class="val-r">${fmtBRL(this.totalDespesas())}</td></tr>
  ${this.ncvsForm.map(nv => { const b=nv.baseCalculo, ii=b*(nv.aliIi/100), ipi=(b+ii)*(nv.aliIpi/100), pis=b*(nv.aliPis/100), cof=b*(nv.aliCofins/100), icms=(b+ii+ipi)*(nv.aliIcms/100); return `<tr style="background:#f0fdf4"><td colspan="4" style="padding-left:16px;color:#166534"><code>${nv.numeroNcm}</code> ${nv.descricao} <small>II ${fmtPct(nv.aliIi)} IPI ${fmtPct(nv.aliIpi)} PIS ${fmtPct(nv.aliPis)} COFINS ${fmtPct(nv.aliCofins)} ICMS ${fmtPct(nv.aliIcms)}</small></td><td colspan="2" class="val-r" style="color:#166534">${fmtBRL(ii+ipi+pis+cof+icms)}</td></tr>`; }).join('')}
  <tr style="background:#dcfce7"><td colspan="4" style="font-weight:700;color:#166534">Total Impostos <small>(${this.ncvsForm.length} NCM(s))</small></td><td colspan="2" class="val-r val-b" style="color:#166534">${fmtBRL(this.totalNcvs())}</td></tr>
  <tr class="sub-row"><td colspan="4" style="text-align:right">3.1 &mdash; Total Geral</td><td colspan="2" class="val-r">${fmtBRL(this.totalGeral())}</td></tr>
  <tr class="tot-y">
    <td colspan="3"><strong>Desembolso Total na Operacao</strong></td>
    <td></td>
    <td style="text-align:right"><strong>R$</strong></td>
    <td class="val-r"><strong>${fmtNum(this.totalGeral())}</strong></td>
  </tr>
  ${this.p1.taxaUsd ? `<tr class="tot-r"><td colspan="3">Desembolso para o desembaraco: <strong>FECHADO USD</strong></td><td></td><td style="text-align:right"><strong>USD</strong></td><td class="val-r"><strong>${fmtNum(this.totalGeral()/(this.p1.taxaUsd||1))}</strong></td></tr>` : ''}
  <tr><td colspan="6" style="text-align:center;font-size:7.5px;color:#888;background:#f9f9f9;padding:4px">${codigo} &nbsp;&bull;&nbsp; ${despachante} &nbsp;&bull;&nbsp; ${importador} &nbsp;&bull;&nbsp; Gerado em ${new Date().toLocaleString('pt-BR')} &nbsp;&bull;&nbsp; Sistema Import Costs</td></tr>
</table>
<script>window.onload = function(){ if(${autoPrint}) window.print(); };<\/script>
</body>
</html>`;

    return html;
  }
}
