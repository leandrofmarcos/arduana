using Microsoft.EntityFrameworkCore.Migrations;
using Comex133Api.Core.Database.Seeds;

#nullable disable

namespace Comex133Api.Migrations
{
    /// <summary>
    /// Migration de seed para os dados de referência da Fase 3 — Cadastros.
    /// Popula as 12 tabelas de cadastro com dados equivalentes aos utilizados
    /// no protótipo frontend (import-costs), facilitando testes e integração.
    ///
    /// Aplicar: dotnet ef database update
    /// Reverter: dotnet ef database update AddCadastros
    /// </summary>
    public partial class SeedPhase3Cadastros : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
            => Phase3SeedData.Up(migrationBuilder);

        protected override void Down(MigrationBuilder migrationBuilder)
            => Phase3SeedData.Down(migrationBuilder);
    }
}
