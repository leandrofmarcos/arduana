import { Observable } from 'rxjs';
import { Despesa, PlanilhaSnapshot, Premissas, Taxas } from './planilha.models';

export abstract class PlanilhaRepository {
  abstract snapshot$(): Observable<PlanilhaSnapshot>;
  abstract atualizarPremissas(p: Partial<Premissas>): void;
  abstract atualizarTaxas(t: Partial<Taxas>): void;
  abstract adicionarDespesa(d: Omit<Despesa, 'id'>): void;
  abstract editarDespesa(id: string, d: Partial<Despesa>): void;
  abstract removerDespesa(id: string): void;
  abstract carregarSnapshot(snap: PlanilhaSnapshot): void;
  abstract atualizarNfSaida(n: Partial<NonNullable<PlanilhaSnapshot['nfSaida']>>): void;
}