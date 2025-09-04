import React from 'react'

interface UCtelLogoProps {
  width?: number
  height?: number
  className?: string
}

export const UCtelLogo: React.FC<UCtelLogoProps> = ({ 
  width = 200, 
  height = 48, 
  className = "" 
}) => {
  return (
    <div className={`flex items-center ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/uctel-logo.png"
        alt="UCtel Logo"
        width={width}
        height={height}
        className="object-contain"
      />
    </div>
  )
}

export default UCtelLogo
