namespace ImportCostsApi.Features.Packlists.UpdatePacklistItem;

/// <summary>
/// DTO para atualizar item do packlist
/// </summary>
public class UpdatePacklistItemDto
{
    public string? Codigo { get; set; }
    public string? Descricao { get; set; }
    public decimal? Quantidade { get; set; }
    public decimal? PesoKg { get; set; }
    public decimal? ValorUSD { get; set; }
    public decimal? VolumeM3 { get; set; }
}
