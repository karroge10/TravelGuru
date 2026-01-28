"use client"

import { useState, useEffect } from "react"
import { WorldMap } from "@/components/world-map"
import { ClientOnly } from "@/components/client-only"

export default function Home() {
  const [nationality, setNationality] = useState<string | null>(null)
  const [secondaryNationality, setSecondaryNationality] = useState<string | null>(null)
  
  const handleNationalityChange = (value: string | null) => {
    setNationality(value)
  }
  
  const handleSecondaryNationalityChange = (value: string | null) => {
    setSecondaryNationality(value)
  }
  const [isLoading, setIsLoading] = useState(true)

  // Load saved nationality from localStorage on component mount
  useEffect(() => {
    const savedNationality = localStorage.getItem('selected-nationality')
    const savedSecondary = localStorage.getItem('selected-secondary-nationality')
    if (savedNationality) {
      setNationality(savedNationality)
    }
    if (savedSecondary) {
      setSecondaryNationality(savedSecondary)
    }
    setIsLoading(false)
  }, [])

  // Save nationality to localStorage whenever it changes
  useEffect(() => {
    if (nationality) {
      localStorage.setItem('selected-nationality', nationality)
    } else {
      localStorage.removeItem('selected-nationality')
    }
  }, [nationality])
  
  // Save secondary nationality to localStorage whenever it changes
  useEffect(() => {
    if (secondaryNationality) {
      localStorage.setItem('selected-secondary-nationality', secondaryNationality)
    } else {
      localStorage.removeItem('selected-secondary-nationality')
    }
  }, [secondaryNationality])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <ClientOnly fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <WorldMap 
        nationality={nationality} 
        onNationalityChange={handleNationalityChange}
        secondaryNationality={secondaryNationality}
        onSecondaryNationalityChange={handleSecondaryNationalityChange}
      />
    </ClientOnly>
  )
}
