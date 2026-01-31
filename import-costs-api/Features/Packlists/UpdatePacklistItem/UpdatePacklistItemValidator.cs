using FluentValidation;

namespace ImportCostsApi.Features.Packlists.UpdatePacklistItem;

/// <summary>
/// Validador para atualização de item do packlist
/// </summary>
public class UpdatePacklistItemValidator : AbstractValidator<UpdatePacklistItemDto>
{
    public UpdatePacklistItemValidator()
    {
        RuleFor(x => x.Codigo)
            .MaximumLength(50).WithMessage("Código não pode exceder 50 caracteres")
            .When(x => !string.IsNullOrWhiteSpace(x.Codigo));

        RuleFor(x => x.Descricao)
            .MaximumLength(500).WithMessage("Descrição não pode exceder 500 caracteres")
            .When(x => !string.IsNullOrWhiteSpace(x.Descricao));

        RuleFor(x => x.Quantidade)
            .GreaterThan(0).WithMessage("Quantidade deve ser maior que 0")
            .When(x => x.Quantidade.HasValue);

        RuleFor(x => x.PesoKg)
            .GreaterThan(0).WithMessage("PesoKg deve ser maior que 0")
            .When(x => x.PesoKg.HasValue);

        RuleFor(x => x.ValorUSD)
            .GreaterThan(0).WithMessage("ValorUSD deve ser maior que 0")
            .When(x => x.ValorUSD.HasValue);
    }
}
