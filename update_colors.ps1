$ErrorActionPreference = 'SilentlyContinue'

$replacements = @{
    '#6B7F3A' = '#40521B'
    '#4e6636' = '#334612'
    '#8BAF5A' = '#556F1F'
    '#E8EDE0' = '#F5F7F2'
    '#EEF2E6' = '#F5F7F2'
    '#F7F8F3' = '#F5F7F2'
    '#F8FAF5' = '#F5F7F2'
    '#F0F5E8' = '#F5F7F2'
    '#C5CCBA' = '#E9EDDF'
    'bg-indigo-50' = 'bg-teal-50'
    'text-indigo-600' = 'text-teal-700'
    'text-indigo-700' = 'text-teal-700'
    'border-indigo-100' = 'border-teal-100'
    'bg-blue-50' = 'bg-teal-50'
    'text-blue-700' = 'text-teal-700'
    'bg-blue-600' = 'bg-teal-600'
}

# Gradient patterns (case insensitive)
$gradientReplacements = @{
    'linear-gradient\(135deg, #6B7F3A 0%, #4e6636 55%, #8BAF5A 100%\)' = 'linear-gradient(135deg, #334612 0%, #556F1F 100%)'
    'linear-gradient\(135deg, #6B7F3A, #8BAF5A\)' = 'linear-gradient(135deg, #334612, #556F1F)'
    'linear-gradient\(90deg, #6B7F3A, #8BAF5A\)' = 'linear-gradient(90deg, #334612, #556F1F)'
    'linear-gradient\(135deg, #6B7F3A 0%, #8BAF5A 100%\)' = 'linear-gradient(135deg, #334612 0%, #556F1F 100%)'
}

$files = Get-ChildItem -Path "src/app" -Recurse -Include *.tsx, *.css

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $changed = $false

    # Handle full gradients first to avoid partial replacements messing them up
    foreach ($pattern in $gradientReplacements.Keys) {
        if ($content -match $pattern) {
            $content = $content -replace $pattern, $gradientReplacements[$pattern]
            $changed = $true
        }
    }

    # Handle individual hex/class replacements
    foreach ($oldVal in $replacements.Keys) {
        if ($content -like "*$oldVal*") {
            $content = $content -replace [regex]::Escape($oldVal), $replacements[$oldVal]
            $changed = $true
        }
    }

    if ($changed) {
        Set-Content -Path $file.FullName -Value $content
        Write-Host "Updated: $($file.FullName)"
    }
}
