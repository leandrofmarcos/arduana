namespace ImportCostsApi.Features.Orcamentos.Update;

using FluentValidation;

/// <summary>
/// Validator para UpdateOrcamentoDto
/// </summary>
public class UpdateOrcamentoValidator : AbstractValidator<UpdateOrcamentoDto>
{
    public UpdateOrcamentoValidator()
    {
        RuleFor(x => x.Numero)
            .Length(1, 50).WithMessage("Número deve ter entre 1 e 50 caracteres")
            .When(x => !string.IsNullOrEmpty(x.Numero));

        RuleFor(x => x.Titulo)
            .Length(1, 200).WithMessage("Título deve ter no máximo 200 caracteres")
            .When(x => !string.IsNullOrEmpty(x.Titulo));

        RuleFor(x => x.DespachanteId)
            .Length(1, 50).WithMessage("DespachanteId deve ter no máximo 50 caracteres")
            .When(x => !string.IsNullOrEmpty(x.DespachanteId));

        RuleFor(x => x.MoedaPadrao)
            .Length(1, 10).WithMessage("MoedaPadrao deve ter no máximo 10 caracteres")
            .When(x => !string.IsNullOrEmpty(x.MoedaPadrao));
    }
}
