namespace ImportCostsApi.Features.Aduanas.GetByOrcamento;

using ImportCostsApi.Core.Exceptions;

/// <summary>
/// Handler for retrieving Aduana by Orcamento ID
/// </summary>
public class GetAduanaByOrcamentoHandler
{
    private readonly AduanaRepository _repository;
    private readonly ILogger<GetAduanaByOrcamentoHandler> _logger;

    public GetAduanaByOrcamentoHandler(AduanaRepository repository, ILogger<GetAduanaByOrcamentoHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<AduanaResponseDto> HandleAsync(string orcamentoId)
    {
        _logger.LogInformation("Getting Aduana for Orcamento: {OrcamentoId}", orcamentoId);

        if (!await _repository.OrcamentoExistsAsync(orcamentoId))
            throw new NotFoundException("Orcamento", orcamentoId);

        var aduana = await _repository.GetByOrcamentoIdAsync(orcamentoId);
        if (aduana == null)
            throw new NotFoundException("Aduana para Orcamento", orcamentoId);

        return MapToAduanaResponseDto(aduana);
    }

    private AduanaResponseDto MapToAduanaResponseDto(Aduana aduana)
    {
        return new AduanaResponseDto
        {
            Id = aduana.Id,
            OrcamentoId = aduana.OrcamentoId,
            NumeroDI = aduana.NumeroDI,
            DataDI = aduana.DataDI,
            NumeroConhecimento = aduana.NumeroConhecimento,
            Despachante = aduana.Despachante,
            PrevisaoDesembaraco = aduana.PrevisaoDesembaraco,
            DataDesembaraco = aduana.DataDesembaraco,
            CriadoEm = aduana.CriadoEm,
            Status = aduana.Status,
            Eventos = aduana.Eventos.Select(e => new AduanaEventoDto
            {
                Id = e.Id,
                Descricao = e.Descricao,
                Data = e.Data,
                Responsavel = e.Responsavel,
                Tipo = e.Tipo
            }).ToList(),
            ProdutosRecebidos = aduana.ProdutosRecebidos.Select(p => new ProdutoRecebidoDto
            {
                Id = p.Id,
                Codigo = p.Codigo,
                Descricao = p.Descricao,
                QuantidadeEsperada = p.QuantidadeEsperada,
                QuantidadeRecebida = p.QuantidadeRecebida,
                Divergencia = p.Divergencia
            }).ToList()
        };
    }
}
