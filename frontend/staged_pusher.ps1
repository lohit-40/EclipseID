# staged_pusher.ps1
# This script divides the UI overhaul into 6 commits and pushes them 1 hour apart.

Write-Output "Unstaging all files..."
git reset HEAD

$chunks = @(
    @{
        files = @("package.json", "package-lock.json")
        message = "chore: install gsap and framer-motion dependencies for UI overhaul"
    },
    @{
        files = @("src/utils/sounds.ts")
        message = "feat: implement web audio API utility for tactile UI sounds"
    },
    @{
        files = @("src/components/ScrambleText.tsx")
        message = "feat: add ScrambleText cryptographic component for hacker aesthetic"
    },
    @{
        files = @("src/App.tsx")
        message = "feat: redesign global layout with cyber-grid and glassmorphic navbar"
    },
    @{
        files = @("src/pages/Landing.tsx")
        message = "feat: overhaul landing page with GSAP animations and glitch effects"
    },
    @{
        files = @("src/pages/Darkpool.tsx")
        message = "feat: transform Darkpool into secure ZK terminal with dynamic event logging"
    }
)

for ($i = 0; $i -lt $chunks.Length; $i++) {
    $chunk = $chunks[$i]
    
    Write-Output "========================================"
    Write-Output "Processing Chunk $($i + 1)/$($chunks.Length): $($chunk.message)"
    Write-Output "========================================"
    
    foreach ($file in $chunk.files) {
        git add $file
    }
    
    git commit -m $chunk.message
    
    Write-Output "Pushing to GitHub..."
    git push origin main
    
    if ($i -lt ($chunks.Length - 1)) {
        Write-Output "Waiting for 1 hour (3600 seconds) before next push..."
        Start-Sleep -Seconds 3600
    }
}

Write-Output "All 6 UI chunks have been successfully committed and pushed!"
