namespace ImportCostsApi.Features.Orcamentos.Create;

using FluentValidation;

/// <summary>
/// Validator para CreateOrcamentoDto
/// </summary>
public class CreateOrcamentoValidator : AbstractValidator<CreateOrcamentoDto>
{
    public CreateOrcamentoValidator()
    {
        RuleFor(x => x.Numero)
            .NotEmpty().WithMessage("Número do orçamento é obrigatório")
            .Length(1, 50).WithMessage("Número deve ter entre 1 e 50 caracteres");

        RuleFor(x => x.ClienteId)
            .NotEmpty().WithMessage("ClienteId é obrigatório")
            .Length(1, 50).WithMessage("ClienteId deve ter entre 1 e 50 caracteres");

        RuleFor(x => x.Titulo)
            .Length(1, 200).WithMessage("Título deve ter no máximo 200 caracteres")
            .When(x => !string.IsNullOrEmpty(x.Titulo));

        RuleFor(x => x.DespachanteId)
            .Length(1, 50).WithMessage("DespachanteId deve ter no máximo 50 caracteres")
            .When(x => !string.IsNullOrEmpty(x.DespachanteId));

        RuleFor(x => x.TemplatePacklistId)
            .Length(1, 50).WithMessage("TemplatePacklistId deve ter no máximo 50 caracteres")
            .When(x => !string.IsNullOrEmpty(x.TemplatePacklistId));

        RuleFor(x => x.MoedaPadrao)
            .Length(1, 10).WithMessage("MoedaPadrao deve ter no máximo 10 caracteres")
            .When(x => !string.IsNullOrEmpty(x.MoedaPadrao));
    }
}
