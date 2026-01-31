using FluentValidation;

namespace ImportCostsApi.Features.TemplatesPacklist.UpdateTemplate;

/// <summary>
/// Validador para atualização de template
/// </summary>
public class UpdateTemplateValidator : AbstractValidator<UpdateTemplateDto>
{
    public UpdateTemplateValidator()
    {
        RuleFor(x => x.Nome)
            .MaximumLength(200).WithMessage("Nome não pode exceder 200 caracteres")
            .When(x => !string.IsNullOrWhiteSpace(x.Nome));
    }
}
