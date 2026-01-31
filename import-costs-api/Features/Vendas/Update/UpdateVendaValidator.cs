namespace ImportCostsApi.Features.Vendas.Update;

using FluentValidation;

/// <summary>
/// Validator for UpdateVendaDto
/// </summary>
public class UpdateVendaValidator : AbstractValidator<UpdateVendaDto>
{
    public UpdateVendaValidator()
    {
        RuleFor(x => x.Codigo)
            .Length(1, 50).WithMessage("Código deve ter entre 1 e 50 caracteres")
            .When(x => !string.IsNullOrEmpty(x.Codigo));

        RuleFor(x => x.Premissasdelha)
            .Must(premissas => ValidatePremissasValues(premissas))
            .WithMessage("Premissas devem conter valores positivos")
            .When(x => x.Premissasdelha != null && x.Premissasdelha.Any());
    }

    private bool ValidatePremissasValues(Dictionary<string, decimal>? premissas)
    {
        if (premissas == null) return true;
        return premissas.Values.All(v => v >= 0);
    }
}
