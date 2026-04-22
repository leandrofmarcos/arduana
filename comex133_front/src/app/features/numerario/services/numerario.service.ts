import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { readJSON, writeJSON, randomId } from '../data/storage.helper';
import { NumerarioItem, NumerarioLancamento } from '../models/numerario.models';

@Injectable({ providedIn: 'root' })
export class NumerarioService {
  private subj = new BehaviorSubject<NumerarioItem[]>([]);
  
  list$(): Observable<NumerarioItem[]> { return this.subj.asObservable(); }
  
  getMeta(id: string): NumerarioItem | null {
    return readJSON<NumerarioItem>(`numerario_${id}`);
  }
  
  getLancamentos(numerarioId: string): NumerarioLancamento[] {
    return readJSON<NumerarioLancamento[]>(`numerario_lancamentos_${numerarioId}`) || [];
  }
  
  saveLancamentos(numerarioId: string, lancamentos: NumerarioLancamento[]): void {
    writeJSON(`numerario_lancamentos_${numerarioId}`, lancamentos);
  }
  
  create(orcamentoId: string): string {
    const id = randomId();
    const data: NumerarioItem = { id, orcamentoId, tipo: '', valor: 0, createdAt: new Date().toISOString() };
    writeJSON(`numerario_${id}`, data);
    
    const index = readJSON<string[]>('numerario_index') || [];
    index.push(id);
    writeJSON('numerario_index', index);
    
    return id;
  }
  
  update(id: string, data: Partial<NumerarioItem>): void {
    const current = readJSON<NumerarioItem>(`numerario_${id}`) || { id, orcamentoId: '', tipo: '', valor: 0 };
    writeJSON(`numerario_${id}`, { ...current, ...data });
  }
  
  remove(id: string): void {
    const index = readJSON<string[]>('numerario_index') || [];
    const newIndex = index.filter(idx => idx !== id);
    writeJSON('numerario_index', newIndex);
    localStorage.removeItem(`numerario_${id}`);
  }
}
