using System.Collections.Concurrent;
using System.Net;
using System.Text.Json;
using Comex133Api.Core.Models;

namespace Comex133Api.Core.Middleware;

public class LoginRateLimitMiddleware
{
    private static readonly ConcurrentDictionary<string, (int Count, DateTime ResetAt)> _attempts = new();

    private const int    MaxAttempts   = 5;
    private const int    WindowSeconds = 300; // 5 minutos

    private readonly RequestDelegate _next;

    public LoginRateLimitMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Aplica somente em POST /api/auth/login
        if (!IsLoginEndpoint(context))
        {
            await _next(context);
            return;
        }

        var ip = GetClientIp(context);

        if (IsRateLimited(ip))
        {
            context.Response.StatusCode  = (int)HttpStatusCode.TooManyRequests;
            context.Response.ContentType = "application/json";
            context.Response.Headers["Retry-After"] = WindowSeconds.ToString();

            var body = JsonSerializer.Serialize(
                ApiResponse.Error("Muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente.", 429),
                new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

            await context.Response.WriteAsync(body);
            return;
        }

        // Captura o status antes de continuar
        await _next(context);

        // Conta falha apenas em 401
        if (context.Response.StatusCode == (int)HttpStatusCode.Unauthorized)
            RegisterAttempt(ip);
        else if (context.Response.StatusCode == 200)
            ResetAttempts(ip);
    }

    // ─── helpers ─────────────────────────────────────────────────────────────

    private static bool IsLoginEndpoint(HttpContext ctx) =>
        ctx.Request.Method == HttpMethods.Post &&
        ctx.Request.Path.StartsWithSegments("/api/auth/login", StringComparison.OrdinalIgnoreCase);

    private static string GetClientIp(HttpContext ctx)
    {
        var forwarded = ctx.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrWhiteSpace(forwarded))
            return forwarded.Split(',')[0].Trim();

        return ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }

    private static bool IsRateLimited(string ip)
    {
        if (!_attempts.TryGetValue(ip, out var entry))
            return false;

        if (DateTime.UtcNow >= entry.ResetAt)
        {
            _attempts.TryRemove(ip, out _);
            return false;
        }

        return entry.Count >= MaxAttempts;
    }

    private static void RegisterAttempt(string ip)
    {
        _attempts.AddOrUpdate(
            ip,
            _ => (1, DateTime.UtcNow.AddSeconds(WindowSeconds)),
            (_, existing) =>
            {
                if (DateTime.UtcNow >= existing.ResetAt)
                    return (1, DateTime.UtcNow.AddSeconds(WindowSeconds));
                return (existing.Count + 1, existing.ResetAt);
            });
    }

    private static void ResetAttempts(string ip) => _attempts.TryRemove(ip, out _);
}
