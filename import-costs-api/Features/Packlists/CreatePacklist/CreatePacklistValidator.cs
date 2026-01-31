using FluentValidation;

namespace ImportCostsApi.Features.Packlists.CreatePacklist;

/// <summary>
/// Validador para criação de packlist
/// </summary>
public class CreatePacklistValidator : AbstractValidator<CreatePacklistDto>
{
    public CreatePacklistValidator()
    {
        RuleFor(x => x.Codigo)
            .MaximumLength(50).WithMessage("Código não pode exceder 50 caracteres")
            .When(x => !string.IsNullOrWhiteSpace(x.Codigo));
    }
}
