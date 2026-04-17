using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Comex133Api.Domain.Entities;

[Table("PortosDestino")]
public class PortoDestino : IHasTimestamps
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(150)]
    public string Nome { get; set; } = string.Empty;

    [Required, MaxLength(10)]
    public string Codigo { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? Estado { get; set; }

    [Required, MaxLength(100)]
    public string Pais { get; set; } = string.Empty;

    public bool Ativo { get; set; } = true;

    public DateTime CriadoEm { get; set; }
    public DateTime AtualizadoEm { get; set; }
}

