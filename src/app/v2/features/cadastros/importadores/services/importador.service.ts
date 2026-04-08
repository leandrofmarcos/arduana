import { Injectable } from '@angular/core';
import { Importador } from '../models/importador.models';
import { readV2, addV2, updateV2, deleteV2, generateV2Id, keysV2 } from '../../../../core/helpers/storage-v2.helper';

@Injectable({ providedIn: 'root' })
export class ImportadorService {
  getAll(): Importador[] {
    return readV2<Importador>(keysV2.importadores);
  }

  getAtivos(): Importador[] {
    return this.getAll().filter(i => i.ativo);
  }

  create(data: Omit<Importador, 'id'>): Importador {
    const item: Importador = { id: generateV2Id(), ...data };
    addV2(keysV2.importadores, item);
    return item;
  }

  update(item: Importador): void {
    updateV2(keysV2.importadores, item);
  }

  remove(id: string): void {
    deleteV2(keysV2.importadores, id);
  }
}
