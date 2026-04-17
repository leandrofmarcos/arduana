using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Comex133Api.Domain.Entities;

[Table("ControleNavios")]
public class ControleNavio : IHasTimestamps
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(50)]
    public string NumeroViagem { get; set; } = string.Empty;

    [Required, MaxLength(150)]
    public string NomeNavio { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Observacao { get; set; }

    public bool Ativo { get; set; } = true;

    public DateTime CriadoEm { get; set; }
    public DateTime AtualizadoEm { get; set; }

    public ICollection<ControleNavioTrajeto> Trajetos { get; set; } = new List<ControleNavioTrajeto>();
}
