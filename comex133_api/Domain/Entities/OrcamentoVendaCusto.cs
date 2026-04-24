using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Comex133Api.Domain.Entities;

/// <summary>
/// Tabela de ligação N:N entre OrcamentoVenda e CustoDespachante.
/// O OV pode vincular múltiplos custos e cancelar individualmente.
/// </summary>
[Table("OrcamentosVendaCustos")]
public class OrcamentoVendaCusto : IHasTimestamps
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int OrcamentoVendaId { get; set; }
    public OrcamentoVenda OrcamentoVenda { get; set; } = null!;

    [Required]
    public int CustoDespachanteId { get; set; }
    public CustoDespachante CustoDespachante { get; set; } = null!;

    public DateTime CriadoEm { get; set; }
    public DateTime AtualizadoEm { get; set; }
}
