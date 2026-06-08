using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Comex133Api.Domain.Entities;

[Table("Packlists")]
public class Packlist : IHasTimestamps
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int SolicitacaoOrcamentoId { get; set; }
    public SolicitacaoOrcamento SolicitacaoOrcamento { get; set; } = null!;

    [Required, MaxLength(255)]
    public string NomeArquivo { get; set; } = string.Empty;

    [Required, MaxLength(10)]
    public string ExtensaoArquivo { get; set; } = string.Empty;

    [Required, MaxLength(500)]
    public string CaminhoArquivo { get; set; } = string.Empty;

    public int TotalLinhas { get; set; }

    [MaxLength(100)]
    public string? ColunaNCM { get; set; }

    [MaxLength(100)]
    public string? ColunaDescricao { get; set; }

    [MaxLength(100)]
    public string? ColunaPreco { get; set; }

    public bool TemCelulasMescladas { get; set; }

    public DateTime DataUpload { get; set; }

    public int? UploadPorUsuarioId { get; set; }

    public DateTime CriadoEm { get; set; }
    public DateTime AtualizadoEm { get; set; }

    public ICollection<PacklistItem> Itens { get; set; } = new List<PacklistItem>();
}
