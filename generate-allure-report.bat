@echo off
title Generating Allure Report
echo.
echo ========================================
echo Generating Allure Report for Smoke Tests
echo ========================================
echo.

REM Change to script directory
cd /d "%~dp0"

REM Generate Allure report
echo [1/2] Generating report from allure-results...
call npm run allure:generate
if errorlevel 1 (
    echo ERROR: Failed to generate report
    pause
    exit /b 1
)

echo.
echo [2/2] Report generated successfully!
echo Location: %CD%\allure-report
echo.
echo ========================================
echo Opening Allure Report...
echo ========================================
echo.

REM Open the report
call npm run allure:open

pause
