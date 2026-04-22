import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { readJSON, writeJSON, randomId } from '../data/storage.helper';
import { PlanilhaVenda, Premissas, Taxas } from '../models/venda.models';

@Injectable({ providedIn: 'root' })
export class VendaService {
  private subj = new BehaviorSubject<any[]>([]);
  
  list$(): Observable<any[]> { return this.subj.asObservable(); }
  
  listVendas(): any[] {
    const index = readJSON<string[]>('vendas_index') || [];
    return index.map(id => this.getListItem(id)).filter(v => v);
  }
  
  getListItem(vendaId: string): any {
    const venda = readJSON<any>(`venda_${vendaId}`);
    return venda ? { orcamentoId: vendaId, codigo: venda.codigo, cliente: venda.cliente, despachante: venda.despachante, createdAt: venda.createdAt, ...venda } : null;
  }
  
  getMeta(id: string): any {
    return readJSON<any>(`venda_${id}`);
  }
  
  getVendaSnapshot(vendaId: string): any {
    return readJSON<any>(`venda_${vendaId}`);
  }
  
  getCustoSnapshot(orcamentoId: string): any {
    return readJSON<any>(`custo_${orcamentoId}`);
  }
  
  saveVendaSnapshot(vendaId: string, data: any): void {
    const venda = readJSON<any>(`venda_${vendaId}`) || {};
    Object.assign(venda, data);
    writeJSON(`venda_${vendaId}`, venda);
  }
  
  getPremissas(vendaId: string): Premissas | null {
    const venda = readJSON<any>(`venda_${vendaId}`);
    return venda?.premissas || null;
  }
  
  savePremissas(vendaId: string, premissas: Premissas): void {
    const venda = readJSON<any>(`venda_${vendaId}`) || {};
    venda.premissas = premissas;
    writeJSON(`venda_${vendaId}`, venda);
  }
  
  create(): string {
    const id = randomId();
    writeJSON(`venda_${id}`, { id, createdAt: new Date().toISOString() });
    
    const index = readJSON<string[]>('vendas_index') || [];
    index.push(id);
    writeJSON('vendas_index', index);
    
    return id;
  }
  
  update(vendaId: string, data: any): void {
    const venda = readJSON<any>(`venda_${vendaId}`) || {};
    Object.assign(venda, data);
    writeJSON(`venda_${vendaId}`, venda);
  }
  
  remove(id: string): void {
    const index = readJSON<string[]>('vendas_index') || [];
    const newIndex = index.filter(idx => idx !== id);
    writeJSON('vendas_index', newIndex);
    localStorage.removeItem(`venda_${id}`);
  }
}
