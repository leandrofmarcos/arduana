using FluentValidation;

namespace ImportCostsApi.Features.TemplatesPacklist.CreateTemplate;

/// <summary>
/// Validador para criação de template
/// </summary>
public class CreateTemplateValidator : AbstractValidator<CreateTemplateDto>
{
    public CreateTemplateValidator()
    {
        RuleFor(x => x.Nome)
            .NotEmpty().WithMessage("Nome do template é obrigatório")
            .MaximumLength(200).WithMessage("Nome não pode exceder 200 caracteres");

        RuleFor(x => x.Config)
            .NotEmpty().WithMessage("Config é obrigatória");

        RuleFor(x => x.Arquivo)
            .NotNull().WithMessage("Arquivo do template é obrigatório");
    }
}
