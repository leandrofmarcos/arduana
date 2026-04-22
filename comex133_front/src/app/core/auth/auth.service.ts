import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type UserRole = 'admin' | 'cliente' | 'despachante' | 'maritimo';

export interface User {
  id: string;
  username: string;
  role: UserRole;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private users = [
    { id: '1', username: 'admin', password: 'admin123', role: 'admin' as UserRole },
    { id: '2', username: 'cliente', password: 'cliente123', role: 'cliente' as UserRole },
    { id: '3', username: 'despachante', password: 'desp123', role: 'despachante' as UserRole },
    { id: '4', username: 'maritimo', password: 'mar123', role: 'maritimo' as UserRole }
  ];

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  constructor(){
    const ls = (globalThis as any).localStorage as Storage | undefined;
    const ss = (globalThis as any).sessionStorage as Storage | undefined;
    const rawUser = ls?.getItem(this.userKey) ?? ss?.getItem(this.userKey);
    if(rawUser){ try{ const u = JSON.parse(rawUser) as User; this.currentUserSubject.next(u); } catch{} }
  }

  isLoggedIn(): boolean { return !!this.currentUserSubject.value; }

  login(username: string, password: string, remember = true): boolean {
    const found = this.users.find(u => u.username === username && (u as any).password === password);
    if (!found) return false;
    const user: User = { id: found.id, username: found.username, role: found.role };
    this.currentUserSubject.next(user);
    const token = `fake-jwt-${found.id}-${Date.now()}`;
    try {
      const storage = remember ? (globalThis as any).localStorage as Storage : (globalThis as any).sessionStorage as Storage;
      storage?.setItem(this.tokenKey, token);
      storage?.setItem(this.userKey, JSON.stringify(user));
    } catch {}
    return true;
  }

  logout(): void {
    this.currentUserSubject.next(null);
    try{
      (globalThis as any).localStorage?.removeItem(this.tokenKey);
      (globalThis as any).localStorage?.removeItem(this.userKey);
      (globalThis as any).sessionStorage?.removeItem(this.tokenKey);
      (globalThis as any).sessionStorage?.removeItem(this.userKey);
    }catch{}
  }

  getToken(): string | null {
    try {
      return (globalThis as any).localStorage?.getItem(this.tokenKey) ?? (globalThis as any).sessionStorage?.getItem(this.tokenKey) ?? null;
    } catch { return null; }
  }
}