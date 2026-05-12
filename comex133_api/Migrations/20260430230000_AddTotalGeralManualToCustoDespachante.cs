using Comex133Api.Core.Database;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Comex133Api.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260430230000_AddTotalGeralManualToCustoDespachante")]
    public partial class AddTotalGeralManualToCustoDespachante : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "TotalGeralManual",
                table: "CustosDespachante",
                type: "decimal(18,2)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TotalGeralManual",
                table: "CustosDespachante");
        }
    }
}
