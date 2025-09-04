from flask import Flask
from web_app import app

# Export the Flask app for Vercel
# Vercel will automatically detect this
def handler(request):
    return app(request.environ, request.start_response)

# For local development
if __name__ == "__main__":
    app.run(debug=True)
