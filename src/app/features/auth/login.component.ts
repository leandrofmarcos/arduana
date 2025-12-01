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
        <h1>Login</h1>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <label>Usuário</label>
          <input type="text" formControlName="username" />
          <label>Senha</label>
          <input type="password" formControlName="password" />
          <button type="submit">Entrar</button>
          <div class="error" *ngIf="error">Credenciais inválidas</div>
        </form>
      </div>
    </div>
  `,
  styles: [
    `.login-container{display:flex;align-items:center;justify-content:center;height:100vh;background:#f3f4f6}`,
    `.login-card{width:360px;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:24px;box-shadow:0 10px 30px rgba(0,0,0,.06)}`,
    `h1{margin:0 0 16px 0;font-size:22px;color:#111827}`,
    `label{display:block;margin:12px 0 6px;color:#374151;font-weight:600}`,
    `input{width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:8px}`,
    `button{width:100%;margin-top:16px;padding:10px 12px;background:#2563eb;color:#fff;border:none;border-radius:8px;font-weight:700}`,
    `.error{margin-top:10px;color:#b91c1c}`
  ]
})
export class LoginComponent {
  form: any;
  error = false;
  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({ username: ['', Validators.required], password: ['', Validators.required] });
  }
  submit(){
    const { username, password } = this.form.value;
    if (!username || !password) return;
    const ok = this.auth.login(username, password);
    this.error = !ok;
    if (ok) this.router.navigate(['/']);
  }
}