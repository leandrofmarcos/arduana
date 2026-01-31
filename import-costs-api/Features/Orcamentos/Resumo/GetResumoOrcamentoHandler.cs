namespace ImportCostsApi.Features.Orcamentos.Resumo;

using ImportCostsApi.Features.Orcamentos;

/// <summary>
/// Handler para recuperar apenas o resumo consolidado de um orçamento
/// Agregação de dados das 4 fases + numerários
/// </summary>
public class GetResumoOrcamentoHandler
{
    private readonly OrcamentoRepository _repository;
    private readonly ILogger<GetResumoOrcamentoHandler> _logger;

    public GetResumoOrcamentoHandler(OrcamentoRepository repository, ILogger<GetResumoOrcamentoHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<OrcamentoResumoFases> HandleAsync(string id)
    {
        _logger.LogInformation("Recuperando resumo do orçamento {OrcamentoId}", id);

        var resumo = await _repository.GetResumoAsync(id);

        return resumo;
    }
}
