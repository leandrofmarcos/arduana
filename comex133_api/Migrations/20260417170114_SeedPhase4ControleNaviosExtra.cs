using Comex133Api.Core.Database.Seeds;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Comex133Api.Migrations
{
    /// <summary>
    /// Seed extra de ControleNavios para massa de testes.
    /// </summary>
    public partial class SeedPhase4ControleNaviosExtra : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            Phase4SeedControleNaviosExtra.Up(migrationBuilder);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            Phase4SeedControleNaviosExtra.Down(migrationBuilder);
        }
    }
}
