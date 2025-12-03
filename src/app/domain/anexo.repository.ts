import { Observable } from 'rxjs';
import { Anexo } from './anexo.models';

export abstract class AnexoRepository {
  abstract list$(processoId: string): Observable<Anexo[]>;
  abstract add(a: Omit<Anexo,'id'|'dataUpload'>): void;
  abstract remove(id: string): void;
}