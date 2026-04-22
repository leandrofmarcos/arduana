# Roadmap — Progressive Web Application (comex133_front + comex133_api)

> **Branch de trabalho:** `feat/responsividade-pwa`  
> **Início:** 22/04/2026  
> **Base:** branch `feat/responsividade-layout` (responsividade 100% concluída)  
> **Meta:** Transformar o comex133_front em PWA instalável com suporte a Push Notifications segmentadas por usuário/role, área de notificações no app e notificações desktop nativas (sem exigir PWA instalado).  
> **Política de commit:** commit por fase com mensagem padronizada.

---

## Índice

1. [Contexto e Decisões de Arquitetura](#1-contexto-e-decisões-de-arquitetura)
2. [Pré-requisitos e Diagnóstico](#2-pré-requisitos-e-diagnóstico)
3. [Plano de Fases](#3-plano-de-fases)
4. [Progresso por Fase](#4-progresso-por-fase)
5. [Log de Commits](#5-log-de-commits)
6. [Checklist de Conclusão](#6-checklist-de-conclusão)

---

## 1. Contexto e Decisões de Arquitetura

### O que é PWA neste contexto

Um PWA (Progressive Web App) adiciona três capacidades sobre a SPA Angular existente:

| Capacidade | Mecanismo | Benefício imediato |
|---|---|---|
| **Instalável** | `manifest.webmanifest` | Ícone na tela inicial, sem app store |
| **Cache / offline** | Service Worker (`ngsw`) | Assets e chamadas GET em cache |
| **Push Notifications** | Web Push API + VAPID | Alertas de embarque, aprovação, free time |

### Stack técnica

| Camada | Tecnologia | Status |
|---|---|---|
| Frontend | Angular 18.2 + `@angular/service-worker` | ✅ Instalado |
| Backend | .NET 8 + `WebPush` (NuGet) | ✅ Instalado |
| Protocolo Push | Web Push / VAPID (RFC 8292) | ✅ Chaves geradas |
| Chaves VAPID | Salvas em `appsettings.Development.json` + environments | ✅ |
| Notifications API (Desktop) | API nativa do browser | ⬜ Fase 7 |

### Fluxo resumido de Push Notification

```
1. Browser solicita permissão ao usuário
2. Browser gera PushSubscription (endpoint + keys) com userId associado
3. Frontend envia a subscription para a API (POST /api/push/subscribe)
4. API salva a subscription em memória com userId e roles do usuário
5. Tela de teste dispara POST /api/push/send (targetType: all | user | role, message)
6. API filtra subscriptions pelo alvo e envia via WebPush + VAPID
7. Service Worker recebe o evento 'push' e exibe a notificação nativa do SO
8. Frontend recebe o push via swPush.messages$ e exibe no painel de notificações
```

### Escopo do backend (mínimo para teste)

O backend terá **apenas dois endpoints temporários**, sem banco de dados:

- `POST /api/push/subscribe` — recebe e armazena a `PushSubscription` em memória
- `POST /api/push/send-test` — dispara uma notificação de teste para todas as subscriptions em memória

Não há persistência, roles, multi-usuário nem integração com eventos reais nesta fase. O objetivo é **validar o fluxo técnico completo**.

> **Fases 1-4 concluídas.** O backend foi expandido na Fase 6 para suportar targeting por usuário/role e mensagem customizável.

---

## 2. Pré-requisitos e Diagnóstico

### Frontend (comex133_front)

| Item | Estado |
|---|---|
| Angular 18.2.14 | ✅ |
| `@angular/service-worker` | ✅ Instalado (Fase 1) |
| `manifest.webmanifest` | ✅ Configurado (Fase 1) |
| `ngsw-config.json` | ✅ Configurado (Fase 1) |
| HTTPS em produção | ✅ (obrigatório para Service Worker) |
| `angular.json` com `"serviceWorker": true` | ✅ Configurado (Fase 1) |
| `PushNotificationService` | ✅ Criado (Fase 2) |
| VAPID public key nos environments | ✅ Preenchida (Fase 3) |

### Backend (comex133_api)

| Item | Estado |
|---|---|
| .NET 8 ASP.NET Core | ✅ |
| `WebPush` NuGet (`WebPush` by Manuel Blanquett) | ✅ Instalado (Fase 3) |
| Chaves VAPID geradas | ✅ Salvas em `appsettings.Development.json` (Fase 3) |
| `PushController` com `/subscribe` e `/send-test` | ✅ Criado (Fase 3) |
| Targeting por usuário/role | ⬜ Fase 6 |
| CORS configurado para push endpoints | ✅ Herdado da configuração existente |

---

## 3. Plano de Fases

---

### FASE 1 — Instalação do Service Worker Angular ✅ CONCLUÍDA

**Commit:** `9751df2` — `feat(pwa): instalar service worker e manifest`

`ng add @angular/pwa` executado. Gerados: `manifest.webmanifest` (nome, cores, start_url `/v2/dashboard`), `ngsw-config.json` (cache prefetch de assets), ícones 72-512px. `provideServiceWorker` com `enabled: !isDevMode()`. Build de produção limpo.

---

### FASE 2 — Serviço de Push no Frontend ✅ CONCLUÍDA

**Commit:** `ec4bf3f` — `feat(pwa): push notification service e subscribe flow`

`PushNotificationService` criado em `src/app/v2/core/services/`. Métodos: `requestAndSubscribe()`, `sendTestNotification()`, listener de clique, guards de suporte. VAPID public key preenchida nos dois environments.

---

### FASE 3 — Backend: Endpoint de Push (mínimo para teste) ✅ CONCLUÍDA

**Commit:** `2baadc8` — `feat(api): push notification controller para teste`

`WebPush` NuGet instalado. Chaves VAPID geradas via `web-push generate-vapid-keys`. `PushController` com `POST /api/push/subscribe` e `POST /api/push/send-test`. Subscriptions em memória (`ConcurrentBag`). Builds .NET e Angular limpos.

---

### FASE 4 — Tela de Teste no Frontend ✅ CONCLUÍDA

**Commit:** `7acb52f` — `feat(pwa): tela de teste push notification em administracao`

`PushTestComponent` em `/admin/push-test`, protegido por `adminGuard`. Link "🔔 Teste Push" no menu de Administração. Exibe status de permissão, SW ativo, suporte ao browser. Botões Ativar e Enviar com log em tempo real e tratamento de erros.

---

### FASE 5 — Validação Cross-browser e Ajustes Finais

**Objetivo:** Garantir que o PWA e push funcionam nos principais browsers.  
**Commit esperado:** `fix(pwa): ajustes cross-browser e documentacao`  
**Pré-requisito:** Deploy em produção (HTTPS obrigatório para Service Worker)

**Atividades:**

- [ ] 5.1 — Testar no **Chrome Desktop** (Windows): instalar PWA, receber push
- [ ] 5.2 — Testar no **Chrome Android**: instalar PWA, receber push
- [ ] 5.3 — Testar no **Edge Desktop**: instalar PWA, receber push
- [ ] 5.4 — Testar no **Firefox Desktop**: receber push (não instalável como PWA)
- [ ] 5.5 — Testar no **Safari iOS 16.4+**: instalar como PWA (Add to Home Screen), receber push
- [ ] 5.6 — Verificar que o SW não quebra o hot-reload em desenvolvimento (`enabled: false` em dev)
- [ ] 5.7 — Build de produção limpo, sem warnings de SW

**Critério de aceite:**
- Push funcional em Chrome Desktop e Chrome Android (mínimo)
- Sem regressão no build de produção
- SW não interfere no ambiente de desenvolvimento

---

### FASE 6 — Push Notification Avançada: Targeting + Área de Notificações

**Objetivo:** Evoluir a tela de teste para permitir envio segmentado (todos / por usuário / por role) com mensagem customizável, e adicionar uma área de notificações persistente no shell da aplicação.  
**Commit esperado (backend):** `feat(api): push targeting por usuario e role com mensagem customizavel`  
**Commit esperado (frontend):** `feat(pwa): push avancado com targeting e painel de notificacoes`

#### 6.A — Backend

- [ ] 6.A.1 — Expandir `PushSubscriptionDto` para incluir `UserId` e `UserEmail`:
  ```csharp
  public record PushSubscriptionDto(
      string Endpoint,
      PushKeysDto Keys,
      string UserId,
      string UserEmail
  );
  ```
  > O `UserId` e `UserEmail` serão lidos do JWT no endpoint `/subscribe`, não do body.  
  > Usar `User.FindFirstValue(ClaimTypes.NameIdentifier)` e `ClaimTypes.Email`.

- [ ] 6.A.2 — Expandir `POST /api/push/subscribe` para extrair usuário do token JWT e associar à subscription:
  ```csharp
  [Authorize]
  [HttpPost("subscribe")]
  public IActionResult Subscribe([FromBody] PushSubscriptionPayload payload)
  {
      var userId    = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
      var userEmail = User.FindFirstValue(ClaimTypes.Email)!;
      _subscriptions[userId] = new StoredSubscription(payload, userId, userEmail);
      return Ok();
  }
  ```

- [ ] 6.A.3 — Criar `POST /api/push/send` (substitui `/send-test`) com body estruturado:
  ```json
  {
    "targetType": "all" | "user" | "role",
    "targetId": "userId-ou-roleName",
    "title": "Comex 133",
    "message": "Dados atualizados!"
  }
  ```
  Lógica de filtragem:
  - `"all"` → envia para todas as subscriptions
  - `"user"` → filtra por `UserId == targetId`
  - `"role"` → consulta `AppDbContext.UserRoles` para obter os `userId` da role e filtra

- [ ] 6.A.4 — Criar `GET /api/push/subscriptions` — retorna lista simplificada de usuários com subscription ativa `{ userId, userEmail }` para popular o select no frontend

- [ ] 6.A.5 — Criar DTOs auxiliares em `Features/Push/`:
  - `SendPushRequest.cs` — body do `/send`
  - `SubscriptionUserDto.cs` — resposta do `/subscriptions`

- [ ] 6.A.6 — Testar via Swagger os três modos de envio antes de integrar

**Critério de aceite (backend):**
- `POST /api/push/send` com `targetType: "all"` envia para todos
- `POST /api/push/send` com `targetType: "user"` envia só para o userId
- `POST /api/push/send` com `targetType: "role"` envia só para usuários da role
- `GET /api/push/subscriptions` retorna lista de usuários com subscription

#### 6.B — Frontend: Tela de Teste Avançada

- [ ] 6.B.1 — Reescrever `push-test.component.ts` com:

  **Seção de envio:**
  ```
  ┌──────────────────────────────────────────────────────┐
  │ 🔔 Enviar Push Notification                          │
  │                                                      │
  │ Título:     [ Comex 133            ]                 │
  │ Mensagem:   [ Dados atualizados!   ]                 │
  │                                                      │
  │ Destinatário:  ○ Todos  ○ Usuário  ○ Role            │
  │ Selecionar:  [ dropdown de users/roles ]             │
  │                                                      │
  │          [🚀 Enviar Notificação]                     │
  └──────────────────────────────────────────────────────┘
  ```

- [ ] 6.B.2 — Carregar lista de usuários com subscription ativa via `GET /api/push/subscriptions`

- [ ] 6.B.3 — Carregar lista de roles via serviço já existente (`RoleService`) para popular o dropdown de roles

- [ ] 6.B.4 — Atualizar `PushNotificationService.sendTestNotification()` → renomear para `sendNotification(request: SendPushRequest)` e chamar o novo endpoint `/api/push/send`

- [ ] 6.B.5 — Manter seção de status de permissão e log de resultados da tela existente

#### 6.C — Frontend: Painel de Notificações no Shell

- [ ] 6.C.1 — Criar `NotificationPanelComponent` em `src/app/v2/core/notifications/`:
  - Singleton com `providedIn: 'root'`
  - Escuta `swPush.messages` (mensagens recebidas enquanto o app está aberto)
  - Mantém lista reativa de notificações com `signal<Notification[]>`

- [ ] 6.C.2 — Modelo de notificação:
  ```typescript
  interface AppNotification {
    id: string;
    title: string;
    body: string;
    receivedAt: Date;
    read: boolean;
  }
  ```

- [ ] 6.C.3 — Integrar no `shell-v2.component.ts`:
  - Ícone 🔔 no header com badge de contador de não-lidas
  - Clique no ícone abre/fecha painel lateral
  - Painel lista as notificações com timestamp e botão "Marcar como lida"
  - Botão "Limpar tudo"

- [ ] 6.C.4 — Estilizar o painel responsivamente (drawer lateral em desktop, sheet em mobile)

**Critério de aceite (frontend):**
- Tela de teste com campos de título, mensagem e destinatário funcional
- Dropdown de usuários carrega da API
- Dropdown de roles carrega via RoleService
- Painel de notificações aparece no shell com contador
- Push recebido enquanto app está aberto aparece no painel
- Push recebido com app fechado exibe notificação nativa do SO

---

### FASE 7 — Notificações Desktop Nativas (sem PWA)

**Objetivo:** Adicionar suporte a notificações nativas do browser para usuários de desktop que não instalaram o PWA, usando a Notifications API diretamente (sem Service Worker). Funciona em qualquer aba aberta do browser.  
**Commit esperado:** `feat(pwa): desktop notifications service e integracao no shell`

#### Por que uma abordagem separada?

| Mecanismo | Requer SW | Requer HTTPS | Funciona com app fechado | Browsers |
|---|---|---|---|---|
| Web Push (Fases 1-6) | ✅ Sim | ✅ Sim | ✅ Sim | Chrome, Edge, Firefox, Safari iOS 16.4+ |
| Notifications API (Fase 7) | ❌ Não | ❌ Não (apenas localhost) | ❌ Não | Chrome, Edge, Firefox, Safari |

A Notifications API é ideal para alertas em tempo real **enquanto o usuário está com o app aberto** em qualquer aba, sem depender de PWA instalado.

#### Atividades

- [ ] 7.1 — Criar `DesktopNotificationService` em `src/app/v2/core/services/`:
  ```typescript
  @Injectable({ providedIn: 'root' })
  export class DesktopNotificationService {
    readonly isSupported = 'Notification' in window;

    get permission(): NotificationPermission {
      return this.isSupported ? Notification.permission : 'denied';
    }

    async requestPermission(): Promise<NotificationPermission> {
      if (!this.isSupported) return 'denied';
      return Notification.requestPermission();
    }

    notify(title: string, options?: NotificationOptions): void {
      if (!this.isSupported || Notification.permission !== 'granted') return;
      const n = new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        ...options
      });
      n.onclick = () => { window.focus(); n.close(); };
    }
  }
  ```

- [ ] 7.2 — Integrar `DesktopNotificationService` no `PushNotificationService`:
  - Quando `swPush.isEnabled` é `false` (desenvolvimento ou browser sem SW), usar `DesktopNotificationService` como fallback para notificações locais

- [ ] 7.3 — Adicionar seção **"Notificações Desktop"** na tela de teste (`/admin/push-test`):
  ```
  ┌──────────────────────────────────────────────────────┐
  │ 💻 Notificações Desktop (sem PWA)                   │
  │                                                      │
  │ Status: ● Concedida / ○ Não solicitada / ✕ Negada   │
  │                                                      │
  │ [Ativar Notificações Desktop]                       │
  │ [Disparar Notificação Local de Teste]               │
  └──────────────────────────────────────────────────────┘
  ```
  O botão "Disparar Notificação Local" chama `DesktopNotificationService.notify()` diretamente, sem passar pela API.

- [ ] 7.4 — Integrar no `NotificationPanelComponent` (criado na Fase 6):
  - Quando o app recebe uma notificação via `DesktopNotificationService`, também adicionar ao painel interno (para rastreabilidade)

- [ ] 7.5 — Documentar no `README.md` do frontend a diferença entre os dois mecanismos e quando cada um é ativado

**Critério de aceite:**
- `DesktopNotificationService.notify()` exibe notificação nativa em Chrome/Edge sem SW ativo
- Funciona no ambiente de desenvolvimento (`ng serve`) sem HTTPS
- Seção na tela de teste com status de permissão desktop separado do SW
- Ao clicar na notificação, o app ganha foco
- Notificação desktop também aparece no painel interno do shell

---

## 4. Progresso por Fase

| Fase | Nome | % Completo | Início | Término | Decisão |
|---|---|---|---|---|---|
| 1 | Service Worker + Manifest | 100% | 22/04/2026 | 22/04/2026 | commit `9751df2` |
| 2 | Push Service (Frontend) | 100% | 22/04/2026 | 22/04/2026 | commit `ec4bf3f` |
| 3 | Push Controller (Backend) | 100% | 22/04/2026 | 22/04/2026 | commit `2baadc8` |
| 4 | Tela de Teste | 100% | 22/04/2026 | 22/04/2026 | commit `7acb52f` |
| 5 | Validação Cross-browser | 0% | — | — | aguardando deploy |
| 6 | Push Avançado + Painel de Notificações | 0% | — | — | aguardando início |
| 7 | Notificações Desktop Nativas | 0% | — | — | aguardando Fase 6 |
| **TOTAL** | | **57%** | 22/04/2026 | — | — |

---

## 5. Log de Commits

| Data | Fase | Commit Hash | Mensagem | Decisão |
|---|---|---|---|---|
| 22/04/2026 | 1 | `9751df2` | feat(pwa): instalar service worker e manifest | ✅ |
| 22/04/2026 | 2 | `ec4bf3f` | feat(pwa): push notification service e subscribe flow | ✅ |
| 22/04/2026 | 3 | `2baadc8` | feat(api): push notification controller para teste | ✅ |
| 22/04/2026 | 4 | `7acb52f` | feat(pwa): tela de teste push notification em administracao | ✅ |

---

## 6. Checklist de Conclusão

### Service Worker (Fase 1) ✅
- [x] SW registrado e ativo no Chrome DevTools
- [x] SW desabilitado no ambiente de desenvolvimento (`environment.ts`)
- [x] `ngsw-config.json` revisado — sem rotas de API em cache (somente assets)
- [ ] Cache de assets funcionando (reload offline carrega a shell) — validar no deploy

### Manifest / Instalação (Fase 1) ✅
- [x] `manifest.webmanifest` com nome, short_name, theme_color, ícones
- [x] Ícones 72px–512px presentes
- [ ] Botão de instalação aparece no Chrome Desktop — validar no deploy
- [ ] "Add to Home Screen" funciona no Android — validar no deploy

### Push Notifications Básico (Fases 2-4) ✅
- [x] Chaves VAPID geradas e salvas em `appsettings`
- [x] Chave pública VAPID configurada nos environments
- [x] `POST /api/push/subscribe` funcionando
- [x] `POST /api/push/send-test` funcionando
- [x] Tela de teste em `/admin/push-test`
- [ ] Notificação exibida nativamente pelo SO — validar no deploy
- [ ] Clique na notificação abre/foca a aplicação — validar no deploy

### Push Avançado (Fase 6)
- [ ] `/subscribe` associa subscription ao usuário do JWT
- [ ] `POST /api/push/send` com `targetType: "all"` funcional
- [ ] `POST /api/push/send` com `targetType: "user"` funcional
- [ ] `POST /api/push/send` com `targetType: "role"` funcional
- [ ] `GET /api/push/subscriptions` retorna usuários com subscription ativa
- [ ] Tela de teste com campos de título, mensagem e destinatário
- [ ] Dropdowns de usuário e role carregados da API/serviço
- [ ] Painel de notificações no shell com contador de não-lidas
- [ ] Push recebido com app aberto aparece no painel
- [ ] Push recebido com app fechado exibe notificação nativa do SO

### Notificações Desktop (Fase 7)
- [ ] `DesktopNotificationService` criado e funcional
- [ ] Funciona em `ng serve` sem HTTPS
- [ ] Seção na tela de teste com status de permissão desktop
- [ ] Botão de notificação local de teste dispara via Notifications API
- [ ] Clique na notificação foca o app
- [ ] Integrado ao painel de notificações interno

### Cross-browser (Fase 5)
- [ ] Chrome Desktop ✅
- [ ] Chrome Android ✅
- [ ] Edge Desktop ✅
- [ ] Firefox Desktop ✅
- [ ] Safari iOS (16.4+) — validar

### Backend
- [x] Build .NET sem erros
- [x] Swagger documenta `/api/push/subscribe` e `/api/push/send-test`
- [x] CORS permite origem do frontend
- [ ] Swagger documenta `/api/push/send` e `/api/push/subscriptions` (Fase 6)

---

*Documento criado em: 22/04/2026*  
*Atualizado em: 22/04/2026 — Fases 6 e 7 adicionadas*  
*Branch: feat/responsividade-pwa*  
*Baseado em: feat/responsividade-layout (commit fb32854)*
