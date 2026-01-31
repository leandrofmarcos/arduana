namespace ImportCostsApi.Features.Portos.CreatePorto;

/// <summary>
/// DTO para criar um novo porto
/// </summary>
public class CreatePortoDto
{
    /// <summary>
    /// Nome do porto
    /// </summary>
    public string Nome { get; set; } = string.Empty;

    /// <summary>
    /// Código UN/LOCODE (5 caracteres)
    /// </summary>
    public string Codigo { get; set; } = string.Empty;

    /// <summary>
    /// País do porto
    /// </summary>
    public string Pais { get; set; } = string.Empty;
}
