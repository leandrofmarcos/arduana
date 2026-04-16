using Comex133Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Comex133Api.Core.Database;

public static class DbInitializer
{
    public static async Task Initialize(AppDbContext context, ILogger logger)
    {
        try
        {
            logger.LogInformation("Aplicando migrations pendentes...");
            await context.Database.MigrateAsync();
            logger.LogInformation("Migrations aplicadas com sucesso.");

            await SeedAsync(context, logger);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao aplicar migrations: {Message}", ex.Message);
            throw;
        }
    }

    private static async Task SeedAsync(AppDbContext context, ILogger logger)
    {
        // Seed Role Admin
        if (!await context.Roles.AnyAsync(r => r.Nome == "Admin"))
        {
            var adminRole = new Role
            {
                Nome = "Admin",
                Descricao = "Administrador do sistema",
                CriadoEm = DateTime.UtcNow,
                AtualizadoEm = DateTime.UtcNow
            };
            context.Roles.Add(adminRole);
            await context.SaveChangesAsync();
            logger.LogInformation("Seed: Role 'Admin' criada.");
        }

        // Seed Usuário Admin
        if (!await context.Usuarios.AnyAsync(u => u.Email == "admin@comex133.com.br"))
        {
            var adminRole = await context.Roles.FirstAsync(r => r.Nome == "Admin");

            var adminUser = new Usuario
            {
                Email = "admin@comex133.com.br",
                NomeCompleto = "Administrador",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Pa$$word", workFactor: 12),
                Ativo = true,
                CriadoEm = DateTime.UtcNow,
                AtualizadoEm = DateTime.UtcNow
            };
            context.Usuarios.Add(adminUser);
            await context.SaveChangesAsync();

            context.UsuarioRoles.Add(new UsuarioRole
            {
                UsuarioId = adminUser.Id,
                RoleId = adminRole.Id,
                AtribuidoEm = DateTime.UtcNow
            });
            await context.SaveChangesAsync();
            logger.LogInformation("Seed: Usuário 'admin@comex133.com.br' criado.");
        }
    }
}

