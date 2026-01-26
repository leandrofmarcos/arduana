import { Injectable } from '@angular/core';
import { readJSON, writeJSON, randomId, keys } from '../data/storage.helper';
import { PacklistRecord, PacklistSummary } from '../models/packlist.models';

@Injectable({ providedIn: 'root' })
export class PacklistService {
  private indexKey = 'packlist_index';

  listPacklists(): PacklistSummary[] {
    const index = readJSON<string[]>(this.indexKey) || [];
    return index
      .map(orcamentoId => readJSON<PacklistRecord>(keys.packlist(orcamentoId)))
      .filter(Boolean)
      .map(rec => ({
        id: rec!.id,
        orcamentoId: rec!.orcamentoId,
        cliente: rec!.cliente,
        despachante: rec!.despachante,
        codigo: rec!.codigo,
        status: rec!.status,
        enviadoEm: rec!.enviadoEm,
        arquivoNome: rec!.arquivoNome,
        items: (rec!.previewItems?.length || rec!.itens?.length || 0)
      }));
  }

  getByOrcamentoId(orcamentoId: string): PacklistRecord | null {
    return readJSON<PacklistRecord>(keys.packlist(orcamentoId));
  }

  save(record: Omit<PacklistRecord, 'id'> & { id?: string }): PacklistRecord {
    const now = new Date().toISOString();
    const existing = this.getByOrcamentoId(record.orcamentoId);
    const id = existing?.id || record.id || record.orcamentoId || randomId();
    const next: PacklistRecord = {
      id,
      orcamentoId: record.orcamentoId,
      codigo: record.codigo,
      cliente: record.cliente,
      despachante: record.despachante,
      arquivoNome: record.arquivoNome,
      arquivoCaminho: record.arquivoCaminho || existing?.arquivoCaminho || '',
      status: record.status,
      enviadoEm: record.enviadoEm || existing?.enviadoEm || now,
      enviadoPor: record.enviadoPor || existing?.enviadoPor,
      itens: record.itens || existing?.itens,
      previewItems: record.previewItems || existing?.previewItems,
      mappingConfig: record.mappingConfig || existing?.mappingConfig
    };

    writeJSON(keys.packlist(record.orcamentoId), next);
    const index = new Set(readJSON<string[]>(this.indexKey) || []);
    index.add(record.orcamentoId);
    writeJSON(this.indexKey, Array.from(index));
    return next;
  }

  removeByOrcamento(orcamentoId: string): void {
    const index = readJSON<string[]>(this.indexKey) || [];
    const next = index.filter(id => id !== orcamentoId);
    writeJSON(this.indexKey, next);
    localStorage.removeItem(keys.packlist(orcamentoId));
  }
}
