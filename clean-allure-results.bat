@echo off
title Clean Allure Results
echo.
echo ========================================
echo   Clean Allure Results
echo ========================================
echo.
echo This will delete:
echo   - allure-results folder
echo   - allure-report folder
echo.

cd /d "%~dp0"

set /p confirm="Are you sure you want to continue? (Y/N): "
if /i not "%confirm%"=="Y" (
    echo.
    echo Operation cancelled.
    pause
    exit /b 0
)

echo.
echo Cleaning Allure files...
call npm run allure:clean

echo.
echo ========================================
echo   Cleanup Complete!
echo ========================================
echo.
pause
