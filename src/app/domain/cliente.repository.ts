import { Observable } from 'rxjs';
import { Cliente } from './cliente.models';

export abstract class ClienteRepository {
  abstract list$(): Observable<Cliente[]>;
  abstract create(data: Omit<Cliente,'id'>): string;
  abstract update(id: string, data: Partial<Omit<Cliente,'id'>>): void;
  abstract remove(id: string): void;
}