using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Comex133Api.Domain.Entities;

[Table("Navios")]
public class Navio : IHasTimestamps
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(150)]
    public string NomeNavio { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? CodigoImo { get; set; }

    [MaxLength(150)]
    public string? Armador { get; set; }

    [MaxLength(500)]
    public string? Observacao { get; set; }

    public bool Ativo { get; set; } = true;

    public DateTime CriadoEm { get; set; }
    public DateTime AtualizadoEm { get; set; }

    public ICollection<NavioTrajeto> Trajetos { get; set; } = new List<NavioTrajeto>();
    public ICollection<EmbarqueNavioVinculo> Vinculos { get; set; } = new List<EmbarqueNavioVinculo>();
}
