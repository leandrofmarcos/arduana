import { Injectable } from '@angular/core';
import { Cargo } from '../models/cargo.models';

@Injectable({ providedIn: 'root' })
export class CargoService {
  private readonly items: Cargo[] = [
    { id: '1', nome: 'Despachante', descricao: 'Operador de despacho aduaneiro', ativo: true },
    { id: '2', nome: 'Analista', descricao: 'Analista operacional', ativo: true },
    { id: '3', nome: 'Gerente', descricao: 'Gestão de operações', ativo: true },
    { id: '4', nome: 'Administrador', descricao: 'Admin do sistema', ativo: true }
  ];

  initSeed(): void {
    // Sem seed persistido localmente.
  }

  getAll(): Cargo[] {
    return this.items;
  }

  getAtivos(): Cargo[] {
    return this.items.filter(c => c.ativo);
  }

  create(data: Omit<Cargo, 'id'>): Cargo {
    const item: Cargo = { id: String(Date.now()), ...data };
    this.items.push(item);
    return item;
  }

  update(item: Cargo): void {
    const idx = this.items.findIndex(c => c.id === item.id);
    if (idx >= 0) this.items[idx] = item;
  }

  remove(id: string): void {
    const idx = this.items.findIndex(c => c.id === id);
    if (idx >= 0) this.items.splice(idx, 1);
  }
}
