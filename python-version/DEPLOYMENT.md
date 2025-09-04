# Quick Deployment Guide

## 🚀 Deploy to Vercel in 5 Minutes

### Step 1: Push to GitHub

1. Create a new repository on GitHub (e.g., `uctel-case-study-generator`)
2. Copy the repository URL
3. Run these commands in your terminal:

```bash
git remote add origin <your-github-repo-url>
git push -u origin master
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "New Project"
3. Import your `uctel-case-study-generator` repository
4. Vercel will auto-detect it as a Python project ✅

### Step 3: Add Environment Variables

1. In Vercel dashboard, go to your project
2. Go to Settings → Environment Variables
3. Add these variables:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `SECRET_KEY`: Any random string (e.g., `uctel_secret_key_2025`)

### Step 4: Deploy

Click "Deploy" - Vercel will build and deploy automatically!

Your app will be live at: `https://your-project-name.vercel.app`

---

## 🔄 Automatic Updates

Every time you push changes to GitHub, Vercel will automatically redeploy!

## 🔧 Environment Variables Needed

- **OPENAI_API_KEY**: Required for AI content generation
- **SECRET_KEY**: Required for Flask session security

## 📞 Support

If you need help, contact the development team or check the full README.md file.
