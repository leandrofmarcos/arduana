using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Comex133Api.Domain.Entities;

[Table("PacklistItens")]
public class PacklistItem : IHasTimestamps
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int PacklistId { get; set; }
    public Packlist Packlist { get; set; } = null!;

    public int NumeroLinha { get; set; }

    [Required]
    public string DadosJson { get; set; } = "{}";

    [MaxLength(20)]
    public string? NCM { get; set; }

    [MaxLength(500)]
    public string? Descricao { get; set; }

    [Column(TypeName = "decimal(18,4)")]
    public decimal? Preco { get; set; }

    public DateTime CriadoEm { get; set; }
    public DateTime AtualizadoEm { get; set; }
}
