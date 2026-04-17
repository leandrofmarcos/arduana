using FluentValidation;

namespace Comex133Api.Features.PortosDestino;

public class CreatePortoDestinoValidator : AbstractValidator<CreatePortoDestinoRequest>
{
    public CreatePortoDestinoValidator()
    {
        RuleFor(x => x.Nome)
            .NotEmpty().WithMessage("Nome é obrigatório.")
            .MaximumLength(150).WithMessage("Nome deve ter no máximo 150 caracteres.");

        RuleFor(x => x.Codigo)
            .NotEmpty().WithMessage("Código é obrigatório.")
            .MaximumLength(10).WithMessage("Código deve ter no máximo 10 caracteres.");

        RuleFor(x => x.Estado)
            .MaximumLength(100).WithMessage("Estado deve ter no máximo 100 caracteres.")
            .When(x => x.Estado is not null);

        RuleFor(x => x.Pais)
            .NotEmpty().WithMessage("País é obrigatório.")
            .MaximumLength(100).WithMessage("País deve ter no máximo 100 caracteres.");
    }
}

public class UpdatePortoDestinoValidator : AbstractValidator<UpdatePortoDestinoRequest>
{
    public UpdatePortoDestinoValidator()
    {
        RuleFor(x => x.Nome)
            .NotEmpty().WithMessage("Nome é obrigatório.")
            .MaximumLength(150).WithMessage("Nome deve ter no máximo 150 caracteres.");

        RuleFor(x => x.Codigo)
            .NotEmpty().WithMessage("Código é obrigatório.")
            .MaximumLength(10).WithMessage("Código deve ter no máximo 10 caracteres.");

        RuleFor(x => x.Estado)
            .MaximumLength(100).WithMessage("Estado deve ter no máximo 100 caracteres.")
            .When(x => x.Estado is not null);

        RuleFor(x => x.Pais)
            .NotEmpty().WithMessage("País é obrigatório.")
            .MaximumLength(100).WithMessage("País deve ter no máximo 100 caracteres.");
    }
}
