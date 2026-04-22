using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Comex133Api.Migrations
{
    /// <inheritdoc />
    public partial class SeedDefaultRoles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Insere as 4 roles padrão apenas se ainda não existirem (idempotente)
            migrationBuilder.Sql(@"
                SET IDENTITY_INSERT [Roles] ON;

                IF NOT EXISTS (SELECT 1 FROM [Roles] WHERE [Id] = 1)
                    INSERT INTO [Roles] ([Id],[Nome],[Descricao],[CriadoEm],[AtualizadoEm])
                    VALUES (1, N'Despachante', N'Acesso às telas operacionais de despacho aduaneiro', '2026-04-22', '2026-04-22');

                IF NOT EXISTS (SELECT 1 FROM [Roles] WHERE [Id] = 2)
                    INSERT INTO [Roles] ([Id],[Nome],[Descricao],[CriadoEm],[AtualizadoEm])
                    VALUES (2, N'Analista', N'Acesso à análise de solicitações e custos', '2026-04-22', '2026-04-22');

                IF NOT EXISTS (SELECT 1 FROM [Roles] WHERE [Id] = 3)
                    INSERT INTO [Roles] ([Id],[Nome],[Descricao],[CriadoEm],[AtualizadoEm])
                    VALUES (3, N'Gerente', N'Acesso gerencial com visualizações consolidadas', '2026-04-22', '2026-04-22');

                IF NOT EXISTS (SELECT 1 FROM [Roles] WHERE [Id] = 4)
                    INSERT INTO [Roles] ([Id],[Nome],[Descricao],[CriadoEm],[AtualizadoEm])
                    VALUES (4, N'Administrador', N'Acesso total ao sistema, incluindo administração', '2026-04-22', '2026-04-22');

                SET IDENTITY_INSERT [Roles] OFF;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Remove apenas roles padrão que não estejam em uso
            migrationBuilder.Sql(@"
                DELETE FROM [Roles]
                WHERE [Id] IN (1, 2, 3, 4)
                  AND [Id] NOT IN (SELECT DISTINCT [RoleId] FROM [UsuarioRoles]);
            ");
        }
    }
}
