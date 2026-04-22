using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Comex133Api.Migrations
{
    /// <inheritdoc />
    public partial class UpdateDefaultRoleDescriptions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE [Roles] SET [Descricao] = N'Operador de despacho aduaneiro',  [AtualizadoEm] = '2026-04-22' WHERE [Id] = 1;
                UPDATE [Roles] SET [Descricao] = N'Analista operacional',             [AtualizadoEm] = '2026-04-22' WHERE [Id] = 2;
                UPDATE [Roles] SET [Descricao] = N'Gestão de operações',              [AtualizadoEm] = '2026-04-22' WHERE [Id] = 3;
                UPDATE [Roles] SET [Descricao] = N'Admin do sistema',                 [AtualizadoEm] = '2026-04-22' WHERE [Id] = 4;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE [Roles] SET [Descricao] = N'Acesso às telas operacionais de despacho aduaneiro', [AtualizadoEm] = '2026-04-22' WHERE [Id] = 1;
                UPDATE [Roles] SET [Descricao] = N'Acesso à análise de solicitações e custos',        [AtualizadoEm] = '2026-04-22' WHERE [Id] = 2;
                UPDATE [Roles] SET [Descricao] = N'Acesso gerencial com visualizações consolidadas',  [AtualizadoEm] = '2026-04-22' WHERE [Id] = 3;
                UPDATE [Roles] SET [Descricao] = N'Acesso total ao sistema, incluindo administração',  [AtualizadoEm] = '2026-04-22' WHERE [Id] = 4;
            ");
        }
    }
}
