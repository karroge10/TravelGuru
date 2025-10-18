"use client"

import { useState } from "react"
import { NationalitySelector } from "@/components/nationality-selector"
import { WorldMap } from "@/components/world-map"
import { ClientOnly } from "@/components/client-only"

export default function Home() {
  const [nationality, setNationality] = useState<string | null>(null)

  const handleChangeNationality = () => {
    setNationality(null)
  }

  if (!nationality) {
    return (
      <ClientOnly fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <NationalitySelector onSelect={setNationality} />
      </ClientOnly>
    )
  }

  return (
    <ClientOnly fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <WorldMap nationality={nationality} onChangeNationality={handleChangeNationality} />
    </ClientOnly>
  )
}
