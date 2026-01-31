namespace ImportCostsApi.Features.Packlists.AddPacklistItem;

/// <summary>
/// DTO para adicionar item ao packlist
/// </summary>
public class AddPacklistItemDto
{
    public string Codigo { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public decimal Quantidade { get; set; }
    public decimal PesoKg { get; set; }
    public decimal ValorUSD { get; set; }
    public decimal? VolumeM3 { get; set; }
}
