import { Observable } from 'rxjs';

export interface FechamentoData {
  processoId: string;
  valoresPagos?: number;
  diferencas?: string;
  ajustes?: string;
  dataFechamento?: string;
  observacao?: string;
}

export abstract class FechamentoRepository {
  abstract get$(processoId: string): Observable<FechamentoData | null>;
  abstract save(data: FechamentoData): void;
}