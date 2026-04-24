using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Comex133Api.Domain.Entities;

[Table("CustosDespachanteDespesas")]
public class CustoDespachanteDespesa : IHasTimestamps
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int CustoDespachanteId { get; set; }
    public CustoDespachante CustoDespachante { get; set; } = null!;

    [Required, MaxLength(500)]
    public string Descricao { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,4)")]
    public decimal Valor { get; set; }

    public DateTime Data { get; set; }

    public bool EntraBaseIcms { get; set; } = false;

    public DateTime CriadoEm { get; set; }
    public DateTime AtualizadoEm { get; set; }
}
