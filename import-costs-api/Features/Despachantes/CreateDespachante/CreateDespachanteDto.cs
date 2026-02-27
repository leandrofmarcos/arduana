namespace ImportCostsApi.Features.Despachantes.CreateDespachante;

/// <summary>
/// DTO para criar um novo despachante
/// </summary>
public class CreateDespachanteDto
{
    /// <summary>
    /// Nome do despachante
    /// </summary>
    public string Nome { get; set; } = string.Empty;

    /// <summary>
    /// Contato do despachante
    /// </summary>
    public string Contato { get; set; } = string.Empty;
}
