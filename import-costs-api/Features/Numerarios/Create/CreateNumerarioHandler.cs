namespace ImportCostsApi.Features.Numerarios.Create;

using FluentValidation;
using ImportCostsApi.Core.Exceptions;

/// <summary>
/// Handler for creating a new Numerario Lancamento
/// </summary>
public class CreateNumerarioHandler
{
    private readonly NumerarioRepository _repository;
    private readonly IValidator<CreateNumerarioDto> _validator;
    private readonly ILogger<CreateNumerarioHandler> _logger;

    public CreateNumerarioHandler(
        NumerarioRepository repository,
        IValidator<CreateNumerarioDto> validator,
        ILogger<CreateNumerarioHandler> logger)
    {
        _repository = repository;
        _validator = validator;
        _logger = logger;
    }

    public async Task<NumerarioLancamentoResponseDto> HandleAsync(CreateNumerarioDto request)
    {
        _logger.LogInformation("Creating new Numerario Lancamento for Orcamento: {OrcamentoId}", request.OrcamentoId);

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

        var lancamento = new NumerarioLancamento
        {
            OrcamentoId = request.OrcamentoId,
            Valor = request.Valor,
            Moeda = request.Moeda ?? "BRL",
            Tipo = request.Tipo,
            Responsavel = request.Responsavel,
            Observacao = request.Observacao
        };

        var created = await _repository.CreateAsync(lancamento);

        _logger.LogInformation("Numerario Lancamento created successfully with ID: {Id}", created.Id);

        return MapToNumerarioResponseDto(created);
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
