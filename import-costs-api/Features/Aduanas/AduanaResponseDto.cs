namespace ImportCostsApi.Features.Aduanas;

/// <summary>
/// Response DTO for Aduana (Customs Clearance) entity
/// </summary>
public class AduanaResponseDto
{
    /// <summary>
    /// Unique identifier
    /// </summary>
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// Associated Orcamento ID
    /// </summary>
    public string OrcamentoId { get; set; } = string.Empty;

    /// <summary>
    /// DI (Declaração de Importação) number
    /// </summary>
    public string? NumeroDI { get; set; }

    /// <summary>
    /// DI registration date
    /// </summary>
    public DateTime? DataDI { get; set; }

    /// <summary>
    /// BL/AWB (Bill of Lading / Air Way Bill) number
    /// </summary>
    public string? NumeroConhecimento { get; set; }

    /// <summary>
    /// Responsible customs broker
    /// </summary>
    public string? Despachante { get; set; }

    /// <summary>
    /// Expected clearance date
    /// </summary>
    public DateTime? PrevisaoDesembaraco { get; set; }

    /// <summary>
    /// Actual clearance date
    /// </summary>
    public DateTime? DataDesembaraco { get; set; }

    /// <summary>
    /// Creation date
    /// </summary>
    public DateTime CriadoEm { get; set; }

    /// <summary>
    /// Current status
    /// </summary>
    public string Status { get; set; } = "Rascunho";

    /// <summary>
    /// Timeline of events
    /// </summary>
    public List<AduanaEventoDto> Eventos { get; set; } = new();

    /// <summary>
    /// Custom products received (if not from Packlist)
    /// </summary>
    public List<ProdutoRecebidoDto> ProdutosRecebidos { get; set; } = new();
}

/// <summary>
/// DTO for Aduana Event
/// </summary>
public class AduanaEventoDto
{
    /// <summary>
    /// Unique identifier
    /// </summary>
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// Event description
    /// </summary>
    public string Descricao { get; set; } = string.Empty;

    /// <summary>
    /// Event date
    /// </summary>
    public DateTime Data { get; set; }

    /// <summary>
    /// Responsible person
    /// </summary>
    public string? Responsavel { get; set; }

    /// <summary>
    /// Event type (communication, requirement, inspection, release, etc.)
    /// </summary>
    public string? Tipo { get; set; }
}

/// <summary>
/// DTO for received product (if not informed in Packlist)
/// </summary>
public class ProdutoRecebidoDto
{
    /// <summary>
    /// Unique identifier
    /// </summary>
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// Product code
    /// </summary>
    public string Codigo { get; set; } = string.Empty;

    /// <summary>
    /// Product description
    /// </summary>
    public string Descricao { get; set; } = string.Empty;

    /// <summary>
    /// Expected quantity (from Packlist if available)
    /// </summary>
    public decimal QuantidadeEsperada { get; set; }

    /// <summary>
    /// Received quantity
    /// </summary>
    public decimal QuantidadeRecebida { get; set; }

    /// <summary>
    /// Divergence notes
    /// </summary>
    public string? Divergencia { get; set; }
}
