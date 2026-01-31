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

        RuleFor(x => x.Codigo)
            .NotEmpty().WithMessage("Código do porto é obrigatório")
            .Matches("^[A-Za-z0-9]{5}$").WithMessage("Código deve seguir padrão UN/LOCODE (5 caracteres alfanuméricos)");

        RuleFor(x => x.Pais)
            .NotEmpty().WithMessage("País do porto é obrigatório")
            .MaximumLength(100).WithMessage("País não pode exceder 100 caracteres");
    }
}
