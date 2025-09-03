from flask import Flask, jsonify
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'fallback-secret-key')

@app.route('/')
def hello():
    return jsonify({
        'status': 'success',
        'message': 'Case Study Generator API is working!',
        'environment': 'production' if os.environ.get('VERCEL') else 'development'
    })

@app.route('/health')
def health():
    return jsonify({
        'status': 'healthy',
        'openai_key_exists': bool(os.environ.get('OPENAI_API_KEY')),
        'secret_key_exists': bool(os.environ.get('SECRET_KEY'))
    })

# For Vercel
app_for_vercel = app

if __name__ == '__main__':
    app.run(debug=True)
