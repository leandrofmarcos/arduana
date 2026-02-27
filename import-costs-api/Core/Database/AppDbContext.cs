using ImportCostsApi.Domain.Entities;
using ImportCostsApi.Features.Orcamentos;
using Microsoft.EntityFrameworkCore;

namespace ImportCostsApi.Core.Database;

/// <summary>
/// Contexto do Entity Framework Core
/// </summary>
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    // Entidades de Cadastro Base
    public DbSet<Cliente> Clientes => Set<Cliente>();
    public DbSet<Despachante> Despachantes => Set<Despachante>();
    public DbSet<Porto> Portos => Set<Porto>();
    public DbSet<AliquotaPerfil> AliquotasPerfis => Set<AliquotaPerfil>();
    public DbSet<TemplatePacklist> TemplatesPacklist => Set<TemplatePacklist>();
    public DbSet<Funcionario> Funcionarios => Set<Funcionario>();

    // Entidades do Fluxo de Orçamento
    public DbSet<OrcamentoLancamento> Orcamentos => Set<OrcamentoLancamento>();
    public DbSet<Packlist> Packlists => Set<Packlist>();
    public DbSet<PacklistItem> PacklistItems => Set<PacklistItem>();
    public DbSet<Custo> Custos => Set<Custo>();
    public DbSet<Despesa> Despesas => Set<Despesa>();
    public DbSet<Venda> Vendas => Set<Venda>();
    public DbSet<Aduana> Aduanas => Set<Aduana>();
    public DbSet<AduanaEvento> AduanaEventos => Set<AduanaEvento>();
    public DbSet<NumerarioLancamento> Numerarios => Set<NumerarioLancamento>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Aplicar configurações de entidades quando forem criadas
        // modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
