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

        RuleFor(x => x.Documento)
            .NotEmpty().WithMessage("Documento é obrigatório")
            .Matches(@"^\d{11}(\d{3})?$").WithMessage("Documento deve ter 11 dígitos (CPF) ou 14 dígitos (CNPJ)");

        RuleFor(x => x.Contato)
            .NotEmpty().WithMessage("Contato é obrigatório")
            .MaximumLength(150).WithMessage("Contato não pode exceder 150 caracteres");
    }
}
