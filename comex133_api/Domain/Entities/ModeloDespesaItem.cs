using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Comex133Api.Domain.Entities;

[Table("ModelosDespesaItens")]
[PrimaryKey(nameof(ModeloDespesaId), nameof(DespesaCatalogoId))]
public class ModeloDespesaItem
{
    public int ModeloDespesaId { get; set; }
    public int DespesaCatalogoId { get; set; }

    public DateTime AdicionadoEm { get; set; }

    [ForeignKey(nameof(ModeloDespesaId))]
    public ModeloDespesa ModeloDespesa { get; set; } = null!;

    [ForeignKey(nameof(DespesaCatalogoId))]
    public DespesaCatalogo DespesaCatalogo { get; set; } = null!;
}
