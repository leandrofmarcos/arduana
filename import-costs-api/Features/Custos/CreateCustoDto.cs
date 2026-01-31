namespace ImportCostsApi.Features.Custos;

/// <summary>
/// Request DTO for creating a new Custo
/// </summary>
public class CreateCustoDto
{
    /// <summary>
    /// Associated Orcamento ID
    /// </summary>
    public string OrcamentoId { get; set; } = string.Empty;

    /// <summary>
    /// Cost code/number
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
    /// Commercial assumptions: TaxaCambio, PortoOrigem, PortoDestino, TipoFrete
    /// </summary>
    public Dictionary<string, object> Premissas { get; set; } = new();

    /// <summary>
    /// Tax rates: II, IPI, ICMS, PIS, COFINS (as percentages 0-100)
    /// </summary>
    public Dictionary<string, decimal> Taxas { get; set; } = new();

    /// <summary>
    /// Initial expenses list
    /// </summary>
    public List<CreateDespesaDto> Despesas { get; set; } = new();
}

/// <summary>
/// Request DTO for creating an operational expense
/// </summary>
public class CreateDespesaDto
{
    /// <summary>
    /// Expense category
    /// </summary>
    public string Categoria { get; set; } = string.Empty;

    /// <summary>
    /// Expense item description
    /// </summary>
    public string Item { get; set; } = string.Empty;

    /// <summary>
    /// Supplier/provider name
    /// </summary>
    public string Fornecedor { get; set; } = string.Empty;

    /// <summary>
    /// Expense value
    /// </summary>
    public decimal Valor { get; set; }

    /// <summary>
    /// Observations
    /// </summary>
    public string? Observacao { get; set; }
}
