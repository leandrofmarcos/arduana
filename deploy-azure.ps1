# Script de Deployment para Azure Web App (Linux)
# Abordagem: Direct Kudu ZipDeploy via PowerShell (Bypassing AZ CLI Upload)
# Motivo: Evita erros de compatibilidade de bibliotecas Python/Cryptography no ambiente local

# Parâmetros
$subscriptionId = "ce891a2d-3ab5-4fdf-b101-0b021d9315e5"
$resourceGroup = "pocs"
$appName = "sistemaaduaneiro"
$zipFileName = "release.zip"
$buildOutputPath = "dist\import-costs"

Write-Host "----------------------------------------------------------------"
Write-Host "Iniciando processo de deploy INTELIGENTE para $appName"
Write-Host "Método: Kudu API Direct Push"
Write-Host "----------------------------------------------------------------"

# 1. Configurar Contexto
Write-Host "`n[1/5] Verificando login Azure..." -ForegroundColor Cyan
try {
    # Apenas verifica se consegue obter o token, não força login interativo se já estiver logado
    $account = az account show --output json | ConvertFrom-Json
    Write-Host "Conectado como: $($account.user.name)" -ForegroundColor Gray
    
    if ($account.id -ne $subscriptionId) {
        Write-Host "Mudando para subscription correta..." -ForegroundColor Gray
        az account set --subscription $subscriptionId
    }
}
catch {
    Write-Host "Erro: Você precisa estar logado. Execute 'az login'." -ForegroundColor Red
    Exit 1
}

# 2. Build
Write-Host "`n[2/5] Build (npm run build)..." -ForegroundColor Cyan

if (Test-Path $buildOutputPath) { Remove-Item -Path $buildOutputPath -Recurse -Force }

cmd /c "npm run build"
if ($LASTEXITCODE -ne 0) { Write-Host "Erro no build." -ForegroundColor Red; Exit 1 }

# 3. Package.json SSR
Write-Host "`n[3/5] Configurando SSR (package.json)..." -ForegroundColor Cyan
$prodPackageJson = @{
    name = "import-costs-ssr"
    version = "1.0.0"
    scripts = @{ start = "node server/server.mjs" }
    type = "module"
}
$prodPackageJson | ConvertTo-Json | Out-File "$buildOutputPath\package.json" -Encoding UTF8

# 4. Zip
Write-Host "`n[4/5] Criando pacote ($zipFileName)..." -ForegroundColor Cyan
$zipAbsolutePath = "$PWD\$zipFileName"
if (Test-Path $zipAbsolutePath) { Remove-Item $zipAbsolutePath -Force }
Compress-Archive -Path "$buildOutputPath\*" -DestinationPath $zipAbsolutePath -Force
Write-Host "Pacote criado em: $zipAbsolutePath" -ForegroundColor Gray

# 5. Deploy via Kudu API (Robust Method)
Write-Host "`n[5/5] Enviando via Kudu API (Direct)..." -ForegroundColor Cyan

# 5.1 Obter credenciais de publicação
Write-Host "Obtendo credenciais de deploy..." -ForegroundColor Gray
$profilesJson = az webapp deployment list-publishing-profiles --resource-group $resourceGroup --name $appName --output json
$profiles = $profilesJson | ConvertFrom-Json
$zipProfile = $profiles | Where-Object { $_.publishMethod -eq "ZipDeploy" }

if (-not $zipProfile) {
    Write-Host "Erro: Perfil 'ZipDeploy' não encontrado." -ForegroundColor Red
    Exit 1
}

# 5.2 Preparar Autenticação e URL
# Importante: Para autenticação Basic Auth no Kudu, não podemos usar o 'userName' puro se ele começar com '$'.
# O padrão correto é usar as credenciais exatamente como retornadas no perfil de publicação.

$username = $zipProfile.userName
$password = $zipProfile.userPWD

# Debug (Ocultando senha)
Write-Host "Usuário de deploy: $username" -ForegroundColor Gray

$pair = "${username}:${password}"
$bytes = [System.Text.Encoding]::ASCII.GetBytes($pair)
$base64AuthInfo = [Convert]::ToBase64String($bytes)

# publishUrl vem como "hostname:443", precisamos apenas do hostname
$scmHost = $zipProfile.publishUrl.Split(":")[0]
$apiUrl = "https://$scmHost/api/zipdeploy?isAsync=true"

Write-Host "Endpoint: $apiUrl" -ForegroundColor Gray
Write-Host "Iniciando upload (pode levar alguns minutos)..." -ForegroundColor Yellow

# 5.3 Executar Upload
# Usando WebClient para ter mais controle e compatibilidade do que Invoke-RestMethod em algumas versões do PS
try {
    $webClient = New-Object System.Net.WebClient
    $webClient.Headers.Add("Authorization", "Basic $base64AuthInfo")
    $webClient.Headers.Add("Content-Type", "application/zip")
    
    # UploadData para envio binário confiável
    $responseBytes = $webClient.UploadFile($apiUrl, "POST", $zipAbsolutePath)
    $responseString = [System.Text.Encoding]::UTF8.GetString($responseBytes)
    
    Write-Host "`nSucesso! O deploy foi aceito pelo servidor." -ForegroundColor Green
    Write-Host "Resposta: $responseString" -ForegroundColor Gray
    
    Write-Host "`n----------------------------------------------------------------"
    Write-Host "Deploy finalizado. Aguarde a reinicialização do site."
    Write-Host "Acesse: https://$appName.azurewebsites.net"
    Write-Host "----------------------------------------------------------------"
}
catch {
    Write-Host "`nErro fatal no deploy via API:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.Exception.InnerException) {
            Write-Host "Detalhe Interno: $($_.Exception.InnerException.Message)" -ForegroundColor DarkRed
    }
    # Tenta ler o corpo da resposta de erro se disponível (para WebException)
    if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            Write-Host "Resposta do Servidor: $($reader.ReadToEnd())" -ForegroundColor Yellow
    }
    Exit 1
}
