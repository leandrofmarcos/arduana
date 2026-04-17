using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Comex133Api.Migrations
{
    /// <inheritdoc />
    public partial class AddControleNavios : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ControleNavios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NumeroViagem = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    NomeNavio = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Observacao = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Ativo = table.Column<bool>(type: "bit", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ControleNavios", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ControleNaviosTrajetos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ControleNavioId = table.Column<int>(type: "int", nullable: false),
                    PortoOrigemId = table.Column<int>(type: "int", nullable: false),
                    PortoDestinoId = table.Column<int>(type: "int", nullable: false),
                    Etd = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Eta = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TrajetoDescricao = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    CriadoEm = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ControleNaviosTrajetos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ControleNaviosTrajetos_ControleNavios_ControleNavioId",
                        column: x => x.ControleNavioId,
                        principalTable: "ControleNavios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ControleNaviosTrajetos_PortosDestino_PortoDestinoId",
                        column: x => x.PortoDestinoId,
                        principalTable: "PortosDestino",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ControleNaviosTrajetos_PortosOrigem_PortoOrigemId",
                        column: x => x.PortoOrigemId,
                        principalTable: "PortosOrigem",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ControleNavios_NumeroViagem",
                table: "ControleNavios",
                column: "NumeroViagem",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ControleNaviosTrajetos_ControleNavioId",
                table: "ControleNaviosTrajetos",
                column: "ControleNavioId");

            migrationBuilder.CreateIndex(
                name: "IX_ControleNaviosTrajetos_PortoDestinoId",
                table: "ControleNaviosTrajetos",
                column: "PortoDestinoId");

            migrationBuilder.CreateIndex(
                name: "IX_ControleNaviosTrajetos_PortoOrigemId",
                table: "ControleNaviosTrajetos",
                column: "PortoOrigemId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ControleNaviosTrajetos");

            migrationBuilder.DropTable(
                name: "ControleNavios");
        }
    }
}
