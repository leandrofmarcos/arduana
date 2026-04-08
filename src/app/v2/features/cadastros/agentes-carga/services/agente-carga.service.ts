import { Injectable } from '@angular/core';
import { readV2, addV2, updateV2, deleteV2, generateV2Id, keysV2 } from '../../../../core/helpers/storage-v2.helper';
import { AgenteCarga } from '../models/agente-carga.models';

@Injectable({ providedIn: 'root' })
export class AgenteCargaService {
  getAll(): AgenteCarga[] {
    return readV2<AgenteCarga>(keysV2.agentesCarga);
  }

  getAtivos(): AgenteCarga[] {
    return this.getAll().filter(a => a.ativo);
  }

  create(data: Omit<AgenteCarga, 'id'>): AgenteCarga {
    const item: AgenteCarga = { id: generateV2Id(), ...data };
    addV2(keysV2.agentesCarga, item);
    return item;
  }

  update(item: AgenteCarga): void {
    updateV2(keysV2.agentesCarga, item);
  }

  remove(id: string): void {
    deleteV2(keysV2.agentesCarga, id);
  }
}
