$ftpHost = "www.comex133.com.br"
$ftpUser = "304_leandro"
$ftpPassword = "leandro123"
$uri = "ftp://$ftpHost/"

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
        Write-Host "Erro ao listar diretório $uri : $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

function Remove-FtpDirectoryRecursive($uri, $credentials) {
    Write-Host "Verificando conteúdo de: $uri" -ForegroundColor Gray
    $listing = Get-FtpListing $uri $credentials
    
    if ([string]::IsNullOrEmpty($listing)) {
        return
    }

    $lines = $listing -split "`r`n" | Where-Object { $_ -ne "" }
    
    foreach ($line in $lines) {
        # Parsing FTP list format
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
            } catch {
                Write-Host "Erro ao remover diretório $itemUri : $($_.Exception.Message)" -ForegroundColor Red
            }
        } else {
            Write-Host "Removendo arquivo: $itemUri" -ForegroundColor Yellow
            try {
                $req = [System.Net.FtpWebRequest]::Create($itemUri)
                $req.Method = [System.Net.WebRequestMethods+Ftp]::DeleteFile
                $req.Credentials = $credentials
                $req.KeepAlive = $false
                $req.GetResponse().Close()
            } catch {
                Write-Host "Erro ao remover arquivo $itemUri : $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    }
}

Write-Host "Iniciando limpeza TOTAL do FTP ($ftpHost)..." -ForegroundColor Magenta
$creds = New-Object System.Net.NetworkCredential($ftpUser, $ftpPassword)

Remove-FtpDirectoryRecursive $uri $creds

Write-Host "Limpeza concluída." -ForegroundColor Green
