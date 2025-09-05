import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''
    let imageBuffer: ArrayBuffer
    let filename: string
    let mimeType: string
    let altText = ''
    let title = ''

    if (contentType.includes('multipart/form-data')) {
      // Handle direct file upload
      const formData = await request.formData()
      const file = formData.get('image') as File

      if (!file) {
        return NextResponse.json({ error: 'No image file provided' }, { status: 400 })
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Invalid file type. Please upload an image.' }, { status: 400 })
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'Image size must be less than 5MB' }, { status: 400 })
      }

      imageBuffer = await file.arrayBuffer()
      filename = file.name || 'uploaded-image.jpg'
      mimeType = file.type
      altText = (formData.get('altText') as string) || 'Uploaded image'
      title = (formData.get('title') as string) || 'Uploaded image'

    } else {
      // Handle image URL upload (existing functionality)
      const body = await request.json()
      const { imageUrl, altText: providedAltText, title: providedTitle } = body

      if (!imageUrl) {
        return NextResponse.json({ error: 'No image URL provided' }, { status: 400 })
      }

      // Download the image from the URL
      const imageResponse = await fetch(imageUrl)
      if (!imageResponse.ok) {
        throw new Error('Failed to download image from URL')
      }

      imageBuffer = await imageResponse.arrayBuffer()
      mimeType = imageResponse.headers.get('content-type') || 'image/jpeg'

      // Extract filename from URL or create one
      const urlParts = imageUrl.split('/')
      const originalFilename = urlParts[urlParts.length - 1] || 'generated-image.jpg'
      filename = originalFilename.includes('.') ? originalFilename : 'generated-image.jpg'
      altText = providedAltText || 'Generated image'
      title = providedTitle || 'Generated image'
    }

    // Get WordPress credentials from environment
    const wpUsername = process.env.WORDPRESS_USERNAME
    const wpPassword = process.env.WORDPRESS_PASSWORD
    const wpApiUrl = process.env.WORDPRESS_API_URL

    if (!wpUsername || !wpPassword || !wpApiUrl) {
      console.warn('WordPress credentials not configured')
      // Return a mock response if WordPress isn't configured
      return NextResponse.json({
        success: true,
        imageId: Math.floor(Math.random() * 1000),
        imageUrl: '/placeholder-image.jpg', // You could serve the uploaded file temporarily
        message: 'WordPress not configured, using placeholder'
      })
    }

    // Create Basic Auth header
    const auth = Buffer.from(`${wpUsername}:${wpPassword}`).toString('base64')

    // Create form data for WordPress upload
    const uploadFormData = new FormData()
    const imageBlob = new Blob([imageBuffer], { type: mimeType })
    uploadFormData.append('file', imageBlob, filename)
    uploadFormData.append('title', title)
    uploadFormData.append('alt_text', altText)
    uploadFormData.append('caption', title)
    uploadFormData.append('description', `Image for case study: ${title}`)

    // Upload to WordPress media endpoint
    const mediaEndpoint = wpApiUrl.replace('/wp/v2/case', '/wp/v2/media')
    const uploadResponse = await fetch(mediaEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
      },
      body: uploadFormData
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
