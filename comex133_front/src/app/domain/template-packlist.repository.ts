import { Observable } from 'rxjs';
import { TemplatePacklist, TemplatePacklistListItem } from '../features/templates-packlist/models/templates-packlist.models';

export abstract class TemplatePacklistRepository {
  abstract list$(): Observable<TemplatePacklistListItem[]>;
  abstract getById$(id: string): Observable<TemplatePacklist | null>;
  abstract create(template: Omit<TemplatePacklist, 'id' | 'dataCriacao' | 'dataAtualizacao'>): void;
  abstract update(id: string, template: Partial<TemplatePacklist>): void;
  abstract remove(id: string): void;
  abstract uploadFile(file: File): Observable<{ fileUrl: string; fileName: string }>;
}
