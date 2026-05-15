import React from "react"
import { Card } from "@/components/ui/card"
import { m } from "framer-motion"

interface WorldMapLegendProps {
  isMobile: boolean
}

export function WorldMapLegend({ isMobile }: WorldMapLegendProps) {
  return (
    <m.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`absolute ${isMobile ? 'top-2 left-2' : 'top-4 left-4'}`}
    >
      <Card className={`p-3 bg-card/95 backdrop-blur-sm ${isMobile ? 'max-w-[240px]' : 'max-w-[280px]'}`}>
        <h3 className="font-semibold mb-2 text-xs">Visa Requirements</h3>
        <div className="grid grid-cols-1 gap-1.5 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="size-3 rounded-sm" style={{ backgroundColor: "oklch(0.65 0.18 140)" }} />
            <span className={isMobile ? 'text-[10px]' : 'text-xs'}>Visa-Free</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-3 rounded-sm" style={{ backgroundColor: "oklch(0.70 0.20 60)" }} />
            <span className={isMobile ? 'text-[10px]' : 'text-xs'}>Visa on Arrival</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-3 rounded-sm" style={{ backgroundColor: "oklch(0.60 0.18 280)" }} />
            <span className={isMobile ? 'text-[10px]' : 'text-xs'}>eVisa</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-3 rounded-sm" style={{ backgroundColor: "oklch(0.55 0.22 25)" }} />
            <span className={isMobile ? 'text-[10px]' : 'text-xs'}>Visa Required</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-3 rounded-sm" style={{ backgroundColor: "oklch(0.35 0.15 0)" }} />
            <span className={isMobile ? 'text-[10px]' : 'text-xs'}>No Admission</span>
          </div>
        </div>
      </Card>
    </m.div>
  )
}
