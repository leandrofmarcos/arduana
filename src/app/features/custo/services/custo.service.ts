import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { readJSON, writeJSON, randomId } from '../data/storage.helper';
import { Despesa, CustoListItem } from '../models/custo.models';

@Injectable({ providedIn: 'root' })
export class CustoService {
  private subj = new BehaviorSubject<CustoListItem[]>([]);
  
  list$(): Observable<CustoListItem[]> { return this.subj.asObservable(); }
  
  listCustos(): any[] {
    const index = readJSON<string[]>('custos_index') || [];
    return index.map(id => readJSON<any>(`custo_${id}`)).filter(Boolean);
  }
  
  getMeta(id: string): any {
    return readJSON<any>(`custo_${id}`);
  }
  
  getListItem(id: string): any {
    const index = readJSON<string[]>('custos_index') || [];
    return index.find(idx => idx === id);
  }
  
  getDespesas(custoId: string): Despesa[] {
    return readJSON<Despesa[]>(`custo_despesas_${custoId}`) || [];
  }
  
  saveDespesas(custoId: string, despesas: Despesa[]): void {
    writeJSON(`custo_despesas_${custoId}`, despesas);
  }

  getCustoSnapshot(id: string): { premissas: any; despesas: any[] } | null {
    return readJSON<{ premissas: any; despesas: any[] }>(`custo_${id}`) || null;
  }

  saveCustoSnapshot(id: string, data: { premissas: any; despesas: any[] }): void {
    const snap = readJSON<any>(`custo_${id}`) || {};
    const next = { ...snap, ...data };
    writeJSON(`custo_${id}`, next);
  }

  getVendaSnapshot(id: string): { premissas: any; despesas: any[] } | null {
    return readJSON<{ premissas: any; despesas: any[] }>(`venda_${id}`) || null;
  }

  saveVendaSnapshot(id: string, data: { premissas: any; despesas: any[] }): void {
    const snap = readJSON<any>(`venda_${id}`) || {};
    const next = { ...snap, ...data };
    writeJSON(`venda_${id}`, next);
  }
  
  create(): string {
    const id = randomId();
    writeJSON(`custo_${id}`, { id, createdAt: new Date().toISOString() });
    
    const index = readJSON<string[]>('custos_index') || [];
    index.push(id);
    writeJSON('custos_index', index);
    
    return id;
  }
  
  remove(id: string): void {
    const index = readJSON<string[]>('custos_index') || [];
    const newIndex = index.filter(idx => idx !== id);
    writeJSON('custos_index', newIndex);
    localStorage.removeItem(`custo_${id}`);
  }
}
