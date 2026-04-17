using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Comex133Api.Domain.Entities;

[Table("SolicitacoesOrcamento")]
public class SolicitacaoOrcamento : IHasTimestamps
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(30)]
    public string CodigoInterno { get; set; } = string.Empty;

    public int? ClienteId { get; set; }
    public Cliente? Cliente { get; set; }

    public int? ImportadorId { get; set; }
    public Importador? Importador { get; set; }

    [Required]
    public int PortoOrigemId { get; set; }
    public PortoOrigem PortoOrigem { get; set; } = null!;

    [Required]
    public int PortoDestinoId { get; set; }
    public PortoDestino PortoDestino { get; set; } = null!;

    [Required, MaxLength(200)]
    public string Responsavel { get; set; } = string.Empty;

    [Required, MaxLength(3)]
    public string TamContainer { get; set; } = "LCL";

    [Column(TypeName = "decimal(18,3)")]
    public decimal Peso { get; set; }

    [MaxLength(1000)]
    public string? Observacao { get; set; }

    [Required, MaxLength(60)]
    public string Status { get; set; } = "Rascunho";

    public DateTime Data { get; set; }

    public DateTime CriadoEm { get; set; }
    public DateTime AtualizadoEm { get; set; }

    public ICollection<SolicitacaoOrcamentoDespachante> Despachantes { get; set; } = new List<SolicitacaoOrcamentoDespachante>();
    public ICollection<SolicitacaoOrcamentoDocumento> Documentos { get; set; } = new List<SolicitacaoOrcamentoDocumento>();
}
