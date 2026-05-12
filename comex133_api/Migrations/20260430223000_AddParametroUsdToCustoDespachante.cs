using Comex133Api.Core.Database;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Comex133Api.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260430223000_AddParametroUsdToCustoDespachante")]
    public partial class AddParametroUsdToCustoDespachante : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "ParametroUsd",
                table: "CustosDespachante",
                type: "decimal(18,4)",
                nullable: false,
                defaultValue: 0m);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ParametroUsd",
                table: "CustosDespachante");
        }
    }
}
