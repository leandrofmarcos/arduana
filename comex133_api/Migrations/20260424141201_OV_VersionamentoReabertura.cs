using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Comex133Api.Migrations
{
    /// <inheritdoc />
    public partial class OV_VersionamentoReabertura : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Imutavel",
                table: "OrcamentosVenda",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "Versao",
                table: "OrcamentosVenda",
                type: "int",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<int>(
                name: "VersaoAnteriorId",
                table: "OrcamentosVenda",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrcamentosVenda_VersaoAnteriorId",
                table: "OrcamentosVenda",
                column: "VersaoAnteriorId");

            migrationBuilder.Sql("UPDATE OrcamentosVenda SET Versao = 1 WHERE Versao = 0");

            migrationBuilder.AddForeignKey(
                name: "FK_OrcamentosVenda_OrcamentosVenda_VersaoAnteriorId",
                table: "OrcamentosVenda",
                column: "VersaoAnteriorId",
                principalTable: "OrcamentosVenda",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OrcamentosVenda_OrcamentosVenda_VersaoAnteriorId",
                table: "OrcamentosVenda");

            migrationBuilder.DropIndex(
                name: "IX_OrcamentosVenda_VersaoAnteriorId",
                table: "OrcamentosVenda");

            migrationBuilder.DropColumn(
                name: "Imutavel",
                table: "OrcamentosVenda");

            migrationBuilder.DropColumn(
                name: "Versao",
                table: "OrcamentosVenda");

            migrationBuilder.DropColumn(
                name: "VersaoAnteriorId",
                table: "OrcamentosVenda");
        }
    }
}
