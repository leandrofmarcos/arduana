import { Injectable } from '@angular/core';
import { ApiClientService } from '../../../../../core/api/client/api-client.service';
import { CreateUsuarioInput, Usuario } from '../models/usuario.models';

interface UsuarioApiDto {
  id: number;
  email: string;
  nomeCompleto: string;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
  ultimoLoginEm?: string;
  roles: string[];
}

interface CreateUsuarioRequest {
  email: string;
  nomeCompleto: string;
  senha: string;
  roleId: number;
}

interface UpdateUsuarioRequest {
  nomeCompleto: string;
}

interface AtivoRequest {
  ativo: boolean;
}

interface AtribuirRolesRequest {
  roleIds: number[];
}

interface AlterarSenhaAdminRequest {
  novaSenha: string;
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly endpoint = 'usuarios';
  private readonly items: Usuario[] = [];
  private loaded = false;

  constructor(private apiClient: ApiClientService) {
    this.refresh();
  }

  getAll(): Usuario[] {
    this.ensureLoaded();
    return [...this.items].sort((a, b) => a.nomeCompleto.localeCompare(b.nomeCompleto));
  }

  getById(id: string): Usuario | undefined {
    this.ensureLoaded();
    return this.items.find(u => u.id === id);
  }

  create(data: CreateUsuarioInput): void {
    const payload: CreateUsuarioRequest = {
      email: data.email.trim().toLowerCase(),
      nomeCompleto: data.nomeCompleto.trim(),
      senha: data.senha,
      roleId: Number(data.roleId)
    };

    this.apiClient.post<UsuarioApiDto>(this.endpoint, payload).subscribe({
      next: () => this.refresh()
    });
  }

  update(item: Usuario): void {
    const id = Number(item.id);
    const payload: UpdateUsuarioRequest = {
      nomeCompleto: item.nomeCompleto.trim()
    };

    this.apiClient.put<UsuarioApiDto>(`${this.endpoint}/${id}`, payload).subscribe({
      next: () => this.refresh()
    });
  }

  setAtivo(id: string, ativo: boolean): void {
    const usuarioId = Number(id);
    const payload: AtivoRequest = { ativo };

    this.apiClient.patch<void>(`${this.endpoint}/${usuarioId}/ativo`, payload).subscribe({
      next: () => this.refresh()
    });
  }

  atribuirRoles(id: string, roleIds: string[]): void {
    const usuarioId = Number(id);
    const payload: AtribuirRolesRequest = {
      roleIds: roleIds.map(r => Number(r))
    };

    this.apiClient.put<UsuarioApiDto>(`${this.endpoint}/${usuarioId}/roles`, payload).subscribe({
      next: () => this.refresh()
    });
  }

  alterarSenhaAdmin(id: string, novaSenha: string): void {
    const usuarioId = Number(id);
    const payload: AlterarSenhaAdminRequest = { novaSenha };

    this.apiClient.patch<void>(`${this.endpoint}/${usuarioId}/senha`, payload).subscribe({
      next: () => this.refresh()
    });
  }

  remove(id: string): void {
    const usuarioId = Number(id);
    this.apiClient.delete(`${this.endpoint}/${usuarioId}`).subscribe({
      next: () => this.refresh()
    });
  }

  private refresh(): void {
    this.apiClient.getList<UsuarioApiDto>(this.endpoint, { page: 1, pageSize: 200 }).subscribe({
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

  private mapDto(dto: UsuarioApiDto): Usuario {
    return {
      id: dto.id.toString(),
      email: dto.email,
      nomeCompleto: dto.nomeCompleto,
      ativo: dto.ativo,
      criadoEm: dto.criadoEm,
      atualizadoEm: dto.atualizadoEm,
      ultimoLoginEm: dto.ultimoLoginEm,
      roles: dto.roles ?? []
    };
  }
}
