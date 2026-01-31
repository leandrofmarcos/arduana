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

    /// <summary>
    /// Código UN/LOCODE do porto
    /// </summary>
    public string Codigo { get; set; } = string.Empty;

    /// <summary>
    /// País onde está localizado o porto
    /// </summary>
    public string Pais { get; set; } = string.Empty;
}
