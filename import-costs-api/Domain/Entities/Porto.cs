namespace ImportCostsApi.Domain.Entities;

/// <summary>
/// Entidade que representa um Porto
/// </summary>
public class Porto : BaseEntity
{
    /// <summary>
    /// Nome do porto
    /// </summary>
    public string Nome { get; set; } = string.Empty;
}
