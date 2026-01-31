# Script para limpar o diretorio no FTP
# Use com cuidado - remove TODOS os arquivos do FTP

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
    Write-Host "Verificando conteudo de: $uri" -ForegroundColor Gray
    $listing = Get-FtpListing $uri $credentials
    
    if ([string]::IsNullOrEmpty($listing)) {
        return
    }

    $lines = $listing -split "`r`n" | Where-Object { $_ -ne "" }
    
    foreach ($line in $lines) {
        $isDir = $false
        $name = ""
        
        # Parser para formato Windows (MM-DD-YY  HH:MMAM/PM  <DIR> ou size  name)
        # Parser para formato Unix (drwx... ou -rwx...)
        
        if ($line -match "\<DIR\>") {
            $isDir = $true
            if ($line -match "<DIR>\s+(.+)$") {
                $name = $matches[1].Trim()
            }
        } 
        elseif ($line -match "^d") {
            $isDir = $true
            $parts = $line -split "\s+", 9
            if ($parts.Count -ge 9) {
                $name = $parts[8]
            }
        }
        elseif ($line -notmatch "^\s*$") {
            if ($line -match "\d+-\d+-\d+") {
                if ($line -match "^\d+-\d+-\d+\s+\d+:\d+[AP]M\s+(\d+)\s+(.+)$") {
                    $name = $matches[2].Trim()
                    $isDir = $false
                }
            }
            else {
                $parts = $line -split "\s+", 9
                if ($parts.Count -ge 9) {
                    $name = $parts[8]
                    $isDir = $false
                }
            }
        }
        
        if ([string]::IsNullOrWhiteSpace($name)) { continue }
        if ($name -eq "." -or $name -eq "..") { continue }
        
        $itemUri = "$uri$name"
        
        if ($isDir) {
            $itemUri = "$itemUri/"
            Remove-FtpDirectoryRecursive $itemUri $credentials
            
            Write-Host "Removendo diretorio: $itemUri" -ForegroundColor Yellow
            try {
                $req = [System.Net.FtpWebRequest]::Create($itemUri)
                $req.Method = [System.Net.WebRequestMethods+Ftp]::RemoveDirectory
                $req.Credentials = $credentials
                $req.KeepAlive = $false
                $req.GetResponse().Close()
            } catch {
                Write-Host "Erro ao remover diretorio $itemUri : $($_.Exception.Message)" -ForegroundColor Red
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

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "LIMPEZA DO DIRETORIO" -ForegroundColor Magenta
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Host: $ftpHost" -ForegroundColor Yellow
Write-Host ""
Write-Host "ATENCAO: Esta operacao ira remover TODOS os arquivos do FTP!" -ForegroundColor Red
Write-Host ""

$confirmation = Read-Host "Deseja continuar? (S/N)"
if ($confirmation -ne 'S' -and $confirmation -ne 's') {
    Write-Host "Operacao cancelada pelo usuario." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Iniciando limpeza..." -ForegroundColor Magenta

$creds = New-Object System.Net.NetworkCredential($ftpUser, $ftpPassword)

Remove-FtpDirectoryRecursive $uri $creds

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Limpeza concluida!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
