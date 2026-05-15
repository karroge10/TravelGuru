"use client"

import React, { useState, useEffect, useMemo, useReducer, useEffectEvent } from "react"
import { AnimatePresence, LazyMotion, domAnimation } from "framer-motion"
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps"
import { Card } from "@/components/ui/card"
import { TripDetails } from "@/components/trip-details"
import { RouteLines } from "@/components/route-lines"
import { NationalityDropdown } from "@/components/nationality-dropdown"
import { calculateTotalDistance, type Country } from "@/lib/visa-data"
import { getISOFromGeographyId, getCountryNameFromCode } from "@/lib/country-mapping"
import { getVisaRequirementForCountry } from "@/lib/visa-service"
import { toast } from "sonner"
import { useIsMobile } from "@/hooks/use-mobile"
import { type MapGeography, getCentroidFromMapGeography } from "@/lib/map-geography"
import { useVisaRequirements } from "@/hooks/use-visa-requirements"
import { WorldMapHeader } from "@/components/world-map-header"
import { WorldMapLegend } from "@/components/world-map-legend"
import { WorldMapTooltip } from "@/components/world-map-tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Image from "next/image"

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

interface WorldMapProps {
  nationality: string | null
  onNationalityChange: (nationality: string | null) => void
  secondaryNationality?: string | null
  onSecondaryNationalityChange?: (nationality: string | null) => void
}

type Step = "select-start" | "select-destination" | "adding-countries"

interface PlannerState {
  isRoutePlanned: boolean
  route: Country[]
  step: Step
}

type PlannerAction =
  | { type: "add-country"; country: Country }
  | { type: "move-country"; fromIndex: number; toIndex: number }
  | { type: "remove-country"; index: number }
  | { type: "reset" }
  | { type: "restore"; isPlanned: boolean; route: Country[] }
  | { type: "set-planned"; value: boolean }
  | { type: "undo-last" }
  | { type: "update-country"; index: number; updates: Partial<Country> }

const initialPlannerState: PlannerState = {
  isRoutePlanned: false,
  route: [],
  step: "select-start",
}

function getStepForRoute(route: Country[]): Step {
  if (route.length === 0) return "select-start"
  if (route.length === 1) return "select-destination"
  return "adding-countries"
}

function plannerReducer(state: PlannerState, action: PlannerAction): PlannerState {
  switch (action.type) {
    case "add-country": {
      const route = [...state.route, action.country]
      return { ...state, route, step: getStepForRoute(route) }
    }
    case "move-country": {
      const route = [...state.route]
      const [moved] = route.splice(action.fromIndex, 1)
      route.splice(action.toIndex, 0, moved)
      return { ...state, route }
    }
    case "remove-country": {
      const route = state.route.filter((_, index) => index !== action.index)
      return {
        ...state,
        isRoutePlanned: route.length > 1 ? state.isRoutePlanned : false,
        route,
        step: getStepForRoute(route),
      }
    }
    case "reset":
      return initialPlannerState
    case "restore":
      return {
        isRoutePlanned: action.isPlanned,
        route: action.route,
        step: getStepForRoute(action.route),
      }
    case "set-planned":
      return { ...state, isRoutePlanned: action.value }
    case "undo-last": {
      const route = state.route.slice(0, -1)
      return {
        ...state,
        isRoutePlanned: route.length > 1 ? state.isRoutePlanned : false,
        route,
        step: getStepForRoute(route),
      }
    }
    case "update-country": {
      const route = [...state.route]
      route[action.index] = { ...route[action.index], ...action.updates }
      return { ...state, route }
    }
    default:
      return state
  }
}

function GeographiesWrapper({ 
  geoUrl, 
  onGeographiesLoad,
  getCountryColor, 
  handleCountryClick, 
  setHoveredCountry,
  setMousePosition,
  isRoutePlanned 
}: {
  geoUrl: string
  onGeographiesLoad: (geographies: MapGeography[]) => void
  getCountryColor: (geo: MapGeography) => string
  handleCountryClick: (geo: MapGeography) => void
  setHoveredCountry: (country: string | null) => void
  setMousePosition: (position: { x: number; y: number } | null) => void
  isRoutePlanned: boolean
}) {
  const hasLoadedRef = React.useRef(false)
  const throttledMouseMove = React.useRef<NodeJS.Timeout | null>(null)

  return (
    <Geographies geography={geoUrl}>
      {({ geographies }) => {
        if (!hasLoadedRef.current && geographies.length > 0) {
          hasLoadedRef.current = true
          setTimeout(() => {
            onGeographiesLoad(geographies as MapGeography[])
          }, 0)
        }

        return (
          <>
            {geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                onClick={() => handleCountryClick(geo)}
                onMouseEnter={(e: React.MouseEvent) => {
                  setHoveredCountry(geo.properties.name ?? null)
                  setMousePosition({ x: e.clientX, y: e.clientY })
                }}
                onMouseLeave={() => {
                  setHoveredCountry(null)
                  setMousePosition(null)
                }}
                onMouseMove={(e: React.MouseEvent) => {
                  if (throttledMouseMove.current) return
                  throttledMouseMove.current = setTimeout(() => {
                    setMousePosition({ x: e.clientX, y: e.clientY })
                    throttledMouseMove.current = null
                  }, 32)
                }}
                onTouchStart={(e: React.TouchEvent) => {
                  const touch = e.touches[0]
                  setHoveredCountry(geo.properties.name ?? null)
                  setMousePosition({ x: touch.clientX, y: touch.clientY })
                }}
                onTouchEnd={() => {
                  setTimeout(() => {
                    setHoveredCountry(null)
                    setMousePosition(null)
                  }, 1000)
                }}
                style={{
                  default: { fill: getCountryColor(geo), stroke: "#374151", strokeWidth: 0.3, outline: "none" },
                  hover: {
                    fill: isRoutePlanned ? getCountryColor(geo) : "oklch(0.75 0.15 180)",
                    stroke: "#374151",
                    strokeWidth: 0.3,
                    outline: "none",
                    cursor: isRoutePlanned ? "default" : "pointer",
                  },
                  pressed: { fill: isRoutePlanned ? getCountryColor(geo) : "oklch(0.75 0.15 180)", stroke: "#374151", strokeWidth: 0.3, outline: "none" },
                }}
              />
            ))}
          </>
        )
      }}
    </Geographies>
  )
}

export function WorldMap({ nationality, onNationalityChange, secondaryNationality = null, onSecondaryNationalityChange }: WorldMapProps) {
  const isMobile = useIsMobile()
  const [plannerState, dispatch] = useReducer(plannerReducer, initialPlannerState)
  const { isRoutePlanned, route, step } = plannerState

  const [uiState, setUiState] = useState({
    hoveredCountry: null as string | null,
    mousePosition: null as { x: number; y: number } | null,
    mapPosition: { coordinates: [0, 0] as [number, number], zoom: 1 },
    showResetDialog: false,
    showTripDetails: false,
  })

  const [filters, setFilters] = useState({
    visaFree: false,
    required: false,
    eVisa: false,
    onArrival: false,
  })

  const [allGeographies, setAllGeographies] = useState<MapGeography[]>([])
  const { requirements: visaRequirements, isLoading: isLoadingVisa } = useVisaRequirements(nationality, secondaryNationality)

  const persistTrip = (nextRoute: Country[], nextIsPlanned: boolean) => {
    if (typeof window === "undefined" || !nationality) return
    const storageKey = secondaryNationality ? `trip-${nationality}-${secondaryNationality}` : `trip-${nationality}`
    if (nextRoute.length === 0) {
      localStorage.removeItem(storageKey)
      return
    }
    localStorage.setItem(storageKey, JSON.stringify({ route: nextRoute, isPlanned: nextIsPlanned }))
  }

  const handleReset = () => {
    dispatch({ type: "reset" })
    setUiState(prev => ({ ...prev, showResetDialog: false }))
    persistTrip([], false)
    toast.info("Trip reset")
  }

  const handlePlanRoute = () => {
    dispatch({ type: "set-planned", value: true })
    persistTrip(route, true)
    const distance = calculateTotalDistance(route)
    toast.success("Route planned!", { description: `${distance.toLocaleString()} km total distance` })
  }

  const handleUndoLast = () => {
    if (route.length === 0) return
    const removed = route[route.length - 1]
    const nextRoute = route.slice(0, -1)
    dispatch({ type: "undo-last" })
    persistTrip(nextRoute, nextRoute.length > 1 ? isRoutePlanned : false)
    toast.info(`Removed: ${removed.name}`)
  }

  const handleCancelPlanning = () => {
    dispatch({ type: "set-planned", value: false })
    persistTrip(route, false)
    toast.info("Edit mode enabled")
  }

  const handleSaveTrip = () => {
    if (route.length === 0) {
      toast.error("No trip to save")
      return
    }
    persistTrip(route, isRoutePlanned)
    toast.success("Trip saved!")
  }

  const handleExport = () => {
    if (route.length === 0) {
      toast.error("No trip to export")
      return
    }
    const tripData = {
      nationality,
      route: route.map((c) => {
        const geo = allGeographies.find((g) => g.properties.name === c.name)
        const isoCode = geo ? getISOFromGeographyId(geo.id) : null
        return {
          name: c.name,
          dates: c.dates,
          notes: c.notes,
          visa: isoCode ? getVisaRequirementForCountry(isoCode, nationality, visaRequirements, secondaryNationality) : null,
        }
      }),
      totalDistance: calculateTotalDistance(route),
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(tripData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `trip-${nationality}-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Trip exported!")
  }

  const handleShare = async () => {
    if (route.length === 0) {
      toast.error("No trip to share")
      return
    }
    const totalDistance = calculateTotalDistance(route)
    const visaFreeCount = route.filter((c) => {
      const geo = allGeographies.find((g) => g.properties.name === c.name)
      const isoCode = geo ? getISOFromGeographyId(geo.id) : null
      if (!isoCode) return false
      if (isoCode === nationality || isoCode === secondaryNationality) return true
      const apiVisaReq = getVisaRequirementForCountry(isoCode, nationality!, visaRequirements, secondaryNationality)
      return apiVisaReq?.requirement === "visa-free"
    }).length
    const shareText = `🌍 My Visa Planner Trip Plan\n\n📍 Route: ${route.map((c) => c.name).join(" → ")}\n\n📊 Trip Stats:\n• Total Distance: ${totalDistance.toLocaleString()} km\n• Countries: ${route.length}\n• Visa-free countries: ${visaFreeCount}/${route.length}\n\n👤 Traveler: ${getCountryNameFromCode(nationality!)}${secondaryNationality ? ` and ${getCountryNameFromCode(secondaryNationality)}` : ''} passport holder${secondaryNationality ? 's' : ''}\n\nPlan your own visa-free routes at Visa Planner!`
    if (typeof window !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: "My Visa Planner Trip Plan", text: shareText })
        toast.success("Shared successfully!")
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          navigator.clipboard.writeText(shareText)
          toast.success("Copied to clipboard!")
        }
      }
    } else {
      navigator.clipboard.writeText(shareText)
      toast.success("Copied to clipboard!")
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined' || !nationality) return
    const storageKey = secondaryNationality ? `trip-${nationality}-${secondaryNationality}` : `trip-${nationality}`
    const savedTrip = localStorage.getItem(storageKey)
    if (savedTrip) {
      try {
        const parsed = JSON.parse(savedTrip)
        if (parsed.route && parsed.route.length > 0) {
          dispatch({ type: "restore", route: parsed.route, isPlanned: parsed.isPlanned || false })
        }
      } catch (e) {}
    }
  }, [nationality, secondaryNationality])

  const onPlanRouteEvent = useEffectEvent(handlePlanRoute)
  const onUndoLastEvent = useEffectEvent(handleUndoLast)
  const onSaveTripEvent = useEffectEvent(handleSaveTrip)
  const onCancelPlanningEvent = useEffectEvent(handleCancelPlanning)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (uiState.showResetDialog) setUiState(prev => ({ ...prev, showResetDialog: false }))
        else if (isRoutePlanned) onCancelPlanningEvent()
        else if (route.length > 0) setUiState(prev => ({ ...prev, showResetDialog: true }))
      }
      if (e.key === "Enter" && route.length >= 2 && !isRoutePlanned) onPlanRouteEvent()
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && route.length > 0 && !isRoutePlanned) {
        e.preventDefault()
        onUndoLastEvent()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault()
        onSaveTripEvent()
      }
    }
    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [route.length, isRoutePlanned, uiState.showResetDialog])

  const tooltipContent = useMemo(() => {
    if (!uiState.hoveredCountry) return "Unknown"
    const geo = allGeographies.find((g) => g.properties.name === uiState.hoveredCountry)
    const isoCode = geo ? getISOFromGeographyId(geo.id) : null
    if (!isoCode) return "Unknown"
    if (nationality && isoCode === nationality) return "visa free"
    if (secondaryNationality && isoCode === secondaryNationality) return "visa free"
    const visaReq = getVisaRequirementForCountry(isoCode, nationality ?? "", visaRequirements, secondaryNationality)
    return visaReq?.requirement?.replace("-", " ") || "Unknown"
  }, [uiState.hoveredCountry, allGeographies, nationality, secondaryNationality, visaRequirements])

  const hoveredCountryIso = useMemo(() => {
    if (!uiState.hoveredCountry) return null
    const geo = allGeographies.find((g) => g.properties.name === uiState.hoveredCountry)
    return geo ? getISOFromGeographyId(geo.id) : null
  }, [uiState.hoveredCountry, allGeographies])

  if (!nationality) {
    return (
      <LazyMotion features={domAnimation}>
        <div className="min-h-screen flex items-center justify-center pb-40">
          <div className="text-center">
            <div className="relative size-20 rounded-full bg-primary/10 mx-auto mb-6 overflow-hidden">
              <Image src="/placeholder-logo.svg" alt="Visa Planner Logo" fill className="object-cover rounded-full" priority sizes="80px" />
            </div>
            <h1 className="text-4xl font-semibold mb-3">Visa Planner</h1>
            <p className="text-muted-foreground text-lg mb-8">Select your nationality to start planning your visa-free travel routes</p>
            <div className="flex justify-center">
              <NationalityDropdown 
                nationality={nationality} 
                onNationalityChange={onNationalityChange}
                secondaryNationality={secondaryNationality}
                onSecondaryChange={onSecondaryNationalityChange}
                className="text-lg px-6 py-3"
                showSecondaryToggle={false}
              />
            </div>
          </div>
        </div>
      </LazyMotion>
    )
  }

  const handleCountryClick = (geo: MapGeography) => {
    if (isRoutePlanned) return
    const countryName = geo.properties.name ?? ""
    const countryId = geo.id
    const existingIndex = route.findIndex((c) => c.id === countryId)
    if (existingIndex !== -1) {
      removeCountry(existingIndex)
      return
    }
    const centroid = getCentroidFromMapGeography(geo)
    const nextCountry = { name: countryName, id: countryId, coordinates: centroid }
    dispatch({ type: "add-country", country: nextCountry })
    persistTrip([...route, nextCountry], false)
    if (step === "select-start") toast.success(`Start: ${countryName}`)
    else if (step === "select-destination") toast.success(`Destination: ${countryName}`)
  }

  const getCountryColor = (geo: MapGeography) => {
    const countryId = geo.id
    const isInRoute = route.some((c) => c.id === countryId)
    const isoCode = getISOFromGeographyId(countryId)
    if (!isoCode) return "#1a1f2e"

    const visaReq = getVisaRequirementForCountry(isoCode, nationality!, visaRequirements, secondaryNationality)

    if (isInRoute && isRoutePlanned) {
      if (!visaReq) return "oklch(0.75 0.15 180)"
      const requirement = visaReq.requirement || ""
      if (requirement === "visa-free") return "oklch(0.65 0.18 140)"
      if (requirement === "visa-on-arrival") return "oklch(0.70 0.20 60)"
      if (requirement === "e-visa") return "oklch(0.60 0.18 280)"
      if (requirement === "visa-required") return "oklch(0.55 0.22 25)"
      if (requirement === "no-admission") return "oklch(0.35 0.15 0)"
      return "oklch(0.75 0.15 180)"
    }

    if (isInRoute && !isRoutePlanned) return "oklch(0.75 0.15 180)"
    if (isRoutePlanned) return "#1a1f2e"

    const hasActiveFilters = filters.visaFree || filters.required || filters.eVisa || filters.onArrival
    if (hasActiveFilters && !isRoutePlanned) {
      const requirement = visaReq?.requirement || ""
      const matchesFilter = (filters.visaFree && requirement === "visa-free") ||
        (filters.required && requirement === "visa-required") ||
        (filters.eVisa && requirement === "e-visa") ||
        (filters.onArrival && requirement === "visa-on-arrival")
      
      if (matchesFilter) {
        if (requirement === "visa-free") return "oklch(0.65 0.18 140)"
        if (requirement === "visa-required") return "oklch(0.55 0.22 25)"
        if (requirement === "e-visa") return "oklch(0.60 0.18 280)"
        if (requirement === "visa-on-arrival") return "oklch(0.70 0.20 60)"
      }
      return "oklch(0.15 0.01 240)"
    }
    return "#1a1f2e"
  }

  const removeCountry = (index: number) => {
    const removed = route[index]
    const nextRoute = route.filter((_, i) => i !== index)
    dispatch({ type: "remove-country", index })
    persistTrip(nextRoute, nextRoute.length > 1 ? isRoutePlanned : false)
    toast.info(`Removed: ${removed.name}`)
  }

  const moveCountry = (fromIndex: number, toIndex: number) => {
    const nextRoute = [...route]
    const [moved] = nextRoute.splice(fromIndex, 1)
    nextRoute.splice(toIndex, 0, moved)
    dispatch({ type: "move-country", fromIndex, toIndex })
    persistTrip(nextRoute, isRoutePlanned)
  }

  const updateCountry = (index: number, updates: Partial<Country>) => {
    const nextRoute = [...route]
    nextRoute[index] = { ...nextRoute[index], ...updates }
    dispatch({ type: "update-country", index, updates })
    persistTrip(nextRoute, isRoutePlanned)
  }

  const getTooltipPosition = (mousePos: { x: number; y: number }) => {
    const width = isMobile ? 180 : 200
    const height = isMobile ? 50 : 60
    const offset = isMobile ? 5 : 10
    let x = mousePos.x + offset
    let y = mousePos.y - offset
    if (x + width > window.innerWidth) x = mousePos.x - width - offset
    if (x < 0) x = offset
    if (y < 0) y = mousePos.y + offset
    if (y + height > window.innerHeight) y = mousePos.y - height - offset
    return { x, y }
  }

  return (
    <LazyMotion features={domAnimation}>
      <div className="h-screen flex flex-col overflow-hidden">
        <WorldMapHeader
          nationality={nationality}
          secondaryNationality={secondaryNationality}
          onNationalityChange={onNationalityChange}
          onSecondaryNationalityChange={onSecondaryNationalityChange}
          isRoutePlanned={isRoutePlanned}
          route={route}
          filters={filters}
          onFilterChange={(f, v) => setFilters(prev => ({ ...prev, [f]: v }))}
          onPlanRoute={handlePlanRoute}
          onCancelPlanning={handleCancelPlanning}
          onReset={() => setUiState(prev => ({ ...prev, showResetDialog: true }))}
          onShare={handleShare}
          onSave={handleSaveTrip}
          onExport={handleExport}
        />

        <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative">
          <div className={`flex-1 relative bg-background overflow-hidden ${isMobile && uiState.showTripDetails ? 'hidden' : ''}`}>
            {isLoadingVisa && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
                <Card className="p-6 max-w-md">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="size-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-medium">Loading visa requirements…</p>
                  </div>
                  <p className="text-xs text-muted-foreground">⚠️ Always verify current requirements with official sources.</p>
                </Card>
              </div>
            )}

            <ComposableMap projection="geoMercator" projectionConfig={{ scale: 147 }} className="w-full h-full">
              <ZoomableGroup
                zoom={uiState.mapPosition.zoom}
                center={uiState.mapPosition.coordinates}
                onMoveEnd={(pos) => setUiState(prev => ({ ...prev, mapPosition: pos as any }))}
                translateExtent={[[-100, -200], [800, 750]]}
              >
                <GeographiesWrapper 
                  geoUrl={geoUrl}
                  onGeographiesLoad={(geographies) => { if (allGeographies.length === 0) setAllGeographies(geographies) }}
                  getCountryColor={getCountryColor}
                  handleCountryClick={handleCountryClick}
                  setHoveredCountry={(c) => setUiState(prev => ({ ...prev, hoveredCountry: c }))}
                  setMousePosition={(p) => setUiState(prev => ({ ...prev, mousePosition: p }))}
                  isRoutePlanned={isRoutePlanned}
                />
                {route.length > 1 && <RouteLines route={route} />}
              </ZoomableGroup>
            </ComposableMap>

            <AnimatePresence>
              {uiState.hoveredCountry && uiState.mousePosition && (
                <WorldMapTooltip
                  hoveredCountry={uiState.hoveredCountry}
                  hoveredCountryIso={hoveredCountryIso}
                  tooltipContent={tooltipContent}
                  isMobile={isMobile}
                  position={getTooltipPosition(uiState.mousePosition)}
                />
              )}
            </AnimatePresence>

            {isRoutePlanned && <WorldMapLegend isMobile={isMobile} />}

            {isMobile && route.length > 0 && isRoutePlanned && !uiState.showTripDetails && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-40">
                <Card className="px-4 py-3 bg-card/95 backdrop-blur-sm cursor-pointer" onClick={() => setUiState(prev => ({ ...prev, showTripDetails: true }))}>
                  <div className="flex items-center gap-2 text-center">
                    <span className="text-sm font-medium">View Trip Details</span>
                  </div>
                </Card>
              </div>
            )}
          </div>

          {route.length > 0 && (
            <TripDetails
              route={route}
              nationality={nationality}
              secondaryNationality={secondaryNationality}
              onRemove={removeCountry}
              onMove={moveCountry}
              onUpdate={updateCountry}
              isPlanned={isRoutePlanned}
              visaRequirements={visaRequirements}
              allGeographies={allGeographies}
              isMobile={isMobile}
              showTripDetails={uiState.showTripDetails}
              onCloseTripDetails={() => setUiState(prev => ({ ...prev, showTripDetails: false }))}
            />
          )}
        </div>

        <AlertDialog open={uiState.showResetDialog} onOpenChange={(v) => setUiState(prev => ({ ...prev, showResetDialog: v }))}>
          <AlertDialogContent className="max-w-[95vw] sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Reset your trip?</AlertDialogTitle>
              <AlertDialogDescription>This will clear all selected countries and start over.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleReset} className="w-full sm:w-auto">Reset Trip</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </LazyMotion>
  )
}
