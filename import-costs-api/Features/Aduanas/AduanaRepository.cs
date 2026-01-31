namespace ImportCostsApi.Features.Aduanas;

using ImportCostsApi.Core.Exceptions;

/// <summary>
/// Repository for Aduana (Customs Clearance) entity with relationship validation to Orcamento
/// </summary>
public class AduanaRepository
{
    private static readonly List<Aduana> _aduanas = new();
    private static int _nextId = 1;
    private static int _nextEventoId = 1;
    private static int _nextProdutoId = 1;

    public async Task<Aduana?> GetByIdAsync(string id)
    {
        return await Task.FromResult(_aduanas.FirstOrDefault(a => a.Id == id));
    }

    public async Task<Aduana?> GetByOrcamentoIdAsync(string orcamentoId)
    {
        return await Task.FromResult(_aduanas.FirstOrDefault(a => a.OrcamentoId == orcamentoId));
    }

    public async Task<List<Aduana>> GetAllAsync()
    {
        return await Task.FromResult(_aduanas.ToList());
    }

    public async Task<Aduana> CreateAsync(Aduana aduana)
    {
        if (string.IsNullOrEmpty(aduana.Id))
        {
            aduana.Id = $"ADUANA-{_nextId:D5}";
            _nextId++;
        }

        aduana.CriadoEm = DateTime.UtcNow;
        aduana.Status = "Rascunho";

        _aduanas.Add(aduana);
        return await Task.FromResult(aduana);
    }

    public async Task<Aduana> UpdateAsync(string id, Aduana aduana)
    {
        var existing = await GetByIdAsync(id);
        if (existing == null)
            throw new NotFoundException("Aduana", id);

        existing.NumeroDI = aduana.NumeroDI ?? existing.NumeroDI;
        existing.DataDI = aduana.DataDI ?? existing.DataDI;
        existing.NumeroConhecimento = aduana.NumeroConhecimento ?? existing.NumeroConhecimento;
        existing.Despachante = aduana.Despachante ?? existing.Despachante;
        existing.PrevisaoDesembaraco = aduana.PrevisaoDesembaraco ?? existing.PrevisaoDesembaraco;
        existing.Status = aduana.Status ?? existing.Status;

        return await Task.FromResult(existing);
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var existing = await GetByIdAsync(id);
        if (existing == null)
            throw new NotFoundException("Aduana", id);

        return await Task.FromResult(_aduanas.Remove(existing));
    }

    /// <summary>
    /// Validates if a Orcamento exists
    /// </summary>
    public async Task<bool> OrcamentoExistsAsync(string orcamentoId)
    {
        // This would be replaced with actual Orcamento repository check
        // For now, returning true as Orcamento feature will be created next
        return await Task.FromResult(true);
    }

    /// <summary>
    /// Checks if an Aduana already exists for the given Orcamento (1:1 relationship)
    /// </summary>
    public async Task<bool> HasAduanaAsync(string orcamentoId)
    {
        return await Task.FromResult(_aduanas.Any(a => a.OrcamentoId == orcamentoId));
    }

    /// <summary>
    /// Adds an event to the Aduana
    /// </summary>
    public async Task<AduanaEvento> AddEventoAsync(string aduanaId, AduanaEvento evento)
    {
        var aduana = await GetByIdAsync(aduanaId);
        if (aduana == null)
            throw new NotFoundException("Aduana", aduanaId);

        if (string.IsNullOrEmpty(evento.Id))
        {
            evento.Id = $"EVENTO-{_nextEventoId:D5}";
            _nextEventoId++;
        }

        evento.Data = DateTime.UtcNow;
        aduana.Eventos.Add(evento);

        return await Task.FromResult(evento);
    }

    /// <summary>
    /// Finalizes the Aduana with clearance date
    /// </summary>
    public async Task<Aduana> FinalizarAsync(string id, DateTime dataDesembaraco, string? descricao)
    {
        var existing = await GetByIdAsync(id);
        if (existing == null)
            throw new NotFoundException("Aduana", id);

        existing.DataDesembaraco = dataDesembaraco;
        existing.Status = "Concluido";

        if (!string.IsNullOrEmpty(descricao))
        {
            var eventoFinalizacao = new AduanaEvento
            {
                Id = $"EVENTO-{_nextEventoId:D5}",
                Descricao = descricao,
                Data = DateTime.UtcNow,
                Tipo = "Liberação"
            };
            _nextEventoId++;
            existing.Eventos.Add(eventoFinalizacao);
        }

        return await Task.FromResult(existing);
    }

    public void Clear()
    {
        _aduanas.Clear();
        _nextId = 1;
        _nextEventoId = 1;
        _nextProdutoId = 1;
    }
}

/// <summary>
/// Aduana domain model
/// </summary>
public class Aduana
{
    public string Id { get; set; } = string.Empty;
    public string OrcamentoId { get; set; } = string.Empty;
    public string? NumeroDI { get; set; }
    public DateTime? DataDI { get; set; }
    public string? NumeroConhecimento { get; set; }
    public string? Despachante { get; set; }
    public DateTime? PrevisaoDesembaraco { get; set; }
    public DateTime? DataDesembaraco { get; set; }
    public DateTime CriadoEm { get; set; }
    public string Status { get; set; } = "Rascunho";
    public List<AduanaEvento> Eventos { get; set; } = new();
    public List<ProdutoRecebido> ProdutosRecebidos { get; set; } = new();
}

/// <summary>
/// Aduana Event domain model
/// </summary>
public class AduanaEvento
{
    public string Id { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public DateTime Data { get; set; }
    public string? Responsavel { get; set; }
    public string? Tipo { get; set; }
}

/// <summary>
/// Produto Recebido domain model
/// </summary>
public class ProdutoRecebido
{
    public string Id { get; set; } = string.Empty;
    public string Codigo { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public decimal QuantidadeEsperada { get; set; }
    public decimal QuantidadeRecebida { get; set; }
    public string? Divergencia { get; set; }
}
