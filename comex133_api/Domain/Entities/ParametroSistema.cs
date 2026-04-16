using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Comex133Api.Domain.Entities;

[Table("ParametrosSistema")]
public class ParametroSistema
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Chave { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string Valor { get; set; } = string.Empty;

    [MaxLength(250)]
    public string? Descricao { get; set; }

    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;

    public DateTime AtualizadoEm { get; set; } = DateTime.UtcNow;
}
