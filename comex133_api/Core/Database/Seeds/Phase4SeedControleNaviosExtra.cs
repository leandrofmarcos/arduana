using Microsoft.EntityFrameworkCore.Migrations;

namespace Comex133Api.Core.Database.Seeds;

/// <summary>
/// Seed adicional de ControleNavios para facilitar testes funcionais.
///
/// Inclui viagens extras e trajetos complementares mantendo idempotencia.
/// </summary>
public static class Phase4SeedControleNaviosExtra
{
    public static void Up(MigrationBuilder m)
    {
        SeedNavios(m);
        SeedTrajetos(m);
    }

    public static void Down(MigrationBuilder m)
    {
        m.Sql("DELETE FROM [ControleNaviosTrajetos] WHERE [ControleNavioId] IN (SELECT [Id] FROM [ControleNavios] WHERE [NumeroViagem] IN ('V-2025-004','V-2025-005','V-2025-006','V-2025-007','V-2025-008'))");
        m.Sql("DELETE FROM [ControleNavios] WHERE [NumeroViagem] IN ('V-2025-004','V-2025-005','V-2025-006','V-2025-007','V-2025-008')");
    }

    private static void SeedNavios(MigrationBuilder m)
    {
        var navios = new[]
        {
            ("V-2025-004", "EVER LIBRA",      "Viagem com escala em Hong Kong", true),
            ("V-2025-005", "MAERSK ORION",    "Viagem com destino Rio de Janeiro", true),
            ("V-2025-006", "ONE INTEGRITY",   "Viagem para Porto do Pecem", true),
            ("V-2025-007", "HAPAG ASTRA",     "Viagem de teste para Itajai", false),
            ("V-2025-008", "COSCO PACIFIC",   "Viagem de teste para Santos", true),
        };

        foreach (var (viagem, nome, obs, ativo) in navios)
            InsertIfNotExists(m, "ControleNavios", "NumeroViagem", viagem,
                $"INSERT INTO [ControleNavios] ([NumeroViagem],[NomeNavio],[Observacao],[Ativo],[CriadoEm],[AtualizadoEm]) " +
                $"VALUES (N'{viagem}',N'{nome}',N'{obs}',{(ativo ? 1 : 0)},GETUTCDATE(),GETUTCDATE())");
    }

    private static void SeedTrajetos(MigrationBuilder m)
    {
        SeedTrajeto(m, "V-2025-004", "HKG", "BRRJO", "2025-09-12T00:00:00Z", "2025-10-20T00:00:00Z", "Hong Kong para Rio de Janeiro");
        SeedTrajeto(m, "V-2025-005", "GZH", "BRRJO", "2025-09-25T00:00:00Z", "2025-11-01T00:00:00Z", "Guangzhou para Rio de Janeiro");
        SeedTrajeto(m, "V-2025-006", "SHA", "BRPCE", "2025-10-03T00:00:00Z", "2025-11-14T00:00:00Z", "Shanghai para Pecem");
        SeedTrajeto(m, "V-2025-007", "TAO", "BRITJ", "2025-10-08T00:00:00Z", "2025-11-11T00:00:00Z", "Qingdao para Itajai");
        SeedTrajeto(m, "V-2025-008", "NGB", "BRSSZ", "2025-10-15T00:00:00Z", "2025-11-22T00:00:00Z", "Ningbo para Santos");
    }

    private static void SeedTrajeto(
        MigrationBuilder m,
        string numeroViagem,
        string codigoOrigem,
        string codigoDestino,
        string etd,
        string eta,
        string descricao)
    {
        m.Sql($@"
IF NOT EXISTS (
    SELECT 1 FROM [ControleNaviosTrajetos] t
    INNER JOIN [ControleNavios] n ON n.Id = t.ControleNavioId
    WHERE n.NumeroViagem = N'{numeroViagem}'
      AND t.PortoOrigemId = (SELECT Id FROM PortosOrigem WHERE Codigo = N'{codigoOrigem}')
      AND t.PortoDestinoId = (SELECT Id FROM PortosDestino WHERE Codigo = N'{codigoDestino}')
)
BEGIN
    INSERT INTO [ControleNaviosTrajetos]
        ([ControleNavioId],[PortoOrigemId],[PortoDestinoId],[Etd],[Eta],[TrajetoDescricao],[CriadoEm],[AtualizadoEm])
    VALUES (
        (SELECT Id FROM ControleNavios WHERE NumeroViagem = N'{numeroViagem}'),
        (SELECT Id FROM PortosOrigem WHERE Codigo = N'{codigoOrigem}'),
        (SELECT Id FROM PortosDestino WHERE Codigo = N'{codigoDestino}'),
        '{etd}',
        '{eta}',
        N'{descricao}',
        GETUTCDATE(),
        GETUTCDATE()
    )
END");
    }

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
