import React from "react"
import { Button } from "@/components/ui/button"
import { 
  Filter, 
  Flag, 
  RotateCcw, 
  Share2, 
  Save, 
  Download, 
  Home 
} from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuSeparator, 
  DropdownMenuCheckboxItem 
} from "@/components/ui/dropdown-menu"
import { NationalityDropdown } from "@/components/nationality-dropdown"
import { type Country } from "@/lib/visa-data"

interface WorldMapHeaderProps {
  nationality: string | null
  secondaryNationality: string | null
  onNationalityChange: (nationality: string | null) => void
  onSecondaryNationalityChange: ((nationality: string | null) => void) | undefined
  isRoutePlanned: boolean
  route: Country[]
  filters: {
    visaFree: boolean
    required: boolean
    eVisa: boolean
    onArrival: boolean
  }
  onFilterChange: (filter: string, value: boolean) => void
  onPlanRoute: () => void
  onCancelPlanning: () => void
  onReset: () => void
  onShare: () => void
  onSave: () => void
  onExport: () => void
}

export function WorldMapHeader({
  nationality,
  secondaryNationality,
  onNationalityChange,
  onSecondaryNationalityChange,
  isRoutePlanned,
  route,
  filters,
  onFilterChange,
  onPlanRoute,
  onCancelPlanning,
  onReset,
  onShare,
  onSave,
  onExport,
}: WorldMapHeaderProps) {
  return (
    <div className="border-b border-border bg-card/50 backdrop-blur-sm z-10 flex-shrink-0">
      <div className="px-3 py-3 sm:px-4 sm:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-2xl font-semibold">Visa Planner</h1>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">
              Made by{" "}
              <a
                href="https://egorkabantsov.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-2 hover:text-foreground hover:underline"
              >
                Egor Kabantsov
              </a>
            </p>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="size-8 sm:size-9"
              onClick={() => {
                onNationalityChange(null)
                if (onSecondaryNationalityChange) {
                  onSecondaryNationalityChange(null)
                }
                onReset()
              }}
              title="Reset and return to landing page"
            >
              <Home className="size-4" />
            </Button>

            {!isRoutePlanned && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1 sm:gap-2 bg-transparent h-8 sm:h-9">
                    <Filter className="size-3 sm:size-4" />
                    <span className="hidden sm:inline">Filter</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuCheckboxItem 
                    checked={filters.visaFree} 
                    onCheckedChange={(v) => onFilterChange("visaFree", v)}
                  >
                    Visa-Free
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem 
                    checked={filters.required} 
                    onCheckedChange={(v) => onFilterChange("required", v)}
                  >
                    Visa Required
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem 
                    checked={filters.eVisa} 
                    onCheckedChange={(v) => onFilterChange("eVisa", v)}
                  >
                    E-Visa
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem 
                    checked={filters.onArrival} 
                    onCheckedChange={(v) => onFilterChange("onArrival", v)}
                  >
                    Visa on Arrival
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <NationalityDropdown 
              nationality={nationality} 
              onNationalityChange={onNationalityChange}
              secondaryNationality={secondaryNationality}
              onSecondaryChange={onSecondaryNationalityChange}
              className="gap-1 sm:gap-2 h-8 sm:h-9"
            />

            {route.length >= 2 && !isRoutePlanned && (
              <Button onClick={onPlanRoute} size="sm" className="gap-1 sm:gap-2 h-8 sm:h-9">
                <Flag className="size-3 sm:size-4" />
                <span className="hidden sm:inline">Plan Route</span>
                <span className="sm:hidden">Plan</span>
              </Button>
            )}

            {isRoutePlanned && (
              <>
                <Button onClick={onCancelPlanning} variant="outline" size="sm" className="gap-1 sm:gap-2 bg-transparent h-8 sm:h-9">
                  <span className="hidden sm:inline">Edit Route</span>
                  <span className="sm:hidden">Edit</span>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1 sm:gap-2 bg-transparent h-8 sm:h-9">
                      <Share2 className="size-3 sm:size-4" />
                      <span className="hidden sm:inline">Share</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onShare}>
                      <Share2 className="size-4 mr-2" />
                      Share trip
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onSave}>
                      <Save className="size-4 mr-2" />
                      Save trip
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onExport}>
                      <Download className="size-4 mr-2" />
                      Export as JSON
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button onClick={onReset} variant="outline" size="sm" className="gap-1 sm:gap-2 h-8 sm:h-9">
                  <RotateCcw className="size-3 sm:size-4" />
                  <span className="hidden sm:inline">Reset</span>
                </Button>
              </>
            )}

            {route.length > 0 && !isRoutePlanned && (
              <Button onClick={onReset} variant="ghost" size="sm" className="gap-1 sm:gap-2 h-8 sm:h-9">
                <RotateCcw className="size-3 sm:size-4" />
                <span className="hidden sm:inline">Reset</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
