namespace ImportCostsApi.Features.Aduanas.AddEvento;

using FluentValidation;
using ImportCostsApi.Core.Exceptions;

/// <summary>
/// Handler for adding an event to an Aduana
/// </summary>
public class AddAduanaEventoHandler
{
    private readonly AduanaRepository _repository;
    private readonly IValidator<AddAduanaEventoDto> _validator;
    private readonly ILogger<AddAduanaEventoHandler> _logger;

    public AddAduanaEventoHandler(
        AduanaRepository repository,
        IValidator<AddAduanaEventoDto> validator,
        ILogger<AddAduanaEventoHandler> logger)
    {
        _repository = repository;
        _validator = validator;
        _logger = logger;
    }

    public async Task<AduanaEventoDto> HandleAsync(string orcamentoId, AddAduanaEventoDto request)
    {
        _logger.LogInformation("Adding evento to Aduana for Orcamento: {OrcamentoId}", orcamentoId);

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

        var evento = new AduanaEvento
        {
            Descricao = request.Descricao,
            Tipo = request.Tipo,
            Responsavel = request.Responsavel
        };

        var created = await _repository.AddEventoAsync(aduana.Id, evento);

        _logger.LogInformation("Evento added successfully to Aduana: {AduanaId}", aduana.Id);

        return new AduanaEventoDto
        {
            Id = created.Id,
            Descricao = created.Descricao,
            Data = created.Data,
            Responsavel = created.Responsavel,
            Tipo = created.Tipo
        };
    }
}
