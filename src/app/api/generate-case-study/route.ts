import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { GenerateCaseStudyRequest } from '@/types/case'
import { buildDefaultCaseStudyPrompt, buildDefaultImagePrompt, interpolateCustomPrompt } from '@/lib/prompt'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
  const data: GenerateCaseStudyRequest = await request.json()

  // Build default prompt unless a custom override is provided
  const defaultPrompt = buildDefaultCaseStudyPrompt(data)

  const prompt = (data.customPrompt && data.customPrompt.trim().length > 50)
    ? interpolateCustomPrompt(data.customPrompt, data)
    : defaultPrompt

    const completionPromise = openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional technical writer specializing in telecommunications case studies. ALWAYS output every required section header exactly once even if you must reasonably infer content."
        },
        {
          role: "user",
          // Always append critical instructions even for custom prompts (unless user explicitly included them).
          content: `${prompt}\nIMPORTANT: Output EVERY section. If unsure, infer plausible but realistic content. Place each section header on its own line exactly as in the instructions (e.g., SUMMARY, THE CLIENT, THE CHALLENGES, THE SOLUTION, THE RESULTS, SIDEBAR_CHALLENGE, SIDEBAR_RESULTS, QUOTE).`
        }
      ],
      max_tokens: 2600,
      temperature: 0.65,
    })
    
    // Optionally kick off image generation in parallel
    let imagePromise: Promise<string | null> | null = null
  const baseImagePrompt = buildDefaultImagePrompt(data)
    if (data.generateImage) {
      const finalImagePrompt = (data.customImagePrompt && data.customImagePrompt.trim().length > 20)
        ? data.customImagePrompt.trim()
        : baseImagePrompt
      imagePromise = (async () => {
        try {
          const img = await openai.images.generate({
            model: 'dall-e-3',
            prompt: finalImagePrompt,
            n: 1,
            size: '1024x1024',
            quality: 'standard',
            style: 'natural'
          })
          return img.data?.[0]?.url || null
        } catch (e) {
          console.error('Parallel image generation failed:', e)
          return null
        }
      })()
    }

    const completion = await completionPromise
    let generatedText = completion.choices[0]?.message?.content || ''
    // Post-process to avoid placeholder company names from models
    const company = data.clientName?.trim()
    if (company) {
      const placeholders = [
        'XYZ Corporation', 'XYZ Corp', 'ABC Company', 'Sample Company', 'ACME Corporation'
      ]
      for (const ph of placeholders) {
        const re = new RegExp(ph.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g')
        generatedText = generatedText.replace(re, company)
      }
    }
    
    // Parse the generated content into structured sections
  const sections = parseGeneratedContent(generatedText)

  // Add comprehensive fallbacks for ALL sections if missing/empty
  const ensure = (val: string, fallback: string) => (val && val.trim().length > 40 ? val.trim() : fallback)

  sections.summary = ensure(sections.summary, `${data.clientName} faced significant mobile connectivity limitations impacting operational efficiency${data.industry ? ' in the ' + data.industry + ' sector' : ''}. UCtel performed a detailed RF assessment, engineered an optimised multi‑carrier enhancement design and delivered a turnkey deployment that materially improved signal strength, quality and user experience across all priority areas.`)

  sections.client = ensure(sections.client, `${data.clientName} is a ${data.projectScale || 'mid-sized'} organisation${data.location ? ' located in ' + data.location : ''}${data.industry ? ' operating within the ' + data.industry + ' industry' : ''}. Reliable mobile coverage is critical for day‑to‑day communication, safety procedures and digital workflows, making persistent coverage gaps a strategic risk.`)

  sections.challenges = ensure(sections.challenges, `Legacy building materials, internal layout complexities and external network congestion combined to degrade indoor signal quality. Users experienced inconsistent call performance, data session drops and slow throughput in critical zones. These factors introduced productivity loss, poor user experience and heightened support overhead while complicating compliance and emergency communication requirements.`)

  sections.solution = ensure(sections.solution, `UCtel executed a structured delivery approach: (1) detailed site survey and spectrum measurements; (2) design of a carrier‑agnostic amplification and distribution architecture; (3) deployment of CEL‑FI smart boosting equipment with strategically placed service antennas; (4) optimisation of gain profiles, uplink/downlink balance and interference mitigation; and (5) validation testing to document KPI improvements and resilience under load.`)

  sections.results = ensure(sections.results, `Post‑deployment metrics showed materially higher RSRP/RSRQ and SINR values, stabilised voice call quality and significantly faster data performance across target areas. Staff and stakeholders reported improved reliability, fewer connectivity complaints and an enhanced user experience supporting productivity, safety communications and future digital initiatives.`)

  sections.sidebarChallenge = ensure(sections.sidebarChallenge, `Inconsistent indoor mobile coverage impacted call reliability, data performance and user productivity across key operational areas.`)
  sections.sidebarResults = ensure(sections.sidebarResults, `Engineered enhancement delivered stronger, more consistent multi‑carrier signal, improving communication quality and day‑to‑day efficiency.`)
      sections.clientQuote = ensure(sections.clientQuote, `UCtel's engineered solution demonstrates how targeted mobile connectivity improvements can transform operational efficiency and enhance productivity across commercial environments.`)
    
    // Generate WordPress-formatted content
    let wordpressContent = generateWordPressContent(sections)
    if (company) {
      const re = new RegExp(company.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g')
      // Ensure consistent exact client name usage (idempotent replacement)
      const placeholders = [
        'XYZ Corporation', 'XYZ Corp', 'ABC Company', 'Sample Company', 'ACME Corporation'
      ]
      for (const ph of placeholders) {
        const r = new RegExp(ph.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g')
        wordpressContent = wordpressContent.replace(r, company)
      }
    }
    
    const imageUrl = imagePromise ? await imagePromise : null

    const result = {
      title: `Case Study: ${data.clientName} - Mobile Connectivity Solution`,
      sections: {
        summary: sections.summary,
        client: sections.client,
        challenges: sections.challenges,
        solution: sections.solution,
        results: sections.results
      },
      wordpressContent,
      industry: data.industry,
      sidebarContent: {
        challenge: sections.sidebarChallenge.trim() || sections.challenges.substring(0, 200) + '...',
        results: sections.sidebarResults.trim() || sections.results.substring(0, 200) + '...'
      },
      previewQuote: sections.clientQuote.trim() || extractKeyQuote(sections.summary),
      imagePrompt: baseImagePrompt,
      ...(imageUrl ? { imageUrl } : {})
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error generating case study:', error)
    return NextResponse.json(
      { error: 'Failed to generate case study' },
      { status: 500 }
    )
  }
}

function parseGeneratedContent(text: string) {
  const sections = {
    summary: '',
    client: '',
    challenges: '',
    solution: '',
    results: '',
    sidebarChallenge: '',
    sidebarResults: '',
    clientQuote: ''
  }
  const headerRegex = /^\s*(?:\*\*)?(SUMMARY|THE CLIENT|THE CHALLENGES|THE SOLUTION|THE RESULTS|SIDEBAR_CHALLENGE|SIDEBAR_RESULTS|QUOTE)(?:\*\*)?\s*:?\s*$/i
  const lines = text.split(/\r?\n/)
  let currentKey: keyof typeof sections | '' = ''
  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue
    const headerMatch = line.match(headerRegex)
    if (headerMatch) {
      const header = headerMatch[1].toUpperCase()
      switch (header) {
        case 'SUMMARY': currentKey = 'summary'; break
        case 'THE CLIENT': currentKey = 'client'; break
        case 'THE CHALLENGES': currentKey = 'challenges'; break
        case 'THE SOLUTION': currentKey = 'solution'; break
        case 'THE RESULTS': currentKey = 'results'; break
        case 'SIDEBAR_CHALLENGE': currentKey = 'sidebarChallenge'; break
        case 'SIDEBAR_RESULTS': currentKey = 'sidebarResults'; break
        case 'QUOTE': currentKey = 'clientQuote'; break
        default: currentKey = ''
      }
      continue
    }
    if (currentKey) {
      // Avoid duplicating headers or markdown markers
      if (/^\*\*/.test(line)) continue
      sections[currentKey] += line + '\n\n'
    }
  }

  return sections
}

function generateWordPressContent(sections: any) {
  // Allow reverting to legacy bold (<strong>) headings if desired.
  // By default we now RESTORE the <strong> wrappers per user request.
  // Set env LEGACY_STRONG_HEADINGS="false" to disable.
  const useStrong = process.env.LEGACY_STRONG_HEADINGS !== 'false'
  // Helper function to convert multi-paragraph content to WordPress blocks
  const generateWordPressBlocks = (content: string) => {
    const paragraphs = content.split('\n\n');
    let result = '';
    
    for (let i = 0; i < paragraphs.length; i++) {
      const paragraph = paragraphs[i].trim();
      
      // Check if this is a bullet point section
      if (paragraph.includes('• **') || paragraph.includes('•')) {
        // Extract bullet points
        const lines = paragraph.split('\n');
        const beforeBullets = [];
        const bulletPoints = [];
        const afterBullets = [];
        let currentSection = 'before';
        
        for (const line of lines) {
          if (line.trim().startsWith('• ')) {
            currentSection = 'bullets';
            bulletPoints.push(line.trim());
          } else if (currentSection === 'bullets' && line.trim() && !line.trim().startsWith('• ')) {
            currentSection = 'after';
            afterBullets.push(line.trim());
          } else if (currentSection === 'before') {
            beforeBullets.push(line.trim());
          } else if (currentSection === 'after') {
            afterBullets.push(line.trim());
          }
        }
        
        // Add paragraph before bullets if exists
        if (beforeBullets.length > 0) {
          const beforeText = beforeBullets.join(' ');
          result += `<!-- wp:paragraph -->
<p>${beforeText}</p>
<!-- /wp:paragraph -->

`;
        }
        
        // Add bullet list
        if (bulletPoints.length > 0) {
          result += `<!-- wp:list -->
<ul>`;
          bulletPoints.forEach(bullet => {
            const cleanBullet = bullet.replace('• ', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            result += `<!-- wp:list-item -->
<li>${cleanBullet}</li>
<!-- /wp:list-item -->

`;
          });
          result += `</ul>
<!-- /wp:list -->

`;
        }
        
        // Add paragraph after bullets if exists
        if (afterBullets.length > 0) {
          const afterText = afterBullets.join(' ');
          result += `<!-- wp:paragraph -->
<p>${afterText}</p>
<!-- /wp:paragraph -->

`;
        }
      } else {
        // Regular paragraph
        const cleanParagraph = paragraph
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        result += `<!-- wp:paragraph -->
<p>${cleanParagraph}</p>
<!-- /wp:paragraph -->

`;
      }
    }
    
    return result.trim();
  };

  const h = (label: string) => `<!-- wp:heading -->\n<h2 class="wp-block-heading">${useStrong ? `<strong>${label}</strong>` : label}</h2>\n<!-- /wp:heading -->\n`;

  return `${h('Summary')}
${generateWordPressBlocks(sections.summary)}

${h('The Client')}
${generateWordPressBlocks(sections.client)}

${h('The Challenges')}
${generateWordPressBlocks(sections.challenges)}

${h('The Solution')}
${generateWordPressBlocks(sections.solution)}

${h('The Results')}
${generateWordPressBlocks(sections.results)}`
}

function extractKeyQuote(summary: string): string {
  const sentences = summary.split('.')
  return sentences.length > 1 ? sentences[1].trim() + '.' : sentences[0].trim()
}
