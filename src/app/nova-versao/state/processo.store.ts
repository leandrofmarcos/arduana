import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { readJSON, writeJSON, randomId, keys } from '../data/storage.helper';

export type Fase = 'Orcamento' | 'Aduana' | 'Numerario' | 'Fechamento';
export interface ProcessoMeta {
  id: string;
  title?: string;
  faseAtual: Fase;
  aprovado?: boolean;
  aprovadoCliente?: boolean;
  oficializado?: boolean;
  numerarioPago?: boolean;
  fechado?: boolean;
  createdAt: string;
  clienteId?: string;
  despachanteId?: string;
}

@Injectable({ providedIn: 'root' })
export class ProcessoStore {
  private subject = new BehaviorSubject<ProcessoMeta | null>(null);
  readonly state$ = this.subject.asObservable();

  load(id?: string){
    const pid = id || (globalThis as any).localStorage?.getItem(keys.currentId());
    if(!pid){ this.subject.next(null); return; }
    const meta = readJSON<ProcessoMeta>(keys.processo(pid));
    this.subject.next(meta || null);
  }

  novo(titulo?: string){
    const id = randomId();
    const meta: ProcessoMeta = { id, title: titulo || 'Novo Processo', faseAtual: 'Orcamento', createdAt: new Date().toISOString(), aprovado: false, oficializado: false, numerarioPago: false, fechado: false };
    writeJSON(keys.processo(id), meta);
    (globalThis as any).localStorage?.setItem(keys.currentId(), id);
    this.subject.next(meta);
    this.snapshot(meta);
    return id;
  }

  setFase(fase: Fase){
    const meta = this.subject.value; if(!meta) return;
    const next = { ...meta, faseAtual: fase };
    writeJSON(keys.processo(meta.id), next);
    this.subject.next(next);
    this.snapshot(next);
  }

  aprovar(){ const m = this.subject.value; if(!m) return; const next = { ...m, aprovado: true, faseAtual: 'Aduana' as Fase }; writeJSON(keys.processo(m.id), next); this.subject.next(next); this.snapshot(next); }
  oficializar(){ const m = this.subject.value; if(!m) return; const next = { ...m, oficializado: true, faseAtual: 'Numerario' as Fase }; writeJSON(keys.processo(m.id), next); this.subject.next(next); this.snapshot(next); }
  fechar(){ const m = this.subject.value; if(!m) return; const next = { ...m, fechado: true, faseAtual: 'Fechamento' as Fase }; writeJSON(keys.processo(m.id), next); this.subject.next(next); this.snapshot(next); }

  private snapshot(meta: ProcessoMeta){
    const arr = readJSON<any[]>(keys.versions(meta.id)) || [];
    arr.push({ ...meta, snapshotAt: new Date().toISOString() });
    writeJSON(keys.versions(meta.id), arr);
  }
}