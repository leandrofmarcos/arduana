import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { readJSON, writeJSON, randomId } from '../data/storage.helper';
import { AduanaItem } from '../models/aduana.models';

@Injectable({ providedIn: 'root' })
export class AduanaService {
  private subj = new BehaviorSubject<AduanaItem[]>([]);
  
  list$(): Observable<AduanaItem[]> { return this.subj.asObservable(); }
  
  listAduanas(): AduanaItem[] {
    const index = readJSON<string[]>('aduana_index') || [];
    return index.map(id => readJSON<AduanaItem>(`aduana_${id}`)).filter(Boolean) as AduanaItem[];
  }
  
  getMeta(id: string): AduanaItem | null {
    return readJSON<AduanaItem>(`aduana_${id}`);
  }
  
  create(orcamentoId: string): string {
    const id = randomId();
    const data: AduanaItem = { id, orcamentoId, tipo: '', createdAt: new Date().toISOString() };
    writeJSON(`aduana_${id}`, data);
    
    const index = readJSON<string[]>('aduana_index') || [];
    index.push(id);
    writeJSON('aduana_index', index);
    
    return id;
  }
  
  update(id: string, data: Partial<AduanaItem>): void {
    const current = readJSON<AduanaItem>(`aduana_${id}`) || { id, orcamentoId: '', tipo: '' };
    writeJSON(`aduana_${id}`, { ...current, ...data });
  }
  
  remove(id: string): void {
    const index = readJSON<string[]>('aduana_index') || [];
    const newIndex = index.filter(idx => idx !== id);
    writeJSON('aduana_index', newIndex);
    localStorage.removeItem(`aduana_${id}`);
  }
}
