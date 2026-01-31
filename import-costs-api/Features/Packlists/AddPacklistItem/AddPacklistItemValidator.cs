using FluentValidation;

namespace ImportCostsApi.Features.Packlists.AddPacklistItem;

/// <summary>
/// Validador para adicionar item ao packlist
/// </summary>
public class AddPacklistItemValidator : AbstractValidator<AddPacklistItemDto>
{
    public AddPacklistItemValidator()
    {
        RuleFor(x => x.Codigo)
            .NotEmpty().WithMessage("Código é obrigatório")
            .MaximumLength(50).WithMessage("Código não pode exceder 50 caracteres");

        RuleFor(x => x.Descricao)
            .NotEmpty().WithMessage("Descrição é obrigatória")
            .MaximumLength(500).WithMessage("Descrição não pode exceder 500 caracteres");

        RuleFor(x => x.Quantidade)
            .GreaterThan(0).WithMessage("Quantidade deve ser maior que 0");

        RuleFor(x => x.PesoKg)
            .GreaterThan(0).WithMessage("PesoKg deve ser maior que 0");

        RuleFor(x => x.ValorUSD)
            .GreaterThan(0).WithMessage("ValorUSD deve ser maior que 0");
    }
}
