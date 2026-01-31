namespace ImportCostsApi.Features.Vendas.Update;

using FluentValidation;
using ImportCostsApi.Core.Exceptions;

/// <summary>
/// Handler for updating an existing Venda
/// </summary>
public class UpdateVendaHandler
{
    private readonly VendaRepository _repository;
    private readonly IValidator<UpdateVendaDto> _validator;
    private readonly ILogger<UpdateVendaHandler> _logger;

    public UpdateVendaHandler(
        VendaRepository repository,
        IValidator<UpdateVendaDto> validator,
        ILogger<UpdateVendaHandler> logger)
    {
        _repository = repository;
        _validator = validator;
        _logger = logger;
    }

    public async Task<VendaResponseDto> HandleAsync(string id, UpdateVendaDto request)
    {
        _logger.LogInformation("Updating Venda: {Id}", id);

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
            throw new NotFoundException("Venda", id);

        var vendaToUpdate = new Venda
        {
            Id = existing.Id,
            OrcamentoId = existing.OrcamentoId,
            Codigo = request.Codigo ?? existing.Codigo,
            Cliente = existing.Cliente,
            Despachante = existing.Despachante,
            CriadoEm = existing.CriadoEm,
            Premissas = existing.Premissas,
            CustoReferencia = existing.CustoReferencia,
            Taxas = existing.Taxas,
            Premissasdelha = request.Premissasdelha ?? existing.Premissasdelha,
            Resumo = existing.Resumo,
            Status = existing.Status
        };

        var updated = await _repository.UpdateAsync(id, vendaToUpdate);

        _logger.LogInformation("Venda updated successfully: {Id}", updated.Id);

        return MapToVendaResponseDto(updated);
    }

    private VendaResponseDto MapToVendaResponseDto(Venda venda)
    {
        return new VendaResponseDto
        {
            Id = venda.Id,
            OrcamentoId = venda.OrcamentoId,
            Codigo = venda.Codigo,
            Cliente = venda.Cliente,
            Despachante = venda.Despachante,
            CriadoEm = venda.CriadoEm,
            Premissas = venda.Premissas,
            CustoReferencia = venda.CustoReferencia,
            Taxas = venda.Taxas,
            Premissasdelha = venda.Premissasdelha,
            Resumo = venda.Resumo,
            Status = venda.Status
        };
    }
}
