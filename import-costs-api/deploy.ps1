$projectPath = "import-costs-api.csproj"
$publishDir = "publish_ftp"
$ftpHost = "www.comex133.com.br"
$ftpUser = "304_leandro"
$ftpPassword = "leandro123"
$remoteBasePath = "comex133.com.br/wwwroot"

if (Test-Path $publishDir) {
    Remove-Item -Path $publishDir -Recurse -Force
}

Write-Host "Gerando build de release para FTP..." -ForegroundColor Green
dotnet publish $projectPath -c Release -o $publishDir

if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro durante o build. O processo foi interrompido." -ForegroundColor Red
    exit 1
}

# Criar estrutura de diretorios base no FTP
Write-Host "Criando estrutura de diretorios base..." -ForegroundColor Cyan
$baseDirs = @("comex133.com.br", "comex133.com.br/wwwroot")
foreach ($dir in $baseDirs) {
    $uri = "ftp://$ftpHost/$dir/"
    try {
        $request = [System.Net.FtpWebRequest]::Create($uri)
        $request.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
        $request.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPassword)
        $request.UseBinary = $true
        $request.KeepAlive = $false
        $response = $request.GetResponse()
        $response.Close()
        Write-Host "Diretorio criado: $dir" -ForegroundColor Green
    } catch {
        Write-Host "Diretorio ja existe ou nao pode ser criado: $dir" -ForegroundColor DarkYellow
    }
}

$root = (Resolve-Path $publishDir).Path
$items = Get-ChildItem -Path $root -Recurse -Force

foreach ($item in $items) {
    $relativePath = $item.FullName.Substring($root.Length).TrimStart('\', '/')
    $relativePath = $relativePath.Replace("\", "/")
    if ([string]::IsNullOrWhiteSpace($relativePath)) {
        continue
    }

    if ($remoteBasePath -and -not $remoteBasePath.EndsWith("/")) {
        $remoteBasePath = "$remoteBasePath/"
    }

    $remotePath = "$remoteBasePath$relativePath"
    $uri = "ftp://$ftpHost/$remotePath"

    if ($item.PSIsContainer) {
        try {
            $request = [System.Net.FtpWebRequest]::Create($uri)
            $request.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
            $request.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPassword)
            $request.UseBinary = $true
            $request.KeepAlive = $false
            $response = $request.GetResponse()
            $response.Close()
            Write-Host "Diretorio criado: $remotePath" -ForegroundColor DarkGray
        } catch {
            Write-Host "Falha ao criar diretorio (pode ja existir): $remotePath" -ForegroundColor DarkYellow
        }
    } else {
        Write-Host "Enviando arquivo: $remotePath" -ForegroundColor Green
        try {
            $content = [System.IO.File]::ReadAllBytes($item.FullName)
            $request = [System.Net.FtpWebRequest]::Create($uri)
            $request.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
            $request.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPassword)
            $request.UseBinary = $true
            $request.KeepAlive = $false
            $request.ContentLength = $content.Length
            $requestStream = $request.GetRequestStream()
            $requestStream.Write($content, 0, $content.Length)
            $requestStream.Close()
            $response = $request.GetResponse()
            $response.Close()
        } catch {
            Write-Host "Erro ao enviar arquivo $remotePath : $_" -ForegroundColor Red
        }
    }
}

Write-Host "Deploy FTP concluido." -ForegroundColor Green
