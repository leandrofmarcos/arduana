using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Comex133Api.Domain.Entities;

[Table("DespesasCatalogo")]
public class DespesaCatalogo : IHasTimestamps
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(300)]
    public string Descricao { get; set; } = string.Empty;

    [Column(TypeName = "decimal(15,2)")]
    public decimal Valor { get; set; }

    [Required, MaxLength(50)]
    public string Categoria { get; set; } = string.Empty;

    public bool Ativo { get; set; } = true;

    public DateTime CriadoEm { get; set; }
    public DateTime AtualizadoEm { get; set; }

    public ICollection<ModeloDespesaItem> ModeloDespesaItens { get; set; } = [];
}

