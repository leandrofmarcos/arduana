import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CRUD_STYLES } from '../../../shared/styles/crud-page.styles';
import { EmbarqueAduanaService }   from '../services/embarque-aduana.service';
import { StatusEmbarqueService }   from '../services/status-embarque.service';
import { ClienteV2Service }        from '../../cadastros/clientes/services/cliente-v2.service';
import { DespachanteV2Service }    from '../../cadastros/despachantes/services/despachante-v2.service';
import { PortoOrigemService }      from '../../cadastros/portos-origem/services/porto-origem.service';
import { PortoDestinoService }     from '../../cadastros/portos-destino/services/porto-destino.service';
import { AgenteCargaService }      from '../../cadastros/agentes-carga/services/agente-carga.service';
import { ExportadorService }       from '../../cadastros/exportadores/services/exportador.service';
import { ControleNavioService }    from '../../logistica/controle-navios/services/controle-navio.service';
import { SolicitacaoOrcamentoService } from '../../solicitacao-orcamento/services/solicitacao-orcamento.service';
import { EmbarqueAduana } from '../models/embarque-aduana.models';

export interface AcompanhamentoRow {
  embarqueId:              string;
  codigoInterno:           string;
  refOminium:              string;
  portoOrigem:             string;
  portoDestino:            string;
  portoDestinoId:          string;
  agente:                  string;
  cliente:                 string;
  clienteId:               string;
  comercial:               string;
  etd:                     string;
  eta:                     string;
  avisoPrevisao:           string;
  avisoChegada:            string;
  cobrancaSinal:           string;
  sinalPago:               string;
  pQualDespachanteData:    string;
  fechamentoPago:          string;
  cobrancaSinalVencida:    boolean;
  sinalPagoEfetivado:      boolean;
  fechamentoPagoEfetivado: boolean;
  imp:                     string;
  packlist:                string;
  bl:                      string;
  container:               string;
  li:                      string;
  registro:                string;
  dataRegistro:            string;
  desemb:                  string;
  entrega:                 string;
  refAg:                   string;
  kg:                      number;
  navio:                   string;
  statusId:                string;
  statusNome:              string;
  statusOrdem:             number;
  despachante:             string;
  despachanteId:           string;
  exportador:              string;
  freeTimeDiasRestantes:   number | null;
  freeTimeAlerta:          boolean;
  etaAtrasada:             boolean;
  etaCritica:              boolean;
}

type Painel = 'aguardando' | 'atracados' | 'registrados';

@Component({
  selector: 'app-embarque-acompanhamento',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, DecimalPipe],
  styles: [
    ...CRUD_STYLES,
    `
    /* Layout */
    .painel { margin-bottom:0; }
    .painel-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 16px; border-radius: 8px 8px 0 0; cursor: pointer;
      user-select: none;
    }
    .painel-header h3 { margin:0; font-size:13px; font-weight:700; letter-spacing:.05em; color:#fff; }
    .painel-header .count { font-size:12px; background:rgba(255,255,255,.25); padding:2px 10px; border-radius:10px; color:#fff; font-weight:600; }
    .ph-aguardando  { background: #d97706; }
    .ph-atracados   { background: #2563eb; }
    .ph-registrados { background: #059669; }
    .painel-body { border:1.5px solid var(--color-border); border-top:none; border-radius:0 0 8px 8px; overflow:hidden; margin-bottom:20px; }
    /* Tabela */
    .ac-table { width:100%; border-collapse:collapse; font-size:11.5px; }
    .ac-table thead th {
      background: var(--color-bg); padding:7px 8px; text-align:left;
      font-size:10px; text-transform:uppercase; letter-spacing:.05em;
      color:var(--color-text-muted); border-bottom:1.5px solid var(--color-border);
      white-space:nowrap; position:sticky; top:0; z-index:1;
    }
    .ac-table tbody tr { cursor:pointer; border-bottom:1px solid var(--color-border); transition:background .1s; }
    .ac-table tbody tr:hover { background: var(--color-bg); }
    .ac-table td { padding:6px 8px; white-space:nowrap; vertical-align:middle; }
    .ac-table td.wrap { white-space:normal; min-width:120px; }
    /* Linha vazia */
    .ac-empty { text-align:center; padding:24px; color:var(--color-text-muted); font-size:13px; }
    /* Badges status */
    .sb { display:inline-block; padding:2px 8px; border-radius:10px; font-size:10px; font-weight:700; color:#fff; white-space:nowrap; }
    /* Coloração de linha */
    .row-atrasada { background: #fef9c3 !important; }
    .row-critica  { background: #fee2e2 !important; }
    /* Célula pagamento */
    .cel-venc { background:#fca5a5; border-radius:4px; padding:1px 5px; font-size:10px; font-weight:600; color:#7f1d1d; }
    .cel-pago { color:#16a34a; font-weight:700; }
    .cel-pend { color:var(--color-text-muted); font-size:10px; }
    /* Free time */
    .ft-alerta { background:#fca5a5; color:#7f1d1d; border-radius:10px; padding:1px 7px; font-size:10px; font-weight:700; }
    .ft-ok     { background:#bbf7d0; color:#14532d; border-radius:10px; padding:1px 7px; font-size:10px; font-weight:700; }
    .ft-none   { color:var(--color-text-muted); font-size:10px; }
    /* Overflow container */
    .table-scroll { overflow-x:auto; }
    /* Filtros */
    .filter-bar { display:flex; flex-wrap:wrap; gap:8px; align-items:flex-end; margin-bottom:16px; }
    .filter-bar input, .filter-bar select {
      padding:7px 10px; border:1.5px solid var(--color-border); border-radius:7px;
      font-size:12px; background:var(--color-surface); color:var(--color-text);
    }
    .filter-bar input:focus, .filter-bar select:focus {
      outline:none; border-color:var(--color-primary);
      box-shadow:0 0 0 3px rgba(102,126,234,.12);
    }
    .filter-bar label { font-size:11px; color:var(--color-text-muted); font-weight:600; display:flex; flex-direction:column; gap:3px; }
    .toggle-fin { display:flex; align-items:center; gap:6px; font-size:12px; padding-bottom:2px; }
    .toggle-fin input[type=checkbox] { width:14px; height:14px; }
    `
  ],
  template: `
    <div class="container-standard">

      <!-- Header -->
      <div class="dashboard-header">
        <div>
          <h1>🗂️ Acompanhamento de Embarques</h1>
          <p class="subtitle">Visão consolidada por fase operacional</p>
        </div>
        <button class="btn btn-secondary" (click)="fechar.emit()">← Voltar</button>
      </div>

      <!-- Filtros -->
      <div class="content-section">
        <div class="filter-bar">
          <label>
            Busca
            <input type="text" [(ngModel)]="fBusca" (ngModelChange)="_recomputar()" placeholder="Ref, BL, Container, Cliente..." style="min-width:220px" />
          </label>
          <label>
            Cliente
            <select [(ngModel)]="fCliente" (ngModelChange)="_recomputar()" style="min-width:160px">
              <option value="">Todos</option>
              <option *ngFor="let c of clientes" [value]="c.id">{{ c.razaoSocial }}</option>
            </select>
          </label>
          <label>
            Despachante
            <select [(ngModel)]="fDespachante" (ngModelChange)="_recomputar()" style="min-width:140px">
              <option value="">Todos</option>
              <option *ngFor="let d of despachantes" [value]="d.id">{{ d.nome }}</option>
            </select>
          </label>
          <label>
            Porto Destino
            <select [(ngModel)]="fPortoDestino" (ngModelChange)="_recomputar()" style="min-width:130px">
              <option value="">Todos</option>
              <option *ngFor="let p of portosDestino" [value]="p.id">{{ p.nome }}</option>
            </select>
          </label>
          <label>
            Mês/Ano ETA
            <input type="month" [(ngModel)]="fMesEta" (ngModelChange)="_recomputar()" style="min-width:130px" />
          </label>
          <label class="toggle-fin">
            <input type="checkbox" [(ngModel)]="fMostrarFinalizados" (ngModelChange)="_recomputar()" />
            Mostrar Finalizados
          </label>
          <button class="btn btn-secondary" style="font-size:12px" (click)="limparFiltros()">✕ Limpar</button>
        </div>
      </div>

      <!-- ── PAINEL: AGUARDANDO ── -->
      <div class="painel">
        <div class="painel-header ph-aguardando" (click)="togglePainel('aguardando')">
          <h3>⏳ AGUARDANDO — Previsto / Aguardando</h3>
          <span class="count">{{ _aguardandoRows.length }} processo(s)</span>
        </div>
        <div class="painel-body" *ngIf="painelAberto.aguardando">
          <div class="ac-empty" *ngIf="_aguardandoRows.length === 0">Nenhum embarque aguardando com os filtros aplicados.</div>
          <div class="table-scroll" *ngIf="_aguardandoRows.length > 0">
            <table class="ac-table">
              <thead>
                <tr>
                  <th>REF OMINIUM</th>
                  <th>PORTO ORIG.</th>
                  <th>PORTO DEST.</th>
                  <th>AGENTE</th>
                  <th>CLIENTE</th>
                  <th>COMERCIAL</th>
                  <th>ETD</th>
                  <th>ETA</th>
                  <th>AV. PREV.</th>
                  <th>COB. SINAL</th>
                  <th>SINAL PAGO</th>
                  <th>P.QUAL.</th>
                  <th>FECH. PAGO</th>
                  <th>AV. CHEGADA</th>
                  <th>IMP</th>
                  <th>BL</th>
                  <th>CTNR</th>
                  <th>KG</th>
                  <th>NAVIO</th>
                  <th>STATUS</th>
                  <th>DESPACHANTE</th>
                  <th>FREE TIME</th>
                  <th>EXPORTADOR</th>
                  <th>REF AG</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let r of _aguardandoRows"
                  [class.row-critica]="r.etaCritica"
                  [class.row-atrasada]="r.etaAtrasada && !r.etaCritica"
                  (click)="abrirDetalhe.emit(r.embarqueId)">
                  <td><span class="cod-badge">{{ r.refOminium || '—' }}</span></td>
                  <td>{{ r.portoOrigem }}</td>
                  <td>{{ r.portoDestino }}</td>
                  <td>{{ r.agente || '—' }}</td>
                  <td class="wrap">{{ r.cliente }}</td>
                  <td>{{ r.comercial || '—' }}</td>
                  <td>{{ r.etd | date:'dd/MM/yy' }}</td>
                  <td [style.color]="r.etaAtrasada ? '#dc2626' : ''"><strong>{{ r.eta | date:'dd/MM/yy' }}</strong></td>
                  <td>{{ r.avisoPrevisao ? (r.avisoPrevisao | date:'dd/MM/yy') : '—' }}</td>
                  <td><ng-container *ngTemplateOutlet="celPgto; context:{data: r.cobrancaSinal, venc: r.cobrancaSinalVencida, pago: false}"></ng-container></td>
                  <td><ng-container *ngTemplateOutlet="celPgto; context:{data: r.sinalPago, venc: false, pago: r.sinalPagoEfetivado}"></ng-container></td>
                  <td><ng-container *ngTemplateOutlet="celPgto; context:{data: r.pQualDespachanteData, venc: false, pago: false}"></ng-container></td>
                  <td><ng-container *ngTemplateOutlet="celPgto; context:{data: r.fechamentoPago, venc: false, pago: r.fechamentoPagoEfetivado}"></ng-container></td>
                  <td>{{ r.avisoChegada ? (r.avisoChegada | date:'dd/MM/yy') : '—' }}</td>
                  <td>{{ r.imp || '—' }}</td>
                  <td>{{ r.bl || '—' }}</td>
                  <td>{{ r.container || '—' }}</td>
                  <td>{{ r.kg | number:'1.0-0' }}</td>
                  <td>{{ r.navio || '—' }}</td>
                  <td><span class="sb" [style.background]="statusColor(r.statusId)">{{ r.statusNome }}</span></td>
                  <td>{{ r.despachante }}</td>
                  <td><ng-container *ngTemplateOutlet="celFt; context:{row: r}"></ng-container></td>
                  <td>{{ r.exportador || '—' }}</td>
                  <td>{{ r.refAg || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ── PAINEL: ATRACADOS ── -->
      <div class="painel">
        <div class="painel-header ph-atracados" (click)="togglePainel('atracados')">
          <h3>⚓ ATRACADOS — No Porto</h3>
          <span class="count">{{ _atracadosRows.length }} processo(s)</span>
        </div>
        <div class="painel-body" *ngIf="painelAberto.atracados">
          <div class="ac-empty" *ngIf="_atracadosRows.length === 0">Nenhum embarque atracado com os filtros aplicados.</div>
          <div class="table-scroll" *ngIf="_atracadosRows.length > 0">
            <table class="ac-table">
              <thead>
                <tr>
                  <th>REF OMINIUM</th>
                  <th>PORTO ORIG.</th>
                  <th>PORTO DEST.</th>
                  <th>AGENTE</th>
                  <th>CLIENTE</th>
                  <th>COMERCIAL</th>
                  <th>ETD</th>
                  <th>ETA</th>
                  <th>AV. PREV.</th>
                  <th>COB. SINAL</th>
                  <th>SINAL PAGO</th>
                  <th>P.QUAL.</th>
                  <th>FECH. PAGO</th>
                  <th>AV. CHEGADA</th>
                  <th>IMP</th>
                  <th>PACKLIST</th>
                  <th>BL</th>
                  <th>CTNR</th>
                  <th>KG</th>
                  <th>NAVIO</th>
                  <th>STATUS</th>
                  <th>DESPACHANTE</th>
                  <th>LI</th>
                  <th>REGISTRO</th>
                  <th>DT. REG.</th>
                  <th>DESEMB.</th>
                  <th>ENTREGA</th>
                  <th>FREE TIME</th>
                  <th>EXPORTADOR</th>
                  <th>REF AG</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let r of _atracadosRows"
                  [class.row-critica]="r.etaCritica"
                  (click)="abrirDetalhe.emit(r.embarqueId)">
                  <td><span class="cod-badge">{{ r.refOminium || '—' }}</span></td>
                  <td>{{ r.portoOrigem }}</td>
                  <td>{{ r.portoDestino }}</td>
                  <td>{{ r.agente || '—' }}</td>
                  <td class="wrap">{{ r.cliente }}</td>
                  <td>{{ r.comercial || '—' }}</td>
                  <td>{{ r.etd | date:'dd/MM/yy' }}</td>
                  <td [style.color]="r.etaAtrasada ? '#dc2626' : ''"><strong>{{ r.eta | date:'dd/MM/yy' }}</strong></td>
                  <td>{{ r.avisoPrevisao ? (r.avisoPrevisao | date:'dd/MM/yy') : '—' }}</td>
                  <td><ng-container *ngTemplateOutlet="celPgto; context:{data: r.cobrancaSinal, venc: r.cobrancaSinalVencida, pago: false}"></ng-container></td>
                  <td><ng-container *ngTemplateOutlet="celPgto; context:{data: r.sinalPago, venc: false, pago: r.sinalPagoEfetivado}"></ng-container></td>
                  <td><ng-container *ngTemplateOutlet="celPgto; context:{data: r.pQualDespachanteData, venc: false, pago: false}"></ng-container></td>
                  <td><ng-container *ngTemplateOutlet="celPgto; context:{data: r.fechamentoPago, venc: false, pago: r.fechamentoPagoEfetivado}"></ng-container></td>
                  <td>{{ r.avisoChegada ? (r.avisoChegada | date:'dd/MM/yy') : '—' }}</td>
                  <td>{{ r.imp || '—' }}</td>
                  <td>{{ r.packlist ? r.packlist : '—' }}</td>
                  <td>{{ r.bl || '—' }}</td>
                  <td>{{ r.container || '—' }}</td>
                  <td>{{ r.kg | number:'1.0-0' }}</td>
                  <td>{{ r.navio || '—' }}</td>
                  <td><span class="sb" [style.background]="statusColor(r.statusId)">{{ r.statusNome }}</span></td>
                  <td>{{ r.despachante }}</td>
                  <td>{{ r.li || '—' }}</td>
                  <td>{{ r.registro || '—' }}</td>
                  <td>{{ r.dataRegistro ? (r.dataRegistro | date:'dd/MM/yy') : '—' }}</td>
                  <td>{{ r.desemb ? (r.desemb | date:'dd/MM/yy') : '—' }}</td>
                  <td>{{ r.entrega ? (r.entrega | date:'dd/MM/yy') : '—' }}</td>
                  <td><ng-container *ngTemplateOutlet="celFt; context:{row: r}"></ng-container></td>
                  <td>{{ r.exportador || '—' }}</td>
                  <td>{{ r.refAg || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ── PAINEL: REGISTRADOS ── -->
      <div class="painel">
        <div class="painel-header ph-registrados" (click)="togglePainel('registrados')">
          <h3>📋 REGISTRADOS — Despacho / Entrega</h3>
          <span class="count">{{ _registradosRows.length }} processo(s)</span>
        </div>
        <div class="painel-body" *ngIf="painelAberto.registrados">
          <div class="ac-empty" *ngIf="_registradosRows.length === 0">Nenhum embarque registrado com os filtros aplicados.</div>
          <div class="table-scroll" *ngIf="_registradosRows.length > 0">
            <table class="ac-table">
              <thead>
                <tr>
                  <th>REF OMINIUM</th>
                  <th>PORTO ORIG.</th>
                  <th>PORTO DEST.</th>
                  <th>AGENTE</th>
                  <th>CLIENTE</th>
                  <th>COMERCIAL</th>
                  <th>ETD</th>
                  <th>ETA</th>
                  <th>AV. PREV.</th>
                  <th>COB. SINAL</th>
                  <th>SINAL PAGO</th>
                  <th>P.QUAL.</th>
                  <th>FECH. PAGO</th>
                  <th>AV. CHEGADA</th>
                  <th>IMP</th>
                  <th>PACKLIST</th>
                  <th>BL</th>
                  <th>CTNR</th>
                  <th>KG</th>
                  <th>NAVIO</th>
                  <th>STATUS</th>
                  <th>DESPACHANTE</th>
                  <th>LI</th>
                  <th>REGISTRO</th>
                  <th>DT. REG.</th>
                  <th>DESEMB.</th>
                  <th>ENTREGA</th>
                  <th>FREE TIME</th>
                  <th>EXPORTADOR</th>
                  <th>REF AG</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let r of _registradosRows"
                  (click)="abrirDetalhe.emit(r.embarqueId)">
                  <td><span class="cod-badge">{{ r.refOminium || '—' }}</span></td>
                  <td>{{ r.portoOrigem }}</td>
                  <td>{{ r.portoDestino }}</td>
                  <td>{{ r.agente || '—' }}</td>
                  <td class="wrap">{{ r.cliente }}</td>
                  <td>{{ r.comercial || '—' }}</td>
                  <td>{{ r.etd | date:'dd/MM/yy' }}</td>
                  <td>{{ r.eta | date:'dd/MM/yy' }}</td>
                  <td>{{ r.avisoPrevisao ? (r.avisoPrevisao | date:'dd/MM/yy') : '—' }}</td>
                  <td><ng-container *ngTemplateOutlet="celPgto; context:{data: r.cobrancaSinal, venc: r.cobrancaSinalVencida, pago: false}"></ng-container></td>
                  <td><ng-container *ngTemplateOutlet="celPgto; context:{data: r.sinalPago, venc: false, pago: r.sinalPagoEfetivado}"></ng-container></td>
                  <td><ng-container *ngTemplateOutlet="celPgto; context:{data: r.pQualDespachanteData, venc: false, pago: false}"></ng-container></td>
                  <td><ng-container *ngTemplateOutlet="celPgto; context:{data: r.fechamentoPago, venc: false, pago: r.fechamentoPagoEfetivado}"></ng-container></td>
                  <td>{{ r.avisoChegada ? (r.avisoChegada | date:'dd/MM/yy') : '—' }}</td>
                  <td>{{ r.imp || '—' }}</td>
                  <td>{{ r.packlist ? r.packlist : '—' }}</td>
                  <td>{{ r.bl || '—' }}</td>
                  <td>{{ r.container || '—' }}</td>
                  <td>{{ r.kg | number:'1.0-0' }}</td>
                  <td>{{ r.navio || '—' }}</td>
                  <td><span class="sb" [style.background]="statusColor(r.statusId)">{{ r.statusNome }}</span></td>
                  <td>{{ r.despachante }}</td>
                  <td>{{ r.li || '—' }}</td>
                  <td>{{ r.registro || '—' }}</td>
                  <td>{{ r.dataRegistro ? (r.dataRegistro | date:'dd/MM/yy') : '—' }}</td>
                  <td>{{ r.desemb ? (r.desemb | date:'dd/MM/yy') : '—' }}</td>
                  <td>{{ r.entrega ? (r.entrega | date:'dd/MM/yy') : '—' }}</td>
                  <td><ng-container *ngTemplateOutlet="celFt; context:{row: r}"></ng-container></td>
                  <td>{{ r.exportador || '—' }}</td>
                  <td>{{ r.refAg || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>

    <!-- ── Templates reutilizáveis de célula ── -->
    <ng-template #celPgto let-data="data" let-venc="venc" let-pago="pago">
      <span *ngIf="pago" class="cel-pago">✓ {{ data | date:'dd/MM/yy' }}</span>
      <span *ngIf="!pago && venc && data" class="cel-venc">⚠ {{ data | date:'dd/MM/yy' }}</span>
      <span *ngIf="!pago && !venc && data" class="cel-pend">{{ data | date:'dd/MM/yy' }}</span>
      <span *ngIf="!data" class="cel-pend">—</span>
    </ng-template>

    <ng-template #celFt let-row="row">
      <span *ngIf="row.freeTimeDiasRestantes !== null && row.freeTimeAlerta" class="ft-alerta">{{ row.freeTimeDiasRestantes }}d</span>
      <span *ngIf="row.freeTimeDiasRestantes !== null && !row.freeTimeAlerta" class="ft-ok">{{ row.freeTimeDiasRestantes }}d</span>
      <span *ngIf="row.freeTimeDiasRestantes === null" class="ft-none">—</span>
    </ng-template>
  `
})
export class EmbarqueAcompanhamentoComponent implements OnInit {

  @Output() fechar       = new EventEmitter<void>();
  @Output() abrirDetalhe = new EventEmitter<string>(); // embarqueId

  // ── Dados ─────────────────────────────────────────────────────────────
  private rows: AcompanhamentoRow[] = [];

  // Lookup options para filtros
  clientes:      { id: string; razaoSocial: string }[] = [];
  despachantes:  { id: string; nome: string }[] = [];
  portosDestino: { id: string; nome: string }[] = [];

  // ── Filtros ───────────────────────────────────────────────────────────
  fBusca           = '';
  fCliente         = '';
  fDespachante     = '';
  fPortoDestino    = '';
  fMesEta          = '';
  fMostrarFinalizados = false;

  // ── Painéis colapsáveis ───────────────────────────────────────────────
  painelAberto: Record<Painel, boolean> = {
    aguardando: true,
    atracados:  true,
    registrados: true,
  };

  // ── Lookup privado ────────────────────────────────────────────────────
  private _lkp: Record<string, string> = {};

  // ── Cache de linhas filtradas por painel ─────────────────────────────
  _aguardandoRows:  AcompanhamentoRow[] = [];
  _atracadosRows:   AcompanhamentoRow[] = [];
  _registradosRows: AcompanhamentoRow[] = [];

  // Mapa de cor por statusId pré-computado
  private _statusColors: Record<string, string> = {};

  constructor(
    private svc:            EmbarqueAduanaService,
    private statusSvc:      StatusEmbarqueService,
    private clienteSvc:     ClienteV2Service,
    private despachanteSvc: DespachanteV2Service,
    private portoOrigemSvc: PortoOrigemService,
    private portoDestinoSvc:PortoDestinoService,
    private agentesSvc:     AgenteCargaService,
    private exportadorSvc:  ExportadorService,
    private navioSvc:       ControleNavioService,
    private solSvc:         SolicitacaoOrcamentoService,
  ) {}

  ngOnInit(): void {
    // Carregar listas de lookup
    const clientes     = this.clienteSvc.getAtivos();
    const despachantes = this.despachanteSvc.getAtivos();
    const portosOrigem = this.portoOrigemSvc.getAtivos();
    const portosDestino= this.portoDestinoSvc.getAtivos();
    const agentes      = this.agentesSvc.getAtivos();
    const exportadores = this.exportadorSvc.getAtivos();
    const navios       = this.navioSvc.getAll();

    clientes.forEach(c     => this._lkp[c.id] = c.razaoSocial);
    despachantes.forEach(d => this._lkp[d.id] = d.nome);
    portosOrigem.forEach(p => this._lkp[p.id] = p.nome);
    portosDestino.forEach(p=> this._lkp[p.id] = p.nome);
    agentes.forEach(a      => this._lkp[a.id] = a.nome);
    exportadores.forEach(e => this._lkp[e.id] = e.nome);
    navios.forEach(n       => this._lkp[n.id] = n.nomeNavio);
    this.statusSvc.getAll().forEach(s => this._lkp[s.id] = s.nome);

    this.clientes      = clientes;
    this.despachantes  = despachantes;
    this.portosDestino = portosDestino;

    // Pré-computar mapa de cores de status
    this.statusSvc.getAll().forEach(s => {
      const colors = ['#94a3b8','#3b82f6','#f59e0b','#8b5cf6','#06b6d4','#10b981','#64748b'];
      this._statusColors[s.id] = colors[(s.ordem - 1) % colors.length] ?? '#94a3b8';
    });

    this.rows = this.buildRows();
    this._recomputar();
  }

  _recomputar(): void {
    this._aguardandoRows  = this._filtrar('aguardando');
    this._atracadosRows   = this._filtrar('atracados');
    this._registradosRows = this._filtrar('registrados');
  }

  // ── Filtro combinado ──────────────────────────────────────────────────

  private _filtrar(painel: Painel): AcompanhamentoRow[] {
    return this.rows.filter(r => {
      const ordem = r.statusOrdem;
      if (painel === 'aguardando'  && ordem > 2)  return false;
      if (painel === 'atracados'   && ordem !== 3) return false;
      if (painel === 'registrados' && ordem < 4)  return false;
      if (!this.fMostrarFinalizados && r.statusNome === 'Finalizado') return false;

      if (this.fCliente      && r.clienteId    !== this.fCliente)     return false;
      if (this.fDespachante  && r.despachanteId !== this.fDespachante) return false;
      if (this.fPortoDestino && r.portoDestinoId !== this.fPortoDestino) return false;
      if (this.fMesEta && r.eta && !r.eta.startsWith(this.fMesEta))   return false;
      if (this.fBusca) {
        const s = this.fBusca.toLowerCase();
        return (r.refOminium || '').toLowerCase().includes(s) ||
               (r.bl        || '').toLowerCase().includes(s) ||
               (r.container || '').toLowerCase().includes(s) ||
               r.cliente.toLowerCase().includes(s);
      }
      return true;
    });
  }

  limparFiltros(): void {
    this.fBusca = ''; this.fCliente = ''; this.fDespachante = '';
    this.fPortoDestino = ''; this.fMesEta = ''; this.fMostrarFinalizados = false;
    this._recomputar();
  }

  togglePainel(p: Painel): void { this.painelAberto[p] = !this.painelAberto[p]; }

  // ── Build rows ────────────────────────────────────────────────────────

  private buildRows(): AcompanhamentoRow[] {
    const today = new Date(); today.setHours(0,0,0,0);
    const embarques      = this.svc.getAll();
    const allPagamentos  = this.svc.getAllPagamentos();
    const allFreeTimes   = this.svc.getAllFreeTimes();

    return embarques.map(e => {
      const status = this.statusSvc.getById(e.statusEmbarqueId);
      const sol    = e.solicitacaoOrcamentoId ? this.solSvc.getById(e.solicitacaoOrcamentoId) : undefined;

      const pgtos = allPagamentos.filter(p => p.embarqueAduanaId === e.id);
      const cobSinal   = pgtos.find(p => p.tipoPagamento === 'CobrancaSinal');
      const sinPago    = pgtos.find(p => p.tipoPagamento === 'SinalPago');
      const pQual      = pgtos.find(p => p.tipoPagamento === 'Honorario');
      const fechPago   = pgtos.find(p => p.tipoPagamento === 'FechamentoPago');

      // Free time mais recente
      const fts = allFreeTimes.filter(f => f.embarqueAduanaId === e.id);
      const ftAtivo = fts.length > 0 ? fts.reduce((a, b) =>
        new Date(b.dataFim) > new Date(a.dataFim) ? b : a
      ) : null;
      const ftDias   = ftAtivo ? this.svc.diasRestantesFreeTime(ftAtivo) : null;

      // ETA atraso
      const etaDate = e.eta ? new Date(e.eta + 'T00:00:00') : null;
      const diasAtraso = etaDate ? Math.floor(
        (today.getTime() - etaDate.getTime()) / 86400000
      ) : 0;
      const etaAtrasada = diasAtraso > 0;
      const etaCritica  = diasAtraso > 7;

      const isVencido = (d?: string) =>
        !!d && new Date(d + 'T00:00:00').getTime() < today.getTime();

      return {
        embarqueId:              e.id,
        codigoInterno:           e.codigoInterno,
        refOminium:              e.refOminium ?? '',
        portoOrigem:             this._lkp[e.portoOrigemId]  ?? '—',
        portoDestino:            this._lkp[e.portoDestinoId] ?? '—',
        portoDestinoId:          e.portoDestinoId,
        agente:                  this._lkp[e.agenteCargaId]  ?? '',
        cliente:                 this._lkp[e.clienteId] ?? '—',
        clienteId:               e.clienteId,
        comercial:               e.usuarioResponsavelId ?? '',
        etd:                     e.etd ?? '',
        eta:                     e.eta ?? '',
        avisoPrevisao:           e.avisoPrevisao ?? '',
        avisoChegada:            e.avisoChegada ?? '',
        cobrancaSinal:           cobSinal?.dataPrevista ?? '',
        sinalPago:               sinPago?.dataPagamento ?? sinPago?.dataPrevista ?? '',
        pQualDespachanteData:    pQual?.dataPrevista ?? '',
        fechamentoPago:          fechPago?.dataPagamento ?? fechPago?.dataPrevista ?? '',
        cobrancaSinalVencida:    !cobSinal?.dataPagamento && isVencido(cobSinal?.dataPrevista),
        sinalPagoEfetivado:      !!sinPago?.dataPagamento,
        fechamentoPagoEfetivado: !!fechPago?.dataPagamento,
        imp:                     e.imp ?? '',
        packlist:                sol?.codigoInterno ?? '',
        bl:                      e.bl ?? '',
        container:               e.container ?? '',
        li:                      e.li ?? '',
        registro:                e.registro ?? '',
        dataRegistro:            e.dataRegistro ?? '',
        desemb:                  e.desemb ?? '',
        entrega:                 e.entrega ?? '',
        refAg:                   e.refAg ?? '',
        kg:                      e.kg ?? 0,
        navio:                   this._lkp[e.controleNavioId] ?? '',
        statusId:                e.statusEmbarqueId,
        statusNome:              status?.nome ?? '',
        statusOrdem:             status?.ordem ?? 0,
        despachante:             this._lkp[e.despachanteId] ?? '—',
        despachanteId:           e.despachanteId,
        exportador:              e.exportadorId ? (this._lkp[e.exportadorId] ?? '') : '',
        freeTimeDiasRestantes:   ftDias,
        freeTimeAlerta:          ftDias !== null && ftDias <= 3,
        etaAtrasada,
        etaCritica,
      } satisfies AcompanhamentoRow;
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────

  statusColor(id: string): string {
    return this._statusColors[id] ?? '#94a3b8';
  }
}
