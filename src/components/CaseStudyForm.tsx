'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Loader2, Send, Eye, CheckCircle, X, Monitor, Tablet, Smartphone, Edit3, RefreshCw, Edit, Upload, Image as ImageIcon, Sparkles } from 'lucide-react'
import UCtelLogo from './UCtelLogo'

interface CaseStudyFormData {
  clientName: string
  industry: string
  mainChallenge: string
  solutionProvided: string
  location: string
  projectScale: string
  technologiesUsed: string
  additionalContext?: string
  customPrompt?: string
}

interface GeneratedCaseStudy {
  title: string
  sections: {
    summary: string
    client: string
    challenges: string
    solution: string
    results: string
  }
  wordpressContent: string
  sidebarContent: {
    challenge: string
    results: string
  }
  previewQuote: string
  imagePrompt: string
}

export function CaseStudyForm() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<GeneratedCaseStudy | null>(null)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [publishStatus, setPublishStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [publishError, setPublishError] = useState<string>('')
  const [showPreview, setShowPreview] = useState(false)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [showPromptEditor, setShowPromptEditor] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')
  const [autoGenerateImage, setAutoGenerateImage] = useState(true)
  const [showImagePromptEditor, setShowImagePromptEditor] = useState(false)
  const [customImagePrompt, setCustomImagePrompt] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState<GeneratedCaseStudy | null>(null)
  const [imageOption, setImageOption] = useState<'ai' | 'upload' | 'none'>('ai')
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<CaseStudyFormData>()
  
  // Watch form fields to build a dynamic default prompt
  const wClientName = watch('clientName') || '[Client Name]'
  const wIndustry = watch('industry') || '[Industry]'
  const wMainChallenge = watch('mainChallenge') || '[Main Challenge]'
  const wSolutionProvided = watch('solutionProvided') || '[Solution Provided]'
  const wLocation = watch('location')
  const wProjectScale = watch('projectScale')
  const wTechnologies = watch('technologiesUsed')
  const wAdditionalContext = watch('additionalContext')

  const buildDefaultPrompt = () => `Create a professional, detailed case study for UCtel (mobile signal boosting company) with the following information:\n\nClient: ${wClientName}\nIndustry: ${wIndustry}\nChallenge: ${wMainChallenge}\nSolution: ${wSolutionProvided}\n${wLocation ? `Location: ${wLocation}` : ''}\n${wProjectScale ? `Scale: ${wProjectScale}` : ''}\n${wTechnologies ? `Technologies: ${wTechnologies}` : ''}\n${wAdditionalContext ? `Additional Context: ${wAdditionalContext}` : ''}\n\nGenerate a comprehensive case study with these exact sections:\n\n**SUMMARY**\nWrite 1-2 detailed sentences explaining: the client's situation, the specific connectivity challenges they faced, UCtel's solution approach, and the overall impact/results achieved. Make it engaging and comprehensive.\n\n**THE CLIENT**\nWrite 1-2 sentences describing: the client organisation in detail, their industry position, location specifics, size/scale, what makes them unique, and why reliable connectivity was crucial for their operations.\n\n**THE CHALLENGES**\nWrite 1-2 sentences detailing: specific technical connectivity issues, coverage problems, user impact, business consequences, any unique environmental factors, regulatory considerations, and why these challenges were particularly difficult for this client.\n\n**THE SOLUTION**\nWrite 1-2 sentences explaining: UCtel's technical approach, specific equipment utilised (CEL-FI models, antenna systems, etc.), installation process, technical specifications, implementation timeline, partnerships involved, and why this solution was optimised for their needs.\n\n**THE RESULTS**\nWrite 1-2 sentences covering: specific improvements realised, measurable results, user feedback, business benefits, implementation timeline, client satisfaction, and any future-looking statements or calls to action.\n\n**SIDEBAR_CHALLENGE**\nWrite 1 sentence summarising the main connectivity challenge for the sidebar.\n\n**SIDEBAR_RESULTS**\nWrite 1 sentence summarising the key results and benefits realised for the sidebar.\n\n**CLIENT_QUOTE**\nCreate a realistic, compelling quote from the client expressing satisfaction with UCtel's solution and its business impact.\n\nWrite in a professional, technical tone suitable for B2B audiences. Use specific technical terms, mention measurable improvements, and include concrete details. Each section should be substantial and informative, similar to UCtel's existing case studies.`

  const buildDefaultImagePrompt = () => `Professional exterior photograph of ${wClientName} building in ${wLocation || 'modern urban setting'}, ${wIndustry} sector, corporate architecture, high quality, business photography style`

  // When opening the prompt editor for the first time (and empty), populate with default
  useEffect(() => {
    if (showPromptEditor && !customPrompt) {
      setCustomPrompt(buildDefaultPrompt())
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPromptEditor])

  useEffect(() => {
    if (showImagePromptEditor && !customImagePrompt) {
      setCustomImagePrompt(buildDefaultImagePrompt())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showImagePromptEditor])

  const resetPromptToDefault = () => setCustomPrompt(buildDefaultPrompt())
  const resetImagePromptToDefault = () => setCustomImagePrompt(buildDefaultImagePrompt())

  // Reset loading states on component mount to prevent stuck states
  useEffect(() => {
    setIsGenerating(false)
    setIsPublishing(false)
  }, [])

  const onSubmit = async (data: CaseStudyFormData) => {
    setIsGenerating(true)
    try {
      // Determine image generation settings based on user selection
      let imageSettings = {}
      
      if (imageOption === 'ai') {
        imageSettings = {
          generateImage: autoGenerateImage,
          customImagePrompt: customImagePrompt || undefined
        }
      } else if (imageOption === 'upload' && uploadedImageUrl) {
        imageSettings = {
          generateImage: false,
          providedImageUrl: uploadedImageUrl
        }
      } else {
        // No image
        imageSettings = {
          generateImage: false
        }
      }

      const response = await fetch('/api/generate-case-study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          customPrompt: customPrompt || undefined,
          ...imageSettings
        }),
      })
      
      if (!response.ok) throw new Error('Failed to generate case study')
      
      const result = await response.json()
      setGeneratedContent(result)
      
      // Set the appropriate image based on the option
      if (imageOption === 'ai' && result.imageUrl) {
        setGeneratedImage(result.imageUrl)
      } else if (imageOption === 'upload' && uploadedImageUrl) {
        setGeneratedImage(uploadedImageUrl)
      } else {
        setGeneratedImage(null)
      }
      
      setShowPreview(true)
    } catch (error) {
      console.error('Error generating case study:', error)
      alert('Error generating case study. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const publishToWordPress = async () => {
    if (!generatedContent) return
    
    setIsPublishing(true)
    setPublishStatus('idle')
    setPublishError('')
    
    try {
      const currentImageUrl = getCurrentImageUrl()
      
      // Include the current image URL if available
      const publishData = {
        ...generatedContent,
        ...(currentImageUrl && { imageUrl: currentImageUrl })
      }

      const response = await fetch('/api/publish-to-wordpress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(publishData),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || errorData.error || 'Failed to publish to WordPress')
      }
      
      const result = await response.json()
      setPublishStatus('success')
      console.log('Published to WordPress:', result.url)
    } catch (error) {
      console.error('Error publishing to WordPress:', error)
      setPublishError(error instanceof Error ? error.message : String(error))
      setPublishStatus('error')
    } finally {
      setIsPublishing(false)
    }
  }

  const handleEditContent = () => {
    if (generatedContent) {
      setEditedContent({ ...generatedContent })
      setIsEditing(true)
    }
  }

  const handleSaveEdits = () => {
    if (editedContent) {
      setGeneratedContent(editedContent)
      setIsEditing(false)
    }
  }

  const handleCancelEdits = () => {
    setEditedContent(null)
    setIsEditing(false)
  }

  const updateEditedContent = (field: string, value: string, subField?: string) => {
    if (!editedContent) return
    
    setEditedContent(prev => {
      if (!prev) return null
      
      if (subField) {
        const fieldValue = prev[field as keyof typeof prev] as any
        return {
          ...prev,
          [field]: {
            ...fieldValue,
            [subField]: value
          }
        }
      } else {
        return {
          ...prev,
          [field]: value
        }
      }
    })
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, etc.)')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }

    setUploadedImage(file)
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file)
    setUploadedImageUrl(previewUrl)

    // Upload to WordPress if we want to store it there
    setIsUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/upload-image-to-wordpress', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        setUploadedImageUrl(result.url) // Use WordPress URL instead of local preview
      } else {
        console.warn('Failed to upload to WordPress, using local preview')
      }
    } catch (error) {
      console.warn('Failed to upload to WordPress, using local preview:', error)
    } finally {
      setIsUploadingImage(false)
    }
  }

  const removeUploadedImage = () => {
    setUploadedImage(null)
    if (uploadedImageUrl) {
      URL.revokeObjectURL(uploadedImageUrl)
      setUploadedImageUrl(null)
    }
  }

  // Get the current image URL based on selected option
  const getCurrentImageUrl = () => {
    switch (imageOption) {
      case 'ai':
        return generatedImage
      case 'upload':
        return uploadedImageUrl
      case 'none':
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <UCtelLogo width={120} height={32} />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Case Study Generator</h1>
              <p className="text-gray-600">Professional case studies for mobile signal boosting solutions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Main Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Client Information */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-uctel-primary to-uctel-secondary px-6 py-4">
              <h2 className="text-xl font-semibold text-white">Client Information</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Name *
                  </label>
                  <input
                    {...register('clientName', { required: 'Client name is required' })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uctel-primary focus:border-transparent"
                    placeholder="Enter client company name"
                  />
                  {errors.clientName && (
                    <p className="text-red-500 text-sm mt-1">{errors.clientName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry *
                  </label>
                  <input
                    {...register('industry', { required: 'Industry is required' })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uctel-primary focus:border-transparent"
                    placeholder="e.g., Healthcare, Education, Manufacturing"
                  />
                  {errors.industry && (
                    <p className="text-red-500 text-sm mt-1">{errors.industry.message}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  {...register('location')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uctel-primary focus:border-transparent"
                  placeholder="City, State/Province, Country"
                />
              </div>
            </div>
          </div>

          {/* Challenge & Solution */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-uctel-primary to-uctel-secondary px-6 py-4">
              <h2 className="text-xl font-semibold text-white">Challenge & Solution</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Main Challenge *
                </label>
                <textarea
                  {...register('mainChallenge', { required: 'Main challenge is required' })}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uctel-primary focus:border-transparent"
                  placeholder="Describe the primary connectivity or signal challenge the client faced"
                />
                {errors.mainChallenge && (
                  <p className="text-red-500 text-sm mt-1">{errors.mainChallenge.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Solution Provided *
                </label>
                <textarea
                  {...register('solutionProvided', { required: 'Solution is required' })}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uctel-primary focus:border-transparent"
                  placeholder="Describe the UCtel solution that was implemented"
                />
                {errors.solutionProvided && (
                  <p className="text-red-500 text-sm mt-1">{errors.solutionProvided.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-uctel-primary to-uctel-secondary px-6 py-4">
              <h2 className="text-xl font-semibold text-white">Project Details</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Scale
                  </label>
                  <input
                    {...register('projectScale')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uctel-primary focus:border-transparent"
                    placeholder="e.g., Single building, Campus-wide, Multi-site"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Technologies Used
                  </label>
                  <input
                    {...register('technologiesUsed')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uctel-primary focus:border-transparent"
                    placeholder="e.g., CEL-FI GO, CEL-FI QUATRA, DAS"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Context
                </label>
                <textarea
                  {...register('additionalContext')}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uctel-primary focus:border-transparent"
                  placeholder="Any additional details about the project, timeline, special requirements, etc."
                />
              </div>
            </div>
          </div>

          {/* Advanced Options */}
          <details className="bg-white rounded-xl shadow-lg overflow-hidden">
            <summary className="bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-4 text-white cursor-pointer font-semibold">
              Advanced Options
            </summary>
            <div className="p-6 space-y-4">
              {/* Image Generation Options */}
              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center space-x-3 mb-4">
                  <input
                    type="checkbox"
                    id="autoGenerateImage"
                    checked={autoGenerateImage}
                    onChange={(e) => setAutoGenerateImage(e.target.checked)}
                    className="h-4 w-4 text-uctel-primary border-gray-300 rounded focus:ring-uctel-primary"
                  />
                  <label htmlFor="autoGenerateImage" className="text-sm font-medium text-gray-700">
                    Generate hero image automatically
                  </label>
                </div>
                
                {autoGenerateImage && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Image Generation Prompt
                      </label>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => setShowImagePromptEditor(!showImagePromptEditor)}
                          className="text-sm text-uctel-primary hover:text-uctel-secondary flex items-center space-x-1"
                        >
                          <Edit3 size={14} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={resetImagePromptToDefault}
                          className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
                        >
                          <RefreshCw size={14} />
                          <span>Reset</span>
                        </button>
                      </div>
                    </div>
                    
                    {showImagePromptEditor && (
                      <textarea
                        value={customImagePrompt}
                        onChange={(e) => setCustomImagePrompt(e.target.value)}
                        rows={3}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uctel-primary focus:border-transparent text-sm"
                        placeholder="Describe the type of image you want generated..."
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Custom Prompt Editor */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    AI Generation Prompt
                  </label>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowPromptEditor(!showPromptEditor)}
                      className="text-sm text-uctel-primary hover:text-uctel-secondary flex items-center space-x-1"
                    >
                      <Edit3 size={14} />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={resetPromptToDefault}
                      className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
                    >
                      <RefreshCw size={14} />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>
                
                {showPromptEditor && (
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    rows={15}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uctel-primary focus:border-transparent text-sm font-mono"
                    placeholder="Customize the AI prompt for case study generation..."
                  />
                )}
              </div>
            </div>

            {/* Image Options Section */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Image Generation
              </label>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="image-ai"
                    name="imageOption"
                    value="ai"
                    checked={imageOption === 'ai'}
                    onChange={(e) => setImageOption(e.target.value as 'ai' | 'upload' | 'none')}
                    className="h-4 w-4 text-uctel-primary focus:ring-uctel-primary border-gray-300"
                  />
                  <label htmlFor="image-ai" className="ml-3 block text-sm text-gray-700">
                    <div className="flex items-center">
                      <Sparkles className="h-4 w-4 text-uctel-primary mr-2" />
                      Generate with AI
                    </div>
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="radio"
                    id="image-upload"
                    name="imageOption"
                    value="upload"
                    checked={imageOption === 'upload'}
                    onChange={(e) => setImageOption(e.target.value as 'ai' | 'upload' | 'none')}
                    className="h-4 w-4 text-uctel-primary focus:ring-uctel-primary border-gray-300"
                  />
                  <label htmlFor="image-upload" className="ml-3 block text-sm text-gray-700">
                    <div className="flex items-center">
                      <Upload className="h-4 w-4 text-uctel-secondary mr-2" />
                      Upload custom image
                    </div>
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="radio"
                    id="image-none"
                    name="imageOption"
                    value="none"
                    checked={imageOption === 'none'}
                    onChange={(e) => setImageOption(e.target.value as 'ai' | 'upload' | 'none')}
                    className="h-4 w-4 text-uctel-primary focus:ring-uctel-primary border-gray-300"
                  />
                  <label htmlFor="image-none" className="ml-3 block text-sm text-gray-700">
                    <div className="flex items-center">
                      <ImageIcon className="h-4 w-4 text-gray-500 mr-2" />
                      No image
                    </div>
                  </label>
                </div>
              </div>

              {/* File Upload Section */}
              {imageOption === 'upload' && (
                <div className="mt-4">
                  {!uploadedImage ? (
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="image-upload-input"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-3 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                        </div>
                        <input
                          id="image-upload-input"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={isUploadingImage}
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative inline-block">
                        <img
                          src={uploadedImageUrl || ''}
                          alt="Uploaded preview"
                          className="h-32 w-auto rounded-lg border shadow-sm"
                        />
                        {isUploadingImage && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={removeUploadedImage}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Remove image
                        </button>
                        <label
                          htmlFor="image-replace-input"
                          className="text-sm text-uctel-primary hover:text-uctel-secondary cursor-pointer"
                        >
                          Replace image
                        </label>
                        <input
                          id="image-replace-input"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={isUploadingImage}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </details>

          {/* Generate Button */}
          <button
            type="submit"
            disabled={isGenerating || isUploadingImage}
            className="w-full bg-gradient-to-r from-uctel-primary to-uctel-secondary text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Generating Case Study...</span>
              </>
            ) : (
              <>
                <Send size={20} />
                <span>Generate Case Study</span>
              </>
            )}
          </button>
        </form>

        {/* Results Section */}
        {generatedContent && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
              <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                <CheckCircle size={24} />
                <span>Case Study Generated Successfully</span>
              </h2>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{(editedContent || generatedContent).title}</h3>
                <p className="text-gray-600 italic">&quot;{(editedContent || generatedContent).previewQuote}&quot;</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowPreview(true)}
                  className="flex-1 bg-uctel-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-uctel-secondary transition-colors flex items-center justify-center space-x-2"
                >
                  <Eye size={18} />
                  <span>Preview</span>
                </button>
                
                <button
                  onClick={handleEditContent}
                  className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Edit size={18} />
                  <span>Edit Content</span>
                </button>
                
                <button
                  onClick={publishToWordPress}
                  disabled={isPublishing}
                  className="flex-1 bg-uctel-secondary text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Publish to WordPress</span>
                    </>
                  )}
                </button>
              </div>

              {/* Publish Status */}
              {publishStatus === 'success' && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-green-800">
                    <CheckCircle size={20} />
                    <span className="font-medium">Successfully published to WordPress!</span>
                  </div>
                </div>
              )}

              {publishStatus === 'error' && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-red-800">
                    <X size={20} />
                    <span className="font-medium">Publishing failed: {publishError}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {showPreview && generatedContent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            {(() => {
              // Use edited content if available, otherwise use original generated content
              const contentToPreview = editedContent || generatedContent
              return (
            <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] flex flex-col">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-uctel-primary to-uctel-secondary px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <UCtelLogo width={80} height={24} />
                  <h2 className="text-xl font-semibold text-white">Case Study Preview</h2>
                </div>
                <div className="flex items-center space-x-4">
                  {/* Device Toggle */}
                  <div className="flex bg-white bg-opacity-20 rounded-lg p-1">
                    <button
                      onClick={() => setPreviewDevice('desktop')}
                      className={`p-2 rounded ${previewDevice === 'desktop' ? 'bg-white text-uctel-primary' : 'text-white hover:bg-white hover:bg-opacity-20'}`}
                    >
                      <Monitor size={18} />
                    </button>
                    <button
                      onClick={() => setPreviewDevice('tablet')}
                      className={`p-2 rounded ${previewDevice === 'tablet' ? 'bg-white text-uctel-primary' : 'text-white hover:bg-white hover:bg-opacity-20'}`}
                    >
                      <Tablet size={18} />
                    </button>
                    <button
                      onClick={() => setPreviewDevice('mobile')}
                      className={`p-2 rounded ${previewDevice === 'mobile' ? 'bg-white text-uctel-primary' : 'text-white hover:bg-white hover:bg-opacity-20'}`}
                    >
                      <Smartphone size={18} />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => setShowPreview(false)}
                    className="text-white hover:text-gray-200 p-2"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-auto bg-gray-100 p-4">
                <div className={`mx-auto transition-all duration-300 ${
                  previewDevice === 'desktop' ? 'max-w-6xl' :
                  previewDevice === 'tablet' ? 'max-w-2xl' : 'max-w-sm'
                }`}>
                  <div className="bg-white shadow-lg">
                    {/* Hero Section */}
                    <div className="relative bg-gradient-to-r from-uctel-primary to-uctel-secondary text-white p-8">
                      <h1 className="text-3xl md:text-4xl font-bold max-w-3xl leading-tight">{contentToPreview.title.replace('Case Study: ', '')}</h1>
                      {generatedImage && (
                        <div className="mt-6 rounded-lg overflow-hidden shadow-lg">
                                                  {getCurrentImageUrl() && (
                          <img src={getCurrentImageUrl()!} alt={contentToPreview.title} className="w-full h-64 object-cover" />
                        )}
                        </div>
                      )}
                    </div>

                    {/* Breadcrumb */}
                    <div className="bg-white border-b px-8 py-3 text-xs md:text-sm text-gray-600">Home / Case Studies / {contentToPreview.title.replace('Case Study: ', '')}</div>

                    {/* Content */}
                    <div className="flex flex-col lg:flex-row">
                      {/* Sidebar */}
                      <div className="lg:w-1/3 bg-gray-50 p-6 border-r">
                        <div className="space-y-6">
                          {contentToPreview.sidebarContent.challenge && (
                            <div>
                              <h3 className="font-semibold text-gray-900 mb-2">The Challenge</h3>
                              <div className="text-sm text-gray-700 leading-relaxed">
                                {contentToPreview.sidebarContent.challenge}
                              </div>
                            </div>
                          )}
                          {contentToPreview.sidebarContent.results && (
                            <div>
                              <h3 className="font-semibold text-gray-900 mb-2">The Results</h3>
                              <div className="text-sm text-gray-700 leading-relaxed">
                                {contentToPreview.sidebarContent.results}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Main Content */}
                      <div className="lg:w-2/3 p-8 space-y-8">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 mb-4">Summary</h2>
                          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{contentToPreview.sections.summary}</p>
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 mb-4">The Client</h2>
                          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{contentToPreview.sections.client}</p>
                          {generatedImage && (
                            <div className="mt-4">
                                                          {getCurrentImageUrl() && (
                              <img src={getCurrentImageUrl()!} alt={contentToPreview.title} className="w-full rounded shadow" />
                            )}
                            </div>
                          )}
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 mb-4">The Challenges</h2>
                          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{contentToPreview.sections.challenges}</p>
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 mb-4">The Solution</h2>
                          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{contentToPreview.sections.solution}</p>
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 mb-4">The Results</h2>
                          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{contentToPreview.sections.results}</p>
                        </div>

                        {/* Quote */}
                        <div className="bg-gradient-to-r from-uctel-primary to-uctel-secondary p-6 rounded-lg">
                          <blockquote className="text-white text-lg italic font-medium">
                            &quot;{contentToPreview.previewQuote}&quot;
                          </blockquote>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
              )
            })()}
          </div>
        )}

        {/* Edit Modal */}
        {isEditing && editedContent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Edit size={24} className="text-white" />
                  <h2 className="text-xl font-semibold text-white">Edit Case Study Content</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSaveEdits}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <CheckCircle size={16} />
                    <span>Save Changes</span>
                  </button>
                  <button
                    onClick={handleCancelEdits}
                    className="text-white hover:text-gray-200 p-2"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-auto p-6 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={editedContent.title}
                    onChange={(e) => updateEditedContent('title', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uctel-primary focus:border-transparent"
                  />
                </div>

                {/* Client Quote */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Client Quote</label>
                  <textarea
                    value={editedContent.previewQuote}
                    onChange={(e) => updateEditedContent('previewQuote', e.target.value)}
                    rows={2}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uctel-primary focus:border-transparent"
                  />
                </div>

                {/* Sidebar Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sidebar - Challenge</label>
                    <textarea
                      value={editedContent.sidebarContent.challenge}
                      onChange={(e) => updateEditedContent('sidebarContent', e.target.value, 'challenge')}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uctel-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sidebar - Results</label>
                    <textarea
                      value={editedContent.sidebarContent.results}
                      onChange={(e) => updateEditedContent('sidebarContent', e.target.value, 'results')}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uctel-primary focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Main Sections */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Summary</label>
                    <textarea
                      value={editedContent.sections.summary}
                      onChange={(e) => updateEditedContent('sections', e.target.value, 'summary')}
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uctel-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">The Client</label>
                    <textarea
                      value={editedContent.sections.client}
                      onChange={(e) => updateEditedContent('sections', e.target.value, 'client')}
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uctel-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">The Challenges</label>
                    <textarea
                      value={editedContent.sections.challenges}
                      onChange={(e) => updateEditedContent('sections', e.target.value, 'challenges')}
                      rows={5}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uctel-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">The Solution</label>
                    <textarea
                      value={editedContent.sections.solution}
                      onChange={(e) => updateEditedContent('sections', e.target.value, 'solution')}
                      rows={5}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uctel-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">The Results</label>
                    <textarea
                      value={editedContent.sections.results}
                      onChange={(e) => updateEditedContent('sections', e.target.value, 'results')}
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uctel-primary focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
