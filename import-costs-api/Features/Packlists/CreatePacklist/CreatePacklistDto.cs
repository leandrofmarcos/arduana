namespace ImportCostsApi.Features.Packlists.CreatePacklist;

/// <summary>
/// DTO para criar packlist
/// </summary>
public class CreatePacklistDto
{
    public string? Codigo { get; set; }
    public string? Cliente { get; set; }
    public string? Despachante { get; set; }
    public string? MappingConfig { get; set; }
}
