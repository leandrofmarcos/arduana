namespace ImportCostsApi.Domain.Entities;

/// <summary>
/// Entidade que representa um Despachante
/// </summary>
public class Despachante : BaseEntity
{
    /// <summary>
    /// Nome do despachante
    /// </summary>
    public string Nome { get; set; } = string.Empty;

    /// <summary>
    /// Contato do despachante
    /// </summary>
    public string Contato { get; set; } = string.Empty;

    /// <summary>
    /// Navegação: Orçamentos associados ao despachante
    /// </summary>
    public ICollection<Orcamento> Orcamentos { get; set; } = new List<Orcamento>();
}
