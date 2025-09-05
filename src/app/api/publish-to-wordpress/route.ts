import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Get request data (if any) - improved error handling
    let requestData;
    try {
      const body = await request.text()
      if (body && body.trim()) {
        requestData = JSON.parse(body)
      } else {
        requestData = null
      }
    } catch (parseError) {
      console.log('JSON parsing failed, using test data:', parseError)
      requestData = null
    }

    // Get WordPress credentials from environment
    const wpUsername = process.env.WORDPRESS_USERNAME
    const wpPassword = process.env.WORDPRESS_PASSWORD  
    const wpApiUrl = process.env.WORDPRESS_API_URL

    if (!wpUsername || !wpPassword || !wpApiUrl) {
      throw new Error('WordPress credentials not configured')
    }

    // Create Basic Auth header
    const auth = Buffer.from(`${wpUsername}:${wpPassword}`).toString('base64')

    // Start with the content provided by the frontend (should be Gutenberg-formatted HTML)
    let content = requestData?.wordpressContent || requestData?.sections?.summary || 'Test content'

    // Image handling variables
    let bannerImageId: number | false = false
    let previewImageId: number | false = false
    let featuredImageId = 0

    // Handle image upload if image URL is provided
    if (requestData?.imageUrl) {
      try {
        // Check if this is already a WordPress URL (already uploaded)
        const wpDomain = wpApiUrl.replace('/wp-json/wp/v2/case', '')
        let isWordPressUrl = requestData.imageUrl.includes(wpDomain) || requestData.imageUrl.includes('wp-content/uploads')
        
        // Force re-upload for all images to ensure proper ACF integration
        isWordPressUrl = false
        
        if (!isWordPressUrl) {
          const baseUrl = request.nextUrl.origin
          const uploadEndpoint = `${baseUrl}/api/upload-image-to-wordpress`
          const uploadResponse = await fetch(uploadEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageUrl: requestData.imageUrl,
              altText: `${requestData.title || 'Client'} building exterior`,
              title: requestData.title || 'Case Study Image'
            })
          })

          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json()
            const imageId = uploadResult.imageId
            bannerImageId = imageId
            previewImageId = imageId
            featuredImageId = uploadResult.imageId
            // Inject Gutenberg image block into post content (IN ADDITION to banner image)
            if (typeof content === 'string' && uploadResult.imageData?.url) {
              const alreadyHas = content.includes(`wp-image-${imageId}`)
              if (!alreadyHas) {
                const altEsc = (requestData.title || 'Case Study Image').replace(/"/g, '&quot;')
                const imageBlock = `<!-- wp:image {\"id\":${imageId},\"sizeSlug\":\"large\",\"linkDestination\":\"none\"} --><figure class=\"wp-block-image size-large\"><img src=\"${uploadResult.imageData.url}\" alt=\"${altEsc}\" class=\"wp-image-${imageId}\" /></figure><!-- /wp:image -->`
                
                // Insert after "THE CLIENT" section (before "The Challenges")
                const afterClientRegex = /(<!-- wp:heading --><h2 class=\"wp-block-heading\"><strong?>The Challenges<\/strong?><\/h2><!-- \/wp:heading -->)/
                if (afterClientRegex.test(content)) {
                  content = content.replace(afterClientRegex, imageBlock + '\n\n' + '$1')
                } else {
                  // Fallback: try to insert after any "Client" heading
                  const clientHeadingRegex = /(<!-- wp:heading --><h2 class=\"wp-block-heading\"><strong?>The Client<\/strong?><\/h2><!-- \/wp:heading -->[\s\S]*?)(<!-- wp:heading --><h2 class=\"wp-block-heading\"><strong?>[^<]*<\/strong?><\/h2><!-- \/wp:heading -->)/
                  if (clientHeadingRegex.test(content)) {
                    content = content.replace(clientHeadingRegex, '$1' + imageBlock + '\n\n' + '$2')
                  } else {
                    // Last resort: append at end of content
                    content += '\n\n' + imageBlock
                  }
                }
              }
            }
            
          } else {
            const failText = await uploadResponse.text().catch(()=>'<unreadable>')
            console.error('Failed to upload image:', uploadResponse.status, failText)
          }
        }
      } catch (imageError) {
        console.error('Error uploading image:', imageError)
        // Continue without image
      }
    }

    // Build ACF payload with numeric IDs. Include logo:false like example.
    const wrapWysiwyg = (val?: string) => {
      if (!val) return ''
      const trimmed = val.trim()
      if (!trimmed) return ''
      // If already contains a block or paragraph tag, leave it
      if (/<(p|h\d|ul|ol|blockquote|figure)\b/i.test(trimmed)) return trimmed
      return `<p>${trimmed}</p>`
    }

    const buildAcfPayload = (includeLogo: boolean) => {
      const payload: any = {
        ...(includeLogo ? { logo: null as any } : {}),
        banner: {
          header: requestData?.title || "",
          // Try different formats for ACF image field
          ...(bannerImageId ? { 
            image: bannerImageId,
            banner_image: bannerImageId,
            image_id: bannerImageId
          } : {})
        },
        sidebar: {
          texts: [
            {
              header: "The challenge",
              text: wrapWysiwyg(requestData?.sidebarContent?.challenge)
            },
            {
              header: "Results",
              text: wrapWysiwyg(requestData?.sidebarContent?.results)
            }
          ],
          // ACF link field expects {url,title,target}; supply empty structure so theme logic that checks for keys won't break
          button: { url: "", title: "", target: "" }
        },
        preview: {
          main_text: requestData?.title || "",
          quote: wrapWysiwyg(requestData?.previewQuote),
          author: "",
          author_position: "",
          // Try multiple image field formats
          ...(previewImageId ? { 
            image: previewImageId,
            preview_image: previewImageId,
            image_id: previewImageId
          } : {})
        },
        show_news: false
      }
      
      // If no image, try setting it explicitly to null or undefined instead of false
      if (!bannerImageId) {
        payload.banner.image = null
      }
      if (!previewImageId) {
        payload.preview.image = null
      }
      
      return payload
    }

    // Build the WordPress post data
    const basePostData = {
      content: content,
      status: 'draft',
      title: requestData?.title || "Test Case Study",
      ...(featuredImageId > 0 && {
        featured_media: featuredImageId,
        meta: {
          _thumbnail_id: featuredImageId,
          image_prompt: requestData?.imagePrompt || ''
        }
      })
    }

    // Create post with ACF data
    const postData = { ...basePostData, acf: buildAcfPayload(true) }

    const response = await fetch(wpApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData)
    })

    const responseData = await response.json()

    if (response.ok) {
      const postId = responseData.id
      const postUrl = responseData.link || `https://www.uctel.co.uk/?post_type=case&p=${postId}`
      console.log(`WordPress API Success: ${postId} ${responseData.status} ${postUrl}`)

      // Check if ACF fields were saved properly in the response
      const acfFields = responseData.acf || {}
      const missingFields = Object.keys(acfFields).filter(key => acfFields[key] === null).length > 0

      if (missingFields) {
        // Try to update ACF fields separately
        const acfPayload = buildAcfPayload(false)
        
        // Attempt ACF update via REST API
        const acfUpdateResponse = await fetch(`${wpApiUrl}/${postId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ acf: acfPayload })
        })

        if (acfUpdateResponse.ok) {
          const acfUpdateData = await acfUpdateResponse.json()
          console.log('ACF update success. Fields now:', Object.keys(acfUpdateData.acf || {}))
        }

        // Also try ACF v3 API if available
        try {
          const acfV3Response = await fetch(`${wpApiUrl.replace('/wp/v2/', '/acf/v3/')}/probe`, {
            method: 'GET',
            headers: { 'Authorization': `Basic ${auth}` }
          })

          if (acfV3Response.ok) {
            const acfV3UpdateResponse = await fetch(`${wpApiUrl.replace('/wp/v2/case', '/acf/v3/case')}/${postId}`, {
              method: 'POST',
              headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ fields: acfPayload })
            })

            if (acfV3UpdateResponse.ok) {
              const acfV3UpdateData = await acfV3UpdateResponse.json()
              console.log('ACF v3 update success fields:', Object.keys(acfV3UpdateData.fields || {}))
            }
          }
        } catch (acfV3Error) {
          // ACF v3 not available, continue
        }
      }

      return NextResponse.json({
        success: true,
        postId: postId,
        postUrl: postUrl,
        status: responseData.status,
        acfFields: responseData.acf
      })
    } else {
      console.error('WordPress API Error:', response.status, responseData)
      return NextResponse.json({ 
        error: 'Failed to publish to WordPress', 
        details: responseData,
        status: response.status
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error in publish-to-wordpress:', error)
    return NextResponse.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}
