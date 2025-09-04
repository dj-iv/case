import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get WordPress credentials from environment
    const wpUsername = process.env.WORDPRESS_USERNAME
    const wpPassword = process.env.WORDPRESS_PASSWORD

    if (!wpUsername || !wpPassword) {
      return NextResponse.json({ error: 'WordPress credentials not configured' }, { status: 500 })
    }

    // Test authentication by trying to get current user info
    const auth = Buffer.from(`${wpUsername}:${wpPassword}`).toString('base64')
    
    const response = await fetch('https://www.uctel.co.uk/wp-json/wp/v2/users/me', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({
        error: 'Authentication failed',
        status: response.status,
        details: errorText
      }, { status: response.status })
    }

    const userInfo = await response.json()
    
    return NextResponse.json({
      success: true,
      user: {
        id: userInfo.id,
        username: userInfo.username,
        name: userInfo.name,
        roles: userInfo.roles,
        capabilities: userInfo.capabilities
      }
    })

  } catch (error) {
    console.error('Error testing WordPress auth:', error)
    return NextResponse.json(
      { error: 'Failed to test WordPress authentication' },
      { status: 500 }
    )
  }
}
