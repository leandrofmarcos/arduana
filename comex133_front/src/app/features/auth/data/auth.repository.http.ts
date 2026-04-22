import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable, catchError, map, of, switchMap } from 'rxjs';
import { AuthRepository } from '../domain/auth.repository';
import { AuthSession, AuthToken, Credentials, User } from '../domain/auth.models';

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{ field?: string; message?: string }>;
  statusCode?: number;
}

interface LoginApiResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  usuario: {
    id: number;
    email: string;
    nomeCompleto: string;
    roles: string[];
  };
}

interface RefreshApiResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

interface MeApiResponse {
  id: number;
  email: string;
  nomeCompleto: string;
  roles: string[];
}

@Injectable()
export class AuthRepositoryHttp extends AuthRepository {
  private readonly baseUrl = `${environment.apiUrl}/auth`;
  private readonly sessionStorageKey = 'auth_session';
  private readonly rememberedCredentialsKey = 'auth_remembered_credentials';

  constructor(private readonly http: HttpClient) {
    super();
  }

  private getLocalStorage(): Storage | null {
    try {
      return (globalThis as any).localStorage as Storage;
    } catch {
      return null;
    }
  }

  private getSessionStorage(): Storage | null {
    try {
      return (globalThis as any).sessionStorage as Storage;
    } catch {
      return null;
    }
  }

  authenticate(credentials: Credentials): Observable<AuthSession | null> {
    const email = (credentials.email ?? credentials.username ?? '').trim().toLowerCase();

    return this.http.post<ApiEnvelope<LoginApiResponse>>(`${this.baseUrl}/login`, {
      email,
      senha: credentials.password
    }).pipe(
      map(response => {
        if (!response.success || !response.data) {
          return null;
        }

        const session = this.mapLoginToSession(response.data);
        this.persistSession(session, credentials.remember === true);
        return session;
      }),
      catchError(() => of(null))
    );
  }

  getCurrentSession(): Observable<AuthSession | null> {
    const raw = this.readStoredSession();
    if (!raw) {
      return of(null);
    }

    const expiresAt = new Date(raw.expiresAt);
    if (Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()) {
      this.clearSessionStorage();
      return of(null);
    }

    return of(raw);
  }

  saveSession(session: AuthSession): Observable<void> {
    this.persistSession(session, true);
    return of(void 0);
  }

  clearSession(refreshToken?: string): Observable<void> {
    const token = refreshToken?.trim();
    if (!token) {
      this.clearSessionStorage();
      return of(void 0);
    }

    return this.http.post<ApiEnvelope<unknown>>(`${this.baseUrl}/logout`, {
      refreshToken: token
    }).pipe(
      map(() => void 0),
      catchError(() => of(void 0)),
      map(() => {
        this.clearSessionStorage();
        return void 0;
      })
    );
  }

  refreshToken(refreshToken: string): Observable<AuthSession | null> {
    const { session: current, fromLocalStorage } = this.readStoredSessionWithSource();
    if (!current) {
      return of(null);
    }

    return this.http.post<ApiEnvelope<RefreshApiResponse>>(`${this.baseUrl}/refresh`, {
      refreshToken
    }).pipe(
      switchMap(response => {
        if (!response.success || !response.data) {
          this.clearSessionStorage();
          return of(null);
        }

        const refreshData = response.data;

        const nextToken = this.mapToken(refreshData.accessToken, refreshData.refreshToken, refreshData.expiresAt);

        return this.http.get<ApiEnvelope<MeApiResponse>>(`${this.baseUrl}/me`).pipe(
          map(meResponse => {
            if (!meResponse.success || !meResponse.data) {
              this.clearSessionStorage();
              return null;
            }

            const user = this.mapUser(meResponse.data);
            const issuedAt = new Date();
            const session: AuthSession = {
              user,
              token: nextToken,
              issuedAt,
              expiresAt: new Date(refreshData.expiresAt)
            };

            this.persistSession(session, fromLocalStorage);
            return session;
          }),
          catchError(() => {
            this.clearSessionStorage();
            return of(null);
          })
        );
      }),
      catchError(() => {
        this.clearSessionStorage();
        return of(null);
      })
    );
  }

  hasPermission(user: User, permission: string): boolean {
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
      this.getLocalStorage()?.setItem(this.rememberedCredentialsKey, JSON.stringify({
        email: credentials.email,
        password: credentials.password,
        username: credentials.username,
        remember: true
      }));
    } catch {
      // Ignora erros de armazenamento local.
    }

    return of(void 0);
  }

  getRememberedCredentials(): Observable<Partial<Credentials> | null> {
    try {
      const raw = this.getLocalStorage()?.getItem(this.rememberedCredentialsKey) ?? null;
      if (!raw) {
        return of(null);
      }

      const parsed = JSON.parse(raw) as Partial<Credentials>;
      return of(parsed);
    } catch {
      return of(null);
    }
  }

  clearRememberedCredentials(): Observable<void> {
    try {
      this.getLocalStorage()?.removeItem(this.rememberedCredentialsKey);
    } catch {
      // Ignora erros de armazenamento local.
    }

    return of(void 0);
  }

  private mapLoginToSession(data: LoginApiResponse): AuthSession {
    const issuedAt = new Date();
    return {
      user: this.mapUser(data.usuario),
      token: this.mapToken(data.accessToken, data.refreshToken, data.expiresAt),
      issuedAt,
      expiresAt: new Date(data.expiresAt)
    };
  }

  private mapUser(usuario: LoginApiResponse['usuario'] | MeApiResponse): User {
    const isAdmin = (usuario.roles ?? []).some(role =>
      role.toLowerCase() === 'admin' || role.toLowerCase() === 'administrador'
    );

    return {
      id: String(usuario.id),
      username: usuario.nomeCompleto,
      email: usuario.email,
      role: isAdmin ? 'admin' : 'cliente',
      permissions: isAdmin ? ['admin:all'] : ['orcamento:read']
    };
  }

  private mapToken(accessToken: string, refreshToken: string, expiresAt: string): AuthToken {
    const expiration = new Date(expiresAt).getTime();
    const now = Date.now();
    const expiresIn = Math.max(1, Math.floor((expiration - now) / 1000));

    return {
      accessToken,
      refreshToken,
      expiresIn,
      tokenType: 'Bearer'
    };
  }

  private persistSession(session: AuthSession, remember: boolean): void {
    try {
      const rawSession = JSON.stringify(session);
      const local = this.getLocalStorage();
      const sessionStorageRef = this.getSessionStorage();

      if (remember) {
        local?.setItem(this.sessionStorageKey, rawSession);
        sessionStorageRef?.removeItem(this.sessionStorageKey);
      } else {
        sessionStorageRef?.setItem(this.sessionStorageKey, rawSession);
        local?.removeItem(this.sessionStorageKey);
      }
    } catch {
      // Ignora erros de armazenamento em sessão.
    }
  }

  private readStoredSessionWithSource(): { session: AuthSession | null; fromLocalStorage: boolean } {
    const localStorageRef = this.getLocalStorage();
    if (localStorageRef) {
      const local = this.readSessionFromStorage(localStorageRef);
      if (local) {
        return { session: local, fromLocalStorage: true };
      }
    }

    const sessionStorageRef = this.getSessionStorage();
    if (sessionStorageRef) {
      const session = this.readSessionFromStorage(sessionStorageRef);
      if (session) {
        return { session, fromLocalStorage: false };
      }
    }

    return { session: null, fromLocalStorage: false };
  }

  private readStoredSession(): AuthSession | null {
    return this.readStoredSessionWithSource().session;
  }

  private readSessionFromStorage(storage: Storage): AuthSession | null {
    try {
      const raw = storage.getItem(this.sessionStorageKey);
      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw) as AuthSession;
      return {
        ...parsed,
        issuedAt: new Date(parsed.issuedAt),
        expiresAt: new Date(parsed.expiresAt)
      };
    } catch {
      return null;
    }
  }

  private clearSessionStorage(): void {
    try {
      this.getLocalStorage()?.removeItem(this.sessionStorageKey);
      this.getSessionStorage()?.removeItem(this.sessionStorageKey);
    } catch {
      // Ignora erros de armazenamento em sessão.
    }
  }
}
