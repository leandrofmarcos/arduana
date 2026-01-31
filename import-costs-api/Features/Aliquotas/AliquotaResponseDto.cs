namespace ImportCostsApi.Features.Aliquotas;

/// <summary>
/// DTO de resposta para perfil de alíquotas
/// </summary>
public class AliquotaResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public decimal II { get; set; }
    public decimal IPI { get; set; }
    public decimal ICMS { get; set; }
    public decimal PIS { get; set; }
    public decimal COFINS { get; set; }
    public bool Padrao { get; set; }
    public DateTime CreatedAt { get; set; }
}
