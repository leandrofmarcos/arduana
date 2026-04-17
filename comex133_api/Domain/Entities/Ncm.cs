using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Comex133Api.Domain.Entities;

[Table("Ncms")]
public class Ncm : IHasTimestamps
{
    [Key]
    public int Id { get; set; }

    /// <summary>Código NCM — exatamente 8 dígitos numéricos.</summary>
    [Required, MaxLength(8)]
    public string CodigoNcm { get; set; } = string.Empty;

    [Required, MaxLength(500)]
    public string Descricao { get; set; } = string.Empty;

    [Column(TypeName = "decimal(5,2)")]
    public decimal AliqII { get; set; }

    [Column(TypeName = "decimal(5,2)")]
    public decimal AliqIPI { get; set; }

    [Column(TypeName = "decimal(5,2)")]
    public decimal AliqPIS { get; set; }

    [Column(TypeName = "decimal(5,2)")]
    public decimal AliqCOFINS { get; set; }

    [Column(TypeName = "decimal(5,2)")]
    public decimal AliqICMS { get; set; }

    public bool Ativo { get; set; } = true;

    public DateTime CriadoEm { get; set; }
    public DateTime AtualizadoEm { get; set; }
}

