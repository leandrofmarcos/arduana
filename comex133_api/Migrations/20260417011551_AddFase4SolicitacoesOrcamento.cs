using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Comex133Api.Migrations
{
    /// <inheritdoc />
    public partial class AddFase4SolicitacoesOrcamento : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SolicitacoesOrcamento",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CodigoInterno = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    ClienteId = table.Column<int>(type: "int", nullable: true),
                    ImportadorId = table.Column<int>(type: "int", nullable: true),
                    PortoOrigemId = table.Column<int>(type: "int", nullable: false),
                    PortoDestinoId = table.Column<int>(type: "int", nullable: false),
                    Responsavel = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TamContainer = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    Peso = table.Column<decimal>(type: "decimal(18,3)", nullable: false),
                    Observacao = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: false),
                    Data = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SolicitacoesOrcamento", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SolicitacoesOrcamento_Clientes_ClienteId",
                        column: x => x.ClienteId,
                        principalTable: "Clientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SolicitacoesOrcamento_Importadores_ImportadorId",
                        column: x => x.ImportadorId,
                        principalTable: "Importadores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SolicitacoesOrcamento_PortosDestino_PortoDestinoId",
                        column: x => x.PortoDestinoId,
                        principalTable: "PortosDestino",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SolicitacoesOrcamento_PortosOrigem_PortoOrigemId",
                        column: x => x.PortoOrigemId,
                        principalTable: "PortosOrigem",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SolicitacoesOrcamentoDespachantes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SolicitacaoOrcamentoId = table.Column<int>(type: "int", nullable: false),
                    DespachanteId = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: false),
                    DataEnvio = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SolicitacoesOrcamentoDespachantes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SolicitacoesOrcamentoDespachantes_Despachantes_DespachanteId",
                        column: x => x.DespachanteId,
                        principalTable: "Despachantes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SolicitacoesOrcamentoDespachantes_SolicitacoesOrcamento_SolicitacaoOrcamentoId",
                        column: x => x.SolicitacaoOrcamentoId,
                        principalTable: "SolicitacoesOrcamento",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SolicitacoesOrcamentoDocumentos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SolicitacaoOrcamentoId = table.Column<int>(type: "int", nullable: false),
                    NomeArquivo = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    LinkDocumento = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    DataUpload = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Observacao = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CriadoEm = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SolicitacoesOrcamentoDocumentos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SolicitacoesOrcamentoDocumentos_SolicitacoesOrcamento_SolicitacaoOrcamentoId",
                        column: x => x.SolicitacaoOrcamentoId,
                        principalTable: "SolicitacoesOrcamento",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SolicitacoesOrcamento_ClienteId",
                table: "SolicitacoesOrcamento",
                column: "ClienteId");

            migrationBuilder.CreateIndex(
                name: "IX_SolicitacoesOrcamento_CodigoInterno",
                table: "SolicitacoesOrcamento",
                column: "CodigoInterno",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SolicitacoesOrcamento_ImportadorId",
                table: "SolicitacoesOrcamento",
                column: "ImportadorId");

            migrationBuilder.CreateIndex(
                name: "IX_SolicitacoesOrcamento_PortoDestinoId",
                table: "SolicitacoesOrcamento",
                column: "PortoDestinoId");

            migrationBuilder.CreateIndex(
                name: "IX_SolicitacoesOrcamento_PortoOrigemId",
                table: "SolicitacoesOrcamento",
                column: "PortoOrigemId");

            migrationBuilder.CreateIndex(
                name: "IX_SolicitacoesOrcamentoDespachantes_DespachanteId",
                table: "SolicitacoesOrcamentoDespachantes",
                column: "DespachanteId");

            migrationBuilder.CreateIndex(
                name: "IX_SolicitacoesOrcamentoDespachantes_SolicitacaoOrcamentoId_DespachanteId",
                table: "SolicitacoesOrcamentoDespachantes",
                columns: new[] { "SolicitacaoOrcamentoId", "DespachanteId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SolicitacoesOrcamentoDocumentos_SolicitacaoOrcamentoId",
                table: "SolicitacoesOrcamentoDocumentos",
                column: "SolicitacaoOrcamentoId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SolicitacoesOrcamentoDespachantes");

            migrationBuilder.DropTable(
                name: "SolicitacoesOrcamentoDocumentos");

            migrationBuilder.DropTable(
                name: "SolicitacoesOrcamento");
        }
    }
}
