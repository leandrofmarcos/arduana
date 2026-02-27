using FluentValidation;

namespace ImportCostsApi.Features.Aliquotas.UpdateAliquota;

/// <summary>
/// Validador para atualização de perfil de alíquotas
/// </summary>
public class UpdateAliquotaValidator : AbstractValidator<UpdateAliquotaDto>
{
    public UpdateAliquotaValidator()
    {
        RuleFor(x => x.Nome)
            .MaximumLength(200).WithMessage("Nome não pode exceder 200 caracteres")
            .When(x => !string.IsNullOrWhiteSpace(x.Nome));

        RuleFor(x => x.II)
            .Must(value => !value.HasValue || (value.Value >= 0 && value.Value <= 100))
            .WithMessage("II deve estar entre 0 e 100");

        RuleFor(x => x.IPI)
            .Must(value => !value.HasValue || (value.Value >= 0 && value.Value <= 100))
            .WithMessage("IPI deve estar entre 0 e 100");

        RuleFor(x => x.ICMS)
            .Must(value => !value.HasValue || (value.Value >= 0 && value.Value <= 100))
            .WithMessage("ICMS deve estar entre 0 e 100");

        RuleFor(x => x.PIS)
            .Must(value => !value.HasValue || (value.Value >= 0 && value.Value <= 100))
            .WithMessage("PIS deve estar entre 0 e 100");

        RuleFor(x => x.COFINS)
            .Must(value => !value.HasValue || (value.Value >= 0 && value.Value <= 100))
            .WithMessage("COFINS deve estar entre 0 e 100");
    }
}
