namespace ImportCostsApi.Features.Numerarios;

/// <summary>
/// Request DTO for creating a new Numerario Lancamento
/// </summary>
public class CreateNumerarioDto
{
    /// <summary>
    /// Associated Orcamento ID
    /// </summary>
    public string OrcamentoId { get; set; } = string.Empty;

    /// <summary>
    /// Entry value
    /// </summary>
    public decimal Valor { get; set; }

    /// <summary>
    /// Currency (default: BRL)
    /// </summary>
    public string? Moeda { get; set; }

    /// <summary>
    /// Entry type (Receita, Despesa, Ajuste, etc)
    /// </summary>
    public string? Tipo { get; set; }

    /// <summary>
    /// Responsible person
    /// </summary>
    public string? Responsavel { get; set; }

    /// <summary>
    /// Observations/notes
    /// </summary>
    public string? Observacao { get; set; }
}

/// <summary>
/// Request DTO for updating a Numerario Lancamento
/// </summary>
public class UpdateNumerarioDto
{
    /// <summary>
    /// Entry value
    /// </summary>
    public decimal? Valor { get; set; }

    /// <summary>
    /// Currency
    /// </summary>
    public string? Moeda { get; set; }

    /// <summary>
    /// Entry type
    /// </summary>
    public string? Tipo { get; set; }

    /// <summary>
    /// Entry status
    /// </summary>
    public string? Status { get; set; }

    /// <summary>
    /// Responsible person
    /// </summary>
    public string? Responsavel { get; set; }

    /// <summary>
    /// Observations/notes
    /// </summary>
    public string? Observacao { get; set; }
}
