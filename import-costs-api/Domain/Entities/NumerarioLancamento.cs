using ImportCostsApi.Domain.Enums;

namespace ImportCostsApi.Domain.Entities;

/// <summary>
/// Entidade que representa um Lançamento de Numerário
/// </summary>
public class NumerarioLancamento : BaseEntity
{
    /// <summary>
    /// ID do processo (Orçamento)
    /// </summary>
    public string ProcessoId { get; set; } = string.Empty;

    /// <summary>
    /// Valor do numerário
    /// </summary>
    public decimal Valor { get; set; }

    /// <summary>
    /// Moeda (BRL, USD, EUR)
    /// </summary>
    public string Moeda { get; set; } = "BRL";

    /// <summary>
    /// Data do lançamento
    /// </summary>
    public DateTime Data { get; set; }

    /// <summary>
    /// Responsável
    /// </summary>
    public string Responsavel { get; set; } = string.Empty;

    /// <summary>
    /// Status do lançamento
    /// </summary>
    public NumerarioStatus Status { get; set; }

    /// <summary>
    /// Observação
    /// </summary>
    public string? Observacao { get; set; }

    /// <summary>
    /// Trilha de auditoria em JSON
    /// </summary>
    public string Trilha { get; set; } = "[]";

    /// <summary>
    /// Navegação: Orçamento associado
    /// </summary>
    public Orcamento Orcamento { get; set; } = null!;
}
