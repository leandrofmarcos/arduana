import { Injectable } from '@angular/core';
import {
  keysV2, readV2, addV2, updateV2, deleteV2, generateV2Id, generateCode
} from '../../../core/helpers/storage-v2.helper';
import {
  OrcamentoVenda, OrcamentoVendaDespesa, OrcamentoVendaDespesaExtra
} from '../models/orcamento-venda.models';

@Injectable({ providedIn: 'root' })
export class OrcamentoVendaService {

  // ── OrcamentoVenda ────────────────────────────────────────────────────

  getAll(): OrcamentoVenda[] {
    return readV2<OrcamentoVenda>(keysV2.orcamentosVenda);
  }

  getById(id: string): OrcamentoVenda | undefined {
    return this.getAll().find(o => o.id === id);
  }

  gerarCodigoInterno(): string {
    return generateCode('OV', this.getAll().length);
  }

  create(data: Omit<OrcamentoVenda, 'id' | 'codigoInterno'>): OrcamentoVenda {
    const item: OrcamentoVenda = {
      id: generateV2Id(),
      codigoInterno: this.gerarCodigoInterno(),
      ...data
    };
    addV2(keysV2.orcamentosVenda, item);
    return item;
  }

  update(item: OrcamentoVenda): void {
    updateV2(keysV2.orcamentosVenda, item);
  }

  remove(id: string): void {
    deleteV2(keysV2.orcamentosVenda, id);
    this.getDespesas(id).forEach(d => deleteV2(keysV2.orcDespesas, d.id));
    this.getExtras(id).forEach(e => deleteV2(keysV2.orcExtras, e.id));
  }

  // ── Despesas ──────────────────────────────────────────────────────────

  getAllDespesas(): OrcamentoVendaDespesa[] {
    return readV2<OrcamentoVendaDespesa>(keysV2.orcDespesas);
  }

  getDespesas(orcamentoVendaId: string): OrcamentoVendaDespesa[] {
    return this.getAllDespesas().filter(d => d.orcamentoVendaId === orcamentoVendaId);
  }

  replaceDespesas(orcamentoVendaId: string, lista: Omit<OrcamentoVendaDespesa, 'id' | 'orcamentoVendaId'>[]): OrcamentoVendaDespesa[] {
    this.getDespesas(orcamentoVendaId).forEach(d => deleteV2(keysV2.orcDespesas, d.id));
    return lista.map(data => {
      const item: OrcamentoVendaDespesa = { id: generateV2Id(), orcamentoVendaId, ...data };
      addV2(keysV2.orcDespesas, item);
      return item;
    });
  }

  // ── Extras ────────────────────────────────────────────────────────────

  getAllExtras(): OrcamentoVendaDespesaExtra[] {
    return readV2<OrcamentoVendaDespesaExtra>(keysV2.orcExtras);
  }

  getExtras(orcamentoVendaId: string): OrcamentoVendaDespesaExtra[] {
    return this.getAllExtras().filter(e => e.orcamentoVendaId === orcamentoVendaId);
  }

  replaceExtras(orcamentoVendaId: string, lista: Omit<OrcamentoVendaDespesaExtra, 'id' | 'orcamentoVendaId'>[]): OrcamentoVendaDespesaExtra[] {
    this.getExtras(orcamentoVendaId).forEach(e => deleteV2(keysV2.orcExtras, e.id));
    return lista.map(data => {
      const item: OrcamentoVendaDespesaExtra = { id: generateV2Id(), orcamentoVendaId, ...data };
      addV2(keysV2.orcExtras, item);
      return item;
    });
  }
}
