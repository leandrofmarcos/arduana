using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Comex133Api.Domain.Entities;

[Table("OrcamentosVenda")]
public class OrcamentoVenda : IHasTimestamps
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(30)]
    public string CodigoInterno { get; set; } = string.Empty;

    public int? ClienteId { get; set; }
    public Cliente? Cliente { get; set; }

    public int? SolicitacaoOrcamentoId { get; set; }
    public SolicitacaoOrcamento? SolicitacaoOrcamento { get; set; }

    public DateTime Data { get; set; }

    [Required, MaxLength(3)]
    public string TamContainer { get; set; } = "LCL";

    [Column(TypeName = "decimal(18,4)")]
    public decimal PesoBruto { get; set; }

    [Column(TypeName = "decimal(18,4)")]
    public decimal PesoLiquido { get; set; }

    [Column(TypeName = "decimal(18,4)")]
    public decimal FreteInternacional { get; set; }

    [Column(TypeName = "decimal(18,4)")]
    public decimal CifReais { get; set; }

    [Column(TypeName = "decimal(18,4)")]
    public decimal CifUsd { get; set; }

    [Column(TypeName = "decimal(18,4)")]
    public decimal FobReais { get; set; }

    [Column(TypeName = "decimal(18,4)")]
    public decimal FobUsd { get; set; }

    [Column(TypeName = "decimal(18,4)")]
    public decimal TaxaUsd { get; set; }

    [Column(TypeName = "decimal(18,4)")]
    public decimal Honorarios { get; set; }

    [Column(TypeName = "decimal(18,4)")]
    public decimal TotalImpostos { get; set; }

    [Column(TypeName = "decimal(18,4)")]
    public decimal TotalDespesas { get; set; }

    [Column(TypeName = "decimal(18,4)")]
    public decimal TotalExtras { get; set; }

    [Column(TypeName = "decimal(18,4)")]
    public decimal TotalGeral { get; set; }

    [MaxLength(1000)]
    public string? Observacao { get; set; }

    // Valores válidos: Aguardando | EmAndamento | Finalizado | Cancelado
    [Required, MaxLength(60)]
    public string Status { get; set; } = "Aguardando";

    // ── Versionamento (reabertura) ─────────────────────────────────────
    public int Versao { get; set; } = 1;

    public int? VersaoAnteriorId { get; set; }
    public OrcamentoVenda? VersaoAnterior { get; set; }

    public bool Imutavel { get; set; } = false;

    public DateTime CriadoEm { get; set; }
    public DateTime AtualizadoEm { get; set; }

    public ICollection<OrcamentoVendaDespesa>      Despesas { get; set; } = new List<OrcamentoVendaDespesa>();
    public ICollection<OrcamentoVendaDespesaExtra>  Extras   { get; set; } = new List<OrcamentoVendaDespesaExtra>();
    public ICollection<OrcamentoVendaCusto>         Custos   { get; set; } = new List<OrcamentoVendaCusto>();
}
