import { Observable } from 'rxjs';
import { AliquotaPerfil } from './aliquota.models';

export abstract class AliquotaRepository {
  abstract list$(): Observable<AliquotaPerfil[]>;
  abstract create(data: Omit<AliquotaPerfil,'id'|'padrao'> & { padrao?: boolean }): string;
  abstract update(id: string, data: Partial<Omit<AliquotaPerfil,'id'>>): void;
  abstract remove(id: string): void;
  abstract setPadrao(id: string): void;
}