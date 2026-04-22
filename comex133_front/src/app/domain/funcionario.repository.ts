import { Observable } from 'rxjs';
import { Funcionario } from './funcionario.models';

export abstract class FuncionarioRepository {
  abstract list$(): Observable<Funcionario[]>;
  abstract create(data: Omit<Funcionario,'id'>): string;
  abstract update(id: string, data: Partial<Omit<Funcionario,'id'>>): void;
  abstract remove(id: string): void;
}
