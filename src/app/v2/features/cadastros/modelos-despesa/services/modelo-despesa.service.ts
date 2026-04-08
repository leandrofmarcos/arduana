import { Injectable } from '@angular/core';
import { ModeloDespesa, ModeloDespesaItem } from '../models/modelo-despesa.models';
import { readV2, addV2, updateV2, deleteV2, generateV2Id, keysV2 } from '../../../../core/helpers/storage-v2.helper';

@Injectable({ providedIn: 'root' })
export class ModeloDespesaService {

  // ── Modelos ─────────────────────────────────────────────────────────────

  getAll(): ModeloDespesa[] {
    return readV2<ModeloDespesa>(keysV2.modelosDespesa);
  }

  create(data: Omit<ModeloDespesa, 'id'>): ModeloDespesa {
    const item: ModeloDespesa = { id: generateV2Id(), ...data };
    addV2(keysV2.modelosDespesa, item);
    return item;
  }

  update(item: ModeloDespesa): void {
    updateV2(keysV2.modelosDespesa, item);
  }

  remove(id: string): void {
    deleteV2(keysV2.modelosDespesa, id);
    // remove all items linked to this modelo
    const itens = this.getAllItens().filter(i => i.modeloDespesaId !== id);
    localStorage.setItem(keysV2.modelosDespesaItens, JSON.stringify(itens));
  }

  // ── Itens do Modelo ─────────────────────────────────────────────────────

  getAllItens(): ModeloDespesaItem[] {
    return readV2<ModeloDespesaItem>(keysV2.modelosDespesaItens);
  }

  getItensByModelo(modeloId: string): ModeloDespesaItem[] {
    return this.getAllItens().filter(i => i.modeloDespesaId === modeloId);
  }

  addItem(modeloId: string, despesaCadastroId: string): ModeloDespesaItem {
    // avoid duplicates in same modelo
    const existing = this.getAllItens();
    const dup = existing.find(i => i.modeloDespesaId === modeloId && i.despesaCadastroId === despesaCadastroId);
    if (dup) return dup;
    const item: ModeloDespesaItem = { id: generateV2Id(), modeloDespesaId: modeloId, despesaCadastroId };
    addV2(keysV2.modelosDespesaItens, item);
    return item;
  }

  removeItem(itemId: string): void {
    deleteV2(keysV2.modelosDespesaItens, itemId);
  }

  replaceItens(modeloId: string, despesaIds: string[]): void {
    // remove current, write fresh list
    const others = this.getAllItens().filter(i => i.modeloDespesaId !== modeloId);
    const novos: ModeloDespesaItem[] = despesaIds.map(did => ({
      id: generateV2Id(),
      modeloDespesaId: modeloId,
      despesaCadastroId: did,
    }));
    const all = [...others, ...novos];
    localStorage.setItem(keysV2.modelosDespesaItens, JSON.stringify(all));
  }
}
