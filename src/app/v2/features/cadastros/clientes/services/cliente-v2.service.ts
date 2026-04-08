import { Injectable } from '@angular/core';
import { ClienteV2 } from '../models/cliente-v2.models';
import { readV2, addV2, updateV2, deleteV2, generateV2Id, keysV2 } from '../../../../core/helpers/storage-v2.helper';

@Injectable({ providedIn: 'root' })
export class ClienteV2Service {
  getAll(): ClienteV2[] {
    return readV2<ClienteV2>(keysV2.clientes);
  }

  getAtivos(): ClienteV2[] {
    return this.getAll().filter(c => c.ativo);
  }

  create(data: Omit<ClienteV2, 'id'>): ClienteV2 {
    const item: ClienteV2 = { id: generateV2Id(), ...data };
    addV2(keysV2.clientes, item);
    return item;
  }

  update(item: ClienteV2): void {
    updateV2(keysV2.clientes, item);
  }

  remove(id: string): void {
    deleteV2(keysV2.clientes, id);
  }
}
