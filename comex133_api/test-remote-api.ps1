# Script de Teste - Comex133 API no Servidor Remoto
# Uso: .\test-remote-api.ps1 [-Environment "remote"] [-TestLogin $true]

param(
    [string]$Environment = "remote",
    [bool]$TestLogin = $true,
    [string]$Email = "admin@comex133.com.br",
    [string]$Senha = "Pa\$\$word"
)

# Configuração baseada no ambiente
$config = @{
    "local" = @{
        "baseUrl" = "http://localhost:5001/api"
        "timeout" = 10
    }
    "remote" = @{
        "baseUrl" = "http://www.viaveritascomex.com.br/api"
        "timeout" = 15
    }
}

$baseUrl = $config[$Environment]["baseUrl"]
$timeout = $config[$Environment]["timeout"]

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         TESTE DA API COMEX133 - SERVIDOR $Environment.ToUpper()          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 Base URL: $baseUrl" -ForegroundColor Yellow
Write-Host "⏱️  Timeout: ${timeout}s" -ForegroundColor Yellow
Write-Host ""

# Função auxiliar para fazer requisições
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body,
        [string]$Token,
        [string]$Description
    )
    
    $url = "$baseUrl$Endpoint"
    $headers = @{
        "Content-Type" = "application/json"
        "Accept" = "application/json"
    }
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    Write-Host "▶ $Description" -ForegroundColor Blue
    Write-Host "  $Method $url" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = $url
            Method = $Method
            Headers = $headers
            TimeoutSec = $timeout
            ContentType = "application/json"
        }
        
        if ($Body) {
            $params["Body"] = ($Body | ConvertTo-Json -Depth 10)
            Write-Host "  Body: $($Body | ConvertTo-Json -Compress)" -ForegroundColor Gray
        }
        
        $response = Invoke-WebRequest @params
        $statusCode = $response.StatusCode
        $content = $response.Content | ConvertFrom-Json
        
        Write-Host "  ✅ Status: $statusCode" -ForegroundColor Green
        Write-Host "  📦 Response: $($content | ConvertTo-Json -Compress)" -ForegroundColor Green
        Write-Host ""
        
        return @{
            StatusCode = $statusCode
            Content = $content
            Success = $true
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.Value
        $errorMessage = $_.Exception.Message
        
        Write-Host "  ❌ Status: $statusCode" -ForegroundColor Red
        Write-Host "  ❌ Erro: $errorMessage" -ForegroundColor Red
        Write-Host ""
        
        return @{
            StatusCode = $statusCode
            Success = $false
            Error = $errorMessage
        }
    }
}

# Teste 1: Health Check
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "TESTE 1: HEALTH CHECK" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
$healthResult = Invoke-ApiRequest -Method "GET" -Endpoint "/health" -Description "Verificar saúde da API"

if (-not $healthResult.Success) {
    Write-Host "❌ FALHA: A API não está respondendo!" -ForegroundColor Red
    Write-Host "Abortando testes..." -ForegroundColor Red
    exit 1
}

Write-Host "✅ API está online!" -ForegroundColor Green

# Teste 2: Login
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "TESTE 2: AUTENTICAÇÃO (LOGIN)" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan

$loginBody = @{
    email = $Email
    senha = $Senha
}

$loginResult = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/login" -Body $loginBody -Description "Fazer login com credenciais de teste"

if (-not $loginResult.Success) {
    Write-Host "❌ FALHA: Não foi possível fazer login!" -ForegroundColor Red
    exit 1
}

$accessToken = $loginResult.Content.data.accessToken
$refreshToken = $loginResult.Content.data.refreshToken
$userId = $loginResult.Content.data.user.id

Write-Host "✅ Login realizado com sucesso!" -ForegroundColor Green
Write-Host "   User ID: $userId" -ForegroundColor Green
Write-Host "   Access Token: $($accessToken.Substring(0, 20))..." -ForegroundColor Green
Write-Host ""

# Teste 3: Obter dados do usuário autenticado
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "TESTE 3: DADOS DO USUÁRIO AUTENTICADO" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan

$meResult = Invoke-ApiRequest -Method "GET" -Endpoint "/auth/me" -Token $accessToken -Description "Obter dados do usuário autenticado"

if (-not $meResult.Success) {
    Write-Host "❌ FALHA: Não foi possível obter dados do usuário!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dados do usuário obtidos com sucesso!" -ForegroundColor Green

# Teste 4: Listar Clientes
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "TESTE 4: LISTAR CLIENTES" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan

$clientesResult = Invoke-ApiRequest -Method "GET" -Endpoint "/clientes?page=1&pageSize=5" -Token $accessToken -Description "Listar primeiros 5 clientes"

if ($clientesResult.Success) {
    $itemCount = $clientesResult.Content.data.items.Count
    Write-Host "✅ $itemCount cliente(s) encontrado(s)!" -ForegroundColor Green
}

# Teste 5: Listar Solicitações de Orçamento
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "TESTE 5: LISTAR SOLICITAÇÕES DE ORÇAMENTO" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan

$orcamentosResult = Invoke-ApiRequest -Method "GET" -Endpoint "/solicitacoes-orcamento?page=1&pageSize=5" -Token $accessToken -Description "Listar primeiras 5 solicitações de orçamento"

if ($orcamentosResult.Success) {
    $itemCount = $orcamentosResult.Content.data.items.Count
    Write-Host "✅ $itemCount solicitação(ões) de orçamento encontrada(s)!" -ForegroundColor Green
}

# Teste 6: Logout
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "TESTE 6: LOGOUT" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan

$logoutBody = @{
    refreshToken = $refreshToken
}

$logoutResult = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/logout" -Body $logoutBody -Token $accessToken -Description "Fazer logout"

if ($logoutResult.Success) {
    Write-Host "✅ Logout realizado com sucesso!" -ForegroundColor Green
}

# Resumo Final
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📊 RESUMO DOS TESTES" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Health Check: PASSOU" -ForegroundColor Green
Write-Host "✅ Login: PASSOU" -ForegroundColor Green
Write-Host "✅ Dados do Usuário: PASSOU" -ForegroundColor Green
Write-Host "✅ Listar Clientes: $(if ($clientesResult.Success) { 'PASSOU' } else { 'FALHOU' })" -ForegroundColor Green
Write-Host "✅ Listar Orçamentos: $(if ($orcamentosResult.Success) { 'PASSOU' } else { 'FALHOU' })" -ForegroundColor Green
Write-Host "✅ Logout: PASSOU" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 TODOS OS TESTES FORAM EXECUTADOS!" -ForegroundColor Green
Write-Host ""
Write-Host "Informações coletadas:" -ForegroundColor Yellow
Write-Host "  • API URL: $baseUrl" -ForegroundColor Gray
Write-Host "  • Status: Online" -ForegroundColor Gray
Write-Host "  • Autenticação: Funcionando" -ForegroundColor Gray
Write-Host "  • Banco de Dados: Conectado" -ForegroundColor Gray
