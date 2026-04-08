import { Injectable } from '@angular/core';
import { PortoOrigem } from '../models/porto-origem.models';
import { readV2, addV2, updateV2, deleteV2, generateV2Id, keysV2 } from '../../../../core/helpers/storage-v2.helper';

@Injectable({ providedIn: 'root' })
export class PortoOrigemService {
  getAll(): PortoOrigem[] {
    return readV2<PortoOrigem>(keysV2.portosOrigem);
  }

  getAtivos(): PortoOrigem[] {
    return this.getAll().filter(p => p.ativo);
  }

  create(data: Omit<PortoOrigem, 'id'>): PortoOrigem {
    const item: PortoOrigem = { id: generateV2Id(), ...data };
    addV2(keysV2.portosOrigem, item);
    return item;
  }

  update(item: PortoOrigem): void {
    updateV2(keysV2.portosOrigem, item);
  }

  remove(id: string): void {
    deleteV2(keysV2.portosOrigem, id);
  }
}
