import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VendaService } from '../services/venda.service';
import { Despesa, CategoriaDespesa } from '../../custo/models/custo.models';
import { ResumoFinanceiroComponent } from '../../packlist/pages/resumo-financeiro.component';
import { keys, readJSON, writeJSON } from '../../custo/data/storage.helper';

@Component({
  standalone: true,
  selector: 'app-venda-detail',
  imports: [CommonModule, RouterModule, FormsModule, ResumoFinanceiroComponent],
  template: `
    <div class="page">
      <div class="header">
        <div>
          <h1>💼 Planilha de Venda</h1>
          <p class="subtitle">{{ codigo || orcamentoId }} • Cliente: {{ cliente || '-' }} </p>
        </div>
        <button class="btn-close" (click)="voltar()" title="Fechar">✕</button>
      </div>

      <div class="editor-grid">
        <div class="editor-left">
          <!-- Seção 1: Premissas da Operação (ReadOnly) -->
          <div class="card">
            <button class="accordion-head" (click)="toggle('premissas')"><span class="section-number">1</span> Premissas da Operação</button>
            <div class="accordion-content" *ngIf="acc.premissas">
              <div class="form-grid">
                <div class="field"><label>FOB (USD)</label><input type="number" step="0.01" [(ngModel)]="custoData.fobUsd" readonly placeholder="0.00"><div class="hint">USD</div></div>
                <div class="field"><label>Frete Internacional (USD)</label><input type="number" step="0.01" [(ngModel)]="custoData.freteUsd" readonly placeholder="0.00"><div class="hint">USD</div></div>
                <div class="field"><label>Seguro (USD)</label><input type="number" step="0.01" [(ngModel)]="custoData.seguroUsd" readonly placeholder="0.00"><div class="hint">USD</div></div>
                <div class="field"><label>THC (USD)</label><input type="number" step="0.01" [(ngModel)]="custoData.thcUsd" readonly placeholder="0.00"><div class="hint">USD</div></div>
                <div class="field"><label>Taxa USD/BRL</label><input type="number" step="0.0001" [(ngModel)]="custoData.taxaUsd" readonly placeholder="5.0000"><div class="hint">Taxa de câmbio</div></div>
                <div class="field"><label>NCM</label><input type="text" [(ngModel)]="custoData.ncm" readonly placeholder="8423"></div>
                <div class="field"><label>Peso Líquido (kg)</label><input type="number" step="0.01" [(ngModel)]="custoData.pesoLiquido" readonly placeholder="0.00"></div>
                <div class="field"><label>Quantidade de Produtos</label><input type="number" step="1" [(ngModel)]="custoData.quantProdutos" readonly placeholder="0"></div>
              </div>
            </div>
          </div>

          <!-- Seção 2: Alíquotas de Impostos (ReadOnly) -->
          <div class="card">
            <button class="accordion-head" (click)="toggle('aliquotas')"><span class="section-number">2</span> Alíquotas de Impostos</button>
            <div class="accordion-content" *ngIf="acc.aliquotas">
              <div class="form-grid">
                <div class="field"><label>II (%)</label><input type="number" step="0.01" [(ngModel)]="custoData.ii" readonly placeholder="0.00"></div>
                <div class="field"><label>IPI (%)</label><input type="number" step="0.01" [(ngModel)]="custoData.ipi" readonly placeholder="0.00"></div>
                <div class="field"><label>ICMS (%)</label><input type="number" step="0.01" [(ngModel)]="custoData.icms" readonly placeholder="0.00"></div>
                <div class="field"><label>PIS (%)</label><input type="number" step="0.01" [(ngModel)]="custoData.pis" readonly placeholder="0.00"></div>
                <div class="field"><label>COFINS (%)</label><input type="number" step="0.01" [(ngModel)]="custoData.cofins" readonly placeholder="0.00"></div>
              </div>
            </div>
          </div>

          <!-- Seção 3: Despachante (ReadOnly) -->
          <div class="card">
            <button class="accordion-head" (click)="toggle('despachante')"><span class="section-number">3</span> Despachante</button>
            <div class="accordion-content" *ngIf="acc.despachante">
              <div class="table-wrapper">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Fornecedor</th>
                      <th>Valor (R$)</th>
                      <th>Observação</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngIf="despesasDespachante.length === 0">
                      <td colspan="4">Nenhum lançamento do desembaraço</td>
                    </tr>
                    <tr *ngFor="let d of despesasDespachante">
                      <td>{{d.item}}</td>
                      <td>{{d.fornecedor || ''}}</td>
                      <td>{{d.valor | currency:'BRL'}}</td>
                      <td>{{d.observacao || ''}}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="highlight-box"><strong>Total Despachante</strong><span class="value">{{totalDespachante | currency:'BRL'}}</span></div>
            </div>
          </div>

          <!-- Seção 4: Despesas de Agência Marítima (Editável) -->
          <div class="card">
            <button class="accordion-head" (click)="toggle('despesas')"><span class="section-number">4</span> Despesas de Agência Marítima</button>
            <div class="accordion-content" *ngIf="acc.despesas">
              <div class="form-grid-2" style="margin-bottom:12px;">
                <div class="field readonly-label"><label>Categoria</label><div class="pill">Agência Marítima</div></div>
                <div class="field"><label>Item</label><input [(ngModel)]="novaDespesa.item" type="text" placeholder="Descrição do item" [readonly]="!isEditable"></div>
                <div class="field"><label>Fornecedor</label><input [(ngModel)]="novaDespesa.fornecedor" type="text" placeholder="Fornecedor opcional" [readonly]="!isEditable"></div>
                <div class="field"><label>Valor (R$)</label><input [(ngModel)]="novaDespesa.valor" type="number" step="0.01" placeholder="0,00" [readonly]="!isEditable"></div>
                <div class="field" style="grid-column: 1 / -1;"><label>Observação</label><input [(ngModel)]="novaDespesa.observacao" type="text" placeholder="Detalhes opcionais" [readonly]="!isEditable"></div>
              </div>
              <div class="actions-inline">
                <button class="btn btn-primary" (click)="adicionarDespesa()" [disabled]="!isEditable">Adicionar</button>
                <button class="btn btn-secondary" (click)="limparDespesaForm()" [disabled]="!isEditable">Limpar campos</button>
              </div>
              <div class="table-wrapper">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Fornecedor</th>
                      <th>Valor (R$)</th>
                      <th>Observação</th>
                      <th style="width:200px">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngIf="despesas.length === 0">
                      <td colspan="5">Nenhuma despesa adicionada</td>
                    </tr>
                    <tr *ngFor="let d of despesas">
                      <td>{{ d.item }}</td>
                      <td>{{ d.fornecedor || '-' }}</td>
                      <td>{{ d.valor | currency:'BRL' }}</td>
                      <td>{{ d.observacao || '-' }}</td>
                      <td>
                        <div class="row-actions">
                          <button class="btn btn-secondary" (click)="editarDespesa(d)" [disabled]="!isEditable">Editar</button>
                          <button class="btn btn-secondary" (click)="removerDespesa(d.id)" [disabled]="!isEditable">Excluir</button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>

        <div class="editor-right">
          <app-resumo-financeiro [form]="custoData" [despesas]="despesas" [despesasDespachante]="despesasDespachante"></app-resumo-financeiro>

          <div class="card summary-card">
            <h3 class="section-title">Custo do Produto Importado</h3>
            <div class="summary-grid">
              <div class="summary-item"><div class="label">Base de Cálculo (R$)</div><div class="value">{{ custoBaseCalculoBrl | currency:'BRL' }}</div></div>
              <div class="summary-item"><div class="label">Imposto de Importação (II)</div><div class="value">{{ custoIiValor | currency:'BRL' }}</div></div>
              <div class="summary-item"><div class="label">IPI</div><div class="value">{{ custoIpiValor | currency:'BRL' }}</div></div>
              <div class="summary-item"><div class="label">PIS</div><div class="value">{{ custoPisValor | currency:'BRL' }}</div></div>
              <div class="summary-item"><div class="label">COFINS</div><div class="value">{{ custoCofinsValor | currency:'BRL' }}</div></div>
              <div class="summary-item total"><div class="label">Total Tributos</div><div class="value">{{ custoTotalTributos | currency:'BRL' }}</div></div>
              <div class="summary-item"><div class="label">Despesas Desembaraço</div><div class="value">{{ totalDesembaraco | currency:'BRL' }}</div></div>
              <div class="summary-item total"><div class="label">Custo Total</div><div class="value">{{ custoDesembolsoTotal | currency:'BRL' }}</div></div>
            </div>
          </div>

          <div class="card summary-card">
            <h3 class="section-title">Resumo Venda (Incremental)</h3>
            <div class="summary-grid">
              <div class="summary-item"><div class="label">Custo Base</div><div class="value">{{ custoDesembolsoTotal | currency:'BRL' }}</div></div>
              <div class="summary-item"><div class="label">Agência Marítima</div><div class="value">{{ totalDespesas | currency:'BRL' }}</div></div>
              <div class="summary-item total"><div class="label">Preço de Venda</div><div class="value">{{ precoVenda | currency:'BRL' }}</div></div>
            </div>
          </div>
        </div>
      </div>

      <div class="actions actions-uniform">
        <button class="btn btn-secondary" (click)="voltar()">Cancelar</button>
        <button class="btn btn-secondary" (click)="salvarRascunho()" [disabled]="!isEditable">Salvar rascunho</button>
        <button class="btn btn-primary" (click)="finalizar()" [disabled]="!podeFinalizar">Finalizar venda</button>
      </div>

      <div class="modal-backdrop" *ngIf="showSaved">
        <div class="modal">
          <div class="modal-header">✔️ Sucesso</div>
          <div class="modal-body">Venda salva com sucesso.</div>
          <div class="modal-actions"><button class="btn btn-primary" (click)="confirmSaved()">OK</button></div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `.page{max-width:1400px;margin:0 auto;padding:24px}`,
    `.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px}`,
    `.header h1{margin:0;font-size:32px;font-weight:800}`,
    `.header .subtitle{margin:8px 0 0 0;opacity:.7;font-size:14px}`,
    `.btn{padding:10px 12px;border-radius:10px;border:none;cursor:pointer;font-weight:600;transition:.2s}`,
    `.btn-primary{background:var(--gradient-primary);color:#fff}`,
    `.btn-secondary{background:var(--color-subtle-bg);border:1px solid var(--color-border)}`,
    `.btn:disabled{opacity:.5;cursor:not-allowed}`,
    `.btn-close{background:transparent;border:none;color:#6b7280;font-size:18px;line-height:1;cursor:pointer;padding:6px 8px;border-radius:8px}`,
    `.btn-close:hover{background:#f3f4f6;color:#111}`,
    `.card{background:var(--color-surface);border:1px solid var(--color-border);border-radius:12px;padding:20px;margin-bottom:16px}`,
    `.accordion-head{display:flex;align-items:center;gap:10px;width:100%;text-align:left;background:var(--color-bg);border:1px solid var(--color-border);border-radius:10px;padding:12px;font-weight:700;cursor:pointer}`,
    `.accordion-content{margin-top:12px}`,
    `.section-number{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;background:var(--gradient-primary);color:#fff;border-radius:50%;font-size:14px;font-weight:700}`,
    `.form-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin-top:12px}`,
    `.form-grid-2{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px}`,
    `.field{display:flex;flex-direction:column}`,
    `.field label{font-size:13px;font-weight:600;color:var(--color-muted);margin-bottom:8px}`,
    `.hint{position:absolute;right:10px;top:36px;font-size:.8rem;opacity:.6}`,
    `.field input,.field select{padding:12px 14px;border:2px solid var(--color-border);border-radius:8px;font-size:14px;transition:.2s;background:var(--color-surface)}`,
    `.field input:focus,.field select:focus{outline:none;border-color:var(--color-primary);box-shadow:0 0 0 4px rgba(102,126,234,.1)}`,
    `.field input[readonly]{background:var(--color-subtle-bg);color:var(--color-text);font-weight:600;cursor:not-allowed}`,
    `.readonly-label .pill{display:inline-block;padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.8);color:var(--color-primary-ink);font-weight:700;border:2px solid var(--color-border)}`,
    `.table{width:100%;border-collapse:collapse;margin-top:12px}`,
    `.table thead{background:var(--color-bg)}`,
    `.table th{padding:12px;text-align:left;font-size:13px;font-weight:600;color:var(--color-text);border-bottom:2px solid var(--color-border)}`,
    `.table td{padding:12px;border-bottom:1px solid var(--color-border);font-size:14px}`,
    `.table-wrapper{max-height:400px;overflow-y:auto}`,
    `.row-actions{display:flex;gap:8px}`,
    `.actions-inline{display:flex;gap:10px;justify-content:flex-end;margin:8px 0 16px}`,
    `.editor-grid{display:grid;grid-template-columns:1.2fr .8fr;gap:16px;margin-bottom:16px}`,
    `.editor-right{display:flex;flex-direction:column;gap:16px}`,
    `.summary-grid{display:flex;flex-direction:column;gap:12px}`,
    `.summary-item{background:var(--color-bg);border:1px solid var(--color-border);border-radius:10px;padding:12px}`,
    `.summary-item .label{font-size:12px;color:var(--color-muted);font-weight:700;margin-bottom:6px;text-transform:uppercase;letter-spacing:.4px}`,
    `.summary-item .value{font-size:16px;font-weight:800;color:var(--color-text)}`,
    `.summary-item.total{background:linear-gradient(135deg,#667eea15,#764ba215);border-color:var(--color-primary)}`,
    `.summary-item.total .value{color:var(--color-primary)}`,
    `.summary-card{background:linear-gradient(135deg,#667eea20 0%,#764ba220 100%);border:2px solid var(--color-primary)}`,
    `.section-title{font-size:16px;font-weight:700;color:var(--color-text);margin:0 0 12px 0;padding-bottom:8px;border-bottom:2px solid var(--color-border)}`,
    `.highlight-box{display:flex;justify-content:space-between;align-items:center;padding:16px;background:rgba(102,126,234,.08);border-radius:8px;margin-top:12px}`,
    `.actions{display:flex;gap:8px;justify-content:flex-end;margin-top:16px}`,
    `.actions-uniform{display:flex;gap:8px;flex-wrap:wrap}`,
    `.actions-uniform .btn{flex:1}`,
    `.modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;z-index:1000}`,
    `.modal{width:360px;background:var(--color-surface);border:1px solid var(--color-border);border-radius:12px;overflow:hidden;box-shadow:0 10px 20px rgba(0,0,0,.2)}`,
    `.modal-header{background:var(--color-header-bg);color:#fff;padding:12px 16px;font-weight:800}`,
    `.modal-body{padding:16px}`,
    `.modal-actions{display:flex;justify-content:flex-end;padding:12px 16px;border-top:1px solid var(--color-border)}`
  ]
})
export class VendaDetailComponent implements OnInit {
  @Input() orcamentoIdInput: string = '';
  @Output() voltarClicked = new EventEmitter<void>();

  orcamentoId: string = '';
  codigo: string = '';
  cliente: string = '';

  // Dados do Custo (readonly)
  custoData: any = {
    fobUsd: 0,
    freteUsd: 0,
    seguroUsd: 0,
    thcUsd: 0,
    taxaUsd: 5,
    ncm: '',
    pesoLiquido: 0,
    quantProdutos: 0,
    ii: 0,
    ipi: 0,
    icms: 0,
    pis: 0,
    cofins: 0
  };

  // Dados editáveis de venda
  despesas: Despesa[] = [];
  despesasDespachante: Despesa[] = [];
  acc = { premissas: false, aliquotas: false, despachante: false, despesas: false };

  novaDespesa: {
    categoria: CategoriaDespesa;
    item: string;
    fornecedor?: string;
    valor: number;
    observacao?: string;
  } = {
    categoria: 'Agência Marítima',
    item: '',
    fornecedor: '',
    valor: 0,
    observacao: ''
  };

  editId: string | null = null;
  showSaved = false;
  statusAtual: 'pendente' | 'em-andamento' | 'concluido' = 'pendente';
  custoStatus: 'pendente' | 'em-andamento' | 'concluido' = 'pendente';

  get isEditable(): boolean {
    return this.statusAtual !== 'concluido';
  }

  get podeFinalizar(): boolean {
    return this.isEditable && this.custoStatus === 'concluido';
  }

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.orcamentoId = this.orcamentoIdInput;
    this.carregarDados();
  }

  carregarDados(): void {
    const custoSnap: any = readJSON(`custo_${this.orcamentoId}`) || {};
    const vendaSnap: any = readJSON(`venda_${this.orcamentoId}`) || {};
    const orcSnap: any = readJSON(`orcamento_${this.orcamentoId}`) || {};

    // Dados básicos
    this.codigo = orcSnap.codigo || this.orcamentoId;
    this.cliente = orcSnap.cliente || '';

    // Carregar dados de custo (readonly)
    if (custoSnap.premissas) {
      this.custoData = { ...this.custoData, ...custoSnap.premissas };
    }
    if (custoSnap.status) {
      this.custoStatus = custoSnap.status;
    }

    // Carregar despesas de despachante do custo
    if (custoSnap.despesas && Array.isArray(custoSnap.despesas)) {
      this.despesasDespachante = (custoSnap.despesas as Despesa[]).filter((d: Despesa) => d.categoria === 'Despachante');
    }

    // Carregar despesas de venda (agência marítima)
    if (vendaSnap.despesas && Array.isArray(vendaSnap.despesas)) {
      this.despesas = (vendaSnap.despesas as Despesa[]).filter((d: Despesa) => d.categoria === 'Agência Marítima');
    }
    if (vendaSnap.status) {
      this.statusAtual = vendaSnap.status;
    }
  }

  toggle(key: 'premissas' | 'aliquotas' | 'despachante' | 'despesas'): void {
    this.acc[key] = !this.acc[key];
  }

  adicionarDespesa(): void {
    if (!this.isEditable) return;
    const n = this.novaDespesa;
    if (!n.item || (n.valor || 0) <= 0) return;

    if (this.editId) {
      const idx = this.despesas.findIndex(x => x.id === this.editId);
      if (idx >= 0) {
        this.despesas[idx] = {
          id: this.editId,
          categoria: n.categoria,
          item: n.item,
          fornecedor: n.fornecedor,
          valor: n.valor || 0,
          observacao: n.observacao
        };
      }
      this.editId = null;
    } else {
      const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      this.despesas.push({
        id,
        categoria: n.categoria,
        item: n.item,
        fornecedor: n.fornecedor,
        valor: n.valor || 0,
        observacao: n.observacao
      });
    }

    this.limparDespesaForm();
    this.persistirDespesas();
  }

  limparDespesaForm(): void {
    this.novaDespesa = {
      categoria: 'Agência Marítima',
      item: '',
      fornecedor: '',
      valor: 0,
      observacao: ''
    };
    this.editId = null;
  }

  editarDespesa(d: Despesa): void {
    if (!this.isEditable) return;
    this.novaDespesa = {
      categoria: d.categoria,
      item: d.item,
      fornecedor: d.fornecedor,
      valor: d.valor,
      observacao: d.observacao
    };
    this.editId = d.id;
  }

  removerDespesa(id: string): void {
    if (!this.isEditable) return;
    this.despesas = this.despesas.filter(x => x.id !== id);
    if (this.editId === id) this.editId = null;
    this.persistirDespesas();
  }

  persistirDespesas(): void {
    this.salvarSnapshot('em-andamento');
  }

  get totalDespesas(): number {
    return this.despesas.reduce((sum, d) => sum + (d.valor || 0), 0);
  }

  get totalDespachante(): number {
    return this.despesasDespachante.reduce((sum, d) => sum + (d.valor || 0), 0);
  }

  get totalDesembaraco(): number {
    return this.totalDespachante + this.totalDespesas;
  }

  // Cálculos do custo
  get custoTotalCif(): number {
    const cifUsd = (this.custoData.fobUsd || 0) + (this.custoData.freteUsd || 0) + (this.custoData.seguroUsd || 0) + (this.custoData.thcUsd || 0);
    return cifUsd * (this.custoData.taxaUsd || 1);
  }

  get custoBaseCalculoBrl(): number {
    return this.custoTotalCif;
  }

  get custoIiValor(): number {
    return this.custoBaseCalculoBrl * ((this.custoData.ii || 0) / 100);
  }

  get custoIpiValor(): number {
    return (this.custoBaseCalculoBrl + this.custoIiValor) * ((this.custoData.ipi || 0) / 100);
  }

  get custoPisValor(): number {
    return this.custoBaseCalculoBrl * ((this.custoData.pis || 0) / 100);
  }

  get custoCofinsValor(): number {
    return this.custoBaseCalculoBrl * ((this.custoData.cofins || 0) / 100);
  }

  get custoTotalTributos(): number {
    return this.custoIiValor + this.custoIpiValor + this.custoPisValor + this.custoCofinsValor;
  }

  get custoDesembolsoTotal(): number {
    return this.custoTotalCif + this.custoTotalTributos + this.totalDespachante;
  }

  // Resumo de venda (incremental)
  get precoVenda(): number {
    return this.custoDesembolsoTotal + this.totalDespesas;
  }

  salvarRascunho(): void {
    if (!this.isEditable) return;
    this.statusAtual = 'em-andamento';
    this.salvarSnapshot(this.statusAtual);
    this.showSaved = true;
    setTimeout(() => {
      this.voltarClicked.emit();
    }, 300);
  }

  finalizar(): void {
    if (!this.podeFinalizar) return;
    this.statusAtual = 'concluido';
    this.salvarSnapshot(this.statusAtual);
    this.showSaved = true;
  }

  salvarSnapshot(status: 'pendente' | 'em-andamento' | 'concluido' = 'em-andamento'): void {
    const snapshot = {
      despesas: this.despesas,
      precoVenda: this.precoVenda,
      status,
      data: new Date().toISOString()
    };

    writeJSON(`venda_${this.orcamentoId}`, snapshot);

    // Atualizar orçamento
    const orcSnap: any = readJSON(`orcamento_${this.orcamentoId}`) || {};
    orcSnap.fases = orcSnap.fases || {};
    orcSnap.fases.venda = {
      status,
      data: new Date().toISOString(),
      valor: this.precoVenda
    };
    writeJSON(`orcamento_${this.orcamentoId}`, orcSnap);
  }

  confirmSaved(): void {
    this.showSaved = false;
    this.voltarClicked.emit();
  }

  voltar(): void {
    this.voltarClicked.emit();
  }
}
