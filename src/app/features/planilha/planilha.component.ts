import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlanilhaService } from './planilha.service';

@Component({
  selector: 'app-planilha',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container" *ngIf="snapshot$ | async as s">
      <div class="header">
        <div class="header-left">
          <h1>📊 Sistema de Gestão de Custos de Importação</h1>
          <p>Controle completo de custos e impostos · Simulação em tempo real</p>
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
      <div class="main-content">
        <div class="left-panel">
          <div class="section">
            <h2 class="section-title"><span class="section-number">1</span>Premissas da Operação</h2>
            <div class="form-grid">
              <div class="field"><label><span class="icon">💵</span> FOB (USD)</label><input type="number" [(ngModel)]="s.premissas.fobUsd" (change)="atualizarPremissas(s.premissas)"></div>
              <div class="field"><label>FOB (R$)</label><input type="number" [value]="s.premissas.fobUsd * s.premissas.taxaUsd | number:'1.2-2'" readonly></div>
              <div class="field"><label>Frete Inter. (USD)</label><input type="number" [(ngModel)]="s.premissas.freteUsd" (change)="atualizarPremissas(s.premissas)"></div>
              <div class="field"><label>Frete Inter. (R$)</label><input type="number" [value]="s.premissas.freteUsd * s.premissas.taxaUsd | number:'1.2-2'" readonly></div>
              <div class="field"><label>Seguro (USD)</label><input type="number" [(ngModel)]="s.premissas.seguroUsd" (change)="atualizarPremissas(s.premissas)"></div>
              <div class="field"><label>THC (USD)</label><input type="number" [(ngModel)]="s.premissas.thcUsd" (change)="atualizarPremissas(s.premissas)"></div>
              <div class="field"><label><span class="icon">💱</span> Taxa USD</label><input type="number" step="0.0001" [(ngModel)]="s.premissas.taxaUsd" (change)="atualizarPremissas(s.premissas)"></div>
              <div class="field"><label>Taxa EUR</label><input type="number" step="0.0001" [(ngModel)]="taxaEur"></div>
              <div class="field"><label>Peso Líquido (kg)</label><input type="number" [(ngModel)]="pesoLiquido" step="0.01"></div>
              <div class="field"><label>Quant. Produtos</label><input type="number" [(ngModel)]="quantProdutos" step="1"></div>
              <div class="field"><label>NCM</label><input type="text" [(ngModel)]="s.premissas.ncm" (change)="atualizarPremissas(s.premissas)"></div>
              <div class="field"><label>Unid. Medida</label><select [(ngModel)]="unidMedida"><option>1X40HC</option><option>20FT</option><option>40FT</option></select></div>
              <div class="field"><label>Estatística</label><input type="text" [(ngModel)]="estatistica"></div>
              <div class="field"><label>Volume (m³)</label><input type="number" step="0.0001" [(ngModel)]="volume"></div>
              <div class="field"><label>FCL / LCL</label><select [(ngModel)]="fcl"><option>FCL</option><option>LCL</option></select></div>
              <div class="field"><label>Incoterm</label><select [(ngModel)]="incoterm"><option>FOB</option><option>CIF</option><option>EXW</option></select></div>
              <div class="field"><label>Preço por Peça</label><input type="number" step="0.01" [(ngModel)]="precoPeca"></div>
              <div class="field"><label>Porto</label><select [(ngModel)]="porto"><option></option></select></div>
              <div class="field"><label>Benefício Fiscal Repassado (%)</label><input type="number" step="0.01" [(ngModel)]="beneficioFiscal"></div>
              <div class="field"><label>Quantidade</label><input type="number" [(ngModel)]="quantidade" step="1"></div>
            </div>
            <div class="divider"></div>
            <h3 style="font-size: 16px; color: #4a5568; margin-bottom: 12px; font-weight: 600;">Alíquotas de Impostos</h3>
            <div class="toolbar">
              <button class="btn btn-secondary" (click)="toggleAliquotas()">Editar alíquotas</button>
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
          <div class="section">
            <h2 class="section-title"><span class="section-number">2</span>Despesas no Desembaraço</h2>
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
          <div class="section">
            <h2 class="section-title"><span class="section-number">3</span>Custos do Produto Importado</h2>
            <div class="form-grid-2">
              <div class="field"><label>CIF</label><input type="text" [value]="'FOB + Frete + Seguro + THC'" readonly></div>
              <div class="field"><label>Desembolso Total na Operação</label><input type="text" [value]="s.resumo.desembolsoTotal | currency:'BRL'" readonly></div>
            </div>
            <div style="margin-top:12px; font-size:14px; color:#2d3748;">
              <span>II: <span>{{calcII(s) | currency:'BRL'}}</span></span> · 
              <span>IPI: <span>{{calcIPI(s) | currency:'BRL'}}</span></span> · 
              <span>PIS: <span>{{calcPIS(s) | currency:'BRL'}}</span></span> · 
              <span>COFINS: <span>{{calcCOFINS(s) | currency:'BRL'}}</span></span>
            </div>
          </div>
          <div class="section">
            <h2 class="section-title"><span class="section-number">4</span>Nota Fiscal de Saída</h2>
            <div class="form-grid-3">
              <div class="field"><label>ICMS (%)</label><input type="number" [value]="s.taxas.icms" readonly></div>
              <div class="field"><label>Benefício Fiscal</label><input type="text" [value]="0 | number:'1.2-2'" readonly></div>
              <div class="field"><label>Total real sobre valor FOB</label><input type="text" [value]="0 | number:'1.2-2'" readonly></div>
            </div>
          </div>
          <div class="section">
            <h2 class="section-title"><span class="section-number">5</span>Análise Conclusiva da Planilha</h2>
            <div class="form-grid-2">
              <div class="field"><label>Benefício Fiscal</label><input type="text" [value]="0 | number:'1.2-2'" readonly></div>
              <div class="field"><label>Total real na operação sobre valor FOB</label><input type="text" [value]="0 | number:'1.2-2'" readonly></div>
            </div>
          </div>
          <div class="section">
            <h2 class="section-title"><span class="section-number">6</span>Formação do Custo Unitário</h2>
            <div class="info-card">Tabela por item do packlist com rateio selecionado (a implementar).</div>
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
            <div class="field" style="margin-bottom: 15px;"><label>Com IPI</label><input type="number" [value]="0" readonly></div>
            <div class="field" style="margin-bottom: 15px;"><label>Sem IPI</label><input type="number" [value]="0" readonly></div>
            <div class="field" style="margin-bottom: 15px;"><label>Desembolso (USD)</label><input type="number" [value]="0" readonly></div>
            <div class="field"><label>% sobre FOB</label><input type="number" [value]="0" readonly></div>
          </div>
          <div class="action-buttons">
            <button class="btn btn-secondary" (click)="exportar(s)"><span class="icon">📄</span> Exportar</button>
            <button class="btn btn-primary" (click)="salvar()"><span class="icon">💾</span> Salvar</button>
          </div>
        </div>
      </div>
      <div class="bottom-actions">
        <div class="info"><span class="badge">✓ Ativo</span><span style="margin-left: 15px;">Última atualização: {{lastUpdate}}</span></div>
        <div class="buttons">
          <button class="btn btn-secondary" (click)="limpar()"><span class="icon">🔄</span> Nova Simulação</button>
          <button class="btn btn-secondary" (click)="duplicar(s)"><span class="icon">📋</span> Duplicar</button>
          <button class="btn btn-primary" (click)="finalizar()"><span class="icon">✓</span> Finalizar Importação</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `*{margin:0;padding:0;box-sizing:border-box}`,
    `.container{max-width:1920px;margin:0 auto;background:#fff;border-radius:20px;box-shadow:0 25px 80px rgba(0,0,0,.4);overflow:hidden}`,
    `.header{background:linear-gradient(135deg,#1e3c72 0%,#2a5298 100%);color:#fff;padding:40px 50px;display:flex;justify-content:space-between;align-items:flex-start}`,
    `.header-left h1{font-size:32px;margin-bottom:8px;font-weight:700}`,
    `.header-left p{font-size:14px;opacity:.9}`,
    `.header-grid{display:grid;grid-template-columns:repeat(3,280px);gap:20px}`,
    `.header-item{background:rgba(255,255,255,.15);padding:15px 18px;border-radius:10px;backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.2)}`,
    `.header-item label{display:block;font-size:11px;text-transform:uppercase;letter-spacing:1.2px;opacity:.85;margin-bottom:6px;font-weight:600}`,
    `.header-item input,.header-item select{width:100%;background:rgba(255,255,255,.25);border:1px solid rgba(255,255,255,.3);color:#fff;padding:10px 14px;border-radius:6px;font-size:15px;font-weight:500}`,
    `.main-content{display:grid;grid-template-columns:1fr 420px;gap:0;min-height:calc(100vh - 200px)}`,
    `.left-panel{padding:40px 50px;background:#fafbfc;border-right:1px solid #e1e8ed}`,
    `.right-panel{padding:40px 35px;background:#fff;position:sticky;top:0;height:fit-content}`,
    `.section{margin-bottom:45px}`,
    `.section-title{font-size:20px;color:var(--color-primary-ink);margin-bottom:25px;padding-bottom:12px;border-bottom:3px solid var(--color-primary);display:flex;align-items:center;gap:12px;font-weight:700}`,
    `.section-number{background:var(--gradient-primary);color:#fff;width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:16px}`,
    `.form-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px 25px}`,
    `.form-grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:20px 25px}`,
    `.form-grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:20px 25px}`,
    `.field{display:flex;flex-direction:column}`,
    `.field label{font-size:13px;font-weight:600;color:var(--color-muted);margin-bottom:8px;display:flex;align-items:center;gap:5px}`,
    `.field input,.field select{padding:13px 16px;border:2px solid var(--color-border);border-radius:8px;font-size:15px;transition:.2s;background:var(--color-surface)}`,
    `.field input:focus,.field select:focus{outline:none;border-color:var(--color-primary);box-shadow:0 0 0 4px rgba(102,126,234,.1)}`,
    `.field input[readonly]{background:var(--color-subtle-bg);color:var(--color-text);font-weight:600;cursor:not-allowed}`,
    `.highlight-box{background:linear-gradient(135deg,#fef5e7 0%,#fdeaa6 100%);border-left:5px solid #f39c12;padding:20px 25px;border-radius:10px;margin:25px 0;display:flex;justify-content:space-between;align-items:center}`,
    `.highlight-box strong{color:#d68910;font-size:16px}`,
    `.highlight-box .value{font-size:24px;font-weight:700;color:#d68910}`,
    `.summary-panel{background:var(--gradient-primary);color:#fff;padding:30px;border-radius:12px;margin-bottom:25px}`,
    `.summary-panel h3{font-size:18px;margin-bottom:25px;opacity:.95;font-weight:600}`,
    `.summary-item{background:rgba(255,255,255,.15);padding:18px 20px;border-radius:10px;margin-bottom:15px;backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.2)}`,
    `.summary-item .value{font-size:26px;font-weight:700}`,
    `.summary-item.highlight{background:rgba(255,255,255,.25);border:2px solid rgba(255,255,255,.4)}`,
    `.action-buttons{display:flex;gap:15px;margin-top:25px}`,
    `.btn{flex:1;padding:14px 20px;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;transition:.3s;display:flex;align-items:center;justify-content:center;gap:8px}`,
    `.btn-primary{background:var(--gradient-primary);color:#fff}`,
    `.btn-secondary{background:var(--color-surface);color:var(--color-primary);border:2px solid var(--color-primary)}`,
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
    `.expense-actions{display:flex;gap:8px;justify-content:flex-end}`
  ]
})
export class PlanilhaComponent {
  private service = inject(PlanilhaService);
  snapshot$ = this.service.snapshot$();
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
  categorias = ['Agência Marítima','Despachante','Tributos','Porto','Outros'];
  activeFilter: string = 'Todas';
  lastUpdate = new Date().toLocaleString('pt-BR');

  atualizarPremissas(p: any){ this.service.atualizarPremissas(p); this.update(); }
  atualizarTaxas(t: any){ this.service.atualizarTaxas(t); this.update(); }
  toggleAliquotas(){ this.aliqReadonly = !this.aliqReadonly; }
  setFilter(cat: string){ this.activeFilter = cat; }
  despesasFiltradas(cat: string, s: any){ const base = s.despesas.filter((d:any)=> d.categoria===cat); return this.activeFilter==='Todas'? base: (this.activeFilter===cat? base: []); }
  totalPorCategoria(cat: string, s: any){ const arr = s.despesas.filter((d:any)=> d.categoria===cat); return arr.reduce((sum:number,d:any)=> sum + (d.valor||0), 0); }
  adicionarDespesa(){ const n = this.novaDespesa; if(!n.item || !n.valor){ return; } this.service.adicionarDespesa(n.categoria, n.item, Number(n.valor), n.fornecedor, n.observacao); this.novaDespesa = { categoria: n.categoria, item:'', fornecedor:'', valor:0, observacao:'' }; this.update(); }
  editarDespesa(d:any){ const novoItem = prompt('Item', d.item); if(novoItem===null) return; const novaCategoria = prompt('Categoria', d.categoria); if(novaCategoria===null) return; const novoValorStr = prompt('Valor (R$)', String(d.valor)); if(novoValorStr===null) return; const novoValor = parseFloat(novoValorStr); if(isNaN(novoValor)) return; const cats = ['Agência Marítima','Despachante','Tributos','Porto','Outros'] as const; const cat = (cats as readonly string[]).includes(novaCategoria) ? (novaCategoria as any) : d.categoria; this.service.editarDespesa(d.id, { item: novoItem, categoria: cat, valor: novoValor }); this.update(); }
  removerDespesa(id:string){ this.service.removerDespesa(id); this.update(); }
  calcBase(s:any){ return (s.premissas.fobUsd + s.premissas.freteUsd + s.premissas.seguroUsd + s.premissas.thcUsd) * s.premissas.taxaUsd; }
  calcII(s:any){ const base = this.calcBase(s); return base * (s.taxas.ii/100); }
  calcIPI(s:any){ const base = this.calcBase(s) + this.calcII(s); return base * (s.taxas.ipi/100); }
  calcPIS(s:any){ const base = this.calcBase(s); return base * (s.taxas.pis/100); }
  calcCOFINS(s:any){ const base = this.calcBase(s); return base * (s.taxas.cofins/100); }
  exportar(s:any){ const blob = new Blob([JSON.stringify(s,null,2)],{type:'application/json'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'planilha.json'; a.click(); URL.revokeObjectURL(url); }
  salvar(){ alert('Simulação salva.'); }
  limpar(){ if(confirm('Nova simulação?')){ location.reload(); } }
  duplicar(s:any){ const key = 'import_cost_planilha_copy_'+Date.now(); localStorage.setItem(key, JSON.stringify(s)); alert('Simulação duplicada.'); }
  finalizar(){ if(confirm('Finalizar importação?')){ alert('Importação finalizada.'); } }
  update(){ this.lastUpdate = new Date().toLocaleString('pt-BR'); }
  novaDespesa: any = { categoria: 'Porto', item: '', fornecedor: '', valor: 0, observacao: '' };
  limparDespesaForm(){ const c = this.novaDespesa.categoria; this.novaDespesa = { categoria: c, item: '', fornecedor: '', valor: 0, observacao: '' }; }
}