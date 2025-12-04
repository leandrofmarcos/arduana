import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Cliente } from '../../domain/cliente.models';
import { ClienteRepository } from '../../domain/cliente.repository';
import { ClientesTemplateService } from '../../core/templates/clientes.template.service';

const CLIENTS_KEY = 'import_costs_clients';

function readClients(): Cliente[] {
  try { const ls = (globalThis as any).localStorage as Storage | undefined; if(!ls) return []; const raw = ls.getItem(CLIENTS_KEY); return raw ? JSON.parse(raw) as Cliente[] : []; } catch { return []; }
}
function writeClients(list: Cliente[]) {
  try { const ls = (globalThis as any).localStorage as Storage | undefined; if(!ls) return; ls.setItem(CLIENTS_KEY, JSON.stringify(list)); } catch {}
}

@Injectable({ providedIn: 'root' })
export class LocalStorageClienteRepository implements ClienteRepository {
  private subject = new BehaviorSubject<Cliente[]>([]);

  constructor(private templates: ClientesTemplateService){
    const existing = readClients();
    if(existing.length){ this.subject.next(existing); }
    else { const seed = this.templates.defaultClientes(); this.subject.next(seed); writeClients(seed); }
  }

  list$(){ return this.subject.asObservable(); }
  create(data: Omit<Cliente,'id'>): string {
    const id = typeof (globalThis as any).crypto?.randomUUID === 'function' ? (globalThis as any).crypto.randomUUID() : String(Date.now());
    const list = this.subject.value.slice();
    list.unshift({ id, ...data });
    this.subject.next(list);
    writeClients(list);
    return id;
  }
  update(id: string, data: Partial<Omit<Cliente,'id'>>): void {
    const list = this.subject.value.map(c => c.id === id ? { ...c, ...data } : c);
    this.subject.next(list);
    writeClients(list);
  }
  remove(id: string): void {
    const list = this.subject.value.filter(c => c.id !== id);
    this.subject.next(list);
    writeClients(list);
  }
}