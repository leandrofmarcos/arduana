import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { PortoRepository } from '../../domain/porto.repository';
import { Porto } from '../../domain/porto.models';
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
export class HttpPortoRepository extends PortoRepository {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private apiUrl = `${environment.apiUrl}/portos`;
  private refreshSubject = new Subject<void>();
  
  refresh$ = this.refreshSubject.asObservable();

  list$(): Observable<Porto[]> {
    return this.http.get<ApiResponse<PagedResult<Porto>>>(this.apiUrl).pipe(
      map(response => {
        if (response.success && response.data?.items) {
          return response.data.items;
        }
        return [];
      }),
      catchError(error => {
        console.error('Erro ao listar portos:', error);
        this.toast.error('Erro ao carregar lista de portos. Verifique a conexão com a API.');
        return [];
      })
    );
  }

  create(data: Omit<Porto,'id'>): string {
    this.http.post<ApiResponse<Porto>>(this.apiUrl, data).subscribe({
      next: (response) => {
        if (response.success) {
          this.toast.success('Porto criado com sucesso!');
          this.refreshSubject.next();
        } else {
          this.toast.error(response.message || 'Erro ao criar porto');
        }
      },
      error: (error) => {
        console.error('Erro ao criar porto:', error);
        // Extrai mensagens de validação específicas se disponível
        if (error.error?.errors && Array.isArray(error.error.errors)) {
          const validationMessages = error.error.errors
            .map((e: any) => `${e.field}: ${e.message}`)
            .join('\n');
          this.toast.error(`Erro de validação:\n${validationMessages}`);
        } else if (error.error?.message) {
          this.toast.error(error.error.message);
        } else {
          this.toast.error('Erro ao criar porto. Verifique os dados e tente novamente.');
        }
      }
    });
    return '';
  }

  update(id: string, data: Partial<Omit<Porto,'id'>>): void {
    this.http.put<ApiResponse<Porto>>(`${this.apiUrl}/${id}`, data).subscribe({
      next: (response) => {
        if (response.success) {
          this.toast.success('Porto atualizado com sucesso!');
          this.refreshSubject.next();
        } else {
          this.toast.error(response.message || 'Erro ao atualizar porto');
        }
      },
      error: (error) => {
        console.error('Erro ao atualizar porto:', error);
        if (error.error?.errors && Array.isArray(error.error.errors)) {
          const validationMessages = error.error.errors
            .map((e: any) => `${e.field}: ${e.message}`)
            .join('\n');
          this.toast.error(`Erro de validação:\n${validationMessages}`);
        } else if (error.error?.message) {
          this.toast.error(error.error.message);
        } else {
          this.toast.error('Erro ao atualizar porto. Verifique os dados e tente novamente.');
        }
      }
    });
  }

  remove(id: string): void {
    this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`).subscribe({
      next: (response) => {
        if (response.success) {
          this.toast.success('Porto removido com sucesso!');
          this.refreshSubject.next();
        } else {
          this.toast.error(response.message || 'Erro ao remover porto');
        }
      },
      error: (error) => {
        console.error('Erro ao remover porto:', error);
        this.toast.error('Erro ao remover porto. Tente novamente.');
      }
    });
  }
}
