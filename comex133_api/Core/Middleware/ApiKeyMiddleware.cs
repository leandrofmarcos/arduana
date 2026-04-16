namespace Comex133Api.Core.Middleware;

public class ApiKeyMiddleware
{
    private const string HeaderName = "X-Api-Key";

    private readonly RequestDelegate _next;
    private readonly string _apiKey;

    public ApiKeyMiddleware(RequestDelegate next, IConfiguration configuration)
    {
        _next = next;
        _apiKey = configuration["ApiKey:Value"]
                  ?? throw new InvalidOperationException("ApiKey:Value não configurado em appsettings.");
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path.Value ?? string.Empty;

        // Rotas públicas — não exigem token
        if (IsPublicPath(path))
        {
            await _next(context);
            return;
        }

        if (!context.Request.Headers.TryGetValue(HeaderName, out var receivedKey)
            || receivedKey != _apiKey)
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(
                "{\"success\":false,\"message\":\"Token inválido ou ausente. Informe o header X-Api-Key.\",\"errors\":null,\"statusCode\":401}");
            return;
        }

        await _next(context);
    }

    private static bool IsPublicPath(string path)
    {
        return path == "/"
               || path.StartsWith("/swagger", StringComparison.OrdinalIgnoreCase)
               || path.Equals("/api/health", StringComparison.OrdinalIgnoreCase);
    }
}
