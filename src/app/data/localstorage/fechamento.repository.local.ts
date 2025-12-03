import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FechamentoRepository, FechamentoData } from '../../domain/fechamento.repository';

function readJSON<T>(key: string): T | null {
  try { const ls = (globalThis as any).localStorage as Storage | undefined; if (!ls) return null; const raw = ls.getItem(key); return raw ? JSON.parse(raw) as T : null; } catch { return null; }
}
function writeJSON(key: string, value: any) {
  try { const ls = (globalThis as any).localStorage as Storage | undefined; if (!ls) return; ls.setItem(key, JSON.stringify(value)); } catch {}
}

const KEY = (pid: string) => `import_costs_fechamento_${pid}`;

@Injectable({ providedIn: 'root' })
export class LocalStorageFechamentoRepository implements FechamentoRepository {
  private subjects = new Map<string, BehaviorSubject<FechamentoData | null>>();

  get$(processoId: string): Observable<FechamentoData | null> {
    let sub = this.subjects.get(processoId);
    if(!sub){ sub = new BehaviorSubject<FechamentoData | null>(readJSON<FechamentoData>(KEY(processoId)) || null); this.subjects.set(processoId, sub); }
    return sub!.asObservable();
  }

  save(data: FechamentoData): void {
    const pid = data.processoId;
    writeJSON(KEY(pid), data);
    this.next(pid, data);
  }

  private next(pid: string, data: FechamentoData | null){
    let sub = this.subjects.get(pid); if(!sub){ sub = new BehaviorSubject<FechamentoData | null>(data); this.subjects.set(pid, sub); } else { sub.next(data); }
  }
}