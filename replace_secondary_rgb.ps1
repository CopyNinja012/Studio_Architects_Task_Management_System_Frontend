$files = Get-ChildItem -Path "src" -Include "*.tsx", "*.ts", "*.css" -Recurse
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $newContent = $content -replace 'rgba\(92,\s*122,\s*62', 'rgba(139, 175, 90'
    $newContent = $newContent -replace 'rgb\(92,\s*122,\s*62', 'rgb(139, 175, 90'
    
    if ($content -ne $newContent) {
        Set-Content $file.FullName $newContent -NoNewline
        Write-Output "Updated: $($file.FullName)"
    }
}
