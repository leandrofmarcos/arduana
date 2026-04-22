import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { readJSON, writeJSON, randomId } from '../data/storage.helper';
import { FechamentoItem } from '../models/fechamento.models';

@Injectable({ providedIn: 'root' })
export class FechamentoService {
  private subj = new BehaviorSubject<FechamentoItem[]>([]);
  
  list$(): Observable<FechamentoItem[]> { return this.subj.asObservable(); }
  
  getMeta(id: string): FechamentoItem | null {
    return readJSON<FechamentoItem>(`fechamento_${id}`);
  }
  
  create(orcamentoId: string): string {
    const id = randomId();
    const data: FechamentoItem = { id, orcamentoId, status: 'ABERTO' };
    writeJSON(`fechamento_${id}`, data);
    
    const index = readJSON<string[]>('fechamento_index') || [];
    index.push(id);
    writeJSON('fechamento_index', index);
    
    return id;
  }
  
  update(id: string, data: Partial<FechamentoItem>): void {
    const current = readJSON<FechamentoItem>(`fechamento_${id}`) || { id, orcamentoId: '', status: '' };
    writeJSON(`fechamento_${id}`, { ...current, ...data });
  }
  
  remove(id: string): void {
    const index = readJSON<string[]>('fechamento_index') || [];
    const newIndex = index.filter(idx => idx !== id);
    writeJSON('fechamento_index', newIndex);
    localStorage.removeItem(`fechamento_${id}`);
  }
}
