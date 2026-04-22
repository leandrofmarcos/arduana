import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

interface NotificationMessage {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

@Component({
  standalone: true,
  selector: 'app-profile',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-container">
      <div class="profile-card">
        <div class="card-section">
          <h2>👤 Informações do Perfil</h2>
          <div class="info-grid">
            <div class="info-item">
              <label>Usuário</label>
              <span class="info-value">{{ currentUser?.username }}</span>
            </div>
            <div class="info-item">
              <label>Email</label>
              <span class="info-value">{{ currentUser?.email || '-' }}</span>
            </div>
            <div class="info-item">
              <label>Papel</label>
              <span class="info-value role-badge" [ngClass]="'role-' + currentUser?.role">{{ currentUser?.role | uppercase }}</span>
            </div>
            <div class="info-item">
              <label>ID do Usuário</label>
              <span class="info-value">{{ currentUser?.id }}</span>
            </div>
          </div>
        </div>

        <div class="card-divider"></div>

        <div class="card-section">
          <h2>🔐 Trocar Senha</h2>
          
          <form (ngSubmit)="onChangePassword()" class="password-form">
            <div class="form-group">
              <label for="currentPassword">Senha Atual *</label>
              <input
                type="password"
                id="currentPassword"
                [(ngModel)]="passwordForm.currentPassword"
                name="currentPassword"
                placeholder="Digite sua senha atual"
                [disabled]="isLoading"
                required
              />
            </div>

            <div class="form-group">
              <label for="newPassword">Nova Senha *</label>
              <input
                type="password"
                id="newPassword"
                [(ngModel)]="passwordForm.newPassword"
                name="newPassword"
                placeholder="Digite a nova senha"
                [disabled]="isLoading"
                required
              />
            </div>

            <div class="form-group">
              <label for="confirmPassword">Confirmar Nova Senha *</label>
              <input
                type="password"
                id="confirmPassword"
                [(ngModel)]="passwordForm.confirmPassword"
                name="confirmPassword"
                placeholder="Confirme a nova senha"
                [disabled]="isLoading"
                required
              />
            </div>

            <div class="error-message" *ngIf="errorMessage">
              ⚠️ {{ errorMessage }}
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="isLoading || !isPasswordFormValid()">
                <span *ngIf="!isLoading">Alterar Senha</span>
                <span *ngIf="isLoading">Processando...</span>
              </button>
              <button type="button" class="btn btn-secondary" (click)="resetPasswordForm()" [disabled]="isLoading">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Notificação Toast -->
      <div class="toast-container" *ngIf="notification">
        <div class="toast" [ngClass]="'toast-' + notification.type">
          <span class="toast-icon">{{ getNotificationIcon(notification.type) }}</span>
          <span class="toast-message">{{ notification.message }}</span>
          <button class="toast-close" (click)="closeNotification()">✕</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 0 16px;
    }

    .profile-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .card-section {
      padding: 32px;
    }

    .card-section h2 {
      margin: 0 0 24px 0;
      font-size: 18px;
      color: var(--color-text);
      font-weight: 600;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .info-item label {
      font-size: 12px;
      font-weight: 600;
      color: var(--color-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-value {
      font-size: 15px;
      color: var(--color-text);
      font-weight: 500;
    }

    .role-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      width: fit-content;
    }

    .role-admin {
      background: #fef3c7;
      color: #92400e;
    }

    .role-cliente {
      background: #dbeafe;
      color: #1e40af;
    }

    .role-despachante {
      background: #dcfce7;
      color: #166534;
    }

    .role-maritimo {
      background: #e0e7ff;
      color: #3730a3;
    }

    .card-divider {
      height: 1px;
      background: var(--color-border);
      margin: 0;
    }

    .password-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-group label {
      font-size: 14px;
      font-weight: 600;
      color: var(--color-text);
    }

    .form-group input {
      padding: 12px 16px;
      border: 2px solid var(--color-border);
      border-radius: 8px;
      font-size: 14px;
      transition: all 0.2s;
      box-sizing: border-box;
    }

    .form-group input:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-group input:disabled {
      background: var(--color-bg);
      cursor: not-allowed;
      opacity: 0.6;
    }

    .error-message {
      background: #fef2f2;
      color: #dc2626;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      border: 1px solid #fecaca;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 12px;
    }

    .btn {
      padding: 12px 20px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      flex: 1;
    }

    .btn-primary {
      background: var(--gradient-primary);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: var(--color-bg);
      color: var(--color-text);
      border: 2px solid var(--color-border);
    }

    .btn-secondary:hover:not(:disabled) {
      background: var(--color-border);
    }

    .btn-secondary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Toast Notifications */
    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      border-radius: 8px;
      min-width: 300px;
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
      animation: slideOut 0.3s ease-out 3s forwards;
    }

    .toast-icon {
      font-size: 18px;
      flex-shrink: 0;
    }

    .toast-message {
      flex: 1;
      font-size: 14px;
      font-weight: 500;
    }

    .toast-close {
      background: none;
      border: none;
      color: inherit;
      font-size: 18px;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.7;
      transition: opacity 0.2s;
    }

    .toast-close:hover {
      opacity: 1;
    }

    .toast-success {
      background: #f0fdf4;
      color: #166534;
      border: 1px solid #dcfce7;
    }

    .toast-error {
      background: #fef2f2;
      color: #b91c1c;
      border: 1px solid #fecaca;
    }

    .toast-warning {
      background: #fffbeb;
      color: #92400e;
      border: 1px solid #fef3c7;
    }

    .toast-info {
      background: #f0f9ff;
      color: #1e40af;
      border: 1px solid #bfdbfe;
    }

    @media (max-width: 600px) {
      .profile-container {
        padding: 0;
      }

      .card-section {
        padding: 20px;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }

      .toast-container {
        left: 12px;
        right: 12px;
      }

      .toast {
        min-width: unset;
      }
    }
  `]
})
export class ProfileComponent {
  currentUser: any = null;
  isLoading = false;
  errorMessage = '';
  notification: NotificationMessage | null = null;

  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser = this.authService.currentUser;
  }

  isPasswordFormValid(): boolean {
    const { currentPassword, newPassword, confirmPassword } = this.passwordForm;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      return false;
    }

    if (newPassword !== confirmPassword) {
      return false;
    }

    if (newPassword.length < 6) {
      return false;
    }

    return true;
  }

  onChangePassword(): void {
    this.errorMessage = '';

    // Validações
    if (!this.isPasswordFormValid()) {
      this.errorMessage = 'Verifique os campos. As senhas devem ter no mínimo 6 caracteres e ser iguais.';
      return;
    }

    if (this.passwordForm.currentPassword === this.passwordForm.newPassword) {
      this.errorMessage = 'A nova senha deve ser diferente da senha atual.';
      return;
    }

    // Simula requisição
    this.isLoading = true;

    // Simula delay de 1.5 segundos
    setTimeout(() => {
      this.isLoading = false;
      
      // Simula sucesso (fake)
      this.showNotification({
        type: 'success',
        message: 'Senha alterada com sucesso! Você será desconectado em breve.',
        duration: 4000
      });

      // Limpa formulário
      this.resetPasswordForm();

      // Simula logout após 2 segundos
      setTimeout(() => {
        this.authService.logout().subscribe(() => {
          this.router.navigateByUrl('/login');
        });
      }, 2000);
    }, 1500);
  }

  resetPasswordForm(): void {
    this.passwordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    this.errorMessage = '';
  }

  showNotification(notification: NotificationMessage): void {
    this.notification = notification;

    if (notification.duration) {
      setTimeout(() => {
        this.notification = null;
      }, notification.duration);
    }
  }

  closeNotification(): void {
    this.notification = null;
  }

  getNotificationIcon(type: string): string {
    const icons: Record<string, string> = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type] || '•';
  }
}
