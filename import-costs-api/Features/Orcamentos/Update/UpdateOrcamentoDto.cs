namespace ImportCostsApi.Features.Orcamentos.Update;

/// <summary>
/// DTO para atualizar Orçamento
/// </summary>
public class UpdateOrcamentoDto
{
    public string? Numero { get; set; }
    public string? Titulo { get; set; }
    public string? DespachanteId { get; set; }
    public string? MoedaPadrao { get; set; }
    public bool? Aprovado { get; set; }
    public bool? AprovadoCliente { get; set; }
}
