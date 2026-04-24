using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Comex133Api.Migrations
{
    /// <inheritdoc />
    public partial class OP_FluxoOperacional : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CustosDespachante",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CodigoInterno = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    SolicitacaoOrcamentoId = table.Column<int>(type: "int", nullable: true),
                    DespachanteId = table.Column<int>(type: "int", nullable: false),
                    ImportadorId = table.Column<int>(type: "int", nullable: true),
                    PortoOrigemId = table.Column<int>(type: "int", nullable: false),
                    PortoDestinoId = table.Column<int>(type: "int", nullable: false),
                    Responsavel = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TamContainer = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    Peso = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    FobUsd = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    FobReais = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    CifUsd = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    CifReais = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    SeguroUsd = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    TaxaUsd = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    TaxaUsdAgente = table.Column<decimal>(type: "decimal(18,4)", nullable: true),
                    Observacao = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Data = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: false),
                    Versao = table.Column<int>(type: "int", nullable: false),
                    VersaoAnteriorId = table.Column<int>(type: "int", nullable: true),
                    Imutavel = table.Column<bool>(type: "bit", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustosDespachante", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CustosDespachante_CustosDespachante_VersaoAnteriorId",
                        column: x => x.VersaoAnteriorId,
                        principalTable: "CustosDespachante",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.NoAction);
                    table.ForeignKey(
                        name: "FK_CustosDespachante_Despachantes_DespachanteId",
                        column: x => x.DespachanteId,
                        principalTable: "Despachantes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CustosDespachante_Importadores_ImportadorId",
                        column: x => x.ImportadorId,
                        principalTable: "Importadores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CustosDespachante_PortosDestino_PortoDestinoId",
                        column: x => x.PortoDestinoId,
                        principalTable: "PortosDestino",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CustosDespachante_PortosOrigem_PortoOrigemId",
                        column: x => x.PortoOrigemId,
                        principalTable: "PortosOrigem",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CustosDespachante_SolicitacoesOrcamento_SolicitacaoOrcamentoId",
                        column: x => x.SolicitacaoOrcamentoId,
                        principalTable: "SolicitacoesOrcamento",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "OrcamentosVenda",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CodigoInterno = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    ClienteId = table.Column<int>(type: "int", nullable: true),
                    SolicitacaoOrcamentoId = table.Column<int>(type: "int", nullable: true),
                    Data = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TamContainer = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    PesoBruto = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    PesoLiquido = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    FreteInternacional = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    CifReais = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    CifUsd = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    FobReais = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    FobUsd = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    TaxaUsd = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    Honorarios = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    TotalImpostos = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    TotalDespesas = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    TotalExtras = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    TotalGeral = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    Observacao = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrcamentosVenda", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrcamentosVenda_Clientes_ClienteId",
                        column: x => x.ClienteId,
                        principalTable: "Clientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OrcamentosVenda_SolicitacoesOrcamento_SolicitacaoOrcamentoId",
                        column: x => x.SolicitacaoOrcamentoId,
                        principalTable: "SolicitacoesOrcamento",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CustosDespachanteDespesas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CustoDespachanteId = table.Column<int>(type: "int", nullable: false),
                    Descricao = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Valor = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    Data = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EntraBaseIcms = table.Column<bool>(type: "bit", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustosDespachanteDespesas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CustosDespachanteDespesas_CustosDespachante_CustoDespachanteId",
                        column: x => x.CustoDespachanteId,
                        principalTable: "CustosDespachante",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CustosDespachanteLi",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CustoDespachanteId = table.Column<int>(type: "int", nullable: false),
                    Ncm = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Descricao = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Valor = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    Data = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustosDespachanteLi", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CustosDespachanteLi_CustosDespachante_CustoDespachanteId",
                        column: x => x.CustoDespachanteId,
                        principalTable: "CustosDespachante",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "NcmsVinculadosCusto",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CustoDespachanteId = table.Column<int>(type: "int", nullable: false),
                    NcmId = table.Column<int>(type: "int", nullable: true),
                    NumeroNcm = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Descricao = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    AliIi = table.Column<decimal>(type: "decimal(8,4)", nullable: false),
                    AliIpi = table.Column<decimal>(type: "decimal(8,4)", nullable: false),
                    AliPis = table.Column<decimal>(type: "decimal(8,4)", nullable: false),
                    AliCofins = table.Column<decimal>(type: "decimal(8,4)", nullable: false),
                    AliIcms = table.Column<decimal>(type: "decimal(8,4)", nullable: false),
                    BaseCalculo = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NcmsVinculadosCusto", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NcmsVinculadosCusto_CustosDespachante_CustoDespachanteId",
                        column: x => x.CustoDespachanteId,
                        principalTable: "CustosDespachante",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_NcmsVinculadosCusto_Ncms_NcmId",
                        column: x => x.NcmId,
                        principalTable: "Ncms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateTable(
                name: "OrcamentosVendaCustos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrcamentoVendaId = table.Column<int>(type: "int", nullable: false),
                    CustoDespachanteId = table.Column<int>(type: "int", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrcamentosVendaCustos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrcamentosVendaCustos_CustosDespachante_CustoDespachanteId",
                        column: x => x.CustoDespachanteId,
                        principalTable: "CustosDespachante",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OrcamentosVendaCustos_OrcamentosVenda_OrcamentoVendaId",
                        column: x => x.OrcamentoVendaId,
                        principalTable: "OrcamentosVenda",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OrcamentosVendaDespesas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrcamentoVendaId = table.Column<int>(type: "int", nullable: false),
                    Descricao = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Valor = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrcamentosVendaDespesas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrcamentosVendaDespesas_OrcamentosVenda_OrcamentoVendaId",
                        column: x => x.OrcamentoVendaId,
                        principalTable: "OrcamentosVenda",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OrcamentosVendaDespesasExtras",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrcamentoVendaId = table.Column<int>(type: "int", nullable: false),
                    Descricao = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Valor = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrcamentosVendaDespesasExtras", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrcamentosVendaDespesasExtras_OrcamentosVenda_OrcamentoVendaId",
                        column: x => x.OrcamentoVendaId,
                        principalTable: "OrcamentosVenda",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ValoresImpostoCusto",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NcmVinculadoCustoId = table.Column<int>(type: "int", nullable: false),
                    AliIi = table.Column<decimal>(type: "decimal(8,4)", nullable: false),
                    ValorIi = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    AliIpi = table.Column<decimal>(type: "decimal(8,4)", nullable: false),
                    ValorIpi = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    AliPis = table.Column<decimal>(type: "decimal(8,4)", nullable: false),
                    ValorPis = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    AliCofins = table.Column<decimal>(type: "decimal(8,4)", nullable: false),
                    ValorCofins = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    AliIcms = table.Column<decimal>(type: "decimal(8,4)", nullable: false),
                    ValorIcms = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    TotalImpostos = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ValoresImpostoCusto", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ValoresImpostoCusto_NcmsVinculadosCusto_NcmVinculadoCustoId",
                        column: x => x.NcmVinculadoCustoId,
                        principalTable: "NcmsVinculadosCusto",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CustosDespachante_CodigoInterno",
                table: "CustosDespachante",
                column: "CodigoInterno",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CustosDespachante_DespachanteId",
                table: "CustosDespachante",
                column: "DespachanteId");

            migrationBuilder.CreateIndex(
                name: "IX_CustosDespachante_ImportadorId",
                table: "CustosDespachante",
                column: "ImportadorId");

            migrationBuilder.CreateIndex(
                name: "IX_CustosDespachante_PortoDestinoId",
                table: "CustosDespachante",
                column: "PortoDestinoId");

            migrationBuilder.CreateIndex(
                name: "IX_CustosDespachante_PortoOrigemId",
                table: "CustosDespachante",
                column: "PortoOrigemId");

            migrationBuilder.CreateIndex(
                name: "IX_CustosDespachante_SolicitacaoOrcamentoId",
                table: "CustosDespachante",
                column: "SolicitacaoOrcamentoId");

            migrationBuilder.CreateIndex(
                name: "IX_CustosDespachante_Status",
                table: "CustosDespachante",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_CustosDespachante_VersaoAnteriorId",
                table: "CustosDespachante",
                column: "VersaoAnteriorId");

            migrationBuilder.CreateIndex(
                name: "IX_CustosDespachanteDespesas_CustoDespachanteId",
                table: "CustosDespachanteDespesas",
                column: "CustoDespachanteId");

            migrationBuilder.CreateIndex(
                name: "IX_CustosDespachanteLi_CustoDespachanteId",
                table: "CustosDespachanteLi",
                column: "CustoDespachanteId");

            migrationBuilder.CreateIndex(
                name: "IX_NcmsVinculadosCusto_CustoDespachanteId",
                table: "NcmsVinculadosCusto",
                column: "CustoDespachanteId");

            migrationBuilder.CreateIndex(
                name: "IX_NcmsVinculadosCusto_NcmId",
                table: "NcmsVinculadosCusto",
                column: "NcmId");

            migrationBuilder.CreateIndex(
                name: "IX_OrcamentosVenda_ClienteId",
                table: "OrcamentosVenda",
                column: "ClienteId");

            migrationBuilder.CreateIndex(
                name: "IX_OrcamentosVenda_CodigoInterno",
                table: "OrcamentosVenda",
                column: "CodigoInterno",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrcamentosVenda_SolicitacaoOrcamentoId",
                table: "OrcamentosVenda",
                column: "SolicitacaoOrcamentoId");

            migrationBuilder.CreateIndex(
                name: "IX_OrcamentosVendaCustos_CustoDespachanteId",
                table: "OrcamentosVendaCustos",
                column: "CustoDespachanteId");

            migrationBuilder.CreateIndex(
                name: "IX_OrcamentosVendaCustos_OrcamentoVendaId_CustoDespachanteId",
                table: "OrcamentosVendaCustos",
                columns: new[] { "OrcamentoVendaId", "CustoDespachanteId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrcamentosVendaDespesas_OrcamentoVendaId",
                table: "OrcamentosVendaDespesas",
                column: "OrcamentoVendaId");

            migrationBuilder.CreateIndex(
                name: "IX_OrcamentosVendaDespesasExtras_OrcamentoVendaId",
                table: "OrcamentosVendaDespesasExtras",
                column: "OrcamentoVendaId");

            migrationBuilder.CreateIndex(
                name: "IX_ValoresImpostoCusto_NcmVinculadoCustoId",
                table: "ValoresImpostoCusto",
                column: "NcmVinculadoCustoId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CustosDespachanteDespesas");

            migrationBuilder.DropTable(
                name: "CustosDespachanteLi");

            migrationBuilder.DropTable(
                name: "OrcamentosVendaCustos");

            migrationBuilder.DropTable(
                name: "OrcamentosVendaDespesas");

            migrationBuilder.DropTable(
                name: "OrcamentosVendaDespesasExtras");

            migrationBuilder.DropTable(
                name: "ValoresImpostoCusto");

            migrationBuilder.DropTable(
                name: "OrcamentosVenda");

            migrationBuilder.DropTable(
                name: "NcmsVinculadosCusto");

            migrationBuilder.DropTable(
                name: "CustosDespachante");
        }
    }
}
