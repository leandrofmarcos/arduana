import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AuthRepository } from '../domain/auth.repository';
import { User, Credentials, AuthSession, AuthToken, ROLE_PERMISSIONS, UserRole } from '../domain/auth.models';

interface StoredUser {
  id: string;
  username: string;
  password: string;
  email?: string;
  role: UserRole;
}

/**
 * Local storage implementation of AuthRepository
 * Simulates authentication with fake users and JWT tokens
 */
@Injectable()
export class AuthRepositoryLocal extends AuthRepository {
  private readonly SESSION_KEY = 'auth_session';
  private readonly USERS_KEY = 'auth_users';
  private readonly REMEMBERED_CREDENTIALS_KEY = 'auth_remembered_credentials';
  
  // Fake users database
  private readonly DEFAULT_USERS: StoredUser[] = [
    {
      id: '1',
      username: 'admin',
      password: 'admin',
      email: 'admin@arduana.com',
      role: 'admin'
    },
    {
      id: '2',
      username: 'cliente',
      password: 'cliente123',
      email: 'cliente@example.com',
      role: 'cliente'
    },
    {
      id: '3',
      username: 'despachante',
      password: 'desp123',
      email: 'despachante@example.com',
      role: 'despachante'
    },
    {
      id: '4',
      username: 'maritimo',
      password: 'mar123',
      email: 'maritimo@example.com',
      role: 'maritimo'
    }
  ];

  constructor() {
    super();
    this.initializeUsers();
  }

  private initializeUsers(): void {
    const ls = this.getStorage();
    if (!ls) return;
    
    const existing = ls.getItem(this.USERS_KEY);
    if (!existing) {
      ls.setItem(this.USERS_KEY, JSON.stringify(this.DEFAULT_USERS));
    }
  }

  private getStorage(): Storage | null {
    try {
      return (globalThis as any).localStorage as Storage;
    } catch {
      return null;
    }
  }

  private getUsers(): StoredUser[] {
    const ls = this.getStorage();
    if (!ls) return this.DEFAULT_USERS;
    
    try {
      const raw = ls.getItem(this.USERS_KEY);
      return raw ? JSON.parse(raw) : this.DEFAULT_USERS;
    } catch {
      return this.DEFAULT_USERS;
    }
  }

  private generateFakeJWT(user: User): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      permissions: user.permissions,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };
    
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    const signature = btoa(`fake-signature-${user.id}-${Date.now()}`);
    
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  private createUser(storedUser: StoredUser): User {
    const permissions = ROLE_PERMISSIONS[storedUser.role] || [];
    return {
      id: storedUser.id,
      username: storedUser.username,
      email: storedUser.email,
      role: storedUser.role,
      permissions,
      createdAt: new Date(),
      lastLogin: new Date()
    };
  }

  authenticate(credentials: Credentials): Observable<AuthSession | null> {
    const users = this.getUsers();
    const found = users.find(
      u => u.username === credentials.username && u.password === credentials.password
    );

    if (!found) {
      return of(null);
    }

    const user = this.createUser(found);
    const now = new Date();
    const expiresIn = 24 * 60 * 60 * 1000; // 24 hours in ms
    const expiresAt = new Date(now.getTime() + expiresIn);

    const token: AuthToken = {
      accessToken: this.generateFakeJWT(user),
      refreshToken: `refresh-${user.id}-${Date.now()}`,
      expiresIn: expiresIn / 1000, // seconds
      tokenType: 'Bearer'
    };

    const session: AuthSession = {
      user,
      token,
      issuedAt: now,
      expiresAt
    };

    // Save to storage based on remember flag
    this.saveSessionToStorage(session, credentials.remember ?? false);

    return of(session);
  }

  getCurrentSession(): Observable<AuthSession | null> {
    const ls = this.getStorage();
    if (!ls) return of(null);

    try {
      // Try localStorage first (remember me)
      let raw = ls.getItem(this.SESSION_KEY);
      
      // Try sessionStorage if not in localStorage
      if (!raw) {
        const ss = (globalThis as any).sessionStorage as Storage;
        raw = ss?.getItem(this.SESSION_KEY) || null;
      }

      if (!raw) return of(null);

      const session: AuthSession = JSON.parse(raw);
      
      // Check if session expired
      const expiresAt = new Date(session.expiresAt);
      if (expiresAt < new Date()) {
        this.clearSession();
        return of(null);
      }

      return of(session);
    } catch {
      return of(null);
    }
  }

  saveSession(session: AuthSession): Observable<void> {
    this.saveSessionToStorage(session, true);
    return of(void 0);
  }

  private saveSessionToStorage(session: AuthSession, remember: boolean): void {
    try {
      const storage = remember 
        ? (globalThis as any).localStorage as Storage
        : (globalThis as any).sessionStorage as Storage;
      
      if (storage) {
        storage.setItem(this.SESSION_KEY, JSON.stringify(session));
        const oppositeStorage = remember
          ? (globalThis as any).sessionStorage as Storage
          : (globalThis as any).localStorage as Storage;
        oppositeStorage?.removeItem(this.SESSION_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  }

  clearSession(_refreshToken?: string): Observable<void> {
    try {
      const ls = (globalThis as any).localStorage as Storage;
      const ss = (globalThis as any).sessionStorage as Storage;
      ls?.removeItem(this.SESSION_KEY);
      ss?.removeItem(this.SESSION_KEY);
    } catch {
      // Ignore errors
    }
    return of(void 0);
  }

  refreshToken(refreshToken: string): Observable<AuthSession | null> {
    // In a real app, this would validate the refresh token and issue a new access token
    // For now, just return the current session
    return this.getCurrentSession();
  }

  hasPermission(user: User, permission: string): boolean {
    // Admin has all permissions
    if (user.permissions.includes('admin:all')) {
      return true;
    }
    
    return user.permissions.includes(permission as any);
  }

  hasAnyPermission(user: User, permissions: string[]): boolean {
    return permissions.some(p => this.hasPermission(user, p));
  }

  hasAllPermissions(user: User, permissions: string[]): boolean {
    return permissions.every(p => this.hasPermission(user, p));
  }

  saveRememberedCredentials(credentials: Partial<Credentials>): Observable<void> {
    try {
      const ls = (globalThis as any).localStorage as Storage;
      if (ls && credentials.email) {
        ls.setItem(this.REMEMBERED_CREDENTIALS_KEY, JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          username: credentials.username,
          remember: true
        }));
      }
    } catch {
      // Ignore storage errors
    }
    return of(void 0);
  }

  getRememberedCredentials(): Observable<Partial<Credentials> | null> {
    try {
      const ls = (globalThis as any).localStorage as Storage;
      if (!ls) return of(null);

      const raw = ls.getItem(this.REMEMBERED_CREDENTIALS_KEY);
      if (!raw) return of(null);

      const remembered = JSON.parse(raw);
      return of(remembered);
    } catch {
      return of(null);
    }
  }

  clearRememberedCredentials(): Observable<void> {
    try {
      const ls = (globalThis as any).localStorage as Storage;
      if (ls) {
        ls.removeItem(this.REMEMBERED_CREDENTIALS_KEY);
      }
    } catch {
      // Ignore errors
    }
    return of(void 0);
  }
}
