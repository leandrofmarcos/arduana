using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Comex133Api.Migrations
{
    /// <inheritdoc />
    public partial class Phase5SeedNaviosIniciais : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            Comex133Api.Core.Database.Seeds.Phase5SeedNavios.Up(migrationBuilder);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            Comex133Api.Core.Database.Seeds.Phase5SeedNavios.Down(migrationBuilder);
        }
    }
}
