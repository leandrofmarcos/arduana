namespace ImportCostsApi.Features.Aduanas.Create;

using FluentValidation;
using ImportCostsApi.Core.Exceptions;

/// <summary>
/// Handler for creating a new Aduana
/// </summary>
public class CreateAduanaHandler
{
    private readonly AduanaRepository _repository;
    private readonly IValidator<CreateAduanaDto> _validator;
    private readonly ILogger<CreateAduanaHandler> _logger;

    public CreateAduanaHandler(
        AduanaRepository repository,
        IValidator<CreateAduanaDto> validator,
        ILogger<CreateAduanaHandler> logger)
    {
        _repository = repository;
        _validator = validator;
        _logger = logger;
    }

    public async Task<AduanaResponseDto> HandleAsync(CreateAduanaDto request)
    {
        _logger.LogInformation("Creating new Aduana for Orcamento: {OrcamentoId}", request.OrcamentoId);

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

        // Check if Aduana already exists for this Orcamento (1:1 relationship)
        if (await _repository.HasAduanaAsync(request.OrcamentoId))
            throw new BusinessException($"Orçamento {request.OrcamentoId} já possui Aduana");

        var eventos = request.Eventos?.Select((e, index) => new AduanaEvento
        {
            Id = $"EVENTO-{index + 1:D3}",
            Descricao = e.Descricao,
            Data = DateTime.UtcNow,
            Tipo = e.Tipo,
            Responsavel = e.Responsavel
        }).ToList() ?? new();

        var aduana = new Aduana
        {
            OrcamentoId = request.OrcamentoId,
            NumeroDI = request.NumeroDI,
            DataDI = request.DataDI,
            NumeroConhecimento = request.NumeroConhecimento,
            Despachante = request.Despachante,
            PrevisaoDesembaraco = request.PrevisaoDesembaraco,
            Eventos = eventos
        };

        var created = await _repository.CreateAsync(aduana);

        _logger.LogInformation("Aduana created successfully with ID: {Id}", created.Id);

        return MapToAduanaResponseDto(created);
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
