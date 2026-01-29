import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Despesa, CategoriaDespesa } from '../../custo/models/custo.models';
import { keys, readJSON, writeJSON, randomId } from '../data/storage.helper';

interface AduanaEvento {
  id: string;
  data: string;
  responsavel: string;
  descricao: string;
}

@Component({
  standalone: true,
  selector: 'app-aduana-detail',
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="page">
      <div class="header">
        <div>
          <h1>🏛️ Aduana / Embarque</h1>
          <p class="subtitle">{{ codigo || orcamentoId }} • Cliente: {{ cliente || '-' }} • Despachante: {{ despachante || '-' }}</p>
        </div>
        <button class="btn btn-secondary" (click)="voltar()">← Voltar</button>
      </div>

      <div class="editor-grid">
        <div class="editor-left">
          <div class="card">
            <button class="accordion-head" (click)="toggle('premissas')"><span class="section-number">1</span> Premissas do Orçamento (Histórico)</button>
            <div class="accordion-content" *ngIf="acc.premissas">
              <div class="form-grid">
                <div class="field"><label>FOB (USD)</label><input type="number" step="0.01" [(ngModel)]="baseData.fobUsd" readonly placeholder="0.00"><div class="hint">USD</div></div>
                <div class="field"><label>Frete Internacional (USD)</label><input type="number" step="0.01" [(ngModel)]="baseData.freteUsd" readonly placeholder="0.00"><div class="hint">USD</div></div>
                <div class="field"><label>Seguro (USD)</label><input type="number" step="0.01" [(ngModel)]="baseData.seguroUsd" readonly placeholder="0.00"><div class="hint">USD</div></div>
                <div class="field"><label>THC (USD)</label><input type="number" step="0.01" [(ngModel)]="baseData.thcUsd" readonly placeholder="0.00"><div class="hint">USD</div></div>
                <div class="field"><label>Taxa USD (Orçamento)</label><input type="number" step="0.0001" [(ngModel)]="baseData.taxaUsd" readonly placeholder="5.0000"><div class="hint">Taxa de câmbio</div></div>
                <div class="field"><label>NCM</label><input type="text" [(ngModel)]="baseData.ncm" readonly placeholder="8423"></div>
                <div class="field"><label>Peso Líquido (kg)</label><input type="number" step="0.01" [(ngModel)]="baseData.pesoLiquido" readonly placeholder="0.00"></div>
                <div class="field"><label>Quantidade de Produtos</label><input type="number" step="1" [(ngModel)]="baseData.quantProdutos" readonly placeholder="0"></div>
              </div>
            </div>
          </div>

          <div class="card">
            <button class="accordion-head" (click)="toggle('oficial')"><span class="section-number">2</span> Atualização Oficial (Aduana)</button>
            <div class="accordion-content" *ngIf="acc.oficial">
              <div class="form-grid">
                <div class="field"><label>Câmbio do dia (USD/BRL)</label><input type="number" step="0.0001" [(ngModel)]="aduanaData.taxaUsdOficial" placeholder="5.0000"><div class="hint">Taxa oficial</div></div>
                <div class="field"><label>Peso Líquido Oficial (kg)</label><input type="number" step="0.01" [(ngModel)]="aduanaData.pesoLiquidoOficial" placeholder="0.00"></div>
                <div class="field"><label>Porto de Origem</label><input type="text" [(ngModel)]="aduanaData.portoOrigem" placeholder="Origem"></div>
                <div class="field"><label>Porto de Destino</label><input type="text" [(ngModel)]="aduanaData.portoDestino" placeholder="Destino"></div>
                <div class="field"><label>Data de Embarque</label><input type="date" [(ngModel)]="aduanaData.dataEmbarque"></div>
                <div class="field"><label>ETA (Chegada Prevista)</label><input type="date" [(ngModel)]="aduanaData.dataChegada"></div>
                <div class="field"><label>Canal</label>
                  <select [(ngModel)]="aduanaData.canal">
                    <option value="">Selecione</option>
                    <option value="Verde">Verde</option>
                    <option value="Amarelo">Amarelo</option>
                    <option value="Vermelho">Vermelho</option>
                  </select>
                </div>
                <div class="field"><label>Status Aduana</label>
                  <select [(ngModel)]="aduanaData.status">
                    <option value="pendente">Pendente</option>
                    <option value="em-andamento">Em andamento</option>
                    <option value="concluido">Concluído</option>
                  </select>
                </div>
                <div class="field" style="grid-column:1/-1"><label>Observações</label><input type="text" [(ngModel)]="aduanaData.observacoes" placeholder="Atualizações importantes"></div>
              </div>
            </div>
          </div>

          <div class="card">
            <button class="accordion-head" (click)="toggle('despesas')"><span class="section-number">3</span> Despesas Reais (Aduana)</button>
            <div class="accordion-content" *ngIf="acc.despesas">
              <div class="form-grid-2" style="margin-bottom:12px;">
                <div class="field"><label>Categoria</label>
                  <select [(ngModel)]="novaDespesa.categoria">
                    <option *ngFor="let c of categoriasDespesa" [value]="c">{{ c }}</option>
                  </select>
                </div>
                <div class="field"><label>Item</label><input [(ngModel)]="novaDespesa.item" type="text" placeholder="Descrição do item"></div>
                <div class="field"><label>Fornecedor</label><input [(ngModel)]="novaDespesa.fornecedor" type="text" placeholder="Fornecedor opcional"></div>
                <div class="field"><label>Valor (R$)</label><input [(ngModel)]="novaDespesa.valor" type="number" step="0.01" placeholder="0,00"></div>
                <div class="field" style="grid-column: 1 / -1;"><label>Observação</label><input [(ngModel)]="novaDespesa.observacao" type="text" placeholder="Detalhes opcionais"></div>
              </div>
              <div class="actions-inline">
                <button class="btn btn-primary" (click)="adicionarDespesa()">Adicionar</button>
                <button class="btn btn-secondary" (click)="limparDespesaForm()">Limpar campos</button>
              </div>
              <div class="table-wrapper">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Categoria</th>
                      <th>Item</th>
                      <th>Fornecedor</th>
                      <th>Valor (R$)</th>
                      <th>Observação</th>
                      <th style="width:200px">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngIf="despesas.length === 0">
                      <td colspan="6">Nenhuma despesa lançada</td>
                    </tr>
                    <tr *ngFor="let d of despesas">
                      <td>{{ d.categoria }}</td>
                      <td>{{ d.item }}</td>
                      <td>{{ d.fornecedor || '-' }}</td>
                      <td>{{ d.valor | currency:'BRL' }}</td>
                      <td>{{ d.observacao || '-' }}</td>
                      <td>
                        <div class="row-actions">
                          <button class="btn btn-secondary" (click)="editarDespesa(d)">Editar</button>
                          <button class="btn btn-secondary" (click)="removerDespesa(d.id)">Excluir</button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="highlight-box"><strong>Total de Despesas Aduana</strong><span class="value">{{ totalDespesas | currency:'BRL' }}</span></div>
            </div>
          </div>

          <div class="card">
            <button class="accordion-head" (click)="toggle('timeline')"><span class="section-number">4</span> Linha do Tempo de Atualizações</button>
            <div class="accordion-content" *ngIf="acc.timeline">
              <div class="form-grid-2" style="margin-bottom:12px;">
                <div class="field"><label>Responsável</label><input [(ngModel)]="novoEvento.responsavel" type="text" placeholder="Quem registrou"></div>
                <div class="field"><label>Data</label><input [(ngModel)]="novoEvento.data" type="datetime-local"></div>
                <div class="field" style="grid-column: 1 / -1;"><label>Descrição</label><input [(ngModel)]="novoEvento.descricao" type="text" placeholder="Atualização registrada"></div>
              </div>
              <div class="actions-inline">
                <button class="btn btn-primary" (click)="adicionarEvento()">Adicionar</button>
                <button class="btn btn-secondary" (click)="limparEventoForm()">Limpar</button>
              </div>
              <div class="table-wrapper">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Responsável</th>
                      <th>Descrição</th>
                      <th style="width:120px">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngIf="eventos.length === 0"><td colspan="4">Nenhuma atualização registrada</td></tr>
                    <tr *ngFor="let e of eventos">
                      <td>{{ e.data | date:'dd/MM/yyyy HH:mm' }}</td>
                      <td>{{ e.responsavel }}</td>
                      <td>{{ e.descricao }}</td>
                      <td>
                        <button class="btn btn-secondary" (click)="removerEvento(e.id)">Excluir</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div class="editor-right">
          <div class="card summary-finance">
            <h3 class="section-title">Resumo Financeiro (Oficial)</h3>
            <div class="stack">
              <div class="block">
                <div class="label">CIF (USD)</div>
                <div class="value usd">{{ cifUsd | currency:'USD' }}</div>
              </div>
              <div class="block">
                <div class="label">CIF (BRL)</div>
                <div class="value">{{ cifBrl | currency:'BRL' }}</div>
              </div>
              <div class="block">
                <div class="label">Desembaraço</div>
                <div class="value">{{ totalDespesas | currency:'BRL' }}</div>
              </div>
              <div class="block total">
                <div class="label">Custo Total</div>
                <div class="value">{{ desembolsoTotal | currency:'BRL' }}</div>
              </div>
            </div>
          </div>

          <div class="card summary-card">
            <h3 class="section-title">Custo do Produto Importado (Oficial)</h3>
            <div class="summary-grid">
              <div class="summary-item"><div class="label">Base de Cálculo (R$)</div><div class="value">{{ baseCalculoBrl | currency:'BRL' }}</div></div>
              <div class="summary-item"><div class="label">Imposto de Importação (II)</div><div class="value">{{ iiValor | currency:'BRL' }}</div></div>
              <div class="summary-item"><div class="label">IPI</div><div class="value">{{ ipiValor | currency:'BRL' }}</div></div>
              <div class="summary-item"><div class="label">PIS</div><div class="value">{{ pisValor | currency:'BRL' }}</div></div>
              <div class="summary-item"><div class="label">COFINS</div><div class="value">{{ cofinsValor | currency:'BRL' }}</div></div>
              <div class="summary-item total"><div class="label">Total Tributos</div><div class="value">{{ totalTributos | currency:'BRL' }}</div></div>
              <div class="summary-item"><div class="label">Despesas Aduana</div><div class="value">{{ totalDespesas | currency:'BRL' }}</div></div>
              <div class="summary-item total"><div class="label">Desembolso Total</div><div class="value">{{ desembolsoTotal | currency:'BRL' }}</div></div>
            </div>
          </div>
        </div>
      </div>

      <div class="actions">
        <button class="btn btn-secondary" (click)="voltar()">Cancelar</button>
        <button class="btn btn-primary" (click)="salvar()">Salvar Atualizações</button>
      </div>

      <div class="modal-backdrop" *ngIf="showSaved">
        <div class="modal">
          <div class="modal-header">✔️ Sucesso</div>
          <div class="modal-body">Aduana atualizada com sucesso.</div>
          <div class="modal-actions"><button class="btn btn-primary" (click)="confirmSaved()">OK</button></div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `.page{padding:24px;max-width:1200px;margin:0 auto;background:var(--color-bg)}`,
    `.header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:24px;background:var(--color-surface);padding:20px;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.08)}`,
    `.header h1{margin:0 0 8px 0;font-size:20px;font-weight:700}`,
    `.header .subtitle{margin:0;color:var(--color-muted);font-size:14px}`,
    `.card{background:var(--color-surface);border:1px solid var(--color-border);border-radius:12px;padding:24px}`,
    `.btn{padding:10px 12px;border-radius:10px;cursor:pointer;font-weight:600;transition:.2s}`,
    `.btn-primary{background:var(--gradient-primary);color:#fff;border:none}`,
    `.btn-primary:hover:not(:disabled){opacity:.9}`,
    `.btn[disabled]{opacity:.6;cursor:not-allowed}`,
    `.btn-secondary{background:var(--color-bg);color:var(--color-text);border:1px solid var(--color-border)}`,
    `.btn-secondary:hover:not(:disabled){background:var(--color-subtle-bg)}`,
    `.table{width:100%;border-collapse:collapse;margin-top:12px}`,
    `.table thead{background:var(--color-bg)}`,
    `.table th{padding:12px;text-align:left;font-size:13px;font-weight:600;color:var(--color-text);border-bottom:2px solid var(--color-border)}`,
    `.table td{padding:12px;border-bottom:1px solid var(--color-border);font-size:14px}`,
    `.row-actions{display:flex;gap:8px}`,
    `.form-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px;margin-top:12px}`,
    `.form-grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:20px;margin-top:12px}`,
    `.field{display:flex;flex-direction:column;position:relative}`,
    `.field label{font-size:13px;font-weight:600;color:var(--color-muted);margin-bottom:8px}`,
    `.hint{position:absolute;right:10px;top:36px;font-size:.8rem;opacity:.6}`,
    `.field input,.field select{padding:13px 16px;border:2px solid var(--color-border);border-radius:8px;font-size:15px;transition:.2s;background:var(--color-surface)}`,
    `.field input:focus,.field select:focus{outline:none;border-color:var(--color-primary);box-shadow:0 0 0 4px rgba(102,126,234,.1)}`,
    `.field input[readonly]{background:var(--color-subtle-bg);color:var(--color-text);font-weight:600;cursor:not-allowed}`,
    `.accordion-head{display:flex;align-items:center;gap:10px;width:100%;text-align:left;background:var(--color-bg);border:1px solid var(--color-border);border-radius:10px;padding:12px;font-weight:700;cursor:pointer}`,
    `.accordion-content{margin-top:12px}`,
    `.section-title{font-size:18px;font-weight:700;color:var(--color-text);margin:0 0 20px 0;display:flex;align-items:center;gap:10px;padding-bottom:12px;border-bottom:2px solid var(--color-border)}`,
    `.section-number{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;background:var(--gradient-primary);color:#fff;border-radius:50%;font-size:14px;font-weight:700}`,
    `.editor-grid{display:grid;grid-template-columns:1.2fr .8fr;gap:16px;margin-top:0px}`,
    `.editor-left,.editor-right{display:flex;flex-direction:column;gap:16px}`,
    `.actions{display:flex;gap:8px;justify-content:flex-end;margin-top:12px}`,
    `.actions-inline{display:flex;gap:10px;justify-content:flex-end;margin:8px 0 16px}`,
    `.highlight-box{display:flex;justify-content:space-between;align-items:center;background:linear-gradient(135deg,#667eea15,#764ba215);border:2px solid var(--color-primary);padding:16px;border-radius:10px;margin-top:16px}`,
    `.highlight-box strong{font-weight:700}`,
    `.highlight-box .value{font-weight:800;font-size:18px;color:var(--color-primary)}`,
    `.summary-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}`,
    `.summary-item{background:var(--color-bg);border:1px solid var(--color-border);border-radius:10px;padding:12px}`,
    `.summary-item .label{font-size:12px;color:var(--color-muted);font-weight:700;margin-bottom:6px;text-transform:uppercase;letter-spacing:.4px}`,
    `.summary-item .value{font-size:16px;font-weight:800;color:var(--color-text)}`,
    `.summary-item.total{background:linear-gradient(135deg,#667eea15,#764ba215);border-color:var(--color-primary)}`,
    `.summary-item.total .value{color:var(--color-primary)}`,
    `.summary-card{background:linear-gradient(135deg,#667eea20 0%,#764ba220 100%);border:2px solid var(--color-primary)}`,
    `.summary-finance{background:linear-gradient(135deg,#667eea20 0%,#764ba220 100%);border:2px solid var(--color-primary);border-radius:12px;padding:16px}`,
    `.stack{display:flex;flex-direction:column;gap:10px}`,
    `.block{background:rgba(255,255,255,.22);border:1px solid var(--color-border);border-radius:12px;padding:12px 14px;display:flex;align-items:center;justify-content:space-between}`,
    `.block.total{background:linear-gradient(135deg,#667eea40 0%,#764ba240 100%);border-color:var(--color-primary)}`,
    `.label{font-size:12px;color:var(--color-muted);font-weight:700}`,
    `.value{font-size:20px;font-weight:800;color:var(--color-primary)}`,
    `.usd{color:#3b82f6}`,
    `.modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;z-index:1000}`,
    `.modal{width:360px;background:var(--color-surface);border:1px solid var(--color-border);border-radius:12px;overflow:hidden;box-shadow:0 10px 20px rgba(0,0,0,.2)}`,
    `.modal-header{background:var(--color-header-bg);color:#fff;padding:12px 16px;font-weight:800}`,
    `.modal-body{padding:16px}`,
    `.modal-actions{display:flex;justify-content:flex-end;padding:12px 16px;border-top:1px solid var(--color-border)}`,
    `.table-wrapper{overflow-x:auto;margin-top:12px}`
  ]
})
export class AduanaDetailComponent implements OnInit {
  @Input() orcamentoIdInput = '';
  @Output() voltarClicked = new EventEmitter<void>();

  orcamentoId = '';
  codigo = '';
  cliente = '';
  despachante = '';

  baseData: any = {
    fobUsd: 0,
    freteUsd: 0,
    seguroUsd: 0,
    thcUsd: 0,
    taxaUsd: 0,
    ncm: '',
    pesoLiquido: 0,
    quantProdutos: 0,
    ii: 0,
    ipi: 0,
    icms: 0,
    pis: 0,
    cofins: 0
  };

  aduanaData: any = {
    taxaUsdOficial: 0,
    pesoLiquidoOficial: 0,
    portoOrigem: '',
    portoDestino: '',
    dataEmbarque: '',
    dataChegada: '',
    canal: '',
    status: 'em-andamento',
    observacoes: ''
  };

  despesas: Despesa[] = [];
  categoriasDespesa: CategoriaDespesa[] = ['Despachante', 'Agência Marítima', 'Porto', 'Tributos', 'Outros'];
  novaDespesa: { categoria: CategoriaDespesa; item: string; fornecedor?: string; valor: number; observacao?: string } = { categoria: 'Porto', item: '', fornecedor: '', valor: 0, observacao: '' };
  editId: string | null = null;

  eventos: AduanaEvento[] = [];
  novoEvento: AduanaEvento = { id: '', data: '', responsavel: '', descricao: '' };

  showSaved = false;
  acc = { premissas: true, oficial: true, despesas: true, timeline: true };

  ngOnInit(): void {
    this.orcamentoId = this.orcamentoIdInput;
    this.carregarDados();
  }

  carregarDados(): void {
    const orcSnap: any = readJSON(keys.orcamento(this.orcamentoId)) || {};
    const custoSnap: any = readJSON(keys.custoSnapshot(this.orcamentoId)) || {};
    const aduanaSnap: any = readJSON(keys.aduanaSnapshot(this.orcamentoId)) || {};

    this.codigo = orcSnap.codigo || this.orcamentoId;
    this.cliente = orcSnap.cliente || '';
    this.despachante = orcSnap.despachante || '';

    if (custoSnap.premissas) {
      this.baseData = { ...this.baseData, ...custoSnap.premissas };
    }

    if (aduanaSnap.premissas) {
      this.aduanaData = { ...this.aduanaData, ...aduanaSnap.premissas };
    }

    if (aduanaSnap.despesas && Array.isArray(aduanaSnap.despesas)) {
      this.despesas = aduanaSnap.despesas as Despesa[];
    }

    if (aduanaSnap.eventos && Array.isArray(aduanaSnap.eventos)) {
      this.eventos = aduanaSnap.eventos as AduanaEvento[];
    }
  }

  toggle(key: 'premissas' | 'oficial' | 'despesas' | 'timeline'): void {
    this.acc[key] = !this.acc[key];
  }

  adicionarDespesa(): void {
    const n = this.novaDespesa;
    if (!n.item || (n.valor || 0) <= 0) return;

    if (this.editId) {
      const idx = this.despesas.findIndex(x => x.id === this.editId);
      if (idx >= 0) {
        this.despesas[idx] = { id: this.editId, categoria: n.categoria, item: n.item, fornecedor: n.fornecedor, valor: n.valor || 0, observacao: n.observacao };
      }
      this.editId = null;
    } else {
      const id = randomId();
      this.despesas.push({ id, categoria: n.categoria, item: n.item, fornecedor: n.fornecedor, valor: n.valor || 0, observacao: n.observacao });
    }

    this.limparDespesaForm();
    this.persistir();
  }

  limparDespesaForm(): void {
    this.novaDespesa = { categoria: 'Porto', item: '', fornecedor: '', valor: 0, observacao: '' };
    this.editId = null;
  }

  editarDespesa(d: Despesa): void {
    this.novaDespesa = { categoria: d.categoria, item: d.item, fornecedor: d.fornecedor, valor: d.valor, observacao: d.observacao };
    this.editId = d.id;
  }

  removerDespesa(id: string): void {
    this.despesas = this.despesas.filter(x => x.id !== id);
    if (this.editId === id) this.editId = null;
    this.persistir();
  }

  adicionarEvento(): void {
    if (!this.novoEvento.descricao) return;
    const id = randomId();
    const data = this.novoEvento.data || new Date().toISOString();
    this.eventos.unshift({ id, data, responsavel: this.novoEvento.responsavel || 'Sistema', descricao: this.novoEvento.descricao });
    this.limparEventoForm();
    this.persistir();
  }

  limparEventoForm(): void {
    this.novoEvento = { id: '', data: '', responsavel: '', descricao: '' };
  }

  removerEvento(id: string): void {
    this.eventos = this.eventos.filter(e => e.id !== id);
    this.persistir();
  }

  get taxaUsdAtual(): number {
    return this.aduanaData.taxaUsdOficial || this.baseData.taxaUsd || 0;
  }

  get cifUsd(): number {
    return (this.baseData.fobUsd || 0) + (this.baseData.freteUsd || 0) + (this.baseData.seguroUsd || 0) + (this.baseData.thcUsd || 0);
  }

  get cifBrl(): number {
    return this.cifUsd * this.taxaUsdAtual;
  }

  get baseCalculoBrl(): number {
    return this.cifBrl;
  }

  get iiValor(): number {
    return this.baseCalculoBrl * ((this.baseData.ii || 0) / 100);
  }

  get ipiValor(): number {
    return (this.baseCalculoBrl + this.iiValor) * ((this.baseData.ipi || 0) / 100);
  }

  get pisValor(): number {
    return this.baseCalculoBrl * ((this.baseData.pis || 0) / 100);
  }

  get cofinsValor(): number {
    return this.baseCalculoBrl * ((this.baseData.cofins || 0) / 100);
  }

  get totalTributos(): number {
    return this.iiValor + this.ipiValor + this.pisValor + this.cofinsValor;
  }

  get totalDespesas(): number {
    return (this.despesas || []).reduce((s, d) => s + (d.valor || 0), 0);
  }

  get desembolsoTotal(): number {
    return this.baseCalculoBrl + this.totalTributos + this.totalDespesas;
  }

  salvar(): void {
    this.persistir();
    this.showSaved = true;
  }

  persistir(): void {
    const snapshot = {
      premissas: this.aduanaData,
      despesas: this.despesas,
      eventos: this.eventos,
      status: this.aduanaData.status || 'em-andamento',
      desembolsoTotal: this.desembolsoTotal,
      data: new Date().toISOString()
    };
    writeJSON(keys.aduanaSnapshot(this.orcamentoId), snapshot);

    const orcSnap: any = readJSON(keys.orcamento(this.orcamentoId)) || {};
    orcSnap.fases = orcSnap.fases || {};
    orcSnap.fases.aduana = {
      status: this.aduanaData.status || 'em-andamento',
      data: new Date().toISOString(),
      valor: this.desembolsoTotal
    };
    writeJSON(keys.orcamento(this.orcamentoId), orcSnap);
  }

  confirmSaved(): void {
    this.showSaved = false;
    this.voltarClicked.emit();
  }

  voltar(): void {
    this.voltarClicked.emit();
  }
}
