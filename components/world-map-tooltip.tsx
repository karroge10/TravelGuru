import React from "react"
import { Card } from "@/components/ui/card"
import { m } from "framer-motion"
import { FlagImage } from "@/components/flag-image"

interface WorldMapTooltipProps {
  hoveredCountry: string
  hoveredCountryIso: string | null
  tooltipContent: string
  isMobile: boolean
  position: { x: number; y: number }
}

export function WorldMapTooltip({
  hoveredCountry,
  hoveredCountryIso,
  tooltipContent,
  isMobile,
  position
}: WorldMapTooltipProps) {
  return (
    <m.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed z-50 pointer-events-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <Card className={`px-3 py-2 bg-card/95 backdrop-blur-sm border-primary/20 shadow-lg ${isMobile ? 'text-xs' : 'px-4'}`}>
        <div className={`flex items-center gap-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
          {hoveredCountryIso ? (
            <FlagImage isoCode={hoveredCountryIso} size={16} className="inline-block flex-shrink-0" />
          ) : null}
          <p className="font-medium">{hoveredCountry}</p>
        </div>
        <p className={`text-muted-foreground capitalize ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
          {tooltipContent}
        </p>
      </Card>
    </m.div>
  )
}
