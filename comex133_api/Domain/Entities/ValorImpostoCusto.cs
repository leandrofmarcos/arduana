using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Comex133Api.Domain.Entities;

[Table("ValoresImpostoCusto")]
public class ValorImpostoCusto : IHasTimestamps
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int NcmVinculadoCustoId { get; set; }
    public NcmVinculadoCusto NcmVinculadoCusto { get; set; } = null!;

    [Column(TypeName = "decimal(8,4)")]
    public decimal AliIi { get; set; }
    [Column(TypeName = "decimal(18,4)")]
    public decimal ValorIi { get; set; }

    [Column(TypeName = "decimal(8,4)")]
    public decimal AliIpi { get; set; }
    [Column(TypeName = "decimal(18,4)")]
    public decimal ValorIpi { get; set; }

    [Column(TypeName = "decimal(8,4)")]
    public decimal AliPis { get; set; }
    [Column(TypeName = "decimal(18,4)")]
    public decimal ValorPis { get; set; }

    [Column(TypeName = "decimal(8,4)")]
    public decimal AliCofins { get; set; }
    [Column(TypeName = "decimal(18,4)")]
    public decimal ValorCofins { get; set; }

    [Column(TypeName = "decimal(8,4)")]
    public decimal AliIcms { get; set; }
    [Column(TypeName = "decimal(18,4)")]
    public decimal ValorIcms { get; set; }

    [Column(TypeName = "decimal(18,4)")]
    public decimal TotalImpostos { get; set; }

    public DateTime CriadoEm { get; set; }
    public DateTime AtualizadoEm { get; set; }
}
