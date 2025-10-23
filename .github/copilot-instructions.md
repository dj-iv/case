# UCtel Case Study Generator - AI Development Guide

## 🏗️ Architecture Overview

This is a **Next.js 14 TypeScript application** that generates AI-powered case studies for UCtel (mobile signal boosting company) with direct WordPress publishing via REST API.

### Key Data Flow
1. **Form Input** (`CaseStudyForm.tsx`) → **AI Generation** (`/api/generate-case-study`) → **WordPress Publishing** (`/api/publish-to-wordpress`)
2. **Parallel Image Generation** with DALL·E 3 alongside content generation
3. **Live Preview** with responsive device switching (`/preview`)
4. **ACF Integration** for structured WordPress content

## 🎯 Critical Developer Knowledge

### API Route Architecture
- **`/api/generate-case-study`**: OpenAI GPT-3.5-turbo content generation with structured section parsing
- **`/api/publish-to-wordpress`**: WordPress REST API publishing with ACF field mapping
- **`/api/generate-image`**: DALL·E 3 image generation (called in parallel during content generation)
- **`/api/upload-image-to-wordpress`**: Media upload to WordPress for generated images

### Data Structure Patterns
```typescript
// Core types in src/types/case.ts
GenerateCaseStudyRequest → GeneratedCaseStudyResult → WordPress ACF payload
```

### British English & UCtel Branding
- **ALWAYS use British spelling** (realise, optimise, organisation, specialised, analysed)
- **British terminology**: "mobile" (not cellular), "whilst", "amongst"
- **UCtel brand colors**: uctel-primary (teal blue), uctel-secondary (orange) defined in tailwind.config.js

### Prompt Engineering System
- **Default prompts** in `src/lib/prompt.ts` with British English enforcement
- **Custom prompt interpolation** with placeholder replacement patterns
- **Structured section parsing** with fallback content for missing sections
- **Image prompts** automatically generated from form data

### WordPress Integration Specifics
- **ACF structure**: `banner`, `sidebar`, `preview` objects with specific field mappings
- **WordPress blocks format**: Auto-generated Gutenberg blocks with proper escaping
- **Category mapping**: Industry names → WordPress category IDs
- **Retry logic**: Handles ACF validation errors with logo field fallbacks

### Portal SSO Integration
- Access is gated via UCtel portal. Middleware enforces `uctel_case_session` cookie; missing sessions redirect to `NEXT_PUBLIC_PORTAL_URL` login with deep-link.
- Portal launch sends users to `/portal/callback` with HMAC signed `portalToken`. Route verifies token with `PORTAL_SIGNING_SECRET`, sets the session cookie, and redirects to requested page.

## 🔧 Development Commands

```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Production build with TypeScript checking
npm run typecheck    # TypeScript validation only
npm run clean        # Remove .next build cache
```

### Environment Variables (copy .env.local.example)
```bash
OPENAI_API_KEY=sk-proj-...          # Required for content generation
WORDPRESS_USERNAME=wp_user          # WordPress application password user
WORDPRESS_PASSWORD=xxxx xxxx        # WordPress application password (not regular password)
WORDPRESS_API_URL=https://...       # WordPress REST API endpoint (/wp/v2/case)
LEGACY_STRONG_HEADINGS=true         # Controls <strong> wrapper in H2 headings
```

## 🚨 Critical Debugging Patterns

### OpenAI Content Generation Issues
- Check `parseGeneratedContent()` function for section header parsing
- Fallback content in `ensure()` function prevents empty sections
- Temperature 0.65 for consistent but creative output

### WordPress Publishing Failures
- **ACF field validation**: Retry logic removes `logo` field if validation fails
- **Image upload**: Parallel process, continues without image if upload fails
- **Category mapping**: Search by name, not slug (see `getCategoryIdByName()`)

### Preview System
- Uses UCtel brand colors and styling patterns
- Device-responsive preview with Desktop/Tablet/Mobile switching
- Mock browser UI with realistic URL structure

## 📁 Key File Locations

- **Main form**: `src/components/CaseStudyForm.tsx` (1100+ lines, complex state management)
- **Type definitions**: `src/types/case.ts`
- **Prompt engineering**: `src/lib/prompt.ts`
- **Brand colors**: `tailwind.config.js` (uctel-primary, uctel-secondary)
- **Environment template**: `.env.local.example`

## 🔄 Deployment (Vercel-Optimized)

This project is specifically designed for **Vercel deployment** (Next.js framework). The architecture avoids Python-specific issues that caused deployment failures in the legacy version.

### Vercel Configuration
- `vercel.json` specifies Next.js framework
- All API routes are serverless functions
- No Python runtime dependencies

When modifying API routes, ensure they remain **stateless** and **serverless-compatible**.
