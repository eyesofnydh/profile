Add-Type -AssemblyName System.Drawing
$imageRoot = Join-Path $PSScriptRoot '../assets/images'
$previewRoot = Join-Path $imageRoot 'previews'
New-Item -ItemType Directory -Force -Path $previewRoot | Out-Null
$files = [regex]::Matches((Get-Content (Join-Path $PSScriptRoot '../assets/js/photos.js') -Raw), '"file": "([^"]+)"') | ForEach-Object { $_.Groups[1].Value }
$encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
foreach ($file in $files) {
    $original = [System.Drawing.Image]::FromFile((Join-Path $imageRoot $file))
    try {
        foreach ($size in @(320, 800, 1600)) {
            $width = [Math]::Min($size, $original.Width)
            $height = [int][Math]::Round($original.Height * $width / $original.Width)
            $bitmap = [System.Drawing.Bitmap]::new($width, $height)
            $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
            $parameters = [System.Drawing.Imaging.EncoderParameters]::new(1)
            try {
                $graphics.Clear([System.Drawing.Color]::White)
                $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
                $graphics.DrawImage($original, 0, 0, $width, $height)
                $parameters.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality, [long]85)
                $bitmap.Save((Join-Path $previewRoot "$([IO.Path]::GetFileNameWithoutExtension($file))-$size.jpg"), $encoder, $parameters)
            } finally { $parameters.Dispose(); $graphics.Dispose(); $bitmap.Dispose() }
        }
    } finally { $original.Dispose() }
}
