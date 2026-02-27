import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TemplatePacklist, TemplatePacklistListItem } from '../models/templates-packlist.models';
import { TemplatePacklistRepository } from '../../../domain/template-packlist.repository';
import { TEMPLATE_PACKLIST_REPOSITORY } from '../../../core/repository.tokens';

@Injectable({ providedIn: 'root' })
export class TemplatesPacklistService {
  private repository = inject(TEMPLATE_PACKLIST_REPOSITORY);

  list$(): Observable<TemplatePacklistListItem[]> {
    return this.repository.list$();
  }

  getById$(id: string): Observable<TemplatePacklist | null> {
    return this.repository.getById$(id);
  }

  create(template: Omit<TemplatePacklist, 'id' | 'dataCriacao' | 'dataAtualizacao'>): void {
    this.repository.create(template);
  }

  update(id: string, template: Partial<TemplatePacklist>): void {
    this.repository.update(id, template);
  }

  remove(id: string): void {
    this.repository.remove(id);
  }

  uploadFile(file: File): Observable<{ fileUrl: string; fileName: string }> {
    return this.repository.uploadFile(file);
  }
}

