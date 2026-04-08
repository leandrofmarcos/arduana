import { Injectable } from '@angular/core';
import { readV2, addV2, updateV2, deleteV2, generateV2Id, keysV2 } from '../../../../core/helpers/storage-v2.helper';
import { Exportador } from '../models/exportador.models';

@Injectable({ providedIn: 'root' })
export class ExportadorService {
  getAll(): Exportador[] {
    return readV2<Exportador>(keysV2.exportadores);
  }

  getAtivos(): Exportador[] {
    return this.getAll().filter(e => e.ativo);
  }

  create(data: Omit<Exportador, 'id'>): Exportador {
    const item: Exportador = { id: generateV2Id(), ...data };
    addV2(keysV2.exportadores, item);
    return item;
  }

  update(item: Exportador): void {
    updateV2(keysV2.exportadores, item);
  }

  remove(id: string): void {
    deleteV2(keysV2.exportadores, id);
  }
}
