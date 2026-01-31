using Microsoft.EntityFrameworkCore;

namespace ImportCostsApi.Core.Database;

/// <summary>
/// Inicializador do banco de dados (Seed data)
/// </summary>
public static class DbInitializer
{
    /// <summary>
    /// Inicializa o banco de dados e executa seeds
    /// </summary>
    public static async Task Initialize(AppDbContext context, ILogger logger)
    {
        try
        {
            // Garantir que o banco foi criado (para InMemory isso é automático)
            await context.Database.EnsureCreatedAsync();

            logger.LogInformation("Banco de dados inicializado com sucesso");

            // Seed data será adicionado aqui quando as entidades forem criadas
            // if (!context.Clientes.Any())
            // {
            //     await SeedClientes(context);
            // }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao inicializar banco de dados");
            throw;
        }
    }

    // Métodos de seed serão adicionados conforme necessário
    // private static async Task SeedClientes(AppDbContext context)
    // {
    //     var clientes = new List<Cliente>
    //     {
    //         new Cliente { Nome = "Cliente Exemplo", Documento = "00000000000" }
    //     };
    //     
    //     context.Clientes.AddRange(clientes);
    //     await context.SaveChangesAsync();
    // }
}
