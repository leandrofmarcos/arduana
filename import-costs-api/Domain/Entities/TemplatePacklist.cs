namespace ImportCostsApi.Domain.Entities;

/// <summary>
/// Entidade que representa um Template de Packlist
/// </summary>
public class TemplatePacklist : BaseEntity
{
    /// <summary>
    /// Nome do template
    /// </summary>
    public string Nome { get; set; } = string.Empty;

    /// <summary>
    /// Descrição do template
    /// </summary>
    public string? Descricao { get; set; }

    /// <summary>
    /// Nome do arquivo de template
    /// </summary>
    public string NomeArquivo { get; set; } = string.Empty;

    /// <summary>
    /// Configuração do template em formato JSON
    /// </summary>
    public string Config { get; set; } = "{}";

    /// <summary>
    /// Data de criação do template
    /// </summary>
    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Data da última atualização do template
    /// </summary>
    public DateTime DataAtualizacao { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Navegação: Clientes que utilizam este template
    /// </summary>
    public ICollection<Cliente> Clientes { get; set; } = new List<Cliente>();
}
