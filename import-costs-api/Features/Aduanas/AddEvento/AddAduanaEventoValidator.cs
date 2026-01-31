namespace ImportCostsApi.Features.Aduanas.AddEvento;

using FluentValidation;

/// <summary>
/// Validator for AddAduanaEventoDto
/// </summary>
public class AddAduanaEventoValidator : AbstractValidator<AddAduanaEventoDto>
{
    public AddAduanaEventoValidator()
    {
        RuleFor(x => x.Descricao)
            .NotEmpty().WithMessage("Descrição do evento é obrigatória")
            .Length(1, 500).WithMessage("Descrição deve ter entre 1 e 500 caracteres");

        RuleFor(x => x.Tipo)
            .Length(1, 50).WithMessage("Tipo deve ter no máximo 50 caracteres")
            .When(x => !string.IsNullOrEmpty(x.Tipo));
    }
}
