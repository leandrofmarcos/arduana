using Microsoft.EntityFrameworkCore.Migrations;

namespace Comex133Api.Core.Database.Seeds;

/// <summary>
/// Seed de dados de referência para a Fase 3 — Cadastros.
///
/// Objetivo: popular as 12 tabelas de cadastro com dados reais utilizados
/// nos testes do frontend (import-costs), garantindo consistência entre
/// a camada de protótipo e o banco de dados da API.
///
/// Design decisions:
///   • Todos os INSERTs usam IF NOT EXISTS para idempotência (re-runs safe).
///   • FKs são resolvidas via subquery por chave natural (não por ID fixo),
///     desacoplando o seed de IDs gerados por identity.
///   • Down() faz DELETE na ordem inversa respeitando FK constraints.
///   • Este seed NÃO é aplicado automaticamente em produção — requer
///     `dotnet ef database update` explícito.
/// </summary>
public static class Phase3SeedData
{
    // ─────────────────────────────────────────────────────────────────────
    // UP — inserir dados
    // ─────────────────────────────────────────────────────────────────────

    public static void Up(MigrationBuilder m)
    {
        SeedPortosOrigem(m);
        SeedPortosDestino(m);
        SeedExportadores(m);
        SeedAgentesCarga(m);
        SeedFabricantes(m);
        SeedImportadores(m);
        SeedClientes(m);
        SeedDespachantes(m);
        SeedNcms(m);
        SeedListaPrecoLcl(m);
        SeedDespesasCatalogo(m);
        SeedModelosDespesa(m);
    }

    // ─────────────────────────────────────────────────────────────────────
    // DOWN — remover dados (ordem inversa para respeitar FKs)
    // ─────────────────────────────────────────────────────────────────────

    public static void Down(MigrationBuilder m)
    {
        // Junction primeiro
        m.Sql("DELETE FROM [ModelosDespesaItens] WHERE [ModeloDespesaId] IN (SELECT [Id] FROM [ModelosDespesa] WHERE [Nome] IN ('Desembaraço Padrão FCL', 'Agência + Despachante', 'Simplificado (Agência Básica)'))");

        m.Sql("DELETE FROM [ModelosDespesa] WHERE [Nome] IN ('Desembaraço Padrão FCL', 'Agência + Despachante', 'Simplificado (Agência Básica)')");

        m.Sql("DELETE FROM [DespesasCatalogo] WHERE [Descricao] IN ("
            + "'Desconsolidação','Liberação de B/L','THC','ISPS',"
            + "'LOG FEE / TRS / IMP. LOG. FEE / TELEX FEE / IOF','Lift Off',"
            + "'Honorários Despachante','Honorários Trading','S.D.A.','Taxa de Expediente',"
            + "'Taxa Emissão de L.I.',"
            + "'AFRMM + Taxa Sistema Mercante','TUS - Taxa de Utilização do Siscomex','Siscoserv','Outras Despesas de Origem',"
            + "'Armazenagem',"
            + "'Frete Marítimo','Outras Despesas','Impostos de Saída (PIS e COFINS)','Frete Rodoviário Interno'"
            + ")");

        m.Sql("DELETE FROM [Ncms] WHERE [CodigoNcm] IN ('85171400','84713000','61099000','87089900','61051000')");

        m.Sql("DELETE FROM [ListaPrecoLcl] WHERE [Descricao] IN ('Carga Geral LCL Shanghai–Santos','Carga Refrigerada LCL','IMO / Carga Perigosa LCL')");

        m.Sql("DELETE FROM [Despachantes] WHERE [Nome] IN ('Costa & Associados Despachos Aduaneiros','Logística Brasil Despachos Ltda')");

        m.Sql("DELETE FROM [Clientes] WHERE [RazaoSocial] IN ('TechBrasil Importações Ltda','Têxtil Sul Comércio Exterior Ltda','AutoPeças Nacional Importações Ltda','MegaMart Distribuidora Nacional Ltda')");

        m.Sql("DELETE FROM [Importadores] WHERE [RazaoSocial] IN ('TechBrasil Importações Ltda','Têxtil Sul Comércio Exterior Ltda','AutoPeças Nacional Importações Ltda')");

        m.Sql("DELETE FROM [Fabricantes] WHERE [Nome] IN ('Shenzhen Consumer Electronics Factory','Ningbo Garment & Textile Maker','Guangzhou Motor Components Ltd')");

        m.Sql("DELETE FROM [AgentesCarga] WHERE [Nome] IN ('COSCO Shipping Lines','Mediterranean Shipping Co. (MSC)','CMA CGM Brasil Logistics')");

        m.Sql("DELETE FROM [Exportadores] WHERE [Nome] IN ('Shanghai Tech Electronics Co. Ltd','Ningbo Textile Manufacturing Ltd','Guangdong Auto Parts Co. Ltd')");

        m.Sql("DELETE FROM [PortosDestino] WHERE [Codigo] IN ('BRSSZ','BRPNG','BRITJ','BRRJO','BRPCE')");

        m.Sql("DELETE FROM [PortosOrigem] WHERE [Codigo] IN ('SHA','NGB','HKG','TAO','GZH')");
    }

    // ─────────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────────

    /// <summary>Executa um INSERT apenas se a linha ainda não existir.</summary>
    private static void InsertIfNotExists(
        MigrationBuilder m,
        string table,
        string checkColumn,
        string checkValue,
        string insertSql)
    {
        m.Sql($@"
IF NOT EXISTS (SELECT 1 FROM [{table}] WHERE [{checkColumn}] = N'{checkValue}')
BEGIN
    {insertSql}
END");
    }

    // ─────────────────────────────────────────────────────────────────────
    // 1. PORTOS ORIGEM
    // ─────────────────────────────────────────────────────────────────────

    private static void SeedPortosOrigem(MigrationBuilder m)
    {
        var rows = new[]
        {
            ("Porto de Shanghai",  "SHA", "China"),
            ("Porto de Ningbo",    "NGB", "China"),
            ("Porto de Hong Kong", "HKG", "China"),
            ("Porto de Qingdao",   "TAO", "China"),
            ("Porto de Guangzhou", "GZH", "China"),
        };

        foreach (var (nome, codigo, pais) in rows)
            InsertIfNotExists(m, "PortosOrigem", "Codigo", codigo,
                $"INSERT INTO [PortosOrigem] ([Nome],[Codigo],[Pais],[Ativo],[CriadoEm],[AtualizadoEm]) VALUES (N'{nome}',N'{codigo}',N'{pais}',1,GETUTCDATE(),GETUTCDATE())");
    }

    // ─────────────────────────────────────────────────────────────────────
    // 2. PORTOS DESTINO
    // ─────────────────────────────────────────────────────────────────────

    private static void SeedPortosDestino(MigrationBuilder m)
    {
        var rows = new[]
        {
            ("Porto de Santos",          "BRSSZ", "SP", "Brasil"),
            ("Porto de Paranaguá",        "BRPNG", "PR", "Brasil"),
            ("Porto de Itajaí",           "BRITJ", "SC", "Brasil"),
            ("Porto do Rio de Janeiro",   "BRRJO", "RJ", "Brasil"),
            ("Porto do Pecém",            "BRPCE", "CE", "Brasil"),
        };

        foreach (var (nome, codigo, estado, pais) in rows)
            InsertIfNotExists(m, "PortosDestino", "Codigo", codigo,
                $"INSERT INTO [PortosDestino] ([Nome],[Codigo],[Estado],[Pais],[Ativo],[CriadoEm],[AtualizadoEm]) VALUES (N'{nome}',N'{codigo}',N'{estado}',N'{pais}',1,GETUTCDATE(),GETUTCDATE())");
    }

    // ─────────────────────────────────────────────────────────────────────
    // 3. EXPORTADORES
    // ─────────────────────────────────────────────────────────────────────

    private static void SeedExportadores(MigrationBuilder m)
    {
        var rows = new[]
        {
            ("Shanghai Tech Electronics Co. Ltd", "91310000MA1FL0XT0P", "China",      "Shanghai"),
            ("Ningbo Textile Manufacturing Ltd",  "91330200MA27YFUX0R", "China",      "Ningbo"),
            ("Guangdong Auto Parts Co. Ltd",      "91440300MA5DLTXY0H", "China",      "Guangzhou"),
        };

        foreach (var (nome, doc, pais, cidade) in rows)
            InsertIfNotExists(m, "Exportadores", "Documento", doc,
                $"INSERT INTO [Exportadores] ([Nome],[Documento],[Pais],[Cidade],[Ativo],[CriadoEm],[AtualizadoEm]) VALUES (N'{nome}',N'{doc}',N'{pais}',N'{cidade}',1,GETUTCDATE(),GETUTCDATE())");
    }

    // ─────────────────────────────────────────────────────────────────────
    // 4. AGENTES DE CARGA
    // ─────────────────────────────────────────────────────────────────────

    private static void SeedAgentesCarga(MigrationBuilder m)
    {
        var rows = new[]
        {
            ("COSCO Shipping Lines",              "91110000100012341X", "China",   "booking@cosco.com"),
            ("Mediterranean Shipping Co. (MSC)",  "CHE-105.740.372",   "Suíça",   "br@msc.com"),
            ("CMA CGM Brasil Logistics",          "04.916.107/0001-44","Brasil",  "ops@cmacgm.com.br"),
        };

        foreach (var (nome, doc, pais, contato) in rows)
            InsertIfNotExists(m, "AgentesCarga", "Nome", nome,
                $"INSERT INTO [AgentesCarga] ([Nome],[Documento],[Pais],[Contato],[Ativo],[CriadoEm],[AtualizadoEm]) VALUES (N'{nome}',N'{doc}',N'{pais}',N'{contato}',1,GETUTCDATE(),GETUTCDATE())");
    }

    // ─────────────────────────────────────────────────────────────────────
    // 5. FABRICANTES
    // ─────────────────────────────────────────────────────────────────────

    private static void SeedFabricantes(MigrationBuilder m)
    {
        var rows = new[]
        {
            ("Shenzhen Consumer Electronics Factory", "China", "Shenzhen",   "sales@szcef.cn"),
            ("Ningbo Garment & Textile Maker",        "China", "Ningbo",     "export@ngtm.cn"),
            ("Guangzhou Motor Components Ltd",        "China", "Guangzhou",  "info@gzmcl.com.cn"),
        };

        foreach (var (nome, pais, cidade, contato) in rows)
            InsertIfNotExists(m, "Fabricantes", "Nome", nome,
                $"INSERT INTO [Fabricantes] ([Nome],[Pais],[Cidade],[Contato],[Ativo],[CriadoEm],[AtualizadoEm]) VALUES (N'{nome}',N'{pais}',N'{cidade}',N'{contato}',1,GETUTCDATE(),GETUTCDATE())");
    }

    // ─────────────────────────────────────────────────────────────────────
    // 6. IMPORTADORES
    // ─────────────────────────────────────────────────────────────────────

    private static void SeedImportadores(MigrationBuilder m)
    {
        var rows = new[]
        {
            ("TechBrasil Importações Ltda",         "12.345.678/0001-90", "importacao@techbrasil.com.br",  "(11) 3456-7890"),
            ("Têxtil Sul Comércio Exterior Ltda",   "23.456.789/0001-01", "exterior@textilsul.com.br",     "(41) 3234-5678"),
            ("AutoPeças Nacional Importações Ltda", "34.567.890/0001-12", "comex@autopecasnacional.com.br","(11) 4567-8901"),
        };

        foreach (var (razao, cnpj, email, tel) in rows)
            InsertIfNotExists(m, "Importadores", "Cnpj", cnpj,
                $"INSERT INTO [Importadores] ([RazaoSocial],[Cnpj],[Email],[Telefone],[Ativo],[CriadoEm],[AtualizadoEm]) VALUES (N'{razao}',N'{cnpj}',N'{email}',N'{tel}',1,GETUTCDATE(),GETUTCDATE())");
    }

    // ─────────────────────────────────────────────────────────────────────
    // 7. CLIENTES
    // ─────────────────────────────────────────────────────────────────────

    private static void SeedClientes(MigrationBuilder m)
    {
        var rows = new[]
        {
            ("TechBrasil Importações Ltda",         "12.345.678/0001-90", "contato@techbrasil.com.br",         "(11) 3456-7890"),
            ("Têxtil Sul Comércio Exterior Ltda",   "23.456.789/0001-01", "contato@textilsul.com.br",          "(41) 3234-5678"),
            ("AutoPeças Nacional Importações Ltda", "34.567.890/0001-12", "contato@autopecasnacional.com.br",  "(11) 4567-8901"),
            ("MegaMart Distribuidora Nacional Ltda","45.678.901/0001-23", "comex@megamart.com.br",             "(21) 5678-9012"),
        };

        foreach (var (razao, cnpj, email, tel) in rows)
            InsertIfNotExists(m, "Clientes", "Cnpj", cnpj,
                $"INSERT INTO [Clientes] ([RazaoSocial],[Cnpj],[Email],[Telefone],[Ativo],[CriadoEm],[AtualizadoEm]) VALUES (N'{razao}',N'{cnpj}',N'{email}',N'{tel}',1,GETUTCDATE(),GETUTCDATE())");
    }

    // ─────────────────────────────────────────────────────────────────────
    // 8. DESPACHANTES
    // ─────────────────────────────────────────────────────────────────────

    private static void SeedDespachantes(MigrationBuilder m)
    {
        var rows = new[]
        {
            ("Costa & Associados Despachos Aduaneiros", "1234", "despacho@costaassoc.com.br",    "(11) 3210-4567"),
            ("Logística Brasil Despachos Ltda",         "5678", "comex@logisticabrasil.com.br",  "(11) 2109-8765"),
        };

        foreach (var (nome, crn, email, tel) in rows)
            InsertIfNotExists(m, "Despachantes", "Nome", nome,
                $"INSERT INTO [Despachantes] ([Nome],[Crn],[Email],[Telefone],[Ativo],[CriadoEm],[AtualizadoEm]) VALUES (N'{nome}',N'{crn}',N'{email}',N'{tel}',1,GETUTCDATE(),GETUTCDATE())");
    }

    // ─────────────────────────────────────────────────────────────────────
    // 9. NCMs
    // ─────────────────────────────────────────────────────────────────────

    private static void SeedNcms(MigrationBuilder m)
    {
        // (codigo, descricao, II, IPI, PIS, COFINS, ICMS)
        var rows = new[]
        {
            ("85171400", "Smartphones e aparelhos celulares",            20m,  15m,  2.10m,  9.65m, 18m),
            ("84713000", "Laptops e computadores portáteis",             16m,  10m,  2.10m,  9.65m, 18m),
            ("61099000", "Camisetas e regatas de malha de algodão",      35m,   0m,  2.10m,  9.65m, 12m),
            ("87089900", "Partes e acessórios para veículos automotores",18m,   5m,  2.10m,  9.65m, 12m),
            ("61051000", "Camisas casuais de algodão para homens",       35m,   0m,  2.10m,  9.65m, 12m),
        };

        foreach (var (codigo, desc, ii, ipi, pis, cofins, icms) in rows)
            InsertIfNotExists(m, "Ncms", "CodigoNcm", codigo,
                $"INSERT INTO [Ncms] ([CodigoNcm],[Descricao],[AliqII],[AliqIPI],[AliqPIS],[AliqCOFINS],[AliqICMS],[Ativo],[CriadoEm],[AtualizadoEm]) VALUES (N'{codigo}',N'{desc}',{ii},{ipi},{pis},{cofins},{icms},1,GETUTCDATE(),GETUTCDATE())");
    }

    // ─────────────────────────────────────────────────────────────────────
    // 10. LISTA PREÇO LCL
    // ─────────────────────────────────────────────────────────────────────

    private static void SeedListaPrecoLcl(MigrationBuilder m)
    {
        // (categoria, descricao, precoUsdPorCbm, precoUsdPorKg, dataVigencia)
        var rows = new[]
        {
            ("Geral",     "Carga Geral LCL Shanghai–Santos", 280m, 1.50m, "2026-01-01"),
            ("Perecível", "Carga Refrigerada LCL",           420m, 2.20m, "2026-01-01"),
            ("Perigosa",  "IMO / Carga Perigosa LCL",        380m, 1.90m, "2026-01-01"),
        };

        foreach (var (cat, desc, cbm, kg, vigencia) in rows)
            InsertIfNotExists(m, "ListaPrecoLcl", "Descricao", desc,
                $"INSERT INTO [ListaPrecoLcl] ([Categoria],[Descricao],[PrecoUsdPorCbm],[PrecoUsdPorKg],[DataVigencia],[Ativo],[CriadoEm],[AtualizadoEm]) VALUES (N'{cat}',N'{desc}',{cbm},{kg},'{vigencia}',1,GETUTCDATE(),GETUTCDATE())");
    }

    // ─────────────────────────────────────────────────────────────────────
    // 11. DESPESAS CATÁLOGO
    // ─────────────────────────────────────────────────────────────────────

    private static void SeedDespesasCatalogo(MigrationBuilder m)
    {
        // (descricao, categoria, valor)
        var rows = new[]
        {
            // Agência Marítima
            ("Desconsolidação",                                      "Agência Marítima",  1280m),
            ("Liberação de B/L",                                     "Agência Marítima",   900m),
            ("THC",                                                  "Agência Marítima",  1450m),
            ("ISPS",                                                 "Agência Marítima",   100m),
            ("LOG FEE / TRS / IMP. LOG. FEE / TELEX FEE / IOF",     "Agência Marítima",  2440m),
            ("Lift Off",                                             "Agência Marítima",   330m),
            // Despachante
            ("Honorários Despachante",                               "Despachante",        3000m),
            ("Honorários Trading",                                   "Despachante",       17000m),
            ("S.D.A.",                                               "Despachante",         600m),
            ("Taxa de Expediente",                                   "Despachante",         500m),
            ("Taxa Emissão de L.I.",                                 "Despachante",           0m),
            // Tributos
            ("AFRMM + Taxa Sistema Mercante",                        "Tributos",           3848m),
            ("TUS - Taxa de Utilização do Siscomex",                 "Tributos",            244m),
            ("Siscoserv",                                            "Tributos",              0m),
            ("Outras Despesas de Origem",                            "Tributos",              0m),
            // Portos
            ("Armazenagem",                                          "Portos",             5200m),
            // Outras Despesas
            ("Frete Marítimo",                                       "Outras Despesas",       0m),
            ("Outras Despesas",                                      "Outras Despesas",    3500m),
            ("Impostos de Saída (PIS e COFINS)",                     "Outras Despesas",   25264m),
            ("Frete Rodoviário Interno",                             "Outras Despesas",    5800m),
        };

        foreach (var (desc, cat, valor) in rows)
        {
            // Escapa aspas simples duplicando para SQL seguro
            var descSafe = desc.Replace("'", "''");
            InsertIfNotExists(m, "DespesasCatalogo", "Descricao", descSafe,
                $"INSERT INTO [DespesasCatalogo] ([Descricao],[Valor],[Categoria],[Ativo],[CriadoEm],[AtualizadoEm]) VALUES (N'{descSafe}',{valor},N'{cat}',1,GETUTCDATE(),GETUTCDATE())");
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    // 12. MODELOS DE DESPESA + ITENS (junction)
    // ─────────────────────────────────────────────────────────────────────

    private static void SeedModelosDespesa(MigrationBuilder m)
    {
        // Modelos
        var modelos = new[]
        {
            ("Desembaraço Padrão FCL",     "Modelo completo padrão para importações FCL"),
            ("Agência + Despachante",      "Modelo parcial — agência marítima e honorários"),
            ("Simplificado (Agência Básica)", "Apenas taxas portuárias essenciais"),
        };

        foreach (var (nome, desc) in modelos)
            InsertIfNotExists(m, "ModelosDespesa", "Nome", nome,
                $"INSERT INTO [ModelosDespesa] ([Nome],[Descricao],[Ativo],[CriadoEm],[AtualizadoEm]) VALUES (N'{nome}',N'{desc}',1,GETUTCDATE(),GETUTCDATE())");

        // Itens – usa subquery para resolver FKs por chave natural
        // ModeloDespesaItem: (ModeloDespesaId, DespesaCatalogoId, AdicionadoEm)
        SeedModeloItens(m, "Desembaraço Padrão FCL", new[]
        {
            "Desconsolidação",
            "Liberação de B/L",
            "THC",
            "ISPS",
            "LOG FEE / TRS / IMP. LOG. FEE / TELEX FEE / IOF",
            "Lift Off",
            "Honorários Despachante",
            "S.D.A.",
            "Taxa de Expediente",
            "AFRMM + Taxa Sistema Mercante",
            "TUS - Taxa de Utilização do Siscomex",
            "Armazenagem",
            "Outras Despesas",
        });

        SeedModeloItens(m, "Agência + Despachante", new[]
        {
            "Desconsolidação",
            "Liberação de B/L",
            "THC",
            "ISPS",
            "Honorários Despachante",
            "Honorários Trading",
        });

        SeedModeloItens(m, "Simplificado (Agência Básica)", new[]
        {
            "Desconsolidação",
            "Liberação de B/L",
            "THC",
            "Lift Off",
        });
    }

    private static void SeedModeloItens(MigrationBuilder m, string modeloNome, string[] descricoes)
    {
        var modeloNomeSafe = modeloNome.Replace("'", "''");
        foreach (var desc in descricoes)
        {
            var descSafe = desc.Replace("'", "''");
            m.Sql($@"
IF NOT EXISTS (
    SELECT 1 FROM [ModelosDespesaItens] mi
    INNER JOIN [ModelosDespesa]    mo ON mo.[Id] = mi.[ModeloDespesaId]
    INNER JOIN [DespesasCatalogo]  dc ON dc.[Id] = mi.[DespesaCatalogoId]
    WHERE mo.[Nome] = N'{modeloNomeSafe}' AND dc.[Descricao] = N'{descSafe}'
)
BEGIN
    INSERT INTO [ModelosDespesaItens] ([ModeloDespesaId],[DespesaCatalogoId],[AdicionadoEm])
    SELECT mo.[Id], dc.[Id], GETUTCDATE()
    FROM   [ModelosDespesa]   mo
    CROSS JOIN [DespesasCatalogo] dc
    WHERE  mo.[Nome]      = N'{modeloNomeSafe}'
    AND    dc.[Descricao] = N'{descSafe}'
END");
        }
    }
}
