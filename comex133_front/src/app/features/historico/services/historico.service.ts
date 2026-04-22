import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { readJSON, writeJSON, randomId } from '../data/storage.helper';
import { HistoricoItem } from '../models/historico.models';

@Injectable({ providedIn: 'root' })
export class HistoricoService {
  private subj = new BehaviorSubject<HistoricoItem[]>([]);
  
  list$(): Observable<HistoricoItem[]> { return this.subj.asObservable(); }
  
  getHistorico(orcamentoId: string): HistoricoItem[] {
    const index = readJSON<string[]>(`historico_${orcamentoId}`) || [];
    return index.map(id => readJSON<HistoricoItem>(`historico_item_${id}`)).filter(Boolean) as HistoricoItem[];
  }
  
  addEvento(orcamentoId: string, evento: string, descricao?: string): void {
    const id = randomId();
    const item: HistoricoItem = { id, orcamentoId, evento, descricao, data: new Date().toISOString() };
    writeJSON(`historico_item_${id}`, item);
    
    const index = readJSON<string[]>(`historico_${orcamentoId}`) || [];
    index.push(id);
    writeJSON(`historico_${orcamentoId}`, index);
  }
  
  remove(orcamentoId: string, itemId: string): void {
    const index = readJSON<string[]>(`historico_${orcamentoId}`) || [];
    const newIndex = index.filter(idx => idx !== itemId);
    writeJSON(`historico_${orcamentoId}`, newIndex);
    localStorage.removeItem(`historico_item_${itemId}`);
  }
}
