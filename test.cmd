@ECHO OFF
SETLOCAL

SET PATH=.\.ci\tools\;%PATH%

REM Set Release or Debug configuration.
IF "%1"=="Release" (set CONFIGURATION=Release) ELSE (set CONFIGURATION=Debug)
ECHO Testing in %CONFIGURATION%

ECHO Running c# tests
CALL dotnet test src/EpiServer.Telemetry.UI.Tests/EpiServer.Telemetry.UI.Tests.csproj --no-build --verbosity normal
IF %errorlevel% NEQ 0 EXIT /B %errorlevel%

ECHO Running JS tests
CALL yarn --cwd src/episerver-cms-telemetry test

EXIT /B %ERRORLEVEL%
