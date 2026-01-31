namespace ImportCostsApi.Features.Vendas;

/// <summary>
/// Response DTO for Venda (Sales) entity
/// </summary>
public class VendaResponseDto
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
    /// Creation date
    /// </summary>
    public DateTime CriadoEm { get; set; }

    /// <summary>
    /// Commercial assumptions from Custo (cost reference data - read-only)
    /// </summary>
    public Dictionary<string, object> Premissas { get; set; } = new();

    /// <summary>
    /// Cost reference data from Custo (read-only)
    /// </summary>
    public Dictionary<string, decimal> CustoReferencia { get; set; } = new();

    /// <summary>
    /// Tax rates from Custo (read-only)
    /// </summary>
    public Dictionary<string, decimal> Taxas { get; set; } = new();

    /// <summary>
    /// Sales calculation data (shipping agency expenses, profit margin, discounts, other)
    /// </summary>
    public Dictionary<string, decimal> Premissasdelha { get; set; } = new();

    /// <summary>
    /// Sales summary (unit price, total price, margin, profit percentage)
    /// </summary>
    public Dictionary<string, decimal> Resumo { get; set; } = new();

    /// <summary>
    /// Current status of sales
    /// </summary>
    public string Status { get; set; } = "Rascunho";
}
