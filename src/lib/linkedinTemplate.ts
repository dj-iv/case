export interface LinkedInTemplateInput {
  title: string
  summary?: string
  challenges?: string
  solution?: string
  results?: string
  link?: string
  customCaption?: string
  clientName?: string
  industry?: string
  buildingType?: string
}

const SENTENCE_SPLIT_REGEX = /(?<=[.!?])\s+/

const normaliseList = (text?: string, maxItems = 3): string[] => {
  if (!text) return []
  const sentences = text
    .replace(/\s+/g, ' ')
    .split(SENTENCE_SPLIT_REGEX)
    .map((entry) => entry.trim().replace(/^[-•\s]+/, ''))
    .filter(Boolean)
  return sentences.slice(0, maxItems)
}

const cleanSentence = (sentence?: string) => sentence?.replace(/\.$/, '') || ''

export function generateLinkedInCaption(data: LinkedInTemplateInput): string {
  if (data.customCaption?.trim()) {
    return data.customCaption.trim()
  }

  const lines: string[] = []
  const industry = data.industry?.trim()
  const buildingType = data.buildingType?.trim()
  const clientName = data.clientName?.trim()

  const problemLines = normaliseList(data.challenges || data.summary, 3)
  const solutionLines = normaliseList(data.solution, 3)
  const resultLines = normaliseList(data.results, 3)

  const appendBlock = (heading: string, items: string[], bulletPrefix = '• ') => {
    if (!items.length) return
    lines.push(heading)
    lines.push('')
    items.forEach((item) => lines.push(`${bulletPrefix}${item}`))
    lines.push('')
  }

  const firstLine = (() => {
    const issue = cleanSentence(problemLines[0])
    if (issue && clientName) {
      return `📉 ${issue} — here’s how UCtel fixed it for ${clientName}.`
    }
    if (issue) {
      return `🚧 ${issue} — and another successful UCtel fix.`
    }
    if (clientName) {
      return `🚧 Another building struggling with mobile signal — UCtel partnered with ${clientName} to solve it.`
    }
    return '🚧 Another building struggling with mobile signal — and another successful UCtel fix.'
  })()

  lines.push(firstLine)
  lines.push('')

  const clientDescriptor: string[] = []
  if (industry) clientDescriptor.push(industry)
  if (buildingType) clientDescriptor.push(buildingType)
  const descriptorText = clientDescriptor.length ? ` — ${clientDescriptor.join(' · ')}` : ''
  lines.push(`🏢 Client: ${clientName || industry || 'UCtel client'}${descriptorText}`)
  lines.push('')

  appendBlock('🚨 The Problem:', problemLines)
  appendBlock('⚙️ Our Solution:', solutionLines)
  appendBlock('✅ The Outcome:', resultLines, '✔ ')

  const caseStudyLink = data.link?.trim() || 'https://www.uctel.co.uk/case-studies/'
  lines.push(`🔗 Full case study: ${caseStudyLink}`)
  lines.push('')
  lines.push('Need better mobile signal in your building?')
  lines.push('👉 Send us a message or visit uctel.co.uk to book a free site survey.')
  lines.push('')
  lines.push('#UCtel #MobileCoverage #InBuildingCoverage #Connectivity #5GReady #MobileSignal')

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}
