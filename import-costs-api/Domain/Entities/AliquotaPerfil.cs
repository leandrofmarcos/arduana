namespace ImportCostsApi.Domain.Entities;

/// <summary>
/// Entidade que representa um Perfil de Alíquotas
/// </summary>
public class AliquotaPerfil : BaseEntity
{
    /// <summary>
    /// Nome do perfil de alíquotas
    /// </summary>
    public string Nome { get; set; } = string.Empty;

    /// <summary>
    /// Descrição do perfil
    /// </summary>
    public string? Descricao { get; set; }

    /// <summary>
    /// Imposto de Importação (%)
    /// </summary>
    public decimal II { get; set; }

    /// <summary>
    /// IPI (%)
    /// </summary>
    public decimal IPI { get; set; }

    /// <summary>
    /// ICMS (%)
    /// </summary>
    public decimal ICMS { get; set; }

    /// <summary>
    /// PIS (%)
    /// </summary>
    public decimal PIS { get; set; }

    /// <summary>
    /// COFINS (%)
    /// </summary>
    public decimal COFINS { get; set; }

    /// <summary>
    /// Indica se é o perfil padrão
    /// </summary>
    public bool Padrao { get; set; }
}
