import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { OrcamentoService } from '../services/orcamento.service';
import { ClientesService } from '../../clientes/services/clientes.service';
import { OrcamentoListItem, TipoOrcamento } from '../models/orcamento.models';
import { Cliente } from '../../clientes/models/cliente.models';
import { PageHeaderComponent } from '../../../core/layout/page-header.component';

@Pipe({name:'orcamentoFilter', standalone: true})
export class OrcamentoFilterPipe implements PipeTransform {
  transform(list: OrcamentoListItem[] | null, q: string){
    if(!list) return [];
    if(!q) return list;
    const s = q.toLowerCase();
    return list.filter(p =>
      (p.cliente||'').toLowerCase().includes(s) ||
      (p.despachante||'').toLowerCase().includes(s) ||
      (p.codigo||'').toLowerCase().includes(s) ||
      (p.status||'').toLowerCase().includes(s)
    );
  }
}

@Component({
  standalone: true,
  selector: 'app-novo-processo-nova',
  imports: [CommonModule, RouterModule, FormsModule, PageHeaderComponent, OrcamentoFilterPipe],
  template: `
    <div class="container-standard">
      <app-page-header 
        icon="💼" 
        title="Orçamentos" 
        subtitle="Lista e gerenciamento de orçamentos">
        <button class="btn btn-primary" (click)="abrirModalCriar()">+ Criar novo orçamento</button>
      </app-page-header>

      <div class="content-section">
        <div class="toolbar">
          <input class="search" type="text" [(ngModel)]="q" placeholder="🔎 Buscar por cliente, despachante, código ou status" />
        </div>
        <table class="data-table">
        <thead>
          <tr><th>Data</th><th>Cliente</th><th>Despachante</th><th>Código</th><th>Status</th><th style="width:140px">Ações</th></tr>
        </thead>
        <tbody>
          <tr *ngIf="(list|async)?.length === 0"><td colspan="6">Nenhum orçamento</td></tr>
          <tr *ngFor="let p of (list|async) | orcamentoFilter:q" style="cursor: pointer;" (click)="visualizar(p)" class="row-clickable">
            <td>{{p.data | date:'short'}}</td>
            <td>{{p.cliente || '-'}}</td>
            <td>{{p.despachante || '-'}}</td>
            <td>{{p.codigo || '-'}}</td>
            <td>{{p.status}}</td>
            <td>
              <div class="row-actions">
                <button class="btn-icon info" title="Visualizar detalhes do orçamento" (click)="visualizar(p); $event.stopPropagation()">👁️</button>
                <button class="btn-icon" title="Abrir para edição" (click)="abrir(p); $event.stopPropagation()">✏️</button>
                <button class="btn-icon danger" title="Excluir orçamento" (click)="confirmExcluir(p); $event.stopPropagation()">🗑️</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      </div>

      <div class="modal-backdrop" *ngIf="confirmId">
        <div class="modal">
          <div class="modal-header">⚠️ Confirmar exclusão</div>
          <div class="modal-body">Tem certeza que deseja excluir este orçamento?</div>
          <div class="modal-actions">
            <button class="btn btn-secondary" (click)="cancelarExclusao()">Cancelar</button>
            <button class="btn btn-primary" (click)="removerConfirmado()">Excluir</button>
          </div>
        </div>
      </div>

      <div class="modal-backdrop" *ngIf="showModalCriar">
        <div class="modal modal-lg">
          <div class="modal-header-flex">
            <div>
              <h3>Novo Orçamento</h3>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: rgba(255,255,255,0.7);">{{ dataHoraAtual | date:'dd/MM/yyyy HH:mm' }}</p>
            </div>
            <button class="btn-close" (click)="fecharModalCriar()">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-section">
              <div class="field">
                <label>Tipo de Orçamento *</label>
                <select [(ngModel)]="formCriar.tipoOrcamento" class="select-input">
                  <option value=""></option>
                  <option value="Maritimo">🚢 Marítimo</option>
                  <option value="Aereo" disabled>✈️ Aéreo (Indisponível)</option>
                </select>
              </div>

              <div class="form-grid">
                <div class="field">
                  <label>Nome do Cliente *</label>
                  <div class="dropdown-wrapper">
                    <input 
                      type="text" 
                      [(ngModel)]="formCriar.nomeBusca" 
                      (input)="buscarClientes(formCriar.nomeBusca)"
                      (focus)="abrirDropdown()"
                      [placeholder]="formCriar.clienteSelecionado ? formCriar.clienteSelecionado.nome : 'Digite para buscar ou selecionar'"
                      class="input-dropdown">
                    <div class="dropdown" *ngIf="showDropdown">
                      <div 
                        *ngFor="let c of clientesFiltrados" 
                        class="dropdown-item"
                        [class.active]="formCriar.clienteSelecionado?.id === c.id"
                        (click)="selecionarCliente(c)">
                        <div class="dropdown-nome">{{ c.nome }}</div>
                        <div class="dropdown-sub">{{ c.contato }}</div>
                      </div>
                      <div class="dropdown-empty" *ngIf="clientesFiltrados.length === 0 && formCriar.nomeBusca">
                        Nenhum cliente encontrado
                      </div>
                    </div>
                  </div>
                </div>

                <div class="detail-field">
                  <label>Contato</label>
                  <input type="text" [value]="formCriar.clienteSelecionado ? formCriar.clienteSelecionado.contato : ''" readonly class="readonly-input">
                </div>
              </div>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary" (click)="fecharModalCriar()">Cancelar</button>
            <button class="btn btn-primary" (click)="criarNovoOrcamento()" [disabled]="!formCriar.clienteSelecionado">Criar Orçamento</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `.card{background:var(--color-surface);border:1px solid var(--color-border);border-radius:12px;padding:24px}`,
    `.actions{display:flex;justify-content:flex-end;margin:12px 0}`,
    `.btn{padding:10px 12px;border-radius:10px;cursor:pointer;font-size:14px}`,
    `.btn-primary{background:var(--gradient-primary);color:#fff;border:none}`,
    `.btn-primary:disabled{opacity:.6;cursor:not-allowed}`,
    `.btn-secondary{background:var(--color-bg);border:2px solid var(--color-border);color:var(--color-text)}`,
    `.btn-secondary:hover{background:var(--color-border)}`,
    `.btn-icon{width:36px;height:36px;display:flex;align-items:center;justify-content:center;border:2px solid var(--color-border);border-radius:8px;background:var(--color-surface);cursor:pointer}`,
    `.btn-icon.danger{border-color:var(--color-danger);color:var(--color-danger)}`,
    `.btn-icon.info{border-color:#3b82f6;color:#3b82f6}`,
    `.table{width:100%;border-collapse:collapse;margin-top:12px}`,
    `.table th,.table td{border-bottom:1px solid var(--color-border);padding:10px;text-align:left}`,
    `.row-clickable:hover{background-color:var(--color-bg);transition:.15s}`,
    `.toolbar{display:flex;gap:12px;align-items:center;margin-bottom:16px;flex-wrap:wrap}`,
    `.search{flex:1;min-width:200px;padding:13px 16px;border:2px solid var(--color-border);border-radius:8px;font-size:15px}`,
    `.row-actions{display:flex;gap:8px}`,
    `.badge{padding:4px 10px;border-radius:999px;font-size:11px;font-weight:700;display:inline-flex;align-items:center}`,
    `.badge-packlist{background:rgba(102,126,234,.12);color:#4c5fd8;border:1px solid rgba(102,126,234,.35)}`,
    `.badge-manual{background:rgba(16,185,129,.12);color:#0f9d71;border:1px solid rgba(16,185,129,.35)}`,
    `.modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;z-index:1000}`,
    `.modal{background:var(--color-surface);border:1px solid var(--color-border);border-radius:12px;overflow:hidden;box-shadow:0 10px 20px rgba(0,0,0,.2)}`,
    `.modal-lg{width:650px;height:70vh;max-height:70vh;display:flex;flex-direction:column}`,
    `.modal-header{background:var(--color-header-bg);color:#fff;padding:12px 16px;font-weight:800}`,
    `.modal-header-flex{background:var(--color-header-bg);color:#fff;padding:12px 16px;font-weight:800;display:flex;justify-content:space-between;align-items:center}`,
    `.modal-header-flex h3{margin:0;font-size:18px}`,
    `.btn-close{background:none;border:none;color:#fff;font-size:24px;cursor:pointer;padding:0;width:24px;height:24px}`,
    `.modal-body{padding:16px;flex:1;overflow-y:auto}`,
    `.modal-actions{display:flex;justify-content:flex-end;gap:8px;padding:12px 16px;border-top:1px solid var(--color-border);flex-shrink:0}`,
    `.field{display:flex;flex-direction:column;gap:6px}`,
    `.field label{font-size:13px;font-weight:600;color:var(--color-text)}`,
    `.field input{padding:10px 12px;border:2px solid var(--color-border);border-radius:8px;font-size:14px;transition:.2s}`,
    `.field input:focus{outline:none;border-color:var(--color-primary);box-shadow:0 0 0 3px rgba(102,126,234,.1)}`,
    `.form-section{display:flex;flex-direction:column;gap:16px;padding-bottom:16px;border-bottom:2px solid var(--color-border);margin-bottom:16px}`,
    `.form-section .field{margin:0}`,
    `.select-input{width:100%;padding:10px 12px;border:2px solid var(--color-border);border-radius:8px;font-size:14px;transition:.2s;background:var(--color-surface);color:var(--color-text);cursor:pointer;font-family:inherit}`,
    `.select-input:focus{outline:none;border-color:var(--color-primary);box-shadow:0 0 0 3px rgba(102,126,234,.1)}`,
    `.select-input option:disabled{color:#999;background:var(--color-bg)}`,
    `.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}`,
    `.dropdown-wrapper{position:relative}`,
    `.input-dropdown{width:100%;padding:10px 12px;border:2px solid var(--color-border);border-radius:8px;font-size:14px;transition:.2s}`,
    `.input-dropdown:focus{outline:none;border-color:var(--color-primary);box-shadow:0 0 0 3px rgba(102,126,234,.1)}`,
    `.dropdown{position:absolute;top:100%;left:0;right:0;background:#fff;border:2px solid var(--color-primary);border-top:none;border-radius:0 0 8px 8px;max-height:400px;height:400px;overflow-y:auto;z-index:10;box-shadow:0 4px 12px rgba(0,0,0,.15);margin-top:-2px}`,
    `.dropdown-item{padding:10px 12px;border-bottom:1px solid var(--color-border);cursor:pointer;transition:.15s}`,
    `.dropdown-item:last-child{border-bottom:none}`,
    `.dropdown-item:hover{background:var(--color-bg)}`,
    `.dropdown-item.active{background:var(--color-bg);font-weight:600}`,
    `.dropdown-empty{padding:10px 12px;color:#999;text-align:center}`,
    `.dropdown-nome{font-weight:600;font-size:14px}`,
    `.dropdown-sub{font-size:12px;color:#999}`,
    `.detail-field{display:flex;flex-direction:column;gap:4px}`,
    `.detail-field label{font-size:12px;font-weight:600;color:var(--color-text);text-transform:uppercase}`,
    `.readonly-input{width:100%;padding:8px 10px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;background:var(--color-surface);color:var(--color-text);cursor:default}`
  ]
})
export class NovoProcessoNovaComponent implements OnInit {
  list!: import('rxjs').Observable<OrcamentoListItem[]>;
  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  confirmId: string | null = null;
  showModalCriar = false;
  showDropdown = false;
  dataHoraAtual = new Date();
  q = '';

  formCriar = {
    nomeBusca: '',
    clienteSelecionado: null as Cliente | null,
    tipoOrcamento: 'Maritimo' as TipoOrcamento
  };

  constructor(
    private s: OrcamentoService,
    private clientesService: ClientesService,
    private router: Router
  ) {
    this.list = this.s.list$();
  }

  ngOnInit() {
    // Carrega clientes
    this.clientesService.list$().subscribe(clientes => {
      this.clientes = clientes;
    });
  }

  buscarClientes(termo: string) {
    const busca = termo.toLowerCase().trim();
    if (!busca) {
      this.clientesFiltrados = this.clientes;
    } else {
      this.clientesFiltrados = this.clientes.filter(c => 
        c.nome.toLowerCase().includes(busca)
      );
    }
  }

  abrirDropdown() {
    this.showDropdown = true;
    this.buscarClientes(this.formCriar.nomeBusca);
  }

  selecionarCliente(cliente: Cliente) {
    this.formCriar.clienteSelecionado = cliente;
    this.formCriar.nomeBusca = '';
    this.clientesFiltrados = [];
    this.showDropdown = false;
  }

  abrirModalCriar() {
    this.formCriar = { nomeBusca: '', clienteSelecionado: null, tipoOrcamento: 'Maritimo' };
    this.clientesFiltrados = [];
    this.showDropdown = false;
    this.showModalCriar = true;
    this.dataHoraAtual = new Date();
  }

  fecharModalCriar() {
    this.showModalCriar = false;
  }

  criarNovoOrcamento() {
    if (!this.formCriar.clienteSelecionado) return;

    const cliente = this.formCriar.clienteSelecionado;
    // Serviço gera código automaticamente
    const novoId = this.s.criar(
      cliente.id,
      cliente.nome,
      undefined,
      new Date().toISOString(),
      cliente.templatePacklistId,
      undefined,
      undefined,
      this.formCriar.tipoOrcamento
    );

    this.fecharModalCriar();
    // Redirecionar para a tela de detalhes do orçamento
    this.router.navigateByUrl(`/orcamento/${novoId}`);
  }

  abrir(p: OrcamentoListItem) {
    this.s.abrir(p.id);
    this.router.navigateByUrl(`/orcamento/${p.id}`);
  }

  visualizar(p: OrcamentoListItem) {
    this.router.navigateByUrl(`/orcamento/${p.id}`);
  }

  confirmExcluir(p: OrcamentoListItem) { this.confirmId = p.id; }

  removerConfirmado() {
    if (this.confirmId) {
      try { const ls = (globalThis as any).localStorage as Storage | undefined; const cur = ls?.getItem('nova_current_orcamento_id'); if (cur === this.confirmId) { ls?.removeItem('nova_current_orcamento_id'); } } catch { }
      this.s.remover(this.confirmId);
      this.confirmId = null;
    }
  }

  cancelarExclusao() { this.confirmId = null; }

  limparStorage() {
    if (confirm('Tem certeza que deseja reiniciar o fluxo? Isso remove orçamentos, custos, vendas, aduanas e packlists vinculados.')) {
      this.s.limparTodos();
    }
  }
}