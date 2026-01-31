using ImportCostsApi.Domain.Enums;

namespace ImportCostsApi.Features.Packlists;

/// <summary>
/// DTO de resposta para Packlist
/// </summary>
public class PacklistResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string OrcamentoId { get; set; } = string.Empty;
    public string? Codigo { get; set; }
    public string? Cliente { get; set; }
    public string? Despachante { get; set; }
    public string? ArquivoNome { get; set; }
    public string? ArquivoCaminho { get; set; }
    public DateTime EnviadoEm { get; set; }
    public string? EnviadoPor { get; set; }
    public PacklistStatus Status { get; set; }
    public int? TotalItems { get; set; }
    public string? MappingConfig { get; set; }
}
