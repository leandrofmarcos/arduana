import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AliquotaRepository } from '../../domain/aliquota.repository';
import { AliquotaPerfil } from '../../domain/aliquota.models';
import { environment } from '../../../environments/environment';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

@Injectable({ providedIn: 'root' })
export class HttpAliquotaRepository implements AliquotaRepository {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/aliquotas`;
  private subject = new BehaviorSubject<AliquotaPerfil[]>([]);
  private toastCallback?: (tipo: 'success' | 'error', mensagem: string) => void;

  constructor() {
    this.loadAll();
  }

  setToastCallback(callback: (tipo: 'success' | 'error', mensagem: string) => void) {
    this.toastCallback = callback;
  }

  private notificar(tipo: 'success' | 'error', mensagem: string) {
    if (this.toastCallback) {
      this.toastCallback(tipo, mensagem);
    }
  }

  private loadAll(): void {
    this.http.get<ApiResponse<PagedResult<AliquotaPerfil>>>(`${this.baseUrl}?pageSize=100`)
      .subscribe({
        next: (response) => {
          console.log('📋 Lista de alíquotas carregada:', response);
          if (response.success && response.data) {
            this.subject.next(response.data.items);
          }
        },
        error: (err) => {
          console.error('❌ Erro ao carregar alíquotas:', err);
          console.error('Detalhes:', err.error);
          this.subject.next([]);
        }
      });
  }

  list$(): Observable<AliquotaPerfil[]> {
    return this.subject.asObservable();
  }

  create(data: Omit<AliquotaPerfil, 'id'>): string {
    const tempId = String(Date.now());
    
    console.log('📤 Enviando para API:', data);
    
    this.http.post<ApiResponse<AliquotaPerfil>>(this.baseUrl, data)
      .subscribe({
        next: (response) => {
          console.log('✅ Alíquota criada com sucesso:', response);
          this.loadAll();
          this.notificar('success', 'Alíquota criada com sucesso!');
        },
        error: (err) => {
          console.error('❌ Erro ao criar alíquota:', err);
          const mensagem = err.error?.message || err.message || 'Erro desconhecido';
          this.notificar('error', 'Erro ao criar alíquota: ' + mensagem);
        }
      });
    
    return tempId;
  }

  update(id: string, data: Partial<Omit<AliquotaPerfil, 'id'>>): void {
    console.log('📤 Enviando update para API:', {id, data});
    
    this.http.put<ApiResponse<AliquotaPerfil>>(`${this.baseUrl}/${id}`, data)
      .subscribe({
        next: (response) => {
          console.log('✅ Alíquota atualizada com sucesso:', response);
          this.loadAll();
          this.notificar('success', 'Alíquota atualizada com sucesso!');
        },
        error: (err) => {
          console.error('❌ Erro ao atualizar alíquota:', err);
          const mensagem = err.error?.message || err.message || 'Erro desconhecido';
          this.notificar('error', 'Erro ao atualizar alíquota: ' + mensagem);
        }
      });
  }

  remove(id: string): void {
    this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`)
      .subscribe({
        next: (response) => {
          console.log('✅ Alíquota removida com sucesso:', response);
          this.loadAll();
          this.notificar('success', 'Alíquota removida com sucesso!');
        },
        error: (err) => {
          console.error('❌ Erro ao deletar alíquota:', err);
          const mensagem = err.error?.message || err.message || 'Erro desconhecido';
          this.notificar('error', 'Erro ao deletar alíquota: ' + mensagem);
        }
      });
  }

  setPadrao(id: string): void {
    // Usar o endpoint de update para marcar como padrão
    this.http.put<ApiResponse<AliquotaPerfil>>(`${this.baseUrl}/${id}`, { padrao: true })
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            // Recarregar a lista completa para refletir a mudança
            this.loadAll();
          }
        },
        error: (err) => {
          console.error('Erro ao definir alíquota padrão:', err);
        }
      });
  }
}
