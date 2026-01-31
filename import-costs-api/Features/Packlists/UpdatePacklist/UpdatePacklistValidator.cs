using FluentValidation;

namespace ImportCostsApi.Features.Packlists.UpdatePacklist;

/// <summary>
/// Validador para atualização de packlist
/// </summary>
public class UpdatePacklistValidator : AbstractValidator<UpdatePacklistDto>
{
    public UpdatePacklistValidator()
    {
        RuleFor(x => x.Codigo)
            .MaximumLength(50).WithMessage("Código não pode exceder 50 caracteres")
            .When(x => !string.IsNullOrWhiteSpace(x.Codigo));
    }
}
