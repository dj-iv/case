import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const wpUsername = process.env.WORDPRESS_USERNAME
    const wpPassword = process.env.WORDPRESS_PASSWORD
    const wpSiteUrl = process.env.WORDPRESS_API_URL?.replace('/wp-json/wp/v2/case', '')

    if (!wpUsername || !wpPassword || !wpSiteUrl) {
      throw new Error('WordPress credentials not configured')
    }

    const auth = Buffer.from(`${wpUsername}:${wpPassword}`).toString('base64')

    // Fetch case_category taxonomy terms
    const response = await fetch(`${wpSiteUrl}/wp-json/wp/v2/case_category?per_page=100`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`)
    }

    const categories = await response.json()

    // Return only the name and id
    return NextResponse.json({
      categories: categories.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug
      }))
    })

  } catch (error: any) {
    console.error('Error fetching WordPress categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories', details: error.message },
      { status: 500 }
    )
  }
}
