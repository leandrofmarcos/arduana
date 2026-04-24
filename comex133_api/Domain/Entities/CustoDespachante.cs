using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Comex133Api.Domain.Entities;

[Table("CustosDespachante")]
public class CustoDespachante : IHasTimestamps
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(30)]
    public string CodigoInterno { get; set; } = string.Empty;

    // Vínculo com a solicitação de origem (opcional — pode existir custo avulso)
    public int? SolicitacaoOrcamentoId { get; set; }
    public SolicitacaoOrcamento? SolicitacaoOrcamento { get; set; }

    [Required]
    public int DespachanteId { get; set; }
    public Despachante Despachante { get; set; } = null!;

    public int? ImportadorId { get; set; }
    public Importador? Importador { get; set; }

    [Required]
    public int PortoOrigemId { get; set; }
    public PortoOrigem PortoOrigem { get; set; } = null!;

    [Required]
    public int PortoDestinoId { get; set; }
    public PortoDestino PortoDestino { get; set; } = null!;

    [Required, MaxLength(200)]
    public string Responsavel { get; set; } = string.Empty;

    [Required, MaxLength(3)]
    public string TamContainer { get; set; } = "LCL";

    [Column(TypeName = "decimal(18,4)")]
    public decimal Peso { get; set; }

    [Column(TypeName = "decimal(18,4)")]
    public decimal FobUsd { get; set; }

    [Column(TypeName = "decimal(18,4)")]
    public decimal FobReais { get; set; }

    [Column(TypeName = "decimal(18,4)")]
    public decimal CifUsd { get; set; }

    [Column(TypeName = "decimal(18,4)")]
    public decimal CifReais { get; set; }

    [Column(TypeName = "decimal(18,4)")]
    public decimal SeguroUsd { get; set; }

    [Column(TypeName = "decimal(18,4)")]
    public decimal TaxaUsd { get; set; }

    [Column(TypeName = "decimal(18,4)")]
    public decimal? TaxaUsdAgente { get; set; }

    [MaxLength(1000)]
    public string? Observacao { get; set; }

    public DateTime Data { get; set; }

    // ── Status operacional ─────────────────────────────────────────────
    // Valores válidos: Pendente | EmAndamento | Finalizado | ReabertoPeloOV | CanceladoPeloOV
    [Required, MaxLength(60)]
    public string Status { get; set; } = "Pendente";

    // ── Versionamento (reabertura pelo OV) ────────────────────────────
    public int Versao { get; set; } = 1;

    public int? VersaoAnteriorId { get; set; }
    public CustoDespachante? VersaoAnterior { get; set; }

    public bool Imutavel { get; set; } = false;

    // ── Timestamps ────────────────────────────────────────────────────
    public DateTime CriadoEm { get; set; }
    public DateTime AtualizadoEm { get; set; }

    // ── Navegação filhos ──────────────────────────────────────────────
    public ICollection<CustoDespachanteLi>      Lis      { get; set; } = new List<CustoDespachanteLi>();
    public ICollection<CustoDespachanteDespesa> Despesas { get; set; } = new List<CustoDespachanteDespesa>();
    public ICollection<NcmVinculadoCusto>       Ncms     { get; set; } = new List<NcmVinculadoCusto>();
}
