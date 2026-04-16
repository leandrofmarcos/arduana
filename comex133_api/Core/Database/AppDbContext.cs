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
    }
}
