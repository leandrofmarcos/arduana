import { Injectable, inject } from '@angular/core';
import { FUNCIONARIO_REPOSITORY } from '../../../core/repository.tokens';
import { FuncionarioRepository } from '../../../domain/funcionario.repository';
import { Observable } from 'rxjs';
import { Funcionario } from '../../../domain/funcionario.models';

@Injectable({ providedIn: 'root' })
export class FuncionariosService {
  private repo = inject<FuncionarioRepository>(FUNCIONARIO_REPOSITORY);
  
  list$(): Observable<Funcionario[]> { 
    return this.repo.list$(); 
  }
  
  create(data: Omit<Funcionario, 'id'>): string { 
    return this.repo.create(data); 
  }
  
  update(id: string, data: Partial<Omit<Funcionario,'id'>>){ 
    this.repo.update(id, data); 
  }
  
  remove(id: string){ 
    this.repo.remove(id); 
  }
}
