import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AnexoRepository } from '../../domain/anexo.repository';
import { Anexo } from '../../domain/anexo.models';

function readJSON<T>(key: string): T | null {
  try { const ls = (globalThis as any).localStorage as Storage | undefined; if (!ls) return null; const raw = ls.getItem(key); return raw ? JSON.parse(raw) as T : null; } catch { return null; }
}
function writeJSON(key: string, value: any) {
  try { const ls = (globalThis as any).localStorage as Storage | undefined; if (!ls) return; ls.setItem(key, JSON.stringify(value)); } catch {}
}

const KEY = (pid: string) => `import_costs_anexos_${pid}`;

@Injectable({ providedIn: 'root' })
export class LocalStorageAnexoRepository implements AnexoRepository {
  private subjects = new Map<string, BehaviorSubject<Anexo[]>>();

  list$(processoId: string){
    let sub = this.subjects.get(processoId);
    if(!sub){ sub = new BehaviorSubject<Anexo[]>(readJSON<Anexo[]>(KEY(processoId)) || []); this.subjects.set(processoId, sub); }
    return sub!.asObservable();
  }

  add(a: Omit<Anexo,'id'|'dataUpload'>){
    const ls = (globalThis as any).localStorage as Storage | undefined;
    const pid = a.processoId || ls?.getItem('import_costs_current_catalog_id') || '';
    const id = typeof (globalThis as any).crypto?.randomUUID === 'function' ? (globalThis as any).crypto.randomUUID() : String(Date.now());
    const novo: Anexo = { ...a, id, processoId: pid, dataUpload: new Date().toISOString() };
    const arr = (readJSON<Anexo[]>(KEY(pid)) || []).slice();
    arr.unshift(novo);
    writeJSON(KEY(pid), arr);
    this.next(pid, arr);
  }

  remove(id: string){
    const ls = (globalThis as any).localStorage as Storage | undefined;
    const pid = ls?.getItem('import_costs_current_catalog_id') || '';
    const arr = (readJSON<Anexo[]>(KEY(pid)) || []).filter(x => x.id !== id);
    writeJSON(KEY(pid), arr);
    this.next(pid, arr);
  }

  private next(pid: string, arr: Anexo[]){
    let sub = this.subjects.get(pid); if(!sub){ sub = new BehaviorSubject<Anexo[]>(arr); this.subjects.set(pid, sub); } else { sub.next(arr); }
  }
}