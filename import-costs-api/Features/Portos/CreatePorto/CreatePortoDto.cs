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
}
