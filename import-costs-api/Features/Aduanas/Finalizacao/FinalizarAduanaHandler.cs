namespace ImportCostsApi.Features.Aduanas.Finalizacao;

using FluentValidation;
using ImportCostsApi.Core.Exceptions;

/// <summary>
/// Handler for finalizing an Aduana
/// </summary>
public class FinalizarAduanaHandler
{
    private readonly AduanaRepository _repository;
    private readonly IValidator<FinalizarAduanaDto> _validator;
    private readonly ILogger<FinalizarAduanaHandler> _logger;

    public FinalizarAduanaHandler(
        AduanaRepository repository,
        IValidator<FinalizarAduanaDto> validator,
        ILogger<FinalizarAduanaHandler> logger)
    {
        _repository = repository;
        _validator = validator;
        _logger = logger;
    }

    public async Task<AduanaResponseDto> HandleAsync(string orcamentoId, FinalizarAduanaDto request)
    {
        _logger.LogInformation("Finalizing Aduana for Orcamento: {OrcamentoId}", orcamentoId);

        // Validate input
        var validationResult = await _validator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .Select(e => new ImportCostsApi.Core.Models.ValidationError { Field = e.PropertyName, Message = e.ErrorMessage })
                .ToList();
            throw new ImportCostsApi.Core.Exceptions.ValidationException(errors);
        }

        var aduana = await _repository.GetByOrcamentoIdAsync(orcamentoId);
        if (aduana == null)
            throw new NotFoundException("Aduana para Orcamento", orcamentoId);

        var finalized = await _repository.FinalizarAsync(
            aduana.Id,
            request.DataDesembaraco,
            request.DescricaoFinalizacao);

        _logger.LogInformation("Aduana finalized successfully: {AduanaId}", aduana.Id);

        return MapToAduanaResponseDto(finalized);
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
