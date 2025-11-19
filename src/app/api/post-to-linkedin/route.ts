import { NextRequest, NextResponse } from 'next/server'
import { formatLinkedInCommentary, publishLinkedInPost } from '@/lib/linkedin'

interface LinkedInShareRequest {
  title: string
  summary?: string
  challenges?: string
  solution?: string
  results?: string
  permalink: string
  customCaption?: string
  clientName?: string
  industry?: string
  buildingType?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as LinkedInShareRequest
    if (!body?.title || !body?.permalink) {
      return NextResponse.json({ error: 'Title and permalink are required for LinkedIn posting.' }, { status: 400 })
    }

    const commentary = formatLinkedInCommentary({
      title: body.title,
      summary: body.summary,
      challenges: body.challenges,
      solution: body.solution,
      results: body.results,
      link: body.permalink,
      customCaption: body.customCaption,
      clientName: body.clientName,
      industry: body.industry,
      buildingType: body.buildingType
    })

    const postResponse = await publishLinkedInPost({
      title: body.title,
      commentary,
      articleUrl: body.permalink,
      imageUrl: undefined,
      imageAltText: undefined
    })

    const duplicate = Boolean(postResponse && typeof postResponse === 'object' && 'duplicate' in postResponse && postResponse.duplicate)
    const linkedInPostUrn = duplicate
      ? (postResponse?.duplicateOf as string | undefined)
      : (postResponse?.id as string | undefined) || (postResponse?.urn as string | undefined) || (postResponse?.value as string | undefined)
    const responseBody = {
      success: true,
      duplicate,
      message: duplicate ? (postResponse?.message || 'LinkedIn reported this content as a duplicate.') : undefined,
      linkedInPostUrn: linkedInPostUrn || null,
      linkedInResponse: postResponse
    }

    return NextResponse.json(responseBody)

  } catch (error) {
    console.error('LinkedIn publish error:', error)
    const status = error instanceof Error && /LinkedIn post failed: (\d+)/.test(error.message)
      ? Number(error.message.match(/LinkedIn post failed: (\d+)/)?.[1])
      : 500
    return NextResponse.json({
      success: false,
      error: 'Failed to publish to LinkedIn',
      details: error instanceof Error ? error.message : String(error)
    }, { status })
  }
}
