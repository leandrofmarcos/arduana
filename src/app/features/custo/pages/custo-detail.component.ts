import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CustoService } from '../services/custo.service';
import { Despesa, CategoriaDespesa } from '../models/custo.models';
import { ResumoFinanceiroComponent } from '../../packlist/pages/resumo-financeiro.component';
import { keys, readJSON, writeJSON } from '../data/storage.helper';

@Component({
  standalone: true,
  selector: 'app-custo-detail',
  imports: [CommonModule, RouterModule, FormsModule, ResumoFinanceiroComponent],
  template: `
    <div>
      <div class="header-card">
        <div class="header-actions">
          <button class="btn-back" (click)="voltar()">← Voltar</button>
        </div>
        <h1 class="header-title">Planilha de Custo</h1>
        <p class="header-subtitle">Fase do despachante: premissas e despesas estimadas</p>
        <div class="meta-grid">
          <div class="meta-box">
            <div class="meta-label">Código</div>
            <div class="meta-value">{{codigo || '-'}}</div>
          </div>
          <div class="meta-box">
            <div class="meta-label">Orçamento</div>
            <div class="meta-value">{{orcamentoId}}</div>
          </div>
          <div class="meta-box">
            <div class="meta-label">Cliente</div>
            <div class="meta-value">{{cliente || '-'}}</div>
          </div>
          <div class="meta-box">
            <div class="meta-label">Despachante</div>
            <div class="meta-value">{{despachante || '-'}}</div>
          </div>
        </div>
      </div>

      <div class="editor-grid">
        <div class="editor-left">
          <div class="card">
            <h3 class="section-title"><span class="section-number">1</span> Premissas da Operação</h3>
            <div class="form-grid">
              <div class="field"><label>FOB (USD)</label><input type="number" step="0.01" [(ngModel)]="form.fobUsd" [readonly]="readOnly" placeholder="0.00"><div class="hint">USD</div></div>
              <div class="field"><label>Frete Internacional (USD)</label><input type="number" step="0.01" [(ngModel)]="form.freteUsd" [readonly]="readOnly" placeholder="0.00"><div class="hint">USD</div></div>
              <div class="field"><label>Seguro (USD)</label><input type="number" step="0.01" [(ngModel)]="form.seguroUsd" [readonly]="readOnly" placeholder="0.00"><div class="hint">USD</div></div>
              <div class="field"><label>Taxa USD/BRL</label><input type="number" step="0.0001" [(ngModel)]="form.taxaUsd" [readonly]="readOnly" placeholder="5.0000"><div class="hint">Taxa de câmbio</div></div>
              <div class="field"><label>NCM</label><input type="text" [(ngModel)]="form.ncm" [readonly]="readOnly" placeholder="8423"></div>
              <div class="field"><label>Peso Líquido (kg)</label><input type="number" step="0.01" [(ngModel)]="form.pesoLiquido" [readonly]="readOnly" placeholder="0.00"></div>
              <div class="field"><label>Quantidade de Produtos</label><input type="number" step="1" [(ngModel)]="form.quantProdutos" [readonly]="readOnly" placeholder="0"></div>
            </div>
          </div>

          <div class="card">
            <h3 class="section-title"><span class="section-number">2</span> Despesas no Desembaraço</h3>
            <div class="form-grid-2" style="margin-bottom:12px;">
              <div class="field readonly-label"><label>Categoria</label><div class="pill">Despachante</div></div>
              <div class="field"><label>Item</label><input [(ngModel)]="novaDespesa.item" type="text" [readonly]="readOnly" placeholder="Descrição do item"></div>
              <div class="field"><label>Fornecedor</label><input [(ngModel)]="novaDespesa.fornecedor" type="text" [readonly]="readOnly" placeholder="Fornecedor opcional"></div>
              <div class="field"><label>Valor (R$)</label><input [(ngModel)]="novaDespesa.valor" type="number" step="0.01" [readonly]="readOnly" placeholder="0,00"></div>
              <div class="field" style="grid-column: 1 / -1;"><label>Observação</label><input [(ngModel)]="novaDespesa.observacao" type="text" [readonly]="readOnly" placeholder="Detalhes opcionais"></div>
            </div>
            <div class="actions-inline">
              <button class="btn btn-primary" (click)="adicionarDespesa()" [disabled]="statusAtual !== 'Orçamento'">Adicionar</button>
              <button class="btn btn-secondary" (click)="limparDespesaForm()" [disabled]="statusAtual !== 'Orçamento'">Limpar campos</button>
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
                        <button class="btn btn-secondary" (click)="editarDespesa(d)" [disabled]="statusAtual !== 'Orçamento'">Editar</button>
                        <button class="btn btn-secondary" (click)="removerDespesa(d.id)" [disabled]="statusAtual !== 'Orçamento'">Excluir</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="highlight-box"><strong>Total de Despesas com Desembaraço</strong><span class="value">{{totalDespesas | currency:'BRL'}}</span></div>
          </div>
        </div>

        <div class="editor-right">
          <app-resumo-financeiro [form]="form" [despesas]="despesas"></app-resumo-financeiro>
        </div>
      </div>

      <div class="actions">
        <button class="btn btn-secondary" (click)="voltar()">Cancelar</button>
        <button class="btn btn-primary" (click)="salvar()" [disabled]="statusAtual !== 'Orçamento'">Salvar Alterações</button>
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
    `.card{background:var(--color-surface);border:1px solid var(--color-border);border-radius:12px;padding:24px}`,
    `.btn{padding:10px 12px;border-radius:10px;cursor:pointer;font-weight:600;transition:.2s}`,
    `.btn-primary{background:var(--gradient-primary);color:#fff;border:none}`,
    `.btn-primary:hover:not(:disabled){opacity:.9}`,
    `.btn[disabled]{opacity:.6;cursor:not-allowed}`,
    `.btn-secondary{background:var(--color-bg);color:var(--color-text);border:1px solid var(--color-border)}`,
    `.btn-secondary:hover:not(:disabled){background:var(--color-subtle-bg)}`,
    `.btn-back{background:rgba(255,255,255,.2);color:#fff;border:1px solid rgba(255,255,255,.3);padding:10px 16px;border-radius:10px;cursor:pointer;font-weight:600;transition:.2s}`,
    `.btn-back:hover{background:rgba(255,255,255,.3)}`,
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
    `.section-title{font-size:18px;font-weight:700;color:var(--color-text);margin:0 0 20px 0;display:flex;align-items:center;gap:10px;padding-bottom:12px;border-bottom:2px solid var(--color-border)}`,
    `.section-number{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;background:var(--gradient-primary);color:#fff;border-radius:50%;font-size:14px;font-weight:700}`,
    `.editor-grid{display:grid;grid-template-columns:1.2fr .8fr;gap:16px;margin-top:8px}`,
    `.editor-left,.editor-right{display:flex;flex-direction:column;gap:16px}`,
    `.header-card{background:var(--gradient-primary);color:#fff;padding:24px;border-radius:12px;margin-bottom:24px;box-shadow:0 4px 6px -1px rgba(0,0,0,.1);position:relative}`,
    `.header-actions{position:absolute;top:16px;right:16px}`,
    `.header-title{font-size:24px;font-weight:800;margin:0 0 8px 0}`,
    `.header-subtitle{font-size:14px;opacity:.9;margin:0 0 16px 0}`,
    `.meta-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}`,
    `.meta-box{background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.25);border-radius:12px;padding:10px 12px;color:#fff}`,
    `.meta-label{font-size:11px;opacity:.85;letter-spacing:.6px;text-transform:uppercase;margin-bottom:6px}`,
    `.meta-value{font-weight:700}`,
    `.actions{display:flex;gap:8px;justify-content:flex-end;margin-top:12px}`,
    `.actions-inline{display:flex;gap:10px;justify-content:flex-end;margin:8px 0 16px}`,
    `.pill{display:inline-block;padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.8);color:var(--color-primary-ink);font-weight:700;border:2px solid var(--color-border)}`,
    `.highlight-box{display:flex;justify-content:space-between;align-items:center;background:linear-gradient(135deg,#667eea15,#764ba215);border:2px solid var(--color-primary);padding:16px;border-radius:10px;margin-top:16px}`,
    `.highlight-box strong{font-weight:700}`,
    `.highlight-box .value{font-weight:800;font-size:18px;color:var(--color-primary)}`,
    `.modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;z-index:1000}`,
    `.modal{width:360px;background:var(--color-surface);border:1px solid var(--color-border);border-radius:12px;overflow:hidden;box-shadow:0 10px 20px rgba(0,0,0,.2)}`,
    `.modal-header{background:var(--color-header-bg);color:#fff;padding:12px 16px;font-weight:800}`,
    `.modal-body{padding:16px}`,
    `.modal-actions{display:flex;justify-content:flex-end;padding:12px 16px;border-top:1px solid var(--color-border)}`,
    `.table-wrapper{overflow-x:auto;margin-top:12px}`
  ]
})
export class CustoDetailComponent implements OnInit {
  orcamentoId = '';
  codigo?: string;
  cliente?: string;
  despachante?: string;
  form: any = { fobUsd: 0, freteUsd: 0, seguroUsd: 0, taxaUsd: 5, ncm: '', pesoLiquido: 0, quantProdutos: 0 };
  statusAtual: string | null = 'Orçamento';
  readOnly = false;
  showSaved = false;
  despesas: Despesa[] = [];
  novaDespesa: { categoria: CategoriaDespesa; item: string; fornecedor?: string; valor: number; observacao?: string } = { 
    categoria: 'Despachante', item: '', fornecedor: '', valor: 0, observacao: '' 
  };
  editId: string | null = null;

  get totalDespesas() {
    return this.despesas.reduce((s, d) => s + (d.valor || 0), 0);
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private s: CustoService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(p => {
      this.orcamentoId = p['id'] || '';
      this.loadMeta();
      this.loadCusto();
    });
  }

  private loadMeta(): void {
    if (!this.orcamentoId) return;
    const meta = readJSON<any>(keys.orcamento(this.orcamentoId));
    this.cliente = meta?.cliente || this.cliente;
    this.codigo = meta?.codigo || this.codigo || `ORC-${this.orcamentoId}`;
    this.despachante = meta?.despachante;
    
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
      this.despesas = Array.isArray(snap.despesas) ? (snap.despesas as any) : [];
    }
  }

  get totais() {
    const cifUsd = (this.form.fobUsd || 0) + (this.form.freteUsd || 0) + (this.form.seguroUsd || 0);
    const cifBrl = cifUsd * (this.form.taxaUsd || 0);
    const totalDespesas = this.despesas.reduce((s, d) => s + (d.valor || 0), 0);
    return { cifUsd, cifBrl, totalDespesas, custoTotal: cifBrl + totalDespesas };
  }

  get resumoPremissas() {
    const cifUsd = (this.form.fobUsd || 0) + (this.form.freteUsd || 0) + (this.form.seguroUsd || 0);
    const cifBrl = cifUsd * (this.form.taxaUsd || 0);
    return { cifUsd, cifBrl };
  }

  get resumoDesembaraco() {
    const total = this.despesas.reduce((s, d) => s + (d.valor || 0), 0);
    return { total };
  }

  adicionarDespesa() {
    if (this.statusAtual !== 'Orçamento') return;
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
    this.limparDespesaForm();
  }

  editarDespesa(d: Despesa) {
    if (this.statusAtual !== 'Orçamento') return;
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
    if (this.statusAtual !== 'Orçamento') return;
    this.despesas = this.despesas.filter(d => d.id !== id);
  }

  limparDespesaForm() {
    this.novaDespesa = { categoria: 'Despachante', item: '', fornecedor: '', valor: 0, observacao: '' };
    this.editId = null;
  }

  salvar() {
    if (this.statusAtual !== 'Orçamento') return;
    this.s.saveCustoSnapshot(this.orcamentoId, { premissas: this.form, despesas: this.despesas });
    this.showSaved = true;
  }

  confirmSaved() {
    this.showSaved = false;
  }

  voltar(): void {
    this.router.navigate(['/orcamento', this.orcamentoId]);
  }
}
