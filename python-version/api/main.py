from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello():
    return "Hello from Vercel Serverless!"

@app.route('/health')
def health():
    return "Healthy!"

# Vercel serverless function handler
def handler(event, context):
    return app(event, context)

if __name__ == '__main__':
    app.run()
