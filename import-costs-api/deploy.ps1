$projectPath = "c:\dev\prototipos-html\import-costs-api"
$publishPath = Join-Path $projectPath "publish"
$ftpHost       = "www.comex133.com.br"
$ftpUser       = "304_leandro"
$ftpPassword   = "leandro123"
$ftpDomainPath = "viaveritascomex.com.br"
$ftpAppPath    = "wwwroot"
$targetPath    = "$ftpDomainPath/$ftpAppPath"
$offlineUri    = "ftp://$ftpHost/$targetPath/app_offline.htm"

function Get-FtpListing($uri, $credentials) {
    try {
        $request = [System.Net.FtpWebRequest]::Create($uri)
        $request.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectoryDetails
        $request.Credentials = $credentials
        $request.UseBinary = $true
        $request.KeepAlive = $false
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
        $request = [System.Net.FtpWebRequest]::Create($uri)
        $request.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
        $request.Credentials = $credentials
        $request.GetResponse().Close()
    } catch {
        try {
            $request = [System.Net.FtpWebRequest]::Create($uri)
            $request.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
            $request.Credentials = $credentials
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
                $req = [System.Net.FtpWebRequest]::Create($itemUri)
                $req.Method = [System.Net.WebRequestMethods+Ftp]::RemoveDirectory
                $req.Credentials = $credentials
                $req.KeepAlive = $false
                $req.GetResponse().Close()
            } catch { Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor DarkRed }
        } else {
            try {
                $req = [System.Net.FtpWebRequest]::Create($itemUri)
                $req.Method = [System.Net.WebRequestMethods+Ftp]::DeleteFile
                $req.Credentials = $credentials
                $req.KeepAlive = $false
                $req.GetResponse().Close()
            } catch { Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor DarkRed }
        }
    }
}

function Send-FtpFile($ftpUri, $localBytes, $credentials) {
    $request = [System.Net.FtpWebRequest]::Create($ftpUri)
    $request.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
    $request.Credentials = $credentials
    $request.UseBinary = $true
    $request.KeepAlive = $false
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

# 4. app_offline.htm - para o app e libera locks
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
            $request = [System.Net.FtpWebRequest]::Create($uri)
            $request.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
            $request.Credentials = $creds
            $request.UseBinary = $true
            $request.KeepAlive = $false
            $request.GetResponse().Close()
            Write-Host "Dir: $relativePath" -ForegroundColor DarkGray
        } catch {
            Write-Host "Dir ok: $relativePath" -ForegroundColor DarkGray
        }
    } else {
        try {
            $bytes = [System.IO.File]::ReadAllBytes($item.FullName)
            Send-FtpFile $uri $bytes $creds
            $uploadedCount++
            $kb = [math]::Round($bytes.Length / 1024, 2)
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
    $req = [System.Net.FtpWebRequest]::Create($offlineUri)
    $req.Method = [System.Net.WebRequestMethods+Ftp]::DeleteFile
    $req.Credentials = $creds
    $req.KeepAlive = $false
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
Write-Host "URL: http://www.viaveritascomex.com.br/swagger" -ForegroundColor Cyan
Write-Host ""
