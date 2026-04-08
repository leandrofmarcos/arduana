import { Injectable } from '@angular/core';
import { readV2, addV2, updateV2, deleteV2, generateV2Id, keysV2 } from '../../../../core/helpers/storage-v2.helper';
import { Ncm } from '../models/ncm.models';

@Injectable({ providedIn: 'root' })
export class NcmService {
  getAll(): Ncm[] {
    return readV2<Ncm>(keysV2.ncms);
  }

  getAtivos(): Ncm[] {
    return this.getAll().filter(n => n.ativo);
  }

  create(data: Omit<Ncm, 'id'>): Ncm {
    const item: Ncm = { id: generateV2Id(), ...data };
    addV2(keysV2.ncms, item);
    return item;
  }

  update(item: Ncm): void {
    updateV2(keysV2.ncms, item);
  }

  remove(id: string): void {
    deleteV2(keysV2.ncms, id);
  }
}
