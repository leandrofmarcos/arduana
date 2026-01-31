# Script para baixar logs stdout do IIS via FTP

$ftpHost = "www.comex133.com.br"
$ftpUser = "304_leandro"
$ftpPassword = "leandro123"
$targetPath = "comex133.com.br/wwwroot"

$logsPath = "$targetPath/logs"
$logsUri = "ftp://$ftpHost/$logsPath/"

$creds = New-Object System.Net.NetworkCredential($ftpUser, $ftpPassword)

function Get-FtpList {
    param($uri, $credentials)
    try {
        $request = [System.Net.FtpWebRequest]::Create($uri)
        $request.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
        $request.Credentials = $credentials
        $request.UseBinary = $true
        $request.KeepAlive = $false
        $response = $request.GetResponse()
        $reader = New-Object System.IO.StreamReader($response.GetResponseStream())
        $listing = $reader.ReadToEnd()
        $reader.Close()
        $response.Close()
        return $listing
    }
    catch {
        return $null
    }
}

function Download-FtpFile {
    param($uri, $credentials, $localPath)
    $request = [System.Net.FtpWebRequest]::Create($uri)
    $request.Method = [System.Net.WebRequestMethods+Ftp]::DownloadFile
    $request.Credentials = $credentials
    $request.UseBinary = $true
    $request.KeepAlive = $false

    $response = $request.GetResponse()
    $stream = $response.GetResponseStream()
    $outFile = [System.IO.File]::Create($localPath)
    $stream.CopyTo($outFile)
    $outFile.Close()
    $stream.Close()
    $response.Close()
}

Write-Host "Listando logs em: $logsUri" -ForegroundColor Cyan
$listing = Get-FtpList $logsUri $creds

if ([string]::IsNullOrWhiteSpace($listing)) {
    Write-Host "Nenhum log encontrado ou sem acesso ao diretorio /logs." -ForegroundColor Yellow
    exit 1
}

$files = $listing -split "`r`n" | Where-Object { $_ -ne "" }

$downloadDir = Join-Path $PSScriptRoot "logs_downloaded"
if (-not (Test-Path $downloadDir)) {
    New-Item -ItemType Directory -Path $downloadDir | Out-Null
}

foreach ($file in $files) {
    $remoteUri = "$logsUri$file"
    $localPath = Join-Path $downloadDir $file
    Write-Host "Baixando: $file" -ForegroundColor Green
    try {
        Download-FtpFile $remoteUri $creds $localPath
    }
    catch {
        Write-Host "Erro ao baixar: $file" -ForegroundColor Red
    }
}

Write-Host "Logs baixados em: $downloadDir" -ForegroundColor Cyan
