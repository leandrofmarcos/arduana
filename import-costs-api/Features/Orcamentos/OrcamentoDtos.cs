namespace ImportCostsApi.Features.Orcamentos.Create;

/// <summary>
/// DTO para criar novo Orçamento
/// </summary>
public class CreateOrcamentoDto
{
    public string Numero { get; set; } = string.Empty;
    public string? Titulo { get; set; }
    public string ClienteId { get; set; } = string.Empty;
    public string? DespachanteId { get; set; }
    public string? TemplatePacklistId { get; set; }
    public string MoedaPadrao { get; set; } = "BRL";
}
