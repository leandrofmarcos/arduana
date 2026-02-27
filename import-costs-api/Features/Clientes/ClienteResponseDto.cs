namespace ImportCostsApi.Features.Clientes;

/// <summary>
/// DTO de resposta para cliente
/// </summary>
public class ClienteResponseDto
{
    /// <summary>
    /// ID do cliente
    /// </summary>
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// Nome do cliente
    /// </summary>
    public string Nome { get; set; } = string.Empty;

    /// <summary>
    /// Contato do cliente
    /// </summary>
    public string Contato { get; set; } = string.Empty;

    /// <summary>
    /// ID do template de packlist padrão do cliente
    /// </summary>
    public string? TemplatePacklistId { get; set; }

    /// <summary>
    /// Data de criação do cliente
    /// </summary>
    public DateTime CreatedAt { get; set; }
}
