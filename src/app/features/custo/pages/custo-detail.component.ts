import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CustoService } from '../services/custo.service';
import { Despesa, CategoriaDespesa } from '../models/custo.models';
import { ResumoFinanceiroComponent } from '../../packlist/pages/resumo-financeiro.component';
import { keys, readJSON, writeJSON } from '../data/storage.helper';
import { AliquotasService } from '../../aliquotas/services/aliquotas.service';
import { AliquotaPerfil } from '../../aliquotas/models/aliquota.models';
import { PacklistService } from '../../packlist/services/packlist.service';
import { Observable } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-custo-detail',
  imports: [CommonModule, RouterModule, FormsModule, ResumoFinanceiroComponent],
  template: `
    <div class="page">
      <div class="header">
        <div>
          <h1>💰 Planilha de Custo</h1>
          <p class="subtitle">{{ codigo || orcamentoId }} • Cliente: {{ cliente || '-' }}\u00a0</p>
        </div>
        <button class="btn btn-secondary" (click)="voltar()">← Voltar</button>
      </div>

      <div class="editor-grid">
        <div class="editor-left">
          <div class="card">
            <button class="accordion-head" (click)="toggle('premissas')"><span class="section-number">1</span> Premissas da Operação</button>
            <div class="accordion-content" *ngIf="acc.premissas">
              <div class="form-grid">
                <div class="field"><label>FOB (USD)</label><input type="number" step="0.01" [(ngModel)]="form.fobUsd" [readonly]="readOnly" placeholder="0.00"><div class="hint">USD</div></div>
                <div class="field"><label>Frete Internacional (USD)</label><input type="number" step="0.01" [(ngModel)]="form.freteUsd" [readonly]="readOnly" placeholder="0.00"><div class="hint">USD</div></div>
                <div class="field"><label>Seguro (USD)</label><input type="number" step="0.01" [(ngModel)]="form.seguroUsd" [readonly]="readOnly" placeholder="0.00"><div class="hint">USD</div></div>
                <div class="field"><label>THC (USD)</label><input type="number" step="0.01" [(ngModel)]="form.thcUsd" [readonly]="readOnly" placeholder="0.00"><div class="hint">USD</div></div>
                <div class="field"><label>Taxa USD/BRL</label><input type="number" step="0.0001" [(ngModel)]="form.taxaUsd" [readonly]="readOnly" placeholder="5.0000"><div class="hint">Taxa de câmbio</div></div>
                <div class="field"><label>NCM</label><input type="text" [(ngModel)]="form.ncm" [readonly]="readOnly" placeholder="8423"></div>
                <div class="field"><label>Peso Líquido (kg)</label><input type="number" step="0.01" [(ngModel)]="form.pesoLiquido" [readonly]="readOnly" placeholder="0.00"></div>
                <div class="field"><label>Quantidade de Produtos</label><input type="number" step="1" [(ngModel)]="form.quantProdutos" [readonly]="readOnly" placeholder="0"></div>
              </div>
            </div>
          </div>

          <div class="card">
            <button class="accordion-head" (click)="toggle('aliquotas')"><span class="section-number">2</span> Alíquotas de Impostos</button>
            <div class="accordion-content" *ngIf="acc.aliquotas">
              <div class="form-grid">
                <div class="field">
                  <label>Perfil de Alíquota</label>
                  <select [(ngModel)]="form.aliquotaId" (ngModelChange)="onAliquotaChange($event)" [disabled]="readOnly">
                    <option value="">Selecione um perfil</option>
                    <option *ngFor="let a of (aliquotas$ | async)" [value]="a.id">{{ a.nome }}</option>
                  </select>
                </div>
                <div class="field"><label>II (%)</label><input type="number" step="0.01" [(ngModel)]="form.ii" [readonly]="readOnly" placeholder="0.00"></div>
                <div class="field"><label>IPI (%)</label><input type="number" step="0.01" [(ngModel)]="form.ipi" [readonly]="readOnly" placeholder="0.00"></div>
                <div class="field"><label>ICMS (%)</label><input type="number" step="0.01" [(ngModel)]="form.icms" [readonly]="readOnly" placeholder="0.00"></div>
                <div class="field"><label>PIS (%)</label><input type="number" step="0.01" [(ngModel)]="form.pis" [readonly]="readOnly" placeholder="0.00"></div>
                <div class="field"><label>COFINS (%)</label><input type="number" step="0.01" [(ngModel)]="form.cofins" [readonly]="readOnly" placeholder="0.00"></div>
              </div>
            </div>
          </div>

          <div class="card">
            <button class="accordion-head" (click)="toggle('despesas')"><span class="section-number">3</span> Despesas no Desembaraço</button>
            <div class="accordion-content" *ngIf="acc.despesas">
              <div class="form-grid-2" style="margin-bottom:12px;">
                <div class="field"><label>Categoria</label>
                  <select [(ngModel)]="novaDespesa.categoria" [disabled]="readOnly">
                    <option *ngFor="let c of categoriasDespesa" [value]="c">{{ c }}</option>
                  </select>
                </div>
                <div class="field"><label>Item</label><input [(ngModel)]="novaDespesa.item" type="text" [readonly]="readOnly" placeholder="Descrição do item"></div>
                <div class="field"><label>Fornecedor</label><input [(ngModel)]="novaDespesa.fornecedor" type="text" [readonly]="readOnly" placeholder="Fornecedor opcional"></div>
                <div class="field"><label>Valor (R$)</label><input [(ngModel)]="novaDespesa.valor" type="number" step="0.01" [readonly]="readOnly" placeholder="0,00"></div>
                <div class="field" style="grid-column: 1 / -1;"><label>Observação</label><input [(ngModel)]="novaDespesa.observacao" type="text" [readonly]="readOnly" placeholder="Detalhes opcionais"></div>
              </div>
              <div class="actions-inline">
                <button class="btn btn-primary" (click)="adicionarDespesa()" [disabled]="!isEditable">Adicionar</button>
                <button class="btn btn-secondary" (click)="limparDespesaForm()" [disabled]="!isEditable">Limpar campos</button>
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
                      <td colspan="6">Nenhuma despesa adicionada</td>
                    </tr>
                    <tr *ngFor="let d of despesas">
                      <td>{{ d.categoria }}</td>
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
              <div class="highlight-box"><strong>Total de Despesas com Desembaraço</strong><span class="value">{{totalDespesas | currency:'BRL'}}</span></div>
            </div>
          </div>

        </div>

        <div class="editor-right">
          <app-resumo-financeiro [form]="form" [despesas]="despesasAgencia" [despesasDespachante]="despesasDespachante"></app-resumo-financeiro>
          <div class="card summary-card">
            <h3 class="section-title">Custo do Produto Importado</h3>
            <div class="summary-grid">
              <div class="summary-item"><div class="label">Base de Cálculo (R$)</div><div class="value">{{ baseCalculoBrl | currency:'BRL' }}</div></div>
              <div class="summary-item"><div class="label">Imposto de Importação (II)</div><div class="value">{{ iiValor | currency:'BRL' }}</div></div>
              <div class="summary-item"><div class="label">IPI</div><div class="value">{{ ipiValor | currency:'BRL' }}</div></div>
              <div class="summary-item"><div class="label">PIS</div><div class="value">{{ pisValor | currency:'BRL' }}</div></div>
              <div class="summary-item"><div class="label">COFINS</div><div class="value">{{ cofinsValor | currency:'BRL' }}</div></div>
              <div class="summary-item total"><div class="label">Total Tributos</div><div class="value">{{ totalTributos | currency:'BRL' }}</div></div>
              <div class="summary-item"><div class="label">Despesas Desembaraço</div><div class="value">{{ totalDespesas | currency:'BRL' }}</div></div>
              <div class="summary-item total"><div class="label">Desembolso Total</div><div class="value">{{ desembolsoTotal | currency:'BRL' }}</div></div>
            </div>
          </div>
        </div>
      </div>

      <div class="actions">
        <button class="btn btn-secondary" (click)="voltar()">Cancelar</button>
        <button class="btn btn-secondary" (click)="salvarRascunho()" [disabled]="!isEditable">Salvar rascunho</button>
        <button class="btn btn-primary" (click)="finalizar()" [disabled]="!podeFinalizar">Finalizar custo</button>
      </div>

      <div class="modal-backdrop" *ngIf="showSaved">
        <div class="modal">
          <div class="modal-header">✔️ Sucesso</div>
          <div class="modal-body">Alterações salvas com sucesso.</div>
          <div class="modal-actions"><button class="btn btn-primary" (click)="confirmSaved()">OK</button></div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `.page{padding:24px;max-width:1200px;margin:0 auto;background:#f8f9fa}`,
    `.header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:24px;background:#fff;padding:20px;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.08)}`,
    `.header h1{margin:0 0 8px 0;font-size:20px;font-weight:700}`,
    `.header .subtitle{margin:0;color:#6b7280;font-size:14px}`,
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
    `.pill{display:inline-block;padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.8);color:var(--color-primary-ink);font-weight:700;border:2px solid var(--color-border)}`,
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
    `.modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;z-index:1000}`,
    `.modal{width:360px;background:var(--color-surface);border:1px solid var(--color-border);border-radius:12px;overflow:hidden;box-shadow:0 10px 20px rgba(0,0,0,.2)}`,
    `.modal-header{background:var(--color-header-bg);color:#fff;padding:12px 16px;font-weight:800}`,
    `.modal-body{padding:16px}`,
    `.modal-actions{display:flex;justify-content:flex-end;padding:12px 16px;border-top:1px solid var(--color-border)}`,
    `.table-wrapper{overflow-x:auto;margin-top:12px}`
  ]
})
export class CustoDetailComponent implements OnInit {
  @Input() orcamentoIdInput = '';
  @Output() voltarClicked = new EventEmitter<void>();

  orcamentoId = '';
  codigo?: string;
  cliente?: string;
  despachante?: string;
  form: any = {
    fobUsd: 0,
    freteUsd: 0,
    seguroUsd: 0,
    thcUsd: 0,
    taxaUsd: 5,
    ncm: '',
    pesoLiquido: 0,
    quantProdutos: 0,
    aliquotaId: '',
    ii: 0,
    ipi: 0,
    icms: 0,
    pis: 0,
    cofins: 0
  };
  statusAtual: 'pendente' | 'em-andamento' | 'concluido' = 'pendente';
  readOnly = false;
  packlistStatus: 'pendente' | 'em-andamento' | 'concluido' = 'pendente';
  showSaved = false;
  despesas: Despesa[] = [];
  novaDespesa: { categoria: CategoriaDespesa; item: string; fornecedor?: string; valor: number; observacao?: string } = { 
    categoria: 'Despachante', item: '', fornecedor: '', valor: 0, observacao: '' 
  };
  editId: string | null = null;
  categoriasDespesa: CategoriaDespesa[] = ['Despachante', 'Agência Marítima', 'Porto', 'Tributos', 'Outros'];
  aliquotas$!: Observable<AliquotaPerfil[]>;
  aliquotas: AliquotaPerfil[] = [];
  acc = { premissas: false, aliquotas: false, despesas: false };

  get isEditable(): boolean {
    return this.statusAtual !== 'concluido';
  }

  get podeFinalizar(): boolean {
    return this.isEditable && this.packlistStatus === 'concluido';
  }

  get despesasDespachante() {
    return (this.despesas || []).filter(d => d.categoria === 'Despachante');
  }

  get despesasAgencia() {
    return (this.despesas || []).filter(d => d.categoria !== 'Despachante');
  }

  get totalDespesas() {
    return (this.despesas || []).reduce((s, d) => s + (d.valor || 0), 0);
  }

  get baseCalculoBrl() {
    const f = this.form || {};
    const baseUsd = (f.fobUsd || 0) + (f.freteUsd || 0) + (f.seguroUsd || 0) + (f.thcUsd || 0);
    return baseUsd * (f.taxaUsd || 0);
  }

  get iiValor() {
    return this.baseCalculoBrl * ((this.form.ii || 0) / 100);
  }

  get ipiValor() {
    return (this.baseCalculoBrl + this.iiValor) * ((this.form.ipi || 0) / 100);
  }

  get pisValor() {
    return this.baseCalculoBrl * ((this.form.pis || 0) / 100);
  }

  get cofinsValor() {
    return this.baseCalculoBrl * ((this.form.cofins || 0) / 100);
  }

  get totalTributos() {
    return this.iiValor + this.ipiValor + this.pisValor + this.cofinsValor;
  }

  get desembolsoTotal() {
    return this.baseCalculoBrl + this.totalTributos + this.totalDespesas;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private s: CustoService,
    private aliquotasService: AliquotasService,
    private packlistService: PacklistService
  ) {}

  ngOnInit(): void {
    this.aliquotas$ = this.aliquotasService.list$();
    this.aliquotasService.list$().subscribe(list => {
      this.aliquotas = list || [];
    });
    this.aliquotasService.default$().subscribe(def => {
      if (def) {
        this.aplicarAliquotaPerfil(def, false);
      }
    });
    this.route.params.subscribe(p => {
      this.orcamentoId = this.orcamentoIdInput || p['id'] || '';
      this.loadMeta();
      this.loadCusto();
      this.preencherPorPacklist();
    });
  }

  private loadMeta(): void {
    if (!this.orcamentoId) return;
    const meta = readJSON<any>(keys.orcamento(this.orcamentoId));
    this.cliente = meta?.cliente || this.cliente;
    this.codigo = meta?.codigo || this.codigo || `ORC-${this.orcamentoId}`;
    this.despachante = meta?.despachante;
    if (!meta?.templatePacklistId) {
      this.packlistStatus = 'concluido';
    } else {
      const pack = readJSON<any>(keys.packlist(this.orcamentoId));
      if (pack?.status) {
        this.packlistStatus = pack.status;
      }
    }
    
    // Ensure custo exists for this orçamento
    this.s.ensureByOrcamento(this.orcamentoId, { 
      codigo: this.codigo, 
      cliente: this.cliente, 
      despachante: this.despachante 
    });
  }

  private loadCusto(): void {
    if (!this.orcamentoId) return;
    const snap = this.s.getCustoSnapshot(this.orcamentoId);
    if (snap) {
      this.form = { ...this.form, ...(snap.premissas || {}) };
      this.despesas = Array.isArray(snap.despesas)
        ? (snap.despesas as any).map((d: any) => ({ ...d, categoria: d.categoria || 'Despachante' }))
        : [];
      if (snap['status']) {
        this.statusAtual = snap['status'];
      }
    }
    this.readOnly = this.statusAtual === 'concluido';
    if (this.form.aliquotaId && this.aliquotas.length > 0) {
      const perfil = this.aliquotas.find(a => a.id === this.form.aliquotaId);
      if (perfil) {
        this.aplicarAliquotaPerfil(perfil, false);
      }
    }
  }

  onAliquotaChange(id: string): void {
    const perfil = this.aliquotas.find(a => a.id === id);
    if (perfil) {
      this.aplicarAliquotaPerfil(perfil, true);
    }
  }

  private aplicarAliquotaPerfil(perfil: AliquotaPerfil, force: boolean): void {
    if (!perfil) return;
    if (!force && (this.form.aliquotaId || !this.isTaxasVazias())) return;
    this.form.aliquotaId = perfil.id;
    this.form.ii = perfil.ii || 0;
    this.form.ipi = perfil.ipi || 0;
    this.form.icms = perfil.icms || 0;
    this.form.pis = perfil.pis || 0;
    this.form.cofins = perfil.cofins || 0;
  }

  private isTaxasVazias(): boolean {
    const f = this.form || {};
    return [f.ii, f.ipi, f.icms, f.pis, f.cofins].every(v => v === null || v === undefined || v === 0);
  }

  private isEmptyNumber(value: any): boolean {
    return value === null || value === undefined || value === '' || value === 0;
  }

  private preencherPorPacklist(): void {
    if (!this.orcamentoId) return;
    const pack = this.packlistService.getByOrcamentoId(this.orcamentoId);
    if (!pack) return;
    const hasTemplateData = !!pack.mappingConfig || (pack.itens && pack.itens.length) || (pack.previewItems && pack.previewItems.length);
    if (!hasTemplateData) return;

    const totalItens = pack.totalItems ?? pack.itens?.length ?? pack.previewItems?.length ?? 0;
    if (totalItens > 0 && this.isEmptyNumber(this.form.quantProdutos)) {
      this.form.quantProdutos = totalItens;
    }

    if (Array.isArray(pack.itens) && pack.itens.length > 0) {
      const peso = pack.itens.reduce((s, i) => s + (i.pesoKg || 0), 0);
      const fob = pack.itens.reduce((s, i) => s + (i.valorUSD || 0), 0);
      if (peso > 0 && this.isEmptyNumber(this.form.pesoLiquido)) {
        this.form.pesoLiquido = peso;
      }
      if (fob > 0 && this.isEmptyNumber(this.form.fobUsd)) {
        this.form.fobUsd = fob;
      }
      return;
    }

    if (Array.isArray(pack.previewItems) && pack.previewItems.length > 0) {
      const peso = pack.previewItems.reduce((s: number, i: any) => s + (Number(i.peso) || 0), 0);
      if (peso > 0 && this.isEmptyNumber(this.form.pesoLiquido)) {
        this.form.pesoLiquido = peso;
      }
    }
  }

  toggle(key: 'premissas' | 'aliquotas' | 'despesas'): void {
    this.acc[key] = !this.acc[key];
  }

  get totais() {
    const cifUsd = (this.form.fobUsd || 0) + (this.form.freteUsd || 0) + (this.form.seguroUsd || 0) + (this.form.thcUsd || 0);
    const cifBrl = cifUsd * (this.form.taxaUsd || 0);
    const totalDespesas = this.despesas.reduce((s, d) => s + (d.valor || 0), 0);
    return { cifUsd, cifBrl, totalDespesas, custoTotal: cifBrl + totalDespesas };
  }

  get resumoPremissas() {
    const cifUsd = (this.form.fobUsd || 0) + (this.form.freteUsd || 0) + (this.form.seguroUsd || 0) + (this.form.thcUsd || 0);
    const cifBrl = cifUsd * (this.form.taxaUsd || 0);
    return { cifUsd, cifBrl };
  }

  get resumoDesembaraco() {
    const total = this.despesas.reduce((s, d) => s + (d.valor || 0), 0);
    return { total };
  }

  adicionarDespesa() {
    if (!this.isEditable) return;
    const n = this.novaDespesa;
    if (!n.categoria) {
      n.categoria = 'Despachante';
    }
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
      const id = Math.random().toString(36).slice(2);
      this.despesas.push({ 
        id, 
        categoria: n.categoria, 
        item: n.item, 
        fornecedor: n.fornecedor, 
        valor: n.valor || 0, 
        observacao: n.observacao 
      });
    }
    this.persistirDespesas();
    this.limparDespesaForm();
  }

  editarDespesa(d: Despesa) {
    if (!this.isEditable) return;
    this.editId = d.id;
    this.novaDespesa = { 
      categoria: d.categoria, 
      item: d.item, 
      fornecedor: d.fornecedor, 
      valor: d.valor, 
      observacao: d.observacao 
    };
  }

  removerDespesa(id: string) {
    if (!this.isEditable) return;
    this.despesas = this.despesas.filter(d => d.id !== id);
    this.persistirDespesas();
  }

  limparDespesaForm() {
    this.novaDespesa = { categoria: 'Despachante', item: '', fornecedor: '', valor: 0, observacao: '' };
    this.editId = null;
  }

  private persistirDespesas(): void {
    if (!this.orcamentoId) return;
    if (this.statusAtual === 'pendente') {
      this.statusAtual = 'em-andamento';
    }
    this.s.saveCustoSnapshot(this.orcamentoId, { premissas: this.form, despesas: this.despesas, status: this.statusAtual });
  }

  salvarRascunho(): void {
    if (!this.isEditable) return;
    this.statusAtual = 'em-andamento';
    this.s.saveCustoSnapshot(this.orcamentoId, {
      premissas: this.form,
      despesas: this.despesas,
      valorTotal: this.desembolsoTotal,
      status: this.statusAtual,
      data: new Date().toISOString()
    });
    this.showSaved = true;
    if (this.voltarClicked.observed) {
      this.voltarClicked.emit();
    } else {
      this.router.navigate(['/orcamento', this.orcamentoId]);
    }
  }

  finalizar(): void {
    if (!this.podeFinalizar) return;
    this.statusAtual = 'concluido';
    this.s.saveCustoSnapshot(this.orcamentoId, {
      premissas: this.form,
      despesas: this.despesas,
      valorTotal: this.desembolsoTotal,
      status: this.statusAtual,
      data: new Date().toISOString()
    });
    this.readOnly = true;
    this.showSaved = true;
    if (this.voltarClicked.observed) {
      this.voltarClicked.emit();
    } else {
      this.router.navigate(['/orcamento', this.orcamentoId]);
    }
  }

  confirmSaved() {
    this.showSaved = false;
  }

  voltar(): void {
    if (this.voltarClicked.observed) {
      this.voltarClicked.emit();
    } else {
      this.router.navigate(['/orcamento', this.orcamentoId]);
    }
  }
}
