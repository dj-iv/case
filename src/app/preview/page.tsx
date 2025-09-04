'use client'

import { useState, useEffect } from 'react'
import { Monitor, Tablet, Smartphone } from 'lucide-react'

export default function PreviewPage() {
  const [deviceType, setDeviceType] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [caseStudy, setCaseStudy] = useState<any>(null)

  useEffect(() => {
    // In a real app, you'd get this from session storage or URL params
    // For now, we'll use mock data similar to your UCtel case study
    setCaseStudy({
      title: "Boosting connectivity at one of central London's most innovative universities",
      sections: {
        summary: "In a university environment, students and staff need their mobile connections to be fast and reliable, no matter where they are on campus. University students are a data-hungry user base, and UCtel installed four CEL-FI QUATRA 1000 systems to provide the connectivity this community needed.",
        client: "Northeastern University London is a leading university in St. Katharine Docks, London, specialising in interdisciplinary and experiential learning.",
        challenges: "In the City of London, reliable connectivity was limited by location challenges, building materials dampening the signal, and the need for a solution that works with multiple mobile carriers.",
        solution: "UCtel installed four CEL-FI QUATRA 1000 systems to boost coverage of all major mobile networks in the building, with CAT-6 cabling for optimal performance.",
        results: "The system vastly improved mobile connection within the campus building's walls, providing all students and staff with consistently excellent mobile signal, regardless of which network they used."
      }
    })
  }, [])

  const getContainerClass = () => {
    switch (deviceType) {
      case 'mobile':
        return 'max-w-sm mx-auto'
      case 'tablet':
        return 'max-w-2xl mx-auto'
      default:
        return 'max-w-4xl mx-auto'
    }
  }

  if (!caseStudy) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      {/* Device Toggle */}
      <div className="bg-uctel-blue text-white py-4 mb-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setDeviceType('desktop')}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                deviceType === 'desktop' 
                  ? 'bg-white text-uctel-blue' 
                  : 'bg-uctel-blue-dark hover:bg-white hover:text-uctel-blue'
              }`}
            >
              <Monitor className="w-4 h-4 mr-2" />
              Desktop
            </button>
            <button
              onClick={() => setDeviceType('tablet')}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                deviceType === 'tablet' 
                  ? 'bg-white text-uctel-blue' 
                  : 'bg-uctel-blue-dark hover:bg-white hover:text-uctel-blue'
              }`}
            >
              <Tablet className="w-4 h-4 mr-2" />
              Tablet
            </button>
            <button
              onClick={() => setDeviceType('mobile')}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                deviceType === 'mobile' 
                  ? 'bg-white text-uctel-blue' 
                  : 'bg-uctel-blue-dark hover:bg-white hover:text-uctel-blue'
              }`}
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Mobile
            </button>
          </div>
        </div>
      </div>

      {/* Browser Mockup */}
      <div className={getContainerClass()}>
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Browser Header */}
          <div className="bg-gradient-to-r from-uctel-blue to-uctel-blue-dark px-4 py-3 flex items-center">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-white bg-opacity-30 rounded-full"></div>
              <div className="w-3 h-3 bg-white bg-opacity-30 rounded-full"></div>
              <div className="w-3 h-3 bg-white bg-opacity-30 rounded-full"></div>
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-white bg-opacity-20 rounded-full px-4 py-1 text-white text-sm">
                https://www.uctel.co.uk/case-studies/{caseStudy.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}
              </div>
            </div>
          </div>

          {/* Website Content */}
          <div className="p-8 max-w-4xl mx-auto">
            {/* UCtel Header */}
            <div className="border-b border-gray-200 pb-4 mb-8">
              <div className="text-2xl font-bold text-uctel-blue">UCtel</div>
            </div>

            {/* Breadcrumb */}
            <div className="text-sm text-gray-600 mb-6">
              <a href="#" className="text-uctel-blue hover:underline">Home</a>
              {' > '}
              <a href="#" className="text-uctel-blue hover:underline">Case Studies</a>
              {' > '}
              {caseStudy.title}
            </div>

            {/* Main Content */}
            <article>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 leading-tight">
                {caseStudy.title}
              </h1>

              <h2 className="text-2xl font-semibold text-uctel-blue mb-4">Summary</h2>
              <div className="bg-gray-50 p-6 rounded-lg mb-8 border-l-4 border-uctel-blue">
                <p className="text-gray-700 leading-relaxed">{caseStudy.sections.summary}</p>
              </div>

              <h2 className="text-2xl font-semibold text-uctel-blue mb-4">The Client</h2>
              <p className="text-gray-700 leading-relaxed mb-8">{caseStudy.sections.client}</p>

              <h2 className="text-2xl font-semibold text-uctel-blue mb-4">
                <strong>The Challenges</strong>
              </h2>
              <p className="text-gray-700 leading-relaxed mb-8">{caseStudy.sections.challenges}</p>

              <h2 className="text-2xl font-semibold text-uctel-blue mb-4">
                <strong>The Solution</strong>
              </h2>
              <p className="text-gray-700 leading-relaxed mb-8">{caseStudy.sections.solution}</p>

              <h2 className="text-2xl font-semibold text-uctel-blue mb-4">
                <strong>The Results</strong>
              </h2>
              <p className="text-gray-700 leading-relaxed mb-8">{caseStudy.sections.results}</p>

              {/* UCtel CTA Section */}
              <div className="bg-gradient-to-r from-uctel-blue to-uctel-blue-dark text-white p-8 rounded-lg text-center mt-12">
                <h3 className="text-xl font-semibold mb-4">
                  Contact UCtel and unlock better connectivity today
                </h3>
                <p className="mb-6 text-blue-100">
                  Looking for a mobile signal solution for your business? UCtel provides bespoke mobile signal boosting solutions across the UK.
                </p>
                <div className="space-x-4">
                  <button className="bg-white text-uctel-blue px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                    Contact Us
                  </button>
                  <button className="bg-white text-uctel-blue px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                    Learn More
                  </button>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  )
}
