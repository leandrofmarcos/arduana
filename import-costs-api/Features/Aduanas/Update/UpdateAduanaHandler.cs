namespace ImportCostsApi.Features.Aduanas.Update;

using FluentValidation;
using ImportCostsApi.Core.Exceptions;

/// <summary>
/// Handler for updating an existing Aduana
/// </summary>
public class UpdateAduanaHandler
{
    private readonly AduanaRepository _repository;
    private readonly IValidator<UpdateAduanaDto> _validator;
    private readonly ILogger<UpdateAduanaHandler> _logger;

    public UpdateAduanaHandler(
        AduanaRepository repository,
        IValidator<UpdateAduanaDto> validator,
        ILogger<UpdateAduanaHandler> logger)
    {
        _repository = repository;
        _validator = validator;
        _logger = logger;
    }

    public async Task<AduanaResponseDto> HandleAsync(string id, UpdateAduanaDto request)
    {
        _logger.LogInformation("Updating Aduana: {Id}", id);

        // Validate input
        var validationResult = await _validator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .Select(e => new ImportCostsApi.Core.Models.ValidationError { Field = e.PropertyName, Message = e.ErrorMessage })
                .ToList();
            throw new ImportCostsApi.Core.Exceptions.ValidationException(errors);
        }

        var existing = await _repository.GetByIdAsync(id);
        if (existing == null)
            throw new NotFoundException("Aduana", id);

        var aduanaToUpdate = new Aduana
        {
            Id = existing.Id,
            OrcamentoId = existing.OrcamentoId,
            NumeroDI = request.NumeroDI ?? existing.NumeroDI,
            DataDI = request.DataDI ?? existing.DataDI,
            NumeroConhecimento = request.NumeroConhecimento ?? existing.NumeroConhecimento,
            Despachante = request.Despachante ?? existing.Despachante,
            PrevisaoDesembaraco = request.PrevisaoDesembaraco ?? existing.PrevisaoDesembaraco,
            DataDesembaraco = existing.DataDesembaraco,
            CriadoEm = existing.CriadoEm,
            Status = existing.Status,
            Eventos = existing.Eventos,
            ProdutosRecebidos = existing.ProdutosRecebidos
        };

        var updated = await _repository.UpdateAsync(id, aduanaToUpdate);

        _logger.LogInformation("Aduana updated successfully: {Id}", updated.Id);

        return MapToAduanaResponseDto(updated);
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
