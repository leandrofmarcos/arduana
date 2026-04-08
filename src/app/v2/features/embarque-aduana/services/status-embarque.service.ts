import { Injectable } from '@angular/core';
import { keysV2, readV2, addV2, generateV2Id } from '../../../core/helpers/storage-v2.helper';
import { StatusEmbarque, StatusEmbarqueNome } from '../models/embarque-aduana.models';

const STATUS_SEED: Array<{ nome: StatusEmbarqueNome; codigo: string; ordem: number }> = [
  { nome: 'Previsto',       codigo: 'PREV', ordem: 1 },
  { nome: 'Aguardando',     codigo: 'AGRD', ordem: 2 },
  { nome: 'Atracado',       codigo: 'ATRC', ordem: 3 },
  { nome: 'Registrado',     codigo: 'RGTD', ordem: 4 },
  { nome: 'Desembaraçado',  codigo: 'DSMB', ordem: 5 },
  { nome: 'Entregue',       codigo: 'ENTG', ordem: 6 },
  { nome: 'Finalizado',     codigo: 'FNLZ', ordem: 7 },
];

@Injectable({ providedIn: 'root' })
export class StatusEmbarqueService {

  initSeed(): void {
    const existing = readV2<StatusEmbarque>(keysV2.statusEmbarque);
    if (existing.length > 0) return;
    STATUS_SEED.forEach(s =>
      addV2<StatusEmbarque>(keysV2.statusEmbarque, {
        id: generateV2Id(), nome: s.nome, codigo: s.codigo, ordem: s.ordem, ativo: true
      })
    );
  }

  getAll(): StatusEmbarque[] {
    return readV2<StatusEmbarque>(keysV2.statusEmbarque).sort((a, b) => a.ordem - b.ordem);
  }

  getById(id: string): StatusEmbarque | undefined {
    return this.getAll().find(s => s.id === id);
  }

  getPrevisto(): StatusEmbarque | undefined {
    return this.getAll().find(s => s.codigo === 'PREV');
  }
}
