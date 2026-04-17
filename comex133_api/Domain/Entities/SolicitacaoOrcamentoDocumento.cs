using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Comex133Api.Domain.Entities;

[Table("SolicitacoesOrcamentoDocumentos")]
public class SolicitacaoOrcamentoDocumento : IHasTimestamps
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int SolicitacaoOrcamentoId { get; set; }
    public SolicitacaoOrcamento SolicitacaoOrcamento { get; set; } = null!;

    [Required, MaxLength(250)]
    public string NomeArquivo { get; set; } = string.Empty;

    [Required, MaxLength(500)]
    public string LinkDocumento { get; set; } = string.Empty;

    public DateTime DataUpload { get; set; }

    [MaxLength(500)]
    public string? Observacao { get; set; }

    public DateTime CriadoEm { get; set; }
    public DateTime AtualizadoEm { get; set; }
}
