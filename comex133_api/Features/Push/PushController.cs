using Microsoft.AspNetCore.Mvc;
using System.Collections.Concurrent;
using System.Text.Json;
using WebPush;

namespace Comex133Api.Features.Push;

[ApiController]
[Route("api/push")]
public class PushController : ControllerBase
{
    // Armazenamento em memória — apenas para teste funcional
    private static readonly ConcurrentBag<PushSubscriptionDto> _subscriptions = new();

    private readonly IConfiguration _configuration;
    private readonly ILogger<PushController> _logger;

    public PushController(IConfiguration configuration, ILogger<PushController> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    /// <summary>Recebe e armazena uma PushSubscription do browser.</summary>
    [HttpPost("subscribe")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public IActionResult Subscribe([FromBody] PushSubscriptionDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Endpoint) ||
            string.IsNullOrWhiteSpace(dto.Keys?.P256Dh) ||
            string.IsNullOrWhiteSpace(dto.Keys?.Auth))
        {
            return BadRequest("Subscription inválida.");
        }

        _subscriptions.Add(dto);
        _logger.LogInformation("Push subscription registrada. Total: {Count}", _subscriptions.Count);
        return Ok(new { message = "Subscription registrada." });
    }

    /// <summary>Dispara uma notificação de teste para todas as subscriptions em memória.</summary>
    [HttpPost("send-test")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> SendTest()
    {
        var subject    = _configuration["Vapid:Subject"]!;
        var publicKey  = _configuration["Vapid:PublicKey"]!;
        var privateKey = _configuration["Vapid:PrivateKey"]!;

        var vapidDetails = new VapidDetails(subject, publicKey, privateKey);
        var client       = new WebPushClient();

        var payload = JsonSerializer.Serialize(new
        {
            title = "🔔 Teste Comex133",
            body  = "Push notification funcionando com sucesso!",
            icon  = "/icons/icon-192x192.png",
            data  = new { url = "/v2/dashboard" }
        });

        var sent   = 0;
        var errors = 0;

        foreach (var sub in _subscriptions)
        {
            try
            {
                var pushSub = new PushSubscription(sub.Endpoint, sub.Keys.P256Dh, sub.Keys.Auth);
                await client.SendNotificationAsync(pushSub, payload, vapidDetails);
                sent++;
            }
            catch (WebPushException ex)
            {
                _logger.LogWarning("Falha ao enviar push para {Endpoint}: {Status}", sub.Endpoint, ex.StatusCode);
                errors++;
            }
        }

        _logger.LogInformation("Push test: {Sent} enviadas, {Errors} erros.", sent, errors);
        return Ok(new { sent, errors });
    }
}
