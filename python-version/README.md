# Case Study Content Generator

An AI-powered tool for generating case study content in WordPress format with both CLI and web interfaces.

## Features

- 🤖 **AI-Powered Content Generation** using OpenAI GPT
- 🌐 **Beautiful Web Interface** with responsive design
- 📝 **WordPress Block Format** output ready for copy-paste
- 🖥️ **CLI Interface** for automation and scripting
- 📋 **Structured Case Study Template** (Summary, Client, Challenges, Solution, Results)
- 📱 **Mobile-Friendly** responsive design
- 🎨 **Real-time Preview** of generated content

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Create a `.env` file from the example:
   ```bash
   copy .env.example .env
   ```
4. Edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   SECRET_KEY=any_random_string_for_security
   ```

## Usage

### Web Interface (Recommended)

1. Start the web server:
   ```bash
   python web_app.py
   ```

2. Open your browser and go to: `http://localhost:5000`

3. Fill in the case study details in the beautiful web form

4. Click "Generate Case Study" and wait for AI to create your content

5. Copy the WordPress-ready content directly to your site!

### Command Line Interface

```bash
python case_study_generator.py --client "Client Name" --industry "Industry" --challenge "Main Challenge" --solution "Solution Provided"
```

### API Endpoint

The web app also provides a REST API at `/api/generate` for programmatic access.

## Web Interface Features

- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Real-time Validation**: Form validation with helpful error messages  
- **Loading Indicators**: Visual feedback during AI generation
- **Copy to Clipboard**: One-click copying of WordPress content
- **Download Option**: Save generated content as text file
- **Section Preview**: Collapsible sections showing generated content
- **WordPress Ready**: Content formatted in Gutenberg block format

## Structure

- `web_app.py` - Flask web application
- `case_study_generator.py` - CLI application  
- `templates/` - HTML templates and WordPress formatter
- `models/` - Pydantic models for data validation
- `ai/` - AI integration modules
- `static/` - CSS, JS, and image assets

## Example Output

The generator creates WordPress block format content similar to the UCtel case study format with sections for Summary, Client, Challenges, Solution, and Results.

## Screenshots

The web interface provides a modern, professional experience with:
- Clean form design with helpful placeholders
- Bootstrap-based responsive layout
- Loading spinners and success notifications
- Syntax-highlighted WordPress content display
- Mobile-optimized interface

## Deployment to Vercel

### Prerequisites

- Vercel account
- GitHub repository

### Deploy Steps

1. **Push to GitHub**:
```bash
git add .
git commit -m "Initial case study generator"
git remote add origin <your-github-repo-url>
git push -u origin main
```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect it as a Python project

3. **Add Environment Variables**:
   - In Vercel dashboard, go to your project settings
   - Add environment variable: `OPENAI_API_KEY` with your API key
   - Add environment variable: `SECRET_KEY` with a random string

4. **Deploy**:
   - Vercel will automatically deploy when you push to GitHub
   - Your app will be available at `https://your-project-name.vercel.app`

### Important Notes for Production

- The app uses temporary files for session management - in production you might want to use a database
- Make sure your OpenAI API key has sufficient credits
- The app generates content using GPT-3.5-turbo which requires an OpenAI API subscription
