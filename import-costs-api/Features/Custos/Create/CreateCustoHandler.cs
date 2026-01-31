namespace ImportCostsApi.Features.Custos.Create;

using FluentValidation;
using ImportCostsApi.Core.Exceptions;

/// <summary>
/// Handler for creating a new Custo
/// </summary>
public class CreateCustoHandler
{
    private readonly CustoRepository _repository;
    private readonly IValidator<CreateCustoDto> _validator;
    private readonly ILogger<CreateCustoHandler> _logger;

    public CreateCustoHandler(
        CustoRepository repository,
        IValidator<CreateCustoDto> validator,
        ILogger<CreateCustoHandler> logger)
    {
        _repository = repository;
        _validator = validator;
        _logger = logger;
    }

    public async Task<CustoResponseDto> HandleAsync(CreateCustoDto request)
    {
        _logger.LogInformation("Creating new Custo for Orcamento: {OrcamentoId}", request.OrcamentoId);

        // Validate input
        var validationResult = await _validator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .Select(e => new ImportCostsApi.Core.Models.ValidationError { Field = e.PropertyName, Message = e.ErrorMessage })
                .ToList();
            throw new ImportCostsApi.Core.Exceptions.ValidationException(errors);
        }

        // Check if Orcamento exists
        if (!await _repository.OrcamentoExistsAsync(request.OrcamentoId))
            throw new NotFoundException("Orcamento", request.OrcamentoId);

        // Check if Custo already exists for this Orcamento (1:1 relationship)
        if (await _repository.HasCustoAsync(request.OrcamentoId))
            throw new BusinessException($"Orçamento {request.OrcamentoId} já possui Custo");

        // Create despesas with IDs
        var despesas = request.Despesas?.Select((d, index) => new Despesa
        {
            Id = $"DESP-{index + 1:D3}",
            Categoria = d.Categoria,
            Item = d.Item,
            Fornecedor = d.Fornecedor,
            Valor = d.Valor,
            Observacao = d.Observacao
        }).ToList() ?? new();

        var custo = new Custo
        {
            OrcamentoId = request.OrcamentoId,
            Codigo = request.Codigo,
            Cliente = request.Cliente,
            Despachante = request.Despachante,
            Premissas = request.Premissas,
            Taxas = request.Taxas,
            Despesas = despesas
        };

        var created = await _repository.CreateAsync(custo);

        _logger.LogInformation("Custo created successfully with ID: {Id}", created.Id);

        return MapToCustoResponseDto(created);
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
