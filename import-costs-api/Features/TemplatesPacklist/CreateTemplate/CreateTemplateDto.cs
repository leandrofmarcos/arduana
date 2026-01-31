using Microsoft.AspNetCore.Http;

namespace ImportCostsApi.Features.TemplatesPacklist.CreateTemplate;

/// <summary>
/// DTO para criar um template de packlist
/// </summary>
public class CreateTemplateDto
{
    public string Nome { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public string Config { get; set; } = "{}";
    public IFormFile Arquivo { get; set; } = default!;
}
