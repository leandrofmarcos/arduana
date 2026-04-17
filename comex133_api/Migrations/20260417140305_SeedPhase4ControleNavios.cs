using Microsoft.EntityFrameworkCore.Migrations;
using Comex133Api.Core.Database.Seeds;

#nullable disable

namespace Comex133Api.Migrations
{
    /// <summary>
    /// Migration de seed para dados de ControleNavios da Fase 4.
    /// Cria 3 navios de exemplo com trajetos entre portos asiaticos e brasileiros.
    ///
    /// Aplicar: dotnet ef database update
    /// Reverter: dotnet ef database update AddControleNavios
    /// </summary>
    public partial class SeedPhase4ControleNavios : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            Phase4SeedControleNavios.Up(migrationBuilder);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            Phase4SeedControleNavios.Down(migrationBuilder);
        }
    }
}
