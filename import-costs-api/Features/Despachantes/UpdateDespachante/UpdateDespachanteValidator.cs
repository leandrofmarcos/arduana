using FluentValidation;

namespace ImportCostsApi.Features.Despachantes.UpdateDespachante;

/// <summary>
/// Validador para atualização de despachante
/// </summary>
public class UpdateDespachanteValidator : AbstractValidator<UpdateDespachanteDto>
{
    public UpdateDespachanteValidator()
    {
        RuleFor(x => x.Nome)
            .MaximumLength(200).WithMessage("Nome não pode exceder 200 caracteres")
            .When(x => !string.IsNullOrWhiteSpace(x.Nome));

        RuleFor(x => x.Contato)
            .MaximumLength(150).WithMessage("Contato não pode exceder 150 caracteres")
            .When(x => !string.IsNullOrWhiteSpace(x.Contato));
    }
}
