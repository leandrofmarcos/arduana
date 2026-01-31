using ImportCostsApi.Domain.Enums;

namespace ImportCostsApi.Domain.Entities;

/// <summary>
/// Entidade que representa um Custo de Importação
/// </summary>
public class Custo : BaseEntity
{
    /// <summary>
    /// ID do orçamento associado
    /// </summary>
    public string OrcamentoId { get; set; } = string.Empty;

    /// <summary>
    /// Código do custo
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
    public DateTime CreatedAtCusto { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Premissas de cálculo em JSON
    /// </summary>
    public string Premissas { get; set; } = "{}";

    /// <summary>
    /// Taxas/Alíquotas em JSON
    /// </summary>
    public string Taxas { get; set; } = "{}";

    /// <summary>
    /// Resumo dos custos em JSON
    /// </summary>
    public string Resumo { get; set; } = "{}";

    /// <summary>
    /// Navegação: Orçamento associado
    /// </summary>
    public Orcamento Orcamento { get; set; } = null!;

    /// <summary>
    /// Navegação: Despesas
    /// </summary>
    public ICollection<Despesa> Despesas { get; set; } = new List<Despesa>();
}

/// <summary>
/// Entidade que representa uma Despesa
/// </summary>
public class Despesa : BaseEntity
{
    /// <summary>
    /// ID do custo pai
    /// </summary>
    public string CustoId { get; set; } = string.Empty;

    /// <summary>
    /// Categoria da despesa
    /// </summary>
    public CategoriaDespesa Categoria { get; set; }

    /// <summary>
    /// Item/Descrição da despesa
    /// </summary>
    public string Item { get; set; } = string.Empty;

    /// <summary>
    /// Fornecedor da despesa
    /// </summary>
    public string? Fornecedor { get; set; }

    /// <summary>
    /// Valor da despesa
    /// </summary>
    public decimal Valor { get; set; }

    /// <summary>
    /// Observação
    /// </summary>
    public string? Observacao { get; set; }

    /// <summary>
    /// Navegação: Custo pai
    /// </summary>
    public Custo Custo { get; set; } = null!;
}
