namespace Comex133Api.Features.Push;

public record PushSubscriptionDto(
    string Endpoint,
    PushKeysDto Keys
);

public record PushKeysDto(string P256Dh, string Auth);
