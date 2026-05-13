using Comex133Api.Core.Database;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Comex133Api.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260512120000_AddCustoInternoIdToOrcamentoVenda")]
    public partial class AddCustoInternoIdToOrcamentoVenda : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CustoInternoId",
                table: "OrcamentosVenda",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrcamentosVenda_CustoInternoId",
                table: "OrcamentosVenda",
                column: "CustoInternoId");

            migrationBuilder.AddForeignKey(
                name: "FK_OrcamentosVenda_CustosDespachante_CustoInternoId",
                table: "OrcamentosVenda",
                column: "CustoInternoId",
                principalTable: "CustosDespachante",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OrcamentosVenda_CustosDespachante_CustoInternoId",
                table: "OrcamentosVenda");

            migrationBuilder.DropIndex(
                name: "IX_OrcamentosVenda_CustoInternoId",
                table: "OrcamentosVenda");

            migrationBuilder.DropColumn(
                name: "CustoInternoId",
                table: "OrcamentosVenda");
        }
    }
}
