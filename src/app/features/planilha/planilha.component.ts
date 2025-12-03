import { Component, inject, OnInit } from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlanilhaService } from './planilha.service';
import { PlanilhasService } from '../planilhas/planilhas.service';
import { PortosService } from '../portos/portos.service';
import { AliquotasService } from '../aliquotas/aliquotas.service';

@Component({
  selector: 'app-planilha',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div id="print-root" class="container" *ngIf="snapshot$ | async as s">
      <div *ngIf="toastVisible" class="toast">{{toastMessage}}</div>
      <div class="header">
        <div class="header-left">
          <h1>📊 Sistema de Gestão de Custos de Importação</h1>
          <p>Controle completo de custos e impostos · Simulação em tempo real</p>
          <div *ngIf="faseLabel" class="fase-badge">{{faseLabel}}</div>
        </div>
        <div class="header-grid">
          <div class="header-item"><label>Produto</label><input type="text" [(ngModel)]="produto"></div>
          <div class="header-item"><label>Código</label><input type="text" [(ngModel)]="codigo"></div>
          <div class="header-item"><label>Processo</label><input type="text" [(ngModel)]="processo"></div>
          <div class="header-item"><label>Cliente</label><input type="text" [(ngModel)]="cliente"></div>
          <div class="header-item"><label>Data Simulação</label><input type="date" [(ngModel)]="dataSimulacao"></div>
          <div class="header-item"><label>Origem</label><select [(ngModel)]="origem"><option>China</option><option>EUA</option><option>Europa</option><option>Ásia</option></select></div>
        </div>
      </div>
      <div id="print-view" *ngIf="printMode" class="pv-root">
        <div class="pv-title">PLANILHA DE CUSTOS</div>
        <div class="pv-header">
          <div class="pv-header-row">
            <div class="pv-cell">{{codigo}}</div>
            <div class="pv-cell">{{processo}}</div>
            <div class="pv-cell">{{cliente}}</div>
            <div class="pv-cell">{{dataSimulacao | date:'dd/MM/yyyy'}}</div>
          </div>
        </div>
        <div class="pv-section">
          <div class="pv-section-title">1 - PREMISSAS DA OPERAÇÃO</div>
          <div class="pv-grid-2">
            <table class="pv-table">
              <tbody>
                <tr><td class="pv-label">FOB</td><td class="pv-value">{{s.premissas.fobUsd | currency:'USD'}} <span class="pv-sub">{{s.premissas.fobUsd * s.premissas.taxaUsd | currency:'BRL'}}</span></td></tr>
                <tr><td class="pv-label">Frete Inter. Cálculo Impostos</td><td class="pv-value">{{s.premissas.freteUsd | currency:'USD'}} <span class="pv-sub">{{s.premissas.freteUsd * s.premissas.taxaUsd | currency:'BRL'}}</span></td></tr>
                <tr><td class="pv-label">Seguro</td><td class="pv-value">{{s.premissas.seguroUsd | currency:'USD'}} <span class="pv-sub">{{s.premissas.seguroUsd * s.premissas.taxaUsd | currency:'BRL'}}</span></td></tr>
                <tr><td class="pv-label">Taxa USD FREIGHT V3</td><td class="pv-value">{{s.premissas.taxaUsd | number:'1.4-4'}}</td></tr>
                <tr><td class="pv-label">NCM</td><td class="pv-value">{{s.premissas.ncm}}</td></tr>
                <tr><td class="pv-label">{{produto}}</td><td class="pv-value"></td></tr>
              </tbody>
            </table>
            <table class="pv-table">
              <tbody>
                <tr><td class="pv-label">Imposto de Importação</td><td class="pv-value">{{s.taxas.ii | number:'1.2-2'}}%</td></tr>
                <tr><td class="pv-label">I.P.I</td><td class="pv-value">{{s.taxas.ipi | number:'1.2-2'}}%</td></tr>
                <tr><td class="pv-label">ICMS</td><td class="pv-value">{{s.taxas.icms | number:'1.2-2'}}%</td></tr>
                <tr><td class="pv-label">PIS</td><td class="pv-value">{{s.taxas.pis | number:'1.2-2'}}%</td></tr>
                <tr><td class="pv-label">COFINS</td><td class="pv-value">{{s.taxas.cofins | number:'1.2-2'}}%</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="pv-section">
          <div class="pv-section-title">2 - DESPESAS NO DESEMBARAÇO (DESEMBARAÇO NO PORTO • VALORES ESTIMADOS)</div>
          <table class="pv-table pv-expenses">
            <thead>
              <tr><th>Categoria</th><th>Item</th><th>Valor (R$)</th></tr>
            </thead>
            <tbody>
              <ng-container *ngFor="let cat of categorias">
                <tr [class]="'pv-cat pv-cat-'+catMap[cat]"><td colspan="3">{{cat}}</td></tr>
                <tr *ngFor="let d of itemsPorCategoria(cat,s)">
                  <td></td><td>{{d.item}}{{d.observacao? ' · '+d.observacao: ''}}</td><td class="pv-num">{{d.valor | currency:'BRL'}}</td>
                </tr>
              </ng-container>
              <tr class="pv-subtotal"><td colspan="2">Total de despesas com desembaraço</td><td class="pv-num">{{s.totalDespesas | currency:'BRL'}}</td></tr>
            </tbody>
          </table>
        </div>
        <div class="pv-section">
          <div class="pv-section-title">3 - CUSTOS DO PRODUTO IMPORTADO</div>
          <div class="pv-grid-2">
            <table class="pv-table">
              <tbody>
                <tr><td class="pv-label">Base de Cálculo</td><td class="pv-value">{{calcBase(s) | currency:'BRL'}}</td></tr>
                <tr><td class="pv-label">Imposto de Importação (II)</td><td class="pv-value">{{calcII(s) | currency:'BRL'}}</td></tr>
                <tr><td class="pv-label">IPI</td><td class="pv-value">{{calcIPI(s) | currency:'BRL'}}</td></tr>
                <tr><td class="pv-label">PIS</td><td class="pv-value">{{calcPIS(s) | currency:'BRL'}}</td></tr>
                <tr><td class="pv-label">COFINS</td><td class="pv-value">{{calcCOFINS(s) | currency:'BRL'}}</td></tr>
                <tr><td class="pv-label">Total de Tributos</td><td class="pv-value">{{s.resumo.tributos | currency:'BRL'}}</td></tr>
                <tr><td class="pv-label">Despesas no Desembaraço</td><td class="pv-value">{{s.totalDespesas | currency:'BRL'}}</td></tr>
                <tr class="pv-highlight"><td class="pv-label">Desembolso Total na Operação</td><td class="pv-value">{{s.resumo.desembolsoTotal | currency:'BRL'}}</td></tr>
                <tr><td class="pv-label">Desembolso para o desembaraço</td><td class="pv-value">{{desembolsoUsd(s) | currency:'USD'}}</td></tr>
              </tbody>
            </table>
            <table class="pv-table">
              <tbody>
                <tr><td class="pv-label">II</td><td class="pv-value">{{s.taxas.ii | number:'1.2-2'}}%</td></tr>
                <tr><td class="pv-label">IPI</td><td class="pv-value">{{s.taxas.ipi | number:'1.2-2'}}%</td></tr>
                <tr><td class="pv-label">ICMS</td><td class="pv-value">{{s.taxas.icms | number:'1.2-2'}}%</td></tr>
                <tr><td class="pv-label">PIS</td><td class="pv-value">{{s.taxas.pis | number:'1.2-2'}}%</td></tr>
                <tr><td class="pv-label">COFINS</td><td class="pv-value">{{s.taxas.cofins | number:'1.2-2'}}%</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="pv-section">
          <div class="pv-section-title">5 - ANÁLISE CONCLUSIVA DA PLANILHA</div>
          <table class="pv-table">
            <tbody>
              <tr><td class="pv-label">Benefício Fiscal</td><td class="pv-value">{{beneficioFiscal | number:'1.2-2'}}</td></tr>
              <tr><td class="pv-label">Total real na operação sobre valor FOB</td><td class="pv-value">{{percSobreFob(s) | number:'1.2-2'}}%</td></tr>
            </tbody>
          </table>
        </div>
        <div class="pv-section">
          <div class="pv-section-title">7 - RESUMO FINANCEIRO</div>
          <table class="pv-table">
            <tbody>
              <tr><td class="pv-label">Tributos</td><td class="pv-value">{{s.resumo.tributos | currency:'BRL'}}</td></tr>
              <tr><td class="pv-label">Despesas no Desembaraço</td><td class="pv-value">{{s.totalDespesas | currency:'BRL'}}</td></tr>
              <tr><td class="pv-label">Desembolso Total</td><td class="pv-value">{{s.resumo.desembolsoTotal | currency:'BRL'}}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="main-content">
        <div class="left-panel">
          <div class="section">
            <h2 class="section-title" (click)="toggle('premissas')"><span class="section-number">1</span>Premissas da Operação <span class="chevron">{{accordion.premissas? '▾':'▸'}}</span></h2>
            <div class="section-body" *ngIf="accordion.premissas">
            <div class="form-grid">
              <div class="field"><label><span class="icon">💵</span> FOB (USD)</label><input type="number" step="0.01" min="0" [(ngModel)]="s.premissas.fobUsd" (change)="atualizarPremissas(s.premissas)"><div class="hint">{{s.premissas.fobUsd | currency:'USD'}}</div></div>
              <div class="field"><label>FOB (R$)</label><input type="text" [value]="s.premissas.fobUsd * s.premissas.taxaUsd | currency:'BRL'" readonly></div>
              <div class="field"><label>Frete Inter. (USD)</label><input type="number" step="0.01" min="0" [(ngModel)]="s.premissas.freteUsd" (change)="atualizarPremissas(s.premissas)"><div class="hint">{{s.premissas.freteUsd | currency:'USD'}}</div></div>
              <div class="field"><label>Frete Inter. (R$)</label><input type="text" [value]="s.premissas.freteUsd * s.premissas.taxaUsd | currency:'BRL'" readonly></div>
              <div class="field"><label>Seguro (USD)</label><input type="number" step="0.01" min="0" [(ngModel)]="s.premissas.seguroUsd" (change)="atualizarPremissas(s.premissas)"><div class="hint">{{s.premissas.seguroUsd | currency:'USD'}}</div></div>
              <div class="field"><label>THC (USD)</label><input type="number" step="0.01" min="0" [(ngModel)]="s.premissas.thcUsd" (change)="atualizarPremissas(s.premissas)"><div class="hint">{{s.premissas.thcUsd | currency:'USD'}}</div></div>
              <div class="field"><label><span class="icon">💱</span> Taxa USD</label><input type="number" step="0.0001" [(ngModel)]="s.premissas.taxaUsd" (change)="atualizarPremissas(s.premissas)"><div class="hint">{{s.premissas.taxaUsd | number:'1.4-4'}}</div></div>
              <div class="field"><label>Taxa EUR</label><input type="number" step="0.0001" [(ngModel)]="taxaEur"><div class="hint">{{taxaEur | number:'1.4-4'}}</div></div>
              <div class="field"><label>Peso Líquido (kg)</label><input type="number" [(ngModel)]="pesoLiquido" step="0.01"><div class="hint">{{pesoLiquido | number:'1.2-2'}} kg</div></div>
              <div class="field"><label>Quant. Produtos</label><input type="number" [(ngModel)]="quantProdutos" step="1"><div class="hint">{{quantProdutos | number}}</div></div>
              <div class="field"><label>NCM</label><input type="text" inputmode="numeric" pattern="[0-9]{4,8}" placeholder="8423" [(ngModel)]="s.premissas.ncm" (change)="atualizarPremissas(s.premissas)"></div>
              <div class="field"><label>Unid. Medida</label><select [(ngModel)]="unidMedida"><option>1X40HC</option><option>20FT</option><option>40FT</option></select></div>
              <div class="field"><label>Estatística</label><input type="text" [(ngModel)]="estatistica"></div>
              <div class="field"><label>Volume (m³)</label><input type="number" step="0.0001" [(ngModel)]="volume"><div class="hint">{{volume | number:'1.3-3'}} m³</div></div>
              <div class="field"><label>FCL / LCL</label><select [(ngModel)]="fcl"><option>FCL</option><option>LCL</option></select></div>
              <div class="field"><label>Incoterm</label><select [(ngModel)]="incoterm"><option>FOB</option><option>CIF</option><option>EXW</option></select></div>
              <div class="field"><label>Preço por Peça</label><input type="number" step="0.01" [(ngModel)]="precoPeca"><div class="hint">{{precoPeca | currency:'USD'}}</div></div>
              <div class="field"><label>Porto</label><select [(ngModel)]="porto"><option *ngFor="let p of (portos$ | async)" [value]="p.codigo">{{p.nome}} ({{p.codigo}})</option></select></div>
              <div class="field"><label>Benefício Fiscal Repassado (%)</label><input type="number" step="0.01" [(ngModel)]="beneficioFiscal"><div class="hint">{{beneficioFiscal | number:'1.2-2'}}%</div></div>
              <div class="field"><label>Quantidade</label><input type="number" [(ngModel)]="quantidade" step="1"><div class="hint">{{quantidade | number}}</div></div>
            </div>
            <div class="divider"></div>
            <h3 style="font-size: 16px; color: #4a5568; margin-bottom: 12px; font-weight: 600;">Alíquotas de Impostos</h3>
            <div class="toolbar">
              <div style="display:flex;gap:10px;align-items:center;width:100%">
                <label style="font-size:13px;color:var(--color-muted);font-weight:600">Perfil</label>
                <select [(ngModel)]="selectedAliquotaId" (ngModelChange)="aplicarAliquota($event)" style="flex:1;padding:10px 12px;border:2px solid var(--color-border);border-radius:8px">
                  <option *ngFor="let a of aliquotasList" [value]="a.id">{{a.nome}}</option>
                </select>
                <button class="btn btn-secondary" (click)="toggleAliquotas()">Editar alíquotas</button>
                <a class="btn btn-secondary" href="/aliquotas">Gerenciar Perfis</a>
              </div>
            </div>
            <div id="aliquotas" class="form-grid-3">
              <div class="field"><label>Imposto Importação (%)</label><input type="number" step="0.01" [readOnly]="aliqReadonly" [(ngModel)]="s.taxas.ii" (change)="atualizarTaxas(s.taxas)"></div>
              <div class="field"><label>IPI (%)</label><input type="number" step="0.01" [readOnly]="aliqReadonly" [(ngModel)]="s.taxas.ipi" (change)="atualizarTaxas(s.taxas)"></div>
              <div class="field"><label>ICMS (%)</label><input type="number" step="0.01" [readOnly]="aliqReadonly" [(ngModel)]="s.taxas.icms" (change)="atualizarTaxas(s.taxas)"></div>
              <div class="field"><label>PIS (%)</label><input type="number" step="0.01" [readOnly]="aliqReadonly" [(ngModel)]="s.taxas.pis" (change)="atualizarTaxas(s.taxas)"></div>
              <div class="field"><label>COFINS (%)</label><input type="number" step="0.01" [readOnly]="aliqReadonly" [(ngModel)]="s.taxas.cofins" (change)="atualizarTaxas(s.taxas)"></div>
              <div class="field"><label>Benefício Fiscal (%)</label><input type="number" step="0.01" [readOnly]="aliqReadonly" [(ngModel)]="beneficioFiscalPerc"></div>
            </div>
            </div>
          </div>
          <div class="section">
            <h2 class="section-title" (click)="toggle('despesas')"><span class="section-number">2</span>Despesas no Desembaraço <span class="chevron">{{accordion.despesas? '▾':'▸'}}</span></h2>
            <div class="section-body" *ngIf="accordion.despesas">
            <div class="form-grid-2" style="margin-bottom:16px;">
              <div class="field"><label>Categoria</label><select [(ngModel)]="novaDespesa.categoria"><option>Agência Marítima</option><option>Despachante</option><option>Tributos</option><option>Porto</option><option>Outros</option></select></div>
              <div class="field"><label>Item</label><input [(ngModel)]="novaDespesa.item" type="text" placeholder="Descrição do item"></div>
              <div class="field"><label>Fornecedor</label><input [(ngModel)]="novaDespesa.fornecedor" type="text" placeholder="Fornecedor opcional"></div>
              <div class="field"><label>Valor (R$)</label><input [(ngModel)]="novaDespesa.valor" type="number" step="0.01" placeholder="0,00"></div>
              <div class="field" style="grid-column: 1 / -1;"><label>Observação</label><input [(ngModel)]="novaDespesa.observacao" type="text" placeholder="Detalhes opcionais"></div>
            </div>
            <div class="action-buttons">
              <button class="btn btn-primary" (click)="adicionarDespesa()">Adicionar</button>
              <button class="btn btn-secondary" (click)="limparDespesaForm()">Limpar campos</button>
            </div>
            <div class="chip-group">
              <button class="chip" [class.active]="activeFilter==='Todas'" (click)="setFilter('Todas')">Todas</button>
              <button class="chip" [class.active]="activeFilter==='Agência Marítima'" (click)="setFilter('Agência Marítima')">Agência Marítima</button>
              <button class="chip" [class.active]="activeFilter==='Despachante'" (click)="setFilter('Despachante')">Despachante</button>
              <button class="chip" [class.active]="activeFilter==='Tributos'" (click)="setFilter('Tributos')">Tributos</button>
              <button class="chip" [class.active]="activeFilter==='Porto'" (click)="setFilter('Porto')">Porto</button>
              <button class="chip" [class.active]="activeFilter==='Outros'" (click)="setFilter('Outros')">Outros</button>
            </div>
            <div>
              <div class="category-group" *ngFor="let cat of categorias">
                <div class="category-header"><span>{{cat}}</span><span class="category-total">{{totalPorCategoria(cat,s) | currency:'BRL'}}</span></div>
                <div *ngFor="let d of despesasFiltradas(cat,s)" class="expense-row">
                  <div>{{d.item}}{{d.observacao? ' — '+d.observacao: ''}}</div>
                  <div>{{d.fornecedor}}</div>
                  <div class="expense-amount">{{d.valor | currency:'BRL'}}</div>
                  <div class="expense-actions"><button class="btn btn-secondary" (click)="editarDespesa(d)">Editar</button><button class="btn btn-secondary" (click)="removerDespesa(d.id)">Excluir</button></div>
                </div>
              </div>
            </div>
            <div class="highlight-box"><strong>Total de Despesas com Desembaraço</strong><span class="value">{{s.totalDespesas | currency:'BRL'}}</span></div>
            </div>
          </div>
          <div class="section">
            <h2 class="section-title" (click)="toggle('custos')"><span class="section-number">3</span>Custos do Produto Importado <span class="chevron">{{accordion.custos? '▾':'▸'}}</span></h2>
            <div class="section-body" *ngIf="accordion.custos">
            <div class="form-grid-2">
              <div class="field"><label>CIF</label><input type="text" [value]="calcBase(s) | currency:'BRL'" readonly></div>
              <div class="field"><label>Desembolso Total na Operação</label><input type="text" [value]="s.resumo.desembolsoTotal | currency:'BRL'" readonly></div>
            </div>
            <div style="margin-top:12px; font-size:14px; color:#2d3748;">
              <span>II: <span>{{calcII(s) | currency:'BRL'}}</span></span> · 
              <span>IPI: <span>{{calcIPI(s) | currency:'BRL'}}</span></span> · 
              <span>PIS: <span>{{calcPIS(s) | currency:'BRL'}}</span></span> · 
              <span>COFINS: <span>{{calcCOFINS(s) | currency:'BRL'}}</span></span>
            </div>
            </div>
          </div>
          <div class="section">
            <h2 class="section-title" (click)="toggle('nfSaida')"><span class="section-number">4</span>Nota Fiscal de Saída <span class="chevron">{{accordion.nfSaida? '▾':'▸'}}</span></h2>
            <div class="section-body" *ngIf="accordion.nfSaida">
            <div class="form-grid-3">
              <div class="field"><label>CFOP</label><input type="text" [ngModel]="s.nfSaida?.cfop" (ngModelChange)="atualizarNfSaida({ cfop: $event })"></div>
              <div class="field"><label>CST/CSOSN</label><select [ngModel]="s.nfSaida?.cst" (ngModelChange)="atualizarNfSaida({ cst: $event })"><option value="">Selecione</option><option>00</option><option>10</option><option>20</option><option>40</option><option>41</option><option>60</option><option>90</option></select></div>
              <div class="field"><label>Alíquota ICMS (%)</label><input type="number" [value]="s.taxas.icms" readonly></div>
              <div class="field"><label>Base ICMS (R$)</label><input type="number" [ngModel]="s.nfSaida?.baseIcms" (ngModelChange)="atualizarNfSaida({ baseIcms: +$event })" step="0.01"></div>
              <div class="field"><label>ICMS (R$)</label><input type="number" [value]="(s.nfSaida?.icms||0) | number:'1.2-2'" readonly></div>
            </div>
            </div>
          </div>
          <div class="section">
            <h2 class="section-title" (click)="toggle('analise')"><span class="section-number">5</span>Análise Conclusiva da Planilha <span class="chevron">{{accordion.analise? '▾':'▸'}}</span></h2>
            <div class="section-body" *ngIf="accordion.analise">
            <div class="form-grid-2">
              <div class="field"><label>Benefício Fiscal</label><input type="text" [value]="0 | number:'1.2-2'" readonly></div>
              <div class="field"><label>Total real na operação sobre valor FOB</label><input type="text" [value]="0 | number:'1.2-2'" readonly></div>
            </div>
            </div>
          </div>
          <div class="section">
            <h2 class="section-title" (click)="toggle('formacao')"><span class="section-number">6</span>Formação do Custo Unitário <span class="chevron">{{accordion.formacao? '▾':'▸'}}</span></h2>
            <div class="section-body" *ngIf="accordion.formacao">
            <div class="info-card">Tabela por item do packlist com rateio selecionado (a implementar).</div>
            </div>
          </div>
        </div>
        <div class="right-panel">
          <div class="summary-panel">
            <h3>📈 Resumo Financeiro</h3>
            <div class="summary-item"><label>Tributos</label><div class="value">{{s.resumo.tributos | currency:'BRL'}}</div></div>
            <div class="summary-item"><label>Outras Despesas</label><div class="value">{{s.totalDespesas | currency:'BRL'}}</div></div>
            <div class="summary-item"><label>PIS/COFINS Saída</label><div class="value">{{0 | currency:'BRL'}}</div></div>
            <div class="summary-item highlight"><label>Desembolso Desembaraço</label><div class="value">{{s.totalDespesas | currency:'BRL'}}</div></div>
            <div class="summary-item highlight"><label>Desembolso Total</label><div class="value">{{s.resumo.desembolsoTotal | currency:'BRL'}}</div></div>
            <div class="summary-item"><label>Benefício Fiscal (4%)</label><div class="value">{{0 | currency:'BRL'}}</div></div>
          </div>
          <div style="background: white; padding: 25px; border-radius: 12px; border: 2px solid #e2e8f0;">
            <h3 style="font-size: 16px; color: #2d3748; margin-bottom: 20px; font-weight: 600;">💰 Preços de Venda</h3>
            <div class="field" style="margin-bottom: 15px;"><label>Com IPI</label><input type="text" [value]="precoComIPI(s) | currency:'BRL'" readonly></div>
            <div class="field" style="margin-bottom: 15px;"><label>Sem IPI</label><input type="text" [value]="precoSemIPI(s) | currency:'BRL'" readonly></div>
            <div class="field" style="margin-bottom: 15px;"><label>Desembolso (USD)</label><input type="text" [value]="desembolsoUsd(s) | currency:'USD'" readonly></div>
            <div class="field"><label>% sobre FOB</label><input type="text" [value]="percSobreFob(s) | number:'1.2-2'" readonly></div>
          </div>
          <div class="action-buttons">
            <button class="btn btn-secondary" (click)="exportar(s)"><span class="icon">📄</span> Exportar</button>
            <button class="btn btn-primary" (click)="salvar()"><span class="icon">💾</span> Salvar</button>
            <button class="btn btn-secondary" (click)="salvarComoCopia()"><span class="icon">📑</span> Salvar como cópia</button>
            <button class="btn btn-primary" [disabled]="locked" (click)="aprovarOrcamento()"><span class="icon">✓</span> Aprovar Orçamento</button>
            <button class="btn btn-secondary" [disabled]="!locked" (click)="novaVersao()"><span class="icon">🧱</span> Nova Versão</button>
          </div>
        </div>
      </div>
      <div class="bottom-actions">
        <div class="info"><span class="badge">✓ Ativo</span><span style="margin-left: 15px;">Última atualização: {{lastUpdate}}</span></div>
        <div class="buttons">
          <button class="btn btn-secondary" (click)="limpar()"><span class="icon">🔄</span> Nova Simulação</button>
          <button class="btn btn-primary" (click)="finalizar()"><span class="icon">✓</span> Finalizar Importação</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `*{margin:0;padding:0;box-sizing:border-box}`,
    `.container{width:100%;margin:0;background:var(--color-surface);border-radius:12px;box-shadow:0 6px 24px rgba(17,24,39,.12)}`,
    `.header{background:linear-gradient(135deg,#1e3c72 0%,#2a5298 100%);color:#fff;padding:40px 50px;display:flex;justify-content:space-between;align-items:flex-start}`,
    `.header-left h1{font-size:32px;margin-bottom:8px;font-weight:700}`,
    `.header-left p{font-size:14px;opacity:.9}`,
    `.fase-badge{display:inline-block;margin-top:8px;padding:6px 10px;border-radius:12px;background:#fff;color:#1e3c72;font-weight:700}`,
    `.header-grid{display:grid;grid-template-columns:repeat(3,280px);gap:20px}`,
    `.header-item{background:rgba(255,255,255,.15);padding:15px 18px;border-radius:10px;backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.2)}`,
    `.header-item label{display:block;font-size:11px;text-transform:uppercase;letter-spacing:1.2px;opacity:.85;margin-bottom:6px;font-weight:600}`,
    `.header-item input{width:100%;background:rgba(255,255,255,.25);border:1px solid rgba(255,255,255,.3);color:#fff;padding:10px 14px;border-radius:6px;font-size:15px;font-weight:500}`,
    `.header-item select{width:100%;background:#fff;border:1px solid rgba(255,255,255,.3);color:var(--color-text);padding:10px 14px;border-radius:6px;font-size:15px;font-weight:500}`,
    `.header-item select option{color:var(--color-text)}`,
    `.main-content{display:grid;grid-template-columns:1fr 420px;gap:24px;min-height:calc(100vh - 200px);background:var(--color-bg);align-items:start}`,
    `.left-panel{padding:40px 50px;background:var(--color-surface)}`,
    `.right-panel{padding:40px 35px;background:var(--color-surface);position:sticky;top:80px;align-self:start}`,
    `.section{margin-bottom:45px}`,
    `.section-title{font-size:20px;color:var(--color-primary-ink);margin-bottom:25px;padding-bottom:12px;border-bottom:3px solid var(--color-primary);display:flex;align-items:center;gap:12px;font-weight:700}`,
    `.section-title{cursor:pointer}`,
    `.section-title .chevron{margin-left:auto;font-size:18px;color:var(--color-primary-ink)}`,
    `.section-body{margin-top:10px}`,
    `.section-number{background:var(--gradient-primary);color:#fff;width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:16px}`,
    `.form-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px 25px}`,
    `.form-grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:20px 25px}`,
    `.form-grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:20px 25px}`,
    `.field{display:flex;flex-direction:column}`,
    `.field label{font-size:13px;font-weight:600;color:var(--color-muted);margin-bottom:8px;display:flex;align-items:center;gap:5px}`,
    `.field input,.field select{padding:13px 16px;border:2px solid var(--color-border);border-radius:8px;font-size:15px;transition:.2s;background:var(--color-surface)}`,
    `.field input:focus,.field select:focus{outline:none;border-color:var(--color-primary);box-shadow:0 0 0 4px rgba(102,126,234,.1)}`,
    `.field input[readonly]{background:var(--color-subtle-bg);color:var(--color-text);font-weight:600;cursor:not-allowed}`,
    `.hint{margin-top:6px;color:var(--color-muted);font-size:12px}`,
    `.highlight-box{background:linear-gradient(135deg,#fef5e7 0%,#fdeaa6 100%);border-left:5px solid #f39c12;padding:20px 25px;border-radius:10px;margin:25px 0;display:flex;justify-content:space-between;align-items:center}`,
    `.highlight-box strong{color:#d68910;font-size:16px}`,
    `.highlight-box .value{font-size:24px;font-weight:700;color:#d68910}`,
    `.summary-panel{background:var(--gradient-primary);color:#fff;padding:30px;border-radius:12px;margin-bottom:25px}`,
    `.summary-panel h3{font-size:18px;margin-bottom:25px;opacity:.95;font-weight:600}`,
    `.summary-item{background:rgba(255,255,255,.15);padding:18px 20px;border-radius:10px;margin-bottom:15px;backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.2)}`,
    `.summary-item .value{font-size:26px;font-weight:700}`,
    `.summary-item.highlight{background:rgba(255,255,255,.25);border:2px solid rgba(255,255,255,.4)}`,
    `.action-buttons{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:15px;margin-top:25px}`,
    `.btn{flex:1;padding:14px 20px;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;transition:.3s;display:flex;align-items:center;justify-content:center;gap:8px}`,
    `.btn-primary{background:var(--gradient-primary);color:#fff}`,
    `.btn-secondary{background:var(--color-surface);color:var(--color-primary);border:2px solid var(--color-primary)}`,
    `.toast{position:fixed;top:16px;right:16px;background:var(--gradient-primary);color:#fff;padding:12px 16px;border-radius:8px;box-shadow:0 6px 24px rgba(17,24,39,.2);z-index:1000}`,
    `.bottom-actions{padding:30px 50px;background:var(--color-subtle-bg);border-top:1px solid var(--color-border);display:flex;justify-content:space-between;align-items:center}`,
    `.bottom-actions .info{color:var(--color-muted);font-size:14px}`,
    `.bottom-actions .buttons{display:flex;gap:15px}`,
    `.bottom-actions .btn{flex:none;min-width:160px}`,
    `.badge{display:inline-block;padding:4px 10px;background:var(--color-success);color:#fff;border-radius:12px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.5px}`,
    `.divider{height:1px;background:#e2e8f0;margin:30px 0}`,
    `.info-card{background:#ebf4ff;border:1px solid #bee3f8;border-left:4px solid #4299e1;padding:18px 20px;border-radius:8px;margin:20px 0;font-size:14px;color:#2c5282}`,
    `.chip-group{display:flex;flex-wrap:wrap;gap:10px;margin:16px 0 22px}`,
    `.chip{padding:8px 14px;border-radius:20px;border:2px solid var(--color-border);background:var(--color-surface);font-size:13px;font-weight:700;color:var(--color-text);cursor:pointer}`,
    `.chip.active{border-color:var(--color-primary);background:#ebf4ff;color:var(--color-primary-ink)}`,
    `.category-group{background:var(--color-surface);border:1px solid var(--color-border);border-radius:12px;margin-bottom:18px;overflow:hidden}`,
    `.category-header{display:flex;justify-content:space-between;align-items:center;padding:16px 18px;background:var(--color-subtle-bg);font-weight:800;color:var(--color-text)}`,
    `.category-total{font-weight:800;color:var(--color-primary-ink)}`,
    `.expense-row{display:grid;grid-template-columns:1.5fr 1fr 0.6fr 0.6fr;gap:12px;padding:12px 18px;align-items:center;border-top:1px solid var(--color-border)}`,
    `.expense-row:nth-child(even){background:#fcfdff}`,
    `.expense-amount{text-align:right;font-weight:700}`,
    `.expense-actions{display:flex;gap:8px;justify-content:flex-end}`,
    `#print-view table th{background:#f7fafc;color:#2d3748;font-weight:700}`,
    `#print-view table td,#print-view table th{font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif}`,
    `.pv-root{width:794px;margin:0 auto;background:#fff;border:1px solid #000;padding:8px}`,
    `.pv-title{text-align:center;font-weight:700;border:1px solid #000;padding:6px;font-size:16px;margin-bottom:6px}`,
    `.pv-header{border:1px solid #000;margin-bottom:6px}`,
    `.pv-header-row{display:grid;grid-template-columns:repeat(4,1fr)}`,
    `.pv-cell{border-right:1px solid #000;padding:6px;font-size:12px}`,
    `.pv-cell:last-child{border-right:none}`,
    `.pv-section{margin-bottom:8px}`,
    `.pv-section-title{background:#e9edf5;border:1px solid #000;padding:6px;font-weight:700;font-size:12px}`,
    `.pv-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:0;border-left:1px solid #000;border-right:1px solid #000}`,
    `.pv-table{width:100%;border-collapse:collapse;font-size:12px}`,
    `.pv-table td,.pv-table th{border:1px solid #000;padding:6px;vertical-align:middle}`,
    `.pv-label{font-weight:600}`,
    `.pv-value{text-align:right}`,
    `.pv-sub{margin-left:8px;color:#555}`,
    `.pv-expenses thead th{text-align:left}`,
    `.pv-num{text-align:right;font-weight:700}`,
    `.pv-cat{font-weight:800}`,
    `.pv-cat-am{background:#ffe699}`,
    `.pv-cat-dp{background:#9dc3e6}`,
    `.pv-cat-tr{background:#a8d08d}`,
    `.pv-cat-po{background:#c5b0e3}`,
    `.pv-cat-ou{background:#f4c7c3}`,
    `.pv-subtotal td{font-weight:800}`,
    `.pv-highlight td{background:#fff2b3;font-weight:800}`
  ]
})
export class PlanilhaComponent implements OnInit {
  private service = inject(PlanilhaService);
  private catalogService = inject(PlanilhasService);
  private portsService = inject(PortosService);
  private aliqService = inject(AliquotasService);
  snapshot$ = this.service.snapshot$();
  portos$ = this.portsService.list$();
  selectedAliquotaId: string | null = null;
  aliquotasList: any[] = [];
  produto = 'BALANÇAS / PESAGEM';
  codigo = 'LELA03';
  processo = 'NBZY25090511';
  cliente = 'ANTÔNIO';
  dataSimulacao = '2025-10-23';
  origem = 'China';
  taxaEur = 0;
  pesoLiquido = 20043.67;
  quantProdutos = 13417;
  unidMedida = '1X40HC';
  estatistica = '';
  volume = 210.5997;
  fcl = 'FCL';
  incoterm = 'FOB';
  precoPeca = 0;
  porto = '';
  beneficioFiscal = 0;
  quantidade = 1;
  beneficioFiscalPerc = 0;
  aliqReadonly = true;
  locked = false;
  accordion = { premissas: true, despesas: true, custos: true, nfSaida: true, analise: true, formacao: true };
  printMode = false;
  categorias = ['Agência Marítima','Despachante','Tributos','Porto','Outros'];
  catMap: any = { 'Agência Marítima': 'am', 'Despachante': 'dp', 'Tributos': 'tr', 'Porto': 'po', 'Outros': 'ou' };
  activeFilter: string = 'Todas';
  lastUpdate = new Date().toLocaleString('pt-BR');
  faseLabel = '';
  toastVisible = false;
  toastMessage = '';

  atualizarPremissas(p: any){ if(this.locked) return; this.service.atualizarPremissas(p); this.update(); }
  atualizarTaxas(t: any){ if(this.locked) return; this.service.atualizarTaxas(t); this.update(); }
  aplicarAliquota(id: string){ const a = this.aliquotasList.find(x => x.id === id); if(!a) return; this.service.atualizarTaxas({ ii: a.ii, ipi: a.ipi, icms: a.icms, pis: a.pis, cofins: a.cofins }); this.update(); }
  toggleAliquotas(){ if(this.locked) return; this.aliqReadonly = !this.aliqReadonly; }
  toggle(s: string){ (this.accordion as any)[s] = !(this.accordion as any)[s]; }
  setFilter(cat: string){ this.activeFilter = cat; }
  itemsPorCategoria(cat: string, s: any){ return s.despesas.filter((d:any)=> d.categoria===cat); }
  despesasFiltradas(cat: string, s: any){ const base = s.despesas.filter((d:any)=> d.categoria===cat); return this.activeFilter==='Todas'? base: (this.activeFilter===cat? base: []); }
  totalPorCategoria(cat: string, s: any){ const arr = s.despesas.filter((d:any)=> d.categoria===cat); return arr.reduce((sum:number,d:any)=> sum + (d.valor||0), 0); }
  adicionarDespesa(){ if(this.locked) return; const n = this.novaDespesa; if(!n.item || !n.valor){ return; } this.service.adicionarDespesa(n.categoria, n.item, Number(n.valor), n.fornecedor, n.observacao); this.novaDespesa = { categoria: n.categoria, item:'', fornecedor:'', valor:0, observacao:'' }; this.update(); }
  editarDespesa(d:any){ if(this.locked) return; const novoItem = prompt('Item', d.item); if(novoItem===null) return; const novaCategoria = prompt('Categoria', d.categoria); if(novaCategoria===null) return; const novoValorStr = prompt('Valor (R$)', String(d.valor)); if(novoValorStr===null) return; const novoValor = parseFloat(novoValorStr); if(isNaN(novoValor)) return; const cats = ['Agência Marítima','Despachante','Tributos','Porto','Outros'] as const; const cat = (cats as readonly string[]).includes(novaCategoria) ? (novaCategoria as any) : d.categoria; this.service.editarDespesa(d.id, { item: novoItem, categoria: cat, valor: novoValor }); this.update(); }
  removerDespesa(id:string){ if(this.locked) return; this.service.removerDespesa(id); this.update(); }
  calcBase(s:any){ return (s.premissas.fobUsd + s.premissas.freteUsd + s.premissas.seguroUsd + s.premissas.thcUsd) * s.premissas.taxaUsd; }
  calcII(s:any){ const base = this.calcBase(s); return base * (s.taxas.ii/100); }
  calcIPI(s:any){ const base = this.calcBase(s) + this.calcII(s); return base * (s.taxas.ipi/100); }
  calcPIS(s:any){ const base = this.calcBase(s); return base * (s.taxas.pis/100); }
  calcCOFINS(s:any){ const base = this.calcBase(s); return base * (s.taxas.cofins/100); }
  precoComIPI(s:any){ return s.resumo.desembolsoTotal; }
  precoSemIPI(s:any){ return s.resumo.desembolsoTotal - this.calcIPI(s); }
  desembolsoUsd(s:any){ const taxa = s.premissas.taxaUsd || 1; return taxa ? s.resumo.desembolsoTotal / taxa : 0; }
  percSobreFob(s:any){ const fobBrl = s.premissas.fobUsd * s.premissas.taxaUsd; return fobBrl ? (s.resumo.desembolsoTotal / fobBrl) * 100 : 0; }
  atualizarNfSaida(n:any){ this.service.atualizarNfSaida(n); this.update(); }
  async exportar(s:any){ this.printMode = true; await new Promise(r => setTimeout(r, 100)); const el = document.getElementById('print-view'); if(!el){ this.printMode = false; return; } const canvas = await html2canvas(el, { scale: 2, useCORS: true }); const img = canvas.toDataURL('image/png'); const pdf = new jsPDF('p','mm','a4'); const pageW = pdf.internal.pageSize.getWidth(); const pageH = pdf.internal.pageSize.getHeight(); const imgW = pageW; const imgH = canvas.height * imgW / canvas.width; let heightLeft = imgH; let position = 0; pdf.addImage(img, 'PNG', 0, position, imgW, imgH); heightLeft -= pageH; while(heightLeft > 0){ position = heightLeft - imgH; pdf.addPage(); pdf.addImage(img, 'PNG', 0, position, imgW, imgH); heightLeft -= pageH; } pdf.save('planilha-de-custo.pdf'); this.printMode = false; }
  aprovarOrcamento(){ this.service.aprovarOrcamento(); this.locked = true; this.update(); this.updateFaseLabel(); this.showToast('Orçamento aprovado. Fase Aduana iniciada.'); }
  novaVersao(){ this.service.novaVersao(); this.locked = false; this.update(); this.updateFaseLabel(); this.showToast('Edição liberada. Salve para criar nova versão.'); }
  salvar(){ this.service.salvar({ produto: this.produto, cliente: this.cliente, processo: this.processo, origem: this.origem }); alert('Simulação salva como não finalizada.'); }
  salvarComoCopia(){ this.service.salvarComoCopia({ produto: this.produto, cliente: this.cliente, processo: this.processo, origem: this.origem }); alert('Cópia salva no catálogo.'); }
  limpar(){ if(confirm('Nova simulação?')){ location.reload(); } }
  finalizar(){ if(confirm('Finalizar importação?')){ this.service.finalizarImportacao(); alert('Importação finalizada.'); location.href = '/planilhas'; } }
  update(){ this.lastUpdate = new Date().toLocaleString('pt-BR'); }
  ngOnInit(){ this.locked = localStorage.getItem('import_costs_locked') === 'true'; this.aliqService.list$().subscribe(list => { this.aliquotasList = list; const d = list.find((x:any)=> x.padrao); if(d && !this.selectedAliquotaId){ this.selectedAliquotaId = d.id; this.aplicarAliquota(d.id); } }); }
  ngAfterViewInit(){ this.updateFaseLabel();
  }
  diffDays(a: Date, b: Date){ return Math.floor((b.getTime() - a.getTime()) / (1000*60*60*24)); }
  updateFaseLabel(){ const id = localStorage.getItem('import_costs_current_catalog_id'); this.faseLabel=''; if(id){ const meta = this.catalogService.meta(id); if(meta?.faseAtual==='Aduana'){ const start = meta?.faseDates?.Aduana?.start; if(start){ const dias = this.diffDays(new Date(start), new Date()); const restante = Math.max(0, 30 - dias); this.faseLabel = `Aduana · ${restante} dias restantes`; } } else if(meta?.faseAtual==='Orcamento'){ this.faseLabel = `Orçamento`; } else if(meta?.faseAtual==='Fechamento'){ this.faseLabel = `Fechamento`; } }
  }
  showToast(msg: string){ this.toastMessage = msg; this.toastVisible = true; setTimeout(() => { this.toastVisible = false; }, 2500); }
  novaDespesa: any = { categoria: 'Porto', item: '', fornecedor: '', valor: 0, observacao: '' };
  limparDespesaForm(){ const c = this.novaDespesa.categoria; this.novaDespesa = { categoria: c, item: '', fornecedor: '', valor: 0, observacao: '' }; }
}