@echo off
title Serve Allure Report
echo.
echo ========================================
echo Serving Allure Report (Direct from Results)
echo ========================================
echo.
echo This will generate and serve the Allure report.
echo Your browser will open automatically.
echo.
echo Press Ctrl+C to stop the server when done.
echo ========================================
echo.

REM Change to script directory
cd /d "%~dp0"

REM Serve Allure report directly from results
call npm run allure:serve
