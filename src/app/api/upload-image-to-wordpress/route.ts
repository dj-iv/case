import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, altText, title } = await request.json()

    // Get WordPress credentials from environment
    const wpUsername = process.env.WORDPRESS_USERNAME
    const wpPassword = process.env.WORDPRESS_PASSWORD
    const wpApiUrl = process.env.WORDPRESS_API_URL

    if (!wpUsername || !wpPassword || !wpApiUrl) {
      throw new Error('WordPress credentials not configured')
    }

    // Create Basic Auth header
    const auth = Buffer.from(`${wpUsername}:${wpPassword}`).toString('base64')

    // Download the image from the URL
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error('Failed to download image from URL')
    }

    const imageBuffer = await imageResponse.arrayBuffer()
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg'

    // Extract filename from URL or create one
    const urlParts = imageUrl.split('/')
    const originalFilename = urlParts[urlParts.length - 1] || 'generated-image.jpg'
    const filename = originalFilename.includes('.') ? originalFilename : 'generated-image.jpg'

    // Create form data for WordPress upload
    const formData = new FormData()
    const imageBlob = new Blob([imageBuffer], { type: contentType })
    formData.append('file', imageBlob, filename)
    formData.append('title', title || 'Case Study Image')
    formData.append('alt_text', altText || 'Building exterior')
    formData.append('caption', title || 'Case Study Image')
    formData.append('description', `Generated image for ${title || 'case study'}`)

    // Upload to WordPress media endpoint
    const uploadResponse = await fetch(`${wpApiUrl.replace('/wp/v2/case', '/wp/v2/media')}`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
      },
      body: formData
    })

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      console.error('WordPress upload error:', uploadResponse.status, errorText)
      throw new Error(`Failed to upload image to WordPress: ${uploadResponse.status} - ${errorText}`)
    }

    const uploadedImage = await uploadResponse.json()

    console.log('Image uploaded successfully:', uploadedImage.id)

    return NextResponse.json({
      success: true,
      imageId: uploadedImage.id,
      imageUrl: uploadedImage.source_url,
      imageData: {
        ID: uploadedImage.id,
        id: uploadedImage.id,
        title: uploadedImage.title?.rendered || uploadedImage.title || filename,
        filename: uploadedImage.slug || filename,
        filesize: uploadedImage.filesize || 0,
        url: uploadedImage.source_url,
        link: uploadedImage.link,
        alt: uploadedImage.alt_text || altText,
        author: uploadedImage.author || 1,
        description: uploadedImage.description?.rendered || uploadedImage.description || '',
        caption: uploadedImage.caption?.rendered || uploadedImage.caption || '',
        name: uploadedImage.slug,
        status: uploadedImage.status || 'inherit',
        uploaded_to: 0, // Will be set when attached to post
        date: uploadedImage.date,
        modified: uploadedImage.modified,
        menu_order: uploadedImage.menu_order || 0,
        mime_type: uploadedImage.mime_type,
        type: uploadedImage.type || 'image',
        subtype: uploadedImage.subtype || 'jpeg',
        icon: uploadedImage.icon || 'https://www.uctel.co.uk/wp-includes/images/media/default.png',
        width: uploadedImage.media_details?.width || 1024,
        height: uploadedImage.media_details?.height || 1024,
        sizes: uploadedImage.media_details?.sizes || {}
      }
    })

  } catch (error) {
    console.error('Error uploading image to WordPress:', error)
    return NextResponse.json(
      { error: 'Failed to upload image to WordPress', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
