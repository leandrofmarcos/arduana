namespace ImportCostsApi.Features.Aduanas.Finalizacao;

using FluentValidation;

/// <summary>
/// Validator for FinalizarAduanaDto
/// </summary>
public class FinalizarAduanaValidator : AbstractValidator<FinalizarAduanaDto>
{
    public FinalizarAduanaValidator()
    {
        RuleFor(x => x.DataDesembaraco)
            .NotEmpty().WithMessage("Data de desembaraco é obrigatória")
            .LessThanOrEqualTo(DateTime.UtcNow).WithMessage("Data de desembaraco não pode ser no futuro");

        RuleFor(x => x.DescricaoFinalizacao)
            .Length(1, 500).WithMessage("Descrição deve ter entre 1 e 500 caracteres")
            .When(x => !string.IsNullOrEmpty(x.DescricaoFinalizacao));
    }
}
