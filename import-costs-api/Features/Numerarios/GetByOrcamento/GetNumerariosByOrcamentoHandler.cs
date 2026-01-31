namespace ImportCostsApi.Features.Numerarios.GetByOrcamento;

using ImportCostsApi.Core.Exceptions;

/// <summary>
/// Handler for retrieving all Numerario Lancamentos by Orcamento ID
/// </summary>
public class GetNumerariosByOrcamentoHandler
{
    private readonly NumerarioRepository _repository;
    private readonly ILogger<GetNumerariosByOrcamentoHandler> _logger;

    public GetNumerariosByOrcamentoHandler(NumerarioRepository repository, ILogger<GetNumerariosByOrcamentoHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<List<NumerarioLancamentoResponseDto>> HandleAsync(string orcamentoId)
    {
        _logger.LogInformation("Getting Numerario Lancamentos for Orcamento: {OrcamentoId}", orcamentoId);

        if (!await _repository.OrcamentoExistsAsync(orcamentoId))
            throw new NotFoundException("Orcamento", orcamentoId);

        var lancamentos = await _repository.GetByOrcamentoIdAsync(orcamentoId);

        return lancamentos
            .Select(l => MapToNumerarioResponseDto(l))
            .ToList();
    }

    private NumerarioLancamentoResponseDto MapToNumerarioResponseDto(NumerarioLancamento lancamento)
    {
        return new NumerarioLancamentoResponseDto
        {
            Id = lancamento.Id,
            OrcamentoId = lancamento.OrcamentoId,
            Valor = lancamento.Valor,
            Moeda = lancamento.Moeda,
            Data = lancamento.Data,
            Responsavel = lancamento.Responsavel,
            Status = lancamento.Status,
            Observacao = lancamento.Observacao,
            Tipo = lancamento.Tipo,
            Trilha = lancamento.Trilha.Select(t => new TrilhaAuditoriaDto
            {
                DataAlteracao = t.DataAlteracao,
                Usuario = t.Usuario,
                Acao = t.Acao,
                ValorAnterior = t.ValorAnterior,
                ValorNovo = t.ValorNovo
            }).ToList()
        };
    }
}
