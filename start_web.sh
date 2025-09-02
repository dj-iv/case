#!/bin/bash
echo "Starting Case Study Generator Web Interface..."
echo

# Check if virtual environment exists
if [ ! -f ".venv/Scripts/python.exe" ] && [ ! -f ".venv/bin/python" ]; then
    echo "Error: Virtual environment not found. Please run the setup first."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Error: .env file not found. Please copy .env.example to .env and configure it."
    exit 1
fi

echo "Web interface will be available at: http://localhost:5000"
echo
echo "Press Ctrl+C to stop the server"
echo

# Determine the correct Python path
if [ -f ".venv/Scripts/python.exe" ]; then
    # Windows
    .venv/Scripts/python.exe web_app.py
else
    # Linux/Mac
    .venv/bin/python web_app.py
fi
