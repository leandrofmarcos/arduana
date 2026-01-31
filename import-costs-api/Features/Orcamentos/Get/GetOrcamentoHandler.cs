namespace ImportCostsApi.Features.Orcamentos.Get;

using ImportCostsApi.Core.Exceptions;

/// <summary>
/// Handler para recuperar um orçamento específico com resumo completo
/// </summary>
public class GetOrcamentoHandler
{
    private readonly OrcamentoRepository _repository;
    private readonly ILogger<GetOrcamentoHandler> _logger;

    public GetOrcamentoHandler(OrcamentoRepository repository, ILogger<GetOrcamentoHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<OrcamentoResponseDto> HandleAsync(string id)
    {
        _logger.LogInformation("Buscando orçamento {OrcamentoId}", id);

        var orcamento = await _repository.GetByIdAsync(id);

        return MapToDto(orcamento);
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
