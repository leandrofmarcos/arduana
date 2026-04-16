using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Comex133Api.Domain.Entities;

[Table("UsuarioRoles")]
public class UsuarioRole
{
    public int UsuarioId { get; set; }
    public int RoleId { get; set; }

    public DateTime AtribuidoEm { get; set; }

    [ForeignKey(nameof(UsuarioId))]
    public Usuario Usuario { get; set; } = null!;

    [ForeignKey(nameof(RoleId))]
    public Role Role { get; set; } = null!;
}
