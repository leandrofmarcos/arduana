import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { readJSON, writeJSON, randomId, keys } from '../data/storage.helper';
import { Despesa, CustoListItem } from '../models/custo.models';

@Injectable({ providedIn: 'root' })
export class CustoService {
  private subj = new BehaviorSubject<CustoListItem[]>([]);
  
  list$(): Observable<CustoListItem[]> { return this.subj.asObservable(); }
  
  listCustos(): any[] {
    const index = (readJSON<any[]>(keys.custosIndex()) || []) as any[];
    return index
      .map(entry => typeof entry === 'string' ? { id: entry, orcamentoId: entry } : entry)
      .map(entry => readJSON<any>(keys.custoSnapshot(entry.id || entry.orcamentoId)) || { ...entry, createdAt: entry.createdAt || new Date().toISOString() })
      .filter(Boolean);
  }
  
  getMeta(id: string): any {
    return readJSON<any>(keys.custoSnapshot(id));
  }
  
  getListItem(id: string): any {
    const index = (readJSON<any[]>(keys.custosIndex()) || []) as any[];
    return index.map(entry => typeof entry === 'string' ? { id: entry, orcamentoId: entry } : entry)
      .find(entry => entry.id === id || entry.orcamentoId === id) || null;
  }
  
  getDespesas(custoId: string): Despesa[] {
    return readJSON<Despesa[]>(`custo_despesas_${custoId}`) || [];
  }
  
  saveDespesas(custoId: string, despesas: Despesa[]): void {
    writeJSON(`custo_despesas_${custoId}`, despesas);
  }

  getCustoSnapshot(id: string): { premissas: any; despesas: any[]; [key: string]: any } | null {
    return readJSON<{ premissas: any; despesas: any[]; [key: string]: any }>(`custo_${id}`) || null;
  }

  saveCustoSnapshot(id: string, data: { premissas: any; despesas: any[]; [key: string]: any }): void {
    const snap = readJSON<any>(keys.custoSnapshot(id)) || {};
    const next = { ...snap, ...data };
    writeJSON(keys.custoSnapshot(id), next);
  }

  getVendaSnapshot(id: string): { premissas: any; despesas: any[] } | null {
    return readJSON<{ premissas: any; despesas: any[] }>(keys.vendaSnapshot(id)) || null;
  }

  saveVendaSnapshot(id: string, data: { premissas: any; despesas: any[] }): void {
    const snap = readJSON<any>(keys.vendaSnapshot(id)) || {};
    const next = { ...snap, ...data };
    writeJSON(keys.vendaSnapshot(id), next);
  }
  
  ensureByOrcamento(orcamentoId: string, meta?: { codigo?: string; cliente?: string; despachante?: string }): void {
    const index = (readJSON<any[]>(keys.custosIndex()) || []) as any[];
    const exists = index.some(entry => (entry?.id === orcamentoId) || (entry?.orcamentoId === orcamentoId));
    const createdAt = new Date().toISOString();
    if (!exists) {
      const novo = { id: orcamentoId, orcamentoId, codigo: meta?.codigo, cliente: meta?.cliente, despachante: meta?.despachante, createdAt };
      writeJSON(keys.custoSnapshot(orcamentoId), { ...novo, premissas: {}, despesas: [] });
      writeJSON(keys.custosIndex(), [novo, ...index]);
    }
  }
  
  create(): string {
    const id = randomId();
    writeJSON(keys.custoSnapshot(id), { id, createdAt: new Date().toISOString() });
    
    const index = (readJSON<any[]>(keys.custosIndex()) || []) as any[];
    writeJSON(keys.custosIndex(), [{ id, createdAt: new Date().toISOString() }, ...index]);
    
    return id;
  }
  
  remove(id: string): void {
    const index = (readJSON<any[]>(keys.custosIndex()) || []) as any[];
    const newIndex = index.filter(entry => (entry?.id || entry) !== id && (entry?.orcamentoId !== id));
    writeJSON(keys.custosIndex(), newIndex);
    localStorage.removeItem(keys.custoSnapshot(id));
  }
}

