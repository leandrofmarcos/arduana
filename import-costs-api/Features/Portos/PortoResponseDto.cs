namespace ImportCostsApi.Features.Portos;

/// <summary>
/// DTO de resposta para porto
/// </summary>
public class PortoResponseDto
{
    /// <summary>
    /// ID do porto
    /// </summary>
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// Nome do porto
    /// </summary>
    public string Nome { get; set; } = string.Empty;

    /// <summary>
    /// Código UN/LOCODE
    /// </summary>
    public string Codigo { get; set; } = string.Empty;

    /// <summary>
    /// País do porto
    /// </summary>
    public string Pais { get; set; } = string.Empty;

    /// <summary>
    /// Data de criação do porto
    /// </summary>
    public DateTime CreatedAt { get; set; }
}
