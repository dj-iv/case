from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello():
    return "Hello from Vercel!"

@app.route('/health')
def health():
    return "Healthy!"

# This is the WSGI callable that Vercel will use
application = app

if __name__ == '__main__':
    app.run()
