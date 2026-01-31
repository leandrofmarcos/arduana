namespace ImportCostsApi.Features.Aliquotas.CreateAliquota;

/// <summary>
/// DTO para criar um novo perfil de alíquotas
/// </summary>
public class CreateAliquotaDto
{
    public string Nome { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public decimal II { get; set; }
    public decimal IPI { get; set; }
    public decimal ICMS { get; set; }
    public decimal PIS { get; set; }
    public decimal COFINS { get; set; }
    public bool Padrao { get; set; }
}
