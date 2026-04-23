import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CRUD_STYLES } from '../../../shared/styles/crud-page.styles';
import {
  EmbarqueAduana, StatusEmbarque, HistoricoStatusEmbarque,
  FreeTimeEmbarque, PagamentoProcesso, TipoPagamento, TIPO_PAGAMENTO_LABELS
} from '../models/embarque-aduana.models';
import { EmbarqueAduanaService }  from '../services/embarque-aduana.service';
import { StatusEmbarqueService }  from '../services/status-embarque.service';
import { ClienteV2Service }       from '../../cadastros/clientes/services/cliente-v2.service';
import { DespachanteV2Service }   from '../../cadastros/despachantes/services/despachante-v2.service';
import { PortoOrigemService }     from '../../cadastros/portos-origem/services/porto-origem.service';
import { PortoDestinoService }    from '../../cadastros/portos-destino/services/porto-destino.service';
import { AgenteCargaService }     from '../../cadastros/agentes-carga/services/agente-carga.service';
import { ExportadorService }      from '../../cadastros/exportadores/services/exportador.service';
import { ControleNavioService }   from '../../logistica/controle-navios/services/controle-navio.service';
import { CustoDespachanteService }from '../../custo-despachante/services/custo-despachante.service';
import { OrcamentoVendaService }  from '../../orcamento-venda/services/orcamento-venda.service';
import { AuthService }            from '../../../../features/auth/auth.providers';
import { SolicitacaoOrcamentoService } from '../../solicitacao-orcamento/services/solicitacao-orcamento.service';
import { StatusSolicitacao }           from '../../solicitacao-orcamento/models/solicitacao-orcamento.models';
import { generateV2Id }                from '../../../core/helpers/storage-v2.helper';
import { EmbarqueAcompanhamentoComponent } from './embarque-acompanhamento.component';
import { EmbarqueNavioVinculoFormComponent } from '../components/embarque-navio-vinculo-form.component';
import { ActivatedRoute }                  from '@angular/router';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../../core/services/confirm-dialog.service';
import { ApiErrorMapper } from '../../../../core/api/error-handler/api-error.mapper';

type Mode = 'list' | 'form' | 'detail' | 'acompanhamento';

@Component({
  selector: 'app-embarque-aduana',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe, EmbarqueAcompanhamentoComponent, EmbarqueNavioVinculoFormComponent],
  styles: [
    ...CRUD_STYLES,
    `
    /* Timeline */
    .timeline { display:flex; align-items:center; gap:0; padding:16px 0 8px; overflow-x:auto; }
    .tl-step { display:flex; flex-direction:column; align-items:center; }
    .tl-line { height:3px; flex:1; min-width:24px; background:var(--color-border); }
    .tl-line.done { background:var(--color-primary,#3b82f6); }
    .tl-dot { width:28px; height:28px; border-radius:50%; border:3px solid var(--color-border); background:#fff; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; cursor:pointer; transition:transform .15s,box-shadow .15s; }
    .tl-dot:hover { transform:scale(1.18); box-shadow:0 0 0 4px rgba(59,130,246,.18); }
    .tl-dot.done { border-color:var(--color-primary,#3b82f6); background:var(--color-primary,#3b82f6); color:#fff; }
    .tl-dot.current { border-color:var(--color-primary,#3b82f6); color:var(--color-primary,#3b82f6); }
    .tl-dot.future { border-color:var(--color-border); color:var(--color-text-muted); }
    .tl-label { font-size:10px; margin-top:4px; white-space:nowrap; color:var(--color-text-muted); cursor:pointer; }
    .tl-label:hover { color:var(--color-primary,#3b82f6); text-decoration:underline; }
    .tl-label.current { color:var(--color-primary,#3b82f6); font-weight:700; }
    /* Detail layout */
    .detail-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
    @media(max-width:768px){ .detail-grid{grid-template-columns:1fr} }
    .info-list { list-style:none; padding:0; margin:0; font-size:13px; }
    .info-list li { display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--color-border); gap:8px; }
    .info-list li:last-child { border-bottom:none; }
    .info-list .lbl { color:var(--color-text-muted); flex-shrink:0; }
    .info-list .val { text-align:right; font-weight:500; }
    /* Free time alert */
    .badge-alert { background:#fef2f2; color:#dc2626; border:1px solid #fecaca; padding:2px 8px; border-radius:12px; font-size:11px; }
    .badge-ok    { background:#f0fdf4; color:#16a34a; border:1px solid #bbf7d0; padding:2px 8px; border-radius:12px; font-size:11px; }
    /* Historico feed */
    .hist-feed { list-style:none; padding:0; margin:0; border-left:3px solid var(--color-border); padding-left:16px; }
    .hist-item { position:relative; margin-bottom:16px; font-size:13px; }
    .hist-item::before { content:''; position:absolute; left:-22px; top:4px; width:10px; height:10px; border-radius:50%; background:var(--color-primary,#3b82f6); border:2px solid #fff; box-shadow:0 0 0 2px var(--color-primary,#3b82f6); }
    .hist-date { font-size:11px; color:var(--color-text-muted); }
    /* Modal */
    .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.45); z-index:200; display:flex; align-items:center; justify-content:center; padding:24px; }
    .modal-box { background:var(--color-surface); border-radius:12px; width:100%; max-width:420px; padding:24px; }
    .modal-box h3 { margin:0 0 16px; font-size:15px; font-weight:700; }
    /* Pagamentos */
    .pgto-pago { color:#16a34a; font-weight:600; }
    .pgto-venc { color:#dc2626; font-weight:600; }
    .pgto-pend { color:var(--color-text-muted); }
    /* Edição inline no detalhe */
    .edit-field { flex:1; min-width:0; padding:8px 10px; border:2px solid var(--color-border); border-radius:8px; font-size:13px; background:var(--color-surface); color:var(--color-text); transition:border-color .2s, box-shadow .2s; }
    .edit-field:focus { outline:none; border-color:var(--color-primary); box-shadow:0 0 0 3px rgba(102,126,234,.12); }
    .info-list li { align-items:center; gap:12px; }
    /* ===== RESPONSIVE ===== */
    @media (max-width: 768px) {
      .detail-grid { grid-template-columns:1fr; }
      .modal-box { padding:16px; max-width:calc(100vw - 32px); width:100%; }
      .dashboard-header > div:last-child { flex-wrap:wrap; }
      .dashboard-header > div:last-child button { flex:1; min-width:140px; }
    }
    @media (max-width: 480px) {
      .dashboard-header { flex-direction:column; align-items:flex-start; gap:10px; }
      .tl-label { font-size:9px; }
      .tl-dot { width:22px; height:22px; font-size:10px; }
      .hist-item { font-size:12px; }
      .modal-overlay { padding:12px; }
    }
    `
  ],
  template: `
    <div class="container-standard">

      <div class="dashboard-header" *ngIf="mode !== 'acompanhamento'">
        <div>
          <h1>🚢 Embarques Aduana</h1>
          <p class="subtitle">Processo operacional de importação</p>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <button class="btn btn-primary" *ngIf="mode !== 'form'" disabled title="Feature desabilitada" style="opacity:.45;cursor:not-allowed">+ Novo Embarque (desabilitado)</button>
          <button class="btn btn-secondary" *ngIf="mode === 'list'" (click)="mode = 'acompanhamento'">🗂️ Acompanhamento</button>
        </div>
      </div>

      <!-- ── ACOMPANHAMENTO ── -->
      <ng-container *ngIf="mode === 'acompanhamento'">
        <app-embarque-acompanhamento
          (fechar)="mode = 'list'"
          (abrirDetalhe)="abrirDetalhePorId($event)">
        </app-embarque-acompanhamento>
      </ng-container>

      <!-- ── LISTAGEM ── -->
      <ng-container *ngIf="mode === 'list'">
        <div class="content-section">
          <div class="toolbar" style="flex-wrap:wrap;gap:8px">
            <input class="search" type="text" [(ngModel)]="qGeral" placeholder="🔎 Buscar por código, ref, BL, container..." style="flex:2;min-width:200px" />
            <select [(ngModel)]="qStatus" style="padding:8px 12px;border:1.5px solid var(--color-border);border-radius:8px;font-size:13px;background:var(--color-bg)">
              <option value="">Todos os status</option>
              <option *ngFor="let s of statusList" [value]="s.id">{{ s.nome }}</option>
            </select>
            <select [(ngModel)]="qCliente" style="padding:8px 12px;border:1.5px solid var(--color-border);border-radius:8px;font-size:13px;background:var(--color-bg)">
              <option value="">Todos os clientes</option>
              <option *ngFor="let c of clientes" [value]="c.id">{{ c.razaoSocial }}</option>
            </select>
          </div>

          <table class="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Ref. Ominium</th>
                <th>Cliente</th>
                <th>BL</th>
                <th>ETA</th>
                <th>Status</th>
                <th style="width:100px">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="filtered.length === 0">
                <td colspan="7" class="empty-state">Nenhum embarque cadastrado</td>
              </tr>
              <tr *ngFor="let e of filtered" style="cursor:pointer" (click)="openDetail(e)">
                <td><span class="cod-badge">{{ e.codigoInterno }}</span></td>
                <td>{{ e.refOminium || '—' }}</td>
                <td>{{ nome('cliente', e.clienteId) }}</td>
                <td>{{ e.bl || '—' }}</td>
                <td>{{ e.eta | date:'dd/MM/yyyy' }}</td>
                <td>
                  <span class="badge" [style.background]="statusColor(e.statusEmbarqueId)">
                    {{ statusNome(e.statusEmbarqueId) }}
                  </span>
                </td>
                <td>
                  <div class="row-actions" (click)="$event.stopPropagation()">
                    <button class="btn-icon" title="Detalhe" (click)="openDetail(e)">🔍</button>
                    <button class="btn-icon danger" *ngIf="!isDespachante" title="Excluir" (click)="remove(e.id)">🗑️</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </ng-container>

      <!-- ── FORMULÁRIO ── -->
      <ng-container *ngIf="mode === 'form'">
        <div class="detail-header">
          <h2>{{ editing ? 'Editar — ' + editing.codigoInterno : 'Novo Embarque' }}</h2>
        </div>
        <div class="card">
          <h3 style="margin:0 0 14px;font-size:14px;font-weight:700">Dados Gerais</h3>
          <div class="form-grid">
            <div class="field w2">
              <label>Cliente <span class="required">*</span></label>
              <select [(ngModel)]="form.clienteId" [class.err]="showErr && (!form.clienteId || hasApiFieldError('clienteId', 'cliente'))">
                <option value="">— Selecione —</option>
                <option *ngFor="let c of clientes" [value]="c.id">{{ c.razaoSocial }}</option>
              </select>
              <span class="err-msg" *ngIf="showErr && !form.clienteId">Obrigatório</span>
              <span class="err-msg" *ngIf="showErr && hasApiFieldError('clienteId', 'cliente')">{{ firstApiFieldError('clienteId', 'cliente') }}</span>
            </div>
            <div class="field">
              <label>Despachante <span class="required">*</span></label>
              <select [(ngModel)]="form.despachanteId" [class.err]="showErr && (!form.despachanteId || hasApiFieldError('despachanteId', 'despachante'))">
                <option value="">— Selecione —</option>
                <option *ngFor="let d of despachantes" [value]="d.id">{{ d.nome }}</option>
              </select>
              <span class="err-msg" *ngIf="showErr && !form.despachanteId">Obrigatório</span>
              <span class="err-msg" *ngIf="showErr && hasApiFieldError('despachanteId', 'despachante')">{{ firstApiFieldError('despachanteId', 'despachante') }}</span>
            </div>
            <div class="field">
              <label>Porto Origem <span class="required">*</span></label>
              <select [(ngModel)]="form.portoOrigemId" [class.err]="showErr && (!form.portoOrigemId || hasApiFieldError('portoOrigemId', 'portoOrigem'))">
                <option value="">— Selecione —</option>
                <option *ngFor="let p of portosOrigem" [value]="p.id">{{ p.nome }}</option>
              </select>
              <span class="err-msg" *ngIf="showErr && !form.portoOrigemId">Obrigatório</span>
              <span class="err-msg" *ngIf="showErr && hasApiFieldError('portoOrigemId', 'portoOrigem')">{{ firstApiFieldError('portoOrigemId', 'portoOrigem') }}</span>
            </div>
            <div class="field">
              <label>Porto Destino <span class="required">*</span></label>
              <select [(ngModel)]="form.portoDestinoId" [class.err]="showErr && (!form.portoDestinoId || hasApiFieldError('portoDestinoId', 'portoDestino'))">
                <option value="">— Selecione —</option>
                <option *ngFor="let p of portosDestino" [value]="p.id">{{ p.nome }}</option>
              </select>
              <span class="err-msg" *ngIf="showErr && !form.portoDestinoId">Obrigatório</span>
              <span class="err-msg" *ngIf="showErr && hasApiFieldError('portoDestinoId', 'portoDestino')">{{ firstApiFieldError('portoDestinoId', 'portoDestino') }}</span>
            </div>
            <div class="field">
              <label>Agente de Carga</label>
              <select [(ngModel)]="form.agenteCargaId">
                <option value="">— Selecione —</option>
                <option *ngFor="let a of agentesCarga" [value]="a.id">{{ a.nome }}</option>
              </select>
            </div>
            <div class="field">
              <label>Exportador</label>
              <select [(ngModel)]="form.exportadorId">
                <option value="">— Selecione —</option>
                <option *ngFor="let e of exportadores" [value]="e.id">{{ e.nome }}</option>
              </select>
            </div>
            <div class="field">
              <label>Navio / Viagem</label>
              <select [(ngModel)]="form.controleNavioId">
                <option value="">— Selecione —</option>
                <option *ngFor="let n of navios" [value]="n.id">{{ n.nomeNavio }} — {{ n.numeroViagem }}</option>
              </select>
            </div>
            <div class="field">
              <label>Custo Base (CD)</label>
              <select [(ngModel)]="form.custoDespachanteId">
                <option value="">— Nenhum —</option>
                <option *ngFor="let c of custos" [value]="c.id">{{ c.codigoInterno }}</option>
              </select>
            </div>
            <div class="field">
              <label>Orçamento de Venda (OV)</label>
              <select [(ngModel)]="form.orcamentoVendaId">
                <option value="">— Nenhum —</option>
                <option *ngFor="let o of orcamentos" [value]="o.id">{{ o.codigoInterno }}</option>
              </select>
            </div>
            <div class="field">
              <label>Responsável (usuário)</label>
              <input type="text" [(ngModel)]="form.usuarioResponsavelId" placeholder="Nome ou ID" />
            </div>
          </div>

          <h3 style="margin:16px 0 14px;font-size:14px;font-weight:700">Referências e Documentos</h3>
          <div class="form-grid">
            <div class="field">
              <label>Ref. Ominium</label>
              <input type="text" [(ngModel)]="form.refOminium" placeholder="Ex: OM-2026-001" />
            </div>
            <div class="field">
              <label>IMP</label>
              <input type="text" [(ngModel)]="form.imp" />
            </div>
            <div class="field">
              <label>BL</label>
              <input type="text" [(ngModel)]="form.bl" />
            </div>
            <div class="field">
              <label>Container</label>
              <input type="text" [(ngModel)]="form.container" placeholder="Ex: XXXX1234567" />
            </div>
            <div class="field">
              <label>LI</label>
              <input type="text" [(ngModel)]="form.li" />
            </div>
            <div class="field">
              <label>Registro</label>
              <input type="text" [(ngModel)]="form.registro" />
            </div>
            <div class="field">
              <label>Ref. Agente</label>
              <input type="text" [(ngModel)]="form.refAg" />
            </div>
            <div class="field">
              <label>KG</label>
              <input type="number" [(ngModel)]="form.kg" min="0" step="0.001" />
            </div>
          </div>

          <h3 style="margin:16px 0 14px;font-size:14px;font-weight:700">Logística e Datas</h3>
          <div class="form-grid">
            <div class="field">
              <label>ETD <span class="required">*</span></label>
              <input type="date" [(ngModel)]="form.etd" [class.err]="showErr && (!form.etd || hasApiFieldError('etd'))" />
              <span class="err-msg" *ngIf="showErr && !form.etd">Obrigatório</span>
              <span class="err-msg" *ngIf="showErr && hasApiFieldError('etd')">{{ firstApiFieldError('etd') }}</span>
            </div>
            <div class="field">
              <label>ETA <span class="required">*</span></label>
              <input type="date" [(ngModel)]="form.eta" [class.err]="showErr && (!form.eta || hasApiFieldError('eta'))" />
              <span class="err-msg" *ngIf="showErr && !form.eta">Obrigatório</span>
              <span class="err-msg" *ngIf="showErr && hasApiFieldError('eta')">{{ firstApiFieldError('eta') }}</span>
            </div>
            <div class="field">
              <label>Aviso Previsão</label>
              <input type="date" [(ngModel)]="form.avisoPrevisao" />
            </div>
            <div class="field">
              <label>Aviso Chegada</label>
              <input type="date" [(ngModel)]="form.avisoChegada" />
            </div>
            <div class="field">
              <label>Data Registro</label>
              <input type="date" [(ngModel)]="form.dataRegistro" />
            </div>
            <div class="field">
              <label>Desembaraço</label>
              <input type="date" [(ngModel)]="form.desemb" />
            </div>
            <div class="field">
              <label>Entrega</label>
              <input type="date" [(ngModel)]="form.entrega" />
            </div>
            <div class="field w3">
              <label>Observação</label>
              <input type="text" [(ngModel)]="form.observacao" />
            </div>
          </div>

          <div class="actions">
            <button class="btn btn-primary" (click)="salvar()">💾 Salvar</button>
            <button class="btn btn-secondary" (click)="cancelForm()">Cancelar</button>
          </div>
        </div>
      </ng-container>

      <!-- ── DETALHE ── -->
      <ng-container *ngIf="mode === 'detail' && detail">

        <!-- Header do Detalhe -->
        <div class="detail-header" style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px">
          <div>
            <h2 style="margin:0">{{ detail.codigoInterno }}
              <span class="badge" [style.background]="statusColor(detail.statusEmbarqueId)" style="margin-left:8px;font-size:12px">
                {{ statusNome(detail.statusEmbarqueId) }}
              </span>
            </h2>
            <p style="margin:4px 0 0;font-size:13px;color:var(--color-text-muted)">{{ nome('cliente', detail.clienteId) }} · ETA {{ detail.eta | date:'dd/MM/yyyy' }}</p>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn btn-secondary" (click)="abrirModalStatus()" *ngIf="!editMode">🔄 Alterar Status</button>
            <button class="btn btn-primary" (click)="saveEdit()" *ngIf="editMode">💾 Salvar</button>
            <button class="btn btn-secondary" *ngIf="!isDespachante" (click)="editMode ? (editMode = false) : startEdit()">{{ editMode ? '✕ Cancelar' : '✏️ Editar' }}</button>
            <button class="btn btn-secondary" (click)="mode = 'list'; editMode = false">← Voltar</button>
          </div>
        </div>

        <!-- Timeline de Status -->
        <div class="content-section">
          <h4 style="margin:0 0 4px;font-size:13px;font-weight:700">Linha do Tempo</h4>
          <div class="timeline">
            <ng-container *ngFor="let s of statusList; let i = index">
              <div class="tl-line" *ngIf="i > 0" [class.done]="statusOrdem(detail.statusEmbarqueId) > s.ordem - 1"></div>
              <div class="tl-step" (click)="irParaStep(s.id)" [title]="'Ir para: ' + s.nome">
                <div class="tl-dot"
                  [class.done]="statusOrdem(detail.statusEmbarqueId) > s.ordem"
                  [class.current]="statusOrdem(detail.statusEmbarqueId) === s.ordem"
                  [class.future]="statusOrdem(detail.statusEmbarqueId) < s.ordem">
                  {{ statusOrdem(detail.statusEmbarqueId) > s.ordem ? '✓' : s.ordem }}
                </div>
                <div class="tl-label" [class.current]="statusOrdem(detail.statusEmbarqueId) === s.ordem">{{ s.nome }}</div>
              </div>
            </ng-container>
          </div>
        </div>

        <!-- Informações / Logística side by side -->
        <div class="detail-grid">
          <!-- Informações Gerais -->
          <div class="content-section">
            <h4 style="margin:0 0 12px;font-size:13px;font-weight:700">Informações Gerais</h4>
            <ul class="info-list">
              <li><span class="lbl">Ref. Ominium</span>
                <span class="val" *ngIf="!editMode">{{ detail.refOminium || '—' }}</span>
                <input *ngIf="editMode" type="text" [(ngModel)]="form.refOminium" class="edit-field" />
              </li>
              <li><span class="lbl">IMP</span>
                <span class="val" *ngIf="!editMode">{{ detail.imp || '—' }}</span>
                <input *ngIf="editMode" type="text" [(ngModel)]="form.imp" class="edit-field" />
              </li>
              <li><span class="lbl">BL</span>
                <span class="val" *ngIf="!editMode">{{ detail.bl || '—' }}</span>
                <input *ngIf="editMode" type="text" [(ngModel)]="form.bl" class="edit-field" />
              </li>
              <li><span class="lbl">Container</span>
                <span class="val" *ngIf="!editMode">{{ detail.container || '—' }}</span>
                <input *ngIf="editMode" type="text" [(ngModel)]="form.container" class="edit-field" />
              </li>
              <li><span class="lbl">LI</span>
                <span class="val" *ngIf="!editMode">{{ detail.li || '—' }}</span>
                <input *ngIf="editMode" type="text" [(ngModel)]="form.li" class="edit-field" />
              </li>
              <li><span class="lbl">Registro</span>
                <span class="val" *ngIf="!editMode">{{ detail.registro || '—' }}</span>
                <input *ngIf="editMode" type="text" [(ngModel)]="form.registro" class="edit-field" />
              </li>
              <li><span class="lbl">Ref. Agente</span>
                <span class="val" *ngIf="!editMode">{{ detail.refAg || '—' }}</span>
                <input *ngIf="editMode" type="text" [(ngModel)]="form.refAg" class="edit-field" />
              </li>
              <li><span class="lbl">KG</span>
                <span class="val" *ngIf="!editMode">{{ detail.kg | number:'1.3-3' }}</span>
                <input *ngIf="editMode" type="number" [(ngModel)]="form.kg" min="0" step="0.001" class="edit-field" />
              </li>
              <li><span class="lbl">Custo Base</span>
                <span class="val cod-badge" *ngIf="!editMode">{{ detail.custoDespachanteId ? nomeCusto(detail.custoDespachanteId) : '—' }}</span>
                <select *ngIf="editMode" [(ngModel)]="form.custoDespachanteId" class="edit-field">
                  <option value="">— Nenhum —</option>
                  <option *ngFor="let c of custos" [value]="c.id">{{ c.codigoInterno }}</option>
                </select>
              </li>
              <li><span class="lbl">Orçamento</span>
                <span class="val cod-badge" *ngIf="!editMode">{{ detail.orcamentoVendaId ? nomeOrc(detail.orcamentoVendaId) : '—' }}</span>
                <select *ngIf="editMode" [(ngModel)]="form.orcamentoVendaId" class="edit-field">
                  <option value="">— Nenhum —</option>
                  <option *ngFor="let o of orcamentos" [value]="o.id">{{ o.codigoInterno }}</option>
                </select>
              </li>
              <li><span class="lbl">Observação</span>
                <span class="val" *ngIf="!editMode" style="text-align:right">{{ detail.observacao || '—' }}</span>
                <input *ngIf="editMode" type="text" [(ngModel)]="form.observacao" class="edit-field" />
              </li>
            </ul>
          </div>

          <!-- Logística -->
          <div class="content-section">
            <h4 style="margin:0 0 12px;font-size:13px;font-weight:700">Logística</h4>
            <ul class="info-list">
              <li><span class="lbl">Cliente</span>
                <span class="val" *ngIf="!editMode">{{ nome('cliente', detail.clienteId) }}</span>
                <select *ngIf="editMode" [(ngModel)]="form.clienteId" class="edit-field">
                  <option value="">— Selecione —</option>
                  <option *ngFor="let c of clientes" [value]="c.id">{{ c.razaoSocial }}</option>
                </select>
              </li>
              <li><span class="lbl">Despachante</span>
                <span class="val" *ngIf="!editMode">{{ nome('despachante', detail.despachanteId) }}</span>
                <select *ngIf="editMode" [(ngModel)]="form.despachanteId" class="edit-field">
                  <option value="">— Selecione —</option>
                  <option *ngFor="let d of despachantes" [value]="d.id">{{ d.nome }}</option>
                </select>
              </li>
              <li><span class="lbl">Porto Origem</span>
                <span class="val" *ngIf="!editMode">{{ nome('portoOrigem', detail.portoOrigemId) }}</span>
                <select *ngIf="editMode" [(ngModel)]="form.portoOrigemId" class="edit-field">
                  <option value="">— Selecione —</option>
                  <option *ngFor="let p of portosOrigem" [value]="p.id">{{ p.nome }}</option>
                </select>
              </li>
              <li><span class="lbl">Porto Destino</span>
                <span class="val" *ngIf="!editMode">{{ nome('portoDestino', detail.portoDestinoId) }}</span>
                <select *ngIf="editMode" [(ngModel)]="form.portoDestinoId" class="edit-field">
                  <option value="">— Selecione —</option>
                  <option *ngFor="let p of portosDestino" [value]="p.id">{{ p.nome }}</option>
                </select>
              </li>
              <li><span class="lbl">Navio</span>
                <span class="val" *ngIf="!editMode">{{ nome('navio', detail.controleNavioId) }}</span>
                <select *ngIf="editMode" [(ngModel)]="form.controleNavioId" class="edit-field">
                  <option value="">— Selecione —</option>
                  <option *ngFor="let n of navios" [value]="n.id">{{ n.nomeNavio }} — {{ n.numeroViagem }}</option>
                </select>
              </li>
              <li><span class="lbl">Agente de Carga</span>
                <span class="val" *ngIf="!editMode">{{ nome('agente', detail.agenteCargaId) }}</span>
                <select *ngIf="editMode" [(ngModel)]="form.agenteCargaId" class="edit-field">
                  <option value="">— Selecione —</option>
                  <option *ngFor="let a of agentesCarga" [value]="a.id">{{ a.nome }}</option>
                </select>
              </li>
              <li><span class="lbl">Exportador</span>
                <span class="val" *ngIf="!editMode">{{ nome('exportador', detail.exportadorId) }}</span>
                <select *ngIf="editMode" [(ngModel)]="form.exportadorId" class="edit-field">
                  <option value="">— Nenhum —</option>
                  <option *ngFor="let e of exportadores" [value]="e.id">{{ e.nome }}</option>
                </select>
              </li>
              <li><span class="lbl">ETD</span>
                <span class="val" *ngIf="!editMode">{{ detail.etd | date:'dd/MM/yyyy' }}</span>
                <input *ngIf="editMode" type="date" [(ngModel)]="form.etd" class="edit-field" />
              </li>
              <li><span class="lbl">ETA</span>
                <span class="val" *ngIf="!editMode">{{ detail.eta | date:'dd/MM/yyyy' }}</span>
                <input *ngIf="editMode" type="date" [(ngModel)]="form.eta" class="edit-field" />
              </li>
              <li><span class="lbl">Aviso Previsão</span>
                <span class="val" *ngIf="!editMode">{{ detail.avisoPrevisao ? (detail.avisoPrevisao | date:'dd/MM/yyyy') : '—' }}</span>
                <input *ngIf="editMode" type="date" [(ngModel)]="form.avisoPrevisao" class="edit-field" />
              </li>
              <li><span class="lbl">Aviso Chegada</span>
                <span class="val" *ngIf="!editMode">{{ detail.avisoChegada ? (detail.avisoChegada | date:'dd/MM/yyyy') : '—' }}</span>
                <input *ngIf="editMode" type="date" [(ngModel)]="form.avisoChegada" class="edit-field" />
              </li>
              <li><span class="lbl">Data Registro</span>
                <span class="val" *ngIf="!editMode">{{ detail.dataRegistro ? (detail.dataRegistro | date:'dd/MM/yyyy') : '—' }}</span>
                <input *ngIf="editMode" type="date" [(ngModel)]="form.dataRegistro" class="edit-field" />
              </li>
              <li><span class="lbl">Desembaraço</span>
                <span class="val" *ngIf="!editMode">{{ detail.desemb ? (detail.desemb | date:'dd/MM/yyyy') : '—' }}</span>
                <input *ngIf="editMode" type="date" [(ngModel)]="form.desemb" class="edit-field" />
              </li>
              <li><span class="lbl">Entrega</span>
                <span class="val" *ngIf="!editMode">{{ detail.entrega ? (detail.entrega | date:'dd/MM/yyyy') : '—' }}</span>
                <input *ngIf="editMode" type="date" [(ngModel)]="form.entrega" class="edit-field" />
              </li>
              <li><span class="lbl">Responsável</span>
                <span class="val" *ngIf="!editMode">{{ detail.usuarioResponsavelId || '—' }}</span>
                <input *ngIf="editMode" type="text" [(ngModel)]="form.usuarioResponsavelId" class="edit-field" />
              </li>
            </ul>
          </div>
        </div>

        <!-- Free Time -->
        <div class="content-section">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <h4 style="margin:0;font-size:13px;font-weight:700">Free Time</h4>
            <button class="btn btn-secondary" style="font-size:12px" (click)="ftForm={embarqueAduanaId:detail.id,quantidadeDias:14,dataInicio:'',observacao:''};showFtForm=true">+ Adicionar</button>
          </div>

          <!-- Form inline add free time -->
          <div *ngIf="showFtForm" style="border:1.5px solid var(--color-border);border-radius:8px;padding:12px;margin-bottom:12px">
            <div class="form-grid">
              <div class="field">
                <label>Data Início <span class="required">*</span></label>
                <input type="date" [(ngModel)]="ftForm.dataInicio" />
              </div>
              <div class="field">
                <label>Qtd. Dias</label>
                <input type="number" [(ngModel)]="ftForm.quantidadeDias" min="1" step="1" />
              </div>
              <div class="field w2">
                <label>Observação</label>
                <input type="text" [(ngModel)]="ftForm.observacao" />
              </div>
            </div>
            <p class="err-msg" *ngIf="ftErro">{{ ftErro }}</p>
            <div class="actions">
              <button class="btn btn-primary" (click)="salvarFreeTime()">Salvar</button>
              <button class="btn btn-secondary" (click)="showFtForm=false">Cancelar</button>
            </div>
          </div>

          <p *ngIf="freeTimes.length === 0 && !showFtForm" style="font-size:13px;color:var(--color-text-muted)">Nenhum free time cadastrado.</p>
          <table class="data-table" *ngIf="freeTimes.length > 0">
            <thead><tr><th>Início</th><th>Fim</th><th>Dias</th><th>Restam</th><th>Observação</th><th style="width:50px"></th></tr></thead>
            <tbody>
              <tr *ngFor="let ft of freeTimes">
                <td>{{ ft.dataInicio | date:'dd/MM/yyyy' }}</td>
                <td>{{ ft.dataFim | date:'dd/MM/yyyy' }}</td>
                <td>{{ ft.quantidadeDias }}</td>
                <td>
                  <span [class]="diasRestantes(ft) <= 3 ? 'badge-alert' : 'badge-ok'">
                    {{ diasRestantes(ft) }} dias
                  </span>
                </td>
                <td>{{ ft.observacao || '—' }}</td>
                <td><button class="btn-icon danger" (click)="removerFreeTime(ft.id)">🗑️</button></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagamentos -->
        <div class="content-section">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <h4 style="margin:0;font-size:13px;font-weight:700">Pagamentos</h4>
            <button class="btn btn-secondary" style="font-size:12px" (click)="pgForm=emptyPgForm();showPgForm=true">+ Adicionar</button>
          </div>

          <!-- Form inline -->
          <div *ngIf="showPgForm" style="border:1.5px solid var(--color-border);border-radius:8px;padding:12px;margin-bottom:12px">
            <div class="form-grid">
              <div class="field">
                <label>Tipo <span class="required">*</span></label>
                <select [(ngModel)]="pgForm.tipoPagamento">
                  <option value="">— Selecione —</option>
                  <option *ngFor="let t of tiposPagamento" [value]="t.value">{{ t.label }}</option>
                </select>
              </div>
              <div class="field">
                <label>Despachante</label>
                <select [(ngModel)]="pgForm.despachanteId">
                  <option value="">— Selecione —</option>
                  <option *ngFor="let d of despachantes" [value]="d.id">{{ d.nome }}</option>
                </select>
              </div>
              <div class="field">
                <label>Valor (R$) <span class="required">*</span></label>
                <input type="number" [(ngModel)]="pgForm.valor" min="0" step="0.01" />
              </div>
              <div class="field">
                <label>Data Prevista <span class="required">*</span></label>
                <input type="date" [(ngModel)]="pgForm.dataPrevista" />
              </div>
              <div class="field w2">
                <label>Observação</label>
                <input type="text" [(ngModel)]="pgForm.observacao" />
              </div>
            </div>
            <p class="err-msg" *ngIf="pgErro">{{ pgErro }}</p>
            <div class="actions">
              <button class="btn btn-primary" (click)="salvarPagamento()">Salvar</button>
              <button class="btn btn-secondary" (click)="showPgForm=false">Cancelar</button>
            </div>
          </div>

          <!-- Resumo financeiro -->
          <div *ngIf="pagamentos.length > 0" style="display:flex;gap:16px;margin-bottom:12px;flex-wrap:wrap">
            <div style="font-size:13px"><strong>Total:</strong> {{ totalPagamentos() | currency:'BRL':'symbol':'1.2-2' }}</div>
            <div style="font-size:13px"><strong>Pago:</strong> <span style="color:#16a34a">{{ totalPagos() | currency:'BRL':'symbol':'1.2-2' }}</span></div>
            <div style="font-size:13px"><strong>Pendente:</strong> <span style="color:#dc2626">{{ totalPendentes() | currency:'BRL':'symbol':'1.2-2' }}</span></div>
          </div>

          <p *ngIf="pagamentos.length === 0 && !showPgForm" style="font-size:13px;color:var(--color-text-muted)">Nenhum pagamento cadastrado.</p>
          <table class="data-table" *ngIf="pagamentos.length > 0" style="font-size:12px">
            <thead><tr><th>Tipo</th><th>Despachante</th><th>Prev.</th><th>Pgto</th><th style="text-align:right">Valor</th><th>Status</th><th style="width:90px"></th></tr></thead>
            <tbody>
              <tr *ngFor="let p of pagamentos">
                <td>{{ labelTipoPagamento(p.tipoPagamento) }}</td>
                <td>{{ nome('despachante', p.despachanteId) }}</td>
                <td>{{ p.dataPrevista | date:'dd/MM/yy' }}</td>
                <td>{{ p.dataPagamento ? (p.dataPagamento | date:'dd/MM/yy') : '—' }}</td>
                <td style="text-align:right">{{ p.valor | currency:'BRL':'symbol':'1.2-2' }}</td>
                <td>
                  <span *ngIf="p.dataPagamento" class="pgto-pago">✓ Pago</span>
                  <span *ngIf="!p.dataPagamento && isVencido(p.dataPrevista)" class="pgto-venc">⚠ Vencido</span>
                  <span *ngIf="!p.dataPagamento && !isVencido(p.dataPrevista)" class="pgto-pend">Pendente</span>
                </td>
                <td>
                  <div class="row-actions">
                    <button class="btn-icon" title="Efetivar pagamento" (click)="efetivarPagamento(p)" *ngIf="!p.dataPagamento">💳</button>
                    <button class="btn-icon danger" title="Excluir" (click)="removerPagamento(p.id)">🗑️</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Histórico de Status -->
        <div class="content-section">
          <h4 style="margin:0 0 12px;font-size:13px;font-weight:700">Histórico de Status</h4>
          <p *ngIf="historico.length === 0" style="font-size:13px;color:var(--color-text-muted)">Sem histórico de alterações.</p>
          <ul class="hist-feed">
            <li class="hist-item" *ngFor="let h of historico">
              <div style="display:flex;justify-content:space-between;align-items:flex-start">
                <span class="badge" [style.background]="statusColorById(h.statusEmbarqueId)">{{ statusNome(h.statusEmbarqueId) }}</span>
                <span class="hist-date">{{ h.dataStatus | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
              <div *ngIf="h.observacao" style="margin-top:4px;font-size:12px;color:var(--color-text-muted)">{{ h.observacao }}</div>
              <div style="font-size:11px;color:var(--color-text-muted);margin-top:2px">por {{ h.usuarioId }}</div>
            </li>
          </ul>
        </div>

        <!-- ── VÍNCULO NAVIO / PERNA ── -->
        <app-embarque-navio-vinculo-form [embarqueId]="vinculoEmbarqueId(detail)"></app-embarque-navio-vinculo-form>

      </ng-container>

      <!-- ── MODAL ALTERAR STATUS ── -->
      <div class="modal-overlay" *ngIf="showModalStatus" (click)="fecharModalStatus()">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <h3>🔄 Alterar Status</h3>
          <div class="field" style="margin-bottom:12px">
            <label style="font-size:12px;margin-bottom:4px;display:block">Novo Status</label>
            <select [(ngModel)]="novoStatusId" style="width:100%;padding:8px;border:1.5px solid var(--color-border);border-radius:6px;font-size:13px">
              <option value="">— Selecione —</option>
              <option *ngFor="let s of statusList" [value]="s.id">{{ s.nome }}</option>
            </select>
          </div>
          <div class="field" style="margin-bottom:16px">
            <label style="font-size:12px;margin-bottom:4px;display:block">Observação</label>
            <input type="text" [(ngModel)]="obsStatus" placeholder="Opcional"
              style="width:100%;padding:8px;border:1.5px solid var(--color-border);border-radius:6px;font-size:13px;box-sizing:border-box" />
          </div>
          <p class="err-msg" *ngIf="statusErr">{{ statusErr }}</p>
          <div class="actions">
            <button class="btn btn-primary" (click)="confirmarStatus()">Confirmar</button>
            <button class="btn btn-secondary" (click)="fecharModalStatus()">Cancelar</button>
          </div>
        </div>
      </div>

      <!-- ── MODAL EFETIVAR PAGAMENTO ── -->
      <div class="modal-overlay" *ngIf="showModalPgto" (click)="fecharModalPgto()">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <h3>💳 Efetivar Pagamento</h3>
          <div class="field" style="margin-bottom:16px">
            <label style="font-size:12px;margin-bottom:4px;display:block">Data do Pagamento</label>
            <input type="date" [(ngModel)]="dataPgtoModal"
              style="width:100%;padding:8px;border:1.5px solid var(--color-border);border-radius:6px;font-size:13px;box-sizing:border-box" />
          </div>
          <p class="err-msg" *ngIf="pgtoErr">{{ pgtoErr }}</p>
          <div class="actions">
            <button class="btn btn-primary" (click)="confirmarEfetivacao()">Confirmar</button>
            <button class="btn btn-secondary" (click)="fecharModalPgto()">Cancelar</button>
          </div>
        </div>
      </div>

    </div>
  `
})
export class EmbarqueAduanaComponent implements OnInit, OnDestroy {

  private _subs = new Subscription();

  isDespachante = false;

  // ── State ─────────────────────────────────────────────────────────────
  mode: Mode = 'list';
  detail: EmbarqueAduana | null = null;
  editing: EmbarqueAduana | null = null;
  editMode = false;
  showErr = false;
  apiFieldErrors: Record<string, string[]> = {};

  // ── List filters ──────────────────────────────────────────────────────
  qGeral = '';
  qStatus = '';
  qCliente = '';

  // ── Data ──────────────────────────────────────────────────────────────
  embarques: EmbarqueAduana[] = [];
  statusList: StatusEmbarque[] = [];
  clientes:     { id: string; razaoSocial: string }[] = [];
  despachantes: { id: string; nome: string }[] = [];
  portosOrigem: { id: string; nome: string }[] = [];
  portosDestino:{ id: string; nome: string }[] = [];
  agentesCarga: { id: string; nome: string }[] = [];
  exportadores: { id: string; nome: string }[] = [];
  navios:       { id: string; nomeNavio: string; numeroViagem: string }[] = [];
  custos:       { id: string; codigoInterno: string }[] = [];
  orcamentos:   { id: string; codigoInterno: string }[] = [];

  // Lookup maps para display rápido
  private _lkp: Record<string, string> = {};

  // ── Form embarque ─────────────────────────────────────────────────────
  form = this.emptyForm();

  // ── Free Time ─────────────────────────────────────────────────────────
  freeTimes: FreeTimeEmbarque[] = [];
  showFtForm = false;
  ftErro = '';
  ftForm: Omit<FreeTimeEmbarque, 'id' | 'dataFim'> = { embarqueAduanaId: '', quantidadeDias: 14, dataInicio: '' };

  // ── Pagamentos ────────────────────────────────────────────────────────
  pagamentos: PagamentoProcesso[] = [];
  showPgForm = false;
  pgErro = '';
  pgForm: Omit<PagamentoProcesso, 'id'> = this.emptyPgForm();
  showModalPgto = false;
  dataPgtoModal = '';
  pgtoErr = '';
  private pgtoTarget: PagamentoProcesso | null = null;

  // ── Historico ─────────────────────────────────────────────────────────
  historico: HistoricoStatusEmbarque[] = [];

  // ── Modal Status ──────────────────────────────────────────────────────
  showModalStatus = false;
  novoStatusId = '';
  obsStatus = '';
  statusErr = '';

  readonly tiposPagamento: { value: TipoPagamento; label: string }[] =
    (Object.keys(TIPO_PAGAMENTO_LABELS) as TipoPagamento[]).map(k => ({
      value: k, label: TIPO_PAGAMENTO_LABELS[k]
    }));

  constructor(
    private svc: EmbarqueAduanaService,
    private statusSvc: StatusEmbarqueService,
    private clienteSvc: ClienteV2Service,
    private despachanteSvc: DespachanteV2Service,
    private portoOrigemSvc: PortoOrigemService,
    private portoDestinoSvc: PortoDestinoService,
    private agentesSvc: AgenteCargaService,
    private exportadorSvc: ExportadorService,
    private navioSvc: ControleNavioService,
    private custoSvc: CustoDespachanteService,
    private orcSvc: OrcamentoVendaService,
    private auth: AuthService,
    private solicitacaoSvc: SolicitacaoOrcamentoService,
    private route: ActivatedRoute,
    private toast: ToastService,
    private confirmDialog: ConfirmDialogService,) {}

  ngOnInit(): void {
    this.isDespachante = this.auth.hasRole('despachante');
    this.statusList   = this.statusSvc.getAll();
    this.clientes     = this.clienteSvc.getAtivos();
    this.despachantes = this.despachanteSvc.getAtivos();
    this.portosOrigem = this.portoOrigemSvc.getAtivos();
    this.portosDestino= this.portoDestinoSvc.getAtivos();
    this.agentesCarga = this.agentesSvc.getAtivos();
    this.exportadores = this.exportadorSvc.getAtivos();
    this.navios       = this.navioSvc.getAll();
    this.custos       = this.custoSvc.getAll();
    this.orcamentos   = this.orcSvc.getAll();

    // Build lookup map
    [...this.clientes].forEach(c => this._lkp[c.id] = (c as any).razaoSocial);
    [...this.despachantes].forEach(d => this._lkp[d.id] = d.nome);
    [...this.portosOrigem, ...this.portosDestino].forEach(p => this._lkp[p.id] = p.nome);
    [...this.agentesCarga].forEach(a => this._lkp[a.id] = a.nome);
    [...this.exportadores].forEach(e => this._lkp[e.id] = e.nome);
    [...this.navios].forEach(n => this._lkp[n.id] = `${n.nomeNavio} — ${n.numeroViagem}`);
    [...this.custos].forEach(c => this._lkp[c.id] = c.codigoInterno);
    [...this.orcamentos].forEach(o => this._lkp[o.id] = o.codigoInterno);
    this.statusList.forEach(s => this._lkp[s.id] = s.nome);

    // Subscribe to navios$ so lookup stays fresh after async API load
    this._subs.add(
      this.navioSvc.navios$.subscribe(navios => {
        this.navios = navios;
        navios.forEach(n => this._lkp[n.id] = `${n.nomeNavio} — ${n.numeroViagem}`);
      })
    );

    this.navioSvc.reload();

    this.load();

    this.route.queryParams.subscribe(params => {
      if (params['acompanhamento'] === '1') this.mode = 'acompanhamento';
    });
  }

  load(): void { this.embarques = this.svc.getAll(); }

  ngOnDestroy(): void { this._subs.unsubscribe(); }

  // ── Filtered list ─────────────────────────────────────────────────────

  get filtered(): EmbarqueAduana[] {
    return this.embarques.filter(e => {
      if (this.qStatus && e.statusEmbarqueId !== this.qStatus) return false;
      if (this.qCliente && e.clienteId !== this.qCliente) return false;
      if (this.qGeral) {
        const s = this.qGeral.toLowerCase();
        return e.codigoInterno.toLowerCase().includes(s) ||
          (e.refOminium || '').toLowerCase().includes(s) ||
          (e.bl || '').toLowerCase().includes(s) ||
          (e.container || '').toLowerCase().includes(s);
      }
      return true;
    });
  }

  // ── Lookup helpers ────────────────────────────────────────────────────

  nome(tipo: string, id?: string): string {
    if (!id) return '—';
    return this._lkp[id] ?? id;
  }

  vinculoEmbarqueId(embarque: EmbarqueAduana): string {
    // O backend de vínculo usa o ID numérico da solicitação/origem operacional.
    // Quando existir, priorizamos esse ID para garantir integração correta.
    if (embarque.solicitacaoOrcamentoId) {
      return embarque.solicitacaoOrcamentoId;
    }

    // Fallback para dados legados locais: EMB-AAAA-NNN -> NNN
    const match = /^EMB-\d{4}-(\d+)$/i.exec(embarque.codigoInterno || '');
    if (match) {
      return String(Number(match[1]));
    }

    return embarque.id;
  }
  nomeCusto(id: string): string { return this._lkp[id] ?? id; }
  nomeOrc(id: string): string   { return this._lkp[id] ?? id; }

  statusNome(id: string): string {
    return this.statusSvc.getById(id)?.nome ?? id;
  }
  statusOrdem(id: string): number {
    return this.statusSvc.getById(id)?.ordem ?? 0;
  }
  statusColor(id: string): string {
    const ordem = this.statusOrdem(id);
    const colors = ['#94a3b8','#3b82f6','#f59e0b','#8b5cf6','#06b6d4','#10b981','#64748b'];
    return colors[(ordem - 1) % colors.length] ?? '#94a3b8';
  }
  statusColorById(id: string): string { return this.statusColor(id); }

  labelTipoPagamento(t: TipoPagamento): string { return TIPO_PAGAMENTO_LABELS[t] ?? t; }

  // ── Form ──────────────────────────────────────────────────────────────

  openForm(item?: EmbarqueAduana): void {
    this.editing = item ?? null;
    this.showErr = false;
    this.apiFieldErrors = {};
    if (item) {
      this.form = {
        clienteId:             item.clienteId,
        despachanteId:         item.despachanteId,
        portoOrigemId:         item.portoOrigemId,
        portoDestinoId:        item.portoDestinoId,
        agenteCargaId:         item.agenteCargaId,
        exportadorId:          item.exportadorId ?? '',
        controleNavioId:       item.controleNavioId,
        custoDespachanteId:    item.custoDespachanteId ?? '',
        orcamentoVendaId:      item.orcamentoVendaId ?? '',
        usuarioResponsavelId:  item.usuarioResponsavelId,
        refOminium:            item.refOminium,
        imp:                   item.imp,
        bl:                    item.bl,
        container:             item.container,
        li:                    item.li,
        registro:              item.registro ?? '',
        refAg:                 item.refAg ?? '',
        kg:                    item.kg,
        etd:                   item.etd,
        eta:                   item.eta,
        avisoPrevisao:         item.avisoPrevisao ?? '',
        avisoChegada:          item.avisoChegada ?? '',
        dataRegistro:          item.dataRegistro ?? '',
        desemb:                item.desemb ?? '',
        entrega:               item.entrega ?? '',
        observacao:            item.observacao ?? '',
      };
    } else {
      this.form = this.emptyForm();
    }
    this.mode = 'form';
  }

  cancelForm(): void {
    if (this.detail) { this.mode = 'detail'; }
    else { this.mode = 'list'; }
    this.editing = null;
    this.apiFieldErrors = {};
  }

  salvar(): void {
    this.showErr = true;
    this.apiFieldErrors = {};
    const { clienteId, despachanteId, portoOrigemId, portoDestinoId, etd, eta } = this.form;
    if (!clienteId || !despachanteId || !portoOrigemId || !portoDestinoId || !etd || !eta) return;

    const statusInicial = this.statusSvc.getPrevisto();

    const data: Omit<EmbarqueAduana, 'id' | 'codigoInterno'> = {
      clienteId, despachanteId, portoOrigemId, portoDestinoId,
      agenteCargaId:        this.form.agenteCargaId,
      exportadorId:         this.form.exportadorId || undefined,
      controleNavioId:      this.form.controleNavioId,
      custoDespachanteId:   this.form.custoDespachanteId || undefined,
      orcamentoVendaId:     this.form.orcamentoVendaId || undefined,
      usuarioResponsavelId: this.form.usuarioResponsavelId || (this.auth.currentUser?.username ?? ''),
      statusEmbarqueId:     this.editing?.statusEmbarqueId ?? statusInicial?.id ?? '',
      refOminium:           this.form.refOminium,
      imp:                  this.form.imp,
      bl:                   this.form.bl,
      container:            this.form.container,
      li:                   this.form.li,
      registro:             this.form.registro || undefined,
      refAg:                this.form.refAg || undefined,
      kg:                   this.form.kg || 0,
      etd, eta,
      avisoPrevisao:        this.form.avisoPrevisao || undefined,
      avisoChegada:         this.form.avisoChegada || undefined,
      dataRegistro:         this.form.dataRegistro || undefined,
      desemb:               this.form.desemb || undefined,
      entrega:              this.form.entrega || undefined,
      observacao:           this.form.observacao || undefined,
    };

    try {
      if (this.editing) {
        this.svc.update({ ...this.editing, ...data });
        this.detail = this.svc.getById(this.editing.id) ?? null;
        this.mode = 'detail';
        this.toast.success('Embarque atualizado com sucesso.');
      } else {
        const created = this.svc.create(data);
        if (statusInicial) {
          this.svc.alterarStatus(created.id, created.statusEmbarqueId,
            this.auth.currentUser?.username ?? '', 'Embarque criado');
        }
        this.detail = this.svc.getById(created.id) ?? null;
        this.mode = 'detail';
        this.toast.success('Embarque criado com sucesso.');
      }
    } catch (err: any) {
      this.apiFieldErrors = this.collectFieldErrors(err);
      if (!Object.keys(this.apiFieldErrors).length) {
        this.toast.error(err?.message ?? 'Erro ao salvar embarque.');
      }
      return;
    }
    this.editing = null;
    this.load();
    this.loadDetail();
  }

  abrirDetalhePorId(id: string): void {
    const e = this.svc.getById(id);
    if (e) { this.detail = e; this.mode = 'detail'; }
  }

  async remove(id: string): Promise<void> {
    const ok = await this.confirmDialog.confirm({
      title: 'Excluir embarque',
      message: 'Excluir este embarque e todos os dados relacionados?',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      danger: true
    });
    if (!ok) return;

    this.svc.remove(id);
    this.load();
    if (this.detail?.id === id) { this.detail = null; this.mode = 'list'; }
    this.toast.success('Embarque removido com sucesso.');
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

  // ── Detail ────────────────────────────────────────────────────────────

  openDetail(e: EmbarqueAduana): void {
    this.detail = e;
    this.editMode = false;
    this.showFtForm = false;
    this.showPgForm = false;
    this.mode = 'detail';
    this.loadDetail();
  }

  loadDetail(): void {
    if (!this.detail) return;
    this.freeTimes = this.svc.getFreeTimes(this.detail.id);
    this.pagamentos = this.svc.getPagamentos(this.detail.id);
    this.historico  = this.svc.getHistorico(this.detail.id);
  }

  // ── Inline Edit ───────────────────────────────────────────────────────

  startEdit(): void {
    if (!this.detail) return;
    this.form = {
      clienteId:             this.detail.clienteId,
      despachanteId:         this.detail.despachanteId,
      portoOrigemId:         this.detail.portoOrigemId,
      portoDestinoId:        this.detail.portoDestinoId,
      agenteCargaId:         this.detail.agenteCargaId,
      exportadorId:          this.detail.exportadorId ?? '',
      controleNavioId:       this.detail.controleNavioId,
      custoDespachanteId:    this.detail.custoDespachanteId ?? '',
      orcamentoVendaId:      this.detail.orcamentoVendaId ?? '',
      usuarioResponsavelId:  this.detail.usuarioResponsavelId,
      refOminium:            this.detail.refOminium,
      imp:                   this.detail.imp,
      bl:                    this.detail.bl,
      container:             this.detail.container,
      li:                    this.detail.li,
      registro:              this.detail.registro ?? '',
      refAg:                 this.detail.refAg ?? '',
      kg:                    this.detail.kg,
      etd:                   this.detail.etd,
      eta:                   this.detail.eta,
      avisoPrevisao:         this.detail.avisoPrevisao ?? '',
      avisoChegada:          this.detail.avisoChegada ?? '',
      dataRegistro:          this.detail.dataRegistro ?? '',
      desemb:                this.detail.desemb ?? '',
      entrega:               this.detail.entrega ?? '',
      observacao:            this.detail.observacao ?? '',
    };
    this.editMode = true;
  }

  saveEdit(): void {
    if (!this.detail) return;
    const { clienteId, despachanteId, portoOrigemId, portoDestinoId, etd, eta } = this.form;
    if (!clienteId || !despachanteId || !portoOrigemId || !portoDestinoId || !etd || !eta) {
      this.toast.error('Cliente, Despachante, Portos, ETD e ETA sao obrigatorios.');
      return;
    }
    const updated: EmbarqueAduana = {
      ...this.detail,
      clienteId, despachanteId, portoOrigemId, portoDestinoId,
      agenteCargaId:        this.form.agenteCargaId,
      exportadorId:         this.form.exportadorId || undefined,
      controleNavioId:      this.form.controleNavioId,
      custoDespachanteId:   this.form.custoDespachanteId || undefined,
      orcamentoVendaId:     this.form.orcamentoVendaId || undefined,
      usuarioResponsavelId: this.form.usuarioResponsavelId || (this.auth.currentUser?.username ?? ''),
      refOminium:           this.form.refOminium,
      imp:                  this.form.imp,
      bl:                   this.form.bl,
      container:            this.form.container,
      li:                   this.form.li,
      registro:             this.form.registro || undefined,
      refAg:                this.form.refAg || undefined,
      kg:                   this.form.kg || 0,
      etd, eta,
      avisoPrevisao:        this.form.avisoPrevisao || undefined,
      avisoChegada:         this.form.avisoChegada || undefined,
      dataRegistro:         this.form.dataRegistro || undefined,
      desemb:               this.form.desemb || undefined,
      entrega:              this.form.entrega || undefined,
      observacao:           this.form.observacao || undefined,
    };
    this.svc.update(updated);
    // Registra no histórico
    const hist: HistoricoStatusEmbarque = {
      id: generateV2Id(),
      embarqueAduanaId: this.detail.id,
      statusEmbarqueId: this.detail.statusEmbarqueId,
      dataStatus: new Date().toISOString(),
      observacao: 'Dados atualizados',
      usuarioId: this.auth.currentUser?.username ?? 'sistema',
    };
    this.svc.addHistoricoEdicao(hist);
    this.detail = this.svc.getById(this.detail.id) ?? null;
    this.editMode = false;
    this.load();
    this.loadDetail();
    this.toast.success('Dados do embarque atualizados com sucesso.');
  }

  // ── Status ────────────────────────────────────────────────────────────

  abrirModalStatus(): void {
    this.novoStatusId = this.detail?.statusEmbarqueId ?? '';
    this.obsStatus    = '';
    this.statusErr    = '';
    this.showModalStatus = true;
  }

  irParaStep(statusId: string): void {
    this.novoStatusId = statusId;
    this.obsStatus    = '';
    this.statusErr    = '';
    this.showModalStatus = true;
  }

  fecharModalStatus(): void { this.showModalStatus = false; }

  confirmarStatus(): void {
    if (!this.novoStatusId) { this.statusErr = 'Selecione um status'; return; }
    if (!this.detail) return;
    this.svc.alterarStatus(
      this.detail.id, this.novoStatusId,
      this.auth.currentUser?.username ?? '', this.obsStatus || undefined
    );
    const solicitacaoId = this.detail.solicitacaoOrcamentoId;
    const statusEmbarqueId = this.novoStatusId;
    this.detail = this.svc.getById(this.detail.id) ?? null;
    this.fecharModalStatus();
    this.load();
    this.loadDetail();
    if (solicitacaoId) {
      const nomeStatus = this.statusSvc.getById(statusEmbarqueId)?.nome ?? '';
      const novoStatusSol = ('Embarque' + nomeStatus) as StatusSolicitacao;
      const sol = this.solicitacaoSvc.getById(solicitacaoId);
      if (sol) {
        this.solicitacaoSvc.update({ ...sol, status: novoStatusSol });
      }
    }
    this.toast.success('Status do embarque atualizado com sucesso.');
  }

  // ── Free Time ─────────────────────────────────────────────────────────

  salvarFreeTime(): void {
    if (!this.ftForm.dataInicio) { this.ftErro = 'Data início é obrigatória'; return; }
    if (!this.ftForm.quantidadeDias || this.ftForm.quantidadeDias < 1) { this.ftErro = 'Qtd. dias inválida'; return; }
    this.ftErro = '';
    this.svc.addFreeTime({ ...this.ftForm, embarqueAduanaId: this.detail!.id });
    this.showFtForm = false;
    this.loadDetail();
    this.toast.success('Free time salvo com sucesso.');
  }

  async removerFreeTime(id: string): Promise<void> {
    const ok = await this.confirmDialog.confirm({
      title: 'Remover free time',
      message: 'Deseja remover este free time?',
      confirmText: 'Remover',
      cancelText: 'Cancelar',
      danger: true
    });
    if (!ok) return;

    this.svc.removeFreeTime(id);
    this.loadDetail();
    this.toast.success('Free time removido com sucesso.');
  }

  diasRestantes(ft: FreeTimeEmbarque): number {
    return this.svc.diasRestantesFreeTime(ft);
  }

  // ── Pagamentos ────────────────────────────────────────────────────────

  salvarPagamento(): void {
    if (!this.pgForm.tipoPagamento) { this.pgErro = 'Tipo é obrigatório'; return; }
    if (!this.pgForm.valor || this.pgForm.valor <= 0) { this.pgErro = 'Valor inválido'; return; }
    if (!this.pgForm.dataPrevista) { this.pgErro = 'Data prevista é obrigatória'; return; }
    this.pgErro = '';
    this.svc.addPagamento({ ...this.pgForm, embarqueAduanaId: this.detail!.id });
    this.showPgForm = false;
    this.loadDetail();
    this.toast.success('Pagamento adicionado com sucesso.');
  }

  async removerPagamento(id: string): Promise<void> {
    const ok = await this.confirmDialog.confirm({
      title: 'Excluir pagamento',
      message: 'Deseja excluir este pagamento?',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      danger: true
    });
    if (!ok) return;

    this.svc.removePagamento(id);
    this.loadDetail();
    this.toast.success('Pagamento removido com sucesso.');
  }

  efetivarPagamento(p: PagamentoProcesso): void {
    this.pgtoTarget  = p;
    this.dataPgtoModal = new Date().toISOString().split('T')[0];
    this.pgtoErr     = '';
    this.showModalPgto = true;
  }

  fecharModalPgto(): void { this.showModalPgto = false; this.pgtoTarget = null; }

  confirmarEfetivacao(): void {
    if (!this.dataPgtoModal) { this.pgtoErr = 'Informe a data'; return; }
    if (!this.pgtoTarget) return;
    this.svc.efetivarPagamento(this.pgtoTarget.id, this.dataPgtoModal);
    this.fecharModalPgto();
    this.loadDetail();
    this.toast.success('Pagamento efetivado com sucesso.');
  }

  totalPagamentos(): number { return this.pagamentos.reduce((a, p) => a + p.valor, 0); }
  totalPagos(): number      { return this.pagamentos.filter(p => p.dataPagamento).reduce((a, p) => a + p.valor, 0); }
  totalPendentes(): number  { return this.pagamentos.filter(p => !p.dataPagamento).reduce((a, p) => a + p.valor, 0); }

  isVencido(data: string): boolean {
    return new Date(data).getTime() < new Date().setHours(0,0,0,0);
  }

  // ── Helpers ───────────────────────────────────────────────────────────

  private emptyForm() {
    return {
      clienteId: '', despachanteId: '', portoOrigemId: '', portoDestinoId: '',
      agenteCargaId: '', exportadorId: '', controleNavioId: '',
      custoDespachanteId: '', orcamentoVendaId: '', usuarioResponsavelId: '',
      refOminium: '', imp: '', bl: '', container: '', li: '',
      registro: '', refAg: '', kg: 0,
      etd: '', eta: '', avisoPrevisao: '', avisoChegada: '',
      dataRegistro: '', desemb: '', entrega: '', observacao: '',
    };
  }

  emptyPgForm(): Omit<PagamentoProcesso, 'id'> {
    return {
      embarqueAduanaId: '', tipoPagamento: '' as TipoPagamento,
      dataPrevista: '', dataPagamento: undefined, valor: 0,
      despachanteId: '', observacao: '',
    };
  }
}
