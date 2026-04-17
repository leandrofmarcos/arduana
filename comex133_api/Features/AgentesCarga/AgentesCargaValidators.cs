using FluentValidation;

namespace Comex133Api.Features.AgentesCarga;

public class CreateAgenteCargaValidator : AbstractValidator<CreateAgenteCargaRequest>
{
    public CreateAgenteCargaValidator()
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

        RuleFor(x => x.Contato)
            .MaximumLength(200).WithMessage("Contato deve ter no máximo 200 caracteres.")
            .When(x => x.Contato is not null);
    }
}

public class UpdateAgenteCargaValidator : AbstractValidator<UpdateAgenteCargaRequest>
{
    public UpdateAgenteCargaValidator()
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

        RuleFor(x => x.Contato)
            .MaximumLength(200).WithMessage("Contato deve ter no máximo 200 caracteres.")
            .When(x => x.Contato is not null);
    }
}
