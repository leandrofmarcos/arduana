import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { CRUD_STYLES } from '../../../shared/styles/crud-page.styles';
import { OrcamentoVenda, OrcamentoVendaDespesa, OrcamentoVendaDespesaExtra, OrcamentoVendaCusto } from '../models/orcamento-venda.models';
import { OrcamentoVendaService } from '../services/orcamento-venda.service';
import { CustoDespachanteService } from '../../custo-despachante/services/custo-despachante.service';
import { CustoDespachante } from '../../custo-despachante/models/custo-despachante.models';
import { ClienteV2Service } from '../../cadastros/clientes/services/cliente-v2.service';
import { ClienteV2 } from '../../cadastros/clientes/models/cliente-v2.models';
import { PortoOrigemService } from '../../cadastros/portos-origem/services/porto-origem.service';
import { PortoDestinoService } from '../../cadastros/portos-destino/services/porto-destino.service';
import { DespachanteV2Service } from '../../cadastros/despachantes/services/despachante-v2.service';
import { ImportadorService } from '../../cadastros/importadores/services/importador.service';
import { ImpostoCalculatorService } from '../../custo-despachante/services/imposto-calculator.service';
import { SolicitacaoOrcamentoService } from '../../solicitacao-orcamento/services/solicitacao-orcamento.service';
import { SolicitacaoOrcamento } from '../../solicitacao-orcamento/models/solicitacao-orcamento.models';
import { PacklistApiService } from '../../solicitacao-orcamento/services/packlist-api.service';
import { PacklistDto, PacklistItemDto } from '../../solicitacao-orcamento/models/solicitacao-orcamento.models';
import { AuthService } from '../../../../features/auth/auth.providers';
import { ModeloDespesaService } from '../../cadastros/modelos-despesa/services/modelo-despesa.service';
import { ModeloDespesa } from '../../cadastros/modelos-despesa/models/modelo-despesa.models';
import { DespesaCadastroService } from '../../cadastros/despesas-cadastro/services/despesa-cadastro.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../../core/services/confirm-dialog.service';
import { ParametroSistemaService } from '../../../../core/services/parametro-sistema.service';
import { ApiErrorMapper } from '../../../../core/api/error-handler/api-error.mapper';
import { CurrencyMaskDirective } from '../../../../core/directives/currency-mask.directive';
import { SkeletonListComponent } from '../../../../core/components/skeleton-list/skeleton-list.component';
import { LoadingButtonDirective } from '../../../../core/directives/loading-button.directive';

type LinhaForm = { descricao: string; valor: number };

@Component({
  selector: 'app-orcamento-venda',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe, CurrencyMaskDirective, SkeletonListComponent, LoadingButtonDirective],
  styles: [
    ...CRUD_STYLES,
    `
    /* ── Layout principal do formulário ── */
    .ov-layout { display:grid; grid-template-columns:1fr 1fr; gap:20px; align-items:start; }
    @media (max-width:1100px) { .ov-layout { grid-template-columns:1fr; } }
    .ov-panel { border:1.5px solid var(--color-border); border-radius:12px; background:var(--color-surface); overflow:hidden; }
    .ov-panel-header { padding:14px 18px; border-bottom:1.5px solid var(--color-border); display:flex; align-items:center; gap:10px; }
    .ov-panel-header h3 { margin:0; font-size:13px; font-weight:700; color:var(--color-text); }
    .ov-panel-body { padding:16px 18px; }
    /* Sticky do painel direito */
    .ov-panel-sticky { position:sticky; top:80px; }
    /* Custos comparison */
    .custo-comp-row { display:flex; align-items:stretch; gap:0; border-bottom:1.5px solid var(--color-border); cursor:pointer; transition:.12s; padding:0; }
    .custo-comp-row:last-child { border-bottom:none; }
    .custo-comp-row:hover { background:var(--color-bg); }
    .custo-comp-row.selected { background:#eff6ff; }
    .custo-comp-row.selected .custo-radio { background:#3b82f6; border-color:#3b82f6; }
    .custo-comp-row.selected .custo-radio::after { opacity:1; }
    .custo-radio { width:18px; height:18px; border-radius:50%; border:2px solid #d1d5db; margin:auto 14px; flex-shrink:0; position:relative; transition:.15s; }
    .custo-radio::after { content:''; position:absolute; inset:3px; border-radius:50%; background:#fff; opacity:0; transition:.12s; }
    .custo-comp-body { flex:1; padding:12px 12px 12px 0; }
    .custo-comp-name { font-weight:700; font-size:13px; }
    .custo-comp-cod { font-family:monospace; font-size:11px; color:var(--color-text-muted); }
    .custo-comp-values { display:grid; grid-template-columns:repeat(3,1fr); gap:4px; margin-top:8px; }
    .custo-comp-val { font-size:11px; }
    .custo-comp-val span { display:block; font-size:12px; font-weight:700; }
    .custo-total-est { font-size:13px; font-weight:800; color:var(--color-primary,#3b82f6); }
    .custo-status-badge { display:inline-block; padding:1px 8px; border-radius:10px; font-size:10px; font-weight:700; color:#fff; margin-left:6px; }
    /* Form sections */
    .form-section { margin-bottom:20px; }
    .form-section-title { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:var(--color-text-muted); margin:0 0 12px; padding-bottom:8px; border-bottom:1px solid var(--color-border); }
    /* Inline add row */
    .add-row { display:flex; gap:8px; align-items:flex-end; margin-bottom:8px; }
    .add-row .f { display:flex; flex-direction:column; gap:4px; flex:1; min-width:0; }
    .add-row label { font-size:11px; color:var(--color-text-muted); }
    .add-row input { padding:7px 10px; border:1.5px solid var(--color-border); border-radius:6px; font-size:13px; background:var(--color-bg); color:var(--color-text); width:100%; }
    /* Inline table */
    .items-table { width:100%; border-collapse:collapse; font-size:12px; }
    .items-table th { padding:6px 8px; background:var(--color-bg); font-size:10px; text-transform:uppercase; letter-spacing:.05em; color:var(--color-text-muted); border-bottom:1px solid var(--color-border); }
    .items-table td { padding:6px 8px; border-bottom:1px solid var(--color-border); }
    /* Totalizador */
    .total-panel { background:linear-gradient(135deg,#1e3a5f,#2563eb); color:#fff; border-radius:10px; padding:16px 18px; margin-top:4px; }
    .total-line { display:flex; justify-content:space-between; padding:5px 0; font-size:12px; opacity:.85; border-bottom:1px solid rgba(255,255,255,.12); }
    .total-line:last-child { border-bottom:none; }
    .total-grand { display:flex; justify-content:space-between; padding:12px 0 4px; font-size:17px; font-weight:800; margin-top:4px; border-top:1.5px solid rgba(255,255,255,.3); }
    /* Badges */
    .cod-badge { background:var(--color-surface); border:1px solid var(--color-border); padding:2px 8px; border-radius:6px; font-family:monospace; font-size:12px; }
    .status-badge-s { display:inline-block; padding:2px 10px; border-radius:10px; font-size:11px; font-weight:700; color:#fff; }
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
    /* Preview iframe modal */
    .preview-overlay { position:fixed; inset:0; background:rgba(0,0,0,.65); z-index:1000; display:flex; align-items:center; justify-content:center; padding:16px; }
    .preview-modal { background:#fff; border-radius:12px; width:96%; max-width:1100px; height:92vh; display:flex; flex-direction:column; box-shadow:0 24px 72px rgba(0,0,0,.4); overflow:hidden; transition:width .2s,height .2s,border-radius .2s; }
    .preview-modal.maximized { width:100%; max-width:100%; height:100vh; border-radius:0; }
    .preview-toolbar { display:flex; align-items:center; justify-content:space-between; padding:10px 16px; background:#f8fafc; border-bottom:1.5px solid #e2e8f0; flex-shrink:0; }
    .preview-toolbar h4 { margin:0; font-size:14px; font-weight:700; color:#1e293b; }
    .preview-toolbar .pt-actions { display:flex; gap:8px; align-items:center; }
    .btn-icon-sm { background:none; border:1.5px solid #cbd5e1; border-radius:6px; padding:4px 8px; font-size:14px; cursor:pointer; color:#475569; transition:background .15s; line-height:1; }
    .btn-icon-sm:hover { background:#f1f5f9; }
    .preview-body { flex:1; overflow:auto; background:#d1d5db; padding:12px; }
    .preview-body iframe { width:100%; height:100%; border:none; border-radius:4px; background:#fff; min-height:600px; box-shadow:0 2px 16px rgba(0,0,0,.18); display:block; }
    /* Accordion de custos */
    .custo-acc-item { border-bottom:1.5px solid var(--color-border); }
    .custo-acc-item:last-child { border-bottom:none; }
    .custo-acc-item.selected { background:#eff6ff; }
    .custo-acc-header { display:flex; align-items:stretch; }
    .custo-acc-select { flex:1; display:flex; align-items:stretch; cursor:pointer; transition:.12s; }
    .custo-acc-select:hover { background:var(--color-bg); }
    .custo-acc-chevron { padding:0 16px; border:none; border-left:1px solid var(--color-border); background:transparent; cursor:pointer; color:var(--color-text-muted); font-size:12px; transition:background .12s; flex-shrink:0; }
    .custo-acc-chevron:hover { background:var(--color-bg); }
    .custo-acc-content { padding:16px 18px; border-top:1.5px solid var(--color-border); background:var(--color-surface); }
    .acc-section { margin-bottom:16px; }
    .acc-section-title { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.07em; color:var(--color-text-muted); margin:0 0 8px; padding-bottom:5px; border-bottom:1px solid var(--color-border); display:flex; align-items:center; gap:6px; }
    .acc-dados-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px 16px; }
    .acc-dado { display:flex; flex-direction:column; gap:1px; }
    .acc-dado label { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:var(--color-text-muted); }
    .acc-dado span { font-size:13px; font-weight:500; }
    .acc-fin-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:6px; margin-top:12px; }
    .acc-fin-card { background:var(--color-bg); border:1px solid var(--color-border); border-radius:7px; padding:8px 10px; text-align:center; }
    .acc-fin-card .lbl { font-size:9px; text-transform:uppercase; letter-spacing:.05em; color:var(--color-text-muted); }
    .acc-fin-card .val { font-size:13px; font-weight:700; margin-top:2px; }
    .acc-table { width:100%; border-collapse:collapse; font-size:12px; }
    .acc-table th { padding:5px 8px; background:var(--color-bg); font-size:10px; text-transform:uppercase; letter-spacing:.04em; color:var(--color-text-muted); border-bottom:1px solid var(--color-border); text-align:left; }
    .acc-table td { padding:6px 8px; border-bottom:1px solid var(--color-border); }
    .acc-table tr:last-child td { border-bottom:none; }
    .acc-total-row td { font-weight:700; background:var(--color-bg); border-top:1px solid var(--color-border) !important; border-bottom:none !important; }
    .acc-ncm-card { border:1px solid var(--color-border); border-radius:8px; padding:10px 12px; margin-bottom:8px; }
    .acc-ncm-card:last-child { margin-bottom:0; }
    .acc-imposto-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:4px; margin-top:8px; }
    .acc-imposto-item { background:var(--color-bg); border:1px solid var(--color-border); border-radius:6px; padding:6px; text-align:center; }
    .acc-imposto-item .lab { font-size:9px; text-transform:uppercase; letter-spacing:.04em; color:var(--color-text-muted); }
    .acc-imposto-item .ali { font-size:11px; color:var(--color-text-muted); }
    .acc-imposto-item .val { font-size:12px; font-weight:700; }
    .custo-acc-item.selected .custo-radio { background:#3b82f6; border-color:#3b82f6; }
    .custo-acc-item.selected .custo-radio::after { opacity:1; }
    /* ===== RESPONSIVE ===== */
    @media (max-width: 768px) {
      .ov-panel-sticky { position:static; top:unset; }
      .add-row { flex-wrap:wrap; }
      .add-row .f { min-width:100%; }
      .custo-comp-values { grid-template-columns:repeat(2,1fr); }
      .acc-dados-grid { grid-template-columns:repeat(2,1fr); }
      .acc-fin-grid { grid-template-columns:repeat(2,1fr); }
      .acc-imposto-grid { grid-template-columns:repeat(3,1fr); }
      .preview-modal { width:100%; max-width:100%; height:100vh; border-radius:0; }
    }
    @media (max-width: 480px) {
      .dashboard-header { flex-direction:column; align-items:flex-start; gap:10px; }
      .total-grand { font-size:14px; }
      .total-panel { padding:12px; }
      .custo-comp-values { grid-template-columns:1fr; }
      .acc-imposto-grid { grid-template-columns:repeat(2,1fr); }
      .acc-fin-grid { grid-template-columns:1fr; }
      .preview-toolbar h4 { font-size:12px; }
    }
    `
  ],
  template: `
    <div class="container-standard">

      <div class="dashboard-header">
        <div>
          <h1>💼 Orçamentos de Venda</h1>
          <p class="subtitle">Propostas comerciais baseadas em custo interno</p>
        </div>
        <button class="btn btn-primary" *ngIf="!isDespachante"
          [disabled]="!podeNovoOrcamento"
          [style.opacity]="!podeNovoOrcamento ? '.45' : '1'"
          [style.cursor]="!podeNovoOrcamento ? 'not-allowed' : 'pointer'"
          [title]="!podeNovoOrcamento ? 'Aguardando ao menos um custo despachante finalizado' : 'Criar novo orçamento'"
          (click)="openForm()">+ Novo Orçamento</button>
      </div>

      <!-- ── LISTAGEM ── -->
      <ng-container *ngIf="!showForm && !showPreview">
        <div class="content-section">
          <div class="toolbar">
            <input class="search" type="text" [(ngModel)]="q"
              placeholder="🔎 Buscar por código, cliente ou solicitação" />
            <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--color-text-muted)">
              <input type="checkbox" [(ngModel)]="showHistoricoVersoesOv" (ngModelChange)="syncOrcamentosView()" />
              Mostrar versões anteriores
            </label>
          </div>
          <app-skeleton-list *ngIf="loadingList" [rowCount]="5" [cols]="4"></app-skeleton-list>
          <table class="data-table" *ngIf="!loadingList">
            <thead>
              <tr>
                <th>Código</th>
                <th>Solicitação</th>
                <th>Status</th>
                <th>Cliente</th>
                <th>Custo Base</th>
                <th>Data</th>
                <th>Container</th>
                <th style="text-align:right">Total Geral</th>
                <th style="width:120px">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="filtered.length === 0">
                <td colspan="9" class="empty-state">Nenhum orçamento cadastrado</td>
              </tr>
              <tr *ngFor="let o of filtered" class="version-tree-row" [class.historical]="showHistoricoVersoesOv && !isCurrentVersionOv(o.id)">
                <td>
                  <div class="version-tree" [style.--level]="versionLevelOv(o.id, o.versao)" [class.node-root]="versionLevelOv(o.id, o.versao) === 0">
                    <span class="version-branch"
                      [class.root]="isVersionRootOv(o.id, o.versao)"
                      [class.leaf]="isVersionLeaf(o.versao)"
                      [class.single]="ovVersionCount(o.id) <= 1"></span>
                    <span class="version-node-dot" [class.current]="isCurrentVersionOv(o.id)"></span>
                    <span class="cod-badge">{{ o.codigoInterno }}</span>
                  </div>
                  <span class="badge" style="margin-left:6px">v{{ o.versao }}</span>
                  <span *ngIf="isCurrentVersionOv(o.id)" class="badge" style="margin-left:6px;background:#dcfce7;color:#166534;border-color:#86efac">corrente</span>
                  <span *ngIf="ovVersionCount(o.id) > 1" class="badge" style="margin-left:6px;background:#eff6ff;color:#1d4ed8;border-color:#93c5fd">{{ ovVersionCount(o.id) }} versões</span>
                </td>
                <td>
                  <span class="cod-badge" *ngIf="o.solicitacaoOrcamentoId">{{ codigoSolicitacao(o.solicitacaoOrcamentoId) }}</span>
                  <span *ngIf="!o.solicitacaoOrcamentoId" style="color:var(--color-text-muted);font-size:12px">—</span>
                </td>
                <td>
                  <span class="status-badge-s"
                    [ngStyle]="{ background: ovStatusColor(o.status) }">
                    {{ ovStatusLabel(o.status) }}
                  </span>
                </td>
                <td>{{ nomeClienteById(o.clienteId) }}</td>
                <td>
                  {{ codigosCustosDaOrc(o.id) || codCustoById(o.custoDespachanteId) }}
                  <span *ngIf="o.custoInternoCodigoInterno"
                    style="display:block;font-size:10px;margin-top:2px;color:#166534;font-weight:700">
                    ✓ Aprovado: {{ o.custoInternoCodigoInterno }}
                  </span>
                </td>
                <td>{{ o.data | date:'dd/MM/yyyy' }}</td>
                <td><span class="badge">{{ o.tamContainer }}</span></td>
                <td style="text-align:right;font-weight:700">{{ o.totalGeral | currency:'BRL':'symbol':'1.2-2' }}</td>
                <td>
                  <div class="row-actions">
                    <button class="btn-icon" *ngIf="!isDespachante" [title]="isOrcamentoEditavel(o) ? 'Editar' : 'Somente visualização'" (click)="openForm(o)">{{ isOrcamentoEditavel(o) ? '✏️' : '👁️' }}</button>
                    <button class="btn-icon warning" *ngIf="!isDespachante && canReabrirOv(o)" title="Reabrir orçamento" (click)="reabrirOv(o.id)">🔓</button>
                    <button class="btn-icon danger" *ngIf="!isDespachante" title="Excluir" (click)="remove(o.id)">🗑️</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </ng-container>

      <!-- ── FORMULÁRIO — tela única ── -->
      <ng-container *ngIf="showForm">

        <!-- Cabeçalho do formulário -->
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;flex-wrap:wrap">
          <div>
            <h2 style="margin:0;font-size:18px;font-weight:800;color:var(--color-text)">
              {{ editing ? (modoVisualizacao ? 'Visualizar Orçamento ' : 'Orçamento ') + editing.codigoInterno : 'Novo Orçamento de Venda' }}
            </h2>
            <p style="margin:4px 0 0;font-size:12px;color:var(--color-text-muted)">
              <ng-container *ngIf="solicitacaoAtualId">📋 Vinculado a <strong>{{ codigoSolicitacao(solicitacaoAtualId) }}</strong> · </ng-container>
              Selecione o custo base à esquerda e preencha os dados do orçamento à direita
            </p>
          </div>
          <div style="margin-left:auto;display:flex;gap:8px">
            <button class="btn btn-primary" *ngIf="!modoVisualizacao" (click)="salvar()" [appLoadingBtn]="isSaving">💾 Salvar</button>
            <button class="btn" *ngIf="!modoVisualizacao" style="background:#22c55e;color:#fff" (click)="finalizar()" [appLoadingBtn]="isSaving">✓ Finalizar Orçamento</button>
            <button class="btn btn-secondary" (click)="abrirPreview(null)">&#128065;️ Preview</button>
            <button class="btn btn-secondary" (click)="cancelForm()">Cancelar</button>
          </div>
        </div>

        <div *ngIf="modoVisualizacao" style="margin:-8px 0 12px;padding:10px 12px;border-radius:10px;border:1px solid #fde68a;background:#fffbeb;color:#92400e;font-size:12px;font-weight:700">
          VERSAO HISTORICA - SOMENTE LEITURA
        </div>

        <span class="err-msg" *ngIf="showErr && !form.clienteId" style="display:block;margin-bottom:8px">Preencha o cliente antes de salvar</span>
        <span class="err-msg" *ngIf="showErr && !form.data" style="display:block;margin-bottom:8px">Preencha a data antes de salvar</span>
        <span class="err-msg" *ngIf="showErr && hasApiFieldError('clienteId', 'cliente')" style="display:block;margin-bottom:8px">{{ firstApiFieldError('clienteId', 'cliente') }}</span>
        <span class="err-msg" *ngIf="showErr && hasApiFieldError('data')" style="display:block;margin-bottom:8px">{{ firstApiFieldError('data') }}</span>

        <!-- Layout duas colunas -->
        <div class="ov-layout">

          <!-- ── COLUNA ESQUERDA: custos despachantes ── -->
          <div class="ov-panel">
            <div class="ov-panel-header">
              <h3>📅 Custos Despachantes</h3>
              <span style="margin-left:auto;font-size:12px;color:var(--color-text-muted)">{{ custosFiltrados.length }} disponível(is)</span>
            </div>

            <div style="padding:8px 16px;border-bottom:1px solid var(--color-border);display:flex;align-items:center;gap:8px;font-size:12px;color:var(--color-text-muted)">
              <input type="checkbox" [(ngModel)]="showHistoricoVersoesCusto" (ngModelChange)="syncCustosDisponiveis()" />
              Mostrar versões anteriores
            </div>

            <!-- Busca (standalone) -->
            <div *ngIf="!solicitacaoAtualId" style="padding:12px 16px;border-bottom:1px solid var(--color-border)">
              <input type="text" [(ngModel)]="custoQuery"
                style="width:100%;padding:7px 12px;border:1.5px solid var(--color-border);border-radius:8px;font-size:13px;background:var(--color-bg);color:var(--color-text)"
                placeholder="🔎 Buscar por código ou despachante..." />
            </div>

            <p *ngIf="custosFiltrados.length === 0" style="padding:24px;text-align:center;color:var(--color-text-muted);font-size:13px;margin:0">
              <ng-container *ngIf="solicitacaoAtualId">Nenhum custo vinculado a esta solicitação.</ng-container>
              <ng-container *ngIf="!solicitacaoAtualId">Nenhum custo cadastrado.</ng-container>
            </p>

            <!-- Lista de custos com accordion -->
            <div *ngFor="let c of custosFiltrados" class="custo-acc-item" [class.selected]="isCustoSelecionado(c.id)">
              <!-- Header: clique na área principal para selecionar, chevron para expandir -->
              <div class="custo-acc-header">
                <div class="custo-acc-select" (click)="toggleCusto(c)">
                  <div class="custo-radio"></div>
                  <div class="custo-comp-body">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start">
                      <div>
                        <span class="custo-comp-name">{{ nomeDespachanteById(c.despachanteId) }}</span>
                        <span class="custo-status-badge" [ngStyle]="{ background: c.status === 'Finalizado' ? '#22c55e' : '#f59e0b' }">{{ c.status }}</span>
                        <div class="custo-comp-cod">
                          <span class="version-tree" [style.--level]="versionLevelCusto(c.id, c.versao)" [class.node-root]="versionLevelCusto(c.id, c.versao) === 0">
                            <span class="version-branch"
                              [class.root]="isVersionRootCusto(c.id, c.versao)"
                              [class.leaf]="isVersionLeaf(c.versao)"
                              [class.single]="custoVersionCount(c.id) <= 1"></span>
                            <span class="version-node-dot" [class.current]="isCurrentVersion(c.id)"></span>
                            <span>{{ c.codigoInterno }} · v{{ c.versao }}</span>
                          </span>
                          <span> · {{ c.tamContainer }}' · {{ c.data | date:'dd/MM/yyyy' }}</span>
                          <span *ngIf="isCurrentVersion(c.id)" style="margin-left:6px;color:#16a34a">(corrente)</span>
                        </div>
                      </div>
                      <div style="text-align:right;flex-shrink:0;margin-left:12px">
                        <div style="font-size:10px;color:var(--color-text-muted)">
                          Total Est.<ng-container *ngIf="c.totalGeralManual"> <span style="background:#f59e0b;color:#fff;padding:1px 5px;border-radius:4px;font-size:9px">Manual</span></ng-container>
                        </div>
                        <div class="custo-total-est">
                          <ng-container *ngIf="c.totalGeralManual">{{ c.totalGeralManual | currency:'BRL':'symbol':'1.2-2' }}</ng-container>
                          <ng-container *ngIf="!c.totalGeralManual">{{ (c.cifReais + calcImpostosCusto(c.id)) | currency:'BRL':'symbol':'1.2-2' }}</ng-container>
                        </div>
                      </div>
                    </div>
                    <div class="custo-comp-values">
                      <div class="custo-comp-val">FOB R$<span>{{ c.fobReais | currency:'BRL':'symbol':'1.2-2' }}</span></div>
                      <div class="custo-comp-val">CIF R$<span>{{ c.cifReais | currency:'BRL':'symbol':'1.2-2' }}</span></div>
                      <div class="custo-comp-val">Impostos<span>{{ calcImpostosCusto(c.id) | currency:'BRL':'symbol':'1.2-2' }}</span></div>
                    </div>
                  </div>
                </div>
                <button class="custo-acc-chevron" title="Ver detalhes" (click)="toggleAccordion(c.id)">
                  {{ expandedCustoId === c.id ? '▲' : '▼' }}
                </button>
              </div>

              <!-- Conteúdo expandido -->
              <div class="custo-acc-content" *ngIf="expandedCustoId === c.id">

                <!-- Dados básicos -->
                <div class="acc-section">
                  <div class="acc-section-title">📝 Dados Básicos</div>
                  <div class="acc-dados-grid">
                    <div class="acc-dado"><label>Despachante</label><span>{{ nomeDespachanteById(c.despachanteId) }}</span></div>
                    <div class="acc-dado"><label>Importador</label><span>{{ nomeImpById(c.importadorId) }}</span></div>
                    <div class="acc-dado"><label>Responsável</label><span>{{ c.responsavel }}</span></div>
                    <div class="acc-dado"><label>Porto Origem</label><span>{{ nomePOById(c.portoOrigemId) }}</span></div>
                    <div class="acc-dado"><label>Porto Destino</label><span>{{ nomePDById(c.portoDestinoId) }}</span></div>
                    <div class="acc-dado"><label>Data</label><span>{{ c.data | date:'dd/MM/yyyy' }}</span></div>
                    <div class="acc-dado"><label>Container</label><span>{{ c.tamContainer }}</span></div>
                    <div class="acc-dado"><label>Peso</label><span>{{ c.peso | number:'1.0-2' }} kg</span></div>
                    <div class="acc-dado" *ngIf="c.observacao"><label>Observação</label><span>{{ c.observacao }}</span></div>
                  </div>
                  <div class="acc-fin-grid">
                    <div class="acc-fin-card"><div class="lbl">FOB USD</div><div class="val">{{ c.fobUsd | currency:'USD':'symbol':'1.2-2' }}</div></div>
                    <div class="acc-fin-card"><div class="lbl">FOB R$</div><div class="val">{{ c.fobReais | currency:'BRL':'symbol':'1.2-2' }}</div></div>
                    <div class="acc-fin-card"><div class="lbl">CIF USD</div><div class="val">{{ c.cifUsd | currency:'USD':'symbol':'1.2-2' }}</div></div>
                    <div class="acc-fin-card"><div class="lbl">CIF R$</div><div class="val">{{ c.cifReais | currency:'BRL':'symbol':'1.2-2' }}</div></div>
                    <div class="acc-fin-card"><div class="lbl">Seguro USD</div><div class="val">{{ c.seguroUsd | currency:'USD':'symbol':'1.2-2' }}</div></div>
                    <div class="acc-fin-card"><div class="lbl">Taxa USD</div><div class="val">{{ c.taxaUsd | currency:'USD':'symbol':'1.2-2' }}</div></div>
                    <div class="acc-fin-card"><div class="lbl">Parâmetro USD</div><div class="val">{{ c.parametroUsd | currency:'USD':'symbol':'1.2-2' }}</div></div>
                  </div>
                </div>

                <!-- LI -->
                <div class="acc-section">
                  <div class="acc-section-title">📄 Licença de Importação (LI)
                    <span style="margin-left:auto;font-size:11px;font-weight:400;text-transform:none;letter-spacing:0;color:var(--color-text)">Total: <strong>{{ totalLisCusto(c.id) | currency:'BRL':'symbol':'1.2-2' }}</strong></span>
                  </div>
                  <ng-container *ngIf="getLisCusto(c.id).length > 0; else semLiAcc">
                    <table class="acc-table">
                      <thead><tr><th style="width:110px">NCM</th><th>Descrição</th><th style="width:110px;text-align:right">Data</th><th style="width:130px;text-align:right">Valor</th></tr></thead>
                      <tbody>
                        <tr *ngFor="let li of getLisCusto(c.id)">
                          <td><code style="font-size:11px">{{ li.ncm || '—' }}</code></td>
                          <td>{{ li.descricao }}</td>
                          <td style="text-align:right">{{ li.data | date:'dd/MM/yyyy' }}</td>
                          <td style="text-align:right;font-weight:600">{{ li.valor | currency:'BRL':'symbol':'1.2-2' }}</td>
                        </tr>
                        <tr class="acc-total-row"><td colspan="3">Total LI</td><td style="text-align:right">{{ totalLisCusto(c.id) | currency:'BRL':'symbol':'1.2-2' }}</td></tr>
                      </tbody>
                    </table>
                  </ng-container>
                  <ng-template #semLiAcc><p style="font-size:12px;color:var(--color-text-muted);margin:0">Nenhum item de LI adicionado.</p></ng-template>
                </div>

                <!-- Despesas -->
                <div class="acc-section">
                  <div class="acc-section-title">💸 Despesas
                    <span style="margin-left:auto;font-size:11px;font-weight:400;text-transform:none;letter-spacing:0;color:var(--color-text)">Total: <strong>{{ totalDespesasCusto(c.id) | currency:'BRL':'symbol':'1.2-2' }}</strong></span>
                  </div>
                  <ng-container *ngIf="getDespesasCusto(c.id).length > 0; else semDespAcc">
                    <table class="acc-table">
                      <thead><tr><th>Descrição</th><th style="width:110px;text-align:right">Data</th><th style="width:80px;text-align:center">ICMS</th><th style="width:130px;text-align:right">Valor</th></tr></thead>
                      <tbody>
                        <tr *ngFor="let d of getDespesasCusto(c.id)">
                          <td>{{ d.descricao }}</td>
                          <td style="text-align:right">{{ d.data | date:'dd/MM/yyyy' }}</td>
                          <td style="text-align:center;font-size:12px">{{ d.entraBaseIcms ? '✓' : '—' }}</td>
                          <td style="text-align:right;font-weight:600">{{ d.valor | currency:'BRL':'symbol':'1.2-2' }}</td>
                        </tr>
                        <tr class="acc-total-row"><td colspan="3">Total Despesas</td><td style="text-align:right">{{ totalDespesasCusto(c.id) | currency:'BRL':'symbol':'1.2-2' }}</td></tr>
                      </tbody>
                    </table>
                  </ng-container>
                  <ng-template #semDespAcc><p style="font-size:12px;color:var(--color-text-muted);margin:0">Nenhuma despesa adicionada.</p></ng-template>
                </div>

                <!-- NCM / Impostos -->
                <div class="acc-section">
                  <div class="acc-section-title">🧮 NCM / Impostos
                    <span style="margin-left:auto;font-size:11px;font-weight:400;text-transform:none;letter-spacing:0;color:#059669">Total: <strong>{{ calcImpostosCusto(c.id) | currency:'BRL':'symbol':'1.2-2' }}</strong></span>
                  </div>
                  <ng-container *ngIf="getNcvsCusto(c.id).length > 0; else semNcvAcc">
                    <div class="acc-ncm-card" *ngFor="let nv of getNcvsCusto(c.id)">
                      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
                        <code style="font-size:12px;font-weight:700;background:var(--color-bg);padding:2px 6px;border-radius:4px;border:1px solid var(--color-border)">{{ nv.numeroNcm }}</code>
                        <span style="font-size:12px;font-weight:600;flex:1">{{ nv.descricao }}</span>
                        <span style="font-size:11px;color:var(--color-text-muted)">Base: <strong>{{ nv.baseCalculo | currency:'BRL':'symbol':'1.2-2' }}</strong></span>
                      </div>
                      <div class="acc-imposto-grid">
                        <div class="acc-imposto-item"><div class="lab">I.I.</div><div class="ali">{{ nv.aliIi }}%</div><div class="val">{{ nv.baseCalculo*(nv.aliIi/100) | currency:'BRL':'symbol':'1.2-2' }}</div></div>
                        <div class="acc-imposto-item"><div class="lab">IPI</div><div class="ali">{{ nv.aliIpi }}%</div><div class="val">{{ (nv.baseCalculo+nv.baseCalculo*(nv.aliIi/100))*(nv.aliIpi/100) | currency:'BRL':'symbol':'1.2-2' }}</div></div>
                        <div class="acc-imposto-item"><div class="lab">PIS</div><div class="ali">{{ nv.aliPis }}%</div><div class="val">{{ nv.baseCalculo*(nv.aliPis/100) | currency:'BRL':'symbol':'1.2-2' }}</div></div>
                        <div class="acc-imposto-item"><div class="lab">COFINS</div><div class="ali">{{ nv.aliCofins }}%</div><div class="val">{{ nv.baseCalculo*(nv.aliCofins/100) | currency:'BRL':'symbol':'1.2-2' }}</div></div>
                        <div class="acc-imposto-item" style="background:#f0fdf4;border-color:#bbf7d0"><div class="lab">ICMS</div><div class="ali">{{ nv.aliIcms }}%</div><div class="val">{{ (nv.baseCalculo+nv.baseCalculo*(nv.aliIi/100)+(nv.baseCalculo+nv.baseCalculo*(nv.aliIi/100))*(nv.aliIpi/100))*(nv.aliIcms/100) | currency:'BRL':'symbol':'1.2-2' }}</div></div>
                      </div>
                      <div style="text-align:right;margin-top:6px;font-size:12px;font-weight:700;color:#059669">
                        Total NCM: {{ calcNcvTotal(nv) | currency:'BRL':'symbol':'1.2-2' }}
                      </div>
                    </div>
                  </ng-container>
                  <ng-template #semNcvAcc><p style="font-size:12px;color:var(--color-text-muted);margin:0">Nenhum NCM vinculado.</p></ng-template>
                </div>

                <!-- Totalizador -->
                <div class="acc-section" style="margin-bottom:4px">
                  <div class="acc-section-title">💰 Totalizador</div>
                  <div style="background:linear-gradient(135deg,#1e3a5f,#2563eb);color:#fff;border-radius:8px;padding:12px 16px">
                    <ng-container *ngIf="c.totalGeralManual">
                      <div style="display:flex;justify-content:space-between;font-size:12px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.15);opacity:.8"><span>⚠️ Modalidade B — total informado manualmente pelo despachante</span></div>
                      <div style="display:flex;justify-content:space-between;font-size:16px;font-weight:800;padding:10px 0 4px;border-top:1.5px solid rgba(255,255,255,.3);margin-top:4px"><span>TOTAL MANUAL</span><span>{{ c.totalGeralManual | currency:'BRL':'symbol':'1.2-2' }}</span></div>
                    </ng-container>
                    <ng-container *ngIf="!c.totalGeralManual">
                      <div style="display:flex;justify-content:space-between;font-size:12px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.15)"><span>CIF (R$)</span><span>{{ c.cifReais | currency:'BRL':'symbol':'1.2-2' }}</span></div>
                      <div style="display:flex;justify-content:space-between;font-size:12px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.15)"><span>Total LI</span><span>{{ totalLisCusto(c.id) | currency:'BRL':'symbol':'1.2-2' }}</span></div>
                      <div style="display:flex;justify-content:space-between;font-size:12px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.15)"><span>Total Despesas</span><span>{{ totalDespesasCusto(c.id) | currency:'BRL':'symbol':'1.2-2' }}</span></div>
                      <div style="display:flex;justify-content:space-between;font-size:12px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.15)"><span>Total Impostos</span><span>{{ calcImpostosCusto(c.id) | currency:'BRL':'symbol':'1.2-2' }}</span></div>
                      <div style="display:flex;justify-content:space-between;font-size:16px;font-weight:800;padding:10px 0 4px;border-top:1.5px solid rgba(255,255,255,.3);margin-top:4px"><span>TOTAL GERAL</span><span>{{ c.cifReais + totalLisCusto(c.id) + totalDespesasCusto(c.id) + calcImpostosCusto(c.id) | currency:'BRL':'symbol':'1.2-2' }}</span></div>
                    </ng-container>
                  </div>
                </div>

                <!-- Botão de seleção / reabrir -->
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">
                  <button
                    *ngIf="!modoVisualizacao && c.status === 'Finalizado' && isCurrentVersion(c.id)"
                    class="btn btn-warning"
                    style="background:#f59e0b;color:#fff;border:none"
                    (click)="reabrirCusto(c.id)">
                    🔓 Reabrir Custo
                  </button>
                  <span *ngIf="c.status === 'ReabertoPeloOV'" style="font-size:12px;color:#f59e0b;font-weight:600">⚠️ Custo reaberto para edição</span>
                  <span style="flex:1"></span>
                  <button class="btn" [disabled]="modoVisualizacao || !isCurrentVersion(c.id)" [title]="isCurrentVersion(c.id) ? 'Selecionar custo base' : 'Versão histórica (somente visualização)'" [ngStyle]="{ background: isCustoSelecionado(c.id) ? '#22c55e' : 'var(--color-primary,#3b82f6)', color:'#fff' }" (click)="toggleCusto(c)">
                    {{ isCustoSelecionado(c.id) ? '✓ Custo Selecionado como Base' : 'Selecionar como Base' }}
                  </button>
                </div>

              </div>
            </div>

            <div *ngIf="custosSelecionados.length === 0 && showErr" style="padding:10px 16px;background:#fef3c7;border-top:1px solid #fde68a;font-size:12px;color:#92400e">
              ⚠️ Selecione um custo como base para o orçamento
            </div>
            <div *ngIf="custoBaseUsouTotalManual" style="padding:10px 16px;background:#fef3c7;border-top:1px solid #fde68a;font-size:12px;color:#92400e">
              ⚠️ <strong>Modalidade B:</strong> O despachante forneceu apenas um total geral (sem discriminação de CIF/FOB/Impostos). Preencha os campos de valores manualmente no formulário ao lado ou use o total como referência.
            </div>
          </div>

          <!-- ── COLUNA DIREITA: dados do orçamento + totalizador -->
          <div class="ov-panel ov-panel-sticky">
            <div class="ov-panel-header">
              <h3>📊 Dados do Orçamento</h3>
              <ng-container *ngIf="custoBase">
                <span class="cod-badge" style="margin-left:auto">Base: {{ custoBase.codigoInterno }}</span>
              </ng-container>
            </div>
            <div class="ov-panel-body">

              <fieldset [disabled]="modoVisualizacao" style="border:none;padding:0;margin:0;min-width:0">

              <!-- Dados gerais -->
              <div class="form-section">
                <p class="form-section-title">Dados Gerais</p>
                <div class="form-grid">
                  <div class="field w2">
                    <label>Cliente <span class="required">*</span></label>
                    <select [(ngModel)]="form.clienteId" [class.err]="showErr && (!form.clienteId || hasApiFieldError('clienteId', 'cliente'))">
                      <option value="">— Selecione —</option>
                      <option *ngFor="let c of clientes" [value]="c.id">{{ c.razaoSocial }}</option>
                    </select>
                    <span class="err-msg" *ngIf="showErr && hasApiFieldError('clienteId', 'cliente')">{{ firstApiFieldError('clienteId', 'cliente') }}</span>
                  </div>
                  <div class="field">
                    <label>Data <span class="required">*</span></label>
                    <input type="date" [(ngModel)]="form.data" [class.err]="showErr && (!form.data || hasApiFieldError('data'))" />
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
                    <label>Peso Bruto (kg)</label>
                    <input type="text" [(ngModel)]="form.pesoBruto" appCurrencyMask="BRL" [currencyMaskMode]="'number'" [currencyMaskUnit]="'kg'" min="0" step="0.01" placeholder="0 kg" />
                  </div>
                  <div class="field">
                    <label>Peso Líquido (kg)</label>
                    <input type="text" [(ngModel)]="form.pesoLiquido" appCurrencyMask="BRL" [currencyMaskMode]="'number'" [currencyMaskUnit]="'kg'" min="0" step="0.01" placeholder="0 kg" />
                  </div>
                  <div class="field w3">
                    <label>Observação</label>
                    <input type="text" [(ngModel)]="form.observacao" placeholder="Observações ao cliente" />
                  </div>
                </div>
              </div>

              <!-- Valores base -->
              <div class="form-section">
                <p class="form-section-title">Valores Base (do custo selecionado)</p>
                <div class="form-grid">
                  <div class="field">
                    <label>CIF (R$)</label>
                    <input type="text" [(ngModel)]="form.cifReais" appCurrencyMask="BRL" min="0" step="0.01" />
                  </div>
                  <div class="field">
                    <label>CIF (USD)</label>
                    <input type="text" [(ngModel)]="form.cifUsd" appCurrencyMask="USD" min="0" step="0.01" />
                  </div>
                  <div class="field">
                    <label>FOB (R$)</label>
                    <input type="text" [(ngModel)]="form.fobReais" appCurrencyMask="BRL" min="0" step="0.01" />
                  </div>
                  <div class="field">
                    <label>FOB (USD)</label>
                    <input type="text" [(ngModel)]="form.fobUsd" appCurrencyMask="USD" min="0" step="0.01" />
                  </div>
                  <div class="field">
                    <label>Taxa USD</label>
                    <input type="text" [(ngModel)]="form.taxaUsd" appCurrencyMask="USD" min="0" step="0.01" />
                  </div>
                  <div class="field">
                    <label>Parâmetro USD</label>
                    <input type="text" [ngModel]="custoBase?.parametroUsd || 0" appCurrencyMask="USD" min="0" step="0.01" [readonly]="true" />
                  </div>
                  <div class="field">
                    <label>Total Impostos (R$)</label>
                    <input type="text" [(ngModel)]="form.totalImpostos" appCurrencyMask="BRL" min="0" step="0.01" />
                  </div>
                </div>
              </div>

              <!-- Acréscimos manuais -->
              <div class="form-section">
                <p class="form-section-title">Acréscimos</p>
                <div class="form-grid">
                  <div class="field">
                    <label>Frete Nacional / Porto a Destino (R$)</label>
                    <input type="text" [(ngModel)]="form.freteInternacional" appCurrencyMask="BRL" min="0" step="0.01" placeholder="R$ 0,00" />
                  </div>
                  <div class="field">
                    <label>Honorários (R$)</label>
                    <input type="text" [(ngModel)]="form.honorarios" appCurrencyMask="BRL" min="0" step="0.01" placeholder="R$ 0,00" />
                  </div>
                </div>
              </div>

              <!-- Despesas adicionais -->
              <div class="form-section">
                <p class="form-section-title">Despesas Adicionais</p>

                <!-- Carregar de modelo -->
                <div *ngIf="modelos.length > 0" style="display:flex;align-items:center;gap:10px;margin-bottom:16px;padding:12px 14px;background:var(--color-surface);border:1px solid var(--color-border);border-radius:8px">
                  <span style="font-size:12px;font-weight:600;color:var(--color-text-muted);white-space:nowrap">📋 Carregar modelo:</span>
                  <select [(ngModel)]="modeloSelId"
                          style="flex:1;padding:8px 10px;border:1.5px solid var(--color-border);border-radius:6px;font-size:13px;background:var(--color-bg);color:var(--color-text)">
                    <option value="">— Selecione um modelo —</option>
                    <option *ngFor="let m of modelos" [value]="m.id">{{ m.nome }}</option>
                  </select>
                  <button class="btn btn-secondary" (click)="carregarDoModelo()" [disabled]="!modeloSelId"
                          style="white-space:nowrap">&#11015;&#65039; Carregar</button>
                </div>

                <div class="add-row">
                  <div class="f" style="flex:3">
                    <label>Descrição</label>
                    <input type="text" [(ngModel)]="despesaForm.descricao" placeholder="Ex: Armazenagem, THC..." />
                  </div>
                  <div class="f" style="max-width:130px">
                    <label>Valor (R$)</label>
                    <input type="text" [(ngModel)]="despesaForm.valor" appCurrencyMask="BRL" min="0" step="0.01" placeholder="R$ 0,00" />
                  </div>
                  <button class="btn btn-secondary" style="flex-shrink:0" (click)="addDespesa()">+ Add</button>
                </div>
                <p class="err-msg" *ngIf="despesaErro">{{ despesaErro }}</p>
                <table class="items-table" *ngIf="despesasForm.length > 0">
                  <thead><tr><th>Descrição</th><th style="text-align:right;width:130px">Valor</th><th style="width:36px"></th></tr></thead>
                  <tbody>
                    <tr *ngFor="let d of despesasForm; let i = index">
                      <td>{{ d.descricao }}</td>
                      <td style="text-align:right">{{ d.valor | currency:'BRL':'symbol':'1.2-2' }}</td>
                      <td><button class="btn-icon danger" (click)="removeDespesa(i)">🗑️</button></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Extras -->
              <div class="form-section">
                <p class="form-section-title">Itens Extras</p>
                <div class="add-row">
                  <div class="f" style="flex:3">
                    <label>Descrição</label>
                    <input type="text" [(ngModel)]="extraForm.descricao" placeholder="Ex: Seguro, Despachante local..." />
                  </div>
                  <div class="f" style="max-width:130px">
                    <label>Valor (R$)</label>
                    <input type="text" [(ngModel)]="extraForm.valor" appCurrencyMask="BRL" min="0" step="0.01" placeholder="R$ 0,00" />
                  </div>
                  <button class="btn btn-secondary" style="flex-shrink:0" (click)="addExtra()">+ Add</button>
                </div>
                <p class="err-msg" *ngIf="extraErro">{{ extraErro }}</p>
                <table class="items-table" *ngIf="extrasForm.length > 0">
                  <thead><tr><th>Descrição</th><th style="text-align:right;width:130px">Valor</th><th style="width:36px"></th></tr></thead>
                  <tbody>
                    <tr *ngFor="let e of extrasForm; let i = index">
                      <td>{{ e.descricao }}</td>
                      <td style="text-align:right">{{ e.valor | currency:'BRL':'symbol':'1.2-2' }}</td>
                      <td><button class="btn-icon danger" (click)="removeExtra(i)">🗑️</button></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Totalizador -->
              <div class="total-panel">
                <div class="total-line"><span>CIF (R$)</span><span>{{ form.cifReais | currency:'BRL':'symbol':'1.2-2' }}</span></div>
                <div class="total-line"><span>Frete Nacional</span><span>{{ form.freteInternacional | currency:'BRL':'symbol':'1.2-2' }}</span></div>
                <div class="total-line"><span>Total Impostos</span><span>{{ form.totalImpostos | currency:'BRL':'symbol':'1.2-2' }}</span></div>
                <div class="total-line"><span>Despesas ({{ despesasForm.length }})</span><span>{{ somaDespesas() | currency:'BRL':'symbol':'1.2-2' }}</span></div>
                <div class="total-line"><span>Extras ({{ extrasForm.length }})</span><span>{{ somaExtras() | currency:'BRL':'symbol':'1.2-2' }}</span></div>
                <div class="total-line"><span>Honorários</span><span>{{ form.honorarios | currency:'BRL':'symbol':'1.2-2' }}</span></div>
                <div class="total-grand"><span>TOTAL GERAL</span><span>{{ calcTotalGeral() | currency:'BRL':'symbol':'1.2-2' }}</span></div>
              </div>

              </fieldset>

              <!-- Custo Interno (pós-aprovação) -->
              <ng-container *ngIf="editing?.status === 'Finalizado'">
                <fieldset style="margin-top:16px;padding:12px 16px;border:1px solid #e2e8f0;border-radius:8px">
                  <legend style="font-size:13px;font-weight:600;color:#64748b;padding:0 6px">Custo Interno (pós-aprovação)</legend>
                  <div *ngIf="editing?.custoInternoCodigoInterno" style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
                    <span style="font-size:13px">Vinculado: <strong>{{ editing?.custoInternoCodigoInterno }}</strong></span>
                    <button class="btn btn-secondary" style="font-size:12px;padding:3px 10px" (click)="removerCustoInterno()">Remover</button>
                  </div>
                  <div style="display:flex;gap:8px;align-items:center">
                    <select class="input" style="flex:1;font-size:13px" [(ngModel)]="custoInternoSelectId">
                      <option value="">-- Selecione um custo finalizado --</option>
                      <option *ngFor="let c of custosFinalizadosDisponiveis" [value]="c.id">{{ c.codigoInterno }}</option>
                    </select>
                    <button class="btn btn-primary" style="font-size:13px;white-space:nowrap"
                      [disabled]="!custoInternoSelectId"
                      (click)="vincularCustoInterno()">Vincular</button>
                  </div>
                </fieldset>
              </ng-container>

              <!-- Packlist da Solicitação -->
              <ng-container *ngIf="solicitacaoAtualId">
                <fieldset *ngIf="plLoading || plDto" style="margin-top:16px;padding:12px 16px;border:1px solid #e2e8f0;border-radius:8px">
                  <legend style="font-size:13px;font-weight:600;color:#64748b;padding:0 6px">Packlist</legend>
                  <div *ngIf="plLoading && !plDto" style="font-size:12px;color:var(--color-text-muted)">Verificando packlist...</div>
                  <ng-container *ngIf="plDto">
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
                      <span style="font-size:13px;font-weight:600">📦 {{ plDto.nomeArquivo }}</span>
                      <span style="font-size:11px;color:var(--color-text-muted)">{{ plDto.totalLinhas }} linha(s)</span>
                      <button class="btn btn-secondary" style="font-size:12px;padding:3px 10px;margin-left:auto" (click)="downloadPl()">⬇️ Download</button>
                    </div>
                    <!-- Grid com colunas mapeadas -->
                    <ng-container *ngIf="temMapeamentoPl(plDto)">
                      <div *ngIf="plLoading" style="font-size:12px;color:var(--color-text-muted);margin-bottom:8px">Carregando itens...</div>
                      <ng-container *ngIf="!plLoading && plItems.length > 0">
                        <table class="items-table">
                          <thead>
                            <tr>
                              <th style="width:36px">#</th>
                              <th *ngIf="plDto.colunaNCM">NCM</th>
                              <th *ngIf="plDto.colunaDescricao">Descrição</th>
                              <th *ngIf="plDto.colunaPreco" style="text-align:right;width:110px">Preço</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr *ngFor="let it of plItemsPaged">
                              <td style="color:var(--color-text-muted);font-size:11px">{{ it.numeroLinha }}</td>
                              <td *ngIf="plDto.colunaNCM">{{ it.ncm ?? '—' }}</td>
                              <td *ngIf="plDto.colunaDescricao">{{ it.descricao ?? '—' }}</td>
                              <td *ngIf="plDto.colunaPreco" style="text-align:right">{{ it.preco != null ? (it.preco | currency:'BRL':'symbol':'1.2-2') : '—' }}</td>
                            </tr>
                          </tbody>
                        </table>
                        <div *ngIf="plTotalPages > 1" style="display:flex;align-items:center;justify-content:flex-end;gap:8px;margin-top:8px;font-size:12px">
                          <button class="btn btn-secondary" style="padding:3px 10px;font-size:12px" [disabled]="plPage <= 1" (click)="plPage = plPage - 1">‹</button>
                          <span style="color:var(--color-text-muted)">{{ plPage }} / {{ plTotalPages }}</span>
                          <button class="btn btn-secondary" style="padding:3px 10px;font-size:12px" [disabled]="plPage >= plTotalPages" (click)="plPage = plPage + 1">›</button>
                        </div>
                      </ng-container>
                      <p *ngIf="!plLoading && plItems.length === 0" style="font-size:12px;color:var(--color-text-muted);margin:4px 0">Nenhum item carregado.</p>
                    </ng-container>
                    <!-- Sem mapeamento: apenas aviso (arquivo já tem botão de download acima) -->
                    <p *ngIf="!temMapeamentoPl(plDto)" style="font-size:12px;color:var(--color-text-muted);margin:0">Colunas não mapeadas — use o botão de download para acessar o arquivo original.</p>
                  </ng-container>
                </fieldset>
              </ng-container>

              <!-- Botões inferiores -->
              <div class="actions" style="margin-top:16px">
                <button class="btn btn-primary" *ngIf="!modoVisualizacao" (click)="salvar()">💾 Salvar</button>
                <button class="btn" *ngIf="!modoVisualizacao" style="background:#22c55e;color:#fff" (click)="finalizar()">&#10003; Finalizar Orçamento</button>
                <button class="btn btn-secondary" (click)="abrirPreview(null)">👁️ Preview</button>
                <button class="btn btn-secondary" style="margin-left:auto" (click)="cancelForm()">Cancelar</button>
              </div>

            </div>
          </div>

        </div>
      </ng-container>

      <!-- ── PREVIEW iframe ── -->
      <div class="preview-overlay" *ngIf="showPreview" (click)="fecharPreview()">
        <div class="preview-modal" [class.maximized]="previewMaximized" (click)="$event.stopPropagation()">
          <div class="preview-toolbar">
            <h4>📋 Previsão de Numerário — {{ previewOrc?.codigoInterno }}</h4>
            <div class="pt-actions">
              <button class="btn btn-secondary" *ngIf="!isDespachante && previewOrc && isOrcamentoEditavel(previewOrc)" style="font-size:12px;padding:5px 12px" (click)="openForm(previewOrc);fecharPreview()">✏️ Editar</button>
              <button class="btn btn-primary" style="font-size:12px;padding:5px 12px" (click)="exportarOrcamentoPDF()">📄 Exportar PDF</button>
              <button class="btn-icon-sm" (click)="previewMaximized=!previewMaximized" [title]="previewMaximized ? 'Restaurar' : 'Maximizar'">{{ previewMaximized ? '⊡' : '⛶' }}</button>
              <button class="btn-icon-sm" (click)="fecharPreview()" title="Fechar">✕</button>
            </div>
          </div>
          <div class="preview-body">
            <iframe [srcdoc]="previewSrcdoc!" title="Previsão de Numerário" style="width:100%;height:100%;border:none;"></iframe>
          </div>
        </div>
      </div>

    </div>
  `
})
export class OrcamentoVendaComponent implements OnInit {

  isDespachante = false;

  // ── List ──────────────────────────────────────────────────────────────
  orcamentos: OrcamentoVenda[] = [];
  q = '';
  showHistoricoVersoesOv = false;
  showForm = false;
  loadingList = false;
  isSaving = false;
  modoVisualizacao = false;
  editing: OrcamentoVenda | null = null;
  showErr = false;
  apiFieldErrors: Record<string, string[]> = {};

  // ── Lookup ────────────────────────────────────────────────────────────
  clientes: ClienteV2[] = [];
  custos: CustoDespachante[] = [];
  custoQuery = '';
  showHistoricoVersoesCusto = false;
  custoBase: CustoDespachante | null = null;
  solicitacaoAtualId: string | undefined = undefined;
  private solicitacoes: SolicitacaoOrcamento[] = [];

  // ── Modelos de despesa ───────────────────────────────────────────────
  modelos: ModeloDespesa[] = [];
  modeloSelId = '';

  // ── Form ──────────────────────────────────────────────────────────────
  form = this.emptyForm();  custosSelecionados: string[] = [];  despesasForm: LinhaForm[] = [];
  extrasForm: LinhaForm[] = [];
  despesaForm: LinhaForm = { descricao: '', valor: 0 };
  extraForm: LinhaForm = { descricao: '', valor: 0 };
  despesaErro = '';
  extraErro = '';

  // ── Preview ───────────────────────────────────────────────────────────
  showPreview = false;
  previewMaximized = false;
  previewSrcdoc: SafeHtml = '';
  previewOrc: OrcamentoVenda | null = null;
  previewDespesas: OrcamentoVendaDespesa[] = [];
  previewExtras: OrcamentoVendaDespesaExtra[] = [];

  // ── Lookup maps ───────────────────────────────────────────────────────
  private _despachantes: Record<string, string> = {};
  private _importadores: Record<string, string> = {};
  private _portosOrigem:  Record<string, string> = {};
  private _portosDestino: Record<string, string> = {};

  // ── Accordion ─────────────────────────────────────────────────────────
  expandedCustoId: string | null = null;

  // ── Parâmetros de sistema ─────────────────────────────────────────────
  nomeEmpresa = 'Ominium S/A';

  // ── Custo interno ─────────────────────────────────────────────────────
  custoInternoSelectId = '';

  // ── Fase 1: Modalidade B (despachante usou total manual) ──────────────
  custoBaseUsouTotalManual = false;

  // ── Packlist (visualização no OV) ────────────────────────────────────
  plDto: PacklistDto | null = null;
  plItems: PacklistItemDto[] = [];
  plPage = 1;
  plPageSize = 10;
  plLoading = false;

  constructor(
    private sanitizer: DomSanitizer,
    private service: OrcamentoVendaService,
    private custoSvc: CustoDespachanteService,
    private clienteSvc: ClienteV2Service,
    private portoOrigemSvc: PortoOrigemService,
    private portoDestinoSvc: PortoDestinoService,
    private despachanteSvc: DespachanteV2Service,
    private importadorSvc: ImportadorService,
    private calculator: ImpostoCalculatorService,
    private solicitacaoSvc: SolicitacaoOrcamentoService,
    private auth: AuthService,
    private modeloSvc: ModeloDespesaService,
    private despesaCadastroSvc: DespesaCadastroService,
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastService,
    private confirmDialog: ConfirmDialogService,
    private parametroSvc: ParametroSistemaService,
    private packlistApiSvc: PacklistApiService) {}

  async ngOnInit(): Promise<void> {
    this.isDespachante = this.auth.hasRole('despachante');
    this.clientes     = this.clienteSvc.getAtivos();
    this.solicitacoes = this.solicitacaoSvc.getAll();
    this.despachanteSvc.getAll().forEach(d => this._despachantes[d.id] = d.nome);
    this.importadorSvc.getAll().forEach(i => this._importadores[i.id] = i.razaoSocial ?? i.id);
    this.portoOrigemSvc.getAll().forEach(p => this._portosOrigem[p.id] = p.nome);
    this.portoDestinoSvc.getAll().forEach(p => this._portosDestino[p.id] = p.nome);
    this.modelos = this.modeloSvc.getAll().filter(m => m.ativo);
    this.nomeEmpresa = await this.parametroSvc.getValor('empresa.nomeExibicao', 'Ominium S/A');
    await this.custoSvc.ensureLoaded();
    this.syncCustosDisponiveis();
    await this.load();
    // Reload catalogs after main data load (async catalog services have had time to populate)
    this.clientes     = this.clienteSvc.getAtivos();
    this.solicitacoes = this.solicitacaoSvc.getAll();
    this.despachanteSvc.getAll().forEach(d => this._despachantes[d.id] = d.nome);
    this.importadorSvc.getAll().forEach(i => this._importadores[i.id] = i.razaoSocial ?? i.id);
    this.portoOrigemSvc.getAll().forEach(p => this._portosOrigem[p.id] = p.nome);
    this.portoDestinoSvc.getAll().forEach(p => this._portosDestino[p.id] = p.nome);
    this.modelos = this.modeloSvc.getAll().filter(m => m.ativo);
    // Abrir OV diretamente via query param ?editId=xxx ou criar novo vinculado via ?novoParaSolicitacao=xxx
    this.route.queryParams.subscribe(params => {
      if (params['editId']) {
        const ov = this.service.getById(params['editId']);
        if (ov) this.openForm(ov);
      } else if (params['novoParaSolicitacao']) {
        this.openForm(undefined, params['novoParaSolicitacao']);
      }
    });
  }

  async load(): Promise<void> {
    this.loadingList = true;
    try {
      await this.service.refresh();
      this.syncOrcamentosView();
    } finally {
      this.loadingList = false;
    }
  }

  syncOrcamentosView(): void {
    this.orcamentos = this.showHistoricoVersoesOv
      ? this.service.getAll()
      : this.service.getAllCurrent();
  }

  isCurrentVersionOv(ovId: string): boolean {
    return this.service.isCurrentVersion(ovId);
  }

  ovVersionCount(ovId: string): number {
    return this.service.getVersionCount(ovId);
  }

  versionLevelOv(ovId: string, versao: number | undefined): number {
    const total = this.ovVersionCount(ovId);
    return Math.max(total - (versao ?? 1), 0);
  }

  isVersionRootOv(ovId: string, versao: number | undefined): boolean {
    return (versao ?? 1) >= this.ovVersionCount(ovId);
  }

  custoVersionCount(custoId: string): number {
    return this.custoSvc.getVersionCount(custoId);
  }

  versionLevelCusto(custoId: string, versao: number | undefined): number {
    const total = this.custoVersionCount(custoId);
    return Math.max(total - (versao ?? 1), 0);
  }

  isVersionRootCusto(custoId: string, versao: number | undefined): boolean {
    return (versao ?? 1) >= this.custoVersionCount(custoId);
  }

  isVersionLeaf(versao: number | undefined): boolean {
    return (versao ?? 1) <= 1;
  }

  abrirOvVersaoCorrente(ovId: string): void {
    const corrente = this.service.getCurrentVersion(ovId);
    if (!corrente) {
      this.toast.error('Não foi possível localizar a versão corrente.');
      return;
    }

    if (this.isDespachante) {
      this.abrirPreview(corrente);
      return;
    }

    this.openForm(corrente);
  }

  canReabrirOv(item: OrcamentoVenda): boolean {
    return item.status === 'Finalizado' && this.isCurrentVersionOv(item.id);
  }

  isOrcamentoEditavel(item: OrcamentoVenda): boolean {
    const st = (item.status ?? '').toString();
    return this.isCurrentVersionOv(item.id) && !item.imutavel && st !== 'Finalizado' && st !== 'Cancelado';
  }

  get filtered(): OrcamentoVenda[] {
    if (!this.q) return this.orcamentos;
    const s = this.q.toLowerCase();
    return this.orcamentos.filter(o =>
      o.codigoInterno.toLowerCase().includes(s) ||
      this.nomeClienteById(o.clienteId).toLowerCase().includes(s) ||
      this.codigosCustosDaOrc(o.id).toLowerCase().includes(s) ||
      this.codCustoById(o.custoDespachanteId).toLowerCase().includes(s)
    );
  }

  get custosFiltrados(): CustoDespachante[] {
    const base = this.showHistoricoVersoesCusto
      ? this.custoSvc.getAll()
      : this.custoSvc.getAllCurrent();

    let lista = this.solicitacaoAtualId
      ? base.filter(c => c.solicitacaoOrcamentoId === this.solicitacaoAtualId)
      : base;

    this.custos = base;

    if (!this.custoQuery) return lista;
    const s = this.custoQuery.toLowerCase();
    return lista.filter(c =>
      c.codigoInterno.toLowerCase().includes(s) ||
      (this._despachantes[c.despachanteId] ?? '').toLowerCase().includes(s)
    );
  }

  syncCustosDisponiveis(): void {
    this.custos = this.showHistoricoVersoesCusto
      ? this.custoSvc.getAll()
      : this.custoSvc.getAllCurrent();
  }

  get podeNovoOrcamento(): boolean {
    return this.custos.some(c => c.status === 'Finalizado');
  }

  get custosFinalizadosDisponiveis(): CustoDespachante[] {
    return this.custos.filter(c => c.status === 'Finalizado' && this.custoSvc.isCurrentVersion(c.id));
  }

  isCurrentVersion(custoId: string): boolean {
    return this.custoSvc.isCurrentVersion(custoId);
  }

  // ── Lookup helpers ────────────────────────────────────────────────────

  nomeClienteById(id: string): string {
    return this.clientes.find(c => c.id === id)?.razaoSocial ?? id;
  }

  codCustoById(id: string | undefined): string {
    if (!id) return '—';
    return this.custos.find(c => c.id === id)?.codigoInterno ?? id;
  }

  isCustoSelecionado(id: string): boolean {
    return this.custosSelecionados.includes(id);
  }

  codigosCustosDaOrc(orcId: string): string {
    return this.service.getOrcCustos(orcId)
      .map(oc => this.codCustoById(oc.custoDespachanteId))
      .join(', ');
  }

  nomeDespachanteById(id: string): string { return this._despachantes[id] ?? id; }
  nomeImportadorById(id: string): string  { return id; } // simplificado — lookup via service se necessário
  nomeImpById(id: string | null): string  { return id ? (this._importadores[id] ?? id) : '—'; }
  nomePOById(id: string): string   { return this._portosOrigem[id] ?? id; }
  nomePDById(id: string): string   { return this._portosDestino[id] ?? id; }

  // ── Cálculos ──────────────────────────────────────────────────────────

  somaDespesas(): number { return this.despesasForm.reduce((a, d) => a + (d.valor || 0), 0); }
  somaExtras(): number  { return this.extrasForm.reduce((a, e) => a + (e.valor || 0), 0); }

  calcTotalGeral(): number {
    return (this.form.cifReais || 0) +
           (this.form.freteInternacional || 0) +
           (this.form.totalImpostos || 0) +
           this.somaDespesas() +
           this.somaExtras() +
           (this.form.honorarios || 0);
  }

  recalcular(): void {
    /* totais são calculados numa getter — sem necessidade de ação */
  }

  // ── Accordion ─────────────────────────────────────────────────────────

  toggleAccordion(id: string): void {
    this.expandedCustoId = this.expandedCustoId === id ? null : id;
  }

  getLisCusto(custoId: string)       { return this.custoSvc.getLis(custoId); }
  getDespesasCusto(custoId: string)  { return this.custoSvc.getDespesas(custoId); }
  getNcvsCusto(custoId: string)      { return this.custoSvc.getNcmsVinculados(custoId); }

  totalLisCusto(custoId: string): number {
    return this.custoSvc.getLis(custoId).reduce((a, li) => a + li.valor, 0);
  }

  totalDespesasCusto(custoId: string): number {
    return this.custoSvc.getDespesas(custoId).reduce((a, d) => a + d.valor, 0);
  }

  calcNcvTotal(nv: { baseCalculo: number; aliIi: number; aliIpi: number; aliPis: number; aliCofins: number; aliIcms: number }): number {
    const ii     = nv.baseCalculo * (nv.aliIi / 100);
    const baseIpi = nv.baseCalculo + ii;
    const ipi    = baseIpi * (nv.aliIpi / 100);
    const pis    = nv.baseCalculo * (nv.aliPis / 100);
    const cofins = nv.baseCalculo * (nv.aliCofins / 100);
    const icms   = (baseIpi + ipi) * (nv.aliIcms / 100);
    return ii + ipi + pis + cofins + icms;
  }

  // ── Custo base ────────────────────────────────────────────────────────

  toggleCusto(c: CustoDespachante): void {
    if (this.modoVisualizacao) return;

    if (!this.isCurrentVersion(c.id)) {
      this.toast.info('Versões anteriores são apenas para consulta. Selecione a versão corrente.');
      return;
    }

    // Seleção única — comportamento radio; clicar no mesmo deseleciona
    if (this.custosSelecionados[0] === c.id) {
      this.custosSelecionados = [];
      this.custoBase = null;
      this.custoBaseUsouTotalManual = false;
      this.form.custoDespachanteId = '';
      return;
    }
    this.custosSelecionados = [c.id];
    this.custoBase = c;
    this.form.custoDespachanteId = c.id;

    // ── Fase 1: Detectar Modalidade B (total manual sem discriminação de campos) ──
    this.custoBaseUsouTotalManual = !!c.totalGeralManual;

    // ── Valores financeiros do custo ──
    this.form.tamContainer   = c.tamContainer;
    this.form.cifReais       = c.cifReais;
    this.form.cifUsd         = c.cifUsd;
    this.form.fobReais       = c.fobReais;
    this.form.fobUsd         = c.fobUsd;
    this.form.taxaUsd        = c.taxaUsd;
    this.form.pesoBruto      = c.peso;
    // CustoDespachante tem apenas `peso` (bruto); pesoLiquido fica em branco para preenchimento manual
    this.form.data           = c.data;
    if (!this.form.observacao) this.form.observacao = c.observacao ?? '';

    // ── Total de impostos calculado a partir dos NCMs vinculados ──
    const ncvs = this.custoSvc.getNcmsVinculados(c.id);
    this.form.totalImpostos = ncvs.reduce((acc, nv) => {
      return acc + this.custoSvc.getValoresImposto(nv.id).reduce((a, v) => a + v.totalImpostos, 0);
    }, 0);

    // ── Despesas do custo pré-carregadas no formulário do orçamento ──
    const custoDespesas = this.custoSvc.getDespesas(c.id);
    this.despesasForm = custoDespesas.map(d => ({ descricao: d.descricao, valor: d.valor }));

    // ── Cliente e data: preencher da solicitação vinculada quando disponível ──
    if (this.solicitacaoAtualId) {
      const sol = this.solicitacoes.find(s => s.id === this.solicitacaoAtualId);
      if (sol?.clienteId && !this.form.clienteId) this.form.clienteId = sol.clienteId;
    }
  }

  // ── Despesas / Extras ─────────────────────────────────────────────────

  carregarDoModelo(): void {
    if (this.modoVisualizacao) return;
    if (!this.modeloSelId) return;
    const itens = this.modeloSvc.getItensByModelo(this.modeloSelId);
    const allDesp = this.despesaCadastroSvc.getAtivos();
    itens.forEach(item => {
      const desp = allDesp.find(d => d.id === item.despesaCadastroId);
      if (!desp) return;
      const jaExiste = this.despesasForm.some(f => f.descricao === desp.descricao);
      if (jaExiste) return;
      this.despesasForm.push({ descricao: desp.descricao, valor: desp.valor });
    });
    this.modeloSelId = '';
  }

  addDespesa(): void {
    if (this.modoVisualizacao) return;
    if (!this.despesaForm.descricao.trim() || this.despesaForm.valor <= 0) {
      this.despesaErro = 'Descrição e valor são obrigatórios.'; return;
    }
    this.despesaErro = '';
    this.despesasForm.push({ ...this.despesaForm });
    this.despesaForm = { descricao: '', valor: 0 };
  }

  removeDespesa(i: number): void {
    if (this.modoVisualizacao) return;
    this.despesasForm.splice(i, 1);
  }

  addExtra(): void {
    if (this.modoVisualizacao) return;
    if (!this.extraForm.descricao.trim() || this.extraForm.valor <= 0) {
      this.extraErro = 'Descrição e valor são obrigatórios.'; return;
    }
    this.extraErro = '';
    this.extrasForm.push({ ...this.extraForm });
    this.extraForm = { descricao: '', valor: 0 };
  }

  removeExtra(i: number): void {
    if (this.modoVisualizacao) return;
    this.extrasForm.splice(i, 1);
  }

  // ── Custo Interno ─────────────────────────────────────────────────────

  async vincularCustoInterno(): Promise<void> {
    if (!this.editing || !this.custoInternoSelectId) return;
    try {
      const updated = await this.service.setCustoInterno(this.editing.id, this.custoInternoSelectId);
      this.editing = updated;
      this.custoInternoSelectId = '';
      this.toast.success('Custo interno vinculado com sucesso.');
      await this.load();
    } catch (err: any) {
      this.toast.error(err?.message ?? 'Erro ao vincular custo interno.');
    }
  }

  async removerCustoInterno(): Promise<void> {
    if (!this.editing) return;
    try {
      const updated = await this.service.setCustoInterno(this.editing.id, null);
      this.editing = updated;
      this.toast.success('Custo interno removido.');
      await this.load();
    } catch (err: any) {
      this.toast.error(err?.message ?? 'Erro ao remover custo interno.');
    }
  }

  // ── CRUD ──────────────────────────────────────────────────────────────

  openForm(item?: OrcamentoVenda, solicitacaoId?: string): void {
    this.modoVisualizacao = !!item && !this.isOrcamentoEditavel(item);
    if (this.modoVisualizacao) {
      this.toast.info('Esta versão está em modo somente leitura.');
    }

    this.editing   = item ?? null;
    this.showErr   = false;
    this.apiFieldErrors = {};
    this.despesaErro = '';
    this.extraErro   = '';

    if (item) {
      this.custoBaseUsouTotalManual = false;
      this.solicitacaoAtualId = item.solicitacaoOrcamentoId;
      const existingLinks = this.service.getOrcCustos(item.id);
      this.custosSelecionados = existingLinks.map(oc => oc.custoDespachanteId);
      // retrocompat: se não há junction mas há custoDespachanteId legado
      if (this.custosSelecionados.length === 0 && item.custoDespachanteId) {
        this.custosSelecionados = [item.custoDespachanteId];
      }
      const selectedCustoId = this.custosSelecionados[0] ?? item.custoDespachanteId;
      const c = this.custos.find(c => c.id === selectedCustoId) ?? null;
      this.custoBase = c;
      this.form = {
        custoDespachanteId:  item.custoDespachanteId ?? '',
        clienteId:           item.clienteId,
        data:                item.data,
        tamContainer:        item.tamContainer,
        pesoBruto:           item.pesoBruto,
        pesoLiquido:         item.pesoLiquido,
        freteInternacional:  item.freteInternacional,
        cifReais:            item.cifReais,
        cifUsd:              item.cifUsd,
        fobReais:            item.fobReais,
        fobUsd:              item.fobUsd,
        taxaUsd:             item.taxaUsd,
        honorarios:          item.honorarios,
        totalImpostos:       item.totalImpostos,
        observacao:          item.observacao ?? ''
      };
      this.despesasForm = this.service.getDespesas(item.id).map(d => ({ descricao: d.descricao, valor: d.valor }));
      this.extrasForm   = this.service.getExtras(item.id).map(e => ({ descricao: e.descricao, valor: e.valor }));
    } else {
      this.solicitacaoAtualId = solicitacaoId;
      this.custoBase = null;
      this.custoBaseUsouTotalManual = false;
      this.custoQuery = '';
      this.custosSelecionados = [];
      this.form = this.emptyForm();
      this.despesasForm = [];
      this.extrasForm   = [];
    }
    this.despesaForm = { descricao: '', valor: 0 };
    this.extraForm   = { descricao: '', valor: 0 };
    this.plDto = null;
    this.plItems = [];
    this.plPage = 1;
    if (this.solicitacaoAtualId) {
      void this.loadPlParaOv(this.solicitacaoAtualId);
    }
    this.showForm = true;
    this.showPreview = false;
  }

  private async loadPlParaOv(solId: string): Promise<void> {
    this.plLoading = true;
    try {
      const dto = await this.packlistApiSvc.loadBySolicitacao(solId);
      this.plDto = dto;
      if (dto && this.temMapeamentoPl(dto)) {
        this.plItems = await this.packlistApiSvc.loadItems(dto.id);
      }
    } finally {
      this.plLoading = false;
    }
  }

  temMapeamentoPl(dto: PacklistDto): boolean {
    return !!(dto.colunaNCM || dto.colunaDescricao || dto.colunaPreco);
  }

  get plTotalPages(): number {
    return Math.ceil(this.plItems.length / this.plPageSize) || 1;
  }

  get plItemsPaged(): PacklistItemDto[] {
    const start = (this.plPage - 1) * this.plPageSize;
    return this.plItems.slice(start, start + this.plPageSize);
  }

  downloadPl(): void {
    if (this.plDto) {
      this.packlistApiSvc.downloadArquivo(this.plDto.id, this.plDto.nomeArquivo);
    }
  }

  cancelForm(): void {
    this.showForm = false;
    this.editing = null;
    this.modoVisualizacao = false;
    this.apiFieldErrors = {};
  }

  async salvar(status?: 'EmAndamento' | 'Finalizado'): Promise<void> {
    if (this.modoVisualizacao) {
      this.toast.info('Este orçamento está em modo somente leitura.');
      return;
    }

    const eraEdicao = !!this.editing;
    this.showErr = true;
    this.apiFieldErrors = {};
    if (!this.form.clienteId || !this.form.data) return;

    this.isSaving = true;
    const totalDespesas = this.somaDespesas();
    const totalExtras   = this.somaExtras();
    const totalGeral    = this.calcTotalGeral();

    let orcId: string;
    let saved: OrcamentoVenda;
    try {
      if (this.editing) {
        saved = await this.service.update({
          ...this.editing,
          clienteId:           this.form.clienteId,
          data:                this.form.data,
          tamContainer:        this.form.tamContainer,
          pesoBruto:           this.form.pesoBruto || 0,
          pesoLiquido:         this.form.pesoLiquido || 0,
          freteInternacional:  this.form.freteInternacional || 0,
          cifReais:            this.form.cifReais || 0,
          cifUsd:              this.form.cifUsd || 0,
          fobReais:            this.form.fobReais || 0,
          fobUsd:              this.form.fobUsd || 0,
          taxaUsd:             this.form.taxaUsd || 0,
          honorarios:          this.form.honorarios || 0,
          totalImpostos:       this.form.totalImpostos || 0,
          totalDespesas,
          totalExtras,
          totalGeral,
          observacao:          this.form.observacao?.trim() || undefined,
        });
        orcId = this.editing.id;
      } else {
        saved = await this.service.create({
          clienteId:              this.form.clienteId,
          solicitacaoOrcamentoId: this.solicitacaoAtualId,
          data:                   this.form.data,
          tamContainer:           this.form.tamContainer,
          pesoBruto:              this.form.pesoBruto || 0,
          pesoLiquido:            this.form.pesoLiquido || 0,
          freteInternacional:     this.form.freteInternacional || 0,
          cifReais:               this.form.cifReais || 0,
          cifUsd:                 this.form.cifUsd || 0,
          fobReais:               this.form.fobReais || 0,
          fobUsd:                 this.form.fobUsd || 0,
          taxaUsd:                this.form.taxaUsd || 0,
          honorarios:             this.form.honorarios || 0,
          totalImpostos:          this.form.totalImpostos || 0,
          totalDespesas,
          totalExtras,
          totalGeral,
          observacao:             this.form.observacao?.trim() || undefined,
        });
        orcId = saved.id;
      }
    } catch (err: any) {
      this.apiFieldErrors = this.collectFieldErrors(err);
      if (!Object.keys(this.apiFieldErrors).length) {
        this.toast.error(err?.message ?? 'Erro ao salvar orçamento.');
      }
      return;
    }

    try {
      await this.service.replaceDespesas(orcId, this.despesasForm);
      await this.service.replaceExtras(orcId, this.extrasForm);
      await this.service.replaceOrcCustos(orcId, this.custosSelecionados);

      if (status === 'Finalizado') {
        await this.service.finalizar(orcId);
      }

      this.cancelForm();
      await this.load();
      this.toast.success(status === 'Finalizado' ? 'Orçamento finalizado com sucesso.' : (eraEdicao ? 'Orçamento atualizado com sucesso.' : 'Orçamento criado com sucesso.'));
    } catch (err: any) {
      this.toast.error(err?.message ?? 'Erro ao salvar os dados do orçamento.');
    } finally {
      this.isSaving = false;
    }
  }

  async finalizar(): Promise<void> {
    this.showErr = true;
    this.apiFieldErrors = {};
    if (!this.form.clienteId || !this.form.data) return;

    const ok = await this.confirmDialog.confirm({
      title: 'Finalizar orcamento',
      message: 'Finalizar este orcamento? Ele ficara marcado como Finalizado.',
      confirmText: 'Finalizar',
      cancelText: 'Cancelar',
      danger: false
    });
    if (!ok) return;

    await this.salvar('Finalizado');
  }

  async remove(id: string): Promise<void> {
    const ok = await this.confirmDialog.confirm({
      title: 'Excluir orcamento',
      message: 'Deseja excluir este orcamento?',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      danger: true
    });
    if (!ok) return;

    try {
      await this.service.remove(id);
      this.syncOrcamentosView();
      this.toast.success('Orcamento removido com sucesso.');
    } catch (err: any) {
      this.toast.error(err?.message ?? 'Erro ao excluir orçamento.');
    }
  }

  async reabrirOv(id: string): Promise<void> {
    const ok = await this.confirmDialog.confirm({
      title: 'Reabrir orçamento de venda',
      message: 'Reabrir este orçamento? Será criada uma nova versão corrente para edição.',
      confirmText: 'Reabrir',
      cancelText: 'Cancelar',
      danger: false
    });
    if (!ok) return;

    try {
      await this.service.reabrir(id);
      await this.load();
      this.toast.success('Orçamento reaberto com nova versão corrente.');
    } catch (err: any) {
      this.toast.error(err?.message ?? 'Erro ao reabrir orçamento.');
    }
  }

  async reabrirCusto(custoId: string): Promise<void> {
    if (this.modoVisualizacao) return;

    const ok = await this.confirmDialog.confirm({
      title: 'Reabrir custo despachante',
      message: 'Reabrir este custo para edição? Ele ficará com status "Reaberto" enquanto o orçamento não for aprovado.',
      confirmText: 'Reabrir',
      cancelText: 'Cancelar',
      danger: false
    });
    if (!ok) return;
    try {
      await this.custoSvc.reabrir(custoId);
      this.syncCustosDisponiveis();
      this.toast.success('Custo reaberto com sucesso.');
    } catch (err: any) {
      this.toast.error(err?.message ?? 'Erro ao reabrir custo.');
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

  ovStatusColor(status?: OrcamentoVenda['status']): string {
    if (status === 'Finalizado') return '#22c55e';
    if (status === 'Cancelado') return '#6b7280';
    if (status === 'Aguardando') return '#64748b';
    return '#f59e0b';
  }

  ovStatusLabel(status?: OrcamentoVenda['status']): string {
    if (status === 'Finalizado') return 'Finalizado';
    if (status === 'Cancelado') return 'Cancelado';
    if (status === 'Aguardando') return 'Aguardando';
    return 'Em Andamento';
  }

  // ── Preview ───────────────────────────────────────────────────────────

  abrirPreview(o: OrcamentoVenda | null): void {
    if (!o) {
      const orcId = this.editing?.id;
      if (!orcId) return;
      o = this.service.getById(orcId) ?? null;
      if (!o) return;
    }
    this.previewOrc      = o;
    this.previewDespesas = this.service.getDespesas(o.id);
    this.previewExtras   = this.service.getExtras(o.id);
    this.previewSrcdoc   = this.sanitizer.bypassSecurityTrustHtml(this.buildOrcamentoHtml(false));
    this.previewMaximized = false;
    this.showPreview     = true;
  }

  fecharPreview(): void { this.showPreview = false; this.previewOrc = null; }

  exportarOrcamentoPDF(): void {
    const win = window.open('', '_blank');
    if (!win) {
      this.toast.error('Popup bloqueado. Permita pop-ups para este site e tente novamente.');
      return;
    }
    win.document.write(this.buildOrcamentoHtml(true));
    win.document.close();
  }

  // ── Helpers ───────────────────────────────────────────────────────────

  private emptyForm() {
    return {
      custoDespachanteId: '', clienteId: '', data: '',
      tamContainer: '20', pesoBruto: 0, pesoLiquido: 0,
      freteInternacional: 0, cifReais: 0, cifUsd: 0,
      fobReais: 0, fobUsd: 0, taxaUsd: 0, honorarios: 0,
      totalImpostos: 0, observacao: ''
    };
  }

  codigoSolicitacao(id: string | undefined): string {
    if (!id) return '—';
    return this.solicitacoes.find(s => s.id === id)?.codigoInterno ?? id;
  }

  calcImpostosCusto(custoId: string): number {
    const ncvs = this.custoSvc.getNcmsVinculados(custoId);
    return ncvs.reduce((acc, nv) => {
      return acc + this.custoSvc.getValoresImposto(nv.id).reduce((a, v) => a + v.totalImpostos, 0);
    }, 0);
  }

  // ── HTML Previsão de Numerário ────────────────────────────────────────

  private buildOrcamentoHtml(autoPrint = false): string {
    const o = this.previewOrc;
    if (!o) return '<html><body>Sem dados</body></html>';

    const fmtN = (v: number) =>
      v ? v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-';
    const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const fmtUSD = (v: number) => v.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    const fmtKg = (v: number | undefined) => `${(v ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} kg`;
    const fmtDate = (s: string) => {
      if (!s) return '';
      const [y, m, d] = s.split('-');
      return `${d}/${m}/${y}`;
    };
    const row2 = (label: string, val: string) =>
      `<tr><td style="padding:3px 8px;font-size:12px;">${label}</td><td style="padding:3px 8px;text-align:right;font-size:12px;">${val}</td></tr>`;

    // ── Lookup helpers ──
    const nomeCliente  = this.clientes.find(c => c.id === o.clienteId)?.razaoSocial ?? '';
    const orcCustos    = this.service.getOrcCustos(o.id);
    const primCusto    = orcCustos[0]
      ? this.custos.find(c => c.id === orcCustos[0].custoDespachanteId) ?? null
      : (o.custoDespachanteId ? this.custos.find(c => c.id === o.custoDespachanteId) ?? null : null);
    const nomeImportador = primCusto?.importadorId ? (this._importadores[primCusto.importadorId] ?? '') : '';
    const seguroUsd    = primCusto?.seguroUsd ?? 0;
    const seguroReais  = o.taxaUsd ? seguroUsd * o.taxaUsd : 0;
    // Frete Internacional = componente do CIF (vem do custo despachante)
    const freteIntlUsd  = primCusto?.freteInternacionalUsd ?? 0;
    const freteIntlReais = o.taxaUsd ? freteIntlUsd * o.taxaUsd : 0;
    // Frete Nacional = porto de destino até o cliente (campo freteInternacional do OV — renomeado em tela)
    const freteNacReais  = o.freteInternacional ?? 0;
    const freteNacUsd   = (o.taxaUsd && freteNacReais) ? freteNacReais / o.taxaUsd : 0;
    const codigoSol     = o.solicitacaoOrcamentoId ? this.codigoSolicitacao(o.solicitacaoOrcamentoId) : '';

    // ── Imposto breakdown de todos os custos vinculados ──
    let totalIi = 0, totalIpi = 0, totalPis = 0, totalCofins = 0, totalIcms = 0;
    orcCustos.forEach(oc => {
      this.custoSvc.getNcmsVinculados(oc.custoDespachanteId).forEach(nv => {
        this.custoSvc.getValoresImposto(nv.id).forEach(v => {
          totalIi     += v.valorIi;
          totalIpi    += v.valorIpi;
          totalPis    += v.valorPis;
          totalCofins += v.valorCofins;
          totalIcms   += v.valorIcms;
        });
      });
    });
    // fallback: se não há NCMs vinculados, usa o totalImpostos do OV
    const temBreakdown = (totalIi + totalIpi + totalPis + totalCofins + totalIcms) > 0;
    const totalImpostosCalc = temBreakdown
      ? totalIi + totalIpi + totalPis + totalCofins + totalIcms
      : o.totalImpostos;

    // ── Despesas e extras ──
    const despesas     = this.service.getDespesas(o.id);
    const extras       = this.service.getExtras(o.id);
    const totalDesp    = despesas.reduce((a, d) => a + d.valor, 0);
    const totalExtras  = extras.reduce((a, e) => a + e.valor, 0);
    const totalServico = o.honorarios + totalExtras;
    const totalGeral   = o.cifReais + freteNacReais + totalImpostosCalc + totalDesp + o.honorarios + totalExtras;
    const totalUsd     = o.taxaUsd ? totalGeral / o.taxaUsd : 0;

    // ── Linhas de despesas ──
    const despRows = despesas.map(d =>
      `<tr><td style="padding:3px 8px;font-size:12px;">${d.descricao}</td><td style="padding:3px 8px;text-align:right;font-size:12px;">${fmtN(d.valor)}</td></tr>`
    ).join('');

    // ── Linhas de extras (Serviço) ──
    const extraRows = extras.map(e =>
      `<tr><td style="padding:3px 8px;font-size:12px;">${e.descricao}</td><td style="padding:3px 8px;text-align:right;font-size:12px;">${fmtN(e.valor)}</td></tr>`
    ).join('');

    const HDR = `background:#4472C4;color:#fff;font-weight:700;font-size:12px;text-align:center;padding:5px 8px;`;

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Previsão de Numerário — ${o.codigoInterno}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:Arial,sans-serif; background:#fff; color:#000; padding:20px; }
  table { width:100%; border-collapse:collapse; }
  td, th { vertical-align:top; }
  .page { max-width:720px; margin:0 auto; }
  @media print {
    body { padding:0; }
    .page { max-width:100%; }
  }
</style>
${autoPrint ? '<script>window.onload=function(){window.print();}<\/script>' : ''}
</head>
<body>
<div class="page">

  <!-- Cabeçalho empresa -->
  <div style="text-align:center;padding:8px 0 4px;">
    <div style="font-size:28px;font-weight:700;font-family:Georgia,serif;letter-spacing:2px;">${this.nomeEmpresa}</div>
  </div>

  <!-- Título do documento -->
  <table style="margin-bottom:6px;">
    <tr><td style="${HDR}">PREVISÃO DE NUMERARIO</td></tr>
  </table>

  <!-- Informações gerais -->
  <table style="margin-bottom:2px;border:1px solid #ccc;">
    <tr>
      <td style="padding:3px 8px;font-size:12px;width:130px;"><strong>Data:</strong></td>
      <td style="padding:3px 8px;font-size:12px;">${fmtDate(o.data)}</td>
      <td style="padding:3px 8px;font-size:12px;width:130px;"><strong>Orçamento:</strong></td>
      <td style="padding:3px 8px;font-size:12px;">${o.codigoInterno}</td>
    </tr>
    <tr>
      <td style="padding:3px 8px;font-size:12px;"><strong>Cliente :</strong></td>
      <td style="padding:3px 8px;font-size:12px;">${nomeCliente}</td>
      <td style="padding:3px 8px;font-size:12px;"><strong>Import:</strong></td>
      <td style="padding:3px 8px;font-size:12px;">${nomeImportador}</td>
    </tr>
    ${codigoSol ? `<tr>
      <td style="padding:3px 8px;font-size:12px;"><strong>Solicitação:</strong></td>
      <td style="padding:3px 8px;font-size:12px;" colspan="3">${codigoSol}</td>
    </tr>` : ''}
    ${o.custoInternoCodigoInterno ? `<tr>
      <td style="padding:3px 8px;font-size:12px;"><strong>Custo Aprovado:</strong></td>
      <td style="padding:3px 8px;font-size:12px;" colspan="3">${o.custoInternoCodigoInterno}</td>
    </tr>` : ''}
    <tr>
      <td style="padding:3px 8px;font-size:12px;"><strong>Tipo de produto</strong></td>
      <td style="padding:3px 8px;font-size:12px;" colspan="3">${o.observacao ?? ''}</td>
    </tr>
    <tr>
      <td style="padding:3px 8px;font-size:12px;"><strong>Tipo de conteiner</strong></td>
      <td style="padding:3px 8px;font-size:12px;" colspan="3">${o.tamContainer}</td>
    </tr>
  </table>

  <!-- Seção 1 - Base de cálculo -->
  <table style="margin-bottom:2px;">
    <tr><td colspan="5" style="${HDR}">1 - Base de calculo</td></tr>
    <tr>
      <td style="padding:3px 8px;font-size:12px;">Taxa Usd &nbsp; <strong>${fmtUSD(o.taxaUsd)}</strong></td>
      <td style="padding:3px 8px;font-size:12px;">USD</td>
      <td style="padding:3px 8px;font-size:12px;">BRL</td>
      <td style="padding:3px 8px;font-size:12px;">Peso Bruto</td>
      <td style="padding:3px 8px;font-size:12px;text-align:right;">${fmtKg(o.pesoBruto)}</td>
    </tr>
    <tr>
      <td style="padding:3px 8px;font-size:12px;">FOB</td>
      <td style="padding:3px 8px;font-size:12px;text-align:right;">${fmtUSD(o.fobUsd)}</td>
      <td style="padding:3px 8px;font-size:12px;text-align:right;">${fmtBRL(o.fobReais)}</td>
      <td style="padding:3px 8px;font-size:12px;">Peso Liquido</td>
      <td style="padding:3px 8px;font-size:12px;text-align:right;">${fmtKg(o.pesoLiquido)}</td>
    </tr>
    <tr>
      <td style="padding:3px 8px;font-size:12px;">Frete Internacional</td>
      <td style="padding:3px 8px;font-size:12px;text-align:right;">${freteIntlUsd ? fmtUSD(freteIntlUsd) : '-'}</td>
      <td style="padding:3px 8px;font-size:12px;text-align:right;">${fmtBRL(freteIntlReais)}</td>
      <td colspan="2"></td>
    </tr>
    <tr>
      <td style="padding:3px 8px;font-size:12px;">Seguro</td>
      <td style="padding:3px 8px;font-size:12px;text-align:right;">${seguroUsd ? fmtUSD(seguroUsd) : '-'}</td>
      <td style="padding:3px 8px;font-size:12px;text-align:right;">${fmtBRL(seguroReais)}</td>
      <td colspan="2"></td>
    </tr>
    <tr>
      <td style="padding:3px 8px;font-size:12px;font-weight:700;">CIF</td>
      <td style="padding:3px 8px;font-size:12px;text-align:right;font-weight:700;">${fmtUSD(o.cifUsd)}</td>
      <td style="padding:3px 8px;font-size:12px;text-align:right;font-weight:700;">${fmtBRL(o.cifReais)}</td>
      <td colspan="2"></td>
    </tr>
    ${freteNacReais > 0 ? `<tr>
      <td style="padding:3px 8px;font-size:12px;">Frete Nacional / Porto a Destino</td>
      <td style="padding:3px 8px;font-size:12px;text-align:right;">${freteNacUsd ? fmtUSD(freteNacUsd) : '-'}</td>
      <td style="padding:3px 8px;font-size:12px;text-align:right;">${fmtBRL(freteNacReais)}</td>
      <td colspan="2"></td>
    </tr>` : ''}
  </table>

  <!-- Seção 2 - Impostos -->
  <table style="margin-bottom:2px;">
    <tr><td colspan="2" style="${HDR}">2 - Impostos</td></tr>
    <tr>
      <td style="padding:3px 8px;font-size:12px;">CIF (THC)</td>
      <td style="padding:3px 8px;font-size:12px;text-align:right;">${fmtN(o.cifReais)}</td>
    </tr>
    ${temBreakdown ? `
    ${row2('II', fmtN(totalIi))}
    ${row2('IPI', fmtN(totalIpi))}
    ${row2('PIS', fmtN(totalPis))}
    ${row2('COFINS', fmtN(totalCofins))}
    ${row2('ICMS', fmtN(totalIcms))}
    ` : row2('Total Impostos (NCM)', fmtN(o.totalImpostos))}
    <tr><td style="padding:3px 8px;font-size:12px;"></td><td style="padding:3px 8px;font-size:12px;">-</td></tr>
    <tr>
      <td style="padding:3px 8px;font-size:12px;"></td>
      <td style="padding:3px 8px;font-size:12px;text-align:right;font-weight:700;border-top:1px solid #ccc;">${fmtN(totalImpostosCalc)}</td>
    </tr>
  </table>

  <!-- Seção 3 - Despesas -->
  <table style="margin-bottom:2px;">
    <tr><td colspan="2" style="${HDR}">3 - Despesas</td></tr>
    ${despRows || '<tr><td colspan="2" style="padding:3px 8px;font-size:12px;color:#888;">Nenhuma despesa</td></tr>'}
    <tr>
      <td style="padding:3px 8px;font-size:12px;"></td>
      <td style="padding:3px 8px;font-size:12px;text-align:right;font-weight:700;border-top:1px solid #ccc;">${fmtN(totalDesp)}</td>
    </tr>
  </table>

  <!-- Seção 4 - Serviço -->
  <table style="margin-bottom:2px;">
    <tr><td colspan="2" style="${HDR}">4 - Serviço</td></tr>
    <tr>
      <td style="padding:3px 8px;font-size:12px;">Honorarios</td>
      <td style="padding:3px 8px;font-size:12px;text-align:right;">${fmtN(o.honorarios)}</td>
    </tr>
    ${extraRows}
    <tr>
      <td style="padding:3px 8px;font-size:12px;"></td>
      <td style="padding:3px 8px;font-size:12px;text-align:right;font-weight:700;border-top:1px solid #ccc;">${fmtN(totalServico)}</td>
    </tr>
  </table>

  <!-- TOTAL GERAL -->
  <table>
    <tr>
      <td style="padding:5px 8px;font-size:12px;font-weight:700;text-align:right;">TOTAL:</td>
      <td style="padding:5px 8px;font-size:13px;font-weight:700;text-align:right;border-top:2px solid #000;">${fmtN(totalGeral)}</td>
    </tr>
    ${o.taxaUsd ? `<tr>
      <td style="padding:3px 8px;font-size:12px;text-align:right;"></td>
      <td style="padding:3px 8px;font-size:12px;text-align:right;">${fmtN(totalUsd)}</td>
    </tr>` : ''}
  </table>

</div>
</body>
</html>`;
  }
}
