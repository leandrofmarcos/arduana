using Comex133Api.Core.Database;
using Comex133Api.Core.Models;
using Comex133Api.Core.Exceptions;
using Comex133Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Comex133Api.Features.Clientes;

public class ClientesService
{
    private readonly AppDbContext _db;
    public ClientesService(AppDbContext db) => _db = db;

    public async Task<PagedResult<ClienteDto>> GetAllAsync(PaginationQuery pagination) =>
        await _db.Clientes
            .OrderBy(x => x.RazaoSocial)
            .Select(x => new ClienteDto(
                x.Id,
                x.RazaoSocial ?? string.Empty,
                x.Cnpj,
                x.Email,
                x.Telefone,
                x.Ativo,
                EF.Property<DateTime?>(x, nameof(Cliente.CriadoEm)) ?? DateTime.UnixEpoch,
                EF.Property<DateTime?>(x, nameof(Cliente.AtualizadoEm)) ?? DateTime.UnixEpoch
            ))
            .ToPagedResultAsync(pagination);

    public async Task<ClienteDto> GetByIdAsync(int id) =>
        ToDto(await FindOrThrowAsync(id));

    public async Task<ClienteDto> CreateAsync(CreateClienteRequest request)
    {
        var entity = new Cliente
        {
            RazaoSocial = request.RazaoSocial.Trim(),
            Cnpj        = request.Cnpj?.Trim(),
            Email       = request.Email?.Trim().ToLowerInvariant(),
            Telefone    = request.Telefone?.Trim()
        };
        _db.Clientes.Add(entity);
        await _db.SaveChangesAsync();
        return ToDto(entity);
    }

    public async Task<ClienteDto> UpdateAsync(int id, UpdateClienteRequest request)
    {
        var entity = await FindOrThrowAsync(id);
        entity.RazaoSocial = request.RazaoSocial.Trim();
        entity.Cnpj        = request.Cnpj?.Trim();
        entity.Email       = request.Email?.Trim().ToLowerInvariant();
        entity.Telefone    = request.Telefone?.Trim();
        await _db.SaveChangesAsync();
        return ToDto(entity);
    }

    public async Task SetAtivoAsync(int id, bool ativo)
    {
        var entity = await FindOrThrowAsync(id);
        entity.Ativo = ativo;
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await FindOrThrowAsync(id);
        _db.Clientes.Remove(entity);
        await _db.SaveChangesAsync();
    }

    private async Task<Cliente> FindOrThrowAsync(int id) =>
        await _db.Clientes.FindAsync(id) ?? throw new NotFoundException("Cliente", id);

    private static ClienteDto ToDto(Cliente x) =>
        new(x.Id, x.RazaoSocial, x.Cnpj, x.Email, x.Telefone, x.Ativo, x.CriadoEm, x.AtualizadoEm);
}


