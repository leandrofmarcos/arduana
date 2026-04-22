import { Observable } from 'rxjs';
import { Porto } from './porto.models';

export abstract class PortoRepository {
  abstract list$(): Observable<Porto[]>;
  abstract create(data: Omit<Porto,'id'>): string;
  abstract update(id: string, data: Partial<Omit<Porto,'id'>>): void;
  abstract remove(id: string): void;
}