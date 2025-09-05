@echo off
echo Starting Case Study Generator Web Interface...
echo.

REM Check if virtual environment exists
if not exist ".venv\Scripts\python.exe" (
    echo Error: Virtual environment not found. Please run the setup first.
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist ".env" (
    echo Error: .env file not found. Please copy .env.example to .env and configure it.
    pause
    exit /b 1
)

echo Web interface will be available at: http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the web application
.venv\Scripts\python.exe web_app.py

pause
