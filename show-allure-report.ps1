# PowerShell script to generate and show Allure report
Write-Host ""
Write-Host "========================================"
Write-Host "  Generating Allure Report"
Write-Host "========================================"
Write-Host ""

# Set location to script directory
Set-Location $PSScriptRoot

# Check if allure-results exists
if (-not (Test-Path "allure-results")) {
    Write-Host "[ERROR] allure-results directory not found!" -ForegroundColor Red
    Write-Host "Please run tests first: npm run test:smoke"
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Generating report from allure-results..."
& node node_modules/allure-commandline/dist/bin/allure generate allure-results --clean -o allure-report

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERROR] Failed to generate Allure report!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Opening Allure report in browser..."
& node node_modules/allure-commandline/dist/bin/allure open allure-report

Write-Host ""
Write-Host "========================================"
Write-Host "  Report opened successfully!"
Write-Host "========================================"
Write-Host ""
