@ECHO OFF
SETLOCAL
SET PATH=.\.ci\tools\;%PATH%

powershell ./pack.ps1
powershell ./pack-core.ps1
powershell ./pack-alloy.ps1
REM Tell TeamCity to publish the artifacts even though the entire build isn't done
ECHO ##teamcity[publishArtifacts '*.nupkg']

REM Create the packaged node module for distribution.
CALL yarn --cwd src/episerver-telemetry pack
IF %errorlevel% NEQ 0 EXIT /B %errorlevel%

ECHO Contents of the tarball:
FOR /f %%x IN ('dir /b src\episerver-telemetry\episerver-telemetry-v*.tgz') DO SET tarball=%%x
CALL tar -ztvf src/episerver-telemetry/%tarball%
IF %errorlevel% NEQ 0 EXIT /B %errorlevel%

EXIT /B %ERRORLEVEL%
