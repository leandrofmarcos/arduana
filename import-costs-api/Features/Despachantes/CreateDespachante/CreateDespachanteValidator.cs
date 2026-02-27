using FluentValidation;

namespace ImportCostsApi.Features.Despachantes.CreateDespachante;

/// <summary>
/// Validador para criação de despachante
/// </summary>
public class CreateDespachanteValidator : AbstractValidator<CreateDespachanteDto>
{
    public CreateDespachanteValidator()
    {
        RuleFor(x => x.Nome)
            .NotEmpty().WithMessage("Nome do despachante é obrigatório")
            .MaximumLength(200).WithMessage("Nome não pode exceder 200 caracteres");

        RuleFor(x => x.Contato)
            .NotEmpty().WithMessage("Contato é obrigatório")
            .MaximumLength(150).WithMessage("Contato não pode exceder 150 caracteres");
    }
}
