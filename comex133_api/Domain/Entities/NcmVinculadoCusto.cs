using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Comex133Api.Domain.Entities;

[Table("NcmsVinculadosCusto")]
public class NcmVinculadoCusto : IHasTimestamps
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int CustoDespachanteId { get; set; }
    public CustoDespachante CustoDespachante { get; set; } = null!;

    public int? NcmId { get; set; }
    public Ncm? Ncm { get; set; }

    [Required, MaxLength(20)]
    public string NumeroNcm { get; set; } = string.Empty;

    [Required, MaxLength(500)]
    public string Descricao { get; set; } = string.Empty;

    [Column(TypeName = "decimal(8,4)")]
    public decimal AliIi { get; set; }

    [Column(TypeName = "decimal(8,4)")]
    public decimal AliIpi { get; set; }

    [Column(TypeName = "decimal(8,4)")]
    public decimal AliPis { get; set; }

    [Column(TypeName = "decimal(8,4)")]
    public decimal AliCofins { get; set; }

    [Column(TypeName = "decimal(8,4)")]
    public decimal AliIcms { get; set; }

    [Column(TypeName = "decimal(18,4)")]
    public decimal BaseCalculo { get; set; }

    public DateTime CriadoEm { get; set; }
    public DateTime AtualizadoEm { get; set; }

    public ICollection<ValorImpostoCusto> ValoresImposto { get; set; } = new List<ValorImpostoCusto>();
}
