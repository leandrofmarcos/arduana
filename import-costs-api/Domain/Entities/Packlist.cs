using ImportCostsApi.Domain.Enums;

namespace ImportCostsApi.Domain.Entities;

/// <summary>
/// Entidade que representa um Packlist (Lista de Embalagem)
/// </summary>
public class Packlist : BaseEntity
{
    /// <summary>
    /// ID do orçamento associado
    /// </summary>
    public string OrcamentoId { get; set; } = string.Empty;

    /// <summary>
    /// Código do packlist
    /// </summary>
    public string? Codigo { get; set; }

    /// <summary>
    /// Nome do cliente
    /// </summary>
    public string? Cliente { get; set; }

    /// <summary>
    /// Nome do despachante
    /// </summary>
    public string? Despachante { get; set; }

    /// <summary>
    /// Nome do arquivo enviado
    /// </summary>
    public string? ArquivoNome { get; set; }

    /// <summary>
    /// Caminho do arquivo
    /// </summary>
    public string? ArquivoCaminho { get; set; }

    /// <summary>
    /// Data de envio
    /// </summary>
    public DateTime EnviadoEm { get; set; }

    /// <summary>
    /// Responsável pelo envio
    /// </summary>
    public string? EnviadoPor { get; set; }

    /// <summary>
    /// Status atual do packlist
    /// </summary>
    public PacklistStatus Status { get; set; }

    /// <summary>
    /// Total de itens
    /// </summary>
    public int? TotalItems { get; set; }

    /// <summary>
    /// Configuração de mapeamento em JSON
    /// </summary>
    public string? MappingConfig { get; set; }

    /// <summary>
    /// Navegação: Orçamento associado
    /// </summary>
    public Orcamento Orcamento { get; set; } = null!;

    /// <summary>
    /// Navegação: Itens do packlist
    /// </summary>
    public ICollection<PacklistItem> Items { get; set; } = new List<PacklistItem>();
}

/// <summary>
/// Entidade que representa um Item do Packlist
/// </summary>
public class PacklistItem : BaseEntity
{
    /// <summary>
    /// ID do packlist pai
    /// </summary>
    public string PacklistId { get; set; } = string.Empty;

    /// <summary>
    /// Código do item
    /// </summary>
    public string Codigo { get; set; } = string.Empty;

    /// <summary>
    /// Descrição do produto
    /// </summary>
    public string Descricao { get; set; } = string.Empty;

    /// <summary>
    /// Quantidade
    /// </summary>
    public decimal Quantidade { get; set; }

    /// <summary>
    /// Peso em kg
    /// </summary>
    public decimal PesoKg { get; set; }

    /// <summary>
    /// Valor em USD
    /// </summary>
    public decimal ValorUSD { get; set; }

    /// <summary>
    /// Volume em m³
    /// </summary>
    public decimal? VolumeM3 { get; set; }

    /// <summary>
    /// Navegação: Packlist pai
    /// </summary>
    public Packlist Packlist { get; set; } = null!;
}
