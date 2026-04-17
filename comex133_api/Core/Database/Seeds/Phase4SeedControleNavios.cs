using Microsoft.EntityFrameworkCore.Migrations;

namespace Comex133Api.Core.Database.Seeds;

/// <summary>
/// Seed de dados de ControleNavios para a Fase 4 — Fluxo operacional.
///
/// Cria 3 navios de exemplo com trajetos realistas entre portos de origem
/// asiáticos e portos de destino brasileiros. Os nomes dos navios e números
/// de viagem são fictícios, mas representativos do domínio.
///
/// Design:
///   • Navios e trajetos usam IF NOT EXISTS para idempotência.
///   • PortoOrigemId / PortoDestinoId são resolvidos por subquery via Codigo
///     desacoplando o seed de IDs gerados por identity.
///   • Down() remove na ordem inversa respeitando FK constraints.
/// </summary>
public static class Phase4SeedControleNavios
{
    public static void Up(MigrationBuilder m)
    {
        SeedNavios(m);
        SeedTrajetos(m);
    }

    public static void Down(MigrationBuilder m)
    {
        m.Sql("DELETE FROM [ControleNaviosTrajetos] WHERE [ControleNavioId] IN (SELECT [Id] FROM [ControleNavios] WHERE [NumeroViagem] IN ('V-2025-001','V-2025-002','V-2025-003'))");
        m.Sql("DELETE FROM [ControleNavios] WHERE [NumeroViagem] IN ('V-2025-001','V-2025-002','V-2025-003')");
    }

    // ─────────────────────────────────────────────────────────────────────
    // NAVIOS
    // ─────────────────────────────────────────────────────────────────────

    private static void SeedNavios(MigrationBuilder m)
    {
        var navios = new[]
        {
            ("V-2025-001", "COSCO HARMONY",     "Navio principal rota Ásia–Santos",          true),
            ("V-2025-002", "MSC MARINA",         "Navio rota Ásia–Paranaguá via Roterdã",    true),
            ("V-2025-003", "CMA CGM JADE",       "Navio rota Qingdao–Itajaí direto",          true),
        };

        foreach (var (viagem, nome, obs, ativo) in navios)
            InsertIfNotExists(m, "ControleNavios", "NumeroViagem", viagem,
                $"INSERT INTO [ControleNavios] ([NumeroViagem],[NomeNavio],[Observacao],[Ativo],[CriadoEm],[AtualizadoEm]) " +
                $"VALUES (N'{viagem}',N'{nome}',N'{obs}',{(ativo ? 1 : 0)},GETUTCDATE(),GETUTCDATE())");
    }

    // ─────────────────────────────────────────────────────────────────────
    // TRAJETOS
    // ─────────────────────────────────────────────────────────────────────

    private static void SeedTrajetos(MigrationBuilder m)
    {
        // V-2025-001: SHA -> BRSSZ
        m.Sql(@"
IF NOT EXISTS (
    SELECT 1 FROM [ControleNaviosTrajetos] t
    INNER JOIN [ControleNavios] n ON n.Id = t.ControleNavioId
    WHERE n.NumeroViagem = N'V-2025-001'
      AND t.PortoOrigemId  = (SELECT Id FROM PortosOrigem  WHERE Codigo = N'SHA')
      AND t.PortoDestinoId = (SELECT Id FROM PortosDestino WHERE Codigo = N'BRSSZ')
)
BEGIN
    INSERT INTO [ControleNaviosTrajetos]
        ([ControleNavioId],[PortoOrigemId],[PortoDestinoId],[Etd],[Eta],[TrajetoDescricao],[CriadoEm],[AtualizadoEm])
    VALUES (
        (SELECT Id FROM ControleNavios WHERE NumeroViagem = N'V-2025-001'),
        (SELECT Id FROM PortosOrigem   WHERE Codigo = N'SHA'),
        (SELECT Id FROM PortosDestino  WHERE Codigo = N'BRSSZ'),
        '2025-08-01T00:00:00Z',
        '2025-09-10T00:00:00Z',
        N'Trânsito direto Shanghai–Santos',
        GETUTCDATE(), GETUTCDATE()
    )
END");

        // V-2025-002: NGB -> BRPNG
        m.Sql(@"
IF NOT EXISTS (
    SELECT 1 FROM [ControleNaviosTrajetos] t
    INNER JOIN [ControleNavios] n ON n.Id = t.ControleNavioId
    WHERE n.NumeroViagem = N'V-2025-002'
      AND t.PortoOrigemId  = (SELECT Id FROM PortosOrigem  WHERE Codigo = N'NGB')
      AND t.PortoDestinoId = (SELECT Id FROM PortosDestino WHERE Codigo = N'BRPNG')
)
BEGIN
    INSERT INTO [ControleNaviosTrajetos]
        ([ControleNavioId],[PortoOrigemId],[PortoDestinoId],[Etd],[Eta],[TrajetoDescricao],[CriadoEm],[AtualizadoEm])
    VALUES (
        (SELECT Id FROM ControleNavios WHERE NumeroViagem = N'V-2025-002'),
        (SELECT Id FROM PortosOrigem   WHERE Codigo = N'NGB'),
        (SELECT Id FROM PortosDestino  WHERE Codigo = N'BRPNG'),
        '2025-08-15T00:00:00Z',
        '2025-09-28T00:00:00Z',
        N'Trânsito Ningbo–Paranaguá via Roterdã',
        GETUTCDATE(), GETUTCDATE()
    )
END");

        // V-2025-003: TAO -> BRITJ
        m.Sql(@"
IF NOT EXISTS (
    SELECT 1 FROM [ControleNaviosTrajetos] t
    INNER JOIN [ControleNavios] n ON n.Id = t.ControleNavioId
    WHERE n.NumeroViagem = N'V-2025-003'
      AND t.PortoOrigemId  = (SELECT Id FROM PortosOrigem  WHERE Codigo = N'TAO')
      AND t.PortoDestinoId = (SELECT Id FROM PortosDestino WHERE Codigo = N'BRITJ')
)
BEGIN
    INSERT INTO [ControleNaviosTrajetos]
        ([ControleNavioId],[PortoOrigemId],[PortoDestinoId],[Etd],[Eta],[TrajetoDescricao],[CriadoEm],[AtualizadoEm])
    VALUES (
        (SELECT Id FROM ControleNavios WHERE NumeroViagem = N'V-2025-003'),
        (SELECT Id FROM PortosOrigem   WHERE Codigo = N'TAO'),
        (SELECT Id FROM PortosDestino  WHERE Codigo = N'BRITJ'),
        '2025-09-01T00:00:00Z',
        '2025-10-05T00:00:00Z',
        N'Trânsito direto Qingdao–Itajaí',
        GETUTCDATE(), GETUTCDATE()
    )
END");
    }

    // ─────────────────────────────────────────────────────────────────────
    // HELPER
    // ─────────────────────────────────────────────────────────────────────

    private static void InsertIfNotExists(
        MigrationBuilder m,
        string table,
        string checkColumn,
        string checkValue,
        string insertSql)
    {
        m.Sql($@"
IF NOT EXISTS (SELECT 1 FROM [{table}] WHERE [{checkColumn}] = N'{checkValue}')
BEGIN
    {insertSql}
END");
    }
}
