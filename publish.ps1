param(
    [string]$destination = "D:\Todo\Obsidian\SyncVault2\.obsidian\plugins\obsidian-maple\",
    [bool]$release = $false
)

function ExpandDestFolder {
    param (
        [string]$folderPath
    )
    
    if ($folderPath.Contains('obsidian-maple')) {
        return [System.IO.Path]::GetFullPath($folderPath)
    }

    $folderPath = [System.IO.Path]::Combine($folderPath, '.obsidian\plugins\obsidian-maple\')
    return [System.IO.Path]::GetFullPath($folderPath)
}

Invoke-Expression "npm run build"

$destination = ExpandDestFolder -folderPath $destination

[System.IO.Directory]::CreateDirectory($destination) | Out-Null

Copy-Item -Destination $destination -Force -Path @('main.js', 'manifest.json', 'styles.css')
