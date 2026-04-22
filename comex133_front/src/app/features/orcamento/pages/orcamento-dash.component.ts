import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface FaseStatus { packlist: 'ok' | 'pend' | 'nd'; custo: 'ok' | 'pend' | 'nd'; venda: 'ok' | 'pend' | 'nd'; aduana: 'ok' | 'pend' | 'nd'; }
interface OrcRow {
  ref: string;
  saida: string;
  chegada: string;
  agente: string;
  tipo: 'OM' | 'AR';
  cliente: string;
  navio: string;
  resp: string;
  porto: string;
  peso: number | null;
  cbm: number | null;
  cx: number | null;
  cif: number | null;
  bl: string;
  fases: FaseStatus;
  pronto: boolean;
  obs?: string;
}
interface Grupo { label: string; cor: 'amarelo' | 'azul' | 'verde' | 'vermelho' | 'cinza'; rows: OrcRow[]; }

const G = (ref: string, saida: string, chegada: string, agente: string, tipo: 'OM'|'AR',
  cliente: string, navio: string, resp: string, porto: string,
  peso: number|null, cbm: number|null, cx: number|null, cif: number|null,
  bl: string, fases: FaseStatus, pronto = false, obs?: string): OrcRow =>
  ({ ref, saida, chegada, agente, tipo, cliente, navio, resp, porto, peso, cbm, cx, cif, bl, fases, pronto, obs });

const MOCK_GRUPOS: Grupo[] = [
  {
    label: 'AGUARDANDO PACKLIST',
    cor: 'amarelo',
    rows: [
      G('ORC-060326-VKRW', '28/03/26', '15/05/26', 'V3 Log', 'OM', 'Petrus Imp.',   'Hd 03',         'Ana Lima',   'Santos',     8530, 42.1, 648,  15420.00, 'NBZY25040265', { packlist:'pend', custo:'nd', venda:'nd', aduana:'nd' }),
      G('ORC-060326-JQSI', '02/04/26', '20/05/26', 'V3 Log', 'OM', 'Petrus Imp.',   'Lcl 02',        'Ana Lima',   'Santos',     null, null, 406,  null,     'NBZY25040342', { packlist:'pend', custo:'nd', venda:'nd', aduana:'nd' }),
      G('ORC-060326-MRTA', '10/04/26', '25/05/26', 'V3 Log', 'OM', 'Petrus Imp.',   'Pin 22',        'Carlos Melo','Santos',    10920, 55.3, 1249, 18600.00, 'NBZY25030051', { packlist:'pend', custo:'nd', venda:'nd', aduana:'nd' }),
      G('ORC-060326-PLWQ', '12/04/26', '25/05/26', 'Armador', 'OM','Petrus Imp.',   'Fang 06',       'Ana Lima',   'Paranaguá', 13660, 68.0, 619,  22810.00, 'B232096297',   { packlist:'pend', custo:'nd', venda:'nd', aduana:'nd' }),
      G('ORC-060326-BNVC', '18/04/26', '25/05/26', 'V3 Log', 'OM', 'Petrus Imp.',   'Fang 05',       'Carlos Melo','Santos',    14900, 72.4, 668,  19350.00, 'NBZY25040567', { packlist:'pend', custo:'nd', venda:'nd', aduana:'nd' }),
      G('ORC-060326-QPXZ', '22/04/26', '10/06/26', 'CoscoSea','OM','Hello Kitty Co.','Hello Kitty 03','Beatriz Santos','Itajaí', 12620, 61.2, 698,  24500.00, 'COSU6415872070',{ packlist:'pend', custo:'nd', venda:'nd', aduana:'nd' }),
    ]
  },
  {
    label: 'EM ANÁLISE — CUSTO / VENDA',
    cor: 'azul',
    rows: [
      G('ORC-060326-KLTM', '02/05/26', '02/06/26', 'V3 Log', 'OM', 'Petrus Imp.',   'Lcl 03',        'Ana Lima',   'Santos',    16360, 79.5, 652,  27100.00, 'NBZY25041157', { packlist:'ok', custo:'pend', venda:'nd',    aduana:'nd' }),
      G('ORC-060326-YFRO', '04/05/26', '05/06/26', 'V3 Log', 'OM', 'Petrus Imp.',   'Pin 23',        'Carlos Melo','Paranaguá', 13360, 64.8, 508,  21500.00, 'NBZY25050080', { packlist:'ok', custo:'ok',   venda:'pend', aduana:'nd' }),
      G('ORC-060326-UHSP', '04/05/26', '05/06/26', 'V3 Log', 'OM', 'Petrus Imp.',   'Pin 25',        'Ana Lima',   'Santos',    12920, 62.7, 640,  18900.00, 'NBZY25050079', { packlist:'ok', custo:'pend', venda:'nd',    aduana:'nd' }),
      G('ORC-060326-NDWB', '04/05/26', '05/06/26', 'V3 Log', 'OM', 'Petrus Imp.',   'Pin 25',        'Carlos Melo','Santos',    15760, 76.5, 936,  24200.00, 'NBZY25050081', { packlist:'ok', custo:'ok',   venda:'pend', aduana:'nd' }),
      G('ORC-060326-ZVTC', '04/05/26', '05/06/26', 'V3 Log', 'OM', 'Red House Ltda','Red House 01',  'Beatriz Santos','Santos',  16500, 80.1, 315,  31000.00, 'NBZY25050077', { packlist:'ok', custo:'pend', venda:'nd',    aduana:'nd' }),
      G('ORC-060326-IXPQ', '04/05/26', '05/06/26', 'V3 Log', 'OM', 'Red House Ltda','Red House 02',  'Beatriz Santos','Itajaí',  21040, 102.3,972, 38500.00, 'NBZY25050078', { packlist:'ok', custo:'ok',   venda:'pend', aduana:'nd' }),
      G('ORC-060326-AGML', '18/05/26', '06/06/26', 'V3 Log', 'OM', 'Petrus Imp.',   'Lace Lore 04',  'Ana Lima',   'Paranaguá', 14800, 71.9, 319,  26300.00, 'NBZY25050422', { packlist:'ok', custo:'pend', venda:'nd',    aduana:'nd' }),
      G('ORC-060326-RHJK', '21/05/26', '21/06/26', 'V3 Log', 'OM', 'Petrus Imp.',   'Pin 26',        'Carlos Melo','Santos',    10320, 50.1, 200,  17400.00, 'NBZY25050773', { packlist:'ok', custo:'ok',   venda:'pend', aduana:'nd' }),
    ]
  },
  {
    label: 'APROVADOS — AGUARDANDO EMBARQUE',
    cor: 'verde',
    rows: [
      G('ORC-060326-CWAJ', '30/05/26', '30/06/26', 'V3 Log', 'OM', 'Petrus Imp.',   'Lela 02',       'Ana Lima',   'Santos',    25800, 125.3,1159, 44200.00, 'NBZY25051358', { packlist:'ok', custo:'ok', venda:'ok', aduana:'nd'  }, false),
      G('ORC-060326-TXPB', '30/05/26', '30/06/26', 'V3 Log', 'OM', 'Petrus Imp.',   'Qiu Yinan 01',  'Beatriz Santos','Itajaí', 22510, 109.4,1034, 38900.00, 'NBZY25050910', { packlist:'ok', custo:'ok', venda:'ok', aduana:'nd'  }, false),
      G('ORC-060326-ELMU', '01/06/26', '01/07/26', 'Hdj Frt', 'OM','Petrus Imp.',   'Pin 28',        'Carlos Melo','Santos',    14220, 69.0, 994,  23700.00, 'NBZY25060188', { packlist:'ok', custo:'ok', venda:'ok', aduana:'pend'}, false),
      G('ORC-060326-WNSD', '01/06/26', '01/07/26', 'V3 Log', 'OM', 'Petrus Imp.',   'Lcl 05',        'Ana Lima',   'Santos',    12745, 61.9, 662,  20100.00, 'NBZY25060147', { packlist:'ok', custo:'ok', venda:'ok', aduana:'pend'}, false),
      G('ORC-060326-ZSYK', '08/06/26', '01/07/26', 'MAERSK', 'OM', 'Petrus Imp.',   'Fang 07',       'Carlos Melo','Santos',    15590, 75.7, 1541, 28600.00, '253298757',    { packlist:'ok', custo:'ok', venda:'ok', aduana:'pend'}, false),
    ]
  },
  {
    label: 'EM ADUANA',
    cor: 'vermelho',
    rows: [
      G('ORC-060326-PKBY', '10/07/26', '10/07/26', 'Hdj Frt', 'OM','Petrus Imp.',   'Pin 30',        'Beatriz Santos','Santos',  14590, 70.8, 2153, 24800.00, 'NBZY25060412', { packlist:'ok', custo:'ok', venda:'ok', aduana:'pend'}, false, 'DI em análise'),
      G('ORC-060326-OAMP', '20/06/26', '20/07/26', 'V3 Log', 'OM', 'Petrus Imp.',   'Pin 31',        'Ana Lima',   'Paranaguá', 18050, 87.6, 1032, 31200.00, 'NBZY25060821', { packlist:'ok', custo:'ok', venda:'ok', aduana:'pend'}, false),
      G('ORC-060326-CFWR', '29/06/26', '29/07/26', 'V3 Log', 'OM', 'Petrus Imp.',   'Lcl 04',        'Carlos Melo','Santos',    22960, 111.5,1092, 39400.00, 'NBZY25061051', { packlist:'ok', custo:'ok', venda:'ok', aduana:'pend'}, false),
      G('ORC-060326-HKQT', '06/07/26', '06/08/26', 'Hdj Frt', 'OM','Petrus Imp.',   'Pin 32',        'Beatriz Santos','Santos',  12010, 58.3, 508,  20700.00, 'NBZY25070216', { packlist:'ok', custo:'ok', venda:'ok', aduana:'pend'}, false, 'Aguard. canal vermelho'),
      G('ORC-060326-VSJI', '06/07/26', '06/08/26', 'V3 Log', 'OM', 'Petrus Imp.',   'Pin 33',        'Ana Lima',   'Paranaguá', 13020, 63.2, 753,  22300.00, 'NBZY25070217', { packlist:'ok', custo:'ok', venda:'ok', aduana:'pend'}, false),
      G('ORC-060326-RQAM', '30/07/26', '30/08/26', 'V3 Log', 'OM', 'Petrus Imp.',   'Jiesipote 01',  'Carlos Melo','Santos',    13080, 63.5, 304,  21900.00, 'ZSJY25060156', { packlist:'ok', custo:'ok', venda:'ok', aduana:'pend'}, false),
      G('ORC-060326-TDXW', '',         '',          'V3 Log', 'AR', 'Andersom Imp.', 'Andersom 01',   'Beatriz Santos','GRU',     23000, null, 300,  41000.00, 'NBZY321321',   { packlist:'ok', custo:'ok', venda:'ok', aduana:'pend'}, false, 'Aéreo — sem data def.'),
    ]
  },
  {
    label: 'CONCLUÍDOS',
    cor: 'cinza',
    rows: [
      G('ORC-060326-PRNT', '12/06/26', '12/07/26', 'MAERSK', 'OM', 'Kcx Trading',   'Pin 27',        'Ana Lima',   'Santos',     8550, 41.5, 3918, 15200.00, 'ZSS250501700', { packlist:'ok', custo:'ok', venda:'ok', aduana:'ok' }, true),
      G('ORC-060326-SUNQ', '',         '',          'V3 Log', 'AR', 'Sung Comércio', 'Sung 02',       'Beatriz Santos','GRU',     24000, null, 1237, 43500.00, 'NGBLEANDRO',   { packlist:'ok', custo:'ok', venda:'ok', aduana:'ok' }, true),
      G('ORC-051226-AAPZ', '10/01/26', '10/02/26', 'V3 Log', 'OM', 'Petrus Imp.',   'Pin 19',        'Carlos Melo','Santos',    11200, 54.4, 520,  18900.00, 'NBZY24120044', { packlist:'ok', custo:'ok', venda:'ok', aduana:'ok' }, true),
      G('ORC-051226-BBQW', '15/01/26', '15/02/26', 'V3 Log', 'OM', 'Red House Ltda','Red House 00',  'Ana Lima',   'Paranaguá', 19300, 93.7, 840,  33600.00, 'NBZY24120312', { packlist:'ok', custo:'ok', venda:'ok', aduana:'ok' }, true),
    ]
  }
];

@Component({
  selector: 'app-orcamento-dash',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="od-shell">

      <!-- Toolbar -->
      <div class="od-toolbar">
        <div class="od-toolbar-left">
          <div class="od-search-wrap">
            <i class="bi bi-search od-search-ico"></i>
            <input class="od-search" type="text" placeholder="Pesquisar ref, cliente, navio, BL..." [(ngModel)]="pesquisa">
          </div>
          <div class="od-filtros">
            <button class="od-filtro-btn" [class.active]="filtroTipo === ''" (click)="filtroTipo = ''">Todos</button>
            <button class="od-filtro-btn" [class.active]="filtroTipo === 'OM'" (click)="filtroTipo = 'OM'"><i class="bi bi-ship"></i> Marítimo</button>
            <button class="od-filtro-btn" [class.active]="filtroTipo === 'AR'" (click)="filtroTipo = 'AR'"><i class="bi bi-airplane"></i> Aéreo</button>
          </div>
        </div>
        <div class="od-toolbar-right">
          <div class="od-contador">
            <span class="od-cnt-num">{{ totalProcessos }}</span>
            <span class="od-cnt-label">processos</span>
          </div>
          <div class="od-contador">
            <span class="od-cnt-num">{{ totalCif | currency:'BRL':'symbol':'1.0-0' }}</span>
            <span class="od-cnt-label">CIF total</span>
          </div>
          <div class="od-contador">
            <span class="od-cnt-num">{{ totalPeso | number:'1.0-0' }} kg</span>
            <span class="od-cnt-label">peso total</span>
          </div>
        </div>
      </div>

      <!-- Legenda fases -->
      <div class="od-legend">
        <span class="od-leg-item"><span class="od-fase ok">✓</span> Concluída</span>
        <span class="od-leg-item"><span class="od-fase pend">●</span> Em andamento</span>
        <span class="od-leg-item"><span class="od-fase nd">–</span> Não iniciada</span>
      </div>

      <!-- Grupos -->
      <div *ngFor="let grupo of gruposFiltrados" class="od-grupo">

        <!-- Cabeçalho do grupo -->
        <div class="od-grupo-header" [ngClass]="'cor-' + grupo.cor" (click)="toggleGrupo(grupo.label)">
          <div class="od-grupo-info">
            <i class="bi" [ngClass]="grupoAberto(grupo.label) ? 'bi-chevron-down' : 'bi-chevron-right'"></i>
            <span class="od-grupo-label">{{ grupo.label }}</span>
            <span class="od-grupo-count">{{ grupo.rows.length }}</span>
          </div>
          <div class="od-grupo-stats">
            <span><i class="bi bi-box-seam"></i> {{ totalCxGrupo(grupo) | number:'1.0-0' }} cx</span>
            <span><i class="bi bi-currency-dollar"></i> {{ totalCifGrupo(grupo) | currency:'BRL':'symbol':'1.0-0' }}</span>
          </div>
        </div>

        <!-- Tabela -->
        <div class="od-table-wrap" *ngIf="grupoAberto(grupo.label)">
          <table class="od-table">
            <thead>
              <tr>
                <th class="col-ref">REF</th>
                <th class="col-tipo">TIPO</th>
                <th class="col-data">SAÍDA</th>
                <th class="col-data">CHEGADA</th>
                <th class="col-agente">AGENTE</th>
                <th class="col-cliente">CLIENTE / NAVIO</th>
                <th class="col-resp">RESP.</th>
                <th class="col-porto">PORTO</th>
                <th class="col-num">PESO (kg)</th>
                <th class="col-num">CBM</th>
                <th class="col-num">CX</th>
                <th class="col-cif">CIF</th>
                <th class="col-bl">BL / AWB</th>
                <th class="col-fase" title="Packlist">PL</th>
                <th class="col-fase" title="Custo">CT</th>
                <th class="col-fase" title="Venda">VD</th>
                <th class="col-fase" title="Aduana">AD</th>
                <th class="col-obs">OBS</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let r of filtrarRows(grupo.rows)"
                  class="od-row"
                  [class.row-pronto]="r.pronto"
                  [class.row-aereo]="r.tipo === 'AR'">
                <td class="col-ref">
                  <a [routerLink]="[]" class="od-ref-link" title="Abrir orçamento">{{ r.ref }}</a>
                </td>
                <td class="col-tipo">
                  <span class="od-tipo" [ngClass]="r.tipo === 'OM' ? 'tipo-om' : 'tipo-ar'">
                    <i class="bi" [ngClass]="r.tipo === 'OM' ? 'bi-ship' : 'bi-airplane'"></i>
                    {{ r.tipo }}
                  </span>
                </td>
                <td class="col-data">{{ r.saida || '—' }}</td>
                <td class="col-data">{{ r.chegada || '—' }}</td>
                <td class="col-agente">{{ r.agente }}</td>
                <td class="col-cliente">
                  <div class="od-cliente">{{ r.cliente }}</div>
                  <div class="od-navio">{{ r.navio }}</div>
                </td>
                <td class="col-resp">{{ r.resp }}</td>
                <td class="col-porto">{{ r.porto }}</td>
                <td class="col-num">{{ r.peso ? (r.peso | number:'1.0-0') : '—' }}</td>
                <td class="col-num">{{ r.cbm ? (r.cbm | number:'1.1-1') : '—' }}</td>
                <td class="col-num">{{ r.cx ? (r.cx | number:'1.0-0') : '—' }}</td>
                <td class="col-cif">{{ r.cif ? (r.cif | currency:'BRL':'symbol':'1.2-2') : '—' }}</td>
                <td class="col-bl">{{ r.bl }}</td>
                <td class="col-fase"><span class="od-fase {{ r.fases.packlist }}">{{ faseIcon(r.fases.packlist) }}</span></td>
                <td class="col-fase"><span class="od-fase {{ r.fases.custo }}">{{ faseIcon(r.fases.custo) }}</span></td>
                <td class="col-fase"><span class="od-fase {{ r.fases.venda }}">{{ faseIcon(r.fases.venda) }}</span></td>
                <td class="col-fase"><span class="od-fase {{ r.fases.aduana }}">{{ faseIcon(r.fases.aduana) }}</span></td>
                <td class="col-obs">
                  <span *ngIf="r.obs" class="od-obs-tag" [title]="r.obs">
                    <i class="bi bi-chat-left-text"></i>
                  </span>
                  <span *ngIf="r.pronto" class="od-pronto-tag">
                    <i class="bi bi-check-circle-fill"></i> PRONTO
                  </span>
                </td>
              </tr>
              <tr *ngIf="filtrarRows(grupo.rows).length === 0">
                <td colspan="18" class="od-no-rows">Nenhum registro encontrado para o filtro atual.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div *ngIf="gruposFiltrados.length === 0" class="od-empty">
        <i class="bi bi-inbox"></i>
        <p>Nenhum processo encontrado para "{{ pesquisa }}"</p>
      </div>

    </div>
  `,
  styles: [`
    /* ===== Shell ===== */
    .od-shell {
      font-family: 'Segoe UI', system-ui, sans-serif;
      font-size: 13px;
      color: #1e293b;
      padding: 0 0 40px;
    }

    /* ===== Toolbar ===== */
    .od-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 12px 16px;
      margin-bottom: 10px;
      flex-wrap: wrap;
    }
    .od-toolbar-left, .od-toolbar-right { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }

    .od-search-wrap { position: relative; }
    .od-search-ico { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: 14px; }
    .od-search {
      padding: 7px 12px 7px 32px;
      border: 1px solid #e2e8f0;
      border-radius: 7px;
      font-size: 13px;
      width: 280px;
      color: #1e293b;
      background: #f8fafc;
      outline: none;
      transition: border-color .15s, box-shadow .15s;
    }
    .od-search:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.12); background: white; }

    .od-filtros { display: flex; gap: 4px; }
    .od-filtro-btn {
      padding: 5px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      background: #f8fafc;
      color: #64748b;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      display: flex; align-items: center; gap: 5px;
      transition: all .15s;
    }
    .od-filtro-btn:hover { background: #eef2ff; border-color: #c7d2fe; color: #4338ca; }
    .od-filtro-btn.active { background: #4f46e5; border-color: #4338ca; color: white; }

    .od-contador { text-align: center; }
    .od-cnt-num { display: block; font-size: 17px; font-weight: 800; color: #0f172a; line-height: 1.1; }
    .od-cnt-label { display: block; font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: .04em; font-weight: 600; }

    /* ===== Legenda ===== */
    .od-legend {
      display: flex; gap: 16px; align-items: center;
      padding: 6px 4px; margin-bottom: 8px;
    }
    .od-leg-item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #64748b; font-weight: 600; }

    /* ===== Grupo ===== */
    .od-grupo { margin-bottom: 12px; border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0; }

    .od-grupo-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 8px 14px;
      cursor: pointer; user-select: none;
      transition: filter .15s;
    }
    .od-grupo-header:hover { filter: brightness(.97); }
    .od-grupo-info { display: flex; align-items: center; gap: 8px; }
    .od-grupo-label { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; }
    .od-grupo-count {
      font-size: 11px; font-weight: 700;
      background: rgba(0,0,0,.12);
      color: inherit;
      padding: 1px 7px; border-radius: 10px;
    }
    .od-grupo-stats { display: flex; gap: 16px; font-size: 12px; font-weight: 600; opacity: .8; }
    .od-grupo-stats i { margin-right: 3px; }

    .cor-amarelo { background: #fef9c3; color: #713f12; border-bottom: 1px solid #fde047; }
    .cor-azul    { background: #dbeafe; color: #1e3a8a; border-bottom: 1px solid #93c5fd; }
    .cor-verde   { background: #dcfce7; color: #14532d; border-bottom: 1px solid #86efac; }
    .cor-vermelho{ background: #fee2e2; color: #7f1d1d; border-bottom: 1px solid #fca5a5; }
    .cor-cinza   { background: #f1f5f9; color: #334155; border-bottom: 1px solid #cbd5e1; }

    /* ===== Tabela ===== */
    .od-table-wrap { overflow-x: auto; }
    .od-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12.5px;
    }

    .od-table thead tr {
      background: #f8fafc;
      border-bottom: 2px solid #e2e8f0;
    }
    .od-table th {
      padding: 7px 8px;
      text-align: left;
      font-size: 10.5px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: .05em;
      white-space: nowrap;
    }
    .od-table tbody tr {
      border-bottom: 1px solid #f1f5f9;
      transition: background .1s;
    }
    .od-table tbody tr:hover { background: #fafbff; }
    .od-table td {
      padding: 7px 8px;
      vertical-align: middle;
      white-space: nowrap;
    }

    .od-row.row-pronto { opacity: .7; }
    .od-row.row-aereo td.col-ref a { color: #b45309; }

    /* Colunas */
    .col-ref  { min-width: 150px; }
    .col-tipo { width: 60px; text-align: center; }
    .col-data { width: 80px; color: #475569; }
    .col-agente { width: 80px; color: #475569; }
    .col-cliente { min-width: 160px; }
    .col-resp  { width: 110px; color: #475569; }
    .col-porto { width: 90px; color: #475569; }
    .col-num  { width: 80px; text-align: right; color: #334155; font-variant-numeric: tabular-nums; }
    .col-cif  { width: 110px; text-align: right; font-weight: 600; color: #059669; font-variant-numeric: tabular-nums; }
    .col-bl   { min-width: 140px; font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #475569; }
    .col-fase { width: 32px; text-align: center; }
    .col-obs  { width: 80px; text-align: center; }

    /* Ref link */
    .od-ref-link {
      font-weight: 700;
      color: #4f46e5;
      font-size: 12px;
      text-decoration: none;
      font-family: 'JetBrains Mono', monospace;
    }
    .od-ref-link:hover { text-decoration: underline; color: #3730a3; }

    /* Cliente / navio */
    .od-cliente { font-weight: 700; color: #0f172a; }
    .od-navio   { font-size: 11px; color: #64748b; margin-top: 1px; }

    /* Tipo badge */
    .od-tipo {
      display: inline-flex; align-items: center; gap: 3px;
      padding: 2px 7px; border-radius: 4px;
      font-size: 11px; font-weight: 700;
    }
    .tipo-om { background: #eff6ff; color: #1d4ed8; }
    .tipo-ar { background: #fffbeb; color: #b45309; }

    /* Fases */
    .od-fase {
      display: inline-flex; align-items: center; justify-content: center;
      width: 22px; height: 22px;
      border-radius: 50%;
      font-size: 13px; font-weight: 700;
    }
    .od-fase.ok   { background: #ecfdf5; color: #059669; }
    .od-fase.pend { background: #fef9c3; color: #d97706; }
    .od-fase.nd   { background: #f1f5f9; color: #cbd5e1; }

    /* Tags */
    .od-obs-tag  { color: #94a3b8; cursor: default; font-size: 14px; }
    .od-pronto-tag { color: #059669; font-size: 10px; font-weight: 800; display: inline-flex; align-items: center; gap: 3px; }

    .od-no-rows {
      text-align: center;
      padding: 20px;
      color: #94a3b8;
      font-style: italic;
    }

    .od-empty {
      text-align: center;
      padding: 60px 20px;
      color: #94a3b8;
    }
    .od-empty i { font-size: 48px; display: block; margin-bottom: 12px; }
    .od-empty p { font-size: 15px; }
  `]
})
export class OrcamentoDashComponent implements OnInit {
  pesquisa = '';
  filtroTipo: '' | 'OM' | 'AR' = '';
  private gruposColapsados = new Set<string>(['CONCLUÍDOS']);

  readonly grupos = MOCK_GRUPOS;

  ngOnInit() {}

  toggleGrupo(label: string) {
    if (this.gruposColapsados.has(label)) this.gruposColapsados.delete(label);
    else this.gruposColapsados.add(label);
  }
  grupoAberto(label: string) { return !this.gruposColapsados.has(label); }

  filtrarRows(rows: OrcRow[]): OrcRow[] {
    return rows.filter(r => {
      const q = this.pesquisa.toLowerCase();
      const matchQ = !q || [r.ref, r.cliente, r.navio, r.bl, r.agente, r.resp, r.porto]
        .some(v => (v || '').toLowerCase().includes(q));
      const matchT = !this.filtroTipo || r.tipo === this.filtroTipo;
      return matchQ && matchT;
    });
  }

  get gruposFiltrados(): Grupo[] {
    return this.grupos.filter(g => this.filtrarRows(g.rows).length > 0);
  }

  get totalProcessos(): number {
    return this.grupos.reduce((a, g) => a + this.filtrarRows(g.rows).length, 0);
  }
  get totalCif(): number {
    return this.grupos.reduce((a, g) =>
      a + this.filtrarRows(g.rows).reduce((b, r) => b + (r.cif || 0), 0), 0);
  }
  get totalPeso(): number {
    return this.grupos.reduce((a, g) =>
      a + this.filtrarRows(g.rows).reduce((b, r) => b + (r.peso || 0), 0), 0);
  }

  totalCifGrupo(g: Grupo) { return this.filtrarRows(g.rows).reduce((a, r) => a + (r.cif || 0), 0); }
  totalCxGrupo(g: Grupo)  { return this.filtrarRows(g.rows).reduce((a, r) => a + (r.cx || 0), 0); }

  faseIcon(s: 'ok' | 'pend' | 'nd') {
    return s === 'ok' ? '✓' : s === 'pend' ? '●' : '–';
  }
}
