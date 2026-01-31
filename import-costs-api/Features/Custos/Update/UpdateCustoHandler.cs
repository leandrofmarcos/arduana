namespace ImportCostsApi.Features.Custos.Update;

using FluentValidation;
using ImportCostsApi.Core.Exceptions;

/// <summary>
/// Handler for updating an existing Custo
/// </summary>
public class UpdateCustoHandler
{
    private readonly CustoRepository _repository;
    private readonly IValidator<UpdateCustoDto> _validator;
    private readonly ILogger<UpdateCustoHandler> _logger;

    public UpdateCustoHandler(
        CustoRepository repository,
        IValidator<UpdateCustoDto> validator,
        ILogger<UpdateCustoHandler> logger)
    {
        _repository = repository;
        _validator = validator;
        _logger = logger;
    }

    public async Task<CustoResponseDto> HandleAsync(string id, UpdateCustoDto request)
    {
        _logger.LogInformation("Updating Custo: {Id}", id);

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
            throw new NotFoundException("Custo", id);

        // Create despesas with IDs if provided
        List<Despesa>? despesas = null;
        if (request.Despesas != null && request.Despesas.Any())
        {
            despesas = request.Despesas.Select((d, index) => new Despesa
            {
                Id = $"DESP-{index + 1:D3}",
                Categoria = d.Categoria,
                Item = d.Item,
                Fornecedor = d.Fornecedor,
                Valor = d.Valor,
                Observacao = d.Observacao
            }).ToList();
        }

        var custoToUpdate = new Custo
        {
            Id = existing.Id,
            OrcamentoId = existing.OrcamentoId,
            Codigo = request.Codigo ?? existing.Codigo,
            Cliente = existing.Cliente,
            Despachante = existing.Despachante,
            CriadoEm = existing.CriadoEm,
            Premissas = request.Premissas ?? existing.Premissas,
            Taxas = request.Taxas ?? existing.Taxas,
            Resumo = existing.Resumo,
            Despesas = despesas ?? existing.Despesas,
            Status = existing.Status
        };

        var updated = await _repository.UpdateAsync(id, custoToUpdate);

        _logger.LogInformation("Custo updated successfully: {Id}", updated.Id);

        return MapToCustoResponseDto(updated);
    }

    private CustoResponseDto MapToCustoResponseDto(Custo custo)
    {
        return new CustoResponseDto
        {
            Id = custo.Id,
            OrcamentoId = custo.OrcamentoId,
            Codigo = custo.Codigo,
            Cliente = custo.Cliente,
            Despachante = custo.Despachante,
            CriadoEm = custo.CriadoEm,
            Premissas = custo.Premissas,
            Taxas = custo.Taxas,
            Resumo = custo.Resumo,
            Despesas = custo.Despesas.Select(d => new DespesaDto
            {
                Id = d.Id,
                Categoria = d.Categoria,
                Item = d.Item,
                Fornecedor = d.Fornecedor,
                Valor = d.Valor,
                Observacao = d.Observacao
            }).ToList(),
            Status = custo.Status
        };
    }
}
