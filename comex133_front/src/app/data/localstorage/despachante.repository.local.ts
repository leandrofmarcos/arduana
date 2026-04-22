import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DespachanteRepository } from '../../domain/despachante.repository';
import { Despachante } from '../../domain/despachante.models';
import { DespachantesTemplateService } from '../../core/templates/despachantes.template.service';

const DESP_KEY = 'import_costs_despachantes';

function read(): Despachante[] {
  try { const ls = (globalThis as any).localStorage as Storage | undefined; if(!ls) return []; const raw = ls.getItem(DESP_KEY); return raw ? JSON.parse(raw) as Despachante[] : []; } catch { return []; }
}
function write(list: Despachante[]) {
  try { const ls = (globalThis as any).localStorage as Storage | undefined; if(!ls) return; ls.setItem(DESP_KEY, JSON.stringify(list)); } catch {}
}

@Injectable({ providedIn: 'root' })
export class LocalStorageDespachanteRepository implements DespachanteRepository {
  private subject = new BehaviorSubject<Despachante[]>([]);

  constructor(private templates: DespachantesTemplateService){
    const existing = read();
    if(existing.length){ this.subject.next(existing); }
    else { const seed = this.templates.defaultDespachantes(); this.subject.next(seed); write(seed); }
  }

  list$(){ return this.subject.asObservable(); }
  create(data: Omit<Despachante,'id'>): string {
    const id = typeof (globalThis as any).crypto?.randomUUID === 'function' ? (globalThis as any).crypto.randomUUID() : String(Date.now());
    const list = this.subject.value.slice();
    list.unshift({ id, ...data });
    this.subject.next(list);
    write(list);
    return id;
  }
  update(id: string, data: Partial<Omit<Despachante,'id'>>): void {
    const list = this.subject.value.map(c => c.id === id ? { ...c, ...data } : c);
    this.subject.next(list);
    write(list);
  }
  remove(id: string): void {
    const list = this.subject.value.filter(c => c.id !== id);
    this.subject.next(list);
    write(list);
  }
}