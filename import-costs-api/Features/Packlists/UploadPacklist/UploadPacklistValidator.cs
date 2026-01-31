using FluentValidation;

namespace ImportCostsApi.Features.Packlists.UploadPacklist;

/// <summary>
/// Validador para upload de packlist
/// </summary>
public class UploadPacklistValidator : AbstractValidator<UploadPacklistDto>
{
    public UploadPacklistValidator()
    {
        RuleFor(x => x.Arquivo)
            .NotNull().WithMessage("Arquivo é obrigatório");
    }
}
