"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { getFlagUrl } from "@/lib/country-mapping"
import { Globe } from "lucide-react"

interface FlagImageProps {
  isoCode: string
  size?: number
  className?: string
  title?: string
}

export function FlagImage({ isoCode, size = 16, className = "", title }: FlagImageProps) {
  const errorRef = useRef(false)
  const [imageKey, setImageKey] = useState(0)
  
  if (!isoCode || isoCode.length !== 2 || errorRef.current) {
    return (
      <span
        className={className}
        style={{ display: "inline-flex", width: size, height: size }}
        title={title ?? "Flag"}
        aria-label={title ?? "Flag"}
      >
        <Globe className="size-full shrink-0" aria-hidden />
      </span>
    )
  }
  
  const flagUrl = getFlagUrl(isoCode, size)
  const height = Math.round(size * 0.75)

  return (
    <Image
      src={flagUrl}
      alt={`${isoCode} flag`}
      width={size}
      height={height}
      key={`${isoCode}-${size}-${imageKey}`}
      className={className}
      style={{ width: size, height, objectFit: "cover", display: "inline-block" }}
      title={title}
      onError={() => {
        errorRef.current = true
        setImageKey((prev) => prev + 1)
      }}
      loading="lazy"
      unoptimized
    />
  )
}
