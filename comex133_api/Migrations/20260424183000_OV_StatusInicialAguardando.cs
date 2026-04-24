using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Comex133Api.Migrations
{
    public partial class OV_StatusInicialAguardando : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
UPDATE ov
SET ov.Status = 'Aguardando'
FROM OrcamentosVenda ov
WHERE ov.Status = 'EmAndamento'
  AND ov.CriadoEm = ov.AtualizadoEm;");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
UPDATE ov
SET ov.Status = 'EmAndamento'
FROM OrcamentosVenda ov
WHERE ov.Status = 'Aguardando'
  AND ov.CriadoEm = ov.AtualizadoEm;");
        }
    }
}
