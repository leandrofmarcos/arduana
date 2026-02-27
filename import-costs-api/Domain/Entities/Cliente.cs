namespace ImportCostsApi.Domain.Entities;

/// <summary>
/// Entidade que representa um Cliente
/// </summary>
public class Cliente : BaseEntity
{
    /// <summary>
    /// Nome do cliente
    /// </summary>
    public string Nome { get; set; } = string.Empty;

    /// <summary>
    /// Contato do cliente
    /// </summary>
    public string Contato { get; set; } = string.Empty;

    /// <summary>
    /// ID do template de packlist associado ao cliente
    /// </summary>
    public string? TemplatePacklistId { get; set; }

    /// <summary>
    /// Navegação: Template de packlist associado
    /// </summary>
    public TemplatePacklist? TemplatePacklist { get; set; }

    /// <summary>
    /// Navegação: Orçamentos do cliente
    /// </summary>
    public ICollection<Orcamento> Orcamentos { get; set; } = new List<Orcamento>();
}
