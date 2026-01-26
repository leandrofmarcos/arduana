import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CustoService } from '../services/custo.service';
import { Despesa, CategoriaDespesa } from '../models/custo.models';
import { ResumoFinanceiroComponent } from '../../packlist/pages/resumo-financeiro.component';

@Component({
  standalone: true,
  selector: 'app-custo-nova',
  imports: [CommonModule, RouterModule, FormsModule, ResumoFinanceiroComponent],
  template: `
    <div class="card" *ngIf="!editing">
      <div class="header">
        <div class="title">🧮 Planilha de Custo</div>
        <div class="subtitle">Registros gerados ao importar o packlist</div>
      </div>
      <div class="accent"></div>
      <table class="table">
        <thead>
          <tr>
            <th>Processo</th>
            <th>Cliente</th>
            <th>Despachante</th>
            <th>Criado em</th>
            <th style="width:120px">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngIf="custos.length === 0"><td colspan="5">Nenhum registro</td></tr>
          <tr *ngFor="let c of custos">
            <td>{{c.codigo || c.orcamentoId}}</td>
            <td>{{c.cliente || '-'}} </td>
            <td>{{c.despachante || '-'}} </td>
            <td>{{c.createdAt | date:'short'}}</td>
            <td>
              <div class="row-actions">
                <button class="btn-icon" title="Editar" (click)="editar(c)">✏️</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div *ngIf="editing">
      <div class="header-card">
        <h1 class="header-title">Planilha de Custo</h1>
        <p class="header-subtitle">Fase do despachante: premissas e despesas estimadas</p>
        <div class="meta-grid">
          <div class="meta-box">
            <div class="meta-label">Produto</div>
            <div class="meta-value">{{editing['produto'] || '-'}}</div>
          </div>
          <div class="meta-box">
            <div class="meta-label">Código</div>
            <div class="meta-value">{{editing.codigo || '-'}}</div>
          </div>
          <div class="meta-box">
            <div class="meta-label">Orçamento</div>
            <div class="meta-value">{{editing.orcamentoId}}</div>
          </div>
          <div class="meta-box">
            <div class="meta-label">Cliente</div>
            <div class="meta-value">{{editing.cliente || '-'}}</div>
          </div>
          <div class="meta-box">
            <div class="meta-label">Data Simulação</div>
            <div class="meta-value">{{editing['data'] || '-'}}</div>
          </div>
          <div class="meta-box">
            <div class="meta-label">Origem</div>
            <div class="meta-value">{{editing['origem'] || '-'}}</div>
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
                    <td>{{d.item}}</td>
                    <td>{{d.fornecedor || ''}}</td>
                    <td>{{d.valor | currency:'BRL'}}</td>
                    <td>{{d.observacao || ''}}</td>
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
        <button class="btn btn-secondary" (click)="cancelarEdicao()">Cancelar</button>
        <button class="btn btn-primary" (click)="salvarEdicao()" [disabled]="statusAtual !== 'Orçamento'">Salvar Alterações</button>
        <button class="btn btn-primary" (click)="gerarPlanilhaVenda()" [disabled]="statusAtual !== 'Orçamento'">Gerar Planilha de Venda</button>
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
    `.header{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:8px}`,
    `.title{font-size:1.4rem;font-weight:800}`,
    `.subtitle{opacity:.8}`,
    `.accent{height:6px;background:var(--gradient-primary);border-radius:8px;margin:12px 0}`,
    `.btn{padding:10px 12px;border-radius:10px}`,
    `.btn-primary{background:var(--gradient-primary);color:#fff;border:none}`,
    `.btn[disabled]{opacity:.6;cursor:not-allowed}`,
    `.btn-icon{width:36px;height:36px;display:flex;align-items:center;justify-content:center;border:2px solid var(--color-border);border-radius:8px;background:var(--color-surface);cursor:pointer}`,
    `.table{width:100%;border-collapse:collapse;margin-top:12px}`,
    `.table thead{background:var(--color-bg)}`,
    `.table th{padding:12px;text-align:left;font-size:13px;font-weight:600;color:var(--color-text);border-bottom:2px solid var(--color-border)}`,
    `.table td{padding:12px;border-bottom:1px solid var(--color-border);font-size:14px}`,
    `.row-actions{display:flex;gap:8px}`,
    `.form-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px;margin-top:12px}`,
    `.field{display:flex;flex-direction:column;position:relative}`,
    `.field label{font-size:13px;font-weight:600;color:var(--color-muted);margin-bottom:8px}`,
    `.hint{position:absolute;right:10px;top:36px;font-size:.8rem;opacity:.6}`,
    `.field input,.field select{padding:13px 16px;border:2px solid var(--color-border);border-radius:8px;font-size:15px;transition:.2s;background:var(--color-surface)}`,
    `.field input:focus,.field select:focus{outline:none;border-color:var(--color-primary);box-shadow:0 0 0 4px rgba(102,126,234,.1)}`,
    `.field input[readonly]{background:var(--color-subtle-bg);color:var(--color-text);font-weight:600;cursor:not-allowed}`,
    `.section{margin-top:16px}`,
    `.section-title{font-size:18px;font-weight:700;color:var(--color-text);margin:0 0 20px 0;display:flex;align-items:center;gap:10px;padding-bottom:12px;border-bottom:2px solid var(--color-border)}`,
    `.section-number{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;background:var(--gradient-primary);color:#fff;border-radius:50%;font-size:14px;font-weight:700}`,
    `.info-bar{display:flex;gap:24px;margin:8px 0;padding:8px 12px;background:rgba(0,0,0,.03);border:1px solid var(--color-border);border-radius:8px}`,
    `.editor-grid{display:grid;grid-template-columns:1.2fr .8fr;gap:16px;margin-top:8px}`,
    `.editor-left,.editor-right{display:flex;flex-direction:column;gap:16px}`,
    `.header-card{background:var(--gradient-primary);color:#fff;padding:24px;border-radius:12px;margin-bottom:24px;box-shadow:0 4px 6px -1px rgba(0,0,0,.1)}`,
    `.header-title{font-size:24px;font-weight:800;margin:0 0 8px 0}`,
    `.header-subtitle{font-size:14px;opacity:.9;margin:0 0 16px 0}`,
    `.meta-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:12px}`,
    `.meta-box{background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.25);border-radius:12px;padding:10px 12px;color:#fff}`,
    `.meta-label{font-size:11px;opacity:.85;letter-spacing:.6px;text-transform:uppercase;margin-bottom:6px}`,
    `.meta-value{font-weight:700}`,
    `.expenses-grid{display:flex;flex-direction:column;gap:10px}`,
    `.expense-row{display:grid;grid-template-columns:1.4fr .6fr;gap:10px;align-items:center}`,
    `.label{font-weight:600;opacity:.9}`,
    `.value{display:flex;justify-content:flex-end}`,
    `.actions{display:flex;gap:8px;justify-content:flex-end;margin-top:12px}`,
    `.category-badge{display:inline-block;padding:4px 12px;border-radius:12px;font-size:12px;font-weight:600;background:var(--color-bg);color:var(--color-muted)}`,
    `.summary-card{background:linear-gradient(135deg,#667eea20 0%,#764ba220 100%);border:2px solid var(--color-primary)}`,
    `.summary-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:16px}`,
    `.summary-item{text-align:center}`,
    `.summary-label{font-size:12px;color:var(--color-muted);margin-bottom:4px;text-transform:uppercase;font-weight:600}`,
    `.summary-value{font-size:20px;font-weight:700;color:var(--color-primary)}`,
    `.summary-value.large{font-size:28px;background:var(--gradient-primary);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}`,
    `.summary-subtitle{font-size:12px;font-weight:800;color:var(--color-muted);margin-bottom:8px;text-transform:uppercase}`,
    `.summary-group{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;background:rgba(0,0,0,.03);border:1px solid var(--color-border);border-radius:10px;padding:10px}`,
    `.actions-inline{display:flex;gap:10px;justify-content:flex-end;margin:8px 0 16px}`,
    `.pill{display:inline-block;padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.8);color:var(--color-primary-ink);font-weight:700;border:2px solid var(--color-border)}`,
    `.modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center}`,
    `.modal{width:360px;background:var(--color-surface);border:1px solid var(--color-border);border-radius:12px;overflow:hidden;box-shadow:0 10px 20px rgba(0,0,0,.2)}`,
    `.modal-header{background:var(--color-header-bg);color:#fff;padding:12px 16px;font-weight:800}`,
    `.modal-body{padding:16px}`,
    `.modal-actions{display:flex;justify-content:flex-end;padding:12px 16px;border-top:1px solid var(--color-border)}`
  ]
})
export class CustoNovaComponent implements OnInit {
  custos: { id?: string; orcamentoId: string; codigo?: string; cliente?: string; despachante?: string; createdAt: string }[] = [];
  editing: { orcamentoId: string; codigo?: string; cliente?: string; despachante?: string; produto?: string; data?: string; origem?: string } | null = null;
  form: any = { fobUsd: 0, freteUsd: 0, seguroUsd: 0, taxaUsd: 5, ncm: '', pesoLiquido: 0, quantProdutos: 0, txUtilizacao: 0, servicoDesp: 0, armazenagem: 0 };
  statusAtual: string | null = null;
  errors: Record<string,string> = {};
  private runValidation(data: any, rules: Record<string, Array<(v:any)=>string|null>>): Record<string,string> {
    const out: Record<string,string> = {};
    Object.keys(rules).forEach(k=>{
      const fns = rules[k] || [];
      for(const fn of fns){
        const msg = fn((data as any)[k]);
        if(msg){ out[k] = msg; break; }
      }
    });
    return out;
  }
  premissasRules: Record<string, Array<(v:any)=>string|null>> = {
    fobUsd: [v => typeof v === 'number' && v >= 0 ? null : 'FOB inválido'],
    freteUsd: [v => typeof v === 'number' && v >= 0 ? null : 'Frete inválido'],
    seguroUsd: [v => typeof v === 'number' && v >= 0 ? null : 'Seguro inválido'],
    taxaUsd: [v => typeof v === 'number' && v > 0 ? null : 'Taxa USD/BRL inválida'],
    pesoLiquido: [v => typeof v === 'number' && v >= 0 ? null : 'Peso inválido'],
    quantProdutos: [v => Number.isInteger(v) && v >= 0 ? null : 'Quantidade inválida']
  };
  validarPremissas(): boolean {
    this.errors = this.runValidation(this.form, this.premissasRules);
    return Object.keys(this.errors).length === 0;
  }
  constructor(private s: CustoService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.custos = this.s.listCustos();
    const target = this.route.snapshot.queryParamMap.get('orcamento');
    if (target) {
      // tenta obter meta do orçamento para preencher header
      let meta: any = null;
      try {
        meta = (globalThis as any).localStorage?.getItem(`orcamento_${target}`);
        meta = meta ? JSON.parse(meta) : null;
      } catch { meta = null; }
      this.s.ensureByOrcamento(target, { codigo: meta?.codigo, cliente: meta?.cliente, despachante: meta?.despachante });
      this.custos = this.s.listCustos();
      const custo = this.custos.find((c: any) => c.orcamentoId === target || c.id === target);
      if (custo) {
        this.editar(custo);
      }
    }
  }
  editar(c: { orcamentoId: string; codigo?: string; cliente?: string; despachante?: string }){
    this.editing = c;
    const item = this.s.getListItem(c.orcamentoId);
    this.statusAtual = item?.status || null;
    this.readOnly = !(this.statusAtual === 'Orçamento');
    const snap = this.s.getCustoSnapshot(c.orcamentoId);
    if(snap){
      this.form = { ...this.form, ...(snap.premissas || {}) };
      this.despesas = Array.isArray(snap.despesas) ? (snap.despesas as any) : [];
    }
  }
  cancelarEdicao(){ this.editing = null; }
  salvarEdicao(){
    if(this.statusAtual !== 'Orçamento') return;
    if(!this.validarPremissas()) return;
    const pid = this.editing?.orcamentoId;
    if(pid){
      this.s.saveCustoSnapshot(pid, { premissas: this.form, despesas: this.despesas });
      this.showSaved = true;
    }
  }
  gerarPlanilhaVenda(){
    if(this.statusAtual !== 'Orçamento') return;
    if(!this.validarPremissas()) return;
    const pid = this.editing?.orcamentoId;
    if(pid){
      const vendaExistente = this.s.getVendaSnapshot(pid);
      if(vendaExistente) return;
      this.s.saveVendaSnapshot(pid, { premissas: this.form, despesas: [] });
      this.showSaved = true;
    }
  }
  readOnly = true;
  showSaved = false;
  despesas: Despesa[] = [];
  novaDespesa: { categoria: CategoriaDespesa; item: string; fornecedor?: string; valor: number; observacao?: string } = { categoria: 'Despachante', item: '', fornecedor: '', valor: 0, observacao: '' };
  editId: string | null = null;
  get totais(){
    const cifUsd = (this.form.fobUsd || 0) + (this.form.freteUsd || 0) + (this.form.seguroUsd || 0);
    const cifBrl = cifUsd * (this.form.taxaUsd || 0);
    const totalDespesas = this.despesas.reduce((s,d)=>s + (d.valor||0), 0);
    return { cifUsd, cifBrl, totalDespesas, custoTotal: cifBrl + totalDespesas };
  }
  get resumoPremissas(){
    const cifUsd = (this.form.fobUsd || 0) + (this.form.freteUsd || 0) + (this.form.seguroUsd || 0);
    const cifBrl = cifUsd * (this.form.taxaUsd || 0);
    return { cifUsd, cifBrl };
  }
  get resumoDesembaraco(){
    const total = this.despesas.reduce((s,d)=>s + (d.valor||0), 0);
    return { total };
  }
  get totalDespesas(){ return this.despesas.reduce((s,d)=>s + (d.valor||0), 0); }
  adicionarDespesa(){
    if(this.statusAtual !== 'Orçamento') return;
    const n = this.novaDespesa;
    if(!n.item || (n.valor||0) <= 0) return;
    if(this.editId){
      const idx = this.despesas.findIndex(x=>x.id===this.editId);
      if(idx>=0){ this.despesas[idx] = { id: this.editId, categoria: n.categoria, item: n.item, fornecedor: n.fornecedor, valor: n.valor||0, observacao: n.observacao }; }
      this.editId = null;
    } else {
      const id = `${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
      this.despesas.push({ id, categoria: n.categoria, item: n.item, fornecedor: n.fornecedor, valor: n.valor||0, observacao: n.observacao });
    }
    this.limparDespesaForm();
  }
  limparDespesaForm(){ this.novaDespesa = { categoria: 'Despachante', item: '', fornecedor: '', valor: 0, observacao: '' }; this.editId = null; }
  // categoria é fixa (Despachante); listagem simples
  editarDespesa(d: Despesa){ if(this.statusAtual !== 'Orçamento') return; this.novaDespesa = { categoria: d.categoria, item: d.item, fornecedor: d.fornecedor, valor: d.valor, observacao: d.observacao }; this.editId = d.id; }
  removerDespesa(id: string){ if(this.statusAtual !== 'Orçamento') return; this.despesas = this.despesas.filter(x=>x.id!==id); if(this.editId===id) this.editId = null; }
  confirmSaved(){ this.showSaved = false; this.editing = null; }
}
