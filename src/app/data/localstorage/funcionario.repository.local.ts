import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FuncionarioRepository } from '../../domain/funcionario.repository';
import { Funcionario } from '../../domain/funcionario.models';

const FUNC_KEY = 'import_costs_funcionarios';

function read(): Funcionario[] {
  try { 
    const ls = (globalThis as any).localStorage as Storage | undefined; 
    if(!ls) return []; 
    const raw = ls.getItem(FUNC_KEY); 
    return raw ? JSON.parse(raw) as Funcionario[] : []; 
  } catch { 
    return []; 
  }
}

function write(list: Funcionario[]) {
  try { 
    const ls = (globalThis as any).localStorage as Storage | undefined; 
    if(!ls) return; 
    ls.setItem(FUNC_KEY, JSON.stringify(list)); 
  } catch {}
}

@Injectable({ providedIn: 'root' })
export class LocalStorageFuncionarioRepository implements FuncionarioRepository {
  private subject = new BehaviorSubject<Funcionario[]>([]);

  constructor(){
    const existing = read();
    this.subject.next(existing);
  }

  list$(){ 
    return this.subject.asObservable(); 
  }
  
  create(data: Omit<Funcionario,'id'>): string {
    const id = typeof (globalThis as any).crypto?.randomUUID === 'function' 
      ? (globalThis as any).crypto.randomUUID() 
      : String(Date.now());
    const list = this.subject.value.slice();
    list.unshift({ id, ...data });
    this.subject.next(list);
    write(list);
    return id;
  }
  
  update(id: string, data: Partial<Omit<Funcionario,'id'>>): void {
    const list = this.subject.value.map(f => f.id === id ? { ...f, ...data } : f);
    this.subject.next(list);
    write(list);
  }
  
  remove(id: string): void {
    const list = this.subject.value.filter(f => f.id !== id);
    this.subject.next(list);
    write(list);
  }
}
