using FluentValidation;

namespace Comex133Api.Features.Exportadores;

public class CreateExportadorValidator : AbstractValidator<CreateExportadorRequest>
{
    public CreateExportadorValidator()
    {
        RuleFor(x => x.Nome)
            .NotEmpty().WithMessage("Nome é obrigatório.")
            .MaximumLength(200).WithMessage("Nome deve ter no máximo 200 caracteres.");

        RuleFor(x => x.Documento)
            .MaximumLength(50).WithMessage("Documento deve ter no máximo 50 caracteres.")
            .When(x => x.Documento is not null);

        RuleFor(x => x.Pais)
            .NotEmpty().WithMessage("País é obrigatório.")
            .MaximumLength(100).WithMessage("País deve ter no máximo 100 caracteres.");

        RuleFor(x => x.Cidade)
            .MaximumLength(150).WithMessage("Cidade deve ter no máximo 150 caracteres.")
            .When(x => x.Cidade is not null);
    }
}

public class UpdateExportadorValidator : AbstractValidator<UpdateExportadorRequest>
{
    public UpdateExportadorValidator()
    {
        RuleFor(x => x.Nome)
            .NotEmpty().WithMessage("Nome é obrigatório.")
            .MaximumLength(200).WithMessage("Nome deve ter no máximo 200 caracteres.");

        RuleFor(x => x.Documento)
            .MaximumLength(50).WithMessage("Documento deve ter no máximo 50 caracteres.")
            .When(x => x.Documento is not null);

        RuleFor(x => x.Pais)
            .NotEmpty().WithMessage("País é obrigatório.")
            .MaximumLength(100).WithMessage("País deve ter no máximo 100 caracteres.");

        RuleFor(x => x.Cidade)
            .MaximumLength(150).WithMessage("Cidade deve ter no máximo 150 caracteres.")
            .When(x => x.Cidade is not null);
    }
}
