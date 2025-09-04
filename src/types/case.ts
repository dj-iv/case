// Central type definitions for case study generation and publishing

export interface CaseStudySections {
  summary: string
  client: string
  challenges: string
  solution: string
  results: string
  sidebarChallenge?: string
  sidebarResults?: string
  clientQuote?: string
}

export interface GeneratedCaseStudyResult {
  title: string
  sections: CaseStudySections
  wordpressContent: string
  sidebarContent: {
    challenge: string
    results: string
  }
  previewQuote: string
  imagePrompt: string
  imageUrl?: string
}

export interface GenerateCaseStudyRequest {
  clientName: string
  industry: string
  mainChallenge: string
  solutionProvided: string
  location?: string
  projectScale?: string
  technologiesUsed?: string
  additionalContext?: string
  customPrompt?: string
  generateImage?: boolean
  customImagePrompt?: string
}
