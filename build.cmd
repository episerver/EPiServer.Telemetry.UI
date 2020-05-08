@ECHO OFF
SETLOCAL

SET PATH=.\.ci\tools\;.\build\tools\;%PATH%

REM Lint the JavaScript files.
CALL yarn lint:js
IF %errorlevel% NEQ 0 EXIT /B %errorlevel%

msbuild /p:Configuration=Release
build-tracker.cmd

