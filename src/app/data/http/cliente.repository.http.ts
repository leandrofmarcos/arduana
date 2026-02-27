import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ClienteRepository } from '../../domain/cliente.repository';
import { Cliente } from '../../domain/cliente.models';
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
export class HttpClienteRepository extends ClienteRepository {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private apiUrl = `${environment.apiUrl}/clientes`;
  private refreshSubject = new Subject<void>();
  
  refresh$ = this.refreshSubject.asObservable();

  list$(): Observable<Cliente[]> {
    return this.http.get<ApiResponse<PagedResult<Cliente>>>(this.apiUrl).pipe(
      map(response => {
        if (response.success && response.data?.items) {
          return response.data.items;
        }
        return [];
      }),
      catchError(error => {
        console.error('Erro ao listar clientes:', error);
        this.toast.error('Erro ao carregar lista de clientes. Verifique a conexão com a API.');
        return [];
      })
    );
  }

  create(data: Omit<Cliente,'id'>): string {
    this.http.post<ApiResponse<Cliente>>(this.apiUrl, data).subscribe({
      next: (response) => {
        if (response.success) {
          this.toast.success('Cliente criado com sucesso!');
          this.refreshSubject.next();
        } else {
          this.toast.error(response.message || 'Erro ao criar cliente');
        }
      },
      error: (error) => {
        console.error('Erro ao criar cliente:', error);
        if (error.error?.errors && Array.isArray(error.error.errors)) {
          const validationMessages = error.error.errors
            .map((e: any) => `${e.field}: ${e.message}`)
            .join('\n');
          this.toast.error(`Erro de validação:\n${validationMessages}`);
        } else if (error.error?.message) {
          this.toast.error(error.error.message);
        } else {
          this.toast.error('Erro ao criar cliente. Verifique os dados e tente novamente.');
        }
      }
    });
    return '';
  }

  update(id: string, data: Partial<Omit<Cliente,'id'>>): void {
    this.http.put<ApiResponse<Cliente>>(`${this.apiUrl}/${id}`, data).subscribe({
      next: (response) => {
        if (response.success) {
          this.toast.success('Cliente atualizado com sucesso!');
          this.refreshSubject.next();
        } else {
          this.toast.error(response.message || 'Erro ao atualizar cliente');
        }
      },
      error: (error) => {
        console.error('Erro ao atualizar cliente:', error);
        if (error.error?.errors && Array.isArray(error.error.errors)) {
          const validationMessages = error.error.errors
            .map((e: any) => `${e.field}: ${e.message}`)
            .join('\n');
          this.toast.error(`Erro de validação:\n${validationMessages}`);
        } else if (error.error?.message) {
          this.toast.error(error.error.message);
        } else {
          this.toast.error('Erro ao atualizar cliente. Verifique os dados e tente novamente.');
        }
      }
    });
  }

  remove(id: string): void {
    this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`).subscribe({
      next: (response) => {
        if (response.success) {
          this.toast.success('Cliente removido com sucesso!');
          this.refreshSubject.next();
        } else {
          this.toast.error(response.message || 'Erro ao remover cliente');
        }
      },
      error: (error) => {
        console.error('Erro ao remover cliente:', error);
        this.toast.error('Erro ao remover cliente. Tente novamente.');
      }
    });
  }
}
