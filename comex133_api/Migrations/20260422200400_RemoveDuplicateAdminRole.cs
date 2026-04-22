using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Comex133Api.Migrations
{
    /// <inheritdoc />
    public partial class RemoveDuplicateAdminRole : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Remove a role duplicada "Admin" (id=5) criada manualmente via API.
            // A role correta para administrador é id=4 "Administrador".
            migrationBuilder.Sql(@"
                DELETE FROM [Roles] WHERE [Id] = 5 AND [Nome] = N'Admin';
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                SET IDENTITY_INSERT [Roles] ON;
                IF NOT EXISTS (SELECT 1 FROM [Roles] WHERE [Id] = 5)
                    INSERT INTO [Roles] ([Id],[Nome],[Descricao],[CriadoEm],[AtualizadoEm])
                    VALUES (5, N'Admin', N'Administrador do sistema', '2026-04-22', '2026-04-22');
                SET IDENTITY_INSERT [Roles] OFF;
            ");
        }
    }
}
