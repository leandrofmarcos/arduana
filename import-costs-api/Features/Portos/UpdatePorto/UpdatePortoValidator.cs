using FluentValidation;

namespace ImportCostsApi.Features.Portos.UpdatePorto;

/// <summary>
/// Validador para atualização de porto
/// </summary>
public class UpdatePortoValidator : AbstractValidator<UpdatePortoDto>
{
    public UpdatePortoValidator()
    {
        RuleFor(x => x.Nome)
            .MaximumLength(200).WithMessage("Nome não pode exceder 200 caracteres")
            .When(x => !string.IsNullOrWhiteSpace(x.Nome));
    }
}
