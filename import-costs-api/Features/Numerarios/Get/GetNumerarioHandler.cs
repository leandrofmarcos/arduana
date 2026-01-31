namespace ImportCostsApi.Features.Numerarios.Get;

using ImportCostsApi.Core.Exceptions;

/// <summary>
/// Handler for retrieving a single Numerario Lancamento by ID
/// </summary>
public class GetNumerarioHandler
{
    private readonly NumerarioRepository _repository;
    private readonly ILogger<GetNumerarioHandler> _logger;

    public GetNumerarioHandler(NumerarioRepository repository, ILogger<GetNumerarioHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<NumerarioLancamentoResponseDto> HandleAsync(string id)
    {
        _logger.LogInformation("Getting Numerario Lancamento with ID: {Id}", id);

        var lancamento = await _repository.GetByIdAsync(id);
        if (lancamento == null)
            throw new NotFoundException("Numerario Lancamento", id);

        return MapToNumerarioResponseDto(lancamento);
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
