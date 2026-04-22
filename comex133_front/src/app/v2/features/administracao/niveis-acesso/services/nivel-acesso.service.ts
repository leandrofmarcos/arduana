import { Injectable } from '@angular/core';
import { NivelAcesso } from '../models/nivel-acesso.models';

@Injectable({ providedIn: 'root' })
export class NivelAcessoService {
  private readonly items: NivelAcesso[] = [
    { id: '1', nome: 'Básico', ordem: 1, descricao: 'Acesso somente leitura', ativo: true },
    { id: '2', nome: 'Operacional', ordem: 2, descricao: 'Operações do dia a dia', ativo: true },
    { id: '3', nome: 'Supervisor', ordem: 3, descricao: 'Aprovações e relatórios gerenciais', ativo: true },
    { id: '4', nome: 'Administrador', ordem: 4, descricao: 'Acesso total ao sistema', ativo: true }
  ];

  initSeed(): void {
    // Sem seed persistido localmente.
  }

  getAll(): NivelAcesso[] {
    return [...this.items].sort((a, b) => a.ordem - b.ordem);
  }

  getAtivos(): NivelAcesso[] {
    return this.items.filter(n => n.ativo).sort((a, b) => a.ordem - b.ordem);
  }

  create(data: Omit<NivelAcesso, 'id'>): NivelAcesso {
    const item: NivelAcesso = { id: String(Date.now()), ...data };
    this.items.push(item);
    return item;
  }

  update(item: NivelAcesso): void {
    const idx = this.items.findIndex(n => n.id === item.id);
    if (idx >= 0) this.items[idx] = item;
  }

  remove(id: string): void {
    const idx = this.items.findIndex(n => n.id === id);
    if (idx >= 0) this.items.splice(idx, 1);
  }
}
