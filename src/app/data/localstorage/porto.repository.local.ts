import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Porto } from '../../domain/porto.models';
import { PortoRepository } from '../../domain/porto.repository';

const PORTS_KEY = 'import_costs_ports';

function readPorts(): Porto[] {
  try { const ls = (globalThis as any).localStorage as Storage | undefined; if(!ls) return []; const raw = ls.getItem(PORTS_KEY); return raw ? JSON.parse(raw) as Porto[] : []; } catch { return []; }
}
function writePorts(list: Porto[]) {
  try { const ls = (globalThis as any).localStorage as Storage | undefined; if(!ls) return; ls.setItem(PORTS_KEY, JSON.stringify(list)); } catch {}
}

@Injectable({ providedIn: 'root' })
export class LocalStoragePortoRepository implements PortoRepository {
  private subject = new BehaviorSubject<Porto[]>([]);

  constructor(){
    const existing = readPorts();
    if(existing.length){ this.subject.next(existing); }
    else {
      const seed: Porto[] = [
        { id: 'p1', nome: 'Porto de Santos' },
        { id: 'p2', nome: 'Porto de Itapoá' },
        { id: 'p3', nome: 'Shanghai Port' }
      ];
      this.subject.next(seed);
      writePorts(seed);
    }
  }

  list$(){ return this.subject.asObservable(); }
  create(data: Omit<Porto,'id'>): string {
    const id = typeof (globalThis as any).crypto?.randomUUID === 'function' ? (globalThis as any).crypto.randomUUID() : String(Date.now());
    const list = this.subject.value.slice();
    list.unshift({ id, ...data });
    this.subject.next(list);
    writePorts(list);
    return id;
  }
  update(id: string, data: Partial<Omit<Porto,'id'>>): void {
    const list = this.subject.value.map(p => p.id === id ? { ...p, ...data } : p);
    this.subject.next(list);
    writePorts(list);
  }
  remove(id: string): void {
    const list = this.subject.value.filter(p => p.id !== id);
    this.subject.next(list);
    writePorts(list);
  }
}