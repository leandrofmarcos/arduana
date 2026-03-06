using FluentValidation;

namespace ImportCostsApi.Features.Portos.CreatePorto;

/// <summary>
/// Validador para criação de porto
/// </summary>
public class CreatePortoValidator : AbstractValidator<CreatePortoDto>
{
    public CreatePortoValidator()
    {
        RuleFor(x => x.Nome)
            .NotEmpty().WithMessage("Nome do porto é obrigatório")
            .MaximumLength(200).WithMessage("Nome não pode exceder 200 caracteres");
    }
}
