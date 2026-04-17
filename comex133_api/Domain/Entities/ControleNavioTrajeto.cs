using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Comex133Api.Domain.Entities;

[Table("ControleNaviosTrajetos")]
public class ControleNavioTrajeto : IHasTimestamps
{
    [Key]
    public int Id { get; set; }

    public int ControleNavioId { get; set; }

    [ForeignKey(nameof(ControleNavioId))]
    public ControleNavio ControleNavio { get; set; } = null!;

    public int PortoOrigemId { get; set; }

    [ForeignKey(nameof(PortoOrigemId))]
    public PortoOrigem PortoOrigem { get; set; } = null!;

    public int PortoDestinoId { get; set; }

    [ForeignKey(nameof(PortoDestinoId))]
    public PortoDestino PortoDestino { get; set; } = null!;

    public DateTime Etd { get; set; }

    public DateTime Eta { get; set; }

    [MaxLength(300)]
    public string? TrajetoDescricao { get; set; }

    public DateTime CriadoEm { get; set; }
    public DateTime AtualizadoEm { get; set; }
}
