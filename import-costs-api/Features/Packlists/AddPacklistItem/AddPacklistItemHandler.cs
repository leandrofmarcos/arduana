using ImportCostsApi.Core.Exceptions;
using ImportCostsApi.Domain.Entities;
using FluentValidation;
using Microsoft.Extensions.Logging;
using ValidationException = ImportCostsApi.Core.Exceptions.ValidationException;

namespace ImportCostsApi.Features.Packlists.AddPacklistItem;

/// <summary>
/// Handler para adicionar item ao packlist
/// </summary>
public class AddPacklistItemHandler
{
    private readonly PacklistRepository _repository;
    private readonly IValidator<AddPacklistItemDto> _validator;
    private readonly ILogger<AddPacklistItemHandler> _logger;

    public AddPacklistItemHandler(
        PacklistRepository repository,
        IValidator<AddPacklistItemDto> validator,
        ILogger<AddPacklistItemHandler> logger)
    {
        _repository = repository;
        _validator = validator;
        _logger = logger;
    }

    public async Task<PacklistItem> Handle(string orcamentoId, AddPacklistItemDto dto)
    {
        var validationResult = await _validator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            _logger.LogWarning("Erro de validação ao adicionar item: {@Errors}",
                validationResult.Errors.Select(e => new { field = e.PropertyName, message = e.ErrorMessage }).ToList());

            throw new ValidationException(
                validationResult.Errors
                    .Select(e => new ImportCostsApi.Core.Models.ValidationError
                    {
                        Field = e.PropertyName,
                        Message = e.ErrorMessage
                    })
                    .ToList()
            );
        }

        var packlist = await _repository.GetByOrcamentoId(orcamentoId);
        if (packlist == null)
        {
            _logger.LogWarning("Packlist para orçamento {OrcamentoId} não encontrado", orcamentoId);
            throw new NotFoundException("Packlist", orcamentoId);
        }

        if (await _repository.ItemCodeExists(packlist.Id, dto.Codigo))
            throw new BusinessException("Código do item já existe neste packlist");

        var item = new PacklistItem
        {
            PacklistId = packlist.Id,
            Codigo = dto.Codigo.Trim(),
            Descricao = dto.Descricao.Trim(),
            Quantidade = dto.Quantidade,
            PesoKg = dto.PesoKg,
            ValorUSD = dto.ValorUSD,
            VolumeM3 = dto.VolumeM3
        };

        await _repository.AddItem(item);

        _logger.LogInformation("Item adicionado ao packlist. ID: {ItemId}", item.Id);

        return item;
    }
}
