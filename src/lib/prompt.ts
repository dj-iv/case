import { GenerateCaseStudyRequest } from '../types/case'

export function buildDefaultCaseStudyPrompt(data: GenerateCaseStudyRequest): string {
  return `Create a professional, detailed case study for UCtel (mobile signal boosting company) with the following information:\n\nClient (use EXACTLY as given, do NOT invent placeholders): ${data.clientName}\nIndustry: ${data.industry}\nChallenge: ${data.mainChallenge}\nSolution: ${data.solutionProvided}\n${data.location ? `Location: ${data.location}` : ''}\n${data.projectScale ? `Scale: ${data.projectScale}` : ''}\n${data.technologiesUsed ? `Technologies: ${data.technologiesUsed}` : ''}\n${data.additionalContext ? `Additional Context: ${data.additionalContext}` : ''}\n\nGenerate a comprehensive case study with these exact sections:\n\n**SUMMARY**\nWrite 1-2 detailed sentences explaining: the client's situation, the specific connectivity challenges they faced, UCtel's solution approach, and the overall impact/results achieved. Make it engaging and comprehensive.\n\n**THE CLIENT**\nWrite 1-2 sentences describing: the client organisation in detail, their industry position, location specifics, size/scale, what makes them unique, and why reliable connectivity was crucial for their operations. Always refer to the client by the exact name provided above ("${data.clientName}").\n\n**THE CHALLENGES**\nWrite 1-2 sentences detailing: specific technical connectivity issues, coverage problems, user impact, business consequences, any unique environmental factors, regulatory considerations, and why these challenges were particularly difficult for this client.\n\n**THE SOLUTION**\nWrite 1-2 sentences explaining: UCtel's technical approach, specific equipment utilised (CEL-FI models, antenna systems, etc.), installation process, technical specifications, implementation timeline, partnerships involved, and why this solution was optimised for their needs.\n\n**THE RESULTS**\nWrite 1-2 sentences covering: specific improvements realised, measurable results, user feedback, business benefits, implementation timeline, client satisfaction, and any future-looking statements or calls to action.\n\n**SIDEBAR_CHALLENGE**\nWrite 1 sentence summarising the main connectivity challenge for the sidebar.\n\n**SIDEBAR_RESULTS**\nWrite 1 sentence summarising the key results and benefits realised for the sidebar.\n\n**CLIENT_QUOTE**\nCreate a realistic, compelling quote from the client expressing satisfaction with UCtel's solution and its business impact.\n\nIMPORTANT:\n- Write exclusively in British English throughout, using British spelling (e.g., realise, optimise, organisation, recognised, colour, centre, behaviour, specialised, analysed).\n- Use British terminology (e.g., mobile rather than cellular, whilst, amongst).\n- Never invent placeholder organisations such as "XYZ Corporation" or generic names; always use "${data.clientName}" when referring to the client.\n\nWrite in a professional, technical tone suitable for B2B audiences. Use specific technical terms, mention measurable improvements, and include concrete details. Each section should be substantial and informative, similar to UCtel's existing case studies.`
}

export function buildDefaultImagePrompt(data: GenerateCaseStudyRequest): string {
  return `Professional exterior photograph of ${data.clientName} building in ${data.location || 'modern urban setting'}, ${data.industry} sector, corporate architecture, high quality, business photography style`
}

export function interpolateCustomPrompt(customPrompt: string, data: GenerateCaseStudyRequest): string {
  let interpolated = customPrompt
  
  // Replace common placeholder patterns with actual data
  const replacements = [
    { pattern: /\[Client Name\]/g, value: data.clientName },
    { pattern: /\[Industry\]/g, value: data.industry },
    { pattern: /\[Main Challenge\]/g, value: data.mainChallenge },
    { pattern: /\[Solution Provided\]/g, value: data.solutionProvided },
    { pattern: /\[Location\]/g, value: data.location || '' },
    { pattern: /\[Project Scale\]/g, value: data.projectScale || '' },
    { pattern: /\[Technologies Used\]/g, value: data.technologiesUsed || '' },
    { pattern: /\[Additional Context\]/g, value: data.additionalContext || '' }
  ]
  
  for (const replacement of replacements) {
    interpolated = interpolated.replace(replacement.pattern, replacement.value || '')
  }
  
  return interpolated
}
