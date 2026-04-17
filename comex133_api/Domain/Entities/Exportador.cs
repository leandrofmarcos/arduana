using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Comex133Api.Domain.Entities;

[Table("Exportadores")]
public class Exportador : IHasTimestamps
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Nome { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? Documento { get; set; }

    [Required, MaxLength(100)]
    public string Pais { get; set; } = string.Empty;

    [MaxLength(150)]
    public string? Cidade { get; set; }

    public bool Ativo { get; set; } = true;

    public DateTime CriadoEm { get; set; }
    public DateTime AtualizadoEm { get; set; }
}

