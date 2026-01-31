namespace ImportCostsApi.Features.Aduanas;

/// <summary>
/// Request DTO for creating a new Aduana
/// </summary>
public class CreateAduanaDto
{
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
    /// BL/AWB number
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
    /// Initial events
    /// </summary>
    public List<CreateAduanaEventoDto>? Eventos { get; set; }
}

/// <summary>
/// Request DTO for creating an Aduana Event
/// </summary>
public class CreateAduanaEventoDto
{
    /// <summary>
    /// Event description
    /// </summary>
    public string Descricao { get; set; } = string.Empty;

    /// <summary>
    /// Event type
    /// </summary>
    public string? Tipo { get; set; }

    /// <summary>
    /// Responsible person
    /// </summary>
    public string? Responsavel { get; set; }
}

/// <summary>
/// Request DTO for updating an existing Aduana
/// </summary>
public class UpdateAduanaDto
{
    /// <summary>
    /// DI number
    /// </summary>
    public string? NumeroDI { get; set; }

    /// <summary>
    /// DI registration date
    /// </summary>
    public DateTime? DataDI { get; set; }

    /// <summary>
    /// BL/AWB number
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
}

/// <summary>
/// Request DTO for adding an event to Aduana
/// </summary>
public class AddAduanaEventoDto
{
    /// <summary>
    /// Event description
    /// </summary>
    public string Descricao { get; set; } = string.Empty;

    /// <summary>
    /// Event type (comunicação, exigência, vistoria, liberação, etc)
    /// </summary>
    public string? Tipo { get; set; }

    /// <summary>
    /// Responsible person
    /// </summary>
    public string? Responsavel { get; set; }
}

/// <summary>
/// Request DTO for finalizing Aduana
/// </summary>
public class FinalizarAduanaDto
{
    /// <summary>
    /// Final clearance date
    /// </summary>
    public DateTime DataDesembaraco { get; set; }

    /// <summary>
    /// Final event description
    /// </summary>
    public string? DescricaoFinalizacao { get; set; }
}
