import { Component, OnInit } from '@angular/core';
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
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              [(ngModel)]="credentials.email"
              name="email"
              placeholder="Digite seu email"
              [disabled]="!!(authService.loading$ | async)"
              required
              autofocus
            />
          </div>

          <div class="form-group">
            <label for="password">Senha</label>
            <div class="password-field">
              <input
                [type]="showPassword ? 'text' : 'password'"
                id="password"
                [(ngModel)]="credentials.password"
                name="password"
                placeholder="Digite sua senha"
                [disabled]="!!(authService.loading$ | async)"
                required
              />
              <button
                type="button"
                class="btn-toggle-password"
                [disabled]="!!(authService.loading$ | async)"
                (click)="togglePasswordVisibility()"
                [attr.aria-label]="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
                [attr.title]="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
              >
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
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
            [disabled]="!!(authService.loading$ | async) || !credentials.email || !credentials.password"
          >
            <span *ngIf="!(authService.loading$ | async)">Entrar</span>
            <span *ngIf="!!(authService.loading$ | async)">Entrando...</span>
          </button>
        </form>

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
    .form-group input[type="email"],
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
    .form-group input[type="email"]:focus,
    .form-group input[type="password"]:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .password-field {
      position: relative;
    }

    .password-field input {
      padding-right: 48px;
    }

    .btn-toggle-password {
      position: absolute;
      top: 50%;
      right: 10px;
      transform: translateY(-50%);
      border: none;
      background: transparent;
      cursor: pointer;
      font-size: 16px;
      line-height: 1;
      padding: 6px;
      border-radius: 6px;
    }

    .btn-toggle-password:hover:not(:disabled) {
      background: #f3f4f6;
    }

    .btn-toggle-password:disabled {
      opacity: 0.6;
      cursor: not-allowed;
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

  `]
})
export class LoginComponent implements OnInit {
  credentials = {
    email: '',
    password: '',
    remember: false
  };

  showPassword = false;
  errorMessage = '';

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Load remembered credentials if they exist
    this.authService.getRememberedCredentials().subscribe(remembered => {
      if (remembered) {
        this.credentials.email = remembered.email || '';
        this.credentials.password = remembered.password || '';
        this.credentials.remember = remembered.remember || false;
      }
    });
  }

  onSubmit(): void {
    this.errorMessage = '';

    this.authService.login(this.credentials).subscribe(success => {
      if (success) {
        this.router.navigateByUrl('/');
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
