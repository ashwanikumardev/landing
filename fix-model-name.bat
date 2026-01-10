@echo off
echo Updating .env file with correct Gemini model name...
echo.

REM Create a temporary file with the updated content
powershell -Command "(Get-Content .env) -replace 'GEMINI_MODEL=gemini-1.5-flash$', 'GEMINI_MODEL=gemini-1.5-flash-latest' | Set-Content .env.tmp"

REM Replace the original file
move /Y .env.tmp .env >nul

echo ✓ Updated GEMINI_MODEL to gemini-1.5-flash-latest
echo.
echo Now run: npm run test:gemini
