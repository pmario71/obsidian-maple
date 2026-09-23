param(
	[Parameter(Position = 0)]
	[ValidateSet('TestVault', 'LocalVaults')]
	[string]$target = 'TestVault',
    
	[bool]$build = $true
)

$testVaultPath = "D:\Todo\Obsidian\SyncVault2\.obsidian\plugins\obsidian-maple\"

$releasePaths = @(
	"C:\Users\plenma66\OneDrive - Siemens Healthineers\ObsNotes\Work",
	"D:\TFS\Obsidian\Software Development"
)

function ExpandDestFolder {
	param (
		[string]$folderPath
	)
    
	if ($folderPath.Contains('obsidian-maple')) {
		return [System.IO.Path]::GetFullPath($folderPath)
	}

	$folderPath = [System.IO.Path]::Combine($folderPath, '.obsidian\plugins\obsidian-maple\')
	$folderPath = [System.IO.Path]::GetFullPath($folderPath)
	[System.IO.Directory]::CreateDirectory($folderPath) | Out-Null
    
	return $folderPath
}

if ($build) {
	Invoke-Expression "npm run build"
}

if ($target -eq 'TestVault') {
	$destination = ExpandDestFolder -folderPath $testVaultPath
	Copy-Item -Destination $destination -Force -Path @('main.js', 'manifest.json', 'styles.css')	
}
else {
	foreach ($currentItemName in $releasePaths) {
		$destination = ExpandDestFolder -folderPath $currentItemName	<# $currentItemName is the current item #>
		Copy-Item -Destination $destination -Force -Path @('main.js', 'manifest.json', 'styles.css')
		
		Write-Host "Published plugin to:  $destination"
	}

	# package 3 files as zip
	$zipFile = [System.IO.Path]::Join($PSScriptRoot, 'packages', 'obsidian-maple.zip')
	Compress-Archive -Path @('main.js', 'manifest.json', 'styles.css') -DestinationPath $zipFile -Force

	Write-Host "Packaged files into $zipFile"
}
