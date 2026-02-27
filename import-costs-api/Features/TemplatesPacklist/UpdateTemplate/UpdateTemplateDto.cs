namespace ImportCostsApi.Features.TemplatesPacklist.UpdateTemplate;

/// <summary>
/// DTO para atualização de template de packlist
/// </summary>
public class UpdateTemplateDto
{
    public string? Nome { get; set; }
    public string? Descricao { get; set; }
    public string? Config { get; set; }
    public string? NomeArquivo { get; set; }
    public IFormFile? Arquivo { get; set; }
}
