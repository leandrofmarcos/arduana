using FluentValidation;

namespace Comex133Api.Features.Navios;

public class CreateNavioValidator : AbstractValidator<CreateNavioRequest>
{
    public CreateNavioValidator()
    {
        RuleFor(x => x.NomeNavio)
            .NotEmpty().WithMessage("Nome do navio é obrigatório.")
            .MaximumLength(150).WithMessage("Nome do navio deve ter no máximo 150 caracteres.");

        RuleFor(x => x.CodigoImo)
            .MaximumLength(20).WithMessage("Código IMO deve ter no máximo 20 caracteres.")
            .When(x => x.CodigoImo is not null);

        RuleFor(x => x.Armador)
            .MaximumLength(150).WithMessage("Armador deve ter no máximo 150 caracteres.")
            .When(x => x.Armador is not null);

        RuleFor(x => x.Observacao)
            .MaximumLength(500).WithMessage("Observação deve ter no máximo 500 caracteres.")
            .When(x => x.Observacao is not null);
    }
}

public class UpdateNavioValidator : AbstractValidator<UpdateNavioRequest>
{
    public UpdateNavioValidator()
    {
        RuleFor(x => x.NomeNavio)
            .NotEmpty().WithMessage("Nome do navio é obrigatório.")
            .MaximumLength(150).WithMessage("Nome do navio deve ter no máximo 150 caracteres.");

        RuleFor(x => x.CodigoImo)
            .MaximumLength(20).WithMessage("Código IMO deve ter no máximo 20 caracteres.")
            .When(x => x.CodigoImo is not null);

        RuleFor(x => x.Armador)
            .MaximumLength(150).WithMessage("Armador deve ter no máximo 150 caracteres.")
            .When(x => x.Armador is not null);

        RuleFor(x => x.Observacao)
            .MaximumLength(500).WithMessage("Observação deve ter no máximo 500 caracteres.")
            .When(x => x.Observacao is not null);
    }
}

public class CreateNavioTrajetoValidator : AbstractValidator<CreateNavioTrajetoRequest>
{
    public CreateNavioTrajetoValidator()
    {
        RuleFor(x => x.NumeroViagem)
            .NotEmpty().WithMessage("Número da viagem é obrigatório.")
            .MaximumLength(50);

        RuleFor(x => x.Sequencia)
            .GreaterThan(0).WithMessage("Sequência deve ser maior que zero.");

        RuleFor(x => x.PortoOrigemId)
            .GreaterThan(0).WithMessage("Porto de origem é obrigatório.");

        RuleFor(x => x.PortoDestinoId)
            .GreaterThan(0).WithMessage("Porto de destino é obrigatório.");

        RuleFor(x => x.Etd)
            .NotEmpty().WithMessage("ETD é obrigatório.");

        RuleFor(x => x.Eta)
            .NotEmpty().WithMessage("ETA é obrigatório.");
    }
}

public class UpdateNavioTrajetoValidator : AbstractValidator<UpdateNavioTrajetoRequest>
{
    public UpdateNavioTrajetoValidator()
    {
        RuleFor(x => x.NumeroViagem)
            .NotEmpty().WithMessage("Número da viagem é obrigatório.")
            .MaximumLength(50);

        RuleFor(x => x.Sequencia)
            .GreaterThan(0).WithMessage("Sequência deve ser maior que zero.");

        RuleFor(x => x.PortoOrigemId)
            .GreaterThan(0).WithMessage("Porto de origem é obrigatório.");

        RuleFor(x => x.PortoDestinoId)
            .GreaterThan(0).WithMessage("Porto de destino é obrigatório.");

        RuleFor(x => x.Etd)
            .NotEmpty().WithMessage("ETD é obrigatório.");

        RuleFor(x => x.Eta)
            .NotEmpty().WithMessage("ETA é obrigatório.");
    }
}

public class CreateEmbarqueNavioVinculoValidator : AbstractValidator<CreateEmbarqueNavioVinculoRequest>
{
    public CreateEmbarqueNavioVinculoValidator()
    {
        RuleFor(x => x.NavioId)
            .GreaterThan(0).WithMessage("Navio é obrigatório.");
    }
}
