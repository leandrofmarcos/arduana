# Auth Feature

Feature completa de autenticação e autorização seguindo padrão DDD feature-first.

## 📁 Estrutura

```
auth/
├── domain/              # Modelos e contratos de domínio
│   ├── auth.models.ts   # User, Credentials, AuthSession, Permission
│   └── auth.repository.ts # Contrato abstrato do repositório
├── data/                # Implementações de acesso a dados
│   └── auth.repository.local.ts # Implementação localStorage com fake JWT
├── services/            # Serviços de domínio
│   └── auth.service.ts  # Serviço principal de autenticação
├── guards/              # Route guards
│   ├── auth.guard.ts    # authGuard, guestGuard
│   └── permission.guard.ts # permissionGuard, roleGuard, adminGuard
├── interceptors/        # HTTP interceptors
│   └── auth.interceptor.ts # Adiciona Bearer token aos requests
├── pages/               # Componentes de páginas
│   └── login.component.ts # Tela de login
├── auth.providers.ts    # Configuração de providers
└── index.ts            # Public API
```

## 🔑 Credenciais de Demonstração

| Usuário | Senha | Role | Permissões |
|---------|-------|------|------------|
| admin | admin | admin | Todas (admin:all) |
| cliente | cliente123 | cliente | Leitura de orçamentos, packlist, custo, venda |
| despachante | desp123 | despachante | Leitura/escrita de orçamento, packlist, custo, aduana |
| maritimo | mar123 | maritimo | Leitura de orçamento, packlist, numerário |

## 🚀 Uso

### Login

```typescript
import { AuthService } from './features/auth';

constructor(private authService: AuthService) {}

login() {
  this.authService.login({
    username: 'admin',
    password: 'admin',
    remember: true
  }).subscribe(success => {
    if (success) {
      // Login bem-sucedido
    }
  });
}
```

### Logout

```typescript
logout() {
  this.authService.logout().subscribe(() => {
    // Logout bem-sucedido
  });
}
```

### Verificar Autenticação

```typescript
// Sync
const isAuth = this.authService.isAuthenticated;
const user = this.authService.currentUser;

// Observable
this.authService.currentUser$.subscribe(user => {
  console.log('Current user:', user);
});
```

### Verificar Permissões

```typescript
// Permissão específica
if (this.authService.hasPermission('custo:write')) {
  // Pode editar custos
}

// Qualquer permissão
if (this.authService.hasAnyPermission(['custo:read', 'venda:read'])) {
  // Tem pelo menos uma das permissões
}

// Todas as permissões
if (this.authService.hasAllPermissions(['custo:write', 'venda:write'])) {
  // Tem todas as permissões
}

// Verificar role
if (this.authService.hasRole('admin')) {
  // É admin
}

// Verificar admin (atalho)
if (this.authService.isAdmin()) {
  // É admin
}
```

### Route Guards

```typescript
import { Routes } from '@angular/router';
import { authGuard, guestGuard, permissionGuard, roleGuard, adminGuard } from './features/auth';

const routes: Routes = [
  // Apenas não autenticados (ex: login)
  {
    path: 'login',
    canActivate: [guestGuard],
    component: LoginComponent
  },
  
  // Apenas autenticados
  {
    path: 'dashboard',
    canActivate: [authGuard],
    component: DashboardComponent
  },
  
  // Requer permissão específica
  {
    path: 'custo',
    canActivate: [permissionGuard(['custo:write'])],
    component: CustoComponent
  },
  
  // Requer qualquer permissão
  {
    path: 'reports',
    canActivate: [permissionGuard(['custo:read', 'venda:read'], 'any')],
    component: ReportsComponent
  },
  
  // Requer todas as permissões
  {
    path: 'admin-panel',
    canActivate: [permissionGuard(['custo:write', 'venda:write'], 'all')],
    component: AdminPanelComponent
  },
  
  // Requer role específica
  {
    path: 'admin',
    canActivate: [roleGuard('admin')],
    component: AdminComponent
  },
  
  // Apenas admin (atalho)
  {
    path: 'settings',
    canActivate: [adminGuard],
    component: SettingsComponent
  }
];
```

### HTTP Interceptor

O interceptor é configurado automaticamente e adiciona o token JWT a todos os requests HTTP:

```typescript
// app.config.ts
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './features/auth';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    // ...
  ]
};
```

### Template Guards

```html
<!-- Mostrar apenas se autenticado -->
<div *ngIf="authService.isAuthenticated">
  Bem-vindo, {{ (authService.currentUser$ | async)?.username }}
</div>

<!-- Mostrar apenas se tem permissão -->
<button *ngIf="authService.hasPermission('custo:write')">
  Editar Custo
</button>

<!-- Mostrar apenas se é admin -->
<div *ngIf="authService.isAdmin()">
  Painel de Administração
</div>
```

## 🏗️ Arquitetura

### Domain Layer
- **Models**: Entidades de domínio (User, AuthSession, Permission)
- **Repository**: Contrato abstrato para acesso a dados

### Data Layer
- **AuthRepositoryLocal**: Implementação fake com localStorage e JWT simulado
- Pode ser facilmente substituído por implementação HTTP real

### Service Layer
- **AuthService**: Gerencia estado de autenticação e operações
- Usa Observables e BehaviorSubject para estado reativo

### Guards & Interceptors
- **Guards**: Proteção de rotas baseada em autenticação, permissões e roles
- **Interceptor**: Adiciona automaticamente token JWT aos requests

## 🔒 Sistema de Permissões

Permissões granulares por recurso:
- `resource:read` - Leitura
- `resource:write` - Escrita/Edição
- `resource:delete` - Exclusão
- `admin:all` - Acesso total (role admin)

Recursos disponíveis:
- orcamento, packlist, custo, venda, aduana
- numerario, fechamento, historico
- clientes, despachantes, portos, aliquotas

## 🎯 JWT Fake

O JWT fake gerado contém:
- Header: `{ alg: 'HS256', typ: 'JWT' }`
- Payload: `{ sub, username, role, permissions, iat, exp }`
- Signature: Base64 fake signature
- Formato: `header.payload.signature`

Pode ser facilmente substituído por JWT real de API backend.

## 🔄 Próximos Passos

Para integrar com API real:
1. Criar `AuthRepositoryHttp` extends `AuthRepository`
2. Implementar chamadas HTTP reais
3. Atualizar provider em `auth.providers.ts`
4. JWT real será retornado pela API

```typescript
// Trocar implementação
{
  provide: AuthRepository,
  useClass: AuthRepositoryHttp // ao invés de AuthRepositoryLocal
}
```
