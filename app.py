from web_app import app

# Vercel entry point - expose the app object directly
# Vercel will use this as the WSGI application
if __name__ == "__main__":
    app.run(debug=False, host='0.0.0.0', port=5000)
