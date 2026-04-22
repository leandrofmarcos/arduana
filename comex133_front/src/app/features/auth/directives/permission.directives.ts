import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Permission } from '../domain/auth.models';

/**
 * Structural directive to show/hide elements based on permissions
 * 
 * @example
 * <button *hasPermission="'custo:write'">Editar Custo</button>
 * <div *hasPermission="['custo:read', 'venda:read']; mode: 'any'">...</div>
 * <div *hasPermission="['custo:write', 'venda:write']; mode: 'all'">...</div>
 */
@Directive({
  standalone: true,
  selector: '[hasPermission]'
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private permissions: (Permission | string)[] = [];
  private mode: 'any' | 'all' = 'any';
  private hasView = false;

  @Input() 
  set hasPermission(value: Permission | string | (Permission | string)[]) {
    this.permissions = Array.isArray(value) ? value : [value];
    this.updateView();
  }

  @Input()
  set hasPermissionMode(value: 'any' | 'all') {
    this.mode = value;
    this.updateView();
  }

  constructor(
    private authService: AuthService,
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {}

  ngOnInit(): void {
    // Subscribe to auth changes to update view reactively
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateView());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateView(): void {
    const hasPermission = this.mode === 'all'
      ? this.authService.hasAllPermissions(this.permissions)
      : this.authService.hasAnyPermission(this.permissions);

    if (hasPermission && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasPermission && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}

/**
 * Structural directive to show/hide elements based on role
 * 
 * @example
 * <div *hasRole="'admin'">Admin Panel</div>
 */
@Directive({
  standalone: true,
  selector: '[hasRole]'
})
export class HasRoleDirective implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private role = '';
  private hasView = false;

  @Input() 
  set hasRole(value: string) {
    this.role = value;
    this.updateView();
  }

  constructor(
    private authService: AuthService,
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateView());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateView(): void {
    const hasRole = this.authService.hasRole(this.role);

    if (hasRole && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasRole && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}

/**
 * Structural directive to show/hide elements only for authenticated users
 * 
 * @example
 * <div *isAuthenticated>Welcome back!</div>
 */
@Directive({
  standalone: true,
  selector: '[isAuthenticated]'
})
export class IsAuthenticatedDirective implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private hasView = false;

  constructor(
    private authService: AuthService,
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateView());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateView(): void {
    const isAuth = this.authService.isAuthenticated;

    if (isAuth && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!isAuth && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
