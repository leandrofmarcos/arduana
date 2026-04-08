import { Injectable } from '@angular/core';
import { readV2, addV2, updateV2, deleteV2, generateV2Id, keysV2 } from '../../../../core/helpers/storage-v2.helper';
import { Fabricante } from '../models/fabricante.models';

@Injectable({ providedIn: 'root' })
export class FabricanteService {
  getAll(): Fabricante[] {
    return readV2<Fabricante>(keysV2.fabricantes);
  }

  getAtivos(): Fabricante[] {
    return this.getAll().filter(f => f.ativo);
  }

  create(data: Omit<Fabricante, 'id'>): Fabricante {
    const item: Fabricante = { id: generateV2Id(), ...data };
    addV2(keysV2.fabricantes, item);
    return item;
  }

  update(item: Fabricante): void {
    updateV2(keysV2.fabricantes, item);
  }

  remove(id: string): void {
    deleteV2(keysV2.fabricantes, id);
  }
}
