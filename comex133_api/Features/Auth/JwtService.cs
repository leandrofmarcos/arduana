using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Comex133Api.Domain.Entities;
using Microsoft.IdentityModel.Tokens;

namespace Comex133Api.Features.Auth;

public class JwtService
{
    private readonly IConfiguration _configuration;

    public JwtService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public (string Token, DateTime ExpiresAt) GenerateAccessToken(Usuario usuario, IEnumerable<string> roles)
    {
        var secret   = _configuration["Jwt:Secret"]!;
        var issuer   = _configuration["Jwt:Issuer"]!;
        var audience = _configuration["Jwt:Audience"]!;
        var minutes  = int.Parse(_configuration["Jwt:AccessTokenExpirationMinutes"]!);

        var key        = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds      = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiresAt  = DateTime.UtcNow.AddMinutes(minutes);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub,   usuario.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, usuario.Email),
            new(JwtRegisteredClaimNames.Name,  usuario.NomeCompleto),
            new(JwtRegisteredClaimNames.Jti,   Guid.NewGuid().ToString()),
        };

        foreach (var role in roles)
            claims.Add(new Claim(ClaimTypes.Role, role));

        var token = new JwtSecurityToken(
            issuer:    issuer,
            audience:  audience,
            claims:    claims,
            expires:   expiresAt,
            signingCredentials: creds);

        return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
    }

    public string GenerateRefreshToken()
    {
        var bytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(bytes);
        return Convert.ToBase64String(bytes);
    }

    public ClaimsPrincipal? ValidateAccessToken(string token)
    {
        var secret   = _configuration["Jwt:Secret"]!;
        var issuer   = _configuration["Jwt:Issuer"]!;
        var audience = _configuration["Jwt:Audience"]!;

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var handler = new JwtSecurityTokenHandler();

        try
        {
            var principal = handler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey         = key,
                ValidateIssuer           = true,
                ValidIssuer              = issuer,
                ValidateAudience         = true,
                ValidAudience            = audience,
                ValidateLifetime         = false // usado apenas para extrair claims no refresh
            }, out _);
            return principal;
        }
        catch
        {
            return null;
        }
    }
}
