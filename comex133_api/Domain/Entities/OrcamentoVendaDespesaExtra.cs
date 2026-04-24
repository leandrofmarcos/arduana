using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Comex133Api.Domain.Entities;

[Table("OrcamentosVendaDespesasExtras")]
public class OrcamentoVendaDespesaExtra : IHasTimestamps
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int OrcamentoVendaId { get; set; }
    public OrcamentoVenda OrcamentoVenda { get; set; } = null!;

    [Required, MaxLength(500)]
    public string Descricao { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,4)")]
    public decimal Valor { get; set; }

    public DateTime CriadoEm { get; set; }
    public DateTime AtualizadoEm { get; set; }
}
