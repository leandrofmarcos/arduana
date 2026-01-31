namespace ImportCostsApi.Features.Packlists;

/// <summary>
/// DTO de resposta para item de packlist
/// </summary>
public class PacklistItemResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string PacklistId { get; set; } = string.Empty;
    public string Codigo { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public decimal Quantidade { get; set; }
    public decimal PesoKg { get; set; }
    public decimal ValorUSD { get; set; }
    public decimal? VolumeM3 { get; set; }
}
