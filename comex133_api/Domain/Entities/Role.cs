using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Comex133Api.Domain.Entities;

[Table("Roles")]
public class Role
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(50)]
    public string Nome { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? Descricao { get; set; }

    public DateTime CriadoEm { get; set; }
    public DateTime AtualizadoEm { get; set; }

    public ICollection<UsuarioRole> UsuarioRoles { get; set; } = new List<UsuarioRole>();
}
