using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Comex133Api.Migrations
{
    /// <inheritdoc />
    public partial class PurgeAdminRoleAndFixAdminUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Remove TODAS as roles com nome 'Admin' (independente do ID).
            // A FK UsuarioRoles→Roles tem CASCADE DELETE, então os vínculos são removidos junto.
            // Em seguida, garante que o usuário admin@comex133.com.br está vinculado a Administrador (id=4).
            migrationBuilder.Sql(@"
                -- Remove vínculos de qualquer usuário com roles chamadas 'Admin'
                DELETE ur FROM [UsuarioRoles] ur
                INNER JOIN [Roles] r ON r.[Id] = ur.[RoleId]
                WHERE r.[Nome] = N'Admin';

                -- Remove as roles 'Admin'
                DELETE FROM [Roles] WHERE [Nome] = N'Admin';

                -- Garante que o usuário admin (id=1) tem a role Administrador (id=4)
                IF EXISTS (SELECT 1 FROM [Usuarios] WHERE [Id] = 1)
                    AND NOT EXISTS (SELECT 1 FROM [UsuarioRoles] WHERE [UsuarioId] = 1 AND [RoleId] = 4)
                BEGIN
                    INSERT INTO [UsuarioRoles] ([UsuarioId], [RoleId], [AtribuidoEm]) VALUES (1, 4, GETDATE());
                END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Não restaura a role Admin pois é um dado legado indesejado
        }
    }
}
