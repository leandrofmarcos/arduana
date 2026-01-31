namespace ImportCostsApi.Features.Custos;

/// <summary>
/// Request DTO for updating an existing Custo
/// </summary>
public class UpdateCustoDto
{
    /// <summary>
    /// Cost code/number
    /// </summary>
    public string? Codigo { get; set; }

    /// <summary>
    /// Commercial assumptions: TaxaCambio, PortoOrigem, PortoDestino, TipoFrete
    /// </summary>
    public Dictionary<string, object>? Premissas { get; set; }

    /// <summary>
    /// Tax rates: II, IPI, ICMS, PIS, COFINS (as percentages 0-100)
    /// </summary>
    public Dictionary<string, decimal>? Taxas { get; set; }

    /// <summary>
    /// List of expenses to update/add
    /// </summary>
    public List<CreateDespesaDto>? Despesas { get; set; }
}
