import { Injectable } from '@angular/core';
import { readV2, addV2, updateV2, deleteV2, generateV2Id, keysV2 } from '../../../../core/helpers/storage-v2.helper';
import { Cargo } from '../models/cargo.models';

const CARGOS_SEED: Omit<Cargo, 'id'>[] = [
  { nome: 'Despachante',    descricao: 'Operador de despacho aduaneiro', ativo: true },
  { nome: 'Analista',       descricao: 'Analista operacional',           ativo: true },
  { nome: 'Gerente',        descricao: 'Gestão de operações',            ativo: true },
  { nome: 'Administrador',  descricao: 'Admin do sistema',               ativo: true },
];

@Injectable({ providedIn: 'root' })
export class CargoService {

  /** Inicializa seed somente se não houver nenhum cargo cadastrado. */
  initSeed(): void {
    if (readV2<Cargo>(keysV2.cargos).length === 0) {
      CARGOS_SEED.forEach(c => this.create(c));
    }
  }

  getAll(): Cargo[] {
    return readV2<Cargo>(keysV2.cargos);
  }

  getAtivos(): Cargo[] {
    return this.getAll().filter(c => c.ativo);
  }

  create(data: Omit<Cargo, 'id'>): Cargo {
    const item: Cargo = { id: generateV2Id(), ...data };
    addV2(keysV2.cargos, item);
    return item;
  }

  update(item: Cargo): void {
    updateV2(keysV2.cargos, item);
  }

  remove(id: string): void {
    deleteV2(keysV2.cargos, id);
  }
}
