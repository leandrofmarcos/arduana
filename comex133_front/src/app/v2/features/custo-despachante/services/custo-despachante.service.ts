import { Injectable } from '@angular/core';
import {
  keysV2, readV2, addV2, updateV2, deleteV2, generateV2Id, generateCode
} from '../../../core/helpers/storage-v2.helper';
import {
  CustoDespachante, CustoDespachanteLi, CustoDespachanteDespesa,
  NcmVinculadoOrcamento, ValorImposto
} from '../models/custo-despachante.models';

@Injectable({ providedIn: 'root' })
export class CustoDespachanteService {

  // ── CustoDespachante ──────────────────────────────────────────────────

  getAll(): CustoDespachante[] {
    return readV2<CustoDespachante>(keysV2.custos);
  }

  getById(id: string): CustoDespachante | undefined {
    return this.getAll().find(c => c.id === id);
  }

  gerarCodigoInterno(): string {
    return generateCode('CD', this.getAll().length);
  }

  create(data: Omit<CustoDespachante, 'id' | 'codigoInterno'>): CustoDespachante {
    const item: CustoDespachante = {
      id: generateV2Id(),
      codigoInterno: this.gerarCodigoInterno(),
      ...data
    };
    addV2(keysV2.custos, item);
    return item;
  }

  update(item: CustoDespachante): void {
    updateV2(keysV2.custos, item);
  }

  remove(id: string): void {
    deleteV2(keysV2.custos, id);
    // cascata: remove entidades filhas
    this.getLis(id).forEach(li => this.removeLi(li.id));
    this.getDespesas(id).forEach(d => this.removeDespesa(d.id));
    this.getNcmsVinculados(id).forEach(n => {
      this.getValoresImposto(n.id).forEach(v => deleteV2(keysV2.valoresImposto, v.id));
      deleteV2(keysV2.ncmsVinculados, n.id);
    });
  }

  // ── LI ───────────────────────────────────────────────────────────────

  getAllLis(): CustoDespachanteLi[] {
    return readV2<CustoDespachanteLi>(keysV2.custosLi);
  }

  getLis(custoDespachanteId: string): CustoDespachanteLi[] {
    return this.getAllLis().filter(li => li.custoDespachanteId === custoDespachanteId);
  }

  addLi(data: Omit<CustoDespachanteLi, 'id'>): CustoDespachanteLi {
    const item: CustoDespachanteLi = { id: generateV2Id(), ...data };
    addV2(keysV2.custosLi, item);
    return item;
  }

  removeLi(id: string): void {
    deleteV2(keysV2.custosLi, id);
  }

  replaceLis(custoDespachanteId: string, lista: Omit<CustoDespachanteLi, 'id' | 'custoDespachanteId'>[]): CustoDespachanteLi[] {
    this.getLis(custoDespachanteId).forEach(li => this.removeLi(li.id));
    return lista.map(data => this.addLi({ custoDespachanteId, ...data }));
  }

  // ── Despesas ─────────────────────────────────────────────────────────

  getAllDespesas(): CustoDespachanteDespesa[] {
    return readV2<CustoDespachanteDespesa>(keysV2.custosDespesas);
  }

  getDespesas(custoDespachanteId: string): CustoDespachanteDespesa[] {
    return this.getAllDespesas().filter(d => d.custoDespachanteId === custoDespachanteId);
  }

  addDespesa(data: Omit<CustoDespachanteDespesa, 'id'>): CustoDespachanteDespesa {
    const item: CustoDespachanteDespesa = { id: generateV2Id(), ...data };
    addV2(keysV2.custosDespesas, item);
    return item;
  }

  removeDespesa(id: string): void {
    deleteV2(keysV2.custosDespesas, id);
  }

  replaceDespesas(custoDespachanteId: string, lista: Omit<CustoDespachanteDespesa, 'id' | 'custoDespachanteId'>[]): CustoDespachanteDespesa[] {
    this.getDespesas(custoDespachanteId).forEach(d => this.removeDespesa(d.id));
    return lista.map(data => this.addDespesa({ custoDespachanteId, ...data }));
  }

  // ── NcmVinculado ─────────────────────────────────────────────────────

  getAllNcmsVinculados(): NcmVinculadoOrcamento[] {
    return readV2<NcmVinculadoOrcamento>(keysV2.ncmsVinculados);
  }

  getNcmsVinculados(custoDespachanteId: string): NcmVinculadoOrcamento[] {
    return this.getAllNcmsVinculados().filter(n => n.custoDespachanteId === custoDespachanteId);
  }

  addNcmVinculado(data: Omit<NcmVinculadoOrcamento, 'id'>): NcmVinculadoOrcamento {
    const item: NcmVinculadoOrcamento = { id: generateV2Id(), ...data };
    addV2(keysV2.ncmsVinculados, item);
    return item;
  }

  removeNcmVinculado(id: string): void {
    this.getValoresImposto(id).forEach(v => deleteV2(keysV2.valoresImposto, v.id));
    deleteV2(keysV2.ncmsVinculados, id);
  }

  replaceNcmsVinculados(custoDespachanteId: string, lista: Omit<NcmVinculadoOrcamento, 'id' | 'custoDespachanteId'>[]): NcmVinculadoOrcamento[] {
    this.getNcmsVinculados(custoDespachanteId).forEach(n => this.removeNcmVinculado(n.id));
    return lista.map(data => this.addNcmVinculado({ custoDespachanteId, ...data }));
  }

  // ── ValorImposto ────────────────────────────────────────────────────

  getAllValoresImposto(): ValorImposto[] {
    return readV2<ValorImposto>(keysV2.valoresImposto);
  }

  getValoresImposto(ncmVinculadoOrcamentoId: string): ValorImposto[] {
    return this.getAllValoresImposto().filter(v => v.ncmVinculadoOrcamentoId === ncmVinculadoOrcamentoId);
  }

  saveValorImposto(item: ValorImposto): void {
    const exists = this.getAllValoresImposto().find(v => v.id === item.id);
    if (exists) {
      updateV2(keysV2.valoresImposto, item);
    } else {
      addV2(keysV2.valoresImposto, item);
    }
  }
}
