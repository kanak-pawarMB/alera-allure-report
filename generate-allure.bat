@echo off
cd /d "%~dp0"
call node_modules\.bin\allure.cmd generate allure-results --clean -o allure-report
echo Allure report generated in allure-report folder
pause
