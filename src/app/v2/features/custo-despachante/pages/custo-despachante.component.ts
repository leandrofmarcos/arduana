import { Component, OnInit } from '@angular/core';
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
    }
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
              <div class="step-circle" [class.active]="step === i+1" [class.done]="step > i+1">
                {{ step > i+1 ? '✓' : i+1 }}
              </div>
              <span class="step-label" [class.active]="step === i+1">{{ s }}</span>
            </div>
            <div class="step-connector" [class.done]="step > i+1" *ngIf="!last"></div>
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

        <!-- ─ PASSO 5 — Resumo ─ -->
        <div class="card" *ngIf="step === 5">
          <h3 style="margin:0 0 16px;font-size:15px;font-weight:800">📋 Resumo do Custo</h3>

          <!-- Dados básicos -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 24px;margin-bottom:20px;font-size:13px">
            <div><strong>Despachante:</strong> {{ nomeDespachanteById(p1.despachanteId) }}</div>
            <div><strong>Importador:</strong> {{ nomeImportadorById(p1.importadorId) }}</div>
            <div><strong>Porto Origem:</strong> {{ nomePortoOrigemById(p1.portoOrigemId) }}</div>
            <div><strong>Porto Destino:</strong> {{ nomePortoDestinoById(p1.portoDestinoId) }}</div>
            <div><strong>Responsável:</strong> {{ p1.responsavel }}</div>
            <div><strong>Data:</strong> {{ p1.data | date:'dd/MM/yyyy' }}</div>
            <div><strong>Container:</strong> {{ p1.tamContainer }}</div>
            <div><strong>Peso:</strong> {{ p1.peso | number:'1.0-0' }} kg</div>
          </div>

          <!-- Totais -->
          <div style="border: 1.5px solid var(--color-border);border-radius:10px;padding:16px">
            <div class="resumo-row">
              <span>FOB USD</span>
              <span>{{ p1.fobUsd | currency:'USD':'symbol':'1.2-2' }}</span>
            </div>
            <div class="resumo-row">
              <span>CIF R$</span>
              <span>{{ p1.cifReais | currency:'BRL':'symbol':'1.2-2' }}</span>
            </div>
            <div class="resumo-row">
              <span>Total LI ({{ lisForm.length }} itens)</span>
              <span>{{ totalLis() | currency:'BRL':'symbol':'1.2-2' }}</span>
            </div>
            <div class="resumo-row">
              <span>Total Despesas ({{ despesasForm.length }} itens)</span>
              <span>{{ totalDespesas() | currency:'BRL':'symbol':'1.2-2' }}</span>
            </div>
            <div class="resumo-row" style="font-weight:700;color:#059669">
              <span>Total Impostos ({{ ncvsForm.length }} NCMs)</span>
              <span>{{ totalNcvs() | currency:'BRL':'symbol':'1.2-2' }}</span>
            </div>
            <!-- Detalhes por NCM -->
            <ng-container *ngFor="let nv of ncvsForm">
              <div class="imposto-detalhe">
                {{ nv.numeroNcm }} — {{ nv.descricao }}: {{ calcTotal(nv) | currency:'BRL':'symbol':'1.2-2' }}
              </div>
            </ng-container>
            <div class="resumo-total">
              <span>TOTAL GERAL</span>
              <span>{{ totalGeral() | currency:'BRL':'symbol':'1.2-2' }}</span>
            </div>
          </div>

          <div class="actions">
            <button class="btn btn-secondary" (click)="salvarTudo('Rascunho')">💾 Salvar Rascunho</button>
            <button class="btn btn-primary" (click)="salvarTudo('Finalizado')">✅ Finalizar</button>
            <button class="btn btn-secondary" (click)="prevStep()">← Voltar</button>
            <button class="btn btn-secondary" style="margin-left:auto" (click)="cancelWizard()">Cancelar</button>
          </div>
        </div>
      </ng-container>

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

  // ── Wizard state ──────────────────────────────────────────────────────
  step = 1;
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
    this.step++;
  }

  prevStep(): void { this.step--; }

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

    // Se finalizado e vinculado a uma solicitação, atualiza status do despachante
    if (status === 'Finalizado' && this.p1.solicitacaoOrcamentoId) {
      const despachantes = this.solicitacaoSvc.getDespachantes(this.p1.solicitacaoOrcamentoId);
      const linked = despachantes.find(d => d.despachanteId === this.p1.despachanteId);
      if (linked && linked.status !== 'FinalizadoDespachante') {
        this.solicitacaoSvc.updateDespachante({ ...linked, status: 'FinalizadoDespachante' });
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
}
