namespace ImportCostsApi.Features.Numerarios.Update;

using FluentValidation;
using ImportCostsApi.Core.Exceptions;

/// <summary>
/// Handler for updating an existing Numerario Lancamento
/// </summary>
public class UpdateNumerarioHandler
{
    private readonly NumerarioRepository _repository;
    private readonly IValidator<UpdateNumerarioDto> _validator;
    private readonly ILogger<UpdateNumerarioHandler> _logger;

    public UpdateNumerarioHandler(
        NumerarioRepository repository,
        IValidator<UpdateNumerarioDto> validator,
        ILogger<UpdateNumerarioHandler> logger)
    {
        _repository = repository;
        _validator = validator;
        _logger = logger;
    }

    public async Task<NumerarioLancamentoResponseDto> HandleAsync(string id, UpdateNumerarioDto request)
    {
        _logger.LogInformation("Updating Numerario Lancamento: {Id}", id);

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
            throw new NotFoundException("Numerario Lancamento", id);

        var lancamentoToUpdate = new NumerarioLancamento
        {
            Id = existing.Id,
            OrcamentoId = existing.OrcamentoId,
            Valor = request.Valor ?? existing.Valor,
            Moeda = request.Moeda ?? existing.Moeda,
            Data = existing.Data,
            Tipo = request.Tipo ?? existing.Tipo,
            Status = request.Status ?? existing.Status,
            Responsavel = request.Responsavel ?? existing.Responsavel,
            Observacao = request.Observacao ?? existing.Observacao,
            Trilha = existing.Trilha
        };

        var updated = await _repository.UpdateAsync(id, lancamentoToUpdate);

        _logger.LogInformation("Numerario Lancamento updated successfully: {Id}", updated.Id);

        return MapToNumerarioResponseDto(updated);
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
