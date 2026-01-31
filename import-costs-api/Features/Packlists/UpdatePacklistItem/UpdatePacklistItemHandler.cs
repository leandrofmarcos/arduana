using ImportCostsApi.Core.Exceptions;
using ImportCostsApi.Domain.Entities;
using FluentValidation;
using Microsoft.Extensions.Logging;
using ValidationException = ImportCostsApi.Core.Exceptions.ValidationException;

namespace ImportCostsApi.Features.Packlists.UpdatePacklistItem;

/// <summary>
/// Handler para atualização de item do packlist
/// </summary>
public class UpdatePacklistItemHandler
{
    private readonly PacklistRepository _repository;
    private readonly IValidator<UpdatePacklistItemDto> _validator;
    private readonly ILogger<UpdatePacklistItemHandler> _logger;

    public UpdatePacklistItemHandler(
        PacklistRepository repository,
        IValidator<UpdatePacklistItemDto> validator,
        ILogger<UpdatePacklistItemHandler> logger)
    {
        _repository = repository;
        _validator = validator;
        _logger = logger;
    }

    public async Task<PacklistItem> Handle(string orcamentoId, string itemId, UpdatePacklistItemDto dto)
    {
        var validationResult = await _validator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            _logger.LogWarning("Erro de validação ao atualizar item: {@Errors}",
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

        var item = await _repository.GetItemById(itemId);
        if (item == null || item.PacklistId != packlist.Id)
        {
            _logger.LogWarning("Item {ItemId} não encontrado para packlist {PacklistId}", itemId, packlist.Id);
            throw new NotFoundException("PacklistItem", itemId);
        }

        if (!string.IsNullOrWhiteSpace(dto.Codigo))
        {
            var codigo = dto.Codigo.Trim();
            if (!string.Equals(item.Codigo, codigo, StringComparison.OrdinalIgnoreCase))
            {
                if (await _repository.ItemCodeExists(packlist.Id, codigo, item.Id))
                    throw new BusinessException("Código do item já existe neste packlist");

                item.Codigo = codigo;
            }
        }

        if (!string.IsNullOrWhiteSpace(dto.Descricao))
            item.Descricao = dto.Descricao.Trim();

        if (dto.Quantidade.HasValue) item.Quantidade = dto.Quantidade.Value;
        if (dto.PesoKg.HasValue) item.PesoKg = dto.PesoKg.Value;
        if (dto.ValorUSD.HasValue) item.ValorUSD = dto.ValorUSD.Value;
        if (dto.VolumeM3.HasValue) item.VolumeM3 = dto.VolumeM3.Value;

        await _repository.UpdateItem(item);

        _logger.LogInformation("Item do packlist atualizado. ID: {ItemId}", item.Id);

        return item;
    }
}
