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

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  login(username: string, password: string): boolean {
    const found = this.users.find(u => u.username === username && (u as any).password === password);
    if (!found) return false;
    const user: User = { id: found.id, username: found.username, role: found.role };
    this.currentUserSubject.next(user);
    return true;
  }

  logout(): void {
    this.currentUserSubject.next(null);
  }
}