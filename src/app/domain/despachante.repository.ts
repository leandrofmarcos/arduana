import { Observable } from 'rxjs';
import { Despachante } from './despachante.models';

export abstract class DespachanteRepository {
  abstract list$(): Observable<Despachante[]>;
  abstract create(data: Omit<Despachante,'id'>): string;
  abstract update(id: string, data: Partial<Omit<Despachante,'id'>>): void;
  abstract remove(id: string): void;
}