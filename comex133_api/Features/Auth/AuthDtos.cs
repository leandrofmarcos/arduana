namespace Comex133Api.Features.Auth;

public record LoginRequest(string Email, string Senha);

public record LoginResponse(
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAt,
    MeResponse Usuario);

public record RefreshRequest(string RefreshToken);

public record RefreshResponse(
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAt);

public record LogoutRequest(string RefreshToken);

public record MeResponse(
    int Id,
    string Email,
    string NomeCompleto,
    IEnumerable<string> Roles);
