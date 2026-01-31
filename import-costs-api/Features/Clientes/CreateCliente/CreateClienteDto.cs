namespace ImportCostsApi.Features.Clientes.CreateCliente;

/// <summary>
/// DTO para criar um novo cliente
/// </summary>
public class CreateClienteDto
{
    /// <summary>
    /// Nome do cliente
    /// </summary>
    public string Nome { get; set; } = string.Empty;

    /// <summary>
    /// Documento do cliente (CPF ou CNPJ)
    /// </summary>
    public string Documento { get; set; } = string.Empty;

    /// <summary>
    /// Contato do cliente
    /// </summary>
    public string Contato { get; set; } = string.Empty;

    /// <summary>
    /// ID do template de packlist padrão do cliente
    /// </summary>
    public string? TemplatePacklistId { get; set; }
}
