using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Comex133Api.Migrations
{
    /// <inheritdoc />
    public partial class FixAdminToDespachanteRole : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Garante que as 4 roles padrão existam com nomes e descrições corretas.
            // Id=1 foi criado manualmente como "Admin" — corrige para "Despachante".
            migrationBuilder.Sql(@"
                SET IDENTITY_INSERT [Roles] ON;

                -- Id=1: corrige Admin → Despachante (ou insere se não existir)
                IF EXISTS (SELECT 1 FROM [Roles] WHERE [Id] = 1)
                    UPDATE [Roles] SET [Nome] = N'Despachante', [Descricao] = N'Operador de despacho aduaneiro', [AtualizadoEm] = '2026-04-22' WHERE [Id] = 1;
                ELSE
                    INSERT INTO [Roles] ([Id],[Nome],[Descricao],[CriadoEm],[AtualizadoEm])
                    VALUES (1, N'Despachante', N'Operador de despacho aduaneiro', '2026-04-22', '2026-04-22');

                -- Id=2: Analista
                IF EXISTS (SELECT 1 FROM [Roles] WHERE [Id] = 2)
                    UPDATE [Roles] SET [Nome] = N'Analista', [Descricao] = N'Analista operacional', [AtualizadoEm] = '2026-04-22' WHERE [Id] = 2;
                ELSE
                    INSERT INTO [Roles] ([Id],[Nome],[Descricao],[CriadoEm],[AtualizadoEm])
                    VALUES (2, N'Analista', N'Analista operacional', '2026-04-22', '2026-04-22');

                -- Id=3: Gerente
                IF EXISTS (SELECT 1 FROM [Roles] WHERE [Id] = 3)
                    UPDATE [Roles] SET [Nome] = N'Gerente', [Descricao] = N'Gestão de operações', [AtualizadoEm] = '2026-04-22' WHERE [Id] = 3;
                ELSE
                    INSERT INTO [Roles] ([Id],[Nome],[Descricao],[CriadoEm],[AtualizadoEm])
                    VALUES (3, N'Gerente', N'Gestão de operações', '2026-04-22', '2026-04-22');

                -- Id=4: Administrador
                IF EXISTS (SELECT 1 FROM [Roles] WHERE [Id] = 4)
                    UPDATE [Roles] SET [Nome] = N'Administrador', [Descricao] = N'Admin do sistema', [AtualizadoEm] = '2026-04-22' WHERE [Id] = 4;
                ELSE
                    INSERT INTO [Roles] ([Id],[Nome],[Descricao],[CriadoEm],[AtualizadoEm])
                    VALUES (4, N'Administrador', N'Admin do sistema', '2026-04-22', '2026-04-22');

                SET IDENTITY_INSERT [Roles] OFF;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Reverte Id=1 para "Admin" (estado anterior à correção)
            migrationBuilder.Sql(@"
                UPDATE [Roles] SET [Nome] = N'Admin', [Descricao] = N'Operador de despacho aduaneiro', [AtualizadoEm] = '2026-04-22' WHERE [Id] = 1;
            ");
        }
    }
}
