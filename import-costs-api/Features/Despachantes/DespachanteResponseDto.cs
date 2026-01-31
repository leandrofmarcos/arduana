namespace ImportCostsApi.Features.Despachantes;

/// <summary>
/// DTO de resposta para despachante
/// </summary>
public class DespachanteResponseDto
{
    /// <summary>
    /// ID do despachante
    /// </summary>
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// Nome do despachante
    /// </summary>
    public string Nome { get; set; } = string.Empty;

    /// <summary>
    /// Documento do despachante (CPF ou CNPJ)
    /// </summary>
    public string Documento { get; set; } = string.Empty;

    /// <summary>
    /// Contato do despachante
    /// </summary>
    public string Contato { get; set; } = string.Empty;

    /// <summary>
    /// Data de criação do despachante
    /// </summary>
    public DateTime CreatedAt { get; set; }
}
