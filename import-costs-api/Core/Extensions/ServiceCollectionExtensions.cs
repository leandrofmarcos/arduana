using ImportCostsApi.Core.Database;
using ImportCostsApi.Features.Clientes;
using ImportCostsApi.Features.Despachantes;
using ImportCostsApi.Features.Clientes.CreateCliente;
using ImportCostsApi.Features.Clientes.UpdateCliente;
using ImportCostsApi.Features.Clientes.GetCliente;
using ImportCostsApi.Features.Clientes.GetClientes;
using ImportCostsApi.Features.Clientes.DeleteCliente;
using ImportCostsApi.Features.Despachantes.CreateDespachante;
using ImportCostsApi.Features.Despachantes.UpdateDespachante;
using ImportCostsApi.Features.Despachantes.GetDespachante;
using ImportCostsApi.Features.Despachantes.GetDespachantes;
using ImportCostsApi.Features.Despachantes.DeleteDespachante;
using ImportCostsApi.Features.Portos;
using ImportCostsApi.Features.Portos.CreatePorto;
using ImportCostsApi.Features.Portos.UpdatePorto;
using ImportCostsApi.Features.Portos.GetPorto;
using ImportCostsApi.Features.Portos.GetPortos;
using ImportCostsApi.Features.Portos.DeletePorto;
using ImportCostsApi.Features.Aliquotas;
using ImportCostsApi.Features.Aliquotas.CreateAliquota;
using ImportCostsApi.Features.Aliquotas.UpdateAliquota;
using ImportCostsApi.Features.Aliquotas.GetAliquota;
using ImportCostsApi.Features.Aliquotas.GetAliquotas;
using ImportCostsApi.Features.Aliquotas.GetAliquotaPadrao;
using ImportCostsApi.Features.Aliquotas.DeleteAliquota;
using ImportCostsApi.Features.TemplatesPacklist;
using ImportCostsApi.Features.TemplatesPacklist.CreateTemplate;
using ImportCostsApi.Features.TemplatesPacklist.UpdateTemplate;
using ImportCostsApi.Features.TemplatesPacklist.GetTemplate;
using ImportCostsApi.Features.TemplatesPacklist.GetTemplates;
using ImportCostsApi.Features.TemplatesPacklist.DeleteTemplate;
using ImportCostsApi.Features.Packlists;
using ImportCostsApi.Features.Packlists.GetPacklist;
using ImportCostsApi.Features.Packlists.CreatePacklist;
using ImportCostsApi.Features.Packlists.UpdatePacklist;
using ImportCostsApi.Features.Packlists.FinalizarPacklist;
using ImportCostsApi.Features.Packlists.UploadPacklist;
using ImportCostsApi.Features.Packlists.GetPacklistItems;
using ImportCostsApi.Features.Packlists.AddPacklistItem;
using ImportCostsApi.Features.Packlists.UpdatePacklistItem;
using ImportCostsApi.Features.Packlists.DeletePacklistItem;
using ImportCostsApi.Features.Custos;
using ImportCostsApi.Features.Custos.Get;
using ImportCostsApi.Features.Custos.GetByOrcamento;
using ImportCostsApi.Features.Custos.Create;
using ImportCostsApi.Features.Custos.Update;
using ImportCostsApi.Features.Custos.Delete;
using ImportCostsApi.Features.Vendas;
using ImportCostsApi.Features.Vendas.Get;
using ImportCostsApi.Features.Vendas.GetByOrcamento;
using ImportCostsApi.Features.Vendas.Create;
using ImportCostsApi.Features.Vendas.Update;
using ImportCostsApi.Features.Vendas.Delete;
using ImportCostsApi.Features.Aduanas;
using ImportCostsApi.Features.Aduanas.Get;
using ImportCostsApi.Features.Aduanas.GetByOrcamento;
using ImportCostsApi.Features.Aduanas.Create;
using ImportCostsApi.Features.Aduanas.Update;
using ImportCostsApi.Features.Aduanas.Delete;
using ImportCostsApi.Features.Aduanas.AddEvento;
using ImportCostsApi.Features.Aduanas.Finalizacao;
using ImportCostsApi.Features.Numerarios;
using ImportCostsApi.Features.Numerarios.Get;
using ImportCostsApi.Features.Numerarios.GetByOrcamento;
using ImportCostsApi.Features.Numerarios.Create;
using ImportCostsApi.Features.Numerarios.Update;
using ImportCostsApi.Features.Numerarios.Delete;
using ImportCostsApi.Features.Orcamentos;
using ImportCostsApi.Features.Orcamentos.Get;
using ImportCostsApi.Features.Orcamentos.GetAll;
using ImportCostsApi.Features.Orcamentos.Create;
using ImportCostsApi.Features.Orcamentos.Update;
using ImportCostsApi.Features.Orcamentos.Delete;
using ImportCostsApi.Features.Orcamentos.TransicaoFase;
using ImportCostsApi.Features.Orcamentos.Resumo;
using ImportCostsApi.Core.Storage;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace ImportCostsApi.Core.Extensions;

/// <summary>
/// Extensões para configuração de serviços
/// </summary>
public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Adiciona o DbContext configurado
    /// </summary>
    public static IServiceCollection AddAppDbContext(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Por enquanto usando InMemory, depois será alterado para SQL Server
        services.AddDbContext<AppDbContext>(options =>
            options.UseInMemoryDatabase("ImportCostsDb"));

        // Storage local temporário
        services.AddSingleton<IStorageService, LocalFileStorage>();

        return services;
    }

    /// <summary>
    /// Adiciona os repositórios ao container de DI
    /// </summary>
    public static IServiceCollection AddRepositories(this IServiceCollection services)
    {
        // Feature: Clientes
        services.AddScoped<ClienteRepository>();

        // Feature: Despachantes
        services.AddScoped<DespachanteRepository>();

        // Feature: Portos
        services.AddScoped<PortoRepository>();

        // Feature: Aliquotas
        services.AddScoped<AliquotaRepository>();

        // Feature: Templates Packlist
        services.AddScoped<TemplateRepository>();

        // Feature: Packlists
        services.AddScoped<PacklistRepository>();

        // Feature: Custos
        services.AddScoped<CustoRepository>();

        // Feature: Vendas
        services.AddScoped<VendaRepository>();

        // Feature: Aduanas
        services.AddScoped<AduanaRepository>();

        // Feature: Numerarios
        services.AddScoped<NumerarioRepository>();

        // Feature: Orcamentos
        services.AddScoped<OrcamentoRepository>();

        return services;
    }

    /// <summary>
    /// Adiciona os handlers ao container de DI
    /// </summary>
    public static IServiceCollection AddHandlers(this IServiceCollection services)
    {
        // Feature: Clientes
        services.AddScoped<GetClientesHandler>();
        services.AddScoped<GetClienteHandler>();
        services.AddScoped<CreateClienteHandler>();
        services.AddScoped<UpdateClienteHandler>();
        services.AddScoped<DeleteClienteHandler>();

        // Feature: Despachantes
        services.AddScoped<GetDespachantesHandler>();
        services.AddScoped<GetDespachanteHandler>();
        services.AddScoped<CreateDespachanteHandler>();
        services.AddScoped<UpdateDespachanteHandler>();
        services.AddScoped<DeleteDespachanteHandler>();

        // Feature: Portos
        services.AddScoped<GetPortosHandler>();
        services.AddScoped<GetPortoHandler>();
        services.AddScoped<CreatePortoHandler>();
        services.AddScoped<UpdatePortoHandler>();
        services.AddScoped<DeletePortoHandler>();

        // Feature: Aliquotas
        services.AddScoped<GetAliquotasHandler>();
        services.AddScoped<GetAliquotaHandler>();
        services.AddScoped<GetAliquotaPadraoHandler>();
        services.AddScoped<CreateAliquotaHandler>();
        services.AddScoped<UpdateAliquotaHandler>();
        services.AddScoped<DeleteAliquotaHandler>();

        // Feature: Templates Packlist
        services.AddScoped<GetTemplatesHandler>();
        services.AddScoped<GetTemplateHandler>();
        services.AddScoped<CreateTemplateHandler>();
        services.AddScoped<UpdateTemplateHandler>();
        services.AddScoped<DeleteTemplateHandler>();

        // Feature: Packlists
        services.AddScoped<GetPacklistHandler>();
        services.AddScoped<CreatePacklistHandler>();
        services.AddScoped<UpdatePacklistHandler>();
        services.AddScoped<FinalizarPacklistHandler>();
        services.AddScoped<UploadPacklistHandler>();
        services.AddScoped<GetPacklistItemsHandler>();
        services.AddScoped<AddPacklistItemHandler>();
        services.AddScoped<UpdatePacklistItemHandler>();
        services.AddScoped<DeletePacklistItemHandler>();

        // Feature: Custos
        services.AddScoped<GetCustoHandler>();
        services.AddScoped<GetCustoByOrcamentoHandler>();
        services.AddScoped<CreateCustoHandler>();
        services.AddScoped<UpdateCustoHandler>();
        services.AddScoped<DeleteCustoHandler>();

        // Feature: Vendas
        services.AddScoped<GetVendaHandler>();
        services.AddScoped<GetVendaByOrcamentoHandler>();
        services.AddScoped<CreateVendaHandler>();
        services.AddScoped<UpdateVendaHandler>();
        services.AddScoped<DeleteVendaHandler>();

        // Feature: Aduanas
        services.AddScoped<GetAduanaHandler>();
        services.AddScoped<GetAduanaByOrcamentoHandler>();
        services.AddScoped<CreateAduanaHandler>();
        services.AddScoped<UpdateAduanaHandler>();
        services.AddScoped<DeleteAduanaHandler>();
        services.AddScoped<AddAduanaEventoHandler>();
        services.AddScoped<FinalizarAduanaHandler>();

        // Feature: Numerarios
        services.AddScoped<GetNumerarioHandler>();
        services.AddScoped<GetNumerariosByOrcamentoHandler>();
        services.AddScoped<CreateNumerarioHandler>();
        services.AddScoped<UpdateNumerarioHandler>();
        services.AddScoped<DeleteNumerarioHandler>();

        // Feature: Orcamentos
        services.AddScoped<GetOrcamentoHandler>();
        services.AddScoped<GetAllOrcamentosHandler>();
        services.AddScoped<CreateOrcamentoHandler>();
        services.AddScoped<UpdateOrcamentoHandler>();
        services.AddScoped<DeleteOrcamentoHandler>();
        services.AddScoped<TransicaoFaseHandler>();
        services.AddScoped<GetResumoOrcamentoHandler>();

        return services;
    }

    /// <summary>
    /// Adiciona as validações FluentValidation
    /// </summary>
    public static IServiceCollection AddValidators(this IServiceCollection services)
    {
        // Registrar validadores explicitamente
        services.AddScoped<IValidator<CreateClienteDto>, CreateClienteValidator>();
        services.AddScoped<IValidator<UpdateClienteDto>, UpdateClienteValidator>();

        // Feature: Despachantes
        services.AddScoped<IValidator<CreateDespachanteDto>, CreateDespachanteValidator>();
        services.AddScoped<IValidator<UpdateDespachanteDto>, UpdateDespachanteValidator>();

        // Feature: Portos
        services.AddScoped<IValidator<CreatePortoDto>, CreatePortoValidator>();
        services.AddScoped<IValidator<UpdatePortoDto>, UpdatePortoValidator>();

        // Feature: Aliquotas
        services.AddScoped<IValidator<CreateAliquotaDto>, CreateAliquotaValidator>();
        services.AddScoped<IValidator<UpdateAliquotaDto>, UpdateAliquotaValidator>();

        // Feature: Templates Packlist
        services.AddScoped<IValidator<CreateTemplateDto>, CreateTemplateValidator>();
        services.AddScoped<IValidator<UpdateTemplateDto>, UpdateTemplateValidator>();

        // Feature: Packlists
        services.AddScoped<IValidator<CreatePacklistDto>, CreatePacklistValidator>();
        services.AddScoped<IValidator<UpdatePacklistDto>, UpdatePacklistValidator>();
        services.AddScoped<IValidator<UploadPacklistDto>, UploadPacklistValidator>();
        services.AddScoped<IValidator<AddPacklistItemDto>, AddPacklistItemValidator>();
        services.AddScoped<IValidator<UpdatePacklistItemDto>, UpdatePacklistItemValidator>();

        // Feature: Custos
        services.AddScoped<IValidator<CreateCustoDto>, CreateCustoValidator>();
        services.AddScoped<IValidator<UpdateCustoDto>, UpdateCustoValidator>();

        // Feature: Vendas
        services.AddScoped<IValidator<CreateVendaDto>, CreateVendaValidator>();
        services.AddScoped<IValidator<UpdateVendaDto>, UpdateVendaValidator>();

        // Feature: Aduanas
        services.AddScoped<IValidator<CreateAduanaDto>, CreateAduanaValidator>();
        services.AddScoped<IValidator<UpdateAduanaDto>, UpdateAduanaValidator>();
        services.AddScoped<IValidator<AddAduanaEventoDto>, AddAduanaEventoValidator>();
        services.AddScoped<IValidator<FinalizarAduanaDto>, FinalizarAduanaValidator>();

        // Feature: Numerarios
        services.AddScoped<IValidator<CreateNumerarioDto>, CreateNumerarioValidator>();
        services.AddScoped<IValidator<UpdateNumerarioDto>, UpdateNumerarioValidator>();

        // Feature: Orcamentos
        services.AddScoped<IValidator<CreateOrcamentoDto>, CreateOrcamentoValidator>();
        services.AddScoped<IValidator<UpdateOrcamentoDto>, UpdateOrcamentoValidator>();

        return services;
    }
}
