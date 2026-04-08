import { Injectable } from '@angular/core';
import { PortoDestino } from '../models/porto-destino.models';
import { readV2, addV2, updateV2, deleteV2, generateV2Id, keysV2 } from '../../../../core/helpers/storage-v2.helper';

@Injectable({ providedIn: 'root' })
export class PortoDestinoService {
  getAll(): PortoDestino[] {
    return readV2<PortoDestino>(keysV2.portosDestino);
  }

  getAtivos(): PortoDestino[] {
    return this.getAll().filter(p => p.ativo);
  }

  create(data: Omit<PortoDestino, 'id'>): PortoDestino {
    const item: PortoDestino = { id: generateV2Id(), ...data };
    addV2(keysV2.portosDestino, item);
    return item;
  }

  update(item: PortoDestino): void {
    updateV2(keysV2.portosDestino, item);
  }

  remove(id: string): void {
    deleteV2(keysV2.portosDestino, id);
  }
}
