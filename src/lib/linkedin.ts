import { randomBytes } from 'crypto'
import path from 'path'
import { promises as fs } from 'fs'
import sharp from 'sharp'
import { generateLinkedInCaption, type LinkedInTemplateInput } from './linkedinTemplate'

const LINKEDIN_OAUTH_URL = 'https://www.linkedin.com/oauth/v2'
const LINKEDIN_API_BASE = 'https://api.linkedin.com/rest'
const LINKEDIN_API_VERSION = process.env.LINKEDIN_API_VERSION ?? '202401'

interface LinkedInTokenResponse {
  access_token: string
  expires_in: number
  refresh_token?: string
}

interface CachedTokenState {
  accessToken: string
  expiresAt: number
}

export interface LinkedInPostPayload {
  title: string
  commentary: string
  articleUrl?: string
  imageUrl?: string
  imageAltText?: string
}

export interface LinkedInPostResult {
  duplicate?: boolean
  duplicateOf?: string
  message?: string
  [key: string]: unknown
}

let cachedToken: CachedTokenState | null = null
let cachedLogoBuffer: Buffer | null = null

const formEncode = (payload: Record<string, string>) => {
  return Object.entries(payload)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&')
}

const requireEnv = (key: string): string => {
  const value = process.env[key]
  if (!value) {
    throw new Error(`${key} is not configured. Please set it in your environment variables.`)
  }
  return value
}

export const createStateToken = () => randomBytes(16).toString('hex')

export async function exchangeAuthorizationCode(code: string) {
  const clientId = requireEnv('LINKEDIN_CLIENT_ID')
  const clientSecret = requireEnv('LINKEDIN_CLIENT_SECRET')
  const redirectUri = requireEnv('LINKEDIN_REDIRECT_URI')

  const response = await fetch(`${LINKEDIN_OAUTH_URL}/accessToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formEncode({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`LinkedIn token exchange failed: ${response.status} ${errorText}`)
  }

  const data = (await response.json()) as LinkedInTokenResponse
  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
    refreshToken: data.refresh_token
  }
}

export async function refreshAccessToken(refreshToken: string) {
  const clientId = requireEnv('LINKEDIN_CLIENT_ID')
  const clientSecret = requireEnv('LINKEDIN_CLIENT_SECRET')

  const response = await fetch(`${LINKEDIN_OAUTH_URL}/accessToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formEncode({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`LinkedIn token refresh failed: ${response.status} ${errorText}`)
  }

  const data = (await response.json()) as LinkedInTokenResponse
  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
    refreshToken: data.refresh_token
  }
}

export async function getAccessToken(force = false) {
  if (!force && cachedToken && cachedToken.expiresAt > Date.now() + 60 * 1000) {
    return cachedToken.accessToken
  }

  const refreshToken = requireEnv('LINKEDIN_REFRESH_TOKEN')
  const tokens = await refreshAccessToken(refreshToken)
  cachedToken = {
    accessToken: tokens.accessToken,
    expiresAt: Date.now() + tokens.expiresIn * 1000
  }

  if (tokens.refreshToken && tokens.refreshToken !== refreshToken) {
    console.warn('LinkedIn provided a new refresh token - update LINKEDIN_REFRESH_TOKEN to keep the integration working.')
  }

  return tokens.accessToken
}

const linkedinHeaders = async (force?: boolean) => {
  const accessToken = await getAccessToken(force)
  return {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'LinkedIn-Version': LINKEDIN_API_VERSION,
    'X-Restli-Protocol-Version': '2.0.0'
  }
}

const parseJson = (text: string) => {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

const isDuplicateError = (status: number, payload: any) => {
  if (status !== 422 || !payload) return false
  if (payload?.errorDetails?.inputErrors?.some((error: any) => error?.code === 'DUPLICATE_POST')) {
    return true
  }
  const message = typeof payload?.message === 'string' ? payload.message : ''
  return message.includes('duplicate')
}

const extractDuplicateUrn = (payload: any) => {
  const message = typeof payload?.message === 'string' ? payload.message : ''
  const match = message.match(/urn:li:[\w:-]+/)
  return match ? match[0] : undefined
}

const getLogoBuffer = async () => {
  if (cachedLogoBuffer) return cachedLogoBuffer
  const logoPath = path.join(process.cwd(), 'public', 'images', 'uctel-logo.png')
  try {
    cachedLogoBuffer = await fs.readFile(logoPath)
    return cachedLogoBuffer
  } catch (error) {
    console.warn(`UCtel logo asset missing at ${logoPath}`, error)
    throw new Error('UCtel logo not found. Ensure public/images/uctel-logo.png exists for LinkedIn branding.')
  }
}

const downloadImageBuffer = async (url?: string) => {
  if (!url) return null
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download image for LinkedIn: ${response.status}`)
  }
  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

const brandImageWithLogo = async (buffer: Buffer) => {
  const { data: resizedBuffer, info } = await sharp(buffer)
    .resize({ width: 1200, height: 1200, fit: 'inside' })
    .jpeg({ quality: 92 })
    .toBuffer({ resolveWithObject: true })

  const width = info.width ?? 1200
  const height = info.height ?? 900
  const logoBuffer = await sharp(await getLogoBuffer())
    .resize({ width: Math.min(Math.round(width * 0.25), 320) })
    .png()
    .toBuffer()
  const logoMeta = await sharp(logoBuffer).metadata()
  const badgePadding = 24
  const badgeWidth = (logoMeta.width ?? 120) + badgePadding * 2
  const badgeHeight = (logoMeta.height ?? 60) + badgePadding * 2
  const badge = await sharp({
    create: {
      width: badgeWidth,
      height: badgeHeight,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 0.94 }
    }
  })
    .composite([{ input: logoBuffer, left: badgePadding, top: badgePadding }])
    .png()
    .toBuffer()

  const bannerHeight = Math.round(Math.min(height * 0.18, 220))
  const banner = await sharp({
    create: {
      width,
      height: bannerHeight,
      channels: 4,
      background: { r: 0, g: 91, b: 120, alpha: 0.75 }
    }
  })
    .png()
    .toBuffer()

  return sharp(resizedBuffer)
    .composite([
      { input: banner, left: 0, top: height - bannerHeight },
      { input: badge, left: 48, top: 48 }
    ])
    .jpeg({ quality: 90 })
    .toBuffer()
}

const registerLinkedInImageUpload = async (authorUrn: string) => {
  const headers = await linkedinHeaders()
  const response = await fetch(`${LINKEDIN_API_BASE}/assets?action=registerUpload`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      registerUploadRequest: {
        owner: authorUrn,
        recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
        serviceRelationships: [
          { relationshipType: 'OWNER', identifier: 'urn:li:userGeneratedContent' }
        ],
        supportedUploadMechanism: ['SYNCHRONOUS_UPLOAD']
      }
    })
  })

  if (!response.ok) {
    throw new Error(`LinkedIn asset registration failed: ${response.status} ${await response.text()}`)
  }

  const data = await response.json()
  const uploadMechanism = data?.value?.uploadMechanism?.['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest']
  if (!uploadMechanism?.uploadUrl || !data?.value?.asset) {
    throw new Error('LinkedIn asset registration response was missing upload details.')
  }

  return {
    asset: data.value.asset as string,
    uploadUrl: uploadMechanism.uploadUrl as string,
    headers: uploadMechanism.headers as Record<string, string> | undefined
  }
}

const uploadLinkedInImage = async (uploadUrl: string, imageBuffer: Buffer, extraHeaders?: Record<string, string>) => {
  const headers: Record<string, string> = {
    'Content-Type': 'image/jpeg',
    'Content-Length': imageBuffer.length.toString(),
    ...(extraHeaders || {})
  }
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers,
    body: imageBuffer as unknown as BodyInit
  })
  if (!response.ok) {
    throw new Error(`LinkedIn asset upload failed: ${response.status} ${await response.text()}`)
  }
}

const prepareLinkedInMediaAsset = async (authorUrn: string, imageUrl?: string) => {
  if (!imageUrl) return null
  try {
    const downloadBuffer = await downloadImageBuffer(imageUrl)
    if (!downloadBuffer) return null
    const branded = await brandImageWithLogo(downloadBuffer)
    const registration = await registerLinkedInImageUpload(authorUrn)
    await uploadLinkedInImage(registration.uploadUrl, branded, registration.headers)
    return registration.asset
  } catch (error) {
    console.warn('LinkedIn media preparation failed, continuing without image:', error)
    return null
  }
}

export async function publishLinkedInPost(payload: LinkedInPostPayload): Promise<LinkedInPostResult | null> {
  const authorUrn = requireEnv('LINKEDIN_ORG_URN')
  const mediaAsset = await prepareLinkedInMediaAsset(authorUrn, payload.imageUrl)
  const content = mediaAsset
    ? {
        media: {
          altText: payload.imageAltText || payload.title,
          id: mediaAsset
        }
      }
    : payload.articleUrl
      ? {
          article: {
            source: payload.articleUrl,
            title: payload.title
          }
        }
      : undefined

  const requestBody: Record<string, any> = {
    author: authorUrn,
    commentary: payload.commentary,
    visibility: 'PUBLIC',
    distribution: {
      feedDistribution: 'MAIN_FEED'
    },
    lifecycleState: 'PUBLISHED',
    isReshareDisabledByAuthor: false
  }

  if (content) {
    requestBody.content = content
  }

  console.log('[LinkedIn] publish payload:', JSON.stringify(requestBody))

  const sendRequest = async (force?: boolean) => {
    const headers = await linkedinHeaders(force)
    const response = await fetch(`${LINKEDIN_API_BASE}/posts`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    })
    const responseText = await response.text()
    return { response, responseText }
  }

  let { response, responseText } = await sendRequest()

  if (response.status === 401) {
    ({ response, responseText } = await sendRequest(true))
  }

  if (!response.ok) {
    const errorPayload = parseJson(responseText)
    if (isDuplicateError(response.status, errorPayload)) {
      const duplicateUrn = extractDuplicateUrn(errorPayload)
      const duplicateMessage = errorPayload?.message || 'LinkedIn rejected the post as a duplicate.'
      console.warn('[LinkedIn] Duplicate content detected:', duplicateUrn || 'unknown URN')
      return {
        duplicate: true,
        duplicateOf: duplicateUrn,
        message: duplicateMessage
      }
    }

    console.error('[LinkedIn] API error:', response.status, responseText)
    throw new Error(`LinkedIn post failed: ${response.status} ${responseText}`)
  }

  if (!responseText) {
    return null
  }

  try {
    return JSON.parse(responseText)
  } catch (parseError) {
    console.error('[LinkedIn] JSON parse failed:', parseError, responseText)
    throw new Error('LinkedIn post succeeded but response was not valid JSON')
  }
}

export function formatLinkedInCommentary(params: LinkedInTemplateInput) {
  return generateLinkedInCaption(params)
}
