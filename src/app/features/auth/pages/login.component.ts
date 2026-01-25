import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>🛳️ Arduana</h1>
          <p>Sistema de Gestão de Importação</p>
        </div>

        <form (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label for="username">Usuário</label>
            <input
              type="text"
              id="username"
              [(ngModel)]="credentials.username"
              name="username"
              placeholder="Digite seu usuário"
              [disabled]="!!(authService.loading$ | async)"
              required
              autofocus
            />
          </div>

          <div class="form-group">
            <label for="password">Senha</label>
            <input
              type="password"
              id="password"
              [(ngModel)]="credentials.password"
              name="password"
              placeholder="Digite sua senha"
              [disabled]="!!(authService.loading$ | async)"
              required
            />
          </div>

          <div class="form-group checkbox">
            <label>
              <input
                type="checkbox"
                [(ngModel)]="credentials.remember"
                name="remember"
                [disabled]="!!(authService.loading$ | async)"
              />
              <span>Lembrar-me</span>
            </label>
          </div>

          <div class="error-message" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>

          <button
            type="submit"
            class="btn-login"
            [disabled]="!!(authService.loading$ | async) || !credentials.username || !credentials.password"
          >
            <span *ngIf="!(authService.loading$ | async)">Entrar</span>
            <span *ngIf="!!(authService.loading$ | async)">Entrando...</span>
          </button>
        </form>

        <div class="login-footer">
          <div class="demo-credentials">
            <strong>Credenciais de demonstração:</strong>
            <div class="credential-item">
              <span class="role-badge admin">Admin</span>
              <code>admin / admin</code>
            </div>
            <div class="credential-item">
              <span class="role-badge cliente">Cliente</span>
              <code>cliente / cliente123</code>
            </div>
            <div class="credential-item">
              <span class="role-badge despachante">Despachante</span>
              <code>despachante / desp123</code>
            </div>
            <div class="credential-item">
              <span class="role-badge maritimo">Marítimo</span>
              <code>maritimo / mar123</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .login-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      width: 100%;
      max-width: 440px;
      overflow: hidden;
    }

    .login-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 32px 24px;
      text-align: center;
    }

    .login-header h1 {
      margin: 0 0 8px 0;
      font-size: 32px;
      font-weight: 800;
    }

    .login-header p {
      margin: 0;
      opacity: 0.95;
      font-size: 14px;
    }

    .login-form {
      padding: 32px 24px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #374151;
      font-size: 14px;
    }

    .form-group input[type="text"],
    .form-group input[type="password"] {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 14px;
      transition: all 0.2s;
      box-sizing: border-box;
    }

    .form-group input[type="text"]:focus,
    .form-group input[type="password"]:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-group input:disabled {
      background: #f3f4f6;
      cursor: not-allowed;
    }

    .form-group.checkbox {
      margin-bottom: 24px;
    }

    .form-group.checkbox label {
      display: flex;
      align-items: center;
      cursor: pointer;
      font-weight: 400;
    }

    .form-group.checkbox input[type="checkbox"] {
      margin: 0 8px 0 0;
      width: 18px;
      height: 18px;
      cursor: pointer;
    }

    .error-message {
      background: #fef2f2;
      color: #dc2626;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      font-size: 14px;
      border: 1px solid #fecaca;
    }

    .btn-login {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-login:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-login:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .login-footer {
      background: #f9fafb;
      padding: 24px;
      border-top: 1px solid #e5e7eb;
    }

    .demo-credentials {
      font-size: 13px;
    }

    .demo-credentials strong {
      display: block;
      margin-bottom: 12px;
      color: #374151;
    }

    .credential-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }

    .role-badge {
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      min-width: 90px;
      text-align: center;
    }

    .role-badge.admin {
      background: #fef3c7;
      color: #92400e;
    }

    .role-badge.cliente {
      background: #dbeafe;
      color: #1e40af;
    }

    .role-badge.despachante {
      background: #dcfce7;
      color: #166534;
    }

    .role-badge.maritimo {
      background: #e0e7ff;
      color: #3730a3;
    }

    .credential-item code {
      background: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      color: #4b5563;
      border: 1px solid #e5e7eb;
    }
  `]
})
export class LoginComponent {
  credentials = {
    username: '',
    password: '',
    remember: true
  };

  errorMessage = '';

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.errorMessage = '';

    this.authService.login(this.credentials).subscribe(success => {
      if (success) {
        this.router.navigateByUrl('/');
      } else {
        this.errorMessage = 'Usuário ou senha inválidos. Verifique suas credenciais e tente novamente.';
      }
    });
  }
}
