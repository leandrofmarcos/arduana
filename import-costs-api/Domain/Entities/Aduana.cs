namespace ImportCostsApi.Domain.Entities;

/// <summary>
/// Entidade que representa uma Aduana (Desembaraço Aduaneiro)
/// </summary>
public class Aduana : BaseEntity
{
    /// <summary>
    /// ID do orçamento associado
    /// </summary>
    public string OrcamentoId { get; set; } = string.Empty;

    /// <summary>
    /// Tipo de aduana
    /// </summary>
    public string? Tipo { get; set; }

    /// <summary>
    /// Descrição
    /// </summary>
    public string? Descricao { get; set; }

    /// <summary>
    /// Status atual
    /// </summary>
    public string? Status { get; set; }

    /// <summary>
    /// Data de criação
    /// </summary>
    public DateTime CreatedAtAduana { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Número da Declaração de Importação (DI)
    /// </summary>
    public string? NumeroDI { get; set; }

    /// <summary>
    /// Data da DI
    /// </summary>
    public DateTime? DataDI { get; set; }

    /// <summary>
    /// Número do conhecimento
    /// </summary>
    public string? NumeroConhecimento { get; set; }

    /// <summary>
    /// Previsão de desembarque
    /// </summary>
    public DateTime? PrevisaoDesembaraco { get; set; }

    /// <summary>
    /// Data efetiva de desembarque
    /// </summary>
    public DateTime? DataDesembaraco { get; set; }

    /// <summary>
    /// Navegação: Orçamento associado
    /// </summary>
    public Orcamento Orcamento { get; set; } = null!;

    /// <summary>
    /// Navegação: Eventos de aduana
    /// </summary>
    public ICollection<AduanaEvento> Eventos { get; set; } = new List<AduanaEvento>();
}

/// <summary>
/// Entidade que representa um Evento de Aduana
/// </summary>
public class AduanaEvento : BaseEntity
{
    /// <summary>
    /// ID da aduana pai
    /// </summary>
    public string AduanaId { get; set; } = string.Empty;

    /// <summary>
    /// Descrição do evento
    /// </summary>
    public string Descricao { get; set; } = string.Empty;

    /// <summary>
    /// Data do evento
    /// </summary>
    public DateTime Data { get; set; }

    /// <summary>
    /// Responsável pelo evento
    /// </summary>
    public string? Responsavel { get; set; }

    /// <summary>
    /// Navegação: Aduana pai
    /// </summary>
    public Aduana Aduana { get; set; } = null!;
}
