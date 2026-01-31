using ImportCostsApi.Core.Database;
using ImportCostsApi.Core.Extensions;
using ImportCostsApi.Core.Middleware;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.OpenApi.Models;
using System.Globalization;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Swagger/OpenAPI
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Import Costs API",
        Version = "v1",
        Description = "API para gerenciamento de custos de importação",
        Contact = new OpenApiContact
        {
            Name = "Equipe de Desenvolvimento"
        }
    });

    options.TagActionsBy(api =>
    {
        var relativePath = api.RelativePath ?? string.Empty;
        var segments = relativePath.Split('/', StringSplitOptions.RemoveEmptyEntries);

        if (segments.Length >= 2 && segments[0].Equals("api", StringComparison.OrdinalIgnoreCase))
        {
            var tag = segments[1].Replace("-", " ");
            var textInfo = CultureInfo.InvariantCulture.TextInfo;
            return new[] { textInfo.ToTitleCase(tag) };
        }

        return new[] { api.GroupName ?? api.ActionDescriptor.RouteValues["controller"] ?? "Geral" };
    });
});

// Database (usando InMemory por enquanto)
builder.Services.AddAppDbContext(builder.Configuration);

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        var origins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() 
            ?? new[] { "http://localhost:4200" };
        
        policy.WithOrigins(origins)
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Registrar repositórios e handlers (serão adicionados conforme desenvolvimento)
builder.Services.AddRepositories();
builder.Services.AddHandlers();
builder.Services.AddValidators();

var app = builder.Build();

// Inicializar banco de dados
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<AppDbContext>();
    var logger = services.GetRequiredService<ILogger<Program>>();
    
    await DbInitializer.Initialize(context, logger);
}

// Configure the HTTP request pipeline
app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});

// Middleware customizado
app.UseMiddleware<RequestLoggingMiddleware>();
app.UseMiddleware<ExceptionHandlingMiddleware>();

// Swagger sempre disponível (desenvolvimento e produção)
app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "Import Costs API v1");
    options.RoutePrefix = "swagger";
});

// Redirecionar / para /swagger
app.MapGet("/", async (HttpContext context) =>
{
    context.Response.Redirect("/swagger", permanent: false);
    await Task.CompletedTask;
});

app.UseCors("AllowAngular");

app.UseAuthorization();

app.MapControllers();

app.Run();
