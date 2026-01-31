namespace ImportCostsApi.Features.Aduanas.Create;

using FluentValidation;

/// <summary>
/// Validator for CreateAduanaDto
/// </summary>
public class CreateAduanaValidator : AbstractValidator<CreateAduanaDto>
{
    public CreateAduanaValidator()
    {
        RuleFor(x => x.OrcamentoId)
            .NotEmpty().WithMessage("OrcamentoId é obrigatório")
            .Length(1, 50).WithMessage("OrcamentoId deve ter entre 1 e 50 caracteres");

        RuleForEach(x => x.Eventos)
            .SetValidator(new CreateAduanaEventoValidator())
            .When(x => x.Eventos != null && x.Eventos.Any());
    }
}

/// <summary>
/// Validator for CreateAduanaEventoDto
/// </summary>
public class CreateAduanaEventoValidator : AbstractValidator<CreateAduanaEventoDto>
{
    public CreateAduanaEventoValidator()
    {
        RuleFor(x => x.Descricao)
            .NotEmpty().WithMessage("Descrição do evento é obrigatória")
            .Length(1, 500).WithMessage("Descrição deve ter entre 1 e 500 caracteres");

        RuleFor(x => x.Tipo)
            .Length(1, 50).WithMessage("Tipo deve ter no máximo 50 caracteres")
            .When(x => !string.IsNullOrEmpty(x.Tipo));
    }
}
