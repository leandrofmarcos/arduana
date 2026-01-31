namespace ImportCostsApi.Features.Orcamentos;

using System.ComponentModel.DataAnnotations.Schema;

/// <summary>
/// Fases do orçamento no fluxo operacional
/// </summary>
public enum FaseOrcamento
{
    Orcamento = 0,  // Inicial - sem fases começadas
    Packlist = 1,   // Fase 1
    Custo = 2,      // Fase 2
    Venda = 3,      // Fase 3
    Aduana = 4      // Fase 4
}

/// <summary>
/// Status de conclusão de cada fase
/// </summary>
public enum StatusFase
{
    Pendente = 0,
    EmAndamento = 1,
    Concluida = 2
}

/// <summary>
/// Modelo de domínio para Orçamento
/// Entidade central que coordena todas as fases do processo de importação
/// </summary>
public class OrcamentoLancamento
{
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// Número/identificação do orçamento
    /// </summary>
    public string Numero { get; set; } = string.Empty;

    /// <summary>
    /// Título ou descrição do processo
    /// </summary>
    public string? Titulo { get; set; }

    /// <summary>
    /// Cliente responsável pelo orçamento (obrigatório)
    /// </summary>
    public string ClienteId { get; set; } = string.Empty;

    /// <summary>
    /// Despachante responsável pela aduana (obrigatório na fase 4)
    /// </summary>
    public string? DespachanteId { get; set; }

    /// <summary>
    /// Template de packlist associado
    /// </summary>
    public string? TemplatePacklistId { get; set; }

    /// <summary>
    /// Fase atual do processo
    /// </summary>
    public FaseOrcamento FaseAtual { get; set; } = FaseOrcamento.Orcamento;

    /// <summary>
    /// Status de cada fase (ordenado por fase)
    /// Índice: 0=Orcamento, 1=Packlist, 2=Custo, 3=Venda, 4=Aduana
    /// </summary>
    public StatusFase[] StatusFases { get; set; } = new[]
    {
        StatusFase.Pendente, // Orcamento
        StatusFase.Pendente, // Packlist
        StatusFase.Pendente, // Custo
        StatusFase.Pendente, // Venda
        StatusFase.Pendente  // Aduana
    };

    /// <summary>
    /// Indicação se está aprovado internamente
    /// </summary>
    public bool Aprovado { get; set; } = false;

    /// <summary>
    /// Indicação se foi aprovado pelo cliente
    /// </summary>
    public bool AprovadoCliente { get; set; } = false;

    /// <summary>
    /// Indicação se o processo foi oficializado
    /// </summary>
    public bool Oficializado { get; set; } = false;

    /// <summary>
    /// Moeda padrão do orçamento
    /// </summary>
    public string MoedaPadrao { get; set; } = "BRL";

    /// <summary>
    /// Data de criação do orçamento
    /// </summary>
    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Data de última atualização
    /// </summary>
    public DateTime DataAtualizacao { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Dados resumidos das 4 fases (read-only no orçamento)
    /// </summary>
    [NotMapped]
    public OrcamentoResumoFases? Resumo { get; set; }
}

/// <summary>
/// Resumo consolidado das informações de todas as fases
/// </summary>
public class OrcamentoResumoFases
{
    public OrcamentoResumoPacklist? Packlist { get; set; }
    public OrcamentoResumoCusto? Custo { get; set; }
    public OrcamentoResumoVenda? Venda { get; set; }
    public OrcamentoResumoAduana? Aduana { get; set; }
    public OrcamentoResumoNumerarios? Numerarios { get; set; }
}

public class OrcamentoResumoPacklist
{
    public int TotalItens { get; set; }
    public decimal PesoTotal { get; set; }
    public decimal VolumeTotal { get; set; }
    public DateTime? DataUpload { get; set; }
}

public class OrcamentoResumoCusto
{
    public decimal CustoTotal { get; set; }
    public decimal ValorII { get; set; }
    public decimal ValorIPI { get; set; }
    public decimal ValorICMS { get; set; }
    public decimal ValorPIS { get; set; }
    public decimal ValorCOFINS { get; set; }
    public DateTime? DataCalculo { get; set; }
}

public class OrcamentoResumoVenda
{
    public decimal PrecoUnitario { get; set; }
    public decimal PrecoTotal { get; set; }
    public decimal MargemLucro { get; set; }
    public decimal PercentualLucro { get; set; }
    public DateTime? DataDefinicao { get; set; }
}

public class OrcamentoResumoAduana
{
    public string? NumeroDI { get; set; }
    public DateTime? DataDI { get; set; }
    public int TotalEventos { get; set; }
    public DateTime? DataDesembaraco { get; set; }
    public string Despachante { get; set; } = string.Empty;
}

public class OrcamentoResumoNumerarios
{
    public decimal TotalReceita { get; set; }
    public decimal TotalDespesa { get; set; }
    public decimal Saldo { get; set; }
    public int TotalLancamentos { get; set; }
}
