namespace ImportCostsApi.Features.Custos.Update;

using FluentValidation;

/// <summary>
/// Validator for UpdateCustoDto
/// </summary>
public class UpdateCustoValidator : AbstractValidator<UpdateCustoDto>
{
    public UpdateCustoValidator()
    {
        RuleFor(x => x.Codigo)
            .Length(1, 50).WithMessage("Código deve ter entre 1 e 50 caracteres")
            .When(x => !string.IsNullOrEmpty(x.Codigo));

        RuleFor(x => x.Taxas)
            .Must(taxas => ValidateTaxaValues(taxas))
            .WithMessage("Todas as alíquotas devem estar entre 0 e 100")
            .When(x => x.Taxas != null && x.Taxas.Any());

        RuleForEach(x => x.Despesas)
            .SetValidator(new UpdateDespesaValidator())
            .When(x => x.Despesas != null && x.Despesas.Any());
    }

    private bool ValidateTaxaValues(Dictionary<string, decimal>? taxas)
    {
        if (taxas == null) return true;
        return taxas.Values.All(v => v >= 0 && v <= 100);
    }
}

/// <summary>
/// Validator for updating Despesa
/// </summary>
public class UpdateDespesaValidator : AbstractValidator<CreateDespesaDto>
{
    public UpdateDespesaValidator()
    {
        RuleFor(x => x.Categoria)
            .NotEmpty().WithMessage("Categoria é obrigatória")
            .Length(1, 50).WithMessage("Categoria deve ter entre 1 e 50 caracteres");

        RuleFor(x => x.Item)
            .NotEmpty().WithMessage("Item é obrigatório")
            .Length(1, 100).WithMessage("Item deve ter entre 1 e 100 caracteres");

        RuleFor(x => x.Fornecedor)
            .NotEmpty().WithMessage("Fornecedor é obrigatório")
            .Length(1, 100).WithMessage("Fornecedor deve ter entre 1 e 100 caracteres");

        RuleFor(x => x.Valor)
            .GreaterThan(0).WithMessage("Valor deve ser maior que 0");
    }
}
