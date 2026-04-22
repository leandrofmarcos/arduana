import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AliquotaPerfil } from '../../domain/aliquota.models';
import { AliquotaRepository } from '../../domain/aliquota.repository';

const ALIQUOTAS_KEY = 'import_costs_tax_profiles';

function read(): AliquotaPerfil[] {
  try { const ls = (globalThis as any).localStorage as Storage | undefined; if(!ls) return []; const raw = ls.getItem(ALIQUOTAS_KEY); return raw ? JSON.parse(raw) as AliquotaPerfil[] : []; } catch { return []; }
}
function write(list: AliquotaPerfil[]) {
  try { const ls = (globalThis as any).localStorage as Storage | undefined; if(!ls) return; ls.setItem(ALIQUOTAS_KEY, JSON.stringify(list)); } catch {}
}

@Injectable({ providedIn: 'root' })
export class LocalStorageAliquotaRepository implements AliquotaRepository {
  private subject = new BehaviorSubject<AliquotaPerfil[]>([]);

  constructor(){
    const existing = read();
    if(existing.length){ this.subject.next(existing); }
    else {
      const seed: AliquotaPerfil[] = [
        { id: 'a1', nome: 'Padrão Nacional', descricao: 'Perfil base de importação', ii: 14.4, ipi: 7.43, icms: 4, pis: 2.1, cofins: 10.65, padrao: true },
        { id: 'a2', nome: 'Benefício Fiscal 4%', descricao: 'Operações com benefício ICMS', ii: 14.4, ipi: 7.43, icms: 4, pis: 2.1, cofins: 9.65, padrao: false }
      ];
      this.subject.next(seed);
      write(seed);
    }
  }

  list$(){ return this.subject.asObservable(); }
  create(data: Omit<AliquotaPerfil,'id'|'padrao'> & { padrao?: boolean }): string {
    const id = typeof (globalThis as any).crypto?.randomUUID === 'function' ? (globalThis as any).crypto.randomUUID() : String(Date.now());
    const list = this.subject.value.slice();
    const novo: AliquotaPerfil = { id, padrao: !!data.padrao, ...data } as AliquotaPerfil;
    if(novo.padrao){ for(const i of list){ i.padrao = false; } }
    list.unshift(novo);
    this.subject.next(list);
    write(list);
    return id;
  }
  update(id: string, data: Partial<Omit<AliquotaPerfil,'id'>>): void {
    const list = this.subject.value.slice();
    const idx = list.findIndex(x => x.id === id);
    if(idx >= 0){
      const merged = { ...list[idx], ...data };
      if(merged.padrao){ for(const i of list){ i.padrao = false; } }
      list[idx] = merged;
      this.subject.next(list);
      write(list);
    }
  }
  remove(id: string): void {
    const list = this.subject.value.filter(x => x.id !== id);
    this.subject.next(list);
    write(list);
  }
  setPadrao(id: string): void {
    const list = this.subject.value.map(x => ({ ...x, padrao: x.id === id }));
    this.subject.next(list);
    write(list);
  }
}