using ClosedXML.Excel;
using Comex133Api.Core.Auth;
using Comex133Api.Core.Database;
using Comex133Api.Core.Exceptions;
using Comex133Api.Core.Models;
using Comex133Api.Domain.Entities;
using Comex133Api.Infrastructure.Storage;
using Microsoft.EntityFrameworkCore;
using System.Text;
using System.Text.Json;

namespace Comex133Api.Features.Packlist;

public class PacklistService
{
    private readonly AppDbContext _db;
    private readonly IStorageService _storage;
    private readonly IWebHostEnvironment _env;
    private readonly ICurrentUserContext _user;

    private static readonly string[] AllowedExtensions = [".csv", ".xlsx", ".xls"];

    public PacklistService(
        AppDbContext db,
        IStorageService storage,
        IWebHostEnvironment env,
        ICurrentUserContext user)
    {
        _db      = db;
        _storage = storage;
        _env     = env;
        _user    = user;
    }

    // ── Passo 1: salvar arquivo e detectar colunas ────────────────────────────

    public async Task<UploadPacklistResponse> UploadAsync(
        IFormFile file,
        int solicitacaoId,
        CancellationToken ct = default)
    {
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(ext))
            throw new BusinessException("Formato inválido. Envie um arquivo .csv, .xlsx ou .xls.");

        if (file.Length > 10 * 1024 * 1024)
            throw new BusinessException("Arquivo excede o limite de 10 MB.");

        _ = await _db.SolicitacoesOrcamento.FindAsync([solicitacaoId], ct)
            ?? throw new NotFoundException("Solicitação de Orçamento", solicitacaoId);

        // Remover packlist anterior se já existir para esta solicitação
        var anterior = await _db.Packlists
            .Include(p => p.Itens)
            .FirstOrDefaultAsync(p => p.SolicitacaoOrcamentoId == solicitacaoId, ct);

        if (anterior is not null)
        {
            await _storage.DeleteAsync(anterior.CaminhoArquivo, ct);
            _db.Packlists.Remove(anterior);
            await _db.SaveChangesAsync(ct);
        }

        // Salvar o arquivo no storage
        var stored = await _storage.SaveAsync(file, "packlist", ct);

        // Parsear o arquivo para detectar colunas e merges
        var parsed = await ParseArquivoAsync(file, ext, ct);

        var packlist = new Domain.Entities.Packlist
        {
            SolicitacaoOrcamentoId = solicitacaoId,
            NomeArquivo            = file.FileName,
            ExtensaoArquivo        = ext.TrimStart('.'),
            CaminhoArquivo         = stored.RelativePath,
            TotalLinhas            = parsed.TotalLinhas,
            TemCelulasMescladas    = parsed.TemCelulasMescladas,
            DataUpload             = DateTime.UtcNow,
            UploadPorUsuarioId     = _user.UsuarioId,
        };

        _db.Packlists.Add(packlist);
        await _db.SaveChangesAsync(ct);

        return new UploadPacklistResponse(
            PacklistId:          packlist.Id,
            NomeArquivo:         packlist.NomeArquivo,
            TemCelulasMescladas: packlist.TemCelulasMescladas,
            Colunas:             parsed.Colunas,
            TotalLinhas:         packlist.TotalLinhas
        );
    }

    // ── Passo 2: salvar mapeamento e importar linhas ──────────────────────────

    public async Task<PacklistDto> SaveMapeamentoAsync(
        int packlistId,
        SaveMapeamentoRequest request,
        CancellationToken ct = default)
    {
        var packlist = await _db.Packlists.FindAsync([packlistId], ct)
            ?? throw new NotFoundException("Packlist", packlistId);

        if (packlist.TemCelulasMescladas)
            throw new BusinessException("Este arquivo contém células mescladas e não pode ser mapeado. Faça o download e corrija o arquivo.");

        packlist.ColunaNCM        = string.IsNullOrWhiteSpace(request.ColunaNCM)        ? null : request.ColunaNCM.Trim();
        packlist.ColunaDescricao  = string.IsNullOrWhiteSpace(request.ColunaDescricao)  ? null : request.ColunaDescricao.Trim();
        packlist.ColunaPreco      = string.IsNullOrWhiteSpace(request.ColunaPreco)      ? null : request.ColunaPreco.Trim();

        // Reimportar itens com o novo mapeamento
        await _db.PacklistItens
            .Where(i => i.PacklistId == packlistId)
            .ExecuteDeleteAsync(ct);

        var filePath = ResolvePhysicalPath(packlist.CaminhoArquivo);
        if (File.Exists(filePath))
        {
            var ext   = "." + packlist.ExtensaoArquivo.ToLowerInvariant();
            var itens = await ImportarItensAsync(filePath, ext, packlist, ct);
            packlist.TotalLinhas = itens.Count;
            _db.PacklistItens.AddRange(itens);
        }

        await _db.SaveChangesAsync(ct);
        return ToDto(packlist);
    }

    // ── Leitura ───────────────────────────────────────────────────────────────

    public async Task<PacklistDto?> GetBySolicitacaoAsync(int solicitacaoId, CancellationToken ct = default)
    {
        var packlist = await _db.Packlists
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.SolicitacaoOrcamentoId == solicitacaoId, ct);

        return packlist is null ? null : ToDto(packlist);
    }

    public async Task<PagedResult<PacklistItemDto>> GetItensAsync(
        int packlistId,
        PaginationQuery pagination,
        string? filtroNcm = null,
        CancellationToken ct = default)
    {
        _ = await _db.Packlists.FindAsync([packlistId], ct)
            ?? throw new NotFoundException("Packlist", packlistId);

        var query = _db.PacklistItens
            .AsNoTracking()
            .Where(i => i.PacklistId == packlistId);

        if (!string.IsNullOrWhiteSpace(filtroNcm))
            query = query.Where(i => i.NCM != null && i.NCM.Contains(filtroNcm));

        return await query
            .OrderBy(i => i.NumeroLinha)
            .Select(i => new PacklistItemDto(i.Id, i.NumeroLinha, i.DadosJson, i.NCM, i.Descricao, i.Preco))
            .ToPagedResultAsync(pagination, ct);
    }

    public async Task<(string PhysicalPath, string NomeArquivo)?> GetArquivoAsync(int packlistId, CancellationToken ct = default)
    {
        var packlist = await _db.Packlists
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == packlistId, ct)
            ?? throw new NotFoundException("Packlist", packlistId);

        var path = ResolvePhysicalPath(packlist.CaminhoArquivo);
        if (!File.Exists(path)) return null;

        return (path, packlist.NomeArquivo);
    }

    public async Task DeleteAsync(int packlistId, CancellationToken ct = default)
    {
        var packlist = await _db.Packlists.FindAsync([packlistId], ct)
            ?? throw new NotFoundException("Packlist", packlistId);

        await _storage.DeleteAsync(packlist.CaminhoArquivo, ct);
        _db.Packlists.Remove(packlist);
        await _db.SaveChangesAsync(ct);
    }

    // ── Helpers de parse ─────────────────────────────────────────────────────

    private record ParseResult(
        bool TemCelulasMescladas,
        IReadOnlyList<string> Colunas,
        int TotalLinhas
    );

    private static async Task<ParseResult> ParseArquivoAsync(IFormFile file, string ext, CancellationToken ct)
    {
        await using var stream = file.OpenReadStream();

        if (ext == ".xlsx" || ext == ".xls")
            return ParseXlsx(stream);

        return await ParseCsvAsync(stream, ct);
    }

    private static ParseResult ParseXlsx(Stream stream)
    {
        using var wb    = new XLWorkbook(stream);
        var sheet = wb.Worksheet(1);

        if (sheet.MergedRanges.Any())
            return new ParseResult(true, [], 0);

        var headerRow = sheet.Row(1);
        var colunas   = headerRow.CellsUsed()
            .Select((c, i) => string.IsNullOrWhiteSpace(c.GetString()) ? $"Coluna {i + 1}" : c.GetString().Trim())
            .ToList();

        var totalLinhas = Math.Max(0, (sheet.LastRowUsed()?.RowNumber() ?? 1) - 1);

        return new ParseResult(false, colunas, totalLinhas);
    }

    private static async Task<ParseResult> ParseCsvAsync(Stream stream, CancellationToken ct)
    {
        using var reader = new StreamReader(stream, Encoding.UTF8);
        var headerLine   = await reader.ReadLineAsync(ct);

        if (string.IsNullOrWhiteSpace(headerLine))
            return new ParseResult(false, [], 0);

        var colunas    = SplitCsvLine(headerLine);
        var totalLinhas = 0;
        while (await reader.ReadLineAsync(ct) is not null)
            totalLinhas++;

        return new ParseResult(false, colunas, totalLinhas);
    }

    private async Task<List<PacklistItem>> ImportarItensAsync(
        string filePath,
        string ext,
        Domain.Entities.Packlist packlist,
        CancellationToken ct)
    {
        await using var stream = File.OpenRead(filePath);

        if (ext == ".xlsx" || ext == ".xls")
            return ImportarXlsx(stream, packlist);

        return await ImportarCsvAsync(stream, packlist, ct);
    }

    private static List<PacklistItem> ImportarXlsx(Stream stream, Domain.Entities.Packlist packlist)
    {
        using var wb    = new XLWorkbook(stream);
        var sheet = wb.Worksheet(1);

        var headerRow = sheet.Row(1);
        var colunas   = headerRow.CellsUsed()
            .Select((c, i) => string.IsNullOrWhiteSpace(c.GetString()) ? $"Coluna {i + 1}" : c.GetString().Trim())
            .ToList();

        var itens = new List<PacklistItem>();
        var linhaNum = 0;

        foreach (var row in sheet.RowsUsed().Skip(1))
        {
            linhaNum++;
            var dict = new Dictionary<string, string?>();

            for (var i = 0; i < colunas.Count; i++)
            {
                var cell = row.Cell(i + 1);
                dict[colunas[i]] = cell.IsEmpty() ? null : cell.GetString();
            }

            if (dict.Values.All(v => v is null)) continue;

            itens.Add(BuildItem(packlist, linhaNum, dict));
        }

        return itens;
    }

    private static async Task<List<PacklistItem>> ImportarCsvAsync(
        Stream stream,
        Domain.Entities.Packlist packlist,
        CancellationToken ct)
    {
        using var reader = new StreamReader(stream, Encoding.UTF8);
        var headerLine   = await reader.ReadLineAsync(ct);

        if (string.IsNullOrWhiteSpace(headerLine))
            return [];

        var colunas  = SplitCsvLine(headerLine);
        var itens    = new List<PacklistItem>();
        var linhaNum = 0;

        string? line;
        while ((line = await reader.ReadLineAsync(ct)) is not null)
        {
            linhaNum++;
            if (string.IsNullOrWhiteSpace(line)) continue;

            var valores = SplitCsvLine(line);
            var dict    = new Dictionary<string, string?>();

            for (var i = 0; i < colunas.Count; i++)
                dict[colunas[i]] = i < valores.Count ? (string.IsNullOrEmpty(valores[i]) ? null : valores[i]) : null;

            itens.Add(BuildItem(packlist, linhaNum, dict));
        }

        return itens;
    }

    private static PacklistItem BuildItem(
        Domain.Entities.Packlist packlist,
        int linhaNum,
        Dictionary<string, string?> dict)
    {
        var item = new PacklistItem
        {
            PacklistId  = packlist.Id,
            NumeroLinha = linhaNum,
            DadosJson   = JsonSerializer.Serialize(dict),
        };

        if (packlist.ColunaNCM is not null && dict.TryGetValue(packlist.ColunaNCM, out var ncm))
            item.NCM = ncm?.Trim();

        if (packlist.ColunaDescricao is not null && dict.TryGetValue(packlist.ColunaDescricao, out var desc))
            item.Descricao = desc?.Trim();

        if (packlist.ColunaPreco is not null && dict.TryGetValue(packlist.ColunaPreco, out var precoStr))
        {
            if (decimal.TryParse(precoStr?.Replace(',', '.'),
                    System.Globalization.NumberStyles.Any,
                    System.Globalization.CultureInfo.InvariantCulture, out var preco))
                item.Preco = preco;
        }

        return item;
    }

    private static List<string> SplitCsvLine(string line)
    {
        var result  = new List<string>();
        var current = new StringBuilder();
        var inQuotes = false;

        for (var i = 0; i < line.Length; i++)
        {
            var c = line[i];
            if (c == '"')
            {
                if (inQuotes && i + 1 < line.Length && line[i + 1] == '"')
                {
                    current.Append('"');
                    i++;
                }
                else inQuotes = !inQuotes;
            }
            else if (c == ',' && !inQuotes)
            {
                result.Add(current.ToString());
                current.Clear();
            }
            else current.Append(c);
        }

        result.Add(current.ToString());
        return result;
    }

    private string ResolvePhysicalPath(string relativePath)
    {
        var webRoot = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
        return Path.Combine(webRoot, relativePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
    }

    private static PacklistDto ToDto(Domain.Entities.Packlist p) => new(
        p.Id, p.SolicitacaoOrcamentoId, p.NomeArquivo, p.ExtensaoArquivo,
        p.TotalLinhas, p.ColunaNCM, p.ColunaDescricao, p.ColunaPreco,
        p.TemCelulasMescladas, p.DataUpload, p.CriadoEm, p.AtualizadoEm
    );
}
