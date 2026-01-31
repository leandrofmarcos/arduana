namespace ImportCostsApi.Features.Vendas.Create;

using FluentValidation;

/// <summary>
/// Validator for CreateVendaDto
/// </summary>
public class CreateVendaValidator : AbstractValidator<CreateVendaDto>
{
    public CreateVendaValidator()
    {
        RuleFor(x => x.OrcamentoId)
            .NotEmpty().WithMessage("OrcamentoId é obrigatório")
            .Length(1, 50).WithMessage("OrcamentoId deve ter entre 1 e 50 caracteres");

        RuleFor(x => x.Codigo)
            .NotEmpty().WithMessage("Código é obrigatório")
            .Length(1, 50).WithMessage("Código deve ter entre 1 e 50 caracteres");

        RuleFor(x => x.Cliente)
            .NotEmpty().WithMessage("Cliente é obrigatório")
            .Length(1, 100).WithMessage("Cliente deve ter entre 1 e 100 caracteres");

        RuleFor(x => x.Despachante)
            .NotEmpty().WithMessage("Despachante é obrigatório")
            .Length(1, 100).WithMessage("Despachante deve ter entre 1 e 100 caracteres");

        RuleFor(x => x.Premissasdelha)
            .Must(premissas => ValidatePremissasValues(premissas))
            .WithMessage("Premissas devem conter valores positivos");
    }

    private bool ValidatePremissasValues(Dictionary<string, decimal> premissas)
    {
        if (premissas == null) return true;
        return premissas.Values.All(v => v >= 0);
    }
}
