namespace ImportCostsApi.Features.Aduanas.Get;

using ImportCostsApi.Core.Exceptions;

/// <summary>
/// Handler for retrieving a single Aduana by ID
/// </summary>
public class GetAduanaHandler
{
    private readonly AduanaRepository _repository;
    private readonly ILogger<GetAduanaHandler> _logger;

    public GetAduanaHandler(AduanaRepository repository, ILogger<GetAduanaHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<AduanaResponseDto> HandleAsync(string id)
    {
        _logger.LogInformation("Getting Aduana with ID: {Id}", id);

        var aduana = await _repository.GetByIdAsync(id);
        if (aduana == null)
            throw new NotFoundException("Aduana", id);

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
