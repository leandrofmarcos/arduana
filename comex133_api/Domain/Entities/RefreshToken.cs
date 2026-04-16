using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Comex133Api.Domain.Entities;

[Table("RefreshTokens")]
public class RefreshToken
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(500)]
    public string Token { get; set; } = string.Empty;

    public int UsuarioId { get; set; }

    public DateTime ExpiresAt { get; set; }
    public DateTime? UsedAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    public DateTime CriadoEm { get; set; }

    [ForeignKey(nameof(UsuarioId))]
    public Usuario Usuario { get; set; } = null!;

    [NotMapped]
    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;

    [NotMapped]
    public bool IsActive => RevokedAt == null && UsedAt == null && !IsExpired;
}
