namespace ImportCostsApi.Features.Portos.UpdatePorto;

/// <summary>
/// DTO para atualizar um porto
/// </summary>
public class UpdatePortoDto
{
    /// <summary>
    /// Nome do porto
    /// </summary>
    public string? Nome { get; set; }

    /// <summary>
    /// Código UN/LOCODE (5 caracteres)
    /// </summary>
    public string? Codigo { get; set; }

    /// <summary>
    /// País do porto
    /// </summary>
    public string? Pais { get; set; }
}
