import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CRUD_STYLES } from '../../../../shared/styles/crud-page.styles';
import { Role } from '../../roles/models/role.models';
import { RoleService } from '../../roles/services/role.service';
import { Usuario, CreateUsuarioInput } from '../models/usuario.models';
import { UsuarioService } from '../services/usuario.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../../../core/services/confirm-dialog.service';
import { ApiErrorMapper } from '../../../../../core/api/error-handler/api-error.mapper';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [
    ...CRUD_STYLES,
    `
      .roles-wrap {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .role-chip {
        display: inline-flex;
        align-items: center;
        padding: 2px 8px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 600;
        background: #e5e7eb;
        color: #1f2937;
      }
      .role-picker {
        grid-column: span 3;
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 10px;
        padding: 12px;
        border: 2px solid var(--color-border);
        border-radius: 8px;
      }
      .role-picker label {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0;
        font-size: 13px;
        font-weight: 500;
      }
      .inline-actions {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .btn-mini {
        border: 1px solid var(--color-border);
        background: var(--color-surface);
        border-radius: 8px;
        padding: 6px 10px;
        font-size: 12px;
        cursor: pointer;
      }
      .btn-mini.warn {
        border-color: #f59e0b;
        color: #92400e;
      }
      .btn-mini.danger {
        border-color: #ef4444;
        color: #b91c1c;
      }
    `
  ],
  template: `
    <div class="container-standard">

      <div class="dashboard-header">
        <div>
          <h1>👤 Usuários</h1>
          <p class="subtitle">Administração completa de usuários e permissões</p>
        </div>
        <button class="btn btn-primary" (click)="openForm()">+ Novo Usuário</button>
      </div>

      <ng-container *ngIf="!showForm && !showRolesForm && !showSenhaForm">
        <div class="content-section">
          <div class="toolbar">
            <input class="search" type="text" [(ngModel)]="q" placeholder="🔎 Buscar por nome, email ou role" />
          </div>

          <table class="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Roles</th>
                <th>Status</th>
                <th>Último login</th>
                <th style="width:230px">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="filtered.length === 0">
                <td colspan="6" class="empty-state">Nenhum usuário cadastrado</td>
              </tr>
              <tr *ngFor="let u of filtered">
                <td><strong>{{ u.nomeCompleto }}</strong></td>
                <td>{{ u.email }}</td>
                <td>
                  <div class="roles-wrap" *ngIf="u.roles.length > 0; else semRoles">
                    <span class="role-chip" *ngFor="let role of u.roles">{{ role }}</span>
                  </div>
                  <ng-template #semRoles>—</ng-template>
                </td>
                <td>
                  <span [class]="u.ativo ? 'badge-active' : 'badge-inactive'">
                    {{ u.ativo ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>
                <td>{{ formatDateTime(u.ultimoLoginEm) }}</td>
                <td>
                  <div class="inline-actions">
                    <button class="btn-mini" (click)="openForm(u)">✏️ Editar</button>
                    <button class="btn-mini" (click)="openRoles(u)">🛡️ Roles</button>
                    <button class="btn-mini" (click)="openSenha(u)">🔒 Senha</button>
                    <button
                      class="btn-mini warn"
                      (click)="toggleAtivo(u)"
                    >{{ u.ativo ? 'Inativar' : 'Ativar' }}</button>
                    <button class="btn-mini danger" (click)="remove(u.id)">🗑️</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </ng-container>

      <ng-container *ngIf="showForm">
        <div class="detail-header">
          <h2>{{ editing ? 'Editar Usuário' : 'Novo Usuário' }}</h2>
          <p>{{ editing ? 'Atualize os dados básicos do usuário' : 'Preencha os dados do novo usuário' }}</p>
        </div>
        <div class="card">
          <div class="form-grid">
            <div class="field w2">
              <label>Nome Completo <span class="required">*</span></label>
              <input
                type="text"
                [(ngModel)]="form.nomeCompleto"
                placeholder="Ex: João da Silva"
                [class.err]="showErrors && (!form.nomeCompleto.trim() || hasApiFieldError('nomeCompleto', 'nome', 'name'))"
              />
              <span class="err-msg" *ngIf="showErrors && !form.nomeCompleto.trim()">Nome é obrigatório</span>
              <span class="err-msg" *ngIf="showErrors && hasApiFieldError('nomeCompleto', 'nome', 'name')">{{ firstApiFieldError('nomeCompleto', 'nome', 'name') }}</span>
            </div>
            <div class="field w2">
              <label>E-mail <span class="required">*</span></label>
              <input
                type="email"
                [(ngModel)]="form.email"
                [disabled]="!!editing"
                placeholder="usuario@empresa.com"
                [class.err]="showErrors && (!isEmailValido(form.email) || hasApiFieldError('email', 'userName', 'login'))"
              />
              <span class="err-msg" *ngIf="showErrors && !isEmailValido(form.email)">E-mail inválido</span>
              <span class="err-msg" *ngIf="showErrors && hasApiFieldError('email', 'userName', 'login')">{{ firstApiFieldError('email', 'userName', 'login') }}</span>
            </div>
            <div class="field w2" *ngIf="!editing">
              <label>Senha <span class="required">*</span></label>
              <input
                type="password"
                [(ngModel)]="form.senha"
                placeholder="Mínimo 8 caracteres, maiúscula, minúscula, número e especial"
                [class.err]="showErrors && (!senhaForte(form.senha) || hasApiFieldError('senha', 'password'))"
              />
              <span class="err-msg" *ngIf="showErrors && !senhaForte(form.senha)">
                Senha deve ter 8+ caracteres, maiúscula, minúscula, número e especial
              </span>
              <span class="err-msg" *ngIf="showErrors && hasApiFieldError('senha', 'password')">{{ firstApiFieldError('senha', 'password') }}</span>
            </div>
            <div class="field w2" *ngIf="!editing">
              <label>Role <span class="required">*</span></label>
              <select
                [(ngModel)]="form.roleId"
                [class.err]="showErrors && !form.roleId"
              >
                <option value="">— Selecione uma role —</option>
                <option *ngFor="let r of roles" [value]="r.id">{{ r.nome }}</option>
              </select>
              <span class="err-msg" *ngIf="showErrors && !form.roleId">Role é obrigatória</span>
              <span class="err-msg" *ngIf="showErrors && hasApiFieldError('roleId', 'role')">{{ firstApiFieldError('roleId', 'role') }}</span>
            </div>
          </div>
          <div class="actions">
            <button class="btn btn-primary" (click)="save()">💾 Salvar</button>
            <button class="btn btn-secondary" (click)="cancel()">✖️ Cancelar</button>
          </div>
        </div>
      </ng-container>

      <ng-container *ngIf="showRolesForm && rolesTarget">
        <div class="detail-header">
          <h2>🛡️ Gerenciar Roles</h2>
          <p>{{ rolesTarget.nomeCompleto }} ({{ rolesTarget.email }})</p>
        </div>
        <div class="card">
          <div class="form-grid">
            <div class="field role-picker">
              <label *ngFor="let r of roles">
                <input
                  type="checkbox"
                  [checked]="isRoleSelecionadaEdicao(r.nome)"
                  (change)="toggleRoleEdicao(r.nome, $event)"
                />
                <span>{{ r.nome }}</span>
              </label>
            </div>
          </div>
          <div class="actions">
            <button class="btn btn-primary" (click)="saveRoles()">💾 Salvar Roles</button>
            <button class="btn btn-secondary" (click)="cancelRoles()">✖️ Cancelar</button>
          </div>
        </div>
      </ng-container>

      <ng-container *ngIf="showSenhaForm && senhaTarget">
        <div class="detail-header">
          <h2>🔒 Redefinir Senha</h2>
          <p>{{ senhaTarget.nomeCompleto }} ({{ senhaTarget.email }})</p>
        </div>
        <div class="card">
          <div class="form-grid">
            <div class="field w2">
              <label>Nova Senha <span class="required">*</span></label>
              <input
                type="password"
                [(ngModel)]="novaSenha"
                placeholder="Mínimo 8 caracteres, maiúscula, minúscula, número e especial"
                [class.err]="showErrorsSenha && (!senhaForte(novaSenha) || hasApiFieldError('novaSenha', 'password'))"
              />
              <span class="err-msg" *ngIf="showErrorsSenha && !senhaForte(novaSenha)">
                Senha deve ter 8+ caracteres, maiúscula, minúscula, número e especial
              </span>
              <span class="err-msg" *ngIf="showErrorsSenha && hasApiFieldError('novaSenha', 'password')">{{ firstApiFieldError('novaSenha', 'password') }}</span>
            </div>
          </div>
          <div class="actions">
            <button class="btn btn-primary" (click)="saveSenha()">💾 Redefinir</button>
            <button class="btn btn-secondary" (click)="cancelSenha()">✖️ Cancelar</button>
          </div>
        </div>
      </ng-container>

    </div>
  `
})
export class UsuariosComponent implements OnInit {
  items: Usuario[] = [];
  roles: Role[] = [];
  q = '';

  showForm = false;
  showRolesForm = false;
  showSenhaForm = false;

  showErrors = false;
  showErrorsSenha = false;
  apiFieldErrors: Record<string, string[]> = {};

  editing: Usuario | null = null;
  rolesTarget: Usuario | null = null;
  senhaTarget: Usuario | null = null;

  form = {
    email: '',
    nomeCompleto: '',
    senha: '',
    roleId: ''
  };

  rolesSelecionadasEdicao: string[] = [];
  novaSenha = '';

  constructor(
    private usuarioService: UsuarioService,
    private roleService: RoleService,
    private toast: ToastService,
    private confirmDialog: ConfirmDialogService,) {}

  ngOnInit(): void {
    this.load();
    this.loadRoles();
  }

  load(): void {
    this.items = this.usuarioService.getAll();
    setTimeout(() => {
      this.items = this.usuarioService.getAll();
    }, 200);
  }

  loadRoles(): void {
    this.roles = this.roleService.getAll();
    setTimeout(() => {
      this.roles = this.roleService.getAll();
    }, 200);
  }

  get filtered(): Usuario[] {
    if (!this.q) return this.items;
    const s = this.q.toLowerCase();
    return this.items.filter(u =>
      u.nomeCompleto.toLowerCase().includes(s) ||
      u.email.toLowerCase().includes(s) ||
      u.roles.some(r => r.toLowerCase().includes(s))
    );
  }

  openForm(item?: Usuario): void {
    this.editing = item ?? null;
    this.showErrors = false;
    this.apiFieldErrors = {};
    this.showForm = true;
    this.showRolesForm = false;
    this.showSenhaForm = false;

    this.form = item
      ? {
          email: item.email,
          nomeCompleto: item.nomeCompleto,
          senha: '',
          roleId: ''
        }
      : {
          email: '',
          nomeCompleto: '',
          senha: '',
          roleId: ''
        };
  }

  cancel(): void {
    this.showForm = false;
    this.editing = null;
    this.apiFieldErrors = {};
  }

  save(): void {
    this.showErrors = true;
    this.apiFieldErrors = {};

    if (!this.form.nomeCompleto.trim() || !this.isEmailValido(this.form.email)) return;

    try {
      if (this.editing) {
        const updated: Usuario = {
          ...this.editing,
          nomeCompleto: this.form.nomeCompleto.trim()
        };
        this.usuarioService.update(updated);
        this.toast.success('Usuario atualizado com sucesso.');
      } else {
        if (!this.senhaForte(this.form.senha)) return;
        if (!this.form.roleId) return;

        const payload: CreateUsuarioInput = {
          email: this.form.email,
          nomeCompleto: this.form.nomeCompleto,
          senha: this.form.senha,
          roleId: this.form.roleId
        };
        this.usuarioService.create(payload);
        this.toast.success('Usuario criado com sucesso.');
      }
    } catch (err: any) {
      this.apiFieldErrors = this.collectFieldErrors(err);
      if (!Object.keys(this.apiFieldErrors).length) {
        this.toast.error(err?.message ?? 'Erro ao salvar usuário.');
      }
      return;
    }

    this.cancel();
    this.load();
  }

  openRoles(usuario: Usuario): void {
    this.rolesTarget = usuario;
    this.rolesSelecionadasEdicao = [...usuario.roles];
    this.showRolesForm = true;
    this.showForm = false;
    this.showSenhaForm = false;
  }

  cancelRoles(): void {
    this.showRolesForm = false;
    this.rolesTarget = null;
    this.rolesSelecionadasEdicao = [];
    this.apiFieldErrors = {};
  }

  saveRoles(): void {
    if (!this.rolesTarget) return;

    const roleIds = this.roles
      .filter(r => this.rolesSelecionadasEdicao.includes(r.nome))
      .map(r => r.id);

    this.usuarioService.atribuirRoles(this.rolesTarget.id, roleIds);
    this.cancelRoles();
    this.load();
    this.toast.success('Roles atualizadas com sucesso.');
  }

  openSenha(usuario: Usuario): void {
    this.senhaTarget = usuario;
    this.novaSenha = '';
    this.showErrorsSenha = false;
    this.apiFieldErrors = {};
    this.showSenhaForm = true;
    this.showForm = false;
    this.showRolesForm = false;
  }

  cancelSenha(): void {
    this.showSenhaForm = false;
    this.senhaTarget = null;
    this.novaSenha = '';
    this.showErrorsSenha = false;
    this.apiFieldErrors = {};
  }

  saveSenha(): void {
    this.showErrorsSenha = true;
    this.apiFieldErrors = {};
    if (!this.senhaTarget || !this.senhaForte(this.novaSenha)) return;

    try {
      this.usuarioService.alterarSenhaAdmin(this.senhaTarget.id, this.novaSenha);
    } catch (err: any) {
      this.apiFieldErrors = this.collectFieldErrors(err);
      if (!Object.keys(this.apiFieldErrors).length) {
        this.toast.error(err?.message ?? 'Erro ao redefinir senha.');
      }
      return;
    }

    this.cancelSenha();
    this.load();
    this.toast.success('Senha redefinida com sucesso.');
  }

  async toggleAtivo(usuario: Usuario): Promise<void> {
    const proximo = !usuario.ativo;
    const ok = await this.confirmDialog.confirm({
      title: proximo ? 'Ativar usuario' : 'Inativar usuario',
      message: `Deseja ${proximo ? 'ativar' : 'inativar'} o usuario ${usuario.nomeCompleto}?`,
      confirmText: proximo ? 'Ativar' : 'Inativar',
      cancelText: 'Cancelar',
      danger: !proximo
    });
    if (!ok) return;

    this.usuarioService.setAtivo(usuario.id, proximo);
    this.load();
    this.toast.success(proximo ? 'Usuario ativado com sucesso.' : 'Usuario inativado com sucesso.');
  }

  async remove(id: string): Promise<void> {
    const ok = await this.confirmDialog.confirm({
      title: 'Excluir usuario',
      message: 'Deseja excluir este usuario?',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      danger: true
    });
    if (!ok) return;

    this.usuarioService.remove(id);
    this.load();
    this.toast.success('Usuario removido com sucesso.');
  }

  isEmailValido(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || '').trim());
  }

  senhaForte(senha: string): boolean {
    if (!senha || senha.length < 8) return false;
    if (!/[A-Z]/.test(senha)) return false;
    if (!/[a-z]/.test(senha)) return false;
    if (!/[0-9]/.test(senha)) return false;
    if (!/[^a-zA-Z0-9]/.test(senha)) return false;
    return true;
  }

  isRoleSelecionadaEdicao(roleNome: string): boolean {
    return this.rolesSelecionadasEdicao.includes(roleNome);
  }

  toggleRoleEdicao(roleNome: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.rolesSelecionadasEdicao = [...this.rolesSelecionadasEdicao, roleNome];
      return;
    }
    this.rolesSelecionadasEdicao = this.rolesSelecionadasEdicao.filter(nome => nome !== roleNome);
  }

  formatDateTime(value?: string): string {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return `${date.toLocaleDateString('pt-BR')} ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  }

  hasApiFieldError(...keys: string[]): boolean {
    const normalized = keys.map((key) => key?.toLowerCase?.()).filter(Boolean) as string[];
    return normalized.some((key) => !!this.apiFieldErrors[key]?.length);
  }

  firstApiFieldError(...keys: string[]): string {
    const normalized = keys.map((key) => key?.toLowerCase?.()).filter(Boolean) as string[];
    for (const key of normalized) {
      const first = this.apiFieldErrors[key]?.[0];
      if (first) return first;
    }
    return '';
  }

  private collectFieldErrors(err: any): Record<string, string[]> {
    return ApiErrorMapper.mapError(err).fieldErrors;
  }
}
