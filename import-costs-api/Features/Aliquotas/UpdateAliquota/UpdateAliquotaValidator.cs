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
            .InclusiveBetween(0, 100).WithMessage("II deve estar entre 0 e 100")
            .When(x => x.II.HasValue);

        RuleFor(x => x.IPI)
            .InclusiveBetween(0, 100).WithMessage("IPI deve estar entre 0 e 100")
            .When(x => x.IPI.HasValue);

        RuleFor(x => x.ICMS)
            .InclusiveBetween(0, 100).WithMessage("ICMS deve estar entre 0 e 100")
            .When(x => x.ICMS.HasValue);

        RuleFor(x => x.PIS)
            .InclusiveBetween(0, 100).WithMessage("PIS deve estar entre 0 e 100")
            .When(x => x.PIS.HasValue);

        RuleFor(x => x.COFINS)
            .InclusiveBetween(0, 100).WithMessage("COFINS deve estar entre 0 e 100")
            .When(x => x.COFINS.HasValue);
    }
}
