namespace ImportCostsApi.Features.Vendas.Create;

using FluentValidation;
using ImportCostsApi.Core.Exceptions;

/// <summary>
/// Handler for creating a new Venda
/// </summary>
public class CreateVendaHandler
{
    private readonly VendaRepository _repository;
    private readonly IValidator<CreateVendaDto> _validator;
    private readonly ILogger<CreateVendaHandler> _logger;

    public CreateVendaHandler(
        VendaRepository repository,
        IValidator<CreateVendaDto> validator,
        ILogger<CreateVendaHandler> logger)
    {
        _repository = repository;
        _validator = validator;
        _logger = logger;
    }

    public async Task<VendaResponseDto> HandleAsync(CreateVendaDto request)
    {
        _logger.LogInformation("Creating new Venda for Orcamento: {OrcamentoId}", request.OrcamentoId);

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

        // Check if Venda already exists for this Orcamento (1:1 relationship)
        if (await _repository.HasVendaAsync(request.OrcamentoId))
            throw new BusinessException($"Orçamento {request.OrcamentoId} já possui Venda");

        var venda = new Venda
        {
            OrcamentoId = request.OrcamentoId,
            Codigo = request.Codigo,
            Cliente = request.Cliente,
            Despachante = request.Despachante,
            Premissasdelha = request.Premissasdelha
        };

        var created = await _repository.CreateAsync(venda);

        _logger.LogInformation("Venda created successfully with ID: {Id}", created.Id);

        return MapToVendaResponseDto(created);
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
