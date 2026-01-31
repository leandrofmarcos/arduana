namespace ImportCostsApi.Features.Aliquotas.UpdateAliquota;

/// <summary>
/// DTO para atualização de perfil de alíquotas
/// </summary>
public class UpdateAliquotaDto
{
    public string? Nome { get; set; }
    public string? Descricao { get; set; }
    public decimal? II { get; set; }
    public decimal? IPI { get; set; }
    public decimal? ICMS { get; set; }
    public decimal? PIS { get; set; }
    public decimal? COFINS { get; set; }
    public bool? Padrao { get; set; }
}
