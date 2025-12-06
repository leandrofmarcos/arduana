import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { readJSON, writeJSON, randomId, keys } from '../data/storage.helper';
import { ProcessoStore, ProcessoMeta } from '../state/processo.store';

export interface ProcessoListItem {
  id: string;
  cliente?: string;
  despachante?: string;
  clienteId?: string;
  despachanteId?: string;
  codigo?: string;
  data: string;
  status: 'CRIADO' | 'Orçamento' | 'Em aprovação' | 'Aduana' | 'Numerário' | 'Fechamento' | 'Fechado';
}

export interface PacklistItem {
  codigo: string;
  descricao: string;
  quantidade: number;
  pesoKg: number;
  valorUSD: number;
  volumeM3?: number;
}

export interface PacklistSummary {
  id: string;
  cliente?: string;
  despachante?: string;
  codigo?: string;
  items: number;
}

export interface CustoListItem { id: string; processoId: string; codigo?: string; cliente?: string; despachante?: string; createdAt: string; }

@Injectable({ providedIn: 'root' })
export class ProcessoServiceNova {
  private subj = new BehaviorSubject<ProcessoListItem[]>(this.loadIndex());
  private store = inject(ProcessoStore);

  list$(): Observable<ProcessoListItem[]> { return this.subj.asObservable(); }

  private loadIndex(): ProcessoListItem[] {
    return readJSON<ProcessoListItem[]>(keys.processosIndex()) || [];
  }
  private saveIndex(items: ProcessoListItem[]){ writeJSON(keys.processosIndex(), items); }

  criar(cliente?: string, despachante?: string, codigo?: string, data?: string, clienteId?: string, despachanteId?: string){
    const id = randomId();
    const createdAt = data ? new Date(data).toISOString() : new Date().toISOString();
    const meta: ProcessoMeta = { id, title: cliente ? `${cliente} • ${codigo || ''}`.trim() : 'Novo Processo', faseAtual: 'Orcamento', createdAt, aprovado: false, oficializado: false, numerarioPago: false, fechado: false, clienteId, despachanteId };
    writeJSON(keys.processo(id), meta);
    const item: ProcessoListItem = { id, cliente, despachante, clienteId, despachanteId, codigo, data: meta.createdAt, status: 'CRIADO' as const };
    const next = [item, ...this.loadIndex()];
    this.saveIndex(next);
    this.subj.next(next);
    this.logHistory(id, { meta: null, item: null }, { meta, item });
    (globalThis as any).localStorage?.setItem(keys.currentId(), id);
    this.store.load(id);
    return id;
  }

  remover(id: string){
    const list = this.loadIndex().filter(x => x.id !== id);
    this.saveIndex(list);
    this.subj.next(list);
  }

  abrir(id: string){
    (globalThis as any).localStorage?.setItem(keys.currentId(), id);
    this.store.load(id);
  }

  getMeta(id: string): ProcessoMeta | null {
    return readJSON<ProcessoMeta>(keys.processo(id)) || null;
  }

  getListItem(id: string): ProcessoListItem | null {
    const list = this.loadIndex();
    return list.find(x => x.id === id) || null;
  }

  update(id: string, data: Partial<ProcessoMeta & ProcessoListItem>): void {
    const meta = this.getMeta(id);
    if(meta){
      const nextMeta: ProcessoMeta = { ...meta, ...data, id };
      writeJSON(keys.processo(id), nextMeta);
      this.logHistory(id, { meta, item: this.getListItem(id) }, { meta: nextMeta, item: { ...(this.getListItem(id) || {}), ...data, id } as any });
    }
    const list = this.loadIndex();
    const nextList = list.map(it => it.id === id ? { ...it, ...data, id } : it);
    this.saveIndex(nextList);
    this.subj.next(nextList);
  }

  private logHistory(id: string, before: { meta: ProcessoMeta | null; item: ProcessoListItem | null }, after: { meta: ProcessoMeta | null; item: ProcessoListItem | null }){
    const arr = readJSON<any[]>(keys.history(id)) || [];
    arr.push({ at: new Date().toISOString(), before, after });
    writeJSON(keys.history(id), arr);
  }

  getPacklist(id: string): PacklistItem[] {
    return readJSON<PacklistItem[]>(keys.packlist(id)) || [];
  }

  savePacklist(id: string, items: PacklistItem[]): void {
    writeJSON(keys.packlist(id), items);
    const hasItems = items && items.length > 0;
    if(hasItems){
      const list = this.loadIndex();
      const before = this.getListItem(id);
      const nextList = list.map(it => it.id === id ? { ...it, status: 'Orçamento' as const } : it);
      this.saveIndex(nextList);
      this.subj.next(nextList);
      const meta = this.getMeta(id);
      if(meta){ this.logHistory(id, { meta, item: before || null }, { meta, item: this.getListItem(id) }); }
      this.ensureCustoForProcess(id);
    }
  }

  loadMockPacklist(): PacklistItem[] {
    const existing = readJSON<PacklistItem[]>(keys.packlistMock());
    if (existing && existing.length) return existing;
    const def: PacklistItem[] = [
      { codigo: 'PROD-001', descricao: 'Produto A', quantidade: 10, pesoKg: 120, valorUSD: 2500, volumeM3: 1.2 },
      { codigo: 'PROD-002', descricao: 'Produto B', quantidade: 5, pesoKg: 80, valorUSD: 1800, volumeM3: 0.8 },
      { codigo: 'PROD-003', descricao: 'Produto C', quantidade: 20, pesoKg: 200, valorUSD: 3200, volumeM3: 1.8 }
    ];
    writeJSON(keys.packlistMock(), def);
    return def;
  }

  importMockToProcess(id: string): void {
    const items = this.loadMockPacklist();
    this.savePacklist(id, items);
  }

  listPacklists(): PacklistSummary[] {
    const list = readJSON<ProcessoListItem[]>(keys.processosIndex()) || [];
    return list
      .map(it => ({ ...it, items: this.getPacklist(it.id).length }))
      .filter(it => it.items > 0)
      .map(it => ({ id: it.id, cliente: it.cliente, despachante: it.despachante, codigo: it.codigo, items: it.items }));
  }

  // Custo (Planilha de Custo)
  ensureCustoForProcess(id: string): void {
    const idx = (readJSON<any[]>(keys.custosIndex()) || []) as CustoListItem[];
    if(idx.some(x => x.processoId === id)) return;
    const proc = this.getListItem(id);
    const createdAt = new Date().toISOString();
    const novo: CustoListItem = { id: randomId(), processoId: id, codigo: proc?.codigo, cliente: proc?.cliente, despachante: proc?.despachante, createdAt };
    const next = [novo, ...idx];
    writeJSON(keys.custosIndex(), next);
  }
  listCustos(): { processoId: string; codigo?: string; cliente?: string; despachante?: string; createdAt: string }[] {
    return (readJSON<any[]>(keys.custosIndex()) || []) as any[];
  }

  getCustoSnapshot(id: string): { premissas: any; despesas: any[] } | null {
    return readJSON<{ premissas: any; despesas: any[] }>(keys.custoSnapshot(id)) || null;
  }

  saveCustoSnapshot(id: string, data: { premissas: any; despesas: any[] }): void {
    const before = this.getCustoSnapshot(id);
    writeJSON(keys.custoSnapshot(id), data);
    const list = this.loadIndex();
    const beforeItem = this.getListItem(id);
    const nextList = list.map(it => it.id === id ? { ...it, status: 'Orçamento' as const } : it);
    this.saveIndex(nextList);
    this.subj.next(nextList);
    const meta = this.getMeta(id);
    const arr = readJSON<any[]>(keys.history(id)) || [];
    arr.push({ at: new Date().toISOString(), type: 'CUSTO', before: { item: beforeItem, snapshot: before }, after: { item: this.getListItem(id), snapshot: data } });
    writeJSON(keys.history(id), arr);
  }

  ensureVendaForProcess(id: string): void {
    const idx = (readJSON<any[]>(keys.vendasIndex()) || []) as Array<{ id: string; processoId: string; codigo?: string; cliente?: string; despachante?: string; createdAt: string }>;
    if(idx.some(x => x.processoId === id)) return;
    const proc = this.getListItem(id);
    const createdAt = new Date().toISOString();
    const novo = { id: randomId(), processoId: id, codigo: proc?.codigo, cliente: proc?.cliente, despachante: proc?.despachante, createdAt };
    const next = [novo, ...idx];
    writeJSON(keys.vendasIndex(), next);
  }

  listVendas(): { processoId: string; codigo?: string; cliente?: string; despachante?: string; createdAt: string }[] {
    return (readJSON<any[]>(keys.vendasIndex()) || []) as any[];
  }

  getVendaSnapshot(id: string): { premissas: any; despesas: any[] } | null {
    return readJSON<{ premissas: any; despesas: any[] }>(keys.vendaSnapshot(id)) || null;
  }

  saveVendaSnapshot(id: string, data: { premissas: any; despesas: any[] }): void {
    const before = this.getVendaSnapshot(id);
    writeJSON(keys.vendaSnapshot(id), data);
    const list = this.loadIndex();
    const beforeItem = this.getListItem(id);
    const nextList = list.map(it => it.id === id ? { ...it, status: 'Em aprovação' as const } : it);
    this.saveIndex(nextList);
    this.subj.next(nextList);
    const meta = this.getMeta(id);
    const arr = readJSON<any[]>(keys.history(id)) || [];
    arr.push({ at: new Date().toISOString(), type: 'VENDA', before: { item: beforeItem, snapshot: before }, after: { item: this.getListItem(id), snapshot: data } });
    writeJSON(keys.history(id), arr);
    this.ensureVendaForProcess(id);
  }
}