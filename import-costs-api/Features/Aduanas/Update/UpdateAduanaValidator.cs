namespace ImportCostsApi.Features.Aduanas.Update;

using FluentValidation;

/// <summary>
/// Validator for UpdateAduanaDto
/// </summary>
public class UpdateAduanaValidator : AbstractValidator<UpdateAduanaDto>
{
    public UpdateAduanaValidator()
    {
        RuleFor(x => x.NumeroDI)
            .Length(1, 50).WithMessage("Número DI deve ter entre 1 e 50 caracteres")
            .When(x => !string.IsNullOrEmpty(x.NumeroDI));

        RuleFor(x => x.NumeroConhecimento)
            .Length(1, 50).WithMessage("Número de Conhecimento deve ter entre 1 e 50 caracteres")
            .When(x => !string.IsNullOrEmpty(x.NumeroConhecimento));

        RuleFor(x => x.Despachante)
            .Length(1, 100).WithMessage("Despachante deve ter entre 1 e 100 caracteres")
            .When(x => !string.IsNullOrEmpty(x.Despachante));
    }
}
