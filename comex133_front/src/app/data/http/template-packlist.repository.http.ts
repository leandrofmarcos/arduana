import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, merge, startWith, switchMap, tap, catchError, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { TemplatePacklistRepository } from '../../domain/template-packlist.repository';
import { TemplatePacklist, TemplatePacklistListItem } from '../../features/templates-packlist/models/templates-packlist.models';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../core/services/toast.service';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

@Injectable()
export class HttpTemplatePacklistRepository extends TemplatePacklistRepository {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private apiUrl = `${environment.apiUrl}/templates-packlist`;
  private refreshSubject = new Subject<void>();

  uploadFile(file: File): Observable<{ fileUrl: string; fileName: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ApiResponse<{ fileUrl: string; fileName: string }>>(`${this.apiUrl}/upload`, formData).pipe(
      map(response => response.data),
      catchError(err => {
        console.error('Erro ao fazer upload:', err);
        this.toast.error('Erro ao fazer upload do arquivo');
        throw err;
      })
    );
  }

  list$(): Observable<TemplatePacklistListItem[]> {
    return merge(
      this.refreshSubject.pipe(startWith(undefined))
    ).pipe(
      switchMap(() => 
        this.http.get<ApiResponse<PagedResult<TemplatePacklistListItem>>>(`${this.apiUrl}?pageSize=100`).pipe(
          map(response => response.data.items),
          catchError(err => {
            console.error('Erro ao listar templates:', err);
            this.toast.error('Erro ao carregar templates de packlist');
            return of([]);
          })
        )
      )
    );
  }

  getById$(id: string): Observable<TemplatePacklist | null> {
    return this.http.get<ApiResponse<TemplatePacklist>>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data),
      catchError(err => {
        console.error('Erro ao buscar template:', err);
        this.toast.error('Erro ao carregar template');
        return of(null);
      })
    );
  }

  create(template: Omit<TemplatePacklist, 'id' | 'dataCriacao' | 'dataAtualizacao'>): void {
    const body = {
      nome: template.nome,
      descricao: template.descricao || '',
      nomeArquivo: template.nomeArquivo,
      config: template.config
    };
    
    this.http.post<ApiResponse<TemplatePacklist>>(this.apiUrl, body).pipe(
      tap(response => {
        if (response.success) {
          this.toast.success('Template criado com sucesso');
          this.refreshSubject.next();
        }
      }),
      catchError(err => {
        console.error('Erro ao criar template:', err);
        const message = err.error?.message || err.error?.errors?.[0] || 'Erro ao criar template';
        this.toast.error(message);
        return of(null);
      })
    ).subscribe();
  }

  update(id: string, template: Partial<TemplatePacklist>): void {
    const body = {
      nome: template.nome,
      descricao: template.descricao,
      nomeArquivo: template.nomeArquivo,
      config: template.config
    };
    
    this.http.put<ApiResponse<TemplatePacklist>>(`${this.apiUrl}/${id}`, body).pipe(
      tap(response => {
        if (response.success) {
          this.toast.success('Template atualizado com sucesso');
          this.refreshSubject.next();
        }
      }),
      catchError(err => {
        console.error('Erro ao atualizar template:', err);
        const message = err.error?.message || err.error?.errors?.[0] || 'Erro ao atualizar template';
        this.toast.error(message);
        return of(null);
      })
    ).subscribe();
  }

  remove(id: string): void {
    this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`).pipe(
      tap(response => {
        if (response.success) {
          this.toast.success('Template removido com sucesso');
          this.refreshSubject.next();
        }
      }),
      catchError(err => {
        console.error('Erro ao remover template:', err);
        const message = err.error?.message || err.error?.errors?.[0] || 'Erro ao remover template';
        this.toast.error(message);
        return of(null);
      })
    ).subscribe();
  }
}
