import { Injectable } from '@angular/core';
import { DespachanteV2 } from '../models/despachante-v2.models';
import { readV2, addV2, updateV2, deleteV2, generateV2Id, keysV2 } from '../../../../core/helpers/storage-v2.helper';

@Injectable({ providedIn: 'root' })
export class DespachanteV2Service {
  getAll(): DespachanteV2[] {
    return readV2<DespachanteV2>(keysV2.despachantes);
  }

  getAtivos(): DespachanteV2[] {
    return this.getAll().filter(d => d.ativo);
  }

  create(data: Omit<DespachanteV2, 'id'>): DespachanteV2 {
    const item: DespachanteV2 = { id: generateV2Id(), ...data };
    addV2(keysV2.despachantes, item);
    return item;
  }

  update(item: DespachanteV2): void {
    updateV2(keysV2.despachantes, item);
  }

  remove(id: string): void {
    deleteV2(keysV2.despachantes, id);
  }
}
