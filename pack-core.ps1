$workingDirectory = Get-Location
$nuget = "$workingDirectory\build\tools\nuget.exe"

$assemblyVersionFile = "version.cs"

$fileVersionMatch = (Select-String -Path $assemblyVersionFile -Pattern 'AssemblyInformationalVersion[^\d]*(.+)"').Matches[0]
$assemblyFileVersion = $fileVersionMatch.Groups[1].Value

Write-Host "Creating nuget with $fileVersionMatch version"

Start-Process -NoNewWindow -Wait -FilePath $nuget -ArgumentList "pack", "$workingDirectory\build\packaging\EPiServer.Telemetry.UI.Core.nuspec", "-Version $assemblyFileVersion", "-Properties configuration=Release", "-BasePath ./", "-Verbosity detailed"

