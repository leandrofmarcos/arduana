using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Comex133Api.Domain.Entities;

[Table("Despachantes")]
public class Despachante : IHasTimestamps
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Nome { get; set; } = string.Empty;

    /// <summary>Número do CRN (Conselho Regional dos Despachantes Aduaneiros)</summary>
    [MaxLength(30)]
    public string? Crn { get; set; }

    [MaxLength(150)]
    public string? Email { get; set; }

    [MaxLength(30)]
    public string? Telefone { get; set; }

    /// <summary>Prefixo de 3 letras usado na geração do código dos custos (ex: "ORC" → ORC0426001)</summary>
    [MaxLength(3)]
    public string? PrefixoReferencia { get; set; }

    public bool Ativo { get; set; } = true;

    public DateTime CriadoEm { get; set; }
    public DateTime AtualizadoEm { get; set; }
}

