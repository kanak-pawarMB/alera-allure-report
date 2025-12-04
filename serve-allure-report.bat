@echo off
title Serve Allure Report
echo.
echo ========================================
echo   Serving Allure Report
echo ========================================
echo.
echo This will generate and serve the report.
echo Your browser will open automatically.
echo.
echo Press Ctrl+C to stop the server when done.
echo ========================================
echo.

cd /d "%~dp0"

REM Check if allure-results exists
if not exist "allure-results" (
    echo [ERROR] allure-results directory not found!
    echo Please run tests first: npm run test:smoke
    echo.
    pause
    exit /b 1
)

echo Starting Allure server...
call "%~dp0node_modules\.bin\allure.cmd" serve allure-results
