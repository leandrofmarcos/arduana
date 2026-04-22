import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="brand">Importação</div>
        <h1>Bem-vindo</h1>
        <p class="subtitle">Acesse sua conta para continuar</p>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="field">
            <label>Usuário</label>
            <input type="text" formControlName="username" placeholder="Digite seu usuário" />
            <div class="field-error" *ngIf="form.get('username')?.touched && form.get('username')?.invalid">Informe o usuário</div>
          </div>
          <div class="field">
            <label>Senha</label>
            <input type="password" formControlName="password" placeholder="Digite sua senha" />
            <div class="field-error" *ngIf="form.get('password')?.touched && form.get('password')?.invalid">Informe a senha</div>
          </div>
          <div class="form-row">
            <label class="remember"><input type="checkbox" formControlName="remember" /> Manter conectado</label>
            <a class="link" href="#">Esqueci minha senha</a>
          </div>
          <button class="btn btn-primary" type="submit">Entrar</button>
          <div class="error" *ngIf="error">Credenciais inválidas</div>
        </form>
      </div>
    </div>
  `,
  styles: [
    `.login-container{display:flex;align-items:center;justify-content:center;height:100vh;background:var(--color-bg);padding:24px}`,
    `.login-card{width:380px;background:var(--color-surface);border:1px solid var(--color-border);border-radius:14px;padding:28px;box-shadow:0 10px 30px rgba(17,24,39,.12)}`,
    `.brand{font-weight:800;color:var(--color-primary-ink);margin-bottom:6px}`,
    `h1{margin:0;font-size:22px;color:var(--color-text)}`,
    `.subtitle{margin:4px 0 18px 0;color:var(--color-muted)}`,
    `.field{margin-bottom:12px}`,
    `.field label{display:block;margin:0 0 6px 0;color:var(--color-muted);font-weight:600;font-size:13px}`,
    `.field input{width:100%;padding:12px 14px;border:2px solid var(--color-border);border-radius:10px;background:var(--color-surface)}`,
    `.field input:focus{outline:none;border-color:var(--color-primary);box-shadow:0 0 0 4px rgba(102,126,234,.12)}`,
    `.field-error{margin-top:6px;color:var(--color-danger);font-size:12px}`,
    `.form-row{display:flex;align-items:center;justify-content:space-between;margin:10px 0 18px}`,
    `.remember{color:var(--color-text);font-size:13px}`,
    `.link{color:var(--color-primary);text-decoration:none;font-weight:700}`,
    `.btn{width:100%;padding:12px 14px;border:none;border-radius:10px;cursor:pointer;font-weight:800}`,
    `.btn-primary{background:var(--gradient-primary);color:#fff}`,
    `.error{margin-top:12px;color:var(--color-danger)}`
  ]
})
export class LoginComponent {
  form: any;
  error = false;
  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({ username: ['admin', Validators.required], password: ['admin123', Validators.required], remember: [true] });
  }
  submit(){
    const { username, password, remember } = this.form.value;
    if (!username || !password) return;
    const ok = this.auth.login(username, password, !!remember);
    this.error = !ok;
    if (ok) this.router.navigate(['/']);
  }
}