import { Injectable, inject } from '@angular/core';
import { PORTO_REPOSITORY } from '../../../core/repository.tokens';
import { PortoRepository } from '../../../domain/porto.repository';
import { Observable, merge, startWith, switchMap } from 'rxjs';
import { Porto } from '../models/porto.models';

@Injectable({ providedIn: 'root' })
export class PortosService {
  private repo = inject<PortoRepository>(PORTO_REPOSITORY);
  
  list$(): Observable<Porto[]> { 
    const refresh$ = (this.repo as any).refresh$ || new Observable();
    return merge(refresh$).pipe(
      startWith(null),
      switchMap(() => this.repo.list$())
    );
  }
  
  create(nome: string){ 
    return this.repo.create({ nome }); 
  }
  
  update(id: string, data: Partial<Pick<Porto,'nome'>>){ 
    this.repo.update(id, data); 
  }
  
  remove(id: string){ 
    this.repo.remove(id); 
  }
}