import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VendaService } from '../services/venda.service';
import { PlanilhaVenda } from '../models/venda.models';
import { ResumoFinanceiroComponent } from '../../packlist/pages/resumo-financeiro.component';
import { Despesa, CategoriaDespesa } from '../../custo/models/custo.models';

@Component({
  standalone: true,
  selector: 'app-venda-nova',
  imports: [CommonModule, RouterModule, FormsModule, ResumoFinanceiroComponent],
  template: `
    <div class="card" *ngIf="!editing">
      <div class="header">
        <div class="title">💼 Planilha de Venda</div>
        <div class="subtitle">Registros gerados a partir da planilha de custo</div>
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
          <tr *ngIf="vendas.length === 0"><td colspan="5">Nenhum registro</td></tr>
          <tr *ngFor="let v of vendas">
            <td>{{v.codigo || v.orcamentoId}}</td>
            <td>{{v.cliente || '-'}} </td>
            <td>{{v.despachante || '-'}} </td>
            <td>{{v.createdAt | date:'short'}}</td>
            <td>
              <div class="row-actions">
                <button class="btn-icon" title="Editar" (click)="editar(v)">✏️</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div *ngIf="editing">
      <div class="header-card">
        <h1 class="header-title">Planilha de Venda</h1>
        <p class="header-subtitle">Dados de venda referenciados da planilha de custo</p>
      </div>

      <div class="editor-grid">
        <div class="editor-left">
          <div class="card">
            <button class="accordion-head" (click)="toggle('premissas')"><span class="section-number">1</span> Premissas de Venda</button>
            <div class="accordion-content" *ngIf="acc.premissas">
              <div class="form-grid">
                <div class="field"><label>FOB (USD)</label><input type="number" step="0.01" [(ngModel)]="form.fobUsd" [readonly]="true" placeholder="0.00"><div class="hint">USD</div></div>
                <div class="field"><label>Frete Internacional (USD)</label><input type="number" step="0.01" [(ngModel)]="form.freteUsd" [readonly]="true" placeholder="0.00"><div class="hint">USD</div></div>
                <div class="field"><label>Seguro (USD)</label><input type="number" step="0.01" [(ngModel)]="form.seguroUsd" [readonly]="true" placeholder="0.00"><div class="hint">USD</div></div>
                <div class="field"><label>Taxa USD/BRL</label><input type="number" step="0.0001" [(ngModel)]="form.taxaUsd" [readonly]="true" placeholder="5.0000"><div class="hint">Taxa de câmbio</div></div>
                <div class="field"><label>NCM</label><input type="text" [(ngModel)]="form.ncm" [readonly]="true" placeholder="8423"></div>
                <div class="field"><label>Peso Líquido (kg)</label><input type="number" step="0.01" [(ngModel)]="form.pesoLiquido" [readonly]="true" placeholder="0.00"></div>
                <div class="field"><label>Quantidade de Produtos</label><input type="number" step="1" [(ngModel)]="form.quantProdutos" [readonly]="true" placeholder="0"></div>
              </div>
            </div>
          </div>

          <div class="card">
            <button class="accordion-head" (click)="toggle('despachante')"><span class="section-number">2</span> Despachante</button>
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

          <div class="card">
            <button class="accordion-head" (click)="toggle('itens')"><span class="section-number">3</span> Despesas no desembaraço</button>
            <div class="accordion-content" *ngIf="acc.itens">
              <div class="form-grid-2" style="margin-bottom:12px;">
                <div class="field readonly-label"><label>Categoria</label><div class="pill">Agência Marítima</div></div>
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
                      <th>Item</th>
                      <th>Fornecedor</th>
                      <th>Valor (R$)</th>
                      <th>Observação</th>
                      <th style="width:200px">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngIf="despesas.length === 0">
                      <td colspan="5">Nenhum item</td>
                    </tr>
                    <tr *ngFor="let d of despesas">
                      <td>{{d.item}}</td>
                      <td>{{d.fornecedor || ''}}</td>
                      <td>{{d.valor | currency:'BRL'}}</td>
                      <td>{{d.observacao || ''}}</td>
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
            </div>
          </div>
        </div>

        <div class="editor-right">
          <app-resumo-financeiro [form]="form" [despesas]="despesas" [despesasDespachante]="despesasDespachante"></app-resumo-financeiro>
        </div>
      </div>

      <div class="actions">
        <button class="btn btn-secondary" (click)="cancelarEdicao()">Cancelar</button>
        <button class="btn btn-primary" (click)="salvarEdicao()">Salvar Alterações</button>
        <button class="btn btn-primary" (click)="abrirConfirmacaoEnvio()">Enviar para Aprovação</button>
      </div>
      <div class="modal-backdrop" *ngIf="confirmEnviar">
        <div class="modal">
          <div class="modal-header">📤 Enviar para Aprovação</div>
          <div class="modal-body">Deseja enviar esta venda para aprovação do cliente?</div>
          <div class="modal-actions">
            <button class="btn btn-secondary" (click)="cancelarEnvio()">Cancelar</button>
            <button class="btn btn-primary" (click)="confirmarEnvio()">Confirmar</button>
          </div>
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
    `.btn-icon{width:36px;height:36px;display:flex;align-items:center;justify-content:center;border:2px solid var(--color-border);border-radius:8px;background:var(--color-surface);cursor:pointer}`,
    `.accordion-head{display:flex;align-items:center;gap:10px;width:100%;text-align:left;background:var(--color-bg);border:1px solid var(--color-border);border-radius:10px;padding:12px;font-weight:700;cursor:pointer}`,
    `.accordion-content{margin-top:12px}`,
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
    `.section-title{font-size:18px;font-weight:700;color:var(--color-text);margin:0 0 20px 0;display:flex;align-items:center;gap:10px;padding-bottom:12px;border-bottom:2px solid var(--color-border)}`,
    `.section-number{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;background:var(--gradient-primary);color:#fff;border-radius:50%;font-size:14px;font-weight:700}`,
    `.editor-grid{display:grid;grid-template-columns:1.2fr .8fr;gap:16px;margin-top:8px}`,
    `.editor-left,.editor-right{display:flex;flex-direction:column;gap:16px}`,
    `.summary-card{background:linear-gradient(135deg,#667eea20 0%,#764ba220 100%);border:2px solid var(--color-primary)}`,
    `.summary-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:16px}`,
    `.summary-item{text-align:center}`,
    `.summary-label{font-size:12px;color:var(--color-muted);margin-bottom:4px;text-transform:uppercase;font-weight:600}`,
    `.summary-value{font-size:20px;font-weight:700;color:var(--color-primary)}`,
    `.summary-value.large{font-size:28px;background:var(--gradient-primary);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}`,
    `.actions-inline{display:flex;gap:10px;justify-content:flex-end;margin:8px 0 16px}`,
    `.pill{display:inline-block;padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.8);color:var(--color-primary-ink);font-weight:700;border:2px solid var(--color-border)}`
    ,`.actions{display:flex;gap:8px;justify-content:flex-end;margin-top:12px}`
    ,`.modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center}`
    ,`.modal{width:360px;background:var(--color-surface);border:1px solid var(--color-border);border-radius:12px;overflow:hidden;box-shadow:0 10px 20px rgba(0,0,0,.2)}`
    ,`.modal-header{background:var(--color-header-bg);color:#fff;padding:12px 16px;font-weight:800}`
    ,`.modal-body{padding:16px}`
    ,`.modal-actions{display:flex;justify-content:flex-end;padding:12px 16px;border-top:1px solid var(--color-border)}`
  ]
})
export class VendaNovaComponent {
  vendas: { orcamentoId: string; codigo?: string; cliente?: string; despachante?: string; createdAt: string }[] = [];
  editing: { orcamentoId: string; codigo?: string; cliente?: string; despachante?: string } | null = null;
  form: any = { fobUsd: 0, freteUsd: 0, seguroUsd: 0, taxaUsd: 5, ncm: '', pesoLiquido: 0, quantProdutos: 0 };
  readOnly = true;
  despesas: Despesa[] = [];
  despesasDespachante: Despesa[] = [];
  acc = { premissas: false, despachante: false, itens: true };
  toggle(k: 'premissas'|'despachante'|'itens'){ this.acc[k] = !this.acc[k]; }
  novaDespesa: { categoria: CategoriaDespesa; item: string; fornecedor?: string; valor: number; observacao?: string } = { categoria: 'Agência Marítima', item: '', fornecedor: '', valor: 0, observacao: '' };
  editId: string | null = null;
  constructor(private s: VendaService, private router: Router){ this.vendas = this.s.listVendas(); }
  editar(v: { orcamentoId: string; codigo?: string; cliente?: string; despachante?: string }){
    this.editing = v;
    const item = this.s.getListItem(v.orcamentoId);
    this.readOnly = !(item?.status === 'Em aprovação');
    const snap = this.s.getVendaSnapshot(v.orcamentoId);
    if(snap){
      this.form = { ...this.form, ...(snap.premissas || {}) };
      const arr = Array.isArray(snap.despesas) ? (snap.despesas as any) : [];
      this.despesas = (arr as Despesa[]).filter((d: Despesa) => d.categoria === 'Agência Marítima');
    }
    const snapCusto = this.s.getCustoSnapshot(v.orcamentoId);
    if(snapCusto){
      const arr = Array.isArray(snapCusto.despesas) ? (snapCusto.despesas as any) : [];
      this.despesasDespachante = (arr as Despesa[]).filter((d: Despesa) => d.categoria === 'Despachante');
    }
  }
  cancelarEdicao(){ this.editing = null; }
  salvarEdicao(){ const pid = this.editing?.orcamentoId; if(pid){ this.s.saveVendaSnapshot(pid, { premissas: this.form, despesas: this.despesas }); this.editing = null; } }
  get totais(){ const cifUsd = (this.form.fobUsd || 0) + (this.form.freteUsd || 0) + (this.form.seguroUsd || 0); const cifBrl = cifUsd * (this.form.taxaUsd || 0); const totalDespesas = this.despesas.reduce((s,d)=>s + (d.valor||0), 0); return { cifUsd, cifBrl, totalDespesas, custoTotal: cifBrl + totalDespesas }; }
  get totalDespachante(){ return this.despesasDespachante.reduce((s,d)=>s + (d.valor||0), 0); }
  adicionarDespesa(){ const n = this.novaDespesa; if(!n.item || (n.valor||0) <= 0) return; if(this.editId){ const idx = this.despesas.findIndex(x=>x.id===this.editId); if(idx>=0){ this.despesas[idx] = { id: this.editId, categoria: n.categoria, item: n.item, fornecedor: n.fornecedor, valor: n.valor||0, observacao: n.observacao }; } this.editId = null; } else { const id = `${Date.now()}_${Math.random().toString(36).slice(2,8)}`; this.despesas.push({ id, categoria: n.categoria, item: n.item, fornecedor: n.fornecedor, valor: n.valor||0, observacao: n.observacao }); } this.limparDespesaForm(); }
  limparDespesaForm(){ this.novaDespesa = { categoria: 'Agência Marítima', item: '', fornecedor: '', valor: 0, observacao: '' }; this.editId = null; }
  editarDespesa(d: Despesa){ this.novaDespesa = { categoria: d.categoria, item: d.item, fornecedor: d.fornecedor, valor: d.valor, observacao: d.observacao }; this.editId = d.id; }
  removerDespesa(id: string){ this.despesas = this.despesas.filter(x=>x.id!==id); if(this.editId===id) this.editId = null; }
  confirmEnviar = false;
  abrirConfirmacaoEnvio(){ this.confirmEnviar = true; }
  cancelarEnvio(){ this.confirmEnviar = false; }
  confirmarEnvio(){
    const pid = this.editing?.orcamentoId;
    if(!pid) return;
    this.s.update(pid, { aprovadoCliente: false, status: 'Em aprovação' });
    this.confirmEnviar = false;
    this.router.navigateByUrl('/orcamento/lista');
  }

}
