using Microsoft.AspNetCore.Http;

namespace ImportCostsApi.Features.Packlists.UploadPacklist;

/// <summary>
/// DTO para upload de arquivo do packlist
/// </summary>
public class UploadPacklistDto
{
    public IFormFile Arquivo { get; set; } = default!;
    public string? EnviadoPor { get; set; }
    public int? TotalItems { get; set; }
    public string? MappingConfig { get; set; }
}
