import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ControleNavioService } from '../services/controle-navio.service';
import { ControleNavio, ControleNavioTrajeto, EmbarqueResumo } from '../models/controle-navio.models';
import { PortoOrigemService } from '../../../cadastros/portos-origem/services/porto-origem.service';
import { PortoDestinoService } from '../../../cadastros/portos-destino/services/porto-destino.service';
import { PortoOrigem } from '../../../cadastros/portos-origem/models/porto-origem.models';
import { PortoDestino } from '../../../cadastros/portos-destino/models/porto-destino.models';
import { EmbarqueAduanaService } from '../../../embarque-aduana/services/embarque-aduana.service';
import { StatusEmbarqueService } from '../../../embarque-aduana/services/status-embarque.service';
import { ClienteV2Service } from '../../../cadastros/clientes/services/cliente-v2.service';
import { EmbarqueAduana, StatusEmbarque } from '../../../embarque-aduana/models/embarque-aduana.models';
import { CRUD_STYLES } from '../../../../shared/styles/crud-page.styles';
import { Router } from '@angular/router';
import { ToastService } from '../../../../../core/services/toast.service';

interface TrajetoForm {
  portoOrigemId: string;
  portoDestinoId: string;
  etd: string;
  eta: string;
  trajetoDescricao: string;
}

interface ReplaceTrajetoRequest {
  portoOrigemId: string;
  portoDestinoId: string;
  etd: string;
  eta: string;
  trajetoDescricao?: string;
}

@Component({
  selector: 'app-controle-navios',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
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
    .trajetos-list {
      list-style: none;
      margin: 0;
      padding: 0;
      position: relative;
    }
    .trajeto-item {
      position: relative;
      display: grid;
      grid-template-columns: 34px 1fr auto;
      gap: 10px;
      align-items: center;
      padding: 10px 12px;
      border-radius: 10px;
      background: linear-gradient(180deg, var(--color-surface), color-mix(in srgb, var(--color-surface) 80%, #ffffff));
      border: 1px solid var(--color-border);
      margin-bottom: 8px;
      font-size: 13px;
    }
    .trajeto-item:last-child { margin-bottom: 0; }
    .trajeto-node {
      position: relative;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--color-primary, #1d4ed8);
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-primary, #1d4ed8) 18%, #ffffff);
    }
    .trajeto-item:not(:last-child) .trajeto-node::after {
      content: '';
      position: absolute;
      left: 50%;
      top: calc(100% + 4px);
      transform: translateX(-50%);
      width: 2px;
      height: 20px;
      background: linear-gradient(180deg, color-mix(in srgb, var(--color-primary, #1d4ed8) 50%, #cbd5e1), #cbd5e1);
      border-radius: 2px;
    }
    .trajeto-info { min-width: 0; }
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
    .trajeto-meta {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
      margin-top: 4px;
    }
    .status-perna {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 700;
      color: #fff;
    }
    .status-previsto { background: #64748b; }
    .status-emtransito { background: #1d4ed8; }
    .status-atracado { background: #0891b2; }
    .status-concluido { background: #15803d; }
    .err-trajeto { color: #e53e3e; font-size: 12px; margin-top: 4px; }
    .expand-toggle { cursor:pointer; font-size:12px; color:var(--color-primary, #3b82f6); }
    .expand-toggle:hover { text-decoration: underline; }
    .trajetos-summary { font-size:12px; color:var(--color-text-muted); margin-left:8px; }
    .header-actions { display:flex; align-items:center; gap:10px; }
    .btn-new-viagem {
      background: linear-gradient(135deg, #6b7cff 0%, #6a4bb6 100%);
      color: #fff;
      border: none;
      border-radius: 10px;
      font-weight: 700;
      font-size: 14px;
      padding: 10px 18px;
      cursor: pointer;
      box-shadow: 0 6px 18px rgba(79, 70, 229, .25);
    }
    .btn-new-viagem:hover { filter: brightness(1.03); }
    .btn-mini-icon {
      border: none;
      background: transparent;
      color: #ef8a3c;
      cursor: pointer;
      font-size: 16px;
      line-height: 1;
      padding: 4px;
    }
    .btn-mini-icon.danger { color: #9ca3af; }
    .btn-mini-icon:disabled { opacity: .45; cursor: not-allowed; }
    /* Embarques sub-table */
    .emb-table { width:100%; border-collapse:collapse; font-size:12px; margin-top:8px; }
    .emb-table th { background:var(--color-surface); padding:10px 12px; text-align:left; font-weight:600; color:var(--color-text-muted); border-bottom:1px solid var(--color-border); }
    .emb-table td { padding:10px 12px; border-bottom:1px solid var(--color-border); vertical-align:middle; }
    .emb-table tr:last-child td { border-bottom:none; }
    .status-badge { display:inline-block; padding:2px 8px; border-radius:10px; font-size:11px; font-weight:600; }
    .status-previsto { background:#f59e0b; color:#fff; }
    .status-aguardando { background:#3b82f6; color:#fff; }
    .status-atracado { background:#2563eb; color:#fff; }
    .status-registrado, .status-desembaracado, .status-entregue, .status-finalizado { background:#16a34a; color:#fff; }
    .emb-section { padding:0 16px 14px; background:var(--color-bg-alt,#f8fafc); }
    .emb-block { background: #f5f7fb; border-radius: 8px; padding: 6px 10px 4px; }
    .btn-atracado { background:#2563eb; color:#fff; border:none; padding:5px 12px; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer; }
    .btn-atracado:hover { background:#1d4ed8; }
    .info-chip { font-size:11px; background:var(--color-surface); border:1px solid var(--color-border); border-radius:10px; padding:2px 8px; margin-left:4px; }
    .trajetos-operacional-list { list-style:none; margin:12px 0 0; padding:0; }
    .trajetos-operacional-item { display:flex; gap:12px; align-items:flex-start; padding:8px 2px; }
    .trajeto-operacional-node {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: #6b88e6;
      color: #fff;
      font-size: 12px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 26px;
      margin-top: 2px;
    }
    .trajeto-operacional-main { min-width: 0; flex:1; }
    .trajeto-operacional-title { font-size: 29px; font-weight: 700; color: var(--color-text); line-height: 1.2; }
    .trajeto-operacional-subtitle { font-size: 12px; color: var(--color-text-muted); margin-top: 4px; }
    .trajeto-operacional-days {
      font-size: 14px;
      color: #334155;
      border: 1px solid #d5dbe5;
      background: #eef2f7;
      border-radius: 999px;
      padding: 6px 12px;
      white-space: nowrap;
      margin-top: 3px;
    }
    .clickable-row { cursor: pointer; }
    .code-link { color: var(--color-text); text-decoration: none; }
    .code-link:hover { text-decoration: underline; }
    .inline-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      min-height: 200px;
      color: var(--color-text-muted);
      font-size: 14px;
      font-weight: 600;
    }
    .inline-loading::before {
      content: '';
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 2px solid #cbd5e1;
      border-top-color: var(--color-primary, #3b82f6);
      animation: spin .8s linear infinite;
    }
    .error-panel {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      text-align: center;
      border: 1px solid #fecaca;
      background: #fff1f2;
      border-radius: 10px;
      padding: 18px;
      color: #9f1239;
      font-size: 13px;
    }
    .error-panel button {
      border: none;
      border-radius: 8px;
      background: #be123c;
      color: #fff;
      font-weight: 700;
      font-size: 12px;
      padding: 8px 12px;
      cursor: pointer;
    }
    .page-overlay {
      position: fixed;
      inset: 0;
      z-index: 1200;
      background: rgba(15, 23, 42, .45);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .overlay-card {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 16px 40px rgba(15, 23, 42, .25);
      width: min(420px, 100%);
      padding: 18px;
      text-align: left;
    }
    .overlay-card h3 {
      margin: 0 0 8px;
      font-size: 17px;
      color: #0f172a;
    }
    .overlay-card p {
      margin: 0;
      font-size: 14px;
      color: #334155;
      white-space: pre-line;
      line-height: 1.45;
    }
    .dialog-actions {
      margin-top: 14px;
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
    .dialog-btn {
      border: none;
      border-radius: 8px;
      padding: 8px 14px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
    }
    .dialog-btn-secondary {
      background: #e2e8f0;
      color: #0f172a;
    }
    .dialog-btn-primary {
      background: #1d4ed8;
      color: #fff;
    }
    .dialog-btn-danger {
      background: #b91c1c;
      color: #fff;
    }
    .blocking-overlay {
      position: fixed;
      inset: 0;
      z-index: 1400;
      background: rgba(2, 6, 23, .52);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .blocking-card {
      width: min(360px, 100%);
      border-radius: 12px;
      background: #ffffff;
      box-shadow: 0 18px 42px rgba(2, 6, 23, .28);
      padding: 18px;
      display: flex;
      align-items: center;
      gap: 10px;
      color: #0f172a;
      font-weight: 600;
    }
    .blocking-spinner {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid #dbeafe;
      border-top-color: #2563eb;
      animation: spin .85s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @media (max-width: 900px) {
      .trajeto-operacional-title { font-size: 18px; }
      .btn-new-viagem { padding: 8px 14px; }
    }
    @media (max-width: 768px) {
      .trajeto-add-form { grid-template-columns:1fr 1fr; }
      .trajeto-item { grid-template-columns:34px 1fr; }
      .trajeto-item > :last-child { grid-column: 2; }
      .header-actions { flex-wrap:wrap; }
      .btn-new-viagem { width:100%; text-align:center; }
    }
    @media (max-width: 480px) {
      .dashboard-header { flex-direction:column; align-items:flex-start; gap:10px; }
      .trajeto-add-form { grid-template-columns:1fr; }
      .trajeto-operacional-title { font-size:14px; }
      .trajeto-duracao { font-size:11px; }
    }
    `
  ],
  template: `
    <div class="container-standard">

      <div class="dashboard-header">
        <div>
          <h1>⚓ Controle de Navios</h1>
          <p class="subtitle">Navios com embarques aguardando atracamento</p>
        </div>
        <div class="header-actions">
          <button class="btn-new-viagem" (click)="goToNovaViagem()">+ Nova Viagem</button>
        </div>
      </div>

      <!-- ── LISTAGEM ── -->
      <ng-container *ngIf="!showForm">
        <div class="content-section">
          <div class="toolbar">
            <input class="search" type="text" [(ngModel)]="q"
              placeholder="🔎 Buscar por nº viagem ou nome do navio" />
          </div>
          <div class="inline-loading" *ngIf="showInlineLoading">Carregando controle de navios...</div>

          <div class="error-panel" *ngIf="!showInlineLoading && hasLoadError">
            <strong>Falha ao carregar dados do controle de navios</strong>
            <span>{{ loadErrorMessage }}</span>
            <button type="button" (click)="retryLoad()">Tentar novamente</button>
          </div>

          <table class="data-table" *ngIf="!showInlineLoading && !hasLoadError">
            <thead>
              <tr>
                <th>Nº Viagem</th>
                <th>Navio</th>
                <th>ETA Destino</th>
                <th>Embarques</th>
                <th>Trajetórias</th>
                <th style="width:180px">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="filtered.length === 0">
                <td colspan="6" class="empty-state">Nenhum navio em trânsito com embarques pendentes</td>
              </tr>
              <ng-container *ngFor="let n of filtered">
                <tr>
                  <td><code><strong>{{ n.numeroViagem }}</strong></code></td>
                  <td>{{ n.nomeNavio }}</td>
                  <td>
                    <span *ngIf="etaDestino(n.id) as eta; else semEta">{{ eta | date:'dd/MM/yyyy' }}</span>
                    <ng-template #semEta><span style="color:var(--color-text-muted)">—</span></ng-template>
                  </td>
                  <td>
                    <span class="expand-toggle" *ngIf="embarquesPorNavio[n.id]?.length"
                          (click)="toggleExpand(n.id)">
                      {{ expanded[n.id] ? '▲' : '▶' }}
                      {{ embarquesPorNavio[n.id].length }} embarque(s)
                    </span>
                    <span *ngIf="!embarquesPorNavio[n.id]?.length && !temEmbarquesSemPerna(n.id)" class="trajetos-summary">Sem embarques</span>
                    <span *ngIf="!embarquesPorNavio[n.id]?.length && temEmbarquesSemPerna(n.id)" class="trajetos-summary">
                      {{ embarquesSemPerna(n.id) }} embarque(s) sem perna
                    </span>
                    <span *ngIf="embarquesPorNavio[n.id]?.length && temEmbarquesSemPerna(n.id)" class="info-chip">
                      +{{ embarquesSemPerna(n.id) }} sem perna
                    </span>
                  </td>
                  <td>
                    <span *ngIf="trajetosPorNavio[n.id]?.length" class="expand-toggle"
                          (click)="toggleExpandTrajeto(n.id)">
                      {{ expandedTrajeto[n.id] ? '▲' : '▶' }}
                      {{ trajetosPorNavio[n.id].length }} trajeto(s)
                    </span>
                    <span *ngIf="!trajetosPorNavio[n.id]?.length" class="trajetos-summary">Sem trajetórias</span>
                  </td>
                  <td>
                    <div class="row-actions">
                      <button class="btn-mini-icon" title="Editar trajetórias" (click)="openTrajetos(n)">🖊️</button>
                      <button class="btn-atracado" title="Marcar todos os embarques como Atracado"
                              *ngIf="temEmbarquesPendentes(n.id)"
                              (click)="marcarAtracado(n)">⚓ Atracado</button>
                      <button class="btn-mini-icon danger" title="Limpar trajetórias da viagem"
                              [disabled]="!trajetosPorNavio[n.id].length"
                              (click)="limparTrajetos(n)">🗑️</button>
                    </div>
                  </td>
                </tr>
                <!-- Detalhes expandidos (embarques + trajetórias) -->
                <tr *ngIf="isExpandedDetail(n.id)">
                  <td colspan="6" class="emb-section">
                    <div class="emb-block" *ngIf="expanded[n.id] && embarquesPorNavio[n.id]?.length">
                      <table class="emb-table">
                        <thead>
                          <tr>
                            <th>Código</th>
                            <th>Cliente</th>
                            <th>Container / BL</th>
                            <th>ETA</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr *ngFor="let e of embarquesPorNavio[n.id]" (click)="goToEmbarque(e.id)" class="clickable-row" title="Clique para ver detalhes do embarque">
                            <td><code class="code-link">{{ e.codigoInterno }}</code></td>
                            <td>{{ e.clienteNome || '—' }}</td>
                            <td>{{ e.containerBl || '—' }}</td>
                            <td>{{ e.eta ? (e.eta | date:'dd/MM/yyyy') : '—' }}</td>
                            <td>
                              <span class="status-badge" [ngClass]="statusClasse(e.status)">
                                {{ e.status }}
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <ul class="trajetos-operacional-list" *ngIf="expandedTrajeto[n.id] && trajetosPorNavio[n.id]?.length">
                      <li class="trajetos-operacional-item" *ngFor="let t of trajetosPorNavio[n.id]; let i = index">
                        <span class="trajeto-operacional-node">{{ t.sequencia ?? (i + 1) }}</span>
                        <div class="trajeto-operacional-main">
                          <div class="trajeto-operacional-title">
                            {{ portoNome(t.portoOrigemId, 'origem', t.portoOrigemNome) }} → {{ portoNome(t.portoDestinoId, 'destino', t.portoDestinoNome) }}
                          </div>
                          <div class="trajeto-operacional-subtitle">
                            ETD {{ t.etd | date:'dd/MM/yy' }} - ETA {{ t.eta | date:'dd/MM/yy' }} · {{ portoNome(t.portoOrigemId, 'origem', t.portoOrigemNome) }} → {{ portoNome(t.portoDestinoId, 'destino', t.portoDestinoNome) }}
                          </div>
                        </div>
                        <span class="trajeto-operacional-days">{{ calcDias(t.etd, t.eta) }} dias</span>
                      </li>
                    </ul>
                  </td>
                </tr>
              </ng-container>
            </tbody>
          </table>
        </div>
      </ng-container>

      <!-- ── FORMULÁRIO: APENAS TRAJETÓRIAS (Navio é somente leitura) ── -->
      <ng-container *ngIf="showForm">
        <div class="detail-header">
          <h2>Gerenciar Trajetórias — {{ editingNavio?.nomeNavio }}</h2>
          <p>Navio: <code>{{ editingNavio?.numeroViagem }}</code> | Adicione ou remova pernas da viagem</p>
        </div>
        <div class="card">

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
              <li class="trajeto-item" *ngFor="let t of trajetosForm; let i = index">
                <div class="trajeto-node">{{ i + 1 }}</div>
                <div class="trajeto-info">
                  <div class="trajeto-rota">
                    {{ portoNome(t.portoOrigemId, 'origem') }} → {{ portoNome(t.portoDestinoId, 'destino') }}
                  </div>
                  <div class="trajeto-datas">
                    ETD {{ t.etd | date:'dd/MM/yyyy' }} · ETA {{ t.eta | date:'dd/MM/yyyy' }}
                    <span *ngIf="t.trajetoDescricao"> · {{ t.trajetoDescricao }}</span>
                  </div>
                  <div class="trajeto-meta">
                    <span class="status-perna status-previsto">Previsto</span>
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
            <button class="btn btn-primary" (click)="saveTrajetos()">💾 Salvar Trajetos</button>
            <button class="btn btn-secondary" (click)="cancel()">✖️ Cancelar</button>
          </div>
        </div>
      </ng-container>

      <div class="page-overlay" *ngIf="confirmState.open" (click)="closeConfirm(false)">
        <div class="overlay-card" (click)="$event.stopPropagation()">
          <h3>{{ confirmState.title }}</h3>
          <p>{{ confirmState.message }}</p>
          <div class="dialog-actions">
            <button type="button" class="dialog-btn dialog-btn-secondary" (click)="closeConfirm(false)">
              {{ confirmState.cancelText }}
            </button>
            <button
              type="button"
              class="dialog-btn"
              [ngClass]="confirmState.danger ? 'dialog-btn-danger' : 'dialog-btn-primary'"
              (click)="closeConfirm(true)">
              {{ confirmState.confirmText }}
            </button>
          </div>
        </div>
      </div>

      <div class="page-overlay" *ngIf="alertState.open" (click)="closeAlert()">
        <div class="overlay-card" (click)="$event.stopPropagation()">
          <h3>{{ alertState.title }}</h3>
          <p>{{ alertState.message }}</p>
          <div class="dialog-actions">
            <button type="button" class="dialog-btn dialog-btn-primary" (click)="closeAlert()">
              {{ alertState.buttonText }}
            </button>
          </div>
        </div>
      </div>

      <div class="blocking-overlay" *ngIf="actionLoading">
        <div class="blocking-card">
          <span class="blocking-spinner" aria-hidden="true"></span>
          <span>{{ actionLoadingMessage }}</span>
        </div>
      </div>

    </div>
  `
})
export class ControleNaviosComponent implements OnInit, OnDestroy {
  navios: ControleNavio[] = [];
  trajetosPorNavio: Record<string, ControleNavioTrajeto[]> = {};
  embarquesPorNavio: Record<string, EmbarqueResumo[]> = {};
  expanded: Record<string, boolean> = {};
  expandedTrajeto: Record<string, boolean> = {};
  portosOrigem: PortoOrigem[] = [];
  portosDestino: PortoDestino[] = [];
  clienteLkp: Record<string, string> = {};

  private _statusList: StatusEmbarque[] = [];
  private _statusByOrdem: Record<string, number> = {};
  private _atracadoId = '';
  private _subs = new Subscription();

  q = '';
  showForm = false;
  editingNavio: ControleNavio | null = null;
  trajetosForm: TrajetoForm[] = [];
  trajetoForm: TrajetoForm = { portoOrigemId: '', portoDestinoId: '', etd: '', eta: '', trajetoDescricao: '' };
  trajetoErro = '';
  loadingMain = true;
  hasLoadedOnce = false;
  hasLoadError = false;
  loadErrorMessage = '';
  actionLoading = false;
  actionLoadingMessage = '';

  confirmState = {
    open: false,
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    danger: false
  };

  alertState = {
    open: false,
    title: 'Atenção',
    message: '',
    buttonText: 'Entendi'
  };

  private confirmResolver: ((confirmed: boolean) => void) | null = null;

  constructor(
    private service: ControleNavioService,
    private portoOrigemSvc: PortoOrigemService,
    private portoDestinoSvc: PortoDestinoService,
    private embarqueSvc: EmbarqueAduanaService,
    private statusSvc: StatusEmbarqueService,
    private clienteSvc: ClienteV2Service,
    private router: Router,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.portosOrigem  = this.portoOrigemSvc.getAtivos();
    this.portosDestino = this.portoDestinoSvc.getAtivos();
    this._statusList   = this.statusSvc.getAll();
    this._statusList.forEach(s => this._statusByOrdem[s.id] = s.ordem);
    this._atracadoId   = this._statusList.find(s => s.codigo === 'ATRC')?.id ?? '';
    this.clienteSvc.getAtivos().forEach((c: any) => this.clienteLkp[c.id] = c.razaoSocial);

    this._subs.add(
      this.service.navios$.subscribe(navios => {
        this.navios = navios;
        this._rebuildEmbarques();
      })
    );
    this._subs.add(
      this.service.trajetos$.subscribe(trajetos => {
        this.trajetosPorNavio = {};
        for (const t of trajetos) {
          if (!this.trajetosPorNavio[t.controleNavioId]) {
            this.trajetosPorNavio[t.controleNavioId] = [];
          }
          this.trajetosPorNavio[t.controleNavioId].push(t);
        }
        for (const navioId of Object.keys(this.trajetosPorNavio)) {
          this.trajetosPorNavio[navioId].sort((a, b) => (a.sequencia ?? 9999) - (b.sequencia ?? 9999));
        }
        this._rebuildEmbarques();
      })
    );

    this._subs.add(
      this.service.loading$.subscribe((loading) => {
        this.loadingMain = loading;
        if (!loading) {
          this.hasLoadedOnce = true;
        }
      })
    );

    this._subs.add(
      this.service.loadError$.subscribe((message) => {
        this.hasLoadError = !!message;
        this.loadErrorMessage = message ?? '';
      })
    );

    this.service.reload();
  }

  ngOnDestroy(): void {
    this._subs.unsubscribe();
  }

  private _rebuildEmbarques(): void {
    this.embarquesPorNavio = {};
    for (const [navioId, trajetos] of Object.entries(this.trajetosPorNavio)) {
      const statusFinais = ['entregue', 'finalizado', 'cancelado'];
      const embarques = trajetos
        .flatMap(t => t.embarques ?? [])
        .filter(e => !statusFinais.includes(e.status.toLowerCase()));
      // deduplicar por id
      const visto = new Set<string>();
      this.embarquesPorNavio[navioId] = embarques.filter(e => {
        if (visto.has(e.id)) return false;
        visto.add(e.id);
        return true;
      });
    }
  }

  get showInlineLoading(): boolean {
    return !this.hasLoadedOnce && this.loadingMain;
  }

  // ── Filtro: APENAS navios com ao menos 1 embarque não finalizado/entregue ──

  get filtered(): ControleNavio[] {
    // Mostrar navios com embarques pendentes/ativos OU com trajetos cadastrados.
    // Assim, trajetos recém salvos via API também aparecem no controle.
    const visiveis = this.navios.filter(n =>
      this._temPendentes(n.id) || (this.trajetosPorNavio[n.id]?.length ?? 0) > 0
    );
    
    if (!this.q) return visiveis;
    const s = this.q.toLowerCase();
    return visiveis.filter(n =>
      n.numeroViagem.toLowerCase().includes(s) ||
      n.nomeNavio.toLowerCase().includes(s)
    );
  }

  private _temPendentes(navioId: string): boolean {
    const comPerna = (this.embarquesPorNavio[navioId] ?? []).length;
    const totalAtivos = this.service.getEmbarquesAtivosCount(navioId);
    return comPerna > 0 || totalAtivos > 0;
  }

  embarquesSemPerna(navioId: string): number {
    const comPerna = (this.embarquesPorNavio[navioId] ?? []).length;
    const totalAtivos = this.service.getEmbarquesAtivosCount(navioId);
    return Math.max(0, totalAtivos - comPerna);
  }

  temEmbarquesSemPerna(navioId: string): boolean {
    return this.embarquesSemPerna(navioId) > 0;
  }

  temEmbarquesPendentes(navioId: string): boolean {
    return this._temPendentes(navioId);
  }

  // ── Helpers de exibição ───────────────────────────────────────────────

  statusNome(statusId: string): string {
    return this._statusList.find(s => s.id === statusId)?.nome ?? statusId;
  }

  statusColor(statusId: string): string {
    const ordem = this._statusByOrdem[statusId] ?? 0;
    if (ordem <= 1) return '#f59e0b';   // Previsto → amarelo
    if (ordem === 2) return '#3b82f6';  // Aguardando → azul
    if (ordem === 3) return '#2563eb';  // Atracado → azul escuro
    return '#22c55e';                   // >= Registrado → verde
  }

  statusClasse(status: string): string {
    const normalized = (status || '').toLowerCase();
    if (normalized.includes('previsto')) return 'status-previsto';
    if (normalized.includes('aguardando')) return 'status-aguardando';
    if (normalized.includes('atracado')) return 'status-atracado';
    if (normalized.includes('registrado')) return 'status-registrado';
    if (normalized.includes('desembara')) return 'status-desembaracado';
    if (normalized.includes('entregue')) return 'status-entregue';
    if (normalized.includes('finalizado')) return 'status-finalizado';
    return 'status-aguardando';
  }

  /** Retorna a maior ETA dentre os trajetos do navio (data de chegada prevista). */
  etaDestino(navioId: string): string | null {
    const trajetos = this.trajetosPorNavio[navioId] ?? [];
    if (!trajetos.length) return null;
    return trajetos.reduce((max, t) => t.eta > max ? t.eta : max, trajetos[0].eta);
  }

  // ── Ação: Marcar Atracado ─────────────────────────────────────────────

  async marcarAtracado(navio: ControleNavio): Promise<void> {
    if (!this._atracadoId) {
      this.openAlert('Status "Atracado" não encontrado. Execute a seed de status e tente novamente.');
      return;
    }

    const resumos = this.embarquesPorNavio[navio.id] ?? [];
    const statusNaoFinais = ['entregue', 'finalizado', 'cancelado', 'atracado'];
    const pendentes = resumos.filter(e => !statusNaoFinais.includes(e.status.toLowerCase()));
    if (!pendentes.length) {
      this.toast.info('Não há embarques pendentes para marcar como atracado.');
      return;
    }

    const ok = await this.askConfirm({
      title: 'Confirmar atracação',
      danger: false,
      confirmText: 'Marcar como atracado',
      cancelText: 'Cancelar',
      message:
        `Marcar navio "${navio.nomeNavio}" como ATRACADO?\n\n` +
        `Isso atualizará ${pendentes.length} embarque(s) para status "Atracado" ` +
        `e registrará o evento no histórico de cada um.`
    });
    if (!ok) return;

    this.startActionLoading('Aplicando status de atracação...');

    pendentes.forEach(resumo => {
      const emb = this.embarqueSvc.getById(resumo.id);
      if (!emb) return;
      this.embarqueSvc.alterarStatus(
        emb.id,
        this._atracadoId,
        'sistema',
        `Navio ${navio.nomeNavio} (${navio.numeroViagem}) atracado via Controle de Navios`
      );
    });

    this.toast.success(`${pendentes.length} embarque(s) atualizado(s) para Atracado.`);
    this.stopActionLoading();
    this.service.reload();
  }

  toggleExpand(id: string): void {
    this.expanded[id] = !this.expanded[id];
    if (this.expanded[id] && (this.trajetosPorNavio[id]?.length ?? 0) > 0) {
      this.expandedTrajeto[id] = true;
    }
  }

  toggleExpandTrajeto(id: string): void {
    this.expandedTrajeto[id] = !this.expandedTrajeto[id];
    if (this.expandedTrajeto[id] && (this.embarquesPorNavio[id]?.length ?? 0) > 0) {
      this.expanded[id] = true;
    }
  }

  isExpandedDetail(id: string): boolean {
    return !!(this.expanded[id] || this.expandedTrajeto[id]);
  }

  portoNome(id: string, tipo: 'origem' | 'destino', nomeApi?: string): string {
    if (nomeApi) return nomeApi;

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

  statusPernaLabel(status?: string): string {
    if (!status) return 'Previsto';
    if (status === 'EmTransito') return 'Em trânsito';
    if (status === 'Concluido') return 'Concluído';
    return status;
  }

  statusPernaClass(status?: string): string {
    const normalized = (status ?? 'Previsto').toLowerCase();
    if (normalized === 'emtransito') return 'status-aguardando';
    if (normalized === 'atracado') return 'status-atracado';
    if (normalized === 'concluido') return 'status-finalizado';
    return 'status-previsto';
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

  // ── GERENCIAR APENAS TRAJETOS (Navio é read-only) ──────────────────────

  openTrajetos(navio: ControleNavio): void {
    this.editingNavio = navio;
    this.trajetoErro = '';
    this.trajetoForm = { portoOrigemId: '', portoDestinoId: '', etd: '', eta: '', trajetoDescricao: '' };
    this.trajetosForm = (this.trajetosPorNavio[navio.id] ?? []).map(t => ({
      portoOrigemId:     t.portoOrigemId,
      portoDestinoId:    t.portoDestinoId,
      etd:               this.toDateInput(t.etd),
      eta:               this.toDateInput(t.eta),
      trajetoDescricao:  t.trajetoDescricao ?? ''
    }));
    this.showForm = true;
  }

  cancel(): void { 
    this.showForm = false; 
    this.editingNavio = null; 
  }

  saveTrajetos(): void {
    if (!this.editingNavio) return;
    const navioId = this.editingNavio.id;
    const hasTrajetos = this.trajetosForm.length > 0;

    this.startActionLoading('Salvando trajetórias da viagem...');
    
    this.service.replaceTrajetos(
      navioId, 
      this.toReplaceTrajetosPayload(this.trajetosForm)
    ).subscribe({
      next: () => {
        // Após salvar com sucesso, mantém o navio em foco e abre os blocos.
        this.toast.success('Trajetórias salvas com sucesso.');
        this.focusSavedNavio(navioId, hasTrajetos);
        this.cancel();
        this.stopActionLoading();
      },
      error: (err) => {
        this.trajetoErro = err?.message ?? 'Falha ao salvar trajetórias.';
        this.toast.error(this.trajetoErro);
        this.stopActionLoading();
      }
    });
  }

  async limparTrajetos(navio: ControleNavio): Promise<void> {
    if (!this.trajetosPorNavio[navio.id]?.length) return;

    const ok = await this.askConfirm({
      title: 'Remover trajetórias',
      message: `Remover todas as trajetórias da viagem ${navio.numeroViagem || navio.nomeNavio}?`,
      confirmText: 'Remover',
      cancelText: 'Cancelar',
      danger: true
    });
    if (!ok) return;

    this.startActionLoading('Removendo trajetórias da viagem...');

    this.service.replaceTrajetos(navio.id, []).subscribe({
      next: () => {
        this.expandedTrajeto[navio.id] = false;
        this.toast.success('Trajetórias removidas com sucesso.');
        this.stopActionLoading();
      },
      error: (err) => {
        this.toast.error(err?.message ?? 'Falha ao remover trajetórias.');
        this.stopActionLoading();
      }
    });
  }

  retryLoad(): void {
    this.service.reload();
  }

  goToNovaViagem(): void {
    this.router.navigate(['/navios']);
  }

  goToEmbarque(embarqueId: string): void {
    // Navegar para detalhe do embarque
    // Usar router.navigate(['/embarques', embarqueId])
    window.location.href = `/embarques/${embarqueId}`;
  }

  private toReplaceTrajetosPayload(trajetos: TrajetoForm[]): ReplaceTrajetoRequest[] {
    return trajetos.map((t) => ({
      portoOrigemId: t.portoOrigemId,
      portoDestinoId: t.portoDestinoId,
      etd: t.etd,
      eta: t.eta,
      trajetoDescricao: t.trajetoDescricao || undefined
    }));
  }

  private toDateInput(value: string): string {
    if (!value) return '';
    return value.includes('T') ? value.split('T')[0] : value.slice(0, 10);
  }

  private focusSavedNavio(navioId: string, abrirTrajetos: boolean): void {
    this.expanded = { [navioId]: true };
    this.expandedTrajeto = abrirTrajetos ? { [navioId]: true } : {};
  }

  private startActionLoading(message: string): void {
    this.actionLoading = true;
    this.actionLoadingMessage = message;
  }

  private stopActionLoading(): void {
    this.actionLoading = false;
    this.actionLoadingMessage = '';
  }

  private openAlert(message: string, title = 'Atenção'): void {
    this.alertState = {
      open: true,
      title,
      message,
      buttonText: 'Entendi'
    };
  }

  closeAlert(): void {
    this.alertState = {
      ...this.alertState,
      open: false
    };
  }

  private askConfirm(config: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
  }): Promise<boolean> {
    this.confirmState = {
      open: true,
      title: config.title,
      message: config.message,
      confirmText: config.confirmText ?? 'Confirmar',
      cancelText: config.cancelText ?? 'Cancelar',
      danger: !!config.danger
    };

    return new Promise((resolve) => {
      this.confirmResolver = resolve;
    });
  }

  closeConfirm(confirmed: boolean): void {
    this.confirmState = {
      ...this.confirmState,
      open: false
    };

    if (this.confirmResolver) {
      this.confirmResolver(confirmed);
      this.confirmResolver = null;
    }
  }
}
