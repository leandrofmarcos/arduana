import { Observable } from 'rxjs';
import { NumerarioLancamento, NumerarioStatus } from './numerario.models';

export abstract class NumerarioRepository {
  abstract list$(processoId: string): Observable<NumerarioLancamento[]>;
  abstract add(l: Omit<NumerarioLancamento,'id'|'trilha'|'data'|'status'> & { valor: number; moeda: 'BRL'|'USD'|'EUR'; responsavel: string; observacao?: string }): void;
  abstract updateStatus(id: string, status: NumerarioStatus): void;
  abstract remove(id: string): void;
}