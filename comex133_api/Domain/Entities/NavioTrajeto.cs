using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Comex133Api.Domain.Entities;

public enum StatusPerna
{
    Previsto   = 0,
    EmTransito = 1,
    Atracado   = 2,
    Concluido  = 3
}

[Table("NaviosTrajetos")]
public class NavioTrajeto : IHasTimestamps
{
    [Key]
    public int Id { get; set; }

    public int NavioId { get; set; }

    [ForeignKey(nameof(NavioId))]
    public Navio Navio { get; set; } = null!;

    [Required, MaxLength(50)]
    public string NumeroViagem { get; set; } = string.Empty;

    public int Sequencia { get; set; }

    public int PortoOrigemId { get; set; }

    [ForeignKey(nameof(PortoOrigemId))]
    public PortoOrigem PortoOrigem { get; set; } = null!;

    public int PortoDestinoId { get; set; }

    [ForeignKey(nameof(PortoDestinoId))]
    public PortoDestino PortoDestino { get; set; } = null!;

    public DateTime Etd { get; set; }

    public DateTime Eta { get; set; }

    public StatusPerna StatusPerna { get; set; } = StatusPerna.Previsto;

    [MaxLength(300)]
    public string? Observacao { get; set; }

    public DateTime CriadoEm { get; set; }
    public DateTime AtualizadoEm { get; set; }

    public ICollection<EmbarqueNavioVinculo> Vinculos { get; set; } = new List<EmbarqueNavioVinculo>();
}
