using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Comex133Api.Migrations
{
    /// <inheritdoc />
    public partial class Phase5NaviosCadastroETrajetoOperacional : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Navios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NomeNavio = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    CodigoImo = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Armador = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    Observacao = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Ativo = table.Column<bool>(type: "bit", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Navios", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "NaviosTrajetos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NavioId = table.Column<int>(type: "int", nullable: false),
                    NumeroViagem = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Sequencia = table.Column<int>(type: "int", nullable: false),
                    PortoOrigemId = table.Column<int>(type: "int", nullable: false),
                    PortoDestinoId = table.Column<int>(type: "int", nullable: false),
                    Etd = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Eta = table.Column<DateTime>(type: "datetime2", nullable: false),
                    StatusPerna = table.Column<int>(type: "int", nullable: false),
                    Observacao = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    CriadoEm = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NaviosTrajetos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NaviosTrajetos_Navios_NavioId",
                        column: x => x.NavioId,
                        principalTable: "Navios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_NaviosTrajetos_PortosDestino_PortoDestinoId",
                        column: x => x.PortoDestinoId,
                        principalTable: "PortosDestino",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_NaviosTrajetos_PortosOrigem_PortoOrigemId",
                        column: x => x.PortoOrigemId,
                        principalTable: "PortosOrigem",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EmbarqueNavioVinculos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmbarqueAduanaId = table.Column<int>(type: "int", nullable: false),
                    NavioId = table.Column<int>(type: "int", nullable: false),
                    NavioTrajetoId = table.Column<int>(type: "int", nullable: true),
                    NumeroViagem = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Ativo = table.Column<bool>(type: "bit", nullable: false),
                    VinculadoEm = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DesvinculadoEm = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Observacao = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CriadoEm = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmbarqueNavioVinculos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EmbarqueNavioVinculos_NaviosTrajetos_NavioTrajetoId",
                        column: x => x.NavioTrajetoId,
                        principalTable: "NaviosTrajetos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_EmbarqueNavioVinculos_Navios_NavioId",
                        column: x => x.NavioId,
                        principalTable: "Navios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EmbarqueNavioVinculos_SolicitacoesOrcamento_EmbarqueAduanaId",
                        column: x => x.EmbarqueAduanaId,
                        principalTable: "SolicitacoesOrcamento",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EmbarqueNavioVinculos_EmbarqueAduanaId",
                table: "EmbarqueNavioVinculos",
                column: "EmbarqueAduanaId");

            migrationBuilder.CreateIndex(
                name: "IX_EmbarqueNavioVinculos_NavioId",
                table: "EmbarqueNavioVinculos",
                column: "NavioId");

            migrationBuilder.CreateIndex(
                name: "IX_EmbarqueNavioVinculos_NavioTrajetoId",
                table: "EmbarqueNavioVinculos",
                column: "NavioTrajetoId");

            migrationBuilder.CreateIndex(
                name: "IX_NaviosTrajetos_NavioId",
                table: "NaviosTrajetos",
                column: "NavioId");

            migrationBuilder.CreateIndex(
                name: "IX_NaviosTrajetos_PortoDestinoId",
                table: "NaviosTrajetos",
                column: "PortoDestinoId");

            migrationBuilder.CreateIndex(
                name: "IX_NaviosTrajetos_PortoOrigemId",
                table: "NaviosTrajetos",
                column: "PortoOrigemId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EmbarqueNavioVinculos");

            migrationBuilder.DropTable(
                name: "NaviosTrajetos");

            migrationBuilder.DropTable(
                name: "Navios");
        }
    }
}
