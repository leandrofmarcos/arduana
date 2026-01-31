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

        RuleFor(x => x.Codigo)
            .Matches("^[A-Za-z0-9]{5}$").WithMessage("Código deve seguir padrão UN/LOCODE (5 caracteres alfanuméricos)")
            .When(x => !string.IsNullOrWhiteSpace(x.Codigo));

        RuleFor(x => x.Pais)
            .MaximumLength(100).WithMessage("País não pode exceder 100 caracteres")
            .When(x => !string.IsNullOrWhiteSpace(x.Pais));
    }
}
