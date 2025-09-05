#!/usr/bin/env python3
"""
Vercel entry point for Case Study Generator
"""

import os
import sys

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(__file__))

# Import the Flask app
from web_app import app

# This is what Vercel will use
application = app

if __name__ == "__main__":
    app.run(debug=False)
