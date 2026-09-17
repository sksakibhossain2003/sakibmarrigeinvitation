$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8080/")
$listener.Start()
Write-Host "HTTP server running at http://localhost:8080/"

$mime = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".png"  = "image/png"
    ".svg"  = "image/svg+xml"
    ".mp3"  = "audio/mpeg"
}

$root = (Get-Location).Path

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $req = $context.Request
        $res = $context.Response

        try {
            $rawPath = $req.Url.LocalPath.TrimStart('/').Replace('/', '\')
            if ([string]::IsNullOrWhiteSpace($rawPath) -or $rawPath -eq "\") {
                $rawPath = "index.html"
            }

            $filePath = Join-Path $root $rawPath

            if (Test-Path $filePath -PathType Leaf) {
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                $contentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { "application/octet-stream" }
                $res.ContentType = $contentType

                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                $res.ContentLength64 = $bytes.Length

                if ($req.HttpMethod -ne "HEAD") {
                    $res.OutputStream.Write($bytes, 0, $bytes.Length)
                }
            } else {
                $res.StatusCode = 404
                $buffer = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
                $res.ContentLength64 = $buffer.Length
                if ($req.HttpMethod -ne "HEAD") {
                    $res.OutputStream.Write($buffer, 0, $buffer.Length)
                }
            }
        } catch {
            Write-Host "Request error: $_"
        } finally {
            try { $res.Close() } catch {}
        }
    }
} finally {
    $listener.Stop()
}
