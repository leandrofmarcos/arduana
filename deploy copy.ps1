    $projectPath = "c:\dev\prototipos-html\import-costs"
$ftpHost = "www.comex133.com.br"
$ftpUser = "304_leandro"
$ftpPassword = "leandro123"
$targetPath = "comex133.com.br/wwwroot" # Caminho relativo a partir da raiz do FTP

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
    } catch {
        return $null
    }
}

function Ensure-FtpDirectory($baseUri, $folderName, $credentials) {
    $uri = "$baseUri$folderName/"
    Write-Host "Verificando/Criando diretório: $uri" -ForegroundColor Gray
    try {
        $request = [System.Net.FtpWebRequest]::Create($uri)
        $request.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
        $request.Credentials = $credentials
        $request.GetResponse().Close()
    } catch {
        # Se falhar listar, tenta criar
        try {
            $request = [System.Net.FtpWebRequest]::Create($uri)
            $request.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
            $request.Credentials = $credentials
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
                $req = [System.Net.FtpWebRequest]::Create($itemUri)
                $req.Method = [System.Net.WebRequestMethods+Ftp]::RemoveDirectory
                $req.Credentials = $credentials
                $req.KeepAlive = $false
                $req.GetResponse().Close()
            } catch { Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor DarkRed }
        } else {
            Write-Host "Removendo arquivo: $itemUri" -ForegroundColor Yellow
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

# 1. Build Application
Write-Host "Iniciando build do Angular..." -ForegroundColor Green
Set-Location $projectPath
cmd /c "npm run build"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro durante o build. O processo foi interrompido." -ForegroundColor Red
    exit 1
}

# 2. Determine Output Directory
$distPath = Join-Path $projectPath "dist\import-costs"
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

# 3. Prepare Remote Structure
$creds = New-Object System.Net.NetworkCredential($ftpUser, $ftpPassword)
$baseUri = "ftp://$ftpHost/"

# Garantir estrutura comex133.com.br/wwwroot passo a passo
$level1 = Ensure-FtpDirectory $baseUri "comex133.com.br" $creds
$targetUri = Ensure-FtpDirectory $level1 "wwwroot" $creds

# 4. Clean Target Directory
Remove-FtpDirectoryRecursive $targetUri $creds

# 5. Deploy
$root = (Resolve-Path $publishSource).Path
$items = Get-ChildItem -Path $root -Recurse -Force

Write-Host "Iniciando upload para $targetUri..." -ForegroundColor Green

foreach ($item in $items) {
    $relativePath = $item.FullName.Substring($root.Length).TrimStart('\', '/')
    $relativePath = $relativePath.Replace("\", "/")
    
    if ([string]::IsNullOrWhiteSpace($relativePath)) { continue }

    $remotePath = "$targetPath/$relativePath"
    $uri = "ftp://$ftpHost/$remotePath"

    if ($item.PSIsContainer) {
        try {
            $request = [System.Net.FtpWebRequest]::Create($uri)
            $request.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
            $request.Credentials = $creds
            $request.UseBinary = $true
            $request.KeepAlive = $false
            $response = $request.GetResponse()
            $response.Close()
            Write-Host "Diretório criado: $relativePath" -ForegroundColor DarkGray
        } catch {
            Write-Host "Diretório verificado: $relativePath" -ForegroundColor DarkGray
        }
    } else {
        Write-Host "Enviando arquivo: $relativePath" -ForegroundColor Green
        try {
            $content = [System.IO.File]::ReadAllBytes($item.FullName)
            $request = [System.Net.FtpWebRequest]::Create($uri)
            $request.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
            $request.Credentials = $creds
            $request.UseBinary = $true
            $request.KeepAlive = $false
            $request.ContentLength = $content.Length
            
            $requestStream = $request.GetRequestStream()
            $requestStream.Write($content, 0, $content.Length)
            $requestStream.Close()
            
            $response = $request.GetResponse()
            $response.Close()
        } catch {
            Write-Host "Erro ao enviar arquivo: $relativePath. Erro: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "Deploy concluído com sucesso em $targetPath!" -ForegroundColor Green
