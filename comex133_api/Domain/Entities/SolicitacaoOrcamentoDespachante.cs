using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Comex133Api.Domain.Entities;

[Table("SolicitacoesOrcamentoDespachantes")]
public class SolicitacaoOrcamentoDespachante : IHasTimestamps
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int SolicitacaoOrcamentoId { get; set; }
    public SolicitacaoOrcamento SolicitacaoOrcamento { get; set; } = null!;

    [Required]
    public int DespachanteId { get; set; }
    public Despachante Despachante { get; set; } = null!;

    [Required, MaxLength(60)]
    public string Status { get; set; } = "PendenteDespachante";

    public DateTime DataEnvio { get; set; }

    public DateTime CriadoEm { get; set; }
    public DateTime AtualizadoEm { get; set; }
}
