import { Injectable } from '@angular/core';
import { readV2, addV2, updateV2, deleteV2, generateV2Id, keysV2 } from '../../../../core/helpers/storage-v2.helper';
import { ControleNavio, ControleNavioTrajeto } from '../models/controle-navio.models';

@Injectable({ providedIn: 'root' })
export class ControleNavioService {

  // ── Navios ──────────────────────────────────────────────────────────────

  getAll(): ControleNavio[] {
    return readV2<ControleNavio>(keysV2.controleNavios);
  }

  getAtivos(): ControleNavio[] {
    return this.getAll().filter(n => n.ativo);
  }

  create(data: Omit<ControleNavio, 'id'>): ControleNavio {
    const item: ControleNavio = { id: generateV2Id(), ...data };
    addV2(keysV2.controleNavios, item);
    return item;
  }

  update(item: ControleNavio): void {
    updateV2(keysV2.controleNavios, item);
  }

  remove(id: string): void {
    deleteV2(keysV2.controleNavios, id);
    // remove trajetos vinculados
    const trajetos = this.getTrajetos(id);
    trajetos.forEach(t => this.removeTrajeto(t.id));
  }

  // ── Trajetos ─────────────────────────────────────────────────────────────

  getAllTrajetos(): ControleNavioTrajeto[] {
    return readV2<ControleNavioTrajeto>(keysV2.navioTrajetos);
  }

  getTrajetos(controleNavioId: string): ControleNavioTrajeto[] {
    return this.getAllTrajetos().filter(t => t.controleNavioId === controleNavioId);
  }

  addTrajeto(data: Omit<ControleNavioTrajeto, 'id'>): ControleNavioTrajeto {
    const item: ControleNavioTrajeto = { id: generateV2Id(), ...data };
    addV2(keysV2.navioTrajetos, item);
    return item;
  }

  removeTrajeto(id: string): void {
    deleteV2(keysV2.navioTrajetos, id);
  }

  /** Substitui todos os trajetos de um navio de uma vez (save completo). */
  replaceTrajetos(controleNavioId: string, trajetos: Omit<ControleNavioTrajeto, 'id'>[]): ControleNavioTrajeto[] {
    // remove antigos
    this.getTrajetos(controleNavioId).forEach(t => this.removeTrajeto(t.id));
    // cria novos
    return trajetos.map(t => this.addTrajeto({ ...t, controleNavioId }));
  }
}
