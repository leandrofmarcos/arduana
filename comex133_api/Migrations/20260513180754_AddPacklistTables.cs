using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Comex133Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPacklistTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Packlists",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SolicitacaoOrcamentoId = table.Column<int>(type: "int", nullable: false),
                    NomeArquivo = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    ExtensaoArquivo = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    CaminhoArquivo = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    TotalLinhas = table.Column<int>(type: "int", nullable: false),
                    ColunaNCM = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ColunaDescricao = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ColunaPreco = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    TemCelulasMescladas = table.Column<bool>(type: "bit", nullable: false),
                    DataUpload = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UploadPorUsuarioId = table.Column<int>(type: "int", nullable: true),
                    CriadoEm = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Packlists", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Packlists_SolicitacoesOrcamento_SolicitacaoOrcamentoId",
                        column: x => x.SolicitacaoOrcamentoId,
                        principalTable: "SolicitacoesOrcamento",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PacklistItens",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PacklistId = table.Column<int>(type: "int", nullable: false),
                    NumeroLinha = table.Column<int>(type: "int", nullable: false),
                    DadosJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NCM = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Descricao = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Preco = table.Column<decimal>(type: "decimal(18,4)", nullable: true),
                    CriadoEm = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PacklistItens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PacklistItens_Packlists_PacklistId",
                        column: x => x.PacklistId,
                        principalTable: "Packlists",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PacklistItens_PacklistId",
                table: "PacklistItens",
                column: "PacklistId");

            migrationBuilder.CreateIndex(
                name: "IX_Packlists_SolicitacaoOrcamentoId",
                table: "Packlists",
                column: "SolicitacaoOrcamentoId",
                unique: true);

        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PacklistItens");

            migrationBuilder.DropTable(
                name: "Packlists");

        }
    }
}
