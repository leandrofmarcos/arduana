import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { AuthRepository } from '../domain/auth.repository';
import { User, Credentials, AuthSession, Permission } from '../domain/auth.models';

/**
 * Authentication Service
 * Manages user authentication state and provides auth operations
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private repository = inject(AuthRepository);
  
  private sessionSubject = new BehaviorSubject<AuthSession | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  /**
   * Current authenticated session (null if not authenticated)
   */
  readonly session$ = this.sessionSubject.asObservable();

  /**
   * Current authenticated user (null if not authenticated)
   */
  readonly currentUser$ = this.session$.pipe(
    map(session => session?.user ?? null)
  );

  /**
   * Loading state for async operations
   */
  readonly loading$ = this.loadingSubject.asObservable();

  /**
   * Sync getter for current user
   */
  get currentUser(): User | null {
    return this.sessionSubject.value?.user ?? null;
  }

  /**
   * Sync getter for current session
   */
  get currentSession(): AuthSession | null {
    return this.sessionSubject.value;
  }

  /**
   * Check if user is currently authenticated
   */
  get isAuthenticated(): boolean {
    return !!this.sessionSubject.value;
  }

  /**
   * Get current access token
   */
  get accessToken(): string | null {
    return this.sessionSubject.value?.token.accessToken ?? null;
  }

  constructor() {
    this.restoreSession();
  }

  /**
   * Restore session from storage on app initialization
   */
  private restoreSession(): void {
    this.repository.getCurrentSession()
      .subscribe(session => {
        if (session) {
          this.sessionSubject.next(session);
        }
      });
  }

  /**
   * Authenticate user with credentials
   */
  login(credentials: Credentials): Observable<boolean> {
    this.loadingSubject.next(true);
    
    return this.repository.authenticate(credentials).pipe(
      tap(session => {
        this.sessionSubject.next(session);
        this.loadingSubject.next(false);
      }),
      map(session => !!session)
    );
  }

  /**
   * Logout current user and clear session
   */
  logout(): Observable<void> {
    return this.repository.clearSession().pipe(
      tap(() => {
        this.sessionSubject.next(null);
      })
    );
  }

  /**
   * Refresh access token
   */
  refreshToken(): Observable<boolean> {
    const refreshToken = this.sessionSubject.value?.token.refreshToken;
    if (!refreshToken) {
      return new Observable(observer => {
        observer.next(false);
        observer.complete();
      });
    }

    return this.repository.refreshToken(refreshToken).pipe(
      tap(session => {
        if (session) {
          this.sessionSubject.next(session);
        }
      }),
      map(session => !!session)
    );
  }

  /**
   * Check if current user has specific permission
   */
  hasPermission(permission: Permission | string): boolean {
    const user = this.currentUser;
    if (!user) return false;
    return this.repository.hasPermission(user, permission);
  }

  /**
   * Check if current user has any of the specified permissions
   */
  hasAnyPermission(permissions: (Permission | string)[]): boolean {
    const user = this.currentUser;
    if (!user) return false;
    return this.repository.hasAnyPermission(user, permissions);
  }

  /**
   * Check if current user has all specified permissions
   */
  hasAllPermissions(permissions: (Permission | string)[]): boolean {
    const user = this.currentUser;
    if (!user) return false;
    return this.repository.hasAllPermissions(user, permissions);
  }

  /**
   * Check if current user is admin
   */
  isAdmin(): boolean {
    return this.hasPermission('admin:all');
  }

  /**
   * Check if current user has specific role
   */
  hasRole(role: string): boolean {
    return this.currentUser?.role === role;
  }
}
