import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NumerarioRepository } from '../../domain/numerario.repository';
import { NumerarioLancamento, NumerarioStatus } from '../../domain/numerario.models';

function readJSON<T>(key: string): T | null {
  try { const ls = (globalThis as any).localStorage as Storage | undefined; if (!ls) return null; const raw = ls.getItem(key); return raw ? JSON.parse(raw) as T : null; } catch { return null; }
}
function writeJSON(key: string, value: any) {
  try { const ls = (globalThis as any).localStorage as Storage | undefined; if (!ls) return; ls.setItem(key, JSON.stringify(value)); } catch {}
}

const KEY = (pid: string) => `import_costs_numerario_${pid}`;

@Injectable({ providedIn: 'root' })
export class LocalStorageNumerarioRepository implements NumerarioRepository {
  private subjects = new Map<string, BehaviorSubject<NumerarioLancamento[]>>();

  list$(processoId: string){
    let sub = this.subjects.get(processoId);
    if(!sub){ const init = readJSON<NumerarioLancamento[]>(KEY(processoId)) || []; sub = new BehaviorSubject<NumerarioLancamento[]>(init); this.subjects.set(processoId, sub); }
    return sub!.asObservable();
  }

  add(d: Omit<NumerarioLancamento,'id'|'trilha'|'data'|'status'> & { valor: number; moeda: 'BRL'|'USD'|'EUR'; responsavel: string; observacao?: string }){
    const ls = (globalThis as any).localStorage as Storage | undefined;
    const pid = ls?.getItem('import_costs_current_catalog_id') || '';
    if(!pid) return;
    const id = typeof (globalThis as any).crypto?.randomUUID === 'function' ? (globalThis as any).crypto.randomUUID() : String(Date.now());
    const novo: NumerarioLancamento = { id, processoId: pid, valor: d.valor, moeda: d.moeda, responsavel: d.responsavel, observacao: d.observacao, data: new Date().toISOString(), status: 'Solicitado', trilha: [{ evento: 'Solicitado', data: new Date().toISOString() }] };
    const arr = (readJSON<NumerarioLancamento[]>(KEY(pid)) || []).slice();
    arr.unshift(novo);
    writeJSON(KEY(pid), arr);
    this.next(pid, arr);
  }

  updateStatus(id: string, status: NumerarioStatus){
    const ls = (globalThis as any).localStorage as Storage | undefined;
    const pid = ls?.getItem('import_costs_current_catalog_id') || '';
    if(!pid) return;
    const arr = (readJSON<NumerarioLancamento[]>(KEY(pid)) || []).slice();
    const idx = arr.findIndex(x => x.id === id);
    if(idx < 0) return;
    const item = { ...arr[idx] } as NumerarioLancamento;
    item.status = status;
    item.trilha = [...item.trilha, { evento: status, data: new Date().toISOString() }];
    arr[idx] = item;
    writeJSON(KEY(pid), arr);
    this.next(pid, arr);
  }

  remove(id: string){
    const ls = (globalThis as any).localStorage as Storage | undefined;
    const pid = ls?.getItem('import_costs_current_catalog_id') || '';
    if(!pid) return;
    const arr = (readJSON<NumerarioLancamento[]>(KEY(pid)) || []).filter(x => x.id !== id);
    writeJSON(KEY(pid), arr);
    this.next(pid, arr);
  }

  private next(pid: string, arr: NumerarioLancamento[]){
    let sub = this.subjects.get(pid); if(!sub){ sub = new BehaviorSubject<NumerarioLancamento[]>(arr); this.subjects.set(pid, sub); } else { sub.next(arr); }
  }
}