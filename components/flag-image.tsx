"use client"

import { useState } from "react"
import { getFlagUrl } from "@/lib/country-mapping"
import { Globe } from "lucide-react"

interface FlagImageProps {
  isoCode: string
  size?: number
  className?: string
  title?: string
}

export function FlagImage({ isoCode, size = 16, className = "", title }: FlagImageProps) {
  const [error, setError] = useState(false)
  
  if (!isoCode || isoCode.length !== 2 || error) {
    return (
      <Globe 
        className={className} 
        style={{ width: size, height: size }} 
        title={title || "Flag"}
      />
    )
  }
  
  const flagUrl = getFlagUrl(isoCode, size)
  
  return (
    <img 
      src={flagUrl} 
      alt={`${isoCode} flag`}
      className={className}
      style={{ width: size, height: size * 0.75, objectFit: 'cover', display: 'inline-block' }}
      title={title}
      onError={() => setError(true)}
      loading="lazy"
    />
  )
}
