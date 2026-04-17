using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Comex133Api.Domain.Entities;

[Table("ListaPrecoLcl")]
public class ListaPrecoLcl : IHasTimestamps
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(150)]
    public string Categoria { get; set; } = string.Empty;

    [Required, MaxLength(500)]
    public string Descricao { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? NomeChines { get; set; }

    [Column(TypeName = "decimal(15,4)")]
    public decimal PrecoUsdPorCbm { get; set; }

    [Column(TypeName = "decimal(15,4)")]
    public decimal PrecoUsdPorKg { get; set; }

    public DateTime DataVigencia { get; set; }

    public bool Ativo { get; set; } = true;

    public DateTime CriadoEm { get; set; }
    public DateTime AtualizadoEm { get; set; }
}

