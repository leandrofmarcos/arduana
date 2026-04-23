namespace Comex133Api.Features.Push;

/// <summary>Payload enviado pelo browser (formato padrão Web Push API).</summary>
public record PushSubscriptionDto(
    string Endpoint,
    PushKeysDto Keys
);

public record PushKeysDto(string P256Dh, string Auth);

/// <summary>Subscription armazenada internamente com dados do usuário autenticado.</summary>
public record StoredSubscription(
    string Endpoint,
    PushKeysDto Keys,
    string UserId,
    string UserEmail
);

/// <summary>Body do endpoint POST /api/push/send.</summary>
public record SendPushRequest(
    /// <summary>"all" | "user" | "role"</summary>
    string TargetType,
    /// <summary>UserId ou nome da Role (obrigatório quando TargetType != "all").</summary>
    string? TargetId,
    string Title,
    string Message
);

/// <summary>Item retornado por GET /api/push/subscriptions.</summary>
public record SubscriptionUserDto(string UserId, string UserEmail);
