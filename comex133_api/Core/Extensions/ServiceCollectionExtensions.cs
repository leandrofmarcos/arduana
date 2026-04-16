using Comex133Api.Core.Database;
using Comex133Api.Features.Auth;
using Comex133Api.Features.Parametros;
using Comex133Api.Features.Roles;
using Comex133Api.Features.Usuarios;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace Comex133Api.Core.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddAppDbContext(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
        {
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection"),
                sqlOptions =>
                {
                    sqlOptions.EnableRetryOnFailure(
                        maxRetryCount: 3,
                        maxRetryDelay: TimeSpan.FromSeconds(5),
                        errorNumbersToAdd: null);
                });
        });

        return services;
    }

    public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        var secret   = configuration["Jwt:Secret"]!;
        var issuer   = configuration["Jwt:Issuer"]!;
        var audience = configuration["Jwt:Audience"]!;
        var key      = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme    = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey         = key,
                ValidateIssuer           = true,
                ValidIssuer              = issuer,
                ValidateAudience         = true,
                ValidAudience            = audience,
                ValidateLifetime         = true,
                ClockSkew                = TimeSpan.Zero
            };
        });

        services.AddAuthorization();

        return services;
    }

    public static IServiceCollection AddFeatureServices(this IServiceCollection services)
    {
        services.AddScoped<ParametroService>();
        services.AddScoped<JwtService>();
        services.AddScoped<AuthService>();
        services.AddScoped<UsuarioService>();
        services.AddScoped<RoleService>();
        return services;
    }

    public static IServiceCollection AddFeatureValidators(this IServiceCollection services)
    {
        // Parametros
        services.AddScoped<IValidator<CreateParametroRequest>, CreateParametroValidator>();
        services.AddScoped<IValidator<UpdateParametroRequest>, UpdateParametroValidator>();

        // Auth
        services.AddScoped<IValidator<LoginRequest>, LoginRequestValidator>();
        services.AddScoped<IValidator<RefreshRequest>, RefreshRequestValidator>();

        // Usuarios
        services.AddScoped<IValidator<CreateUsuarioRequest>, CreateUsuarioRequestValidator>();
        services.AddScoped<IValidator<UpdateUsuarioRequest>, UpdateUsuarioRequestValidator>();
        services.AddScoped<IValidator<AlterarSenhaRequest>,  AlterarSenhaRequestValidator>();

        // Roles
        services.AddScoped<IValidator<CreateRoleRequest>, CreateRoleRequestValidator>();
        services.AddScoped<IValidator<UpdateRoleRequest>, UpdateRoleRequestValidator>();

        return services;
    }
}

