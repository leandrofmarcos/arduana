import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiClientService } from '../../../../core/api/client/api-client.service';
import { TipoDocumento, CategoriaDocumento } from '../models/documento.models';

interface TipoDocumentoApiDto {
  id: number;
  nome: string;
  codigo: string;
  categoria: string;
  ativo: boolean;
}

@Injectable({ providedIn: 'root' })
export class TipoDocumentoService {
  private items: TipoDocumento[] = [];
  private loaded = false;

  constructor(private apiClient: ApiClientService) {
    this.refresh();
  }

  getAll(): TipoDocumento[] {
    this.ensureLoaded();
    return [...this.items].sort((a, b) => a.nome.localeCompare(b.nome));
  }

  getAtivos(): TipoDocumento[] {
    return this.getAll().filter(t => t.ativo);
  }

  getById(id: string): TipoDocumento | undefined {
    this.ensureLoaded();
    return this.items.find(t => t.id === id);
  }

  create(data: Omit<TipoDocumento, 'id'>): Observable<TipoDocumento> {
    const payload = { ...data };
    return this.apiClient.post<TipoDocumentoApiDto>('/tipo-documento', payload).pipe(
      tap((created: any) => {
        const mapped = this.mapDto(created);
        this.items.push(mapped);
      })
    ) as any;
  }

  update(item: TipoDocumento): void {
    const payload = { ...item };
    this.apiClient.put<TipoDocumentoApiDto>(`/tipo-documento/${item.id}`, payload).subscribe({
      next: () => this.refresh()
    });
  }

  remove(id: string): void {
    this.apiClient.delete(`/tipo-documento/${id}`).subscribe({
      next: () => this.refresh()
    });
  }

  private refresh(): void {
    this.apiClient.getList<TipoDocumentoApiDto>('/tipo-documento', { page: 1, pageSize: 100 }).subscribe({
      next: (result: any) => {
        this.items = result.items.map((item: TipoDocumentoApiDto) => this.mapDto(item));
        this.loaded = true;
      },
      error: () => {
        // Fallback: keep previous state if API fails
        this.loaded = true;
      }
    });
  }

  private mapDto(dto: TipoDocumentoApiDto): TipoDocumento {
    return {
      id: dto.id.toString(),
      nome: dto.nome,
      codigo: dto.codigo,
      categoria: dto.categoria as CategoriaDocumento,
      ativo: dto.ativo
    };
  }

  private ensureLoaded(): void {
    if (!this.loaded) this.refresh();
  }
}

