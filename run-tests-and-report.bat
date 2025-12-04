@echo off
title Run Smoke Tests and Generate Report
echo.
echo ========================================
echo   Run Smoke Tests + Generate Allure Report
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] Running smoke tests...
echo.
call npm run test:smoke

if %errorlevel% neq 0 (
    echo.
    echo [WARNING] Some tests failed, but continuing with report generation...
    echo.
)

echo.
echo [2/3] Generating Allure report...
call "%~dp0node_modules\.bin\allure.cmd" generate allure-results --clean -o allure-report

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to generate Allure report!
    pause
    exit /b 1
)

echo.
echo [3/3] Opening Allure report...
call "%~dp0node_modules\.bin\allure.cmd" open allure-report

echo.
echo ========================================
echo   All Done!
echo ========================================
echo.
pause
