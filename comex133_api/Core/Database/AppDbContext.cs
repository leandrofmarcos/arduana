using Comex133Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Comex133Api.Core.Database;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<ParametroSistema> ParametrosSistema => Set<ParametroSistema>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<UsuarioRole> UsuarioRoles => Set<UsuarioRole>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    // Phase 3 — Cadastros
    public DbSet<PortoOrigem>       PortosOrigem      => Set<PortoOrigem>();
    public DbSet<PortoDestino>      PortosDestino     => Set<PortoDestino>();
    public DbSet<Cliente>           Clientes          => Set<Cliente>();
    public DbSet<Importador>        Importadores      => Set<Importador>();
    public DbSet<Exportador>        Exportadores      => Set<Exportador>();
    public DbSet<AgenteCarga>       AgentesCarga      => Set<AgenteCarga>();
    public DbSet<Fabricante>        Fabricantes       => Set<Fabricante>();
    public DbSet<Despachante>       Despachantes      => Set<Despachante>();
    public DbSet<Ncm>               Ncms              => Set<Ncm>();
    public DbSet<ListaPrecoLcl>     ListaPrecoLcl     => Set<ListaPrecoLcl>();
    public DbSet<DespesaCatalogo>   DespesasCatalogo  => Set<DespesaCatalogo>();
    public DbSet<ModeloDespesa>     ModelosDespesa    => Set<ModeloDespesa>();
    public DbSet<ModeloDespesaItem> ModelosDespesaItens => Set<ModeloDespesaItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<ParametroSistema>(entity =>
        {
            entity.HasIndex(e => e.Chave).IsUnique();
        });

        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.HasIndex(e => e.Email).IsUnique();
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasIndex(e => e.Token).IsUnique();
        });

        modelBuilder.Entity<Ncm>(entity =>
        {
            entity.HasIndex(e => e.CodigoNcm).IsUnique();
        });

        modelBuilder.Entity<ModeloDespesaItem>(entity =>
        {
            entity.HasOne(i => i.ModeloDespesa)
                  .WithMany(m => m.Itens)
                  .HasForeignKey(i => i.ModeloDespesaId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(i => i.DespesaCatalogo)
                  .WithMany(d => d.ModeloDespesaItens)
                  .HasForeignKey(i => i.DespesaCatalogoId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<UsuarioRole>(entity =>
        {
            entity.HasKey(ur => new { ur.UsuarioId, ur.RoleId });

            entity.HasOne(ur => ur.Usuario)
                  .WithMany(u => u.UsuarioRoles)
                  .HasForeignKey(ur => ur.UsuarioId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(ur => ur.Role)
                  .WithMany(r => r.UsuarioRoles)
                  .HasForeignKey(ur => ur.RoleId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }

    public override int SaveChanges()
    {
        AtualizarTimestamps();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        AtualizarTimestamps();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void AtualizarTimestamps()
    {
        var now = DateTime.UtcNow;

        foreach (var entry in ChangeTracker.Entries<ParametroSistema>()
            .Where(e => e.State is EntityState.Added or EntityState.Modified))
        {
            entry.Entity.AtualizadoEm = now;
            if (entry.State == EntityState.Added)
                entry.Entity.CriadoEm = now;
        }

        foreach (var entry in ChangeTracker.Entries<Role>()
            .Where(e => e.State is EntityState.Added or EntityState.Modified))
        {
            entry.Entity.AtualizadoEm = now;
            if (entry.State == EntityState.Added)
                entry.Entity.CriadoEm = now;
        }

        foreach (var entry in ChangeTracker.Entries<Usuario>()
            .Where(e => e.State is EntityState.Added or EntityState.Modified))
        {
            entry.Entity.AtualizadoEm = now;
            if (entry.State == EntityState.Added)
                entry.Entity.CriadoEm = now;
        }

        foreach (var entry in ChangeTracker.Entries<RefreshToken>()
            .Where(e => e.State == EntityState.Added))
        {
            entry.Entity.CriadoEm = now;
        }

        foreach (var entry in ChangeTracker.Entries<UsuarioRole>()
            .Where(e => e.State == EntityState.Added))
        {
            entry.Entity.AtribuidoEm = now;
        }

        // Phase 3 — Cadastros
        SetTimestamps<PortoOrigem>(now);
        SetTimestamps<PortoDestino>(now);
        SetTimestamps<Cliente>(now);
        SetTimestamps<Importador>(now);
        SetTimestamps<Exportador>(now);
        SetTimestamps<AgenteCarga>(now);
        SetTimestamps<Fabricante>(now);
        SetTimestamps<Despachante>(now);
        SetTimestamps<Ncm>(now);
        SetTimestamps<ListaPrecoLcl>(now);
        SetTimestamps<DespesaCatalogo>(now);
        SetTimestamps<ModeloDespesa>(now);

        foreach (var entry in ChangeTracker.Entries<ModeloDespesaItem>()
            .Where(e => e.State == EntityState.Added))
        {
            entry.Entity.AdicionadoEm = now;
        }
    }

    private void SetTimestamps<TEntity>(DateTime now)
        where TEntity : class, IHasTimestamps
    {
        foreach (var entry in ChangeTracker.Entries<TEntity>()
            .Where(e => e.State is EntityState.Added or EntityState.Modified))
        {
            entry.Entity.AtualizadoEm = now;
            if (entry.State == EntityState.Added)
                entry.Entity.CriadoEm = now;
        }
    }
}
