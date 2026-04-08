import { Injectable } from '@angular/core';
import { readV2, addV2, updateV2, deleteV2, generateV2Id, keysV2 } from '../../../../core/helpers/storage-v2.helper';
import { ListaPrecoLcl } from '../models/lista-preco-lcl.models';

@Injectable({ providedIn: 'root' })
export class ListaPrecoLclService {
  getAll(): ListaPrecoLcl[] {
    return readV2<ListaPrecoLcl>(keysV2.listaPrecoLcl);
  }

  getAtivos(): ListaPrecoLcl[] {
    return this.getAll().filter(l => l.ativo);
  }

  create(data: Omit<ListaPrecoLcl, 'id'>): ListaPrecoLcl {
    const item: ListaPrecoLcl = { id: generateV2Id(), ...data };
    addV2(keysV2.listaPrecoLcl, item);
    return item;
  }

  update(item: ListaPrecoLcl): void {
    updateV2(keysV2.listaPrecoLcl, item);
  }

  remove(id: string): void {
    deleteV2(keysV2.listaPrecoLcl, id);
  }
}
