import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ProcessoServiceNova, PacklistItem, ProcessoListItem } from '../services/processo.service';
import { keys } from '../data/storage.helper';
import { ClientesService } from '../../features/clientes/clientes.service';
import { DespachantesService } from '../../features/despachantes/despachantes.service';
import { Cliente } from '../../domain/cliente.models';
import { Despachante } from '../../domain/despachante.models';

@Component({
  standalone: true,
  selector: 'app-criar-processo-nova',
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="card">
      <h2>Criar Processo</h2>
      <p>Preencha os dados e importe o packlist (CSV)</p>
      <div class="alert error" *ngIf="triedSubmit && !canSave()">
        ⚠️ Existem campos obrigatórios não preenchidos: {{missingFields.join(', ')}}.
      </div>

      <div class="form-grid">
        <div class="field">
          <label>Cliente</label>
          <select class="input" [class.error]="triedSubmit && !clienteId" [attr.aria-invalid]="triedSubmit && !clienteId" [(ngModel)]="clienteId">
            <option [ngValue]="''">Selecione</option>
            <option *ngFor="let c of clientes" [ngValue]="c.id">{{c.nome}}</option>
          </select>
          <div class="error-text" *ngIf="triedSubmit && !clienteId">Campo obrigatório</div>
        </div>
        <div class="field">
          <label>Despachante</label>
          <select class="input" [class.error]="triedSubmit && !despachanteId" [attr.aria-invalid]="triedSubmit && !despachanteId" [(ngModel)]="despachanteId">
            <option [ngValue]="''">Selecione</option>
            <option *ngFor="let d of despachantes" [ngValue]="d.id">{{d.nome}}</option>
          </select>
          <div class="error-text" *ngIf="triedSubmit && !despachanteId">Campo obrigatório</div>
        </div>
        <div class="field">
          <label>Código</label>
          <input class="input" [class.error]="triedSubmit && !codigo.trim()" [attr.aria-invalid]="triedSubmit && !codigo.trim()" [(ngModel)]="codigo" placeholder="Código do processo" />
          <div class="error-text" *ngIf="triedSubmit && !codigo.trim()">Campo obrigatório</div>
        </div>
        <div class="field">
          <label>Data</label>
          <input class="input" type="date" [class.error]="triedSubmit && !data" [attr.aria-invalid]="triedSubmit && !data" [(ngModel)]="data" />
          <div class="error-text" *ngIf="triedSubmit && !data">Campo obrigatório</div>
        </div>
      </div>

      <div class="upload-row">
        <input #fileInput class="hidden-file" type="file" accept=".csv" (change)="onFileChange($event)" />
        <button class="btn btn-secondary" (click)="fileInput.click()">📤 Upload CSV</button>
        <span class="file-name" *ngIf="fileName">{{fileName}}</span>
        <button class="btn btn-secondary" (click)="importarMock()">Importar CSV (mock)</button>
      </div>

      <div class="table" *ngIf="packlistPreview.length">
        <p class="hint">Pré-visualização de no máximo 10 itens</p>
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Descrição</th>
              <th>Qtd</th>
              <th>Peso (kg)</th>
              <th>Volume (m³)</th>
              <th>Valor (USD)</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of packlistPreviewLimited">
              <td>{{item.codigo}}</td>
              <td>{{item.descricao}}</td>
              <td>{{item.quantidade}}</td>
              <td>{{item.pesoKg}}</td>
              <td>{{item.volumeM3 || '-'}}</td>
              <td>{{item.valorUSD | number:'1.2-2'}}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="actions">
        <button class="btn btn-primary" (click)="trySalvar()">Salvar</button>
        <a class="btn" routerLink="/nova/processo/novo">Cancelar</a>
      </div>

      <div class="modal-backdrop" *ngIf="showSuccess">
        <div class="modal">
          <div class="modal-header">✔️ Sucesso</div>
          <div class="modal-body">Processo criado com sucesso.</div>
          <div class="modal-actions"><button class="btn btn-primary" (click)="confirmSuccess()">OK</button></div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `.card{background:var(--color-surface);border:1px solid var(--color-border);border-radius:12px;padding:24px}`,
    `.alert{padding:12px 16px;border-radius:10px;margin:12px 0}`,
    `.alert.error{border:2px solid var(--color-danger);color:var(--color-danger);background:var(--color-surface)}`,
    `.form-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-top:12px}`,
    `.field{display:flex;flex-direction:column}`,
    `.field label{font-weight:700;margin-bottom:6px}`,
    `.input{border:1px solid var(--color-border);border-radius:8px;padding:10px}`,
    `.input.error{border:2px solid var(--color-danger)}`,
    `.error-text{color:var(--color-danger);font-size:.9em;margin-top:6px}`,
    `.upload-row{display:flex;align-items:center;gap:12px;margin:16px 0}`,
    `.hidden-file{display:none}`,
    `.file-name{font-size:0.9rem;color:var(--color-text-secondary)}`,
    `.hint{color:var(--color-text-secondary);font-size:0.9rem;margin-bottom:8px}`,
    `.table table{width:100%;border-collapse:collapse}`,
    `.table th,.table td{border-bottom:1px solid var(--color-border);padding:10px;text-align:left}`,
    `.actions{display:flex;gap:10px;justify-content:flex-end;margin-top:16px}`,
    `.btn{padding:10px 12px;border-radius:10px}`,
    `.btn-primary{background:var(--gradient-primary);color:#fff;border:none}`,
    `.btn-secondary{background:var(--color-surface);border:2px solid var(--color-primary);color:var(--color-primary);font-weight:700}`,
    `.modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center}`,
    `.modal{width:360px;background:var(--color-surface);border:1px solid var(--color-border);border-radius:12px;overflow:hidden;box-shadow:0 10px 20px rgba(0,0,0,.2)}`,
    `.modal-header{background:var(--color-header-bg);color:#fff;padding:12px 16px;font-weight:800}`,
    `.modal-body{padding:16px}`,
    `.modal-actions{display:flex;justify-content:flex-end;padding:12px 16px;border-top:1px solid var(--color-border)}`
  ]
})
export class CriarProcessoNovaComponent {
  clientes: Cliente[] = [];
  despachantes: Despachante[] = [];
  clienteId: string = '';
  despachanteId: string = '';
  codigo = '';
  data = '';
  packlistPreview: PacklistItem[] = [];
  fileName = '';
  readonly previewMax = 10;
  get packlistPreviewLimited(): PacklistItem[] { return this.packlistPreview.slice(0, this.previewMax); }

  showSuccess = false;
  private editingId: string | null = null;
  triedSubmit = false;
  get missingFields(): string[] {
    const out: string[] = [];
    if(!this.clienteId) out.push('Cliente');
    if(!this.despachanteId) out.push('Despachante');
    if(!this.codigo.trim()) out.push('Código');
    if(!this.data) out.push('Data');
    return out;
  }

  constructor(private s: ProcessoServiceNova, private router: Router, private clientesSvc: ClientesService, private despachantesSvc: DespachantesService) {
    this.clientesSvc.list$().subscribe(list => this.clientes = list || []);
    this.despachantesSvc.list$().subscribe(list => this.despachantes = list || []);
    const d = new Date(); const pad = (n: number) => String(n).padStart(2,'0'); this.data = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
    const id = (globalThis as any).localStorage?.getItem(keys.currentId()) as string | null;
    if(id){
      this.editingId = id;
      const meta = this.s.getMeta(id);
      const item = this.s.getListItem(id) as ProcessoListItem | null;
      if(meta){ this.clienteId = meta.clienteId || ''; this.despachanteId = meta.despachanteId || ''; this.data = meta.createdAt?.slice(0,10) || this.data; }
      if(item){ this.codigo = item.codigo || ''; }
      const pl = this.s.getPacklist(id);
      if(pl && pl.length){ this.packlistPreview = pl; }
    }
  }

  onFileChange(e: Event){ const input = e.target as HTMLInputElement; const f = input?.files?.[0]; this.fileName = f ? f.name : ''; }

  importarMock(){ this.packlistPreview = this.s.loadMockPacklist(); }

  canSave(){ return !!this.clienteId && !!this.despachanteId && !!this.codigo.trim() && !!this.data; }

  trySalvar(){ this.triedSubmit = true; if(this.canSave()) this.salvar(); }

  salvar(){
    const createdAt = this.data ? new Date(this.data).toISOString() : undefined;
    const clienteNome = this.clientes.find(c => c.id === this.clienteId)?.nome || '';
    const despachanteNome = this.despachantes.find(d => d.id === this.despachanteId)?.nome || '';
    if(this.editingId){
      this.s.update(this.editingId, { cliente: clienteNome, clienteId: this.clienteId, despachante: despachanteNome, despachanteId: this.despachanteId, codigo: this.codigo.trim(), data: createdAt || new Date().toISOString() });
      if(this.packlistPreview.length){ this.s.savePacklist(this.editingId, this.packlistPreview); }
      else { this.s.update(this.editingId, { status: 'CRIADO' }); }
      this.showSuccess = true;
    } else {
      const id = this.s.criar(clienteNome, despachanteNome, this.codigo.trim(), createdAt, this.clienteId, this.despachanteId);
      if(this.packlistPreview.length){ this.s.savePacklist(id, this.packlistPreview); }
      (globalThis as any).localStorage?.setItem(keys.currentId(), id);
      this.showSuccess = true;
    }
  }

  confirmSuccess(){ this.showSuccess = false; this.router.navigateByUrl('/nova/processo/novo'); }
}