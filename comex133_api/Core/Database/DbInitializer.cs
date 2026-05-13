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
        // Seed Usuário Admin — usa a role "Administrador" gerenciada por migrations
        if (!await context.Usuarios.AnyAsync(u => u.Email == "admin@comex133.com.br"))
        {
            var adminRole = await context.Roles.FirstOrDefaultAsync(r => r.Nome == "Administrador");
            if (adminRole == null)
            {
                logger.LogWarning("Seed: Role 'Administrador' não encontrada. Execute as migrations antes do seed.");
                return;
            }

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
            logger.LogInformation("Seed: Usuário 'admin@comex133.com.br' criado com role 'Administrador'.");
        }

        if (!await context.ParametrosSistema.AnyAsync(p => p.Chave == "empresa.nomeExibicao"))
        {
            context.ParametrosSistema.Add(new ParametroSistema
            {
                Chave = "empresa.nomeExibicao",
                Valor = "Ominium S/A",
                Descricao = "Nome da empresa exibido nos documentos gerados"
            });
            await context.SaveChangesAsync();
            logger.LogInformation("Seed: Parâmetro 'empresa.nomeExibicao' criado.");
        }
    }
}

