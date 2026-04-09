import { Injectable } from '@angular/core';
import {
  keysV2, readV2, writeV2, addV2, updateV2, deleteV2, generateV2Id, generateCode
} from '../../../core/helpers/storage-v2.helper';
import {
  SolicitacaoOrcamento,
  SolicitacaoOrcamentoDespachante,
  SolicitacaoOrcamentoDocumento
} from '../models/solicitacao-orcamento.models';

@Injectable({ providedIn: 'root' })
export class SolicitacaoOrcamentoService {

  // ── SolicitacaoOrcamento ───────────────────────────────────────────────

  getAll(): SolicitacaoOrcamento[] {
    return readV2<SolicitacaoOrcamento>(keysV2.solicitacoes);
  }

  getById(id: string): SolicitacaoOrcamento | undefined {
    return this.getAll().find(s => s.id === id);
  }

  gerarCodigoInterno(): string {
    return generateCode('SOL', this.getAll().length);
  }

  create(data: Omit<SolicitacaoOrcamento, 'id' | 'codigoInterno'>): SolicitacaoOrcamento {
    const item: SolicitacaoOrcamento = {
      id: generateV2Id(),
      codigoInterno: this.gerarCodigoInterno(),
      ...data
    };
    addV2(keysV2.solicitacoes, item);
    return item;
  }

  update(item: SolicitacaoOrcamento): void {
    updateV2(keysV2.solicitacoes, item);
  }

  remove(id: string): void {
    deleteV2(keysV2.solicitacoes, id);
    // cascata: remove despachantes e documentos da solicitação
    this.getDespachantes(id).forEach(d => deleteV2(keysV2.solicitacaoDespachantes, d.id));
    this.getDocumentos(id).forEach(d => deleteV2(keysV2.solicitacaoDocumentos, d.id));
  }

  // ── SolicitacaoOrcamentoDespachante ───────────────────────────────────

  getAllDespachantes(): SolicitacaoOrcamentoDespachante[] {
    return readV2<SolicitacaoOrcamentoDespachante>(keysV2.solicitacaoDespachantes);
  }

  getDespachantes(solicitacaoId: string): SolicitacaoOrcamentoDespachante[] {
    return this.getAllDespachantes().filter(d => d.solicitacaoOrcamentoId === solicitacaoId);
  }

  addDespachante(data: Omit<SolicitacaoOrcamentoDespachante, 'id'>): SolicitacaoOrcamentoDespachante {
    const item: SolicitacaoOrcamentoDespachante = { id: generateV2Id(), ...data };
    addV2(keysV2.solicitacaoDespachantes, item);
    return item;
  }

  updateDespachante(item: SolicitacaoOrcamentoDespachante): void {
    updateV2(keysV2.solicitacaoDespachantes, item);
  }

  removeDespachante(id: string): void {
    deleteV2(keysV2.solicitacaoDespachantes, id);
  }

  // ── SolicitacaoOrcamentoDocumento ─────────────────────────────────────

  getAllDocumentos(): SolicitacaoOrcamentoDocumento[] {
    return readV2<SolicitacaoOrcamentoDocumento>(keysV2.solicitacaoDocumentos);
  }

  getDocumentos(solicitacaoId: string): SolicitacaoOrcamentoDocumento[] {
    return this.getAllDocumentos().filter(d => d.solicitacaoOrcamentoId === solicitacaoId);
  }

  addDocumento(data: Omit<SolicitacaoOrcamentoDocumento, 'id'>): SolicitacaoOrcamentoDocumento {
    const item: SolicitacaoOrcamentoDocumento = { id: generateV2Id(), ...data };
    addV2(keysV2.solicitacaoDocumentos, item);
    return item;
  }

  updateDocumento(item: SolicitacaoOrcamentoDocumento): void {
    updateV2(keysV2.solicitacaoDocumentos, item);
  }

  removeDocumento(id: string): void {
    deleteV2(keysV2.solicitacaoDocumentos, id);
  }
}
