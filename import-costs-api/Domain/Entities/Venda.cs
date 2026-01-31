namespace ImportCostsApi.Domain.Entities;

/// <summary>
/// Entidade que representa uma Venda de Importação
/// </summary>
public class Venda : BaseEntity
{
    /// <summary>
    /// ID do orçamento associado
    /// </summary>
    public string OrcamentoId { get; set; } = string.Empty;

    /// <summary>
    /// Código da venda
    /// </summary>
    public string? Codigo { get; set; }

    /// <summary>
    /// Nome do cliente
    /// </summary>
    public string? Cliente { get; set; }

    /// <summary>
    /// Nome do despachante
    /// </summary>
    public string? Despachante { get; set; }

    /// <summary>
    /// Data de criação
    /// </summary>
    public DateTime CreatedAtVenda { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Premissas de cálculo em JSON (herdadas do custo)
    /// </summary>
    public string Premissas { get; set; } = "{}";

    /// <summary>
    /// Taxas/Alíquotas em JSON (herdadas do custo)
    /// </summary>
    public string Taxas { get; set; } = "{}";

    /// <summary>
    /// Resumo da venda em JSON
    /// </summary>
    public string Resumo { get; set; } = "{}";

    /// <summary>
    /// Navegação: Orçamento associado
    /// </summary>
    public Orcamento Orcamento { get; set; } = null!;
}
