namespace ImportCostsApi.Features.Vendas;

/// <summary>
/// Request DTO for creating a new Venda
/// </summary>
public class CreateVendaDto
{
    /// <summary>
    /// Associated Orcamento ID
    /// </summary>
    public string OrcamentoId { get; set; } = string.Empty;

    /// <summary>
    /// Sales code/number
    /// </summary>
    public string Codigo { get; set; } = string.Empty;

    /// <summary>
    /// Client name
    /// </summary>
    public string Cliente { get; set; } = string.Empty;

    /// <summary>
    /// Customs broker name
    /// </summary>
    public string Despachante { get; set; } = string.Empty;

    /// <summary>
    /// Sales expenses: DespesasAgenciaMaritima, MargemLucro, DescontosComerciais, OutrasDespesas
    /// </summary>
    public Dictionary<string, decimal> Premissasdelha { get; set; } = new();
}

/// <summary>
/// Request DTO for updating an existing Venda
/// </summary>
public class UpdateVendaDto
{
    /// <summary>
    /// Sales code/number
    /// </summary>
    public string? Codigo { get; set; }

    /// <summary>
    /// Sales expenses: DespesasAgenciaMaritima, MargemLucro, DescontosComerciais, OutrasDespesas
    /// </summary>
    public Dictionary<string, decimal>? Premissasdelha { get; set; }
}
