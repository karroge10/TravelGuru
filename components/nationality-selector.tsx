"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Globe } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface NationalitySelectorProps {
  onSelect: (nationality: string) => void
}

const countries = [
  { name: "Russia", code: "RU" },
  { name: "United States", code: "US" },
  { name: "United Kingdom", code: "GB" },
  { name: "Canada", code: "CA" },
  { name: "Australia", code: "AU" },
  { name: "Germany", code: "DE" },
  { name: "France", code: "FR" },
  { name: "Italy", code: "IT" },
  { name: "Spain", code: "ES" },
  { name: "China", code: "CN" },
  { name: "Japan", code: "JP" },
  { name: "India", code: "IN" },
  { name: "Brazil", code: "BR" },
  { name: "Mexico", code: "MX" },
  { name: "South Korea", code: "KR" },
  { name: "Netherlands", code: "NL" },
  { name: "Switzerland", code: "CH" },
  { name: "Singapore", code: "SG" },
  { name: "New Zealand", code: "NZ" },
  { name: "Sweden", code: "SE" },
]

export function NationalitySelector({ onSelect }: NationalitySelectorProps) {
  const [selected, setSelected] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selected) {
      onSelect(selected)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6"
          >
            <Globe className="w-10 h-10 text-primary" />
          </motion.div>
          <h1 className="text-4xl font-bold mb-3 text-balance">Visa-Free Travel Planner</h1>
          <p className="text-muted-foreground text-lg">Discover where you can travel without visa restrictions</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nationality" className="text-base">
              Select your nationality
            </Label>
            <Select value={selected} onValueChange={setSelected}>
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Choose your country..." />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" size="lg" className="w-full h-12 text-base" disabled={!selected}>
            Start Planning
          </Button>
        </form>
      </motion.div>
    </div>
  )
}
