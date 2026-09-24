# forward-ports.ps1
# Run this after `podman machine start` to forward container ports to localhost.
# Add to Task Scheduler (trigger: At log on) or run manually.

param(
    [string]$Distro = "podman-machine-default",
    [int[]]$Ports   = @(4200, 3000)   # add/remove ports as needed
)

# Get the WSL2 distro's current IP (changes on every machine start)
$wslIP = (wsl -d $Distro -- ip addr show eth0) |
    Where-Object { $_ -match '^\s+inet ' } |
    ForEach-Object { ($_.Trim() -split '\s+')[1].Split('/')[0] }

if (-not $wslIP) {
    Write-Error "Could not resolve IP for distro '$Distro'. Is the Podman machine running?"
    exit 1
}

Write-Host "WSL2 IP for '$Distro': $wslIP"

foreach ($port in $Ports) {
    # Remove any existing rule for this port first
    netsh interface portproxy delete v4tov4 listenaddress=127.0.0.1 listenport=$port 2>$null

    netsh interface portproxy add v4tov4 `
        listenaddress=127.0.0.1 `
        listenport=$port `
        connectaddress=$wslIP `
        connectport=$port

    Write-Host "Forwarding localhost:$port -> ${wslIP}:$port"
}

Write-Host "Done. Run 'netsh interface portproxy show all' to verify."
