namespace ImportCostsApi.Features.Orcamentos.GetAll;

/// <summary>
/// Handler para listar todos os orçamentos com paginação
/// </summary>
public class GetAllOrcamentosHandler
{
    private readonly OrcamentoRepository _repository;
    private readonly ILogger<GetAllOrcamentosHandler> _logger;

    public GetAllOrcamentosHandler(OrcamentoRepository repository, ILogger<GetAllOrcamentosHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<IEnumerable<OrcamentoResponseDto>> HandleAsync(int skip = 0, int take = 50)
    {
        _logger.LogInformation("Listando orçamentos - Skip: {Skip}, Take: {Take}", skip, take);

        var orcamentos = await _repository.GetAllAsync(skip, take);

        return orcamentos.Select(MapToDto);
    }

    private OrcamentoResponseDto MapToDto(OrcamentoLancamento orcamento)
    {
        return new OrcamentoResponseDto
        {
            Id = orcamento.Id,
            Numero = orcamento.Numero,
            Titulo = orcamento.Titulo,
            ClienteId = orcamento.ClienteId,
            DespachanteId = orcamento.DespachanteId,
            TemplatePacklistId = orcamento.TemplatePacklistId,
            FaseAtual = orcamento.FaseAtual,
            StatusFases = orcamento.StatusFases,
            Aprovado = orcamento.Aprovado,
            AprovadoCliente = orcamento.AprovadoCliente,
            Oficializado = orcamento.Oficializado,
            MoedaPadrao = orcamento.MoedaPadrao,
            DataCriacao = orcamento.DataCriacao,
            DataAtualizacao = orcamento.DataAtualizacao,
            Resumo = orcamento.Resumo
        };
    }
}
