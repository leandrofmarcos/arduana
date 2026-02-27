$ftpHost = "www.comex133.com.br"
$ftpUser = "304_leandro"
$ftpPassword = "leandro123"
$ftpDomainPath = "comex133.com.br"
$ftpAppPath = "wwwroot"
$targetPath = "$ftpDomainPath/$ftpAppPath"

function Ensure-FtpDirectory($baseUri, $folderName, $credentials) {
    $uri = "$baseUri$folderName/"
    Write-Host "Verificando/Criando diretório: $uri" -ForegroundColor Gray
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
            Write-Host "Diretório criado: $folderName" -ForegroundColor DarkGray
        } catch {
            Write-Host "Erro ao criar diretório $uri : $($_.Exception.Message)" -ForegroundColor DarkYellow
        }
    }
    return $uri
}

# 1. Criar HTML simples localmente
$localHtmlPath = Join-Path $PSScriptRoot "index-test.html"
@"
<!doctype html>
<html lang="pt-br">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Teste HostAzul</title>
  </head>
  <body>
    <h1>Teste OK</h1>
    <p>Se você está vendo esta página, o deploy básico via FTP funciona.</p>
  </body>
</html>
"@ | Set-Content -Path $localHtmlPath -Encoding UTF8

# 2. Preparar estrutura remota
$creds = New-Object System.Net.NetworkCredential($ftpUser, $ftpPassword)
$baseUri = "ftp://$ftpHost/"
$level1Uri = Ensure-FtpDirectory $baseUri $ftpDomainPath $creds
$level2Uri = Ensure-FtpDirectory $level1Uri $ftpAppPath $creds

# 3. Upload do HTML
$remotePath = "$targetPath/index-test.html"
$uri = "ftp://$ftpHost/$remotePath"

Write-Host "Enviando arquivo de teste: index-test.html" -ForegroundColor Green
try {
    $content = [System.IO.File]::ReadAllBytes($localHtmlPath)
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
    Write-Host "[OK] Upload concluido: ftp://$ftpHost/$remotePath" -ForegroundColor Green
} catch {
    Write-Host "[ERRO] Falha no upload: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Abra: https://comex133.com.br/index-test.html" -ForegroundColor Cyan
