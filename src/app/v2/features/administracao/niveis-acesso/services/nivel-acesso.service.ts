import { Injectable } from '@angular/core';
import { readV2, addV2, updateV2, deleteV2, generateV2Id, keysV2 } from '../../../../core/helpers/storage-v2.helper';
import { NivelAcesso } from '../models/nivel-acesso.models';

const NIVEIS_SEED: Omit<NivelAcesso, 'id'>[] = [
  { nome: 'Básico',          ordem: 1, descricao: 'Acesso somente leitura',             ativo: true },
  { nome: 'Operacional',     ordem: 2, descricao: 'Operações do dia a dia',             ativo: true },
  { nome: 'Supervisor',      ordem: 3, descricao: 'Aprovações e relatórios gerenciais', ativo: true },
  { nome: 'Administrador',   ordem: 4, descricao: 'Acesso total ao sistema',            ativo: true },
];

@Injectable({ providedIn: 'root' })
export class NivelAcessoService {

  /** Inicializa seed somente se não houver nenhum nível cadastrado. */
  initSeed(): void {
    if (readV2<NivelAcesso>(keysV2.niveisAcesso).length === 0) {
      NIVEIS_SEED.forEach(n => this.create(n));
    }
  }

  getAll(): NivelAcesso[] {
    return readV2<NivelAcesso>(keysV2.niveisAcesso)
      .sort((a, b) => a.ordem - b.ordem);
  }

  getAtivos(): NivelAcesso[] {
    return this.getAll().filter(n => n.ativo);
  }

  create(data: Omit<NivelAcesso, 'id'>): NivelAcesso {
    const item: NivelAcesso = { id: generateV2Id(), ...data };
    addV2(keysV2.niveisAcesso, item);
    return item;
  }

  update(item: NivelAcesso): void {
    updateV2(keysV2.niveisAcesso, item);
  }

  remove(id: string): void {
    deleteV2(keysV2.niveisAcesso, id);
  }
}
