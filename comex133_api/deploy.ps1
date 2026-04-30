$projectPath = "c:\dev\prototipos-html\comex133_api"
$publishPath = Join-Path $projectPath "publish"
$ftpHost       = "www.comex133.com.br"
$ftpUser       = "304_leandro"
$ftpPassword   = "leandro123"
$ftpDomainPath = "viaveritascomex.com.br"
$ftpAppPath    = "wwwroot"
$targetPath    = "$ftpDomainPath/$ftpAppPath"
$offlineUri    = "ftp://$ftpHost/$targetPath/app_offline.htm"

function New-FtpRequest($uri, $method, $credentials, $usePassive = $true) {
    $request = [System.Net.FtpWebRequest]::Create($uri)
    $request.Method = $method
    $request.Credentials = $credentials
    $request.UseBinary = $true
    $request.KeepAlive = $false
    $request.UsePassive = $usePassive
    $request.EnableSsl = $false
    $request.Timeout = 60000
    $request.ReadWriteTimeout = 60000
    return $request
}

function Upload-FtpFileWithRetry($uri, $localFilePath, $credentials, $relativePath) {
    $attemptModes = @($true, $false, $true)
    $lastError = $null

    for ($attempt = 0; $attempt -lt $attemptModes.Count; $attempt++) {
        $usePassive = $attemptModes[$attempt]
        try {
            $request = New-FtpRequest $uri ([System.Net.WebRequestMethods+Ftp]::UploadFile) $credentials $usePassive

            $fileInfo = Get-Item $localFilePath
            $request.ContentLength = $fileInfo.Length

            $requestStream = $request.GetRequestStream()
            $fileStream = [System.IO.File]::OpenRead($localFilePath)
            try {
                $buffer = New-Object byte[] 81920
                while (($read = $fileStream.Read($buffer, 0, $buffer.Length)) -gt 0) {
                    $requestStream.Write($buffer, 0, $read)
                }
            } finally {
                $fileStream.Close()
                $requestStream.Close()
            }

            $response = $request.GetResponse()
            $response.Close()
            return
        } catch {
            $lastError = $_.Exception.Message
            $modeText = if ($usePassive) { "passivo" } else { "ativo" }
            Write-Host "[WARN] Tentativa $($attempt + 1) falhou para $relativePath (modo $modeText): $lastError" -ForegroundColor DarkYellow
        }
    }

    throw "Falha no upload apos multiplas tentativas. Ultimo erro: $lastError"
}

function Get-FtpListing($uri, $credentials) {
    try {
        $request = New-FtpRequest $uri ([System.Net.WebRequestMethods+Ftp]::ListDirectoryDetails) $credentials
        $response = $request.GetResponse()
        $reader = New-Object System.IO.StreamReader($response.GetResponseStream())
        $listing = $reader.ReadToEnd()
        $reader.Close()
        $response.Close()
        return $listing
    } catch { return $null }
}

function Ensure-FtpDirectory($baseUri, $folderName, $credentials) {
    $uri = "$baseUri$folderName/"
    Write-Host "Verificando: $uri" -ForegroundColor Gray
    try {
        $request = New-FtpRequest $uri ([System.Net.WebRequestMethods+Ftp]::ListDirectory) $credentials
        $request.GetResponse().Close()
    } catch {
        try {
            $request = New-FtpRequest $uri ([System.Net.WebRequestMethods+Ftp]::MakeDirectory) $credentials
            $request.GetResponse().Close()
            Write-Host "Criado: $folderName" -ForegroundColor DarkGray
        } catch {
            Write-Host "Erro criar $uri : $($_.Exception.Message)" -ForegroundColor DarkYellow
        }
    }
    return $uri
}

function Remove-FtpDirectoryRecursive($uri, $credentials) {
    Write-Host "Limpando: $uri" -ForegroundColor Magenta
    $listing = Get-FtpListing $uri $credentials
    if ([string]::IsNullOrEmpty($listing)) { return }
    $lines = $listing -split "`r`n" | Where-Object { $_ -ne "" }
    foreach ($line in $lines) {
        $parts = $line -split "\s+", 9
        if ($parts.Count -lt 9) { continue }
        $name = $parts[8]
        if ($name -eq "." -or $name -eq "..") { continue }
        $itemUri = "$uri$name"
        $isDir = $line.StartsWith("d")
        if ($isDir) {
            $itemUri = "$itemUri/"
            Remove-FtpDirectoryRecursive $itemUri $credentials
            try {
                $req = New-FtpRequest $itemUri ([System.Net.WebRequestMethods+Ftp]::RemoveDirectory) $credentials
                $req.GetResponse().Close()
            } catch { Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor DarkRed }
        } else {
            try {
                $req = New-FtpRequest $itemUri ([System.Net.WebRequestMethods+Ftp]::DeleteFile) $credentials
                $req.GetResponse().Close()
            } catch { Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor DarkRed }
        }
    }
}

function Send-FtpFile($ftpUri, $localBytes, $credentials) {
    $request = New-FtpRequest $ftpUri ([System.Net.WebRequestMethods+Ftp]::UploadFile) $credentials
    $request.ContentLength = $localBytes.Length
    $stream = $request.GetRequestStream()
    $stream.Write($localBytes, 0, $localBytes.Length)
    $stream.Close()
    $request.GetResponse().Close()
}

# 1. Clean
Write-Host "[1/5] Limpando builds anteriores..." -ForegroundColor Green
Set-Location $projectPath
dotnet clean --configuration Release | Out-Null
if ($LASTEXITCODE -ne 0) { Write-Host "Erro no dotnet clean." -ForegroundColor Red; exit 1 }

# 2. Publish
Write-Host "[2/5] Publicando .NET 8 Release (framework-dependent)..." -ForegroundColor Green
if (Test-Path $publishPath) { Remove-Item $publishPath -Recurse -Force }
dotnet publish -c Release -o "$publishPath" --self-contained false /p:EnvironmentName=Production
if ($LASTEXITCODE -ne 0) { Write-Host "Erro no dotnet publish." -ForegroundColor Red; exit 1 }
Write-Host "Publish: $publishPath" -ForegroundColor Cyan

# 3. FTP estrutura
Write-Host "[3/5] Preparando estrutura FTP..." -ForegroundColor Green
$creds    = New-Object System.Net.NetworkCredential($ftpUser, $ftpPassword)
$baseUri  = "ftp://$ftpHost/"
$level1Uri = Ensure-FtpDirectory $baseUri $ftpDomainPath $creds
$level2Uri = Ensure-FtpDirectory $level1Uri $ftpAppPath $creds
$targetUri = $level2Uri
Write-Host "Destino: $targetPath" -ForegroundColor Cyan

# 4. app_offline.htm — para o app e libera locks
Write-Host "[4/5] Parando app via app_offline.htm..." -ForegroundColor Yellow
$offlineBytes = [System.Text.Encoding]::UTF8.GetBytes("<html><body>Manutencao em andamento...</body></html>")
try {
    Send-FtpFile $offlineUri $offlineBytes $creds
    Write-Host "Aguardando IIS liberar locks (5s)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
} catch {
    Write-Host "Aviso app_offline: $($_.Exception.Message)" -ForegroundColor DarkYellow
}

# 5. Limpar e enviar
Remove-FtpDirectoryRecursive $targetUri $creds

$root  = (Resolve-Path $publishPath).Path
$items = Get-ChildItem -Path $root -Recurse -Force
Write-Host "[5/5] Enviando arquivos..." -ForegroundColor Green

$uploadedCount = 0
$skippedCount  = 0
$errorCount    = 0
$skipExtensions        = @('.pdb', '.ps1', '.md', '.http')
$skipExactFiles        = @('appsettings.Development.json')
$skipDirectoryPrefixes = @('logs/', 'bin/', 'obj/', 'publish_ftp/')

foreach ($item in $items) {
    $relativePath = $item.FullName.Substring($root.Length).TrimStart('\', '/')
    $relativePath = $relativePath.Replace("\", "/")
    if ([string]::IsNullOrWhiteSpace($relativePath)) { continue }

    $skipFile = $false
    $ext = [System.IO.Path]::GetExtension($item.Name).ToLower()
    if ($skipExtensions -contains $ext) { $skipFile = $true; $skippedCount++ }
    if (-not $skipFile -and $skipExactFiles -contains $item.Name) { $skipFile = $true; $skippedCount++ }
    if (-not $skipFile) {
        foreach ($p in $skipDirectoryPrefixes) {
            if ($relativePath -like "$p*") { $skipFile = $true; $skippedCount++; break }
        }
    }
    if ($skipFile) { continue }

    $uri = "ftp://$ftpHost/$targetPath/$relativePath"

    if ($item.PSIsContainer) {
        try {
            $request = New-FtpRequest $uri ([System.Net.WebRequestMethods+Ftp]::MakeDirectory) $creds
            $request.GetResponse().Close()
            Write-Host "Dir: $relativePath" -ForegroundColor DarkGray
        } catch {
            Write-Host "Dir ok: $relativePath" -ForegroundColor DarkGray
        }
    } else {
        try {
            Upload-FtpFileWithRetry $uri $item.FullName $creds $relativePath
            $uploadedCount++
            $kb = [math]::Round($item.Length / 1024, 2)
            Write-Host "[OK] $relativePath ($kb KB)" -ForegroundColor Green
        } catch {
            $errorCount++
            Write-Host "[ERRO] $relativePath - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# Recolocar online
Write-Host "Removendo app_offline.htm..." -ForegroundColor Yellow
try {
    $req = New-FtpRequest $offlineUri ([System.Net.WebRequestMethods+Ftp]::DeleteFile) $creds
    $req.GetResponse().Close()
    Write-Host "[OK] App online." -ForegroundColor Green
} catch {
    Write-Host "Aviso remover offline: $($_.Exception.Message)" -ForegroundColor DarkYellow
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   DEPLOY CONCLUIDO" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Enviados : $uploadedCount" -ForegroundColor Green
Write-Host "   Ignorados: $skippedCount" -ForegroundColor Gray
Write-Host "   Erros    : $errorCount" -ForegroundColor $(if ($errorCount -gt 0) { "Red" } else { "Green" })
Write-Host ""
Write-Host "Swagger: https://www.viaveritascomex.com.br/swagger" -ForegroundColor Cyan
Write-Host "API Auth: https://www.viaveritascomex.com.br/api/auth/login" -ForegroundColor Cyan
Write-Host ""
