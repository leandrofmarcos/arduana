namespace ImportCostsApi.Features.Clientes.UpdateCliente;

/// <summary>
/// DTO para atualizar um cliente
/// </summary>
public class UpdateClienteDto
{
    /// <summary>
    /// Nome do cliente
    /// </summary>
    public string? Nome { get; set; }

    /// <summary>
    /// Contato do cliente
    /// </summary>
    public string? Contato { get; set; }

    /// <summary>
    /// ID do template de packlist padrão do cliente
    /// </summary>
    public string? TemplatePacklistId { get; set; }
}
