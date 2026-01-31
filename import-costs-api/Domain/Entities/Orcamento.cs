namespace ImportCostsApi.Domain.Entities;

/// <summary>
/// Entidade que representa um Orçamento
/// </summary>
public class Orcamento : BaseEntity
{
    /// <summary>
    /// Título/Nome do orçamento
    /// </summary>
    public string? Title { get; set; }

    /// <summary>
    /// Fase atual do orçamento (Orcamento ou Aduana)
    /// </summary>
    public string FaseAtual { get; set; } = "Orcamento";

    /// <summary>
    /// Indica se foi aprovado internamente
    /// </summary>
    public bool? Aprovado { get; set; }

    /// <summary>
    /// Indica se foi aprovado pelo cliente
    /// </summary>
    public bool? AprovadoCliente { get; set; }

    /// <summary>
    /// Indica se foi oficializado
    /// </summary>
    public bool? Oficializado { get; set; }

    /// <summary>
    /// Data de criação do orçamento
    /// </summary>
    public DateTime CreatedAtOrcamento { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// ID do cliente associado
    /// </summary>
    public string? ClienteId { get; set; }

    /// <summary>
    /// ID do despachante associado
    /// </summary>
    public string? DespachanteId { get; set; }

    /// <summary>
    /// ID do template de packlist associado
    /// </summary>
    public string? TemplatePacklistId { get; set; }

    /// <summary>
    /// Navegação: Cliente associado
    /// </summary>
    public Cliente? Cliente { get; set; }

    /// <summary>
    /// Navegação: Despachante associado
    /// </summary>
    public Despachante? Despachante { get; set; }

    /// <summary>
    /// Navegação: Template de packlist associado
    /// </summary>
    public TemplatePacklist? TemplatePacklist { get; set; }

    /// <summary>
    /// Navegação: Packlist do orçamento
    /// </summary>
    public Packlist? Packlist { get; set; }

    /// <summary>
    /// Navegação: Custo do orçamento
    /// </summary>
    public Custo? Custo { get; set; }

    /// <summary>
    /// Navegação: Venda do orçamento
    /// </summary>
    public Venda? Venda { get; set; }

    /// <summary>
    /// Navegação: Aduana do orçamento
    /// </summary>
    public Aduana? Aduana { get; set; }

    /// <summary>
    /// Navegação: Lançamentos de numerário
    /// </summary>
    public ICollection<NumerarioLancamento> Numerarios { get; set; } = new List<NumerarioLancamento>();
}
