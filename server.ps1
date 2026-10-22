param(
    [int]$Port = 8765
)

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path

function Get-MimeType([string]$Path) {
    switch ([IO.Path]::GetExtension($Path).ToLowerInvariant()) {
        '.html' { 'text/html; charset=utf-8' }
        '.htm'  { 'text/html; charset=utf-8' }
        '.css'  { 'text/css; charset=utf-8' }
        '.js'   { 'application/javascript; charset=utf-8' }
        '.json' { 'application/json; charset=utf-8' }
        '.png'  { 'image/png' }
        '.jpg'  { 'image/jpeg' }
        '.jpeg' { 'image/jpeg' }
        '.gif'  { 'image/gif' }
        '.svg'  { 'image/svg+xml' }
        '.webp' { 'image/webp' }
        '.ico'  { 'image/x-icon' }
        '.txt'  { 'text/plain; charset=utf-8' }
        '.xlsx' { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
        '.zip'  { 'application/zip' }
        default { 'application/octet-stream' }
    }
}

function Send-Response($Stream, [int]$Status, [string]$StatusText, [byte[]]$Body, [string]$ContentType = 'text/plain; charset=utf-8', [bool]$HeadOnly = $false) {
    $headers = "HTTP/1.1 $Status $StatusText`r`n" +
               "Content-Type: $ContentType`r`n" +
               "Content-Length: $($Body.Length)`r`n" +
               "Cache-Control: no-store, no-cache, must-revalidate`r`n" +
               "Pragma: no-cache`r`n" +
               "Access-Control-Allow-Origin: *`r`n" +
               "Connection: close`r`n`r`n"
    $headerBytes = [Text.Encoding]::ASCII.GetBytes($headers)
    $Stream.Write($headerBytes, 0, $headerBytes.Length)
    if (-not $HeadOnly -and $Body.Length -gt 0) {
        $Stream.Write($Body, 0, $Body.Length)
    }
    $Stream.Flush()
}

$listener = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, $Port)
try {
    $listener.Start()
} catch {
    Write-Host ''
    Write-Host '================================================' -ForegroundColor Red
    Write-Host ' Nao foi possivel iniciar o servidor local.' -ForegroundColor Red
    Write-Host " Porta: $Port" -ForegroundColor Red
    Write-Host " Erro: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host '================================================' -ForegroundColor Red
    Write-Host ''
    Write-Host 'Feche qualquer servidor antigo e tente novamente.' -ForegroundColor Yellow
    Read-Host 'Pressione ENTER para fechar'
    exit 1
}

Write-Host ''
Write-Host '================================================' -ForegroundColor Green
Write-Host ' Chat Story Studio V38 - servidor local' -ForegroundColor Green
Write-Host " http://localhost:$Port/?v=38" -ForegroundColor Cyan
Write-Host '================================================' -ForegroundColor Green
Write-Host ''
Write-Host 'Servidor ativo. NAO feche esta janela enquanto estiver usando.' -ForegroundColor Yellow
Write-Host 'Para encerrar: Ctrl+C' -ForegroundColor DarkGray
try { Start-Process "http://localhost:$Port/?v=38" } catch { Write-Host 'Abra o endereco acima em seu navegador.' }
Write-Host ''

while ($true) {
    $client = $null
    try {
        $client = $listener.AcceptTcpClient()
        $stream = $client.GetStream()
        $reader = [IO.StreamReader]::new($stream, [Text.Encoding]::ASCII, $false, 4096, $true)

        $requestLine = $reader.ReadLine()
        if ([string]::IsNullOrWhiteSpace($requestLine)) {
            $client.Close(); continue
        }

        while ($true) {
            $line = $reader.ReadLine()
            if ($null -eq $line -or $line -eq '') { break }
        }

        $parts = $requestLine.Split(' ')
        if ($parts.Length -lt 2) {
            Send-Response $stream 400 'Bad Request' ([Text.Encoding]::UTF8.GetBytes('Bad Request'))
            $client.Close(); continue
        }

        $method = $parts[0].ToUpperInvariant()
        $rawTarget = $parts[1]
        $headOnly = ($method -eq 'HEAD')
        if ($method -ne 'GET' -and $method -ne 'HEAD') {
            Send-Response $stream 405 'Method Not Allowed' ([Text.Encoding]::UTF8.GetBytes('Method Not Allowed'))
            $client.Close(); continue
        }

        $pathPart = $rawTarget.Split('?')[0]
        $pathPart = [Uri]::UnescapeDataString($pathPart)
        if ($pathPart -eq '/' -or [string]::IsNullOrWhiteSpace($pathPart)) { $pathPart = '/index.html' }

        $relative = $pathPart.TrimStart('/').Replace('/', [IO.Path]::DirectorySeparatorChar)
        $candidate = [IO.Path]::GetFullPath((Join-Path $Root $relative))
        $rootFull = [IO.Path]::GetFullPath($Root + [IO.Path]::DirectorySeparatorChar)

        if (-not $candidate.StartsWith($rootFull, [StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path -LiteralPath $candidate -PathType Leaf)) {
            $body = [Text.Encoding]::UTF8.GetBytes('404 - Arquivo nao encontrado')
            Send-Response $stream 404 'Not Found' $body 'text/plain; charset=utf-8' $headOnly
            $client.Close(); continue
        }

        $body = [IO.File]::ReadAllBytes($candidate)
        $mime = Get-MimeType $candidate
        Send-Response $stream 200 'OK' $body $mime $headOnly
    } catch {
        try {
            if ($client -and $client.Connected) {
                $body = [Text.Encoding]::UTF8.GetBytes('500 - Erro interno')
                Send-Response $client.GetStream() 500 'Internal Server Error' $body
            }
        } catch {}
        Write-Host "Erro de requisicao: $($_.Exception.Message)" -ForegroundColor DarkYellow
    } finally {
        if ($client) { try { $client.Close() } catch {} }
    }
}
