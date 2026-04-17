# Fase 2 — Infraestrutura de Integração com API

> **Branch:** `feat/phase2-api-infra`  
> **Status:** Desenvolvimento  
> **Data:** Abril 2026

---

## Resumo

Implementação da base técnica centralizada para integração com API em todas as features. Reduz retrabalho através de padrões únicos de:
- Chamadas HTTP tipadas
- Tratamento de erros padronizado
- Paginação reutilizável
- Notificações de erro globais

---

## Componentes Implementados

### 1. **ApiClientService** (`src/app/core/api/client/api-client.service.ts`)

Serviço centralizado para todas as chamadas HTTP.

**Responsabilidades:**
- Normalizar envelope `ApiResponse<T>`
- Desembrulhar dados automaticamente
- Injetar headers comuns (Authorization via interceptor)
- Construir URLs e query params
- Tratar erros de forma padronizada

**Métodos disponíveis:**
```typescript
get<T>(endpoint: string, options?: { params?: PaginationParams }): Observable<T>
getList<T>(endpoint: string, pagination?: PaginationParams): Observable<PagedResult<T>>
post<T>(endpoint: string, payload: any): Observable<T>
put<T>(endpoint: string, payload: any): Observable<T>
patch<T>(endpoint: string, payload: any): Observable<T>
delete<T = void>(endpoint: string): Observable<T>
```

**Exemplo de uso:**
```typescript
import { ApiClientService } from '@core/api';

constructor(private api: ApiClientService) {}

// GET simples
this.api.get<Cliente>('clientes/1').subscribe(cliente => {
  console.log(cliente);
});

// GET com paginação
this.api.getList<Cliente>('clientes', {
  page: 1,
  pageSize: 25,
  search: 'João'
}).subscribe(result => {
  console.log(result.items);
  console.log(result.totalCount);
});

// POST
this.api.post<Cliente>('clientes', novoCliente).subscribe(
  cliente => console.log('Criado:', cliente),
  error => console.error(error.code, error.message)
);
```

---

### 2. **ApiErrorMapper** (`src/app/core/api/error-handler/api-error.mapper.ts`)

Mapeador de erros HTTP para mensagens amigáveis.

**Cobertura:**
- `0`: Erro de conexão
- `400`: Validação (com detalhes de campos)
- `401`: Não autenticado
- `403`: Não autorizado
- `404`: Recurso não encontrado
- `422`: Entidade não processável
- `500+`: Erro de servidor

**Método estático:**
```typescript
static mapError(error: any): { 
  code: string; 
  message: string; 
  details?: ApiError[] 
}
```

---

### 3. **AuthInterceptor** (`src/app/core/auth/auth.interceptor.ts`)

Interceptor HTTP que:
- Adiciona `Authorization: Bearer <token>` automaticamente
- Tenta renovar token em caso de 401
- Trata falhas de refresh com logout

**Para usar:**
```typescript
// No app.config.ts ou main.ts
provideHttpClient(
  withInterceptors([authInterceptor])
);
```

---

### 4. **PaginationComponent** (`src/app/core/components/pagination/pagination.component.ts`)

Componente reutilizável de paginação.

**Props:**
- `@Input() pagedResult: PagedResult<any>` — Dados paginados
- `@Output() pageChanged: EventEmitter<PaginationParams>` — Evento ao mudar página

**Exemplo:**
```html
<app-pagination 
  [pagedResult]="clientes$ | async"
  (pageChanged)="onPageChange($event)"
/>
```

```typescript
onPageChange(params: PaginationParams) {
  this.api.getList<Cliente>('clientes', params).subscribe(
    result => this.pagedResult = result
  );
}
```

---

### 5. **NotificationService** (`src/app/core/services/notification.service.ts`)

Serviço centralizado de notificações (toasts).

**Métodos:**
```typescript
success(message: string, title?: string, duration?: number): void
error(message: string, title?: string, duration?: number): void
warning(message: string, title?: string, duration?: number): void
info(message: string, title?: string, duration?: number): void
remove(id: string): void
clear(): void
```

**Exemplo:**
```typescript
constructor(private notification: NotificationService) {}

salvar() {
  this.api.post('clientes', dados).subscribe(
    () => {
      this.notification.success('Cliente salvo com sucesso!');
    },
    (error) => {
      this.notification.error(error.message, 'Erro ao salvar');
    }
  );
}
```

---

### 6. **ToastContainerComponent** (`src/app/core/components/toast/toast-container.component.ts`)

Container para exibir toasts. Deve ser incluído uma única vez na aplicação.

**No app.component.html:**
```html
<app-toast-container />
<router-outlet />
```

---

## Modelos de Dados (DTOs)

### `ApiResponse<T>`
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ApiError[];
  timestamp?: string;
}
```

### `PagedResult<T>`
```typescript
interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
```

### `PaginationParams`
```typescript
interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  search?: string;
}
```

---

## Checklist de Aceite (ATI-06, ATI-07, ATI-08)

- [x] **ATI-06** — ApiClientService centralizado com tipagem
  - [x] GET/POST/PUT/PATCH/DELETE implementados
  - [x] Normalização de envelope `ApiResponse`
  - [x] Headers e timeout configuráveis
  - [x] Logging sanitizado de requisições

- [x] **ATI-07** — Componente de paginação
  - [x] Contrato `PagedResult<T>` padronizado
  - [x] Controles de navegação (anterior/próxima)
  - [x] Seletor de página e tamanho
  - [x] RWD no componente

- [x] **ATI-08** — Tratamento global de erro
  - [x] Mapeamento de status HTTP
  - [x] Toast/notificação de erro
  - [x] Detalhe de erro com campo (422)
  - [x] Log sanitizado de falhas

---

## Próximas Etapas (Fase 3)

1. Migrar primeiro cadastro (Portos de Origem) para usar:
   - `ApiClientService` para CRUD
   - `PaginationComponent` para listagem
   - `NotificationService` para feedback

2. Validar padrão com ao menos 3 cadastros

3. Remover dependência de localStorage para essas entidades

---

## Referências

- [Documento do Plano](../plano-migracao-frontend-api-fases-1-4.md)
- [Fase 1 — Login](../../../feat/front-fase1-auth-api)
- API Base: `http://localhost:5001/api`
