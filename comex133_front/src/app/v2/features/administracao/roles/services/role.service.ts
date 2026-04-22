import { Injectable } from '@angular/core';
import { ApiClientService } from '../../../../../core/api/client/api-client.service';
import { Role } from '../models/role.models';

interface RoleApiDto {
  id: number;
  nome: string;
  descricao?: string;
  criadoEm: string;
  atualizadoEm: string;
}

interface CreateRoleRequest {
  nome: string;
  descricao?: string;
}

interface UpdateRoleRequest {
  nome: string;
  descricao?: string;
}

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly endpoint = 'roles';
  private readonly items: Role[] = [];
  private loaded = false;

  constructor(private apiClient: ApiClientService) {
    this.refresh();
  }

  getAll(): Role[] {
    this.ensureLoaded();
    return [...this.items].sort((a, b) => a.nome.localeCompare(b.nome));
  }

  getById(id: string): Role | undefined {
    this.ensureLoaded();
    return this.items.find(r => r.id === id);
  }

  create(data: Omit<Role, 'id' | 'criadoEm' | 'atualizadoEm'>): void {
    const payload: CreateRoleRequest = {
      nome: data.nome,
      descricao: data.descricao || undefined
    };

    this.apiClient.post<RoleApiDto>(this.endpoint, payload).subscribe({
      next: () => this.refresh()
    });
  }

  update(item: Role): void {
    const id = Number(item.id);
    const payload: UpdateRoleRequest = {
      nome: item.nome,
      descricao: item.descricao || undefined
    };

    this.apiClient.put<RoleApiDto>(`${this.endpoint}/${id}`, payload).subscribe({
      next: () => this.refresh()
    });
  }

  remove(id: string): void {
    const roleId = Number(id);
    this.apiClient.delete(`${this.endpoint}/${roleId}`).subscribe({
      next: () => this.refresh()
    });
  }

  private refresh(): void {
    this.apiClient.getList<RoleApiDto>(this.endpoint, { page: 1, pageSize: 200 }).subscribe({
      next: result => {
        this.items.splice(0, this.items.length, ...result.items.map(dto => this.mapDto(dto)));
        this.loaded = true;
      },
      error: () => {
        this.loaded = true;
      }
    });
  }

  private ensureLoaded(): void {
    if (!this.loaded) this.refresh();
  }

  private mapDto(dto: RoleApiDto): Role {
    return {
      id: dto.id.toString(),
      nome: dto.nome,
      descricao: dto.descricao,
      criadoEm: dto.criadoEm,
      atualizadoEm: dto.atualizadoEm
    };
  }
}
