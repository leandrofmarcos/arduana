using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Comex133Api.Domain.Entities;

/// <summary>
/// Associa um usuário a uma entidade de negócio concreta.
/// TipoVinculo define qual entidade: "Despachante", "Cliente", "AgenteCarga", "Exportador".
/// EntidadeId é a PK da entidade correspondente.
/// </summary>
[Table("UsuarioVinculos")]
public class UsuarioVinculo : IHasTimestamps
{
    [Key]
    public int Id { get; set; }

    public int UsuarioId { get; set; }

    [Required, MaxLength(50)]
    public string TipoVinculo { get; set; } = string.Empty;

    public int EntidadeId { get; set; }

    public bool Ativo { get; set; } = true;

    public DateTime CriadoEm { get; set; }
    public DateTime AtualizadoEm { get; set; }

    [ForeignKey(nameof(UsuarioId))]
    public Usuario Usuario { get; set; } = null!;
}
