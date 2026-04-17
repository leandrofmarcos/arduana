using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Comex133Api.Domain.Entities;

[Table("EmbarqueNavioVinculos")]
public class EmbarqueNavioVinculo : IHasTimestamps
{
    [Key]
    public int Id { get; set; }

    /// <summary>FK para SolicitacaoOrcamento (EmbarqueAduana no frontend)</summary>
    public int EmbarqueAduanaId { get; set; }

    [ForeignKey(nameof(EmbarqueAduanaId))]
    public SolicitacaoOrcamento EmbarqueAduana { get; set; } = null!;

    public int NavioId { get; set; }

    [ForeignKey(nameof(NavioId))]
    public Navio Navio { get; set; } = null!;

    /// <summary>FK opcional para a perna específica onde esta carga está embarcada</summary>
    public int? NavioTrajetoId { get; set; }

    [ForeignKey(nameof(NavioTrajetoId))]
    public NavioTrajeto? NavioTrajeto { get; set; }

    [MaxLength(50)]
    public string? NumeroViagem { get; set; }

    public bool Ativo { get; set; } = true;

    public DateTime VinculadoEm { get; set; }

    public DateTime? DesvinculadoEm { get; set; }

    [MaxLength(500)]
    public string? Observacao { get; set; }

    public DateTime CriadoEm { get; set; }
    public DateTime AtualizadoEm { get; set; }
}
