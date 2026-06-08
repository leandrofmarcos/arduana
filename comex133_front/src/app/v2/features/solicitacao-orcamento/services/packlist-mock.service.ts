import { Injectable } from '@angular/core';
import { PacklistUploadResult } from '../models/solicitacao-orcamento.models';

@Injectable({ providedIn: 'root' })
export class PacklistMockService {
  private store = new Map<string, PacklistUploadResult>();

  save(result: PacklistUploadResult): void {
    this.store.set(result.solicitacaoOrcamentoId, result);
  }

  getBysolicitacaoId(solicitacaoId: string): PacklistUploadResult | undefined {
    return this.store.get(solicitacaoId);
  }

  has(solicitacaoId: string): boolean {
    return this.store.has(solicitacaoId);
  }

  remove(solicitacaoId: string): void {
    this.store.delete(solicitacaoId);
  }
}
