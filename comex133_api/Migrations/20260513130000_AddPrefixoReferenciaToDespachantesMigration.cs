using Comex133Api.Core.Database;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Comex133Api.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260513130000_AddPrefixoReferenciaToDespachantesMigration")]
    public partial class AddPrefixoReferenciaToDespachantesMigration : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PrefixoReferencia",
                table: "Despachantes",
                type: "nvarchar(3)",
                maxLength: 3,
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PrefixoReferencia",
                table: "Despachantes");
        }
    }
}
