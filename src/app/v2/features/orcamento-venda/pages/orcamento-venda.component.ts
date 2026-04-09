import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { ImpostoCalculatorService } from '../../custo-despachante/services/imposto-calculator.service';

type LinhaForm = { descricao: string; valor: number };

@Component({
  selector: 'app-orcamento-venda',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe],
  styles: [
    ...CRUD_STYLES,
    `
    .custo-search { display:flex; gap:8px; margin-bottom:16px; }
    .custo-search input { flex:1; padding:8px 12px; border:1.5px solid var(--color-border); border-radius:8px; font-size:13px; background:var(--color-bg); color:var(--color-text); }
    .custo-card { padding:12px 16px; border:1.5px solid var(--color-border); border-radius:8px; cursor:pointer; background:var(--color-surface); transition:.15s; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; font-size:13px; }
    .custo-card:hover { border-color:var(--color-primary,#3b82f6); background:var(--color-bg); }
    .custo-card.selected { border-color:var(--color-primary,#3b82f6); background:#eff6ff; }
    .custo-card-cod { font-family:monospace; font-weight:700; }
    .custo-card-info { color:var(--color-text-muted); font-size:12px; }
    .inline-form-row { display:flex; gap:8px; align-items:end; flex-wrap:wrap; margin-bottom:8px; }
    .inline-form-row .f { display:flex; flex-direction:column; gap:4px; min-width:120px; flex:1; }
    .inline-form-row label { font-size:11px; color:var(--color-text-muted); }
    .inline-form-row input { padding:8px 10px; border:1.5px solid var(--color-border); border-radius:6px; font-size:13px; background:var(--color-bg); color:var(--color-text); width:100%; }
    .inline-table { width:100%; border-collapse:collapse; font-size:13px; }
    .inline-table th { text-align:left; padding:8px; background:var(--color-surface); font-size:11px; text-transform:uppercase; letter-spacing:.04em; color:var(--color-text-muted); border-bottom:1px solid var(--color-border); }
    .inline-table td { padding:8px; border-bottom:1px solid var(--color-border); }
    .total-box { border:1.5px solid var(--color-border); border-radius:10px; padding:16px; margin-top:16px; }
    .total-row { display:flex; justify-content:space-between; padding:6px 0; font-size:13px; border-bottom:1px solid var(--color-border); }
    .total-final { display:flex; justify-content:space-between; padding:12px 0 4px; font-size:16px; font-weight:800; }
    /* Preview */
    .preview-overlay { position:fixed; inset:0; background:rgba(0,0,0,.45); z-index:200; display:flex; align-items:flex-start; justify-content:center; padding:32px 16px; overflow-y:auto; }
    .preview-modal { background:#fff; color:#111; border-radius:12px; width:100%; max-width:760px; padding:40px; font-size:13px; line-height:1.6; }
    .preview-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; border-bottom:2px solid #111; padding-bottom:16px; }
    .preview-title { font-size:22px; font-weight:800; }
    .preview-section { margin-bottom:20px; }
    .preview-section h3 { font-size:12px; text-transform:uppercase; letter-spacing:.08em; color:#555; margin:0 0 8px; border-bottom:1px solid #eee; padding-bottom:4px; }
    .preview-grid { display:grid; grid-template-columns:1fr 1fr; gap:4px 24px; font-size:13px; }
    .preview-grid strong { font-weight:600; }
    .preview-table { width:100%; border-collapse:collapse; font-size:13px; margin-top:8px; }
    .preview-table th { text-align:left; padding:6px 8px; background:#f5f5f5; border:1px solid #ddd; font-weight:700; }
    .preview-table td { padding:6px 8px; border:1px solid #ddd; }
    .preview-total-row { font-weight:700; background:#f5f5f5; }
    .preview-grand-total { background:#111; color:#fff; font-weight:800; font-size:15px; }
    .preview-actions { display:flex; gap:12px; margin-top:24px; justify-content:flex-end; }
    .cod-badge { background:var(--color-surface); border:1px solid var(--color-border); padding:2px 8px; border-radius:6px; font-family:monospace; font-size:12px; }
    `
  ],
  template: `
    <div class="container-standard">

      <div class="dashboard-header">
        <div>
          <h1>💼 Orçamentos de Venda</h1>
          <p class="subtitle">Propostas comerciais baseadas em custo interno</p>
        </div>
        <button class="btn btn-primary" (click)="openForm()">+ Novo Orçamento</button>
      </div>

      <!-- ── LISTAGEM ── -->
      <ng-container *ngIf="!showForm && !showPreview">
        <div class="content-section">
          <div class="toolbar">
            <input class="search" type="text" [(ngModel)]="q"
              placeholder="🔎 Buscar por código, cliente ou custo base" />
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Código</th>
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
                <td colspan="7" class="empty-state">Nenhum orçamento cadastrado</td>
              </tr>
              <tr *ngFor="let o of filtered">
                <td><span class="cod-badge">{{ o.codigoInterno }}</span></td>
                <td>{{ nomeClienteById(o.clienteId) }}</td>
                <td>{{ codigosCustosDaOrc(o.id) || codCustoById(o.custoDespachanteId) }}</td>
                <td>{{ o.data | date:'dd/MM/yyyy' }}</td>
                <td><span class="badge">{{ o.tamContainer }}</span></td>
                <td style="text-align:right;font-weight:700">{{ o.totalGeral | currency:'BRL':'symbol':'1.2-2' }}</td>
                <td>
                  <div class="row-actions">
                    <button class="btn-icon" title="Visualizar" (click)="abrirPreview(o)">👁️</button>
                    <button class="btn-icon" title="Editar" (click)="openForm(o)">✏️</button>
                    <button class="btn-icon danger" title="Excluir" (click)="remove(o.id)">🗑️</button>
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
          <h2>{{ editing ? 'Editar Orçamento — ' + editing.codigoInterno : 'Novo Orçamento de Venda' }}</h2>
        </div>

        <!-- Passo 1: Selecionar Custo Base -->
        <div class="card" *ngIf="formStep === 1">
          <h3 style="margin:0 0 12px;font-size:14px;font-weight:700">1. Selecione o Custo Base</h3>
          <div class="custo-search">
            <input type="text" [(ngModel)]="custoQuery" placeholder="Buscar por código, despachante ou importador..." />
          </div>
          <div *ngFor="let c of custosFiltrados">
            <div class="custo-card" [class.selected]="isCustoSelecionado(c.id)" (click)="toggleCusto(c)">
              <div>
                <div class="custo-card-cod">{{ c.codigoInterno }}</div>
                <div class="custo-card-info">
                  {{ nomeDespachanteById(c.despachanteId) }} · {{ nomeImportadorById(c.importadorId) }} · {{ c.data | date:'dd/MM/yyyy' }}
                </div>
              </div>
              <div style="text-align:right">
                <div style="font-size:12px;color:var(--color-text-muted)">CIF R$</div>
                <div style="font-weight:700">{{ c.cifReais | currency:'BRL':'symbol':'1.2-2' }}</div>
              </div>
            </div>
          </div>
          <p *ngIf="custosFiltrados.length === 0" style="font-size:13px;color:var(--color-text-muted)">
            Nenhum custo encontrado. <a routerLink="/custos" style="color:var(--color-primary,#3b82f6)">Cadastre um custo primeiro.</a>
          </p>
          <span class="err-msg" *ngIf="showErr && custosSelecionados.length === 0">Selecione ao menos um custo base</span>
          <div class="actions">
            <button class="btn btn-primary" (click)="nextFormStep()">Próximo →</button>
            <button class="btn btn-secondary" (click)="cancelForm()">Cancelar</button>
          </div>
        </div>

        <!-- Passo 2: Dados do orçamento + despesas + extras -->
        <div class="card" *ngIf="formStep === 2">
          <h3 style="margin:0 0 12px;font-size:14px;font-weight:700">
            2. Dados do Orçamento
            <span class="cod-badge" style="margin-left:8px">Base: {{ custoBase?.codigoInterno }}</span>
          </h3>

          <div class="form-grid">
            <div class="field w2">
              <label>Cliente <span class="required">*</span></label>
              <select [(ngModel)]="form.clienteId" [class.err]="showErr && !form.clienteId">
                <option value="">— Selecione —</option>
                <option *ngFor="let c of clientes" [value]="c.id">{{ c.razaoSocial }}</option>
              </select>
              <span class="err-msg" *ngIf="showErr && !form.clienteId">Obrigatório</span>
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
              <label>Peso Bruto (kg)</label>
              <input type="number" [(ngModel)]="form.pesoBruto" min="0" step="0.01" placeholder="0.00" />
            </div>
            <div class="field">
              <label>Peso Líquido (kg)</label>
              <input type="number" [(ngModel)]="form.pesoLiquido" min="0" step="0.01" placeholder="0.00" />
            </div>
            <div class="field">
              <label>Frete Internacional (R$)</label>
              <input type="number" [(ngModel)]="form.freteInternacional" min="0" step="0.01" placeholder="0.00" (ngModelChange)="recalcular()" />
            </div>
            <div class="field">
              <label>CIF (R$) <small style="color:var(--color-text-muted)">(do custo)</small></label>
              <input type="number" [(ngModel)]="form.cifReais" min="0" step="0.01" (ngModelChange)="recalcular()" />
            </div>
            <div class="field">
              <label>CIF (USD)</label>
              <input type="number" [(ngModel)]="form.cifUsd" min="0" step="0.01" />
            </div>
            <div class="field">
              <label>FOB (R$)</label>
              <input type="number" [(ngModel)]="form.fobReais" min="0" step="0.01" />
            </div>
            <div class="field">
              <label>FOB (USD)</label>
              <input type="number" [(ngModel)]="form.fobUsd" min="0" step="0.01" />
            </div>
            <div class="field">
              <label>Taxa USD</label>
              <input type="number" [(ngModel)]="form.taxaUsd" min="0" step="0.0001" placeholder="0.00" />
            </div>
            <div class="field">
              <label>Honorários (R$)</label>
              <input type="number" [(ngModel)]="form.honorarios" min="0" step="0.01" placeholder="0.00" (ngModelChange)="recalcular()" />
            </div>
            <div class="field w3">
              <label>Observação</label>
              <input type="text" [(ngModel)]="form.observacao" placeholder="Observações ao cliente" />
            </div>
          </div>

          <!-- Despesas adicionais -->
          <div style="margin-top:20px">
            <h4 style="font-size:13px;font-weight:700;margin:0 0 10px">Despesas Adicionais</h4>
            <div class="inline-form-row">
              <div class="f" style="flex:3">
                <label>Descrição</label>
                <input type="text" [(ngModel)]="despesaForm.descricao" placeholder="Ex: Armazenagem, THC..." />
              </div>
              <div class="f" style="max-width:160px">
                <label>Valor (R$)</label>
                <input type="number" [(ngModel)]="despesaForm.valor" min="0" step="0.01" placeholder="0.00" />
              </div>
              <div class="f" style="max-width:80px">
                <label>&nbsp;</label>
                <button class="btn btn-secondary" (click)="addDespesa()">+ Add</button>
              </div>
            </div>
            <p class="err-msg" *ngIf="despesaErro">{{ despesaErro }}</p>

            <table class="inline-table" *ngIf="despesasForm.length > 0">
              <thead><tr><th>Descrição</th><th style="text-align:right;width:160px">Valor</th><th style="width:50px"></th></tr></thead>
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
          <div style="margin-top:20px">
            <h4 style="font-size:13px;font-weight:700;margin:0 0 10px">Itens Extras</h4>
            <div class="inline-form-row">
              <div class="f" style="flex:3">
                <label>Descrição</label>
                <input type="text" [(ngModel)]="extraForm.descricao" placeholder="Ex: Seguro nacional, Despachante local..." />
              </div>
              <div class="f" style="max-width:160px">
                <label>Valor (R$)</label>
                <input type="number" [(ngModel)]="extraForm.valor" min="0" step="0.01" placeholder="0.00" />
              </div>
              <div class="f" style="max-width:80px">
                <label>&nbsp;</label>
                <button class="btn btn-secondary" (click)="addExtra()">+ Add</button>
              </div>
            </div>
            <p class="err-msg" *ngIf="extraErro">{{ extraErro }}</p>

            <table class="inline-table" *ngIf="extrasForm.length > 0">
              <thead><tr><th>Descrição</th><th style="text-align:right;width:160px">Valor</th><th style="width:50px"></th></tr></thead>
              <tbody>
                <tr *ngFor="let e of extrasForm; let i = index">
                  <td>{{ e.descricao }}</td>
                  <td style="text-align:right">{{ e.valor | currency:'BRL':'symbol':'1.2-2' }}</td>
                  <td><button class="btn-icon danger" (click)="removeExtra(i)">🗑️</button></td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Totalizador em tempo real -->
          <div class="total-box">
            <div class="total-row">
              <span>CIF (R$)</span>
              <span>{{ form.cifReais | currency:'BRL':'symbol':'1.2-2' }}</span>
            </div>
            <div class="total-row">
              <span>Frete Internacional</span>
              <span>{{ form.freteInternacional | currency:'BRL':'symbol':'1.2-2' }}</span>
            </div>
            <div class="total-row">
              <span>Total Impostos (do custo base)</span>
              <span>{{ form.totalImpostos | currency:'BRL':'symbol':'1.2-2' }}</span>
            </div>
            <div class="total-row">
              <span>Despesas Adicionais ({{ despesasForm.length }})</span>
              <span>{{ somaDespesas() | currency:'BRL':'symbol':'1.2-2' }}</span>
            </div>
            <div class="total-row">
              <span>Extras ({{ extrasForm.length }})</span>
              <span>{{ somaExtras() | currency:'BRL':'symbol':'1.2-2' }}</span>
            </div>
            <div class="total-row">
              <span>Honorários</span>
              <span>{{ form.honorarios | currency:'BRL':'symbol':'1.2-2' }}</span>
            </div>
            <div class="total-final">
              <span>TOTAL GERAL</span>
              <span>{{ calcTotalGeral() | currency:'BRL':'symbol':'1.2-2' }}</span>
            </div>
          </div>

          <div class="actions">
            <button class="btn btn-primary" (click)="salvar()">💾 Salvar Orçamento</button>
            <button class="btn btn-secondary" (click)="prevFormStep()">← Voltar</button>
            <button class="btn btn-secondary" style="margin-left:auto" (click)="cancelForm()">Cancelar</button>
          </div>
        </div>
      </ng-container>

      <!-- ── PREVIEW ── -->
      <div class="preview-overlay" *ngIf="showPreview" (click)="fecharPreview()">
        <div class="preview-modal" (click)="$event.stopPropagation()">
          <div class="preview-header">
            <div>
              <div class="preview-title">Orçamento de Importação</div>
              <div style="font-size:12px;margin-top:4px;color:#555">{{ previewOrc?.codigoInterno }} · {{ previewOrc?.data | date:'dd/MM/yyyy' }}</div>
            </div>
            <div style="text-align:right;font-size:12px;color:#555">
              <div style="font-size:18px;font-weight:800;color:#111">{{ previewOrc?.codigoInterno }}</div>
            </div>
          </div>

          <ng-container *ngIf="previewOrc">
            <!-- Dados gerais -->
            <div class="preview-section">
              <h3>Dados do Processo</h3>
              <div class="preview-grid">
                <div><strong>Cliente:</strong> {{ nomeClienteById(previewOrc.clienteId) }}</div>
                <div><strong>Data:</strong> {{ previewOrc.data | date:'dd/MM/yyyy' }}</div>
                <div><strong>Container:</strong> {{ previewOrc.tamContainer }}</div>
                <div><strong>Custo Base:</strong> {{ codCustoById(previewOrc.custoDespachanteId) }}</div>
                <div *ngIf="previewOrc.pesoBruto"><strong>Peso Bruto:</strong> {{ previewOrc.pesoBruto | number:'1.2-2' }} kg</div>
                <div *ngIf="previewOrc.pesoLiquido"><strong>Peso Líquido:</strong> {{ previewOrc.pesoLiquido | number:'1.2-2' }} kg</div>
              </div>
            </div>

            <!-- Valores FOB/CIF -->
            <div class="preview-section">
              <h3>Valores Base</h3>
              <div class="preview-grid">
                <div><strong>FOB (R$):</strong> {{ previewOrc.fobReais | currency:'BRL':'symbol':'1.2-2' }}</div>
                <div><strong>FOB (USD):</strong> {{ previewOrc.fobUsd | currency:'USD':'symbol':'1.2-2' }}</div>
                <div><strong>CIF (R$):</strong> {{ previewOrc.cifReais | currency:'BRL':'symbol':'1.2-2' }}</div>
                <div><strong>CIF (USD):</strong> {{ previewOrc.cifUsd | currency:'USD':'symbol':'1.2-2' }}</div>
                <div *ngIf="previewOrc.taxaUsd"><strong>Taxa USD:</strong> {{ previewOrc.taxaUsd | number:'1.4-4' }}</div>
                <div *ngIf="previewOrc.freteInternacional"><strong>Frete Internacional:</strong> {{ previewOrc.freteInternacional | currency:'BRL':'symbol':'1.2-2' }}</div>
              </div>
            </div>

            <!-- Impostos -->
            <div class="preview-section">
              <h3>Impostos (Custo Base)</h3>
              <table class="preview-table">
                <thead><tr><th>Descrição</th><th style="text-align:right">Valor</th></tr></thead>
                <tbody>
                  <tr><td>Total Impostos (calculados via NCM)</td><td style="text-align:right">{{ previewOrc.totalImpostos | currency:'BRL':'symbol':'1.2-2' }}</td></tr>
                </tbody>
              </table>
            </div>

            <!-- Despesas -->
            <div class="preview-section" *ngIf="previewDespesas.length > 0">
              <h3>Despesas Adicionais</h3>
              <table class="preview-table">
                <thead><tr><th>Descrição</th><th style="text-align:right">Valor</th></tr></thead>
                <tbody>
                  <tr *ngFor="let d of previewDespesas">
                    <td>{{ d.descricao }}</td>
                    <td style="text-align:right">{{ d.valor | currency:'BRL':'symbol':'1.2-2' }}</td>
                  </tr>
                  <tr class="preview-total-row">
                    <td><strong>Subtotal Despesas</strong></td>
                    <td style="text-align:right"><strong>{{ previewOrc.totalDespesas | currency:'BRL':'symbol':'1.2-2' }}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Extras -->
            <div class="preview-section" *ngIf="previewExtras.length > 0">
              <h3>Itens Extras</h3>
              <table class="preview-table">
                <thead><tr><th>Descrição</th><th style="text-align:right">Valor</th></tr></thead>
                <tbody>
                  <tr *ngFor="let e of previewExtras">
                    <td>{{ e.descricao }}</td>
                    <td style="text-align:right">{{ e.valor | currency:'BRL':'symbol':'1.2-2' }}</td>
                  </tr>
                  <tr class="preview-total-row">
                    <td><strong>Subtotal Extras</strong></td>
                    <td style="text-align:right"><strong>{{ previewOrc.totalExtras | currency:'BRL':'symbol':'1.2-2' }}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Resumo financeiro -->
            <div class="preview-section">
              <h3>Resumo Financeiro</h3>
              <table class="preview-table">
                <tbody>
                  <tr><td>CIF (R$)</td><td style="text-align:right">{{ previewOrc.cifReais | currency:'BRL':'symbol':'1.2-2' }}</td></tr>
                  <tr><td>Frete Internacional</td><td style="text-align:right">{{ previewOrc.freteInternacional | currency:'BRL':'symbol':'1.2-2' }}</td></tr>
                  <tr><td>Total Impostos</td><td style="text-align:right">{{ previewOrc.totalImpostos | currency:'BRL':'symbol':'1.2-2' }}</td></tr>
                  <tr><td>Total Despesas</td><td style="text-align:right">{{ previewOrc.totalDespesas | currency:'BRL':'symbol':'1.2-2' }}</td></tr>
                  <tr><td>Total Extras</td><td style="text-align:right">{{ previewOrc.totalExtras | currency:'BRL':'symbol':'1.2-2' }}</td></tr>
                  <tr><td>Honorários</td><td style="text-align:right">{{ previewOrc.honorarios | currency:'BRL':'symbol':'1.2-2' }}</td></tr>
                  <tr class="preview-grand-total">
                    <td>TOTAL GERAL</td>
                    <td style="text-align:right">{{ previewOrc.totalGeral | currency:'BRL':'symbol':'1.2-2' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div *ngIf="previewOrc.observacao" style="margin-top:16px;font-size:12px;color:#555;border-top:1px solid #eee;padding-top:12px">
              <strong>Observações:</strong> {{ previewOrc.observacao }}
            </div>
          </ng-container>

          <div class="preview-actions">
            <button class="btn btn-primary" (click)="openForm(previewOrc!);fecharPreview()">✏️ Editar</button>
            <button class="btn btn-secondary" (click)="fecharPreview()">Fechar</button>
          </div>
        </div>
      </div>

    </div>
  `
})
export class OrcamentoVendaComponent implements OnInit {

  // ── List ──────────────────────────────────────────────────────────────
  orcamentos: OrcamentoVenda[] = [];
  q = '';
  showForm = false;
  editing: OrcamentoVenda | null = null;
  formStep = 1;
  showErr = false;

  // ── Lookup ────────────────────────────────────────────────────────────
  clientes: ClienteV2[] = [];
  custos: CustoDespachante[] = [];
  custoQuery = '';
  custoBase: CustoDespachante | null = null;

  // ── Form ──────────────────────────────────────────────────────────────
  form = this.emptyForm();  custosSelecionados: string[] = [];  despesasForm: LinhaForm[] = [];
  extrasForm: LinhaForm[] = [];
  despesaForm: LinhaForm = { descricao: '', valor: 0 };
  extraForm: LinhaForm = { descricao: '', valor: 0 };
  despesaErro = '';
  extraErro = '';

  // ── Preview ───────────────────────────────────────────────────────────
  showPreview = false;
  previewOrc: OrcamentoVenda | null = null;
  previewDespesas: OrcamentoVendaDespesa[] = [];
  previewExtras: OrcamentoVendaDespesaExtra[] = [];

  // ── Lookup maps ───────────────────────────────────────────────────────
  private _despachantes: Record<string, string> = {};
  private _importadores: Record<string, string> = {};

  constructor(
    private service: OrcamentoVendaService,
    private custoSvc: CustoDespachanteService,
    private clienteSvc: ClienteV2Service,
    private portoOrigemSvc: PortoOrigemService,
    private portoDestinoSvc: PortoDestinoService,
    private despachanteSvc: DespachanteV2Service,
    private calculator: ImpostoCalculatorService
  ) {}

  ngOnInit(): void {
    this.clientes = this.clienteSvc.getAtivos();
    this.custos   = this.custoSvc.getAll();
    this.despachanteSvc.getAll().forEach(d => this._despachantes[d.id] = d.nome);
    this.load();
  }

  load(): void { this.orcamentos = this.service.getAll(); }

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
    if (!this.custoQuery) return this.custos;
    const s = this.custoQuery.toLowerCase();
    return this.custos.filter(c =>
      c.codigoInterno.toLowerCase().includes(s) ||
      (this._despachantes[c.despachanteId] ?? '').toLowerCase().includes(s)
    );
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

  // ── Custo base ────────────────────────────────────────────────────────

  toggleCusto(c: CustoDespachante): void {
    const idx = this.custosSelecionados.indexOf(c.id);
    if (idx >= 0) {
      this.custosSelecionados.splice(idx, 1);
    } else {
      this.custosSelecionados.push(c.id);
    }
    // Usar o único ou último selecionado como custo base para pré-preencher campos
    const ultimoId = this.custosSelecionados[this.custosSelecionados.length - 1];
    this.custoBase = ultimoId ? (this.custos.find(x => x.id === ultimoId) ?? null) : null;
    if (this.custoBase) {
      this.form.tamContainer  = this.custoBase.tamContainer;
      this.form.cifReais      = this.custoBase.cifReais;
      this.form.cifUsd        = this.custoBase.cifUsd;
      this.form.fobReais      = this.custoBase.fobReais;
      this.form.fobUsd        = this.custoBase.fobUsd;
      this.form.taxaUsd       = this.custoBase.taxaUsd;
      this.form.pesoBruto     = this.custoBase.peso;
      const ncvs = this.custoSvc.getNcmsVinculados(this.custoBase.id);
      this.form.totalImpostos = ncvs.reduce((acc, nv) => {
        return acc + this.custoSvc.getValoresImposto(nv.id).reduce((a, v) => a + v.totalImpostos, 0);
      }, 0);
    }
    this.form.custoDespachanteId = ultimoId ?? '';
  }

  // ── Form steps ────────────────────────────────────────────────────────

  nextFormStep(): void {
    this.showErr = true;
    if (this.custosSelecionados.length === 0) return;
    this.showErr = false;
    this.formStep = 2;
  }

  prevFormStep(): void { this.formStep = 1; }

  // ── Despesas / Extras ─────────────────────────────────────────────────

  addDespesa(): void {
    if (!this.despesaForm.descricao.trim() || this.despesaForm.valor <= 0) {
      this.despesaErro = 'Descrição e valor são obrigatórios.'; return;
    }
    this.despesaErro = '';
    this.despesasForm.push({ ...this.despesaForm });
    this.despesaForm = { descricao: '', valor: 0 };
  }

  removeDespesa(i: number): void { this.despesasForm.splice(i, 1); }

  addExtra(): void {
    if (!this.extraForm.descricao.trim() || this.extraForm.valor <= 0) {
      this.extraErro = 'Descrição e valor são obrigatórios.'; return;
    }
    this.extraErro = '';
    this.extrasForm.push({ ...this.extraForm });
    this.extraForm = { descricao: '', valor: 0 };
  }

  removeExtra(i: number): void { this.extrasForm.splice(i, 1); }

  // ── CRUD ──────────────────────────────────────────────────────────────

  openForm(item?: OrcamentoVenda): void {
    this.editing   = item ?? null;
    this.showErr   = false;
    this.formStep  = item ? 2 : 1;
    this.despesaErro = '';
    this.extraErro   = '';

    if (item) {
      const existingLinks = this.service.getOrcCustos(item.id);
      this.custosSelecionados = existingLinks.map(oc => oc.custoDespachanteId);
      // retrocompat: se não há junction mas há custoDespachanteId legado
      if (this.custosSelecionados.length === 0 && item.custoDespachanteId) {
        this.custosSelecionados = [item.custoDespachanteId];
      }
      const c = this.custos.find(c => c.id === item.custoDespachanteId) ?? null;
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
      this.custoBase = null;
      this.custoQuery = '';
      this.custosSelecionados = [];
      this.form = this.emptyForm();
      this.despesasForm = [];
      this.extrasForm   = [];
    }
    this.despesaForm = { descricao: '', valor: 0 };
    this.extraForm   = { descricao: '', valor: 0 };
    this.showForm = true;
    this.showPreview = false;
  }

  cancelForm(): void { this.showForm = false; this.editing = null; }

  salvar(): void {
    this.showErr = true;
    if (!this.form.clienteId || !this.form.data) return;

    const totalDespesas = this.somaDespesas();
    const totalExtras   = this.somaExtras();
    const totalGeral    = this.calcTotalGeral();

    const data: Omit<OrcamentoVenda, 'id' | 'codigoInterno'> = {
      clienteId:           this.form.clienteId,
      custoDespachanteId:  this.form.custoDespachanteId,
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
      observacao:          this.form.observacao?.trim() || undefined
    };

    let orcId: string;
    if (this.editing) {
      this.service.update({ ...this.editing, ...data });
      orcId = this.editing.id;
    } else {
      const created = this.service.create(data);
      orcId = created.id;
    }

    this.service.replaceDespesas(orcId, this.despesasForm);
    this.service.replaceExtras(orcId, this.extrasForm);
    this.service.replaceOrcCustos(orcId, this.custosSelecionados);

    this.cancelForm();
    this.load();
  }

  remove(id: string): void {
    if (confirm('Deseja excluir este orçamento?')) {
      this.service.remove(id);
      this.load();
    }
  }

  // ── Preview ───────────────────────────────────────────────────────────

  abrirPreview(o: OrcamentoVenda): void {
    this.previewOrc      = o;
    this.previewDespesas = this.service.getDespesas(o.id);
    this.previewExtras   = this.service.getExtras(o.id);
    this.showPreview     = true;
    this.showForm        = false;
  }

  fecharPreview(): void { this.showPreview = false; this.previewOrc = null; }

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
}
