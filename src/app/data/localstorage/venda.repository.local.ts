import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { VendaRepository } from '../../domain/venda.repository';
import { VendaData } from '../../domain/venda.models';

function readJSON<T>(key: string): T | null {
  try { const ls = (globalThis as any).localStorage as Storage | undefined; if (!ls) return null; const raw = ls.getItem(key); return raw ? JSON.parse(raw) as T : null; } catch { return null; }
}
function writeJSON(key: string, value: any) {
  try { const ls = (globalThis as any).localStorage as Storage | undefined; if (!ls) return; ls.setItem(key, JSON.stringify(value)); } catch {}
}

const KEY = (pid: string) => `import_costs_venda_${pid}`;

@Injectable({ providedIn: 'root' })
export class LocalStorageVendaRepository implements VendaRepository {
  private subjects = new Map<string, BehaviorSubject<VendaData | null>>();

  get$(processoId: string){
    let sub = this.subjects.get(processoId);
    if(!sub){ sub = new BehaviorSubject<VendaData | null>(readJSON<VendaData>(KEY(processoId)) || null); this.subjects.set(processoId, sub); }
    return sub!.asObservable();
  }

  save(data: VendaData){
    writeJSON(KEY(data.processoId), data);
    this.next(data.processoId, data);
  }

  private next(pid: string, data: VendaData | null){
    let sub = this.subjects.get(pid); if(!sub){ sub = new BehaviorSubject<VendaData | null>(data); this.subjects.set(pid, sub); } else { sub.next(data); }
  }
}