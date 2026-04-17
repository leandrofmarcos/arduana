using Comex133Api.Core.Database;
using Comex133Api.Core.Extensions;
using Comex133Api.Core.Middleware;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.OpenApi.Models;
using System.Globalization;

var builder = WebApplication.CreateBuilder(args);

// URLs
if (builder.Environment.IsDevelopment())
    builder.WebHost.UseUrls("http://localhost:5001");

// Controllers
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Swagger com suporte a Bearer JWT
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Comex133 API",
        Version = "v1",
        Description = "API REST do sistema Comex133 — Gestão de Importações",
        Contact = new OpenApiContact { Name = "Equipe Comex133" }
    });

    options.TagActionsBy(api =>
    {
        var relativePath = api.RelativePath ?? string.Empty;
        var segments = relativePath.Split('/', StringSplitOptions.RemoveEmptyEntries);
        if (segments.Length >= 2 && segments[0].Equals("api", StringComparison.OrdinalIgnoreCase))
        {
            var tag = segments[1].Replace("-", " ");
            return new[] { CultureInfo.InvariantCulture.TextInfo.ToTitleCase(tag) };
        }
        return new[] { api.GroupName ?? api.ActionDescriptor.RouteValues["controller"] ?? "Geral" };
    });

    // Security definition — Bearer JWT
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Type        = SecuritySchemeType.Http,
        Scheme      = "bearer",
        BearerFormat = "JWT",
        In          = ParameterLocation.Header,
        Name        = "Authorization",
        Description = "Informe o access token JWT. Exemplo: Bearer {token}"
    });
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });

    options.CustomSchemaIds(type => type.FullName);
});

// Banco de dados SQL Server
builder.Services.AddAppDbContext(builder.Configuration);

// JWT Authentication
builder.Services.AddJwtAuthentication(builder.Configuration);

// Serviços e validators das features
builder.Services.AddFeatureServices();
builder.Services.AddFeatureValidators();
builder.Services.AddMemoryCache();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            // Em desenvolvimento, permitir localhost em qualquer porta
            policy.SetIsOriginAllowed(origin =>
            {
                if (string.IsNullOrEmpty(origin)) return false;
                var uri = new Uri(origin);
                return (uri.Host == "localhost" || uri.Host == "127.0.0.1") && uri.Scheme == "http";
            })
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
        }
        else
        {
            // Em produção, usar origens configuradas
            var origins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                          ?? Array.Empty<string>();
            policy.WithOrigins(origins)
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials();
        }
    });
});

var app = builder.Build();

// Aplicar migrations, seed e limpeza de tokens expirados ao iniciar
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var logger  = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    await DbInitializer.Initialize(context, logger);

    // Limpar refresh tokens expirados
    var authService = scope.ServiceProvider.GetRequiredService<Comex133Api.Features.Auth.AuthService>();
    await authService.CleanupExpiredTokensAsync();
}

// Forwarded headers (hospedagem FTP / reverse proxy)
app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});

// Middlewares customizados
app.UseMiddleware<RequestLoggingMiddleware>();
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseMiddleware<LoginRateLimitMiddleware>();

// Swagger — disponível em todos os ambientes
app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "Comex133 API v1");
    options.RoutePrefix = "swagger";
});

// Redirecionar / → /swagger
app.MapGet("/", (HttpContext ctx) =>
{
    ctx.Response.Redirect("/swagger", permanent: false);
    return Task.CompletedTask;
});

app.UseCors("AllowAngular");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
