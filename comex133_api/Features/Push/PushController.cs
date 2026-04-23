using System.Collections.Concurrent;
using System.Security.Claims;
using System.Text.Json;
using Comex133Api.Core.Database;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebPush;

namespace Comex133Api.Features.Push;

[ApiController]
[Route("api/push")]
public class PushController : ControllerBase
{
    // UserId -> StoredSubscription (em memoria; reinicia ao reiniciar a API)
    private static readonly ConcurrentDictionary<string, StoredSubscription> _subscriptions = new();

    private readonly IConfiguration _configuration;
    private readonly AppDbContext   _db;
    private readonly ILogger<PushController> _logger;

    public PushController(IConfiguration configuration, AppDbContext db, ILogger<PushController> logger)
    {
        _configuration = configuration;
        _db            = db;
        _logger        = logger;
    }

    // Helpers

    private (WebPushClient client, VapidDetails vapid) BuildClient()
    {
        var subject    = _configuration["Vapid:Subject"]!;
        var publicKey  = _configuration["Vapid:PublicKey"]!;
        var privateKey = _configuration["Vapid:PrivateKey"]!;
        return (new WebPushClient(), new VapidDetails(subject, publicKey, privateKey));
    }

    private async Task<(int sent, int errors)> DispatchAsync(
        IEnumerable<StoredSubscription> targets,
        string title,
        string message)
    {
        var (client, vapid) = BuildClient();
        var payload = JsonSerializer.Serialize(new
        {
            title,
            body  = message,
            icon  = "/icons/icon-192x192.png",
            badge = "/icons/icon-72x72.png",
            data  = new { url = "/v2/dashboard" }
        });

        var sent   = 0;
        var errors = 0;

        foreach (var sub in targets)
        {
            try
            {
                var pushSub = new PushSubscription(sub.Endpoint, sub.Keys.P256Dh, sub.Keys.Auth);
                await client.SendNotificationAsync(pushSub, payload, vapid);
                sent++;
            }
            catch (WebPushException ex)
            {
                _logger.LogWarning(
                    "Falha ao enviar push para usuario {UserId}: {Status}",
                    sub.UserId, ex.StatusCode);
                if ((int)ex.StatusCode == 410)
                    _subscriptions.TryRemove(sub.UserId, out _);
                errors++;
            }
        }

        return (sent, errors);
    }

    // Endpoints

    /// <summary>Registra a subscription do browser, associando-a ao usuario autenticado.</summary>
    [HttpPost("subscribe")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public IActionResult Subscribe([FromBody] PushSubscriptionDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Endpoint) ||
            string.IsNullOrWhiteSpace(dto.Keys?.P256Dh) ||
            string.IsNullOrWhiteSpace(dto.Keys?.Auth))
        {
            return BadRequest(new { error = "Subscription invalida." });
        }

        var userId    = User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? User.FindFirstValue("sub")
                     ?? "anonymous";
        var userEmail = User.FindFirstValue(ClaimTypes.Email)
                     ?? User.FindFirstValue("email")
                     ?? userId;

        var stored = new StoredSubscription(dto.Endpoint, dto.Keys, userId, userEmail);
        _subscriptions[userId] = stored;

        _logger.LogInformation(
            "Push subscription registrada: userId={UserId}, total={Count}",
            userId, _subscriptions.Count);

        return Ok(new { message = "Subscription registrada." });
    }

    /// <summary>Envia notificacao com targeting: all | user | role.</summary>
    [HttpPost("send")]
    [Authorize(Roles = "Administrador")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Send([FromBody] SendPushRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Title) || string.IsNullOrWhiteSpace(request.Message))
            return BadRequest(new { error = "Title e Message sao obrigatorios." });

        IEnumerable<StoredSubscription> targets;
        switch (request.TargetType)
        {
            case "all":
                targets = _subscriptions.Values;
                break;
            case "user":
                targets = _subscriptions.Values.Where(s => s.UserId == request.TargetId);
                break;
            case "role":
                targets = await GetSubscriptionsByRoleAsync(request.TargetId);
                break;
            default:
                return BadRequest(new { error = "targetType invalido. Use: all | user | role" });
        }

        var (sent, errors) = await DispatchAsync(targets, request.Title, request.Message);
        _logger.LogInformation("Push send: {Sent} enviadas, {Errors} erros. Target={TargetType}", sent, errors, request.TargetType);
        return Ok(new { sent, errors });
    }

    /// <summary>Compatibilidade com Fase 4: envia para todas as subscriptions.</summary>
    [HttpPost("send-test")]
    [Authorize(Roles = "Administrador")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> SendTest()
    {
        var (sent, errors) = await DispatchAsync(
            _subscriptions.Values,
            "Teste Comex133",
            "Push notification funcionando com sucesso!");
        _logger.LogInformation("Push test: {Sent} enviadas, {Errors} erros.", sent, errors);
        return Ok(new { sent, errors });
    }

    /// <summary>Lista usuarios com subscription ativa.</summary>
    [HttpGet("subscriptions")]
    [Authorize(Roles = "Administrador")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult GetSubscriptions()
    {
        var result = _subscriptions.Values
            .Select(s => new SubscriptionUserDto(s.UserId, s.UserEmail))
            .OrderBy(s => s.UserEmail)
            .ToList();
        return Ok(result);
    }

    private async Task<IEnumerable<StoredSubscription>> GetSubscriptionsByRoleAsync(string? roleName)
    {
        if (string.IsNullOrWhiteSpace(roleName))
            return Enumerable.Empty<StoredSubscription>();

        var userIds = await _db.UsuarioRoles
            .Where(ur => ur.Role.Nome == roleName)
            .Select(ur => ur.UsuarioId.ToString())
            .ToListAsync();

        return _subscriptions.Values.Where(s => userIds.Contains(s.UserId));
    }
}
