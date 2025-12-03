import { Observable } from 'rxjs';
import { VendaData } from './venda.models';

export abstract class VendaRepository {
  abstract get$(processoId: string): Observable<VendaData | null>;
  abstract save(data: VendaData): void;
}