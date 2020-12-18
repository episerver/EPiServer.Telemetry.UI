@ECHO OFF
SETLOCAL

SET PATH=.\.ci\tools\;.\build\tools\;%PATH%

CALL yarn --cwd src/episerver-telemetry build
IF %errorlevel% NEQ 0 EXIT /B %errorlevel%

CALL yarn --cwd src/episerver-telemetry generate-declarations
IF %errorlevel% NEQ 0 EXIT /B %errorlevel%

EXIT /B %errorlevel%
