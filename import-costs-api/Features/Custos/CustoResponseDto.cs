namespace ImportCostsApi.Features.Custos;

/// <summary>
/// Response DTO for Custo (Cost) entity
/// </summary>
public class CustoResponseDto
{
    /// <summary>
    /// Unique identifier
    /// </summary>
    public string Id { get; set; } = string.Empty;

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
    /// Creation date
    /// </summary>
    public DateTime CriadoEm { get; set; }

    /// <summary>
    /// Commercial assumptions (exchange rate, ports, freight type)
    /// </summary>
    public Dictionary<string, object> Premissas { get; set; } = new();

    /// <summary>
    /// Tax rates (II, IPI, ICMS, PIS, COFINS percentages)
    /// </summary>
    public Dictionary<string, decimal> Taxas { get; set; } = new();

    /// <summary>
    /// Summary of calculations (base, taxes, total)
    /// </summary>
    public Dictionary<string, decimal> Resumo { get; set; } = new();

    /// <summary>
    /// List of operational expenses
    /// </summary>
    public List<DespesaDto> Despesas { get; set; } = new();

    /// <summary>
    /// Current status of cost
    /// </summary>
    public string Status { get; set; } = "Rascunho";
}

/// <summary>
/// Response DTO for operational expense
/// </summary>
public class DespesaDto
{
    /// <summary>
    /// Unique identifier
    /// </summary>
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// Expense category (Frete, Seguro, Taxas Portuárias, etc)
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
