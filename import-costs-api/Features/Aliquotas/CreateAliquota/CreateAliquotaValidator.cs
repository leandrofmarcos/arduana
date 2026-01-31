using FluentValidation;

namespace ImportCostsApi.Features.Aliquotas.CreateAliquota;

/// <summary>
/// Validador para criação de perfil de alíquotas
/// </summary>
public class CreateAliquotaValidator : AbstractValidator<CreateAliquotaDto>
{
    public CreateAliquotaValidator()
    {
        RuleFor(x => x.Nome)
            .NotEmpty().WithMessage("Nome do perfil é obrigatório")
            .MaximumLength(200).WithMessage("Nome não pode exceder 200 caracteres");

        RuleFor(x => x.II)
            .InclusiveBetween(0, 100).WithMessage("II deve estar entre 0 e 100");

        RuleFor(x => x.IPI)
            .InclusiveBetween(0, 100).WithMessage("IPI deve estar entre 0 e 100");

        RuleFor(x => x.ICMS)
            .InclusiveBetween(0, 100).WithMessage("ICMS deve estar entre 0 e 100");

        RuleFor(x => x.PIS)
            .InclusiveBetween(0, 100).WithMessage("PIS deve estar entre 0 e 100");

        RuleFor(x => x.COFINS)
            .InclusiveBetween(0, 100).WithMessage("COFINS deve estar entre 0 e 100");
    }
}
