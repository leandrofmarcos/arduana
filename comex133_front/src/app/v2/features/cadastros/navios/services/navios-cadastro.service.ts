import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiClientService } from '../../../../../core/api/client/api-client.service';
import { NavioCadastro } from '../models/navio.models';

interface NavioApiDto {
  id: number;
  nomeNavio: string;
  codigoImo?: string;
  armador?: string;
  observacao?: string;
  ativo: boolean;
}

@Injectable({ providedIn: 'root' })
export class NaviosCadastroService {
  private readonly endpoint = '/navios';
  private readonly items: NavioCadastro[] = [];
  private loaded = false;

  readonly navios$ = new BehaviorSubject<NavioCadastro[]>([]);

  constructor(private apiClient: ApiClientService) {
    this.refresh();
  }

  reload(): void {
    this.loaded = false;
    this.refresh();
  }

  getAll(): NavioCadastro[] {
    this.ensureLoaded();
    return [...this.items];
  }

  create(data: Omit<NavioCadastro, 'id'>): Observable<NavioCadastro> {
    return this.apiClient.post<NavioApiDto>(this.endpoint, {
      nomeNavio: data.nomeNavio.trim(),
      codigoImo: data.codigoImo?.trim() || undefined,
      armador: data.armador?.trim() || undefined,
      observacao: data.observacao?.trim() || undefined,
      ativo: data.ativo
    }).pipe(
      map((dto) => this.mapDto(dto)),
      tap((created) => {
        this.items.push(created);
        this.navios$.next([...this.items]);
      })
    );
  }

  update(item: NavioCadastro): void {
    this.apiClient.put<NavioApiDto>(`${this.endpoint}/${item.id}`, {
      nomeNavio: item.nomeNavio.trim(),
      codigoImo: item.codigoImo?.trim() || undefined,
      armador: item.armador?.trim() || undefined,
      observacao: item.observacao?.trim() || undefined,
      ativo: item.ativo
    }).subscribe({
      next: () => this.refresh()
    });
  }

  remove(id: string): void {
    this.apiClient.delete<void>(`${this.endpoint}/${id}`).subscribe({
      next: () => this.refresh()
    });
  }

  private refresh(): void {
    this.apiClient.getList<NavioApiDto>(this.endpoint, { page: 1, pageSize: 200 }).subscribe({
      next: (result) => {
        this.items.splice(0, this.items.length, ...result.items.map((item) => this.mapDto(item)));
        this.loaded = true;
        this.navios$.next([...this.items]);
      },
      error: () => {
        this.loaded = false;
      }
    });
  }

  private ensureLoaded(): void {
    if (!this.loaded) this.refresh();
  }

  private mapDto(dto: NavioApiDto): NavioCadastro {
    return {
      id: String(dto.id),
      nomeNavio: dto.nomeNavio,
      codigoImo: dto.codigoImo ?? '',
      armador: dto.armador ?? '',
      observacao: dto.observacao ?? '',
      ativo: dto.ativo
    };
  }
}
