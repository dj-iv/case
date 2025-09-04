# UCtel Case Study Generator - Next.js Version

A modern React/Next.js application for generating AI-powered case studies with direct WordPress publishing capabilities.

## 🎯 Key Features

- **🤖 AI-Powered Generation**: Uses OpenAI GPT-3.5-turbo for professional case study content
- **📝 WordPress Integration**: Direct publishing to UCtel WordPress site via REST API (ACF aware)
- **🧠 Editable Prompts**: Advanced editors to view, tweak, or fully override text + image prompts
- **🖼️ Parallel Image Generation**: Optional automatic DALL·E 3 feature image generated with content
- **👀 Live Preview**: Real-time website preview with responsive device switching
- **🎨 UCtel Branding**: Matches your existing website design and colors
- **📱 Responsive**: Works perfectly on desktop, tablet, and mobile
- **⚡ Fast Deployment**: Optimized for Vercel with perfect compatibility

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Copy `.env.local.example` to `.env.local` and configure:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-proj-your-key-here

# WordPress Configuration
WORDPRESS_USERNAME=your_wp_username
WORDPRESS_PASSWORD=your_wp_app_password
WORDPRESS_API_URL=https://www.uctel.co.uk/wp-json/wp/v2

# Optional Feature Toggles
LEGACY_STRONG_HEADINGS=true   # set to 'false' to remove <strong> wrappers inside H2 headings
```

### 3. Development
```bash
npm run dev
```

Visit `http://localhost:3000`

### 4. Deploy to Vercel
```bash
# Push to GitHub
git add .
git commit -m "Next.js case study generator"
git push

# Deploy via Vercel Dashboard
# 1. Import GitHub repo
# 2. Add environment variables
# 3. Deploy!
```

## 🏗️ Architecture

### Frontend Components
- **`CaseStudyForm`**: Main form with validation and submission
- **`PreviewPage`**: Responsive website preview with device switching
- **Tailwind CSS**: UCtel-branded styling with custom colors

### API Routes
- **`/api/generate-case-study`**: OpenAI integration for content generation
- **`/api/publish-to-wordpress`**: Direct WordPress REST API publishing
- **`/api/generate-image`**: (Also invoked internally in parallel) DALL·E 3 image creation

### WordPress Integration
The app creates posts with your exact ACF structure:
```json
{
  "title": "Case Study: Client Name - Solution",
  "content": "WordPress blocks formatted content",
  "acf": {
    "banner": { "header": "...", "image": "..." },
    "sidebar": { "texts": [...] },
    "preview": { "main_text": "...", "quote": "..." }
  }
}
```

## 🔧 WordPress API Setup

### 1. Create Application Password
1. Go to **Users → Profile** in WordPress admin
2. Scroll to **Application Passwords**
3. Create new password for "Case Study Generator"
4. Use this in your environment variables

### 2. Configure API Permissions
Ensure your user has permissions to:
- Create/edit case study posts
- Upload media (for future image features)
- Access ACF fields

## 📋 Usage Workflow

### 1. Generate Content
- Fill out the case study form
- Click "Generate Case Study" 
- AI creates professional content in seconds

### 2. Preview Website
- Click "Website Preview" to see exactly how it will look
- Test on different devices (desktop/tablet/mobile)
- Matches your UCtel website design perfectly

### 3. Publish to WordPress
- Click "Publish to WordPress"
- Creates draft post with proper ACF fields
- Get direct link to edit in WordPress admin

## 🎨 Features vs Python Version

| Feature | Python Flask | Next.js React | Winner |
|---------|-------------|---------------|---------|
| Vercel Deployment | ❌ Constant crashes | ✅ Perfect compatibility | **React** |
| Team Familiarity | ❌ Python learning curve | ✅ Existing React skills | **React** |
| Development Speed | ⚠️ Backend complexity | ✅ Full-stack in one repo | **React** |
| WordPress Integration | ⚠️ Manual copying | ✅ Direct API publishing | **React** |
| Preview Quality | ⚠️ Basic HTML | ✅ Real website mockup | **React** |
| Mobile Experience | ⚠️ Basic responsive | ✅ Native mobile feel | **React** |
| Maintenance | ❌ Python + JS knowledge | ✅ Single stack | **React** |

## 🚀 Deployment Advantages

### Why This Will Work vs Python Version:
1. **Native Vercel Support**: Next.js is Vercel's primary framework
2. **No Runtime Issues**: JavaScript runs perfectly in serverless
3. **Consistent Stack**: Same as your other React apps
4. **Team Collaboration**: Your colleagues can contribute easily
5. **Modern Tooling**: Hot reload, TypeScript, modern dev experience

## 🔮 Future Enhancements

- **� Saved Prompt Presets**: Library of reusable generation configurations
- **🧪 Multiple Image Variants**: Generate several candidate images at once
- **📊 Analytics**: Track which case studies perform best
- **🔄 Bulk Generation**: Generate multiple case studies at once
- **🎯 Templates**: Save and reuse case study templates
- **👥 Multi-user**: Role-based access for different team members

## 🛠️ Technical Stack

- **Frontend**: React 18, Next.js 14, TypeScript
- **Styling**: Tailwind CSS with UCtel brand colors
- **Forms**: React Hook Form with validation
- **Icons**: Lucide React (lightweight, modern)
- **AI**: OpenAI GPT-3.5-turbo
- **WordPress**: REST API with ACF integration
- **Deployment**: Vercel (seamless integration)

## 🔍 Troubleshooting

### OpenAI API Issues
- Ensure API key is valid and has credits
- Check rate limits in OpenAI dashboard

### WordPress Publishing Issues
- Verify application password is correct
- Check user permissions for case study post type
- Ensure ACF plugin is active

### Vercel Deployment Issues
- Check environment variables are set
- Verify build logs for any errors
- Ensure all dependencies are listed in package.json

---

**This Next.js version solves all the Python deployment issues while providing a better user experience and easier maintenance!** 🎉
