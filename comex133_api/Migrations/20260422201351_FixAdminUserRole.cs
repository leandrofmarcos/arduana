using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Comex133Api.Migrations
{
    /// <inheritdoc />
    public partial class FixAdminUserRole : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Usuário admin@comex133.com.br (id=1) estava vinculado a Despachante (id=1).
            // Deve ser vinculado a Administrador (id=4).
            migrationBuilder.Sql(@"
                -- Remove vínculo incorreto com Despachante
                DELETE FROM [UsuarioRoles] WHERE [UsuarioId] = 1 AND [RoleId] = 1;

                -- Garante vínculo correto com Administrador (evita duplicata)
                IF NOT EXISTS (SELECT 1 FROM [UsuarioRoles] WHERE [UsuarioId] = 1 AND [RoleId] = 4)
                    INSERT INTO [UsuarioRoles] ([UsuarioId], [RoleId], [AtribuidoEm]) VALUES (1, 4, GETDATE());
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DELETE FROM [UsuarioRoles] WHERE [UsuarioId] = 1 AND [RoleId] = 4;

                IF NOT EXISTS (SELECT 1 FROM [UsuarioRoles] WHERE [UsuarioId] = 1 AND [RoleId] = 1)
                    INSERT INTO [UsuarioRoles] ([UsuarioId], [RoleId], [AtribuidoEm]) VALUES (1, 1, GETDATE());
            ");
        }
    }
}
