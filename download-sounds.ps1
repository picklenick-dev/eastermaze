# PowerShell script to download Easter Labyrinth sound effects
# This script downloads royalty-free sound effects suitable for the game

Write-Host "Downloading sound effects for Easter Labyrinth game..."

# Create function to download file
function Download-File {
    param (
        [string]$Url,
        [string]$OutputPath
    )
    Write-Host "Downloading $OutputPath..."
    try {
        Invoke-WebRequest -Uri $Url -OutFile $OutputPath -UseBasicParsing
        Write-Host "Downloaded $OutputPath successfully!" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "Failed to download $OutputPath. Error: $_" -ForegroundColor Red
        return $false
    }
}

# Ensure sounds directory exists
if (-not (Test-Path -Path ".\sounds")) {
    New-Item -ItemType Directory -Path ".\sounds" | Out-Null
    Write-Host "Created sounds directory."
}

# Sound files with their URLs - these are free sound effects from Pixabay (free for commercial use)
$soundFiles = @{
    "game-start.mp3" = "https://cdn.pixabay.com/download/audio/2022/03/10/audio_270f8b31ca.mp3?filename=interface-124464.mp3"
    "hop.mp3" = "https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c589a9.mp3?filename=plop-6.mp3"
    "collect-egg.mp3" = "https://cdn.pixabay.com/download/audio/2021/08/04/audio_12b0c7443c.mp3?filename=success-1-6297.mp3"
    "level-complete.mp3" = "https://cdn.pixabay.com/download/audio/2021/08/04/audio_c14be5c1d7.mp3?filename=success-fanfare-trumpets-6185.mp3"
    "game-complete.mp3" = "https://cdn.pixabay.com/download/audio/2021/08/04/audio_c738d5f7d1.mp3?filename=success-1-6297.mp3"
}

$downloadCount = 0
$totalFiles = $soundFiles.Count

# Download each sound file
foreach ($file in $soundFiles.Keys) {
    $filePath = ".\sounds\$file"
    $url = $soundFiles[$file]
    
    # Download the file
    $success = Download-File -Url $url -OutputPath $filePath
    if ($success) {
        $downloadCount++
    }
}

Write-Host ""
Write-Host "Download complete! $downloadCount out of $totalFiles sound files were downloaded successfully." -ForegroundColor Cyan
Write-Host "The Easter Labyrinth game now has real sound effects!"