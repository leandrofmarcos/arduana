namespace ImportCostsApi.Features.Despachantes.UpdateDespachante;

/// <summary>
/// DTO para atualizar um despachante
/// </summary>
public class UpdateDespachanteDto
{
    /// <summary>
    /// Nome do despachante
    /// </summary>
    public string? Nome { get; set; }

    /// <summary>
    /// Contato do despachante
    /// </summary>
    public string? Contato { get; set; }
}
