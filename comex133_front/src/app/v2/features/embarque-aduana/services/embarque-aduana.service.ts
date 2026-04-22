import { Injectable } from '@angular/core';
import {
  keysV2, readV2, addV2, updateV2, deleteV2, generateV2Id, generateCode
} from '../../../core/helpers/storage-v2.helper';
import {
  EmbarqueAduana, HistoricoStatusEmbarque, FreeTimeEmbarque, PagamentoProcesso
} from '../models/embarque-aduana.models';

@Injectable({ providedIn: 'root' })
export class EmbarqueAduanaService {

  // ── EmbarqueAduana CRUD ───────────────────────────────────────────────

  getAll(): EmbarqueAduana[] {
    return readV2<EmbarqueAduana>(keysV2.embarques);
  }

  getById(id: string): EmbarqueAduana | undefined {
    return this.getAll().find(e => e.id === id);
  }

  gerarCodigoInterno(): string {
    return generateCode('EMB', this.getAll().length);
  }

  create(data: Omit<EmbarqueAduana, 'id' | 'codigoInterno'>): EmbarqueAduana {
    const item: EmbarqueAduana = {
      ...data,
      id: generateV2Id(),
      codigoInterno: this.gerarCodigoInterno(),
    };
    addV2(keysV2.embarques, item);
    return item;
  }

  update(item: EmbarqueAduana): void {
    updateV2(keysV2.embarques, item);
  }

  remove(id: string): void {
    // Cascata: historico, free times, pagamentos
    this.getHistorico(id).forEach(h => deleteV2(keysV2.historicoStatus, h.id));
    this.getFreeTimes(id).forEach(f => deleteV2(keysV2.freeTimes, f.id));
    this.getPagamentos(id).forEach(p => deleteV2(keysV2.pagamentos, p.id));
    deleteV2(keysV2.embarques, id);
  }

  // ── Status ────────────────────────────────────────────────────────────

  alterarStatus(
    embarqueId: string,
    novoStatusId: string,
    usuarioId: string,
    observacao?: string
  ): void {
    const emb = this.getById(embarqueId);
    if (!emb) return;
    this.update({ ...emb, statusEmbarqueId: novoStatusId });
    const hist: HistoricoStatusEmbarque = {
      id: generateV2Id(),
      embarqueAduanaId: embarqueId,
      statusEmbarqueId: novoStatusId,
      dataStatus: new Date().toISOString(),
      observacao,
      usuarioId,
    };
    addV2(keysV2.historicoStatus, hist);
  }

  // ── Histórico ─────────────────────────────────────────────────────────

  getHistorico(embarqueId: string): HistoricoStatusEmbarque[] {
    return readV2<HistoricoStatusEmbarque>(keysV2.historicoStatus)
      .filter(h => h.embarqueAduanaId === embarqueId)
      .sort((a, b) => b.dataStatus.localeCompare(a.dataStatus));
  }

  addHistoricoEdicao(hist: HistoricoStatusEmbarque): void {
    addV2(keysV2.historicoStatus, hist);
  }

  // ── FreeTime ──────────────────────────────────────────────────────────

  getFreeTimes(embarqueId: string): FreeTimeEmbarque[] {
    return readV2<FreeTimeEmbarque>(keysV2.freeTimes)
      .filter(f => f.embarqueAduanaId === embarqueId);
  }

  getAllFreeTimes(): FreeTimeEmbarque[] {
    return readV2<FreeTimeEmbarque>(keysV2.freeTimes);
  }

  addFreeTime(data: Omit<FreeTimeEmbarque, 'id' | 'dataFim'>): FreeTimeEmbarque {
    const inicio = new Date(data.dataInicio);
    const fim = new Date(inicio);
    fim.setDate(fim.getDate() + data.quantidadeDias);
    const item: FreeTimeEmbarque = {
      ...data,
      id: generateV2Id(),
      dataFim: fim.toISOString().split('T')[0],
    };
    addV2(keysV2.freeTimes, item);
    return item;
  }

  removeFreeTime(id: string): void {
    deleteV2(keysV2.freeTimes, id);
  }

  diasRestantesFreeTime(ft: FreeTimeEmbarque): number {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const fim = new Date(ft.dataFim);
    return Math.ceil((fim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  }

  // ── Pagamentos ────────────────────────────────────────────────────────

  getPagamentos(embarqueId: string): PagamentoProcesso[] {
    return readV2<PagamentoProcesso>(keysV2.pagamentos)
      .filter(p => p.embarqueAduanaId === embarqueId)
      .sort((a, b) => a.dataPrevista.localeCompare(b.dataPrevista));
  }

  getAllPagamentos(): PagamentoProcesso[] {
    return readV2<PagamentoProcesso>(keysV2.pagamentos);
  }

  addPagamento(data: Omit<PagamentoProcesso, 'id'>): PagamentoProcesso {
    const item: PagamentoProcesso = { ...data, id: generateV2Id() };
    addV2(keysV2.pagamentos, item);
    return item;
  }

  updatePagamento(item: PagamentoProcesso): void {
    updateV2(keysV2.pagamentos, item);
  }

  removePagamento(id: string): void {
    deleteV2(keysV2.pagamentos, id);
  }

  efetivarPagamento(id: string, dataPagamento: string): void {
    const pagamentos = readV2<PagamentoProcesso>(keysV2.pagamentos);
    const p = pagamentos.find(p => p.id === id);
    if (p) updateV2(keysV2.pagamentos, { ...p, dataPagamento });
  }
}
