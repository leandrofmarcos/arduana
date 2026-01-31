namespace ImportCostsApi.Features.Numerarios;

/// <summary>
/// Response DTO for Numerario Lancamento (Financial Entry)
/// </summary>
public class NumerarioLancamentoResponseDto
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
    /// Entry value
    /// </summary>
    public decimal Valor { get; set; }

    /// <summary>
    /// Currency (USD, BRL, EUR, etc)
    /// </summary>
    public string Moeda { get; set; } = "BRL";

    /// <summary>
    /// Entry date
    /// </summary>
    public DateTime Data { get; set; }

    /// <summary>
    /// Responsible person
    /// </summary>
    public string? Responsavel { get; set; }

    /// <summary>
    /// Entry status (Pendente, Aprovado, Cancelado)
    /// </summary>
    public string Status { get; set; } = "Pendente";

    /// <summary>
    /// Entry observations/notes
    /// </summary>
    public string? Observacao { get; set; }

    /// <summary>
    /// Entry type (Receita, Despesa, Ajuste, etc)
    /// </summary>
    public string? Tipo { get; set; }

    /// <summary>
    /// Audit trail for entry changes
    /// </summary>
    public List<TrilhaAuditoriaDto> Trilha { get; set; } = new();
}

/// <summary>
/// DTO for audit trail entries
/// </summary>
public class TrilhaAuditoriaDto
{
    /// <summary>
    /// Timestamp of the action
    /// </summary>
    public DateTime DataAlteracao { get; set; }

    /// <summary>
    /// User who made the change
    /// </summary>
    public string Usuario { get; set; } = string.Empty;

    /// <summary>
    /// Description of the action
    /// </summary>
    public string Acao { get; set; } = string.Empty;

    /// <summary>
    /// Previous value (if applicable)
    /// </summary>
    public string? ValorAnterior { get; set; }

    /// <summary>
    /// New value (if applicable)
    /// </summary>
    public string? ValorNovo { get; set; }
}
