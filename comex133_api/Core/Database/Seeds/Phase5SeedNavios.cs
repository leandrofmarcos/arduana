using Microsoft.EntityFrameworkCore.Migrations;

namespace Comex133Api.Core.Database.Seeds;

/// <summary>Seeds iniciais para Navios (cadastro mestre) e NavioTrajetos (pernas de viagem)</summary>
public static class Phase5SeedNavios
{
    public static void Up(MigrationBuilder m)
    {
        // Limpar dados anteriores se existirem (para re-run seguro)
        m.Sql("DELETE FROM [EmbarqueNavioVinculos] WHERE 1=1");
        m.Sql("DELETE FROM [NaviosTrajetos] WHERE 1=1");
        m.Sql("DELETE FROM [Navios] WHERE 1=1");

        // ── Inserir Navios ───────────────────────────────────────────────────
        m.Sql(@"
INSERT INTO [Navios] ([NomeNavio],[CodigoImo],[Armador],[Observacao],[Ativo],[CriadoEm],[AtualizadoEm])
VALUES
  ('MSC Aurora',     '9876543', 'MSC',        NULL, 1, GETUTCDATE(), GETUTCDATE()),
  ('Evergreen Lotus','8765432', 'Evergreen',   NULL, 1, GETUTCDATE(), GETUTCDATE()),
  ('CMA Albatross',  '7654321', 'CMA CGM',     NULL, 1, GETUTCDATE(), GETUTCDATE()),
  ('Cosco Pacific',  '6543210', 'COSCO',       NULL, 1, GETUTCDATE(), GETUTCDATE()),
  ('Hapag Bremen',   '5432109', 'Hapag-Lloyd', 'Navio reserva', 0, GETUTCDATE(), GETUTCDATE())
");

        // ── Inserir NavioTrajetos usando nomes para obter IDs ────────────────
        // Viagem MSC Aurora: HKG -> Santos -> Itajaí
        m.Sql(@"
      DECLARE @hkg INT = (SELECT TOP 1 Id FROM PortosOrigem WHERE Codigo = 'HKG')
      DECLARE @ssh INT = (SELECT TOP 1 Id FROM PortosOrigem WHERE Codigo = 'SHA')
      DECLARE @ssz INT = (SELECT TOP 1 Id FROM PortosDestino WHERE Codigo = 'BRSSZ')
      DECLARE @itj INT = (SELECT TOP 1 Id FROM PortosDestino WHERE Codigo = 'BRITJ')
      DECLARE @pce INT = (SELECT TOP 1 Id FROM PortosDestino WHERE Codigo = 'BRPCE')
      DECLARE @rjo INT = (SELECT TOP 1 Id FROM PortosDestino WHERE Codigo = 'BRRJO')
        DECLARE @ngb INT = (SELECT TOP 1 Id FROM PortosOrigem WHERE Codigo = 'NGB')
DECLARE @navioAurora   INT = (SELECT TOP 1 Id FROM Navios WHERE NomeNavio = 'MSC Aurora')
DECLARE @navioLotus    INT = (SELECT TOP 1 Id FROM Navios WHERE NomeNavio = 'Evergreen Lotus')
DECLARE @navioAlbatros INT = (SELECT TOP 1 Id FROM Navios WHERE NomeNavio = 'CMA Albatross')
DECLARE @navioCosco    INT = (SELECT TOP 1 Id FROM Navios WHERE NomeNavio = 'Cosco Pacific')

INSERT INTO [NaviosTrajetos]
  ([NavioId],[NumeroViagem],[Sequencia],[PortoOrigemId],[PortoDestinoId],[Etd],[Eta],[StatusPerna],[Observacao],[CriadoEm],[AtualizadoEm])
VALUES
  -- MSC Aurora V-2026-041: HKG->Santos (atracado), Santos->Itajai (previsto)
  (@navioAurora,   'V-2026-041', 1, @hkg, @ssz,  '2026-03-15', '2026-04-30', 2 /*Atracado*/,   NULL, GETUTCDATE(), GETUTCDATE()),
  (@navioAurora,   'V-2026-041', 2, @hkg, @itj,  '2026-05-03', '2026-05-06', 0 /*Previsto*/,   NULL, GETUTCDATE(), GETUTCDATE()),

  -- Evergreen Lotus V-2026-022: SHA->Fortaleza (em transito)
  (@navioLotus,    'V-2026-022', 1, @ssh, @pce,  '2026-04-01', '2026-05-20', 1 /*EmTransito*/, NULL, GETUTCDATE(), GETUTCDATE()),

  -- CMA Albatross V-2026-015: GZH->Rio de Janeiro (em transito)
          (@navioAlbatros, 'V-2026-015', 1, @ngb, @rjo,  '2026-04-10', '2026-05-25', 1 /*EmTransito*/, NULL, GETUTCDATE(), GETUTCDATE()),

  -- Cosco Pacific V-2026-033: HKG->Santos (previsto)
          (@navioCosco,    'V-2026-033', 1, @hkg, @ssz,  '2026-05-01', '2026-06-10', 0 /*Previsto*/,   NULL, GETUTCDATE(), GETUTCDATE())
");
    }

    public static void Down(MigrationBuilder m)
    {
        m.Sql("DELETE FROM [EmbarqueNavioVinculos] WHERE 1=1");
        m.Sql("DELETE FROM [NaviosTrajetos] WHERE 1=1");
        m.Sql("DELETE FROM [Navios] WHERE 1=1");
    }
}
