using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Comex133Api.Migrations
{
    /// <inheritdoc />
    public partial class RemoveStatusDespachante : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Coluna Status mantida — usada internamente com valor fixo "PendenteDespachante"
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}
