import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CRUD_STYLES } from '../../../shared/styles/crud-page.styles';
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
import { OrcamentoVendaService } from '../../orcamento-venda/services/orcamento-venda.service';
import { DespachanteV2 } from '../../cadastros/despachantes/models/despachante-v2.models';
import { Importador } from '../../cadastros/importadores/models/importador.models';
import { PortoOrigem } from '../../cadastros/portos-origem/models/porto-origem.models';
import { PortoDestino } from '../../cadastros/portos-destino/models/porto-destino.models';
import { Ncm } from '../../cadastros/ncm/models/ncm.models';
import { ModeloDespesa } from '../../cadastros/modelos-despesa/models/modelo-despesa.models';

type LiForm = { ncm: string; descricao: string; valor: number; data: string };
type DespesaForm = { descricao: string; valor: number; data: string; entraBaseIcms: boolean };
type NcmVinculadoForm = { ncmId: string; numeroNcm: string; descricao: string; aliIi: number; aliIpi: number; aliPis: number; aliCofins: number; aliIcms: number; baseCalculo: number };

@Component({
  selector: 'app-custo-despachante',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
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
    `
  ],
  template: `
    <div class="container-standard">

      <div class="dashboard-header">
        <div>
          <h1>🧾 Custos Despachante</h1>
          <p class="subtitle">Cálculo de custo interno para importações</p>
        </div>
        <button class="btn btn-primary" (click)="openWizard()">+ Novo Custo</button>
      </div>

      <!-- ── LISTAGEM ── -->
      <ng-container *ngIf="!showWizard">
        <div class="content-section">
          <div class="toolbar">
            <input class="search" type="text" [(ngModel)]="q"
              placeholder="🔎 Buscar por código, despachante ou importador" />
          </div>
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
              <tr *ngFor="let c of filtered">
                <td><span class="cod-badge">{{ c.codigoInterno }}</span></td>
                <td>{{ nomeDespachanteById(c.despachanteId) }}</td>
                <td>{{ nomeImportadorById(c.importadorId) }}</td>
                <td><span *ngIf="c.solicitacaoOrcamentoId" class="sol-badge">{{ codSolById(c.solicitacaoOrcamentoId) }}</span><span *ngIf="!c.solicitacaoOrcamentoId" style="color:var(--color-text-muted);font-size:12px">—</span></td>
                <td><span class="badge">{{ c.tamContainer }}</span></td>
                <td>{{ c.data | date:'dd/MM/yyyy' }}</td>
                <td>
                  <span class="status-custo-badge" [ngStyle]="{ background: c.status === 'Finalizado' ? '#22c55e' : '#f59e0b' }">
                    {{ c.status === 'Finalizado' ? 'Finalizado' : 'Rascunho' }}
                  </span>
                </td>
                <td>{{ totalImpostosCusto(c.id) | currency:'BRL':'symbol':'1.2-2' }}</td>
                <td>
                  <div class="row-actions">
                    <button class="btn-icon" title="Editar" (click)="openWizard(c)">✏️</button>
                    <button class="btn-icon danger" title="Excluir" (click)="remove(c.id)">🗑️</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </ng-container>

      <!-- ── WIZARD ── -->
      <ng-container *ngIf="showWizard">
        <div class="detail-header">
          <h2>{{ editing ? 'Editar Custo — ' + editing.codigoInterno : 'Novo Custo Despachante' }}</h2>
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
              <select [(ngModel)]="p1.despachanteId" [class.err]="showErr && !p1.despachanteId">
                <option value="">— Selecione —</option>
                <option *ngFor="let d of despachantes" [value]="d.id">{{ d.nome }}</option>
              </select>
              <span class="err-msg" *ngIf="showErr && !p1.despachanteId">Obrigatório</span>
            </div>
            <div class="field w2">
              <label>Importador <span class="required">*</span></label>
              <select [(ngModel)]="p1.importadorId" [class.err]="showErr && !p1.importadorId">
                <option value="">— Selecione —</option>
                <option *ngFor="let im of importadores" [value]="im.id">{{ im.razaoSocial }}</option>
              </select>
              <span class="err-msg" *ngIf="showErr && !p1.importadorId">Obrigatório</span>
            </div>
            <div class="field w2">
              <label>Porto Origem <span class="required">*</span></label>
              <select [(ngModel)]="p1.portoOrigemId" [class.err]="showErr && !p1.portoOrigemId">
                <option value="">— Selecione —</option>
                <option *ngFor="let p of portosOrigem" [value]="p.id">{{ p.nome }} ({{ p.codigo }})</option>
              </select>
              <span class="err-msg" *ngIf="showErr && !p1.portoOrigemId">Obrigatório</span>
            </div>
            <div class="field w2">
              <label>Porto Destino <span class="required">*</span></label>
              <select [(ngModel)]="p1.portoDestinoId" [class.err]="showErr && !p1.portoDestinoId">
                <option value="">— Selecione —</option>
                <option *ngFor="let pd of portosDestino" [value]="pd.id">{{ pd.nome }} ({{ pd.codigo }})</option>
              </select>
              <span class="err-msg" *ngIf="showErr && !p1.portoDestinoId">Obrigatório</span>
            </div>
            <div class="field w2">
              <label>Responsável <span class="required">*</span></label>
              <input type="text" [(ngModel)]="p1.responsavel" placeholder="Nome do responsável"
                     [class.err]="showErr && !p1.responsavel.trim()" />
              <span class="err-msg" *ngIf="showErr && !p1.responsavel.trim()">Obrigatório</span>
            </div>
            <div class="field">
              <label>Data <span class="required">*</span></label>
              <input type="date" [(ngModel)]="p1.data" [class.err]="showErr && !p1.data" />
              <span class="err-msg" *ngIf="showErr && !p1.data">Obrigatório</span>
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
              <input type="number" [(ngModel)]="p1.peso" min="0" placeholder="0" />
            </div>
            <div class="field">
              <label>FOB (USD)</label>
              <input type="number" [(ngModel)]="p1.fobUsd" min="0" step="0.01" placeholder="0.00" />
            </div>
            <div class="field">
              <label>FOB (R$)</label>
              <input type="number" [(ngModel)]="p1.fobReais" min="0" step="0.01" placeholder="0.00" />
            </div>
            <div class="field">
              <label>CIF (USD)</label>
              <input type="number" [(ngModel)]="p1.cifUsd" min="0" step="0.01" placeholder="0.00" />
            </div>
            <div class="field">
              <label>CIF (R$)</label>
              <input type="number" [(ngModel)]="p1.cifReais" min="0" step="0.01" placeholder="0.00" />
            </div>
            <div class="field">
              <label>Seguro (USD)</label>
              <input type="number" [(ngModel)]="p1.seguroUsd" min="0" step="0.01" placeholder="0.00" />
            </div>
            <div class="field">
              <label>Taxa USD</label>
              <input type="number" [(ngModel)]="p1.taxaUsd" min="0" step="0.0001" placeholder="0.00" />
            </div>
            <div class="field">
              <label>Taxa USD Agente</label>
              <input type="number" [(ngModel)]="p1.taxaUsdAgente" min="0" step="0.0001" placeholder="Opcional" />
            </div>
            <div class="field w3">
              <label>Observação</label>
              <input type="text" [(ngModel)]="p1.observacao" placeholder="Observações gerais" />
            </div>
          </div>

          <div class="actions">
            <button class="btn btn-primary" (click)="nextStep()">Próximo →</button>
            <button class="btn btn-secondary" (click)="salvarTudo('Rascunho')">💾 Salvar Rascunho</button>
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
                <input type="number" [(ngModel)]="liForm.valor" min="0" step="0.01" placeholder="0.00" />
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
            <button class="btn btn-secondary" (click)="salvarTudo('Rascunho')">💾 Salvar Rascunho</button>
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
                <input type="number" [(ngModel)]="despesaForm.valor" min="0" step="0.01" placeholder="0.00" />
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
                    <input type="number" [(ngModel)]="editingDespesaForm.valor" min="0" step="0.01"
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
            <button class="btn btn-secondary" (click)="salvarTudo('Rascunho')">💾 Salvar Rascunho</button>
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
                <input type="number" [(ngModel)]="ncvForm.baseCalculo" min="0" step="0.01" placeholder="0.00" />
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
            <button class="btn btn-secondary" (click)="salvarTudo('Rascunho')">💾 Salvar Rascunho</button>
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
            <span class="status-custo-badge" [ngStyle]="{ background: wizardStatus === 'Finalizado' ? '#22c55e' : '#f59e0b' }">{{ wizardStatus === 'Finalizado' ? 'Finalizado' : 'Rascunho' }}</span>
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
                <span>{{ p1.peso | number:'1.0-0' }} kg</span>
              </div>
              <div class="resumo-dado" *ngIf="p1.observacao">
                <label>Observação</label>
                <span>{{ p1.observacao }}</span>
              </div>
            </div>

            <!-- Valores financeiros -->
            <div style="margin-top:14px;display:grid;grid-template-columns:repeat(4,1fr);gap:8px">
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
                <div style="font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:var(--color-text-muted)">Taxa USD</div>
                <div style="font-size:14px;font-weight:700;margin-top:2px">{{ p1.taxaUsd | number:'1.4-4' }}</div>
              </div>
              <div style="background:var(--color-bg);border:1px solid var(--color-border);border-radius:8px;padding:10px 12px;text-align:center" *ngIf="p1.taxaUsdAgente">
                <div style="font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:var(--color-text-muted)">Taxa USD Agente</div>
                <div style="font-size:14px;font-weight:700;margin-top:2px">{{ p1.taxaUsdAgente | number:'1.4-4' }}</div>
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
            <button class="btn btn-secondary" (click)="salvarTudo('Rascunho')">💾 Salvar Rascunho</button>
            <button class="btn btn-primary" (click)="salvarTudo('Finalizado')">✅ Finalizar</button>
            <button class="btn btn-secondary" (click)="prevStep()">← Voltar</button>
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
  showWizard = false;
  editing: CustoDespachante | null = null;

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
  wizardStatus: StatusCustoDespachante = 'Rascunho';

  p1 = {
    despachanteId: '', importadorId: '', portoOrigemId: '', portoDestinoId: '',
    responsavel: '', data: new Date().toISOString().slice(0, 10), tamContainer: '40' as '20' | '40' | 'LCL', peso: 0,
    fobUsd: 0, fobReais: 0, cifUsd: 0, cifReais: 0, seguroUsd: 0,
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
    private orcVendaSvc: OrcamentoVendaService,
    private route: ActivatedRoute
  ) {}

  private todayStr(): string { return new Date().toISOString().slice(0, 10); }

  ngOnInit(): void {
    this.despachantes  = this.despachanteSvc.getAtivos();
    this.importadores  = this.importadorSvc.getAtivos();
    this.portosOrigem  = this.portoOrigemSvc.getAtivos();
    this.portosDestino = this.portoDestinoSvc.getAtivos();
    this.ncms          = this.ncmSvc.getAtivos();
    this.modelos       = this.modeloSvc.getAll().filter(m => m.ativo);
    this.load();
    // Pré-preencher wizard se vier de uma Solicitação de Orçamento
    const qp = this.route.snapshot.queryParams;
    if (qp['solicitacaoId']) {
      this.p1.solicitacaoOrcamentoId = qp['solicitacaoId'];
      this.p1.portoOrigemId  = qp['portoOrigemId']  ?? '';
      this.p1.portoDestinoId = qp['portoDestinoId'] ?? '';
      this.p1.importadorId   = qp['importadorId']   ?? '';
      this.p1.tamContainer   = (['20','40','LCL'].includes(qp['tamContainer']) ? qp['tamContainer'] : '40') as '20'|'40'|'LCL';
      this.p1.peso           = Number(qp['peso']) || 0;
      this.p1.responsavel    = qp['responsavel']    ?? '';
      this.showWizard = true;
    }
  }

  load(): void { this.custos = this.service.getAll(); }

  get filtered(): CustoDespachante[] {
    if (!this.q) return this.custos;
    const s = this.q.toLowerCase();
    return this.custos.filter(c =>
      c.codigoInterno.toLowerCase().includes(s) ||
      this.nomeDespachanteById(c.despachanteId).toLowerCase().includes(s) ||
      this.nomeImportadorById(c.importadorId).toLowerCase().includes(s)
    );
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
      alert(`Arquivo: ${nomeArquivo}\n\nO arquivo ainda não possui URL — será disponibilizado após integração com a API.`);
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
    if (this.step === 1 && !this.validateP1()) return;
    this.showErr = false;
    this.completedSteps.add(this.step);
    this.step++;
  }

  prevStep(): void { this.step--; }

  goToStep(target: number): void {
    if (target === this.step) return;
    this.showErr = false;
    this.step = target;
  }

  validateP1(): boolean {
    this.showErr = true;
    return !!(this.p1.despachanteId && this.p1.importadorId &&
              this.p1.portoOrigemId && this.p1.portoDestinoId &&
              this.p1.responsavel.trim() && this.p1.data);
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

  // ── CRUD ──────────────────────────────────────────────────────────────

  openWizard(item?: CustoDespachante): void {
    this.editing = item ?? null;
    this.step = 1;
    this.completedSteps = new Set<number>();
    this.showErr = false;
    this.liErro = '';
    this.despesaErro = '';
    this.ncvErro = '';
    this.ncmSel = '';
    this.cancelEditDespesa();

    if (item) {
      this.wizardStatus = item.status ?? 'Rascunho';
      this.p1 = {
        despachanteId: item.despachanteId,
        importadorId:  item.importadorId,
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
    } else {
      this.wizardStatus = 'Rascunho';
      this.p1 = {
        despachanteId: '', importadorId: '', portoOrigemId: '', portoDestinoId: '',
        responsavel: '', data: this.todayStr(), tamContainer: '40', peso: 0,
        fobUsd: 0, fobReais: 0, cifUsd: 0, cifReais: 0, seguroUsd: 0,
        taxaUsd: 0, taxaUsdAgente: undefined, observacao: '',
        solicitacaoOrcamentoId: undefined
      };
      this.lisForm = [];
      this.despesasForm = [];
      this.ncvsForm = [];
    }
    this.liForm = { ncm: '', descricao: '', valor: 0, data: this.todayStr() };
    this.despesaForm = { descricao: '', valor: 0, data: this.todayStr(), entraBaseIcms: false };
    this.ncvForm = { ncmId: '', numeroNcm: '', descricao: '', aliIi: 0, aliIpi: 0, aliPis: 0, aliCofins: 0, aliIcms: 0, baseCalculo: 0 };
    this.showWizard = true;
  }

  cancelWizard(): void { this.showWizard = false; this.editing = null; }

  salvarTudo(status: StatusCustoDespachante = 'Rascunho'): void {
    if (!this.validateP1()) return;
    const data = {
      despachanteId:  this.p1.despachanteId,
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
      taxaUsd:        this.p1.taxaUsd || 0,
      taxaUsdAgente:  this.p1.taxaUsdAgente,
      observacao:     this.p1.observacao.trim() || undefined,
      solicitacaoOrcamentoId: this.p1.solicitacaoOrcamentoId || undefined,
      status
    };

    let custoId: string;
    if (this.editing) {
      this.service.update({ ...this.editing, ...data });
      custoId = this.editing.id;
    } else {
      const created = this.service.create(data);
      custoId = created.id;
    }

    const today = new Date().toISOString().split('T')[0];

    // Salva LIs
    this.service.replaceLis(custoId, this.lisForm.map(li => ({
      ncm: li.ncm, descricao: li.descricao, valor: li.valor, data: li.data || today
    })));

    // Salva Despesas
    this.service.replaceDespesas(custoId, this.despesasForm.map(d => ({
      descricao: d.descricao, valor: d.valor, data: d.data || today, entraBaseIcms: d.entraBaseIcms
    })));

    // Salva NCMs vinculados + calcula impostos
    const ncvsSalvos = this.service.replaceNcmsVinculados(custoId, this.ncvsForm.map(nv => ({
      ncmId: nv.ncmId, numeroNcm: nv.numeroNcm, descricao: nv.descricao,
      aliIi: nv.aliIi, aliIpi: nv.aliIpi, aliPis: nv.aliPis, aliCofins: nv.aliCofins,
      aliIcms: nv.aliIcms, baseCalculo: nv.baseCalculo
    })));

    ncvsSalvos.forEach(nv => {
      const valor = this.calculator.calcularImpostos(nv);
      this.service.saveValorImposto(valor);
    });

    this.wizardStatus = status;
    // Mark all steps complete when saving
    for (let i = 1; i <= 5; i++) this.completedSteps.add(i);

    // Se finalizado e vinculado a uma solicitação, atualiza status do despachante
    if (status === 'Finalizado' && this.p1.solicitacaoOrcamentoId) {
      const solId = this.p1.solicitacaoOrcamentoId;
      const despachantes = this.solicitacaoSvc.getDespachantes(solId);
      const linked = despachantes.find(d => d.despachanteId === this.p1.despachanteId);
      if (linked && linked.status !== 'FinalizadoDespachante') {
        this.solicitacaoSvc.updateDespachante({ ...linked, status: 'FinalizadoDespachante' });
      }

      // Verifica se TODOS os despachantes da solicitação estão finalizados
      const refreshed = this.solicitacaoSvc.getDespachantes(solId);
      const todosFinalizados = refreshed.length > 0 &&
        refreshed.every(d => d.status === 'FinalizadoDespachante');

      if (todosFinalizados) {
        // Atualiza status da solicitação
        const sol = this.solicitacaoSvc.getById(solId);
        if (sol && sol.status !== 'AguardandoOrcamentoVenda') {
          this.solicitacaoSvc.update({ ...sol, status: 'AguardandoOrcamentoVenda' });
        }
        // Atualiza status do Orçamento de Venda vinculado
        const ovs = this.orcVendaSvc.getBySolicitacao(solId);
        ovs.forEach(ov => {
          if (ov.status !== 'AguardandoOrcamentoVenda') {
            this.orcVendaSvc.update({ ...ov, status: 'AguardandoOrcamentoVenda' });
          }
        });
      }
    }

    this.cancelWizard();
    this.load();
  }

  remove(id: string): void {
    if (confirm('Deseja excluir este custo e todos os seus dados vinculados?')) {
      this.service.remove(id);
      this.load();
    }
  }

  openPreview(): void {
    this.previewSrcdoc = this.sanitizer.bypassSecurityTrustHtml(this.buildPlanilhaHtml(false));
    this.previewMaximized = false;
    this.showPreview = true;
  }

  exportarPDF(): void {
    const win = window.open('', '_blank');
    if (!win) { alert('Popup bloqueado. Permita pop-ups para este site e tente novamente.'); return; }
    win.document.write(this.buildPlanilhaHtml(true));
    win.document.close();
  }

  private buildPlanilhaHtml(autoPrint = false): string {
    const fmtBRL  = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const fmtUSD  = (v: number) => v.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    const fmtNum  = (v: number, dec = 2) => v.toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
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
      ${this.wizardStatus === 'Finalizado' ? '<span style="color:#166534;font-weight:700">&#10004; FINALIZADO</span>' : '<span style="color:#92400e;font-weight:700">&#8987; RASCUNHO</span>'}
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
        <tr><td>Seguro</td><td class="val-r">${fmtUSD(this.p1.seguroUsd||0)}</td><td>&mdash;</td></tr>
        <tr><td>Taxa USD</td><td colspan="2" class="val-r">${fmtNum(this.p1.taxaUsd||0,4)}</td></tr>
        ${this.p1.taxaUsdAgente!=null ? `<tr><td>Taxa USD Agente</td><td colspan="2" class="val-r">${fmtNum(this.p1.taxaUsdAgente,4)}</td></tr>` : ''}
      </table>
    </td>
    <td colspan="2" style="vertical-align:top;padding:0">
      <table class="ita">
        <tr><th colspan="2">DADOS DA OPERACAO</th></tr>
        <tr><td class="lbl">Porto Origem</td><td class="val-r val-b">${portoOrg}</td></tr>
        <tr><td class="lbl">Porto Destino</td><td class="val-r val-b">${portoDst}</td></tr>
        <tr><td class="lbl">Container</td><td class="val-r val-b">${this.p1.tamContainer}</td></tr>
        <tr><td class="lbl">Peso</td><td class="val-r val-b">${fmtNum(this.p1.peso||0,0)} kg</td></tr>
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
