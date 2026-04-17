using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Comex133Api.Domain.Entities;

[Table("Importadores")]
public class Importador : IHasTimestamps
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string RazaoSocial { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Cnpj { get; set; }

    [MaxLength(150)]
    public string? Email { get; set; }

    [MaxLength(30)]
    public string? Telefone { get; set; }

    public bool Ativo { get; set; } = true;

    public DateTime CriadoEm { get; set; }
    public DateTime AtualizadoEm { get; set; }
}

