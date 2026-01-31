namespace ImportCostsApi.Features.Orcamentos.Update;

using ImportCostsApi.Core.Exceptions;
using ImportCostsApi.Features.Orcamentos;

/// <summary>
/// Handler para atualizar um orçamento
/// </summary>
public class UpdateOrcamentoHandler
{
    private readonly OrcamentoRepository _repository;
    private readonly ILogger<UpdateOrcamentoHandler> _logger;

    public UpdateOrcamentoHandler(OrcamentoRepository repository, ILogger<UpdateOrcamentoHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<OrcamentoResponseDto> HandleAsync(string id, UpdateOrcamentoDto dto)
    {
        _logger.LogInformation("Atualizando orçamento {OrcamentoId}", id);

        var orcamento = new OrcamentoLancamento
        {
            Numero = dto.Numero ?? string.Empty,
            Titulo = dto.Titulo,
            DespachanteId = dto.DespachanteId,
            MoedaPadrao = dto.MoedaPadrao ?? "BRL",
            Aprovado = dto.Aprovado ?? false,
            AprovadoCliente = dto.AprovadoCliente ?? false
        };

        var atualizado = await _repository.UpdateAsync(id, orcamento);

        return MapToDto(atualizado);
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
