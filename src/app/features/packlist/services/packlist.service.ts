import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { readJSON, writeJSON, randomId, keys } from '../data/storage.helper';
import { PacklistItem, PacklistSummary } from '../models/packlist.models';

@Injectable({ providedIn: 'root' })
export class PacklistService {
  private subj = new BehaviorSubject<PacklistSummary[]>([]);
  
  list$(): Observable<PacklistSummary[]> { return this.subj.asObservable(); }
  
  listPacklists(): PacklistSummary[] {
    const index = readJSON<string[]>('packlist_index') || [];
    return index.map(id => readJSON<PacklistSummary>(`packlist_${id}`)).filter(Boolean) as PacklistSummary[];
  }
  
  getItems(packlistId: string): PacklistItem[] {
    return readJSON<PacklistItem[]>(`packlist_items_${packlistId}`) || [];
  }
  
  saveItems(packlistId: string, items: PacklistItem[]): void {
    writeJSON(`packlist_items_${packlistId}`, items);
  }
  
  create(packlist: Omit<PacklistSummary, 'id'>): string {
    const id = randomId();
    const data = { ...packlist, id };
    writeJSON(`packlist_${id}`, data);
    
    const index = readJSON<string[]>('packlist_index') || [];
    index.push(id);
    writeJSON('packlist_index', index);
    
    return id;
  }
  
  remove(id: string): void {
    const index = readJSON<string[]>('packlist_index') || [];
    const newIndex = index.filter(idx => idx !== id);
    writeJSON('packlist_index', newIndex);
    localStorage.removeItem(`packlist_${id}`);
  }
}
