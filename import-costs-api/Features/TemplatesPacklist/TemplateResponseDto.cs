namespace ImportCostsApi.Features.TemplatesPacklist;

/// <summary>
/// DTO de resposta para template de packlist
/// </summary>
public class TemplateResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public string NomeArquivo { get; set; } = string.Empty;
    public string Config { get; set; } = "{}";
    public DateTime DataCriacao { get; set; }
    public DateTime DataAtualizacao { get; set; }
}
