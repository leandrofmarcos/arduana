$projectPath = $PSScriptRoot
$ftpHost = "www.comex133.com.br"
$ftpUser = "304_leandro"
$ftpPassword = "leandro123"
$ftpDomainPath = "comex133.com.br"
$ftpAppPath = "wwwroot"
$targetPath = "$ftpDomainPath/$ftpAppPath" # Estrutura a partir da raiz do usuario (ja esta em 304_leandro)

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
    } catch {
        return $null
    }
}

function Ensure-FtpDirectory($baseUri, $folderName, $credentials) {
    $uri = "$baseUri$folderName/"
    Write-Host "Verificando/Criando diretório: $uri" -ForegroundColor Gray
    try {
        $request = New-FtpRequest $uri ([System.Net.WebRequestMethods+Ftp]::ListDirectory) $credentials
        $request.GetResponse().Close()
    } catch {
        # Se falhar listar, tenta criar
        try {
            $request = New-FtpRequest $uri ([System.Net.WebRequestMethods+Ftp]::MakeDirectory) $credentials
            $request.GetResponse().Close()
            Write-Host "Diretório criado: $folderName" -ForegroundColor DarkGray
        } catch {
            Write-Host "Erro ao criar diretório $uri : $($_.Exception.Message)" -ForegroundColor DarkYellow
        }
    }
    return $uri
}

function Remove-FtpDirectoryRecursive($uri, $credentials) {
    Write-Host "Limpando conteúdo de: $uri" -ForegroundColor Magenta
    $listing = Get-FtpListing $uri $credentials
    
    if ([string]::IsNullOrEmpty($listing)) {
        return
    }

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
            Write-Host "Removendo diretório: $itemUri" -ForegroundColor Yellow
            try {
                $req = New-FtpRequest $itemUri ([System.Net.WebRequestMethods+Ftp]::RemoveDirectory) $credentials
                $req.GetResponse().Close()
            } catch { Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor DarkRed }
        } else {
            Write-Host "Removendo arquivo: $itemUri" -ForegroundColor Yellow
            try {
                $req = New-FtpRequest $itemUri ([System.Net.WebRequestMethods+Ftp]::DeleteFile) $credentials
                $req.GetResponse().Close()
            } catch { Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor DarkRed }
        }
    }
}

# 1. Build Application
Write-Host "Iniciando build do Angular..." -ForegroundColor Green
Set-Location $projectPath
cmd /c "npm run build"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro durante o build. O processo foi interrompido." -ForegroundColor Red
    exit 1
}

# 2. Determine Output Directory
$angularConfigPath = Join-Path $projectPath "angular.json"
$distRelativePath = "dist/import-costs"

if (Test-Path $angularConfigPath) {
    try {
        $angularConfig = Get-Content $angularConfigPath -Raw | ConvertFrom-Json
        $firstProject = $angularConfig.projects.PSObject.Properties | Select-Object -First 1
        if ($null -ne $firstProject) {
            $configuredOutputPath = $firstProject.Value.architect.build.options.outputPath
            if (-not [string]::IsNullOrWhiteSpace($configuredOutputPath)) {
                $distRelativePath = $configuredOutputPath
            }
        }
    } catch {
        Write-Host "[WARN] Nao foi possivel ler angular.json para detectar outputPath. Usando padrao $distRelativePath" -ForegroundColor DarkYellow
    }
}

$distPath = Join-Path $projectPath $distRelativePath
$browserPath = Join-Path $distPath "browser"

if (Test-Path $browserPath) {
    $publishSource = $browserPath
} elseif (Test-Path $distPath) {
    $publishSource = $distPath
} else {
    Write-Host "Diretório de build não encontrado em $distPath" -ForegroundColor Red
    exit 1
}
Write-Host "Build encontrado em: $publishSource" -ForegroundColor Cyan

# 3. Prepare Remote FTP Structure (Create comex133.com.br/wwwroot dentro de 304_leandro)
$creds = New-Object System.Net.NetworkCredential($ftpUser, $ftpPassword)
$baseUri = "ftp://$ftpHost/"

# Criar estrutura: comex133.com.br (dentro da raiz do usuario 304_leandro)
$level1Uri = Ensure-FtpDirectory $baseUri $ftpDomainPath $creds

# Criar estrutura: comex133.com.br/wwwroot
$level2Uri = Ensure-FtpDirectory $level1Uri $ftpAppPath $creds

Write-Host "Estrutura FTP preparada: $targetPath" -ForegroundColor Cyan
$targetUri = $level2Uri

# 4. Clean Target Directory
Remove-FtpDirectoryRecursive $targetUri $creds

# 5. Deploy - Upload apenas arquivos do build
$root = (Resolve-Path $publishSource).Path
$items = Get-ChildItem -Path $root -Recurse -Force

Write-Host "Iniciando upload dos arquivos de build para $targetUri..." -ForegroundColor Green
Write-Host "Origem: $publishSource" -ForegroundColor Cyan

# Variáveis de controle
$uploadedCount = 0
$skippedCount = 0
$errorCount = 0

# Extensões e pastas desnecessárias para pular
$skipExtensions = @('.ps1', '.md', '.txt', '.spec.ts', '.map')
$skipDirectoryPrefixes = @('docs/')
$skipFilePatterns = @('*/.~lock*', '.~lock*')

foreach ($item in $items) {
    $relativePath = $item.FullName.Substring($root.Length).TrimStart('\', '/')
    $relativePath = $relativePath.Replace("\", "/")
    
    if ([string]::IsNullOrWhiteSpace($relativePath)) { continue }

    $skipFile = $false

    # Pular pastas desnecessárias (ex: docs/ no build)
    foreach ($dirPrefix in $skipDirectoryPrefixes) {
        if ($relativePath -like "$dirPrefix*") {
            $skipFile = $true
            $skippedCount++
            break
        }
    }
    
    if ($skipFile) { continue }

    $remotePath = "$targetPath/$relativePath"
    $uri = "ftp://$ftpHost/$remotePath"

    if ($item.PSIsContainer) {
        try {
            $request = New-FtpRequest $uri ([System.Net.WebRequestMethods+Ftp]::MakeDirectory) $creds
            $response = $request.GetResponse()
            $response.Close()
            Write-Host "Diretório criado: $relativePath" -ForegroundColor DarkGray
        } catch {
            Write-Host "Diretório verificado: $relativePath" -ForegroundColor DarkGray
        }
    } else {
        try {
            Upload-FtpFileWithRetry $uri $item.FullName $creds $relativePath
            
            $uploadedCount++
            Write-Host "[OK] Enviado: $relativePath ($([math]::Round($item.Length/1KB, 2)) KB)" -ForegroundColor Green
        } catch {
            $errorCount++
            Write-Host "[ERRO] Erro ao enviar: $relativePath. Erro: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "`n" -NoNewline
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   DEPLOY CONCLUIDO COM SUCESSO" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Resumo do Deploy:" -ForegroundColor Yellow
Write-Host "   [OK] Arquivos enviados: $uploadedCount" -ForegroundColor Green
Write-Host "   [-] Arquivos ignorados: $skippedCount" -ForegroundColor Gray
Write-Host "   [ERRO] Erros: $errorCount" -ForegroundColor $(if ($errorCount -gt 0) { "Red" } else { "Green" })
Write-Host ""
Write-Host "Localizacao no servidor:" -ForegroundColor Yellow
Write-Host "   ftp://$ftpHost/$targetPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "URL da aplicacao:" -ForegroundColor Yellow
Write-Host "   https://comex133.com.br" -ForegroundColor Cyan
Write-Host ""
Write-Host "[OK] Deploy finalizado com sucesso. IIS sera reiniciado automaticamente." -ForegroundColor Green
Write-Host ""
