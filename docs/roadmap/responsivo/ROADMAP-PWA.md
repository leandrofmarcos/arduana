# Roadmap — Progressive Web Application (comex133_front + comex133_api)

> **Branch de trabalho:** `feat/responsividade-pwa`  
> **Início:** 22/04/2026  
> **Base:** branch `feat/responsividade-layout` (responsividade 100% concluída)  
> **Meta:** Transformar o comex133_front em PWA instalável com suporte a Push Notifications, validado por teste funcional end-to-end front → API → browser.  
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
| Frontend | Angular 18.2 + `@angular/service-worker` | ⬜ Não instalado |
| Backend | .NET 8 + `WebPush` (NuGet) | ⬜ Não instalado |
| Protocolo Push | Web Push / VAPID (RFC 8292) | — |
| Chaves VAPID | Geradas uma vez, armazenadas como config | — |

### Fluxo resumido de Push Notification

```
1. Browser solicita permissão ao usuário
2. Browser gera PushSubscription (endpoint + keys)
3. Frontend envia a subscription para a API (POST /api/push/subscribe)
4. API salva a subscription em memória (escopo de teste)
5. Tela de teste dispara POST /api/push/send-test
6. API usa WebPush + VAPID para chamar o push service do browser
7. Service Worker recebe o evento 'push' e exibe a notificação
```

### Escopo do backend (mínimo para teste)

O backend terá **apenas dois endpoints temporários**, sem banco de dados:

- `POST /api/push/subscribe` — recebe e armazena a `PushSubscription` em memória
- `POST /api/push/send-test` — dispara uma notificação de teste para todas as subscriptions em memória

Não há persistência, roles, multi-usuário nem integração com eventos reais nesta fase. O objetivo é **validar o fluxo técnico completo**.

---

## 2. Pré-requisitos e Diagnóstico

### Frontend (comex133_front)

| Item | Estado |
|---|---|
| Angular 18.2.14 | ✅ |
| `@angular/service-worker` | ⬜ Não instalado |
| `manifest.webmanifest` | ⬜ Não existe |
| `ngsw-config.json` | ⬜ Não existe |
| HTTPS em produção | ✅ (obrigatório para Service Worker) |
| `angular.json` com `"serviceWorker": true` | ⬜ Não configurado |

### Backend (comex133_api)

| Item | Estado |
|---|---|
| .NET 8 ASP.NET Core | ✅ |
| `WebPush` NuGet (`WebPush` by Manuel Blanquett) | ⬜ Não instalado |
| Chaves VAPID geradas | ⬜ Não geradas |
| `PushController` | ⬜ Não existe |
| CORS configurado para push endpoints | ⬜ Verificar |

---

## 3. Plano de Fases

---

### FASE 1 — Instalação do Service Worker Angular

**Objetivo:** Adicionar `@angular/service-worker` ao projeto e configurar o `manifest.webmanifest`.  
**Commit esperado:** `feat(pwa): instalar service worker e manifest`

**Atividades:**

- [ ] 1.1 — Instalar o pacote:
  ```
  ng add @angular/pwa
  ```
  O comando gera automaticamente:
  - `src/manifest.webmanifest` (nome, ícones, cores, display)
  - `ngsw-config.json` (estratégias de cache)
  - Atualiza `angular.json` com `"serviceWorker": true` e referência ao manifest
  - Atualiza `app.config.ts` com `provideServiceWorker()`
  - Adiciona ícones placeholder em `src/assets/icons/`

- [ ] 1.2 — Editar `manifest.webmanifest` com dados reais da aplicação:
  ```json
  {
    "name": "Comex 133 — Gestão de Importação",
    "short_name": "Comex133",
    "theme_color": "#1d4ed8",
    "background_color": "#f8fafc",
    "display": "standalone",
    "scope": "/",
    "start_url": "/v2/dashboard",
    "icons": [...]
  }
  ```

- [ ] 1.3 — Substituir ícones placeholder pelos ícones reais da aplicação (PNG 192x192 e 512x512)

- [ ] 1.4 — Verificar `ngsw-config.json` — garantir que as rotas da SPA e assets essenciais estão no grupo de cache `prefetch`:
  ```json
  {
    "assetGroups": [{
      "name": "app",
      "installMode": "prefetch",
      "resources": {
        "files": ["/favicon.ico", "/index.html", "/*.css", "/*.js"]
      }
    }]
  }
  ```

- [ ] 1.5 — Build de produção e verificar que o Service Worker é registrado (`Application → Service Workers` no DevTools)

**Critério de aceite:**
- Build de produção sem erros
- DevTools → Application → Service Workers: SW registrado e ativo
- DevTools → Application → Manifest: manifest carregado sem erros
- Botão "Instalar" aparece na barra de endereço do Chrome

---

### FASE 2 — Serviço de Push no Frontend

**Objetivo:** Criar o `PushNotificationService` Angular responsável por solicitar permissão, gerar a subscription e enviá-la à API.  
**Commit esperado:** `feat(pwa): push notification service e subscribe flow`

**Atividades:**

- [ ] 2.1 — Criar `src/app/core/services/push-notification.service.ts`:

  ```typescript
  @Injectable({ providedIn: 'root' })
  export class PushNotificationService {
    private readonly VAPID_PUBLIC_KEY = '<VAPID_PUBLIC_KEY_AQUI>';

    constructor(
      private swPush: SwPush,
      private http: HttpClient
    ) {}

    async requestAndSubscribe(): Promise<void> {
      const sub = await this.swPush.requestSubscription({
        serverPublicKey: this.VAPID_PUBLIC_KEY
      });
      await firstValueFrom(
        this.http.post('/api/push/subscribe', sub)
      );
    }
  }
  ```

  > A chave pública VAPID virá da Fase 3 (geração no backend).

- [ ] 2.2 — Injetar `SwPush` via `provideServiceWorker()` já configurado na Fase 1

- [ ] 2.3 — Criar `src/app/core/services/push-notification.service.spec.ts` com teste básico de unidade (mock do SwPush)

- [ ] 2.4 — Adicionar listener de notificações recebidas no serviço:
  ```typescript
  this.swPush.notificationClicks.subscribe(({ notification }) => {
    // redirecionar para a rota da notificação se houver `data.url`
    if (notification.data?.url) {
      window.open(notification.data.url, '_self');
    }
  });
  ```

**Critério de aceite:**
- Serviço criado, sem erros TypeScript
- Método `requestAndSubscribe()` compila sem erros
- Listener de clique implementado

---

### FASE 3 — Backend: Endpoint de Push (mínimo para teste)

**Objetivo:** Adicionar ao `comex133_api` dois endpoints simples para receber subscriptions e disparar notificações de teste.  
**Commit esperado:** `feat(api): push notification controller para teste`

**Atividades:**

- [ ] 3.1 — Adicionar o pacote WebPush ao projeto:
  ```
  dotnet add package WebPush
  ```
  > Pacote: `WebPush` by Manuel Blanquett (suporte VAPID nativo para .NET)

- [ ] 3.2 — Gerar par de chaves VAPID (executar uma vez via script ou endpoint temporário):
  ```csharp
  var keys = VapidHelper.GenerateVapidKeys();
  // keys.PublicKey  → copiar para o frontend (Fase 2, item 2.1)
  // keys.PrivateKey → manter no appsettings
  ```
  Salvar em `appsettings.Development.json`:
  ```json
  "Vapid": {
    "Subject": "mailto:admin@comex133.com",
    "PublicKey": "<gerado>",
    "PrivateKey": "<gerado>"
  }
  ```

- [ ] 3.3 — Criar `Features/Push/PushController.cs` com dois endpoints:

  **Endpoint 1 — Receber subscription:**
  ```csharp
  [HttpPost("subscribe")]
  public IActionResult Subscribe([FromBody] PushSubscriptionDto dto)
  {
    _subscriptions.Add(dto); // lista estática em memória
    return Ok();
  }
  ```

  **Endpoint 2 — Disparar teste:**
  ```csharp
  [HttpPost("send-test")]
  public async Task<IActionResult> SendTest()
  {
    var payload = JsonSerializer.Serialize(new {
      title = "🔔 Teste Comex133",
      body = "Push notification funcionando!",
      icon = "/assets/icons/icon-192x192.png"
    });
    foreach (var sub in _subscriptions)
    {
      await _webPushClient.SendNotificationAsync(
        new PushSubscription(sub.Endpoint, sub.Keys.P256Dh, sub.Keys.Auth),
        payload, _vapidDetails);
    }
    return Ok(new { sent = _subscriptions.Count });
  }
  ```

- [ ] 3.4 — Criar `Features/Push/PushSubscriptionDto.cs`:
  ```csharp
  public record PushSubscriptionDto(
    string Endpoint,
    PushKeysDto Keys
  );
  public record PushKeysDto(string P256Dh, string Auth);
  ```

- [ ] 3.5 — Registrar o `WebPushClient` no `Program.cs` como singleton:
  ```csharp
  builder.Services.AddSingleton<WebPushClient>();
  ```

- [ ] 3.6 — Verificar que o CORS do `Program.cs` permite as origens do frontend para estes endpoints

- [ ] 3.7 — Testar os endpoints via Swagger/HTTP file antes de integrar com o frontend

**Critério de aceite:**
- `POST /api/push/subscribe` retorna 200 com body válido
- `POST /api/push/send-test` retorna 200 com `{ sent: N }`
- Build .NET sem erros
- Swagger documenta os dois endpoints

---

### FASE 4 — Tela de Teste no Frontend

**Objetivo:** Criar uma tela simples de teste de push dentro da área de administração para validar o fluxo completo.  
**Commit esperado:** `feat(pwa): tela de teste push notification em administracao`

**Atividades:**

- [ ] 4.1 — Criar `src/app/v2/features/administracao/push-test/push-test.component.ts` com:
  - Botão **"Ativar Notificações"** — chama `PushNotificationService.requestAndSubscribe()`
  - Exibe status: "Notificações desativadas / ativas / não suportadas"
  - Botão **"Enviar Notificação de Teste"** — chama `POST /api/push/send-test`
  - Exibe resposta da API (quantidade enviada / erro)

- [ ] 4.2 — Layout da tela (card simples com estados):
  ```
  ┌─────────────────────────────────────────┐
  │ 🔔 Teste de Push Notification           │
  │                                         │
  │ Status: ● Ativo / ○ Inativo             │
  │                                         │
  │ [Ativar Notificações]                   │
  │ [Enviar Notificação de Teste]           │
  │                                         │
  │ Log: "Notificação enviada com sucesso"  │
  └─────────────────────────────────────────┘
  ```

- [ ] 4.3 — Adicionar rota `/v2/admin/push-test` em `app.routes.ts`

- [ ] 4.4 — Adicionar link no menu de administração da sidebar (`shell-v2.component.ts`), visível apenas em ambiente de desenvolvimento ou para role `ADMIN`

- [ ] 4.5 — Tratar casos de erro:
  - Browser não suporta Push API → mensagem clara
  - Usuário negou permissão → instrução para reverter nas configurações
  - API indisponível → toast de erro

**Critério de aceite:**
- Tela acessível via rota `/v2/admin/push-test`
- Clicar "Ativar Notificações" abre o diálogo de permissão do browser
- Após ativar, clicar "Enviar Notificação de Teste" exibe a notificação nativa do SO
- Clicar na notificação redireciona para a aplicação

---

### FASE 5 — Validação Cross-browser e Ajustes Finais

**Objetivo:** Garantir que o PWA e push funcionam nos principais browsers.  
**Commit esperado:** `fix(pwa): ajustes cross-browser e documentacao`

**Atividades:**

- [ ] 5.1 — Testar no **Chrome Desktop** (Windows): instalar PWA, receber push ✅
- [ ] 5.2 — Testar no **Chrome Android**: instalar PWA, receber push ✅
- [ ] 5.3 — Testar no **Edge Desktop**: instalar PWA, receber push ✅
- [ ] 5.4 — Testar no **Firefox Desktop**: receber push (não instalável como PWA) ✅
- [ ] 5.5 — Testar no **Safari iOS 16.4+**: instalar como PWA (Add to Home Screen), receber push
- [ ] 5.6 — Verificar que o Service Worker não quebra o hot-reload em desenvolvimento
  > Em `environment.ts` o SW está desabilitado por padrão (`enabled: false`) — confirmar
- [ ] 5.7 — Build de produção limpo, sem warnings de SW
- [ ] 5.8 — Remover ou proteger por feature flag o link de `/v2/admin/push-test` antes de ir para produção real

**Critério de aceite:**
- Push funcional em Chrome Desktop e Chrome Android (mínimo)
- Sem regressão no build de produção
- SW não interfere no ambiente de desenvolvimento

---

## 4. Progresso por Fase

| Fase | Nome | % Completo | Início | Término | Decisão |
|---|---|---|---|---|---|
| 1 | Service Worker + Manifest | 100% | 22/04/2026 | 22/04/2026 | commit `9751df2` |
| 2 | Push Service (Frontend) | 100% | 22/04/2026 | 22/04/2026 | commit `ec4bf3f` |
| 3 | Push Controller (Backend) | 100% | 22/04/2026 | 22/04/2026 | commit `2baadc8` |
| 4 | Tela de Teste | 100% | 22/04/2026 | 22/04/2026 | commit `7acb52f` |
| 5 | Validação Cross-browser | 0% | — | — | aguardando deploy |
| **TOTAL** | | **80%** | 22/04/2026 | — | — |

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

### Service Worker
- [ ] SW registrado e ativo no Chrome DevTools
- [ ] SW desabilitado no ambiente de desenvolvimento (`environment.ts`)
- [ ] Cache de assets funcionando (reload offline carrega a shell)
- [ ] `ngsw-config.json` revisado — sem rotas de API em cache (somente assets)

### Manifest / Instalação
- [ ] `manifest.webmanifest` com nome, short_name, theme_color, ícones
- [ ] Ícones 192x192 e 512x512 presentes
- [ ] Botão de instalação aparece no Chrome Desktop
- [ ] "Add to Home Screen" funciona no Android

### Push Notifications
- [ ] Chaves VAPID geradas e salvas em `appsettings`
- [ ] Chave pública VAPID configurada no `PushNotificationService`
- [ ] `POST /api/push/subscribe` funcionando
- [ ] `POST /api/push/send-test` funcionando
- [ ] Notificação exibida nativamente pelo SO
- [ ] Clique na notificação abre/foca a aplicação
- [ ] Permissão negada tratada com mensagem ao usuário

### Cross-browser
- [ ] Chrome Desktop ✅
- [ ] Chrome Android ✅
- [ ] Edge Desktop ✅
- [ ] Firefox Desktop ✅
- [ ] Safari iOS (16.4+) — validar

### Backend
- [ ] Build .NET sem erros
- [ ] Swagger documenta `/api/push/subscribe` e `/api/push/send-test`
- [ ] CORS permite origem do frontend

---

*Documento criado em: 22/04/2026*  
*Branch: feat/responsividade-pwa*  
*Baseado em: feat/responsividade-layout (commit fb32854)*
