import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { readJSON, writeJSON, randomId, keys } from '../data/storage.helper';
import { OrcamentoMeta, Fase } from '../models/orcamento.models';

@Injectable({ providedIn: 'root' })
export class OrcamentoStore {
  private subject = new BehaviorSubject<OrcamentoMeta | null>(null);
  readonly state$ = this.subject.asObservable();

  load(id?: string){
    const pid = id || (globalThis as any).localStorage?.getItem(keys.currentId());
    if(!pid){ this.subject.next(null); return; }
    const meta = readJSON<OrcamentoMeta>(keys.orcamento(pid));
    this.subject.next(meta || null);
  }

  novo(titulo?: string){
    const id = randomId();
    const meta: OrcamentoMeta = { id, title: titulo || 'Novo Orçamento', faseAtual: 'Orcamento', createdAt: new Date().toISOString(), aprovado: false, oficializado: false, numerarioPago: false, fechado: false };
    writeJSON(keys.orcamento(id), meta);
    (globalThis as any).localStorage?.setItem(keys.currentId(), id);
    this.subject.next(meta);
    this.snapshot(meta);
    return id;
  }

  setFase(fase: Fase){
    const meta = this.subject.value; if(!meta) return;
    const next = { ...meta, faseAtual: fase };
    writeJSON(keys.orcamento(meta.id), next);
    this.subject.next(next);
    this.snapshot(next);
  }

  aprovar(){ const m = this.subject.value; if(!m) return; const next = { ...m, aprovado: true, faseAtual: 'Aduana' as Fase }; writeJSON(keys.orcamento(m.id), next); this.subject.next(next); this.snapshot(next); }
  oficializar(){ const m = this.subject.value; if(!m) return; const next = { ...m, oficializado: true, faseAtual: 'Numerario' as Fase }; writeJSON(keys.orcamento(m.id), next); this.subject.next(next); this.snapshot(next); }
  fechar(){ const m = this.subject.value; if(!m) return; const next = { ...m, fechado: true, faseAtual: 'Fechamento' as Fase }; writeJSON(keys.orcamento(m.id), next); this.subject.next(next); this.snapshot(next); }

  private snapshot(meta: OrcamentoMeta){
    const arr = readJSON<any[]>(keys.versions(meta.id)) || [];
    arr.push({ ...meta, snapshotAt: new Date().toISOString() });
    writeJSON(keys.versions(meta.id), arr);
  }
}
