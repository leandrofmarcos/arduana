using Comex133Api.Core.Database;
using Comex133Api.Core.Models;
using Comex133Api.Core.Exceptions;
using Comex133Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Comex133Api.Features.AgentesCarga;

public class AgentesCargaService
{
    private readonly AppDbContext _db;
    public AgentesCargaService(AppDbContext db) => _db = db;

    public async Task<PagedResult<AgenteCargaDto>> GetAllAsync(PaginationQuery pagination) =>
        await _db.AgentesCarga.OrderBy(x => x.Nome).Select(x => ToDto(x)).ToPagedResultAsync(pagination);

    public async Task<AgenteCargaDto> GetByIdAsync(int id) =>
        ToDto(await FindOrThrowAsync(id));

    public async Task<AgenteCargaDto> CreateAsync(CreateAgenteCargaRequest request)
    {
        var entity = new AgenteCarga
        {
            Nome      = request.Nome.Trim(),
            Documento = request.Documento?.Trim(),
            Pais      = request.Pais.Trim(),
            Contato   = request.Contato?.Trim()
        };
        _db.AgentesCarga.Add(entity);
        await _db.SaveChangesAsync();
        return ToDto(entity);
    }

    public async Task<AgenteCargaDto> UpdateAsync(int id, UpdateAgenteCargaRequest request)
    {
        var entity = await FindOrThrowAsync(id);
        entity.Nome      = request.Nome.Trim();
        entity.Documento = request.Documento?.Trim();
        entity.Pais      = request.Pais.Trim();
        entity.Contato   = request.Contato?.Trim();
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
        _db.AgentesCarga.Remove(entity);
        await _db.SaveChangesAsync();
    }

    private async Task<AgenteCarga> FindOrThrowAsync(int id) =>
        await _db.AgentesCarga.FindAsync(id) ?? throw new NotFoundException("Agente de Carga", id);

    private static AgenteCargaDto ToDto(AgenteCarga x) =>
        new(x.Id, x.Nome, x.Documento, x.Pais, x.Contato, x.Ativo, x.CriadoEm, x.AtualizadoEm);
}


