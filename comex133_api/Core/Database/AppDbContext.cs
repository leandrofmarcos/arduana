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
    public DbSet<UsuarioVinculo> UsuarioVinculos => Set<UsuarioVinculo>();

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

    // Phase 4 — Fluxo operacional
    public DbSet<SolicitacaoOrcamento> SolicitacoesOrcamento => Set<SolicitacaoOrcamento>();
    public DbSet<ControleNavio>        ControleNavios        => Set<ControleNavio>();
    public DbSet<ControleNavioTrajeto> ControleNaviosTrajetos => Set<ControleNavioTrajeto>();

    // Phase 5 — Navios (cadastro mestre + trajetoria operacional)
    public DbSet<Navio>               Navios               => Set<Navio>();
    public DbSet<NavioTrajeto>        NaviosTrajetos       => Set<NavioTrajeto>();
    public DbSet<EmbarqueNavioVinculo> EmbarqueNavioVinculos => Set<EmbarqueNavioVinculo>();
    public DbSet<SolicitacaoOrcamentoDespachante> SolicitacoesOrcamentoDespachantes => Set<SolicitacaoOrcamentoDespachante>();
    public DbSet<SolicitacaoOrcamentoDocumento> SolicitacoesOrcamentoDocumentos => Set<SolicitacaoOrcamentoDocumento>();

    // Packlist
    public DbSet<Packlist>     Packlists     => Set<Packlist>();
    public DbSet<PacklistItem> PacklistItens => Set<PacklistItem>();

    // Phase OP — Fluxo operacional (CustoDespachante + OrcamentoVenda)
    public DbSet<CustoDespachante>       CustosDespachante         => Set<CustoDespachante>();
    public DbSet<CustoDespachanteLi>     CustosDespachantelis      => Set<CustoDespachanteLi>();
    public DbSet<CustoDespachanteDespesa> CustosDepesas             => Set<CustoDespachanteDespesa>();
    public DbSet<NcmVinculadoCusto>      NcmsVinculadosCusto       => Set<NcmVinculadoCusto>();
    public DbSet<ValorImpostoCusto>      ValoresImpostoCusto        => Set<ValorImpostoCusto>();
    public DbSet<OrcamentoVenda>         OrcamentosVenda            => Set<OrcamentoVenda>();
    public DbSet<OrcamentoVendaDespesa>  OrcamentosVendaDespesas    => Set<OrcamentoVendaDespesa>();
    public DbSet<OrcamentoVendaDespesaExtra> OrcamentosVendaExtras  => Set<OrcamentoVendaDespesaExtra>();
    public DbSet<OrcamentoVendaCusto>    OrcamentosVendaCustos      => Set<OrcamentoVendaCusto>();

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

        modelBuilder.Entity<UsuarioVinculo>(entity =>
        {
            entity.HasIndex(e => new { e.UsuarioId, e.TipoVinculo, e.EntidadeId }).IsUnique();

            entity.HasOne(e => e.Usuario)
                  .WithMany(u => u.Vinculos)
                  .HasForeignKey(e => e.UsuarioId)
                  .OnDelete(DeleteBehavior.Cascade);
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

        modelBuilder.Entity<SolicitacaoOrcamento>(entity =>
        {
            entity.HasIndex(x => x.CodigoInterno).IsUnique();

            entity.HasOne(x => x.Cliente)
                .WithMany()
                .HasForeignKey(x => x.ClienteId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.Importador)
                .WithMany()
                .HasForeignKey(x => x.ImportadorId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.PortoOrigem)
                .WithMany()
                .HasForeignKey(x => x.PortoOrigemId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.PortoDestino)
                .WithMany()
                .HasForeignKey(x => x.PortoDestinoId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<SolicitacaoOrcamentoDespachante>(entity =>
        {
            entity.HasIndex(x => new { x.SolicitacaoOrcamentoId, x.DespachanteId }).IsUnique();

            entity.HasOne(x => x.SolicitacaoOrcamento)
                .WithMany(x => x.Despachantes)
                .HasForeignKey(x => x.SolicitacaoOrcamentoId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(x => x.Despachante)
                .WithMany()
                .HasForeignKey(x => x.DespachanteId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<SolicitacaoOrcamentoDocumento>(entity =>
        {
            entity.HasOne(x => x.SolicitacaoOrcamento)
                .WithMany(x => x.Documentos)
                .HasForeignKey(x => x.SolicitacaoOrcamentoId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ControleNavio>(entity =>
        {
            entity.HasIndex(e => e.NumeroViagem).IsUnique();
        });

        modelBuilder.Entity<ControleNavioTrajeto>(entity =>
        {
            entity.HasOne(t => t.ControleNavio)
                  .WithMany(n => n.Trajetos)
                  .HasForeignKey(t => t.ControleNavioId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(t => t.PortoOrigem)
                  .WithMany()
                  .HasForeignKey(t => t.PortoOrigemId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(t => t.PortoDestino)
                  .WithMany()
                  .HasForeignKey(t => t.PortoDestinoId)
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

        // Phase 5 — Navios
        modelBuilder.Entity<NavioTrajeto>(entity =>
        {
            entity.HasOne(t => t.Navio)
                  .WithMany(n => n.Trajetos)
                  .HasForeignKey(t => t.NavioId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(t => t.PortoOrigem)
                  .WithMany()
                  .HasForeignKey(t => t.PortoOrigemId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(t => t.PortoDestino)
                  .WithMany()
                  .HasForeignKey(t => t.PortoDestinoId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<EmbarqueNavioVinculo>(entity =>
        {
            entity.HasOne(v => v.EmbarqueAduana)
                  .WithMany()
                  .HasForeignKey(v => v.EmbarqueAduanaId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(v => v.Navio)
                  .WithMany(n => n.Vinculos)
                  .HasForeignKey(v => v.NavioId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(v => v.NavioTrajeto)
                  .WithMany(t => t.Vinculos)
                  .HasForeignKey(v => v.NavioTrajetoId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // Packlist
        modelBuilder.Entity<Packlist>(entity =>
        {
            entity.HasIndex(x => x.SolicitacaoOrcamentoId).IsUnique();

            entity.HasOne(x => x.SolicitacaoOrcamento)
                  .WithMany()
                  .HasForeignKey(x => x.SolicitacaoOrcamentoId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PacklistItem>(entity =>
        {
            entity.HasOne(x => x.Packlist)
                  .WithMany(x => x.Itens)
                  .HasForeignKey(x => x.PacklistId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Phase OP — CustoDespachante
        modelBuilder.Entity<CustoDespachante>(entity =>
        {
            entity.HasIndex(x => x.CodigoInterno).IsUnique();
            entity.HasIndex(x => x.Status);

            entity.HasOne(x => x.SolicitacaoOrcamento)
                  .WithMany()
                  .HasForeignKey(x => x.SolicitacaoOrcamentoId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.Despachante)
                  .WithMany()
                  .HasForeignKey(x => x.DespachanteId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.Importador)
                  .WithMany()
                  .HasForeignKey(x => x.ImportadorId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.PortoOrigem)
                  .WithMany()
                  .HasForeignKey(x => x.PortoOrigemId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.PortoDestino)
                  .WithMany()
                  .HasForeignKey(x => x.PortoDestinoId)
                  .OnDelete(DeleteBehavior.Restrict);

            // Self-referencing FK for versioning
            entity.HasOne(x => x.VersaoAnterior)
                  .WithMany()
                  .HasForeignKey(x => x.VersaoAnteriorId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<CustoDespachanteLi>(entity =>
        {
            entity.HasOne(x => x.CustoDespachante)
                  .WithMany(x => x.Lis)
                  .HasForeignKey(x => x.CustoDespachanteId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CustoDespachanteDespesa>(entity =>
        {
            entity.HasOne(x => x.CustoDespachante)
                  .WithMany(x => x.Despesas)
                  .HasForeignKey(x => x.CustoDespachanteId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<NcmVinculadoCusto>(entity =>
        {
            entity.HasOne(x => x.CustoDespachante)
                  .WithMany(x => x.Ncms)
                  .HasForeignKey(x => x.CustoDespachanteId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(x => x.Ncm)
                  .WithMany()
                  .HasForeignKey(x => x.NcmId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<ValorImpostoCusto>(entity =>
        {
            entity.HasOne(x => x.NcmVinculadoCusto)
                  .WithMany(x => x.ValoresImposto)
                  .HasForeignKey(x => x.NcmVinculadoCustoId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Phase OP — OrcamentoVenda
        modelBuilder.Entity<OrcamentoVenda>(entity =>
        {
            entity.HasIndex(x => x.CodigoInterno).IsUnique();

            entity.HasOne(x => x.Cliente)
                  .WithMany()
                  .HasForeignKey(x => x.ClienteId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.SolicitacaoOrcamento)
                  .WithMany()
                  .HasForeignKey(x => x.SolicitacaoOrcamentoId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<OrcamentoVendaDespesa>(entity =>
        {
            entity.HasOne(x => x.OrcamentoVenda)
                  .WithMany(x => x.Despesas)
                  .HasForeignKey(x => x.OrcamentoVendaId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<OrcamentoVendaDespesaExtra>(entity =>
        {
            entity.HasOne(x => x.OrcamentoVenda)
                  .WithMany(x => x.Extras)
                  .HasForeignKey(x => x.OrcamentoVendaId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<OrcamentoVendaCusto>(entity =>
        {
            entity.HasIndex(x => new { x.OrcamentoVendaId, x.CustoDespachanteId }).IsUnique();

            entity.HasOne(x => x.OrcamentoVenda)
                  .WithMany(x => x.Custos)
                  .HasForeignKey(x => x.OrcamentoVendaId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(x => x.CustoDespachante)
                  .WithMany()
                  .HasForeignKey(x => x.CustoDespachanteId)
                  .OnDelete(DeleteBehavior.Restrict);
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
        SetTimestamps<SolicitacaoOrcamento>(now);
        SetTimestamps<SolicitacaoOrcamentoDespachante>(now);
        SetTimestamps<SolicitacaoOrcamentoDocumento>(now);
        SetTimestamps<ControleNavio>(now);
        SetTimestamps<ControleNavioTrajeto>(now);

        // Packlist
        SetTimestamps<Packlist>(now);
        SetTimestamps<PacklistItem>(now);

        // Phase OP
        SetTimestamps<CustoDespachante>(now);
        SetTimestamps<CustoDespachanteLi>(now);
        SetTimestamps<CustoDespachanteDespesa>(now);
        SetTimestamps<NcmVinculadoCusto>(now);
        SetTimestamps<ValorImpostoCusto>(now);
        SetTimestamps<OrcamentoVenda>(now);
        SetTimestamps<OrcamentoVendaDespesa>(now);
        SetTimestamps<OrcamentoVendaDespesaExtra>(now);
        SetTimestamps<OrcamentoVendaCusto>(now);

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
