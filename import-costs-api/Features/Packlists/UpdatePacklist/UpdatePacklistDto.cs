using ImportCostsApi.Domain.Enums;

namespace ImportCostsApi.Features.Packlists.UpdatePacklist;

/// <summary>
/// DTO para atualizar packlist
/// </summary>
public class UpdatePacklistDto
{
    public string? Codigo { get; set; }
    public string? Cliente { get; set; }
    public string? Despachante { get; set; }
    public string? MappingConfig { get; set; }
    public PacklistStatus? Status { get; set; }
    public int? TotalItems { get; set; }
}
