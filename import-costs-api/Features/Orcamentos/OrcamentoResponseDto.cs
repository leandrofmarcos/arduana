namespace ImportCostsApi.Features.Orcamentos;

/// <summary>
/// DTO para resposta de Orçamento
/// </summary>
public class OrcamentoResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string Numero { get; set; } = string.Empty;
    public string? Titulo { get; set; }
    public string ClienteId { get; set; } = string.Empty;
    public string? DespachanteId { get; set; }
    public string? TemplatePacklistId { get; set; }
    public FaseOrcamento FaseAtual { get; set; }
    public StatusFase[] StatusFases { get; set; } = Array.Empty<StatusFase>();
    public bool Aprovado { get; set; }
    public bool AprovadoCliente { get; set; }
    public bool Oficializado { get; set; }
    public string MoedaPadrao { get; set; } = "BRL";
    public DateTime? DataSaida { get; set; }
    public DateTime? DataChegada { get; set; }
    public string? Descricao { get; set; }
    public string? TipoImportacao { get; set; }
    public DateTime DataCriacao { get; set; }
    public DateTime DataAtualizacao { get; set; }
    public OrcamentoResumoFases? Resumo { get; set; }
}
