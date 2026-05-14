"use client"

import { useState } from "react"
import { WorldMap } from "@/components/world-map"
import { ClientOnly } from "@/components/client-only"

export function HomePage() {
  const [nationality, setNationality] = useState<string | null>(() => {
    if (typeof window === "undefined") return null
    return localStorage.getItem("selected-nationality")
  })
  const [secondaryNationality, setSecondaryNationality] = useState<string | null>(() => {
    if (typeof window === "undefined") return null
    return localStorage.getItem("selected-secondary-nationality")
  })

  const handleNationalityChange = (value: string | null) => {
    setNationality(value)
    if (value) {
      localStorage.setItem("selected-nationality", value)
    } else {
      localStorage.removeItem("selected-nationality")
    }
  }

  const handleSecondaryNationalityChange = (value: string | null) => {
    setSecondaryNationality(value)
    if (value) {
      localStorage.setItem("selected-secondary-nationality", value)
    } else {
      localStorage.removeItem("selected-secondary-nationality")
    }
  }

  return (
    <ClientOnly fallback={<div className="min-h-screen flex items-center justify-center" suppressHydrationWarning>Loading…</div>}>
      <WorldMap
        nationality={nationality}
        onNationalityChange={handleNationalityChange}
        secondaryNationality={secondaryNationality}
        onSecondaryNationalityChange={handleSecondaryNationalityChange}
      />
    </ClientOnly>
  )
}
