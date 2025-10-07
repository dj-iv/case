import { NextRequest, NextResponse } from 'next/server'

// Fetch WordPress category ID by name
async function getCategoryIdByName(categoryName: string, wpApiUrl: string, auth: string): Promise<number | null> {
  if (!categoryName) return null
  
  try {
    const categoriesUrl = wpApiUrl.replace('/wp/v2/case', '/wp/v2/case_category')
    // Search by name instead of slug
    const response = await fetch(`${categoriesUrl}?search=${encodeURIComponent(categoryName)}&per_page=100`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const categories = await response.json()
      // Find exact match by name
      const exactMatch = categories.find((cat: any) => cat.name === categoryName)
      if (exactMatch) {
        return exactMatch.id
      }
    }
  } catch (error) {
    console.log('Category fetch error:', error)
  }
  
  return null
}


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

    console.log('=== RECEIVED DATA DEBUG ===')
    console.log('Title:', requestData?.title)
    console.log('Industry:', requestData?.industry)
    console.log('Sections:', requestData?.sections)
    console.log('SidebarContent:', requestData?.sidebarContent)
    console.log('ImagePrompt:', requestData?.imagePrompt)
    console.log('PreviewQuote:', requestData?.previewQuote)
    console.log('WordPress Content length:', requestData?.wordpressContent?.length)
    console.log('WordPress Content preview:', requestData?.wordpressContent?.substring(0, 800))
    console.log('=== END RECEIVED DATA ===')

    // Get WordPress credentials from environment
    const wpUsername = process.env.WORDPRESS_USERNAME
    const wpPassword = process.env.WORDPRESS_PASSWORD  
    const wpApiUrl = process.env.WORDPRESS_API_URL

    if (!wpUsername || !wpPassword || !wpApiUrl) {
      throw new Error('WordPress credentials not configured')
    }

    // Create Basic Auth header
    const auth = Buffer.from(`${wpUsername}:${wpPassword}`).toString('base64')
    
    // Clean content and prepare WordPress data
    let content = requestData?.wordpressContent || "Test content"
    if (content !== "Test content") {
      // Clean content for WordPress and handle empty sections
      content = content
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
        .replace(/\r\n/g, '\n')
        .replace(/\n+/g, '\n')
        .replace(/\n/g, '')
        .replace(/>\s+</g, '><')
        // Remove empty paragraph blocks
        .replace(/<!-- wp:paragraph --><p><\/p><!-- \/wp:paragraph -->/g, '')
        .replace(/<!-- wp:paragraph --><p>\s*<\/p><!-- \/wp:paragraph -->/g, '')
        .trim()
    }

    // Enhanced approach: Include sidebar content and image handling
  // We'll keep just numeric IDs for ACF image fields (ACF expects an attachment ID when return format is Image Array)
  let bannerImageId: number | false = false
  let previewImageId: number | false = false
  let featuredImageId = 0

    // Handle image upload if image URL is provided
  if (requestData?.imageUrl) {
      try {
        console.log('Uploading image to WordPress...')
    const baseUrl = request.nextUrl.origin
    const uploadEndpoint = `${baseUrl}/api/upload-image-to-wordpress`
    console.log('Upload endpoint:', uploadEndpoint)
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
          console.log('Image uploaded successfully:', uploadResult.imageId)
          // Use numeric ID for ACF fields; WordPress/ACF will expand to full object on GET
          const imageId = uploadResult.imageId
          bannerImageId = imageId
          previewImageId = imageId
          featuredImageId = uploadResult.imageId
          // Inject Gutenberg image block into post content if not already present
          if (typeof content === 'string' && uploadResult.imageData?.url) {
            const alreadyHas = content.includes(`wp-image-${imageId}`)
            if (!alreadyHas) {
              const altEsc = (requestData.title || 'Case Study Image').replace(/"/g, '&quot;')
              const imageBlock = `<!-- wp:image {\"id\":${imageId},\"sizeSlug\":\"large\",\"linkDestination\":\"none\"} --><figure class=\"wp-block-image size-large\"><img src=\"${uploadResult.imageData.url}\" alt=\"${altEsc}\" class=\"wp-image-${imageId}\" /></figure><!-- /wp:image -->`
              const insertBeforeRegex = /(<!-- wp:heading --><h2 class=\"wp-block-heading\"><strong?>The Challenges<\/strong?><\/h2><!-- \/wp:heading -->)/
              if (insertBeforeRegex.test(content)) {
                content = content.replace(insertBeforeRegex, imageBlock + '$1')
                console.log('Inserted image block before The Challenges heading')
              } else {
                content += imageBlock
                console.log('Appended image block at end of content')
              }
            }
          }
        } else {
          const failText = await uploadResponse.text().catch(()=>'<unreadable>')
          console.error('Failed to upload image, continuing without image. Status:', uploadResponse.status, failText)
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

    const buildAcfPayload = (includeLogo: boolean) => ({
      ...(includeLogo ? { logo: null as any } : {}),
      banner: {
        header: requestData?.title || "",
        image: bannerImageId || false
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
        image: previewImageId || false
      },
      show_news: false
    })

    // Fetch category ID based on industry name
    const categoryId = requestData?.industry ? await getCategoryIdByName(requestData.industry, wpApiUrl, auth) : null
    console.log(`Industry: ${requestData?.industry}, Category ID: ${categoryId}`)

    const basePostData = {
      content: content,
      status: 'draft',
      title: requestData?.title || "Test Case Study",
      ...(categoryId && { case_category: [categoryId] }),
      ...(featuredImageId > 0 && {
        featured_media: featuredImageId,
        meta: {
          _thumbnail_id: featuredImageId,
          image_prompt: requestData?.imagePrompt || ''
        }
      })
    }

    // First attempt with logo:false (matches live example). If WP rejects logo, we'll retry without it.
    let postData: any = { ...basePostData, acf: buildAcfPayload(true) }

    console.log('Creating WordPress post without title:', wpApiUrl)
    console.log('=== DEBUGGING REQUEST ===')
    console.log('Request URL:', wpApiUrl)
    console.log('Request method: POST')
    console.log('Request headers: Authorization: Basic [hidden], Content-Type: application/json')
    console.log('Request body:', JSON.stringify(postData, null, 2))
    console.log('=== END DEBUG REQUEST ===')

    let response = await fetch(wpApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData)
    })

    console.log('=== DEBUGGING RESPONSE ===')
    console.log('Response status:', response.status)
    console.log('Response statusText:', response.statusText)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))
    console.log('=== END DEBUG RESPONSE ===')

    if (!response.ok) {
      const errorText = await response.text()
      console.error('WordPress API Error (initial attempt):', response.status, errorText)
      // If logo field caused validation issue, retry without logo
      if (/acf\[logo\]/i.test(errorText)) {
        console.log('Retrying without logo field due to validation error...')
        postData = { ...basePostData, acf: buildAcfPayload(false) }
        console.log('Retry request body:', JSON.stringify(postData, null, 2))
        response = await fetch(wpApiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(postData)
        })
        console.log('Retry response status:', response.status)
        if (!response.ok) {
          const retryError = await response.text()
            console.error('WordPress API Error (retry):', response.status, retryError)
            throw new Error(`WordPress API error after retry: ${response.status} - ${retryError}`)
        }
      } else {
        throw new Error(`WordPress API error: ${response.status} - ${errorText}`)
      }
    }

    // Parse JSON response directly
    let result
    try {
      result = await response.json()
      console.log('WordPress API Success:', result.id, result.status, result.link)
      console.log('ACF fields in response:', result.acf)
      // If ACF fields came back null or missing, perform a follow-up update to persist them.
      const acfMissing = !result.acf || !result.acf.banner || !result.acf.sidebar || !result.acf.preview
      if (acfMissing) {
        console.log('ACF fields missing after create; sending follow-up update...')
        const updateResponse = await fetch(`${wpApiUrl.replace(/\/wp\/v2\/case$/, `/wp/v2/case/${result.id}`)}`, {
          method: 'POST', // WP accepts POST to update existing post
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
          },
            body: JSON.stringify({
              acf: postData.acf
            })
        })
        console.log('ACF update status:', updateResponse.status)
        if (updateResponse.ok) {
          const updated = await updateResponse.json()
          console.log('ACF update success. Fields now:', Object.keys(updated.acf || {}))
          result = updated
        } else {
          const upErr = await updateResponse.text()
          console.warn('ACF update failed:', upErr)
        }

        // Try dedicated ACF REST API endpoint if available (plugin ACF to REST API)
        try {
          const acfV3Base = wpApiUrl.replace('/wp/v2/case', '/acf/v3/case')
          const probe = await fetch(`${acfV3Base}/${result.id}`, {
            headers: { 'Authorization': `Basic ${auth}` }
          })
          console.log('ACF v3 probe status:', probe.status)
          if (probe.ok) {
            console.log('ACF v3 endpoint detected; sending field update via /acf/v3')
            const acfV3Payload = {
              fields: {
                logo: null,
                banner: {
                  header: postData.acf.banner.header,
                  image: postData.acf.banner.image || null
                },
                sidebar: {
                  texts: postData.acf.sidebar.texts,
                  button: postData.acf.sidebar.button
                },
                preview: {
                  main_text: postData.acf.preview.main_text,
                  quote: postData.acf.preview.quote,
                  author: postData.acf.preview.author,
                  author_position: postData.acf.preview.author_position,
                  image: postData.acf.preview.image || null
                },
                show_news: false
              }
            }
            const acfV3Update = await fetch(`${acfV3Base}/${result.id}`, {
              method: 'POST',
              headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(acfV3Payload)
            })
            console.log('ACF v3 update status:', acfV3Update.status)
            if (acfV3Update.ok) {
              const acfV3Data = await acfV3Update.json()
              console.log('ACF v3 update success fields:', Object.keys(acfV3Data.fields || {}))
            } else {
              const acfV3Err = await acfV3Update.text()
              console.warn('ACF v3 update failed:', acfV3Err)
            }
          }
        } catch (acfV3Err) {
          console.warn('ACF v3 probe error:', acfV3Err)
        }
      }
      
    } catch (jsonError) {
      console.error('JSON parse error:', jsonError)
      throw new Error(`Invalid JSON response from WordPress: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Case study published to WordPress successfully!',
      url: result.link,
      id: result.id,
      previewNote: 'To preview the case study: 1) Open the draft in WordPress admin, 2) Click Save/Update, 3) Then preview will work properly',
      features: {
        sidebarIncluded: !!requestData?.sidebarContent,
        imagePromptIncluded: !!requestData?.imagePrompt,
        technologiesIncluded: !!requestData?.technologies,
        quoteIncluded: !!requestData?.previewQuote
      }
    })

  } catch (error) {
    console.error('Error publishing to WordPress:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to publish to WordPress',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
