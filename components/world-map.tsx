"use client"

import React, { useState, useEffect, useMemo, useCallback, useEffectEvent, useReducer } from "react"
import { AnimatePresence, LazyMotion, domAnimation, m } from "framer-motion"
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TripDetails } from "@/components/trip-details"
import { RouteLines } from "@/components/route-lines"
import { NationalityDropdown } from "@/components/nationality-dropdown"
import { type ProcessedVisaRequirement } from "@/lib/visa-api"
import { calculateTotalDistance, type Country } from "@/lib/visa-data"
import { getISOFromGeographyId, getCountryNameFromCode } from "@/lib/country-mapping"
import { FlagImage } from "@/components/flag-image"
import {
  getVisaRequirementsForNationality,
  getVisaRequirementForCountry,
  combineVisaRequirements,
  type CombinedVisaRequirement,
} from "@/lib/visa-service"
import { Flag, RotateCcw, Undo2, Globe, Filter, Share2, Save, Download, Home } from "lucide-react"
import Image from "next/image"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { useIsMobile } from "@/hooks/use-mobile"
import { type MapGeography, getCentroidFromMapGeography } from "@/lib/map-geography"

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

interface WorldMapProps {
  nationality: string | null
  onNationalityChange: (nationality: string | null) => void
  secondaryNationality?: string | null
  onSecondaryNationalityChange?: (nationality: string | null) => void
}

type Step = "select-start" | "select-destination" | "adding-countries"

type VisaState = {
  requirements: Record<string, ProcessedVisaRequirement | CombinedVisaRequirement>
  isLoading: boolean
}

type VisaAction =
  | { type: "start" }
  | { type: "loaded"; requirements: Record<string, ProcessedVisaRequirement | CombinedVisaRequirement> }
  | { type: "clear" }

function visaReducer(state: VisaState, action: VisaAction): VisaState {
  switch (action.type) {
    case "start":
      return { ...state, isLoading: true }
    case "loaded":
      return { requirements: action.requirements, isLoading: false }
    case "clear":
      return { requirements: {}, isLoading: false }
    default:
      return state
  }
}

interface WorldMapHeaderProps {
  nationality: string
  secondaryNationality: string | null
  onNationalityChange: (nationality: string | null) => void
  onSecondaryNationalityChange?: (nationality: string | null) => void
  handleReset: () => void
  routeLength: number
  isRoutePlanned: boolean
  handlePlanRoute: () => void
  handleCancelPlanning: () => void
  handleShare: () => void
  handleSaveTrip: () => void
  handleExport: () => void
  setShowResetDialog: (open: boolean) => void
  showVisaFreeOnly: boolean
  setShowVisaFreeOnly: (value: boolean) => void
  showVisaRequiredOnly: boolean
  setShowVisaRequiredOnly: (value: boolean) => void
  showEVisaOnly: boolean
  setShowEVisaOnly: (value: boolean) => void
  showOnArrivalOnly: boolean
  setShowOnArrivalOnly: (value: boolean) => void
}

function WorldMapHeader(props: WorldMapHeaderProps) {
  const {
    nationality,
    secondaryNationality,
    onNationalityChange,
    onSecondaryNationalityChange,
    handleReset,
    routeLength,
    isRoutePlanned,
    handlePlanRoute,
    handleCancelPlanning,
    handleShare,
    handleSaveTrip,
    handleExport,
    setShowResetDialog,
    showVisaFreeOnly,
    setShowVisaFreeOnly,
    showVisaRequiredOnly,
    setShowVisaRequiredOnly,
    showEVisaOnly,
    setShowEVisaOnly,
    showOnArrivalOnly,
    setShowOnArrivalOnly,
  } = props

  return (
    <div className="border-b border-border bg-card/50 backdrop-blur-sm z-10 flex-shrink-0">
      <div className="px-3 py-3 sm:px-4 sm:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-2xl font-semibold">Visa Planner</h1>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">
              Made by{" "}
              <a href="https://egorkabantsov.vercel.app" target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:text-foreground hover:underline">
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
                if (onSecondaryNationalityChange) onSecondaryNationalityChange(null)
                handleReset()
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
                  <DropdownMenuCheckboxItem checked={showVisaFreeOnly} onCheckedChange={setShowVisaFreeOnly}>Visa-Free</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem checked={showVisaRequiredOnly} onCheckedChange={setShowVisaRequiredOnly}>Visa Required</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem checked={showEVisaOnly} onCheckedChange={setShowEVisaOnly}>E-Visa</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem checked={showOnArrivalOnly} onCheckedChange={setShowOnArrivalOnly}>Visa on Arrival</DropdownMenuCheckboxItem>
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
            {routeLength >= 2 && !isRoutePlanned && (
              <Button onClick={handlePlanRoute} size="sm" className="gap-1 sm:gap-2 h-8 sm:h-9">
                <Flag className="size-3 sm:size-4" />
                <span className="hidden sm:inline">Plan Route</span>
                <span className="sm:hidden">Plan</span>
              </Button>
            )}
            {isRoutePlanned && (
              <>
                <Button onClick={handleCancelPlanning} variant="outline" size="sm" className="gap-1 sm:gap-2 bg-transparent h-8 sm:h-9">
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
                    <DropdownMenuItem onClick={handleShare}><Share2 className="size-4 mr-2" />Share trip</DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSaveTrip}><Save className="size-4 mr-2" />Save trip</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleExport}><Download className="size-4 mr-2" />Export as JSON</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button onClick={() => setShowResetDialog(true)} variant="outline" size="sm" className="gap-1 sm:gap-2 h-8 sm:h-9">
                  <RotateCcw className="size-3 sm:size-4" />
                  <span className="hidden sm:inline">Reset</span>
                </Button>
              </>
            )}
            {routeLength > 0 && !isRoutePlanned && (
              <Button onClick={() => setShowResetDialog(true)} variant="ghost" size="sm" className="gap-1 sm:gap-2 h-8 sm:h-9">
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

interface LandingViewProps {
  nationality: string | null
  onNationalityChange: (nationality: string | null) => void
  secondaryNationality: string | null
  onSecondaryNationalityChange?: (nationality: string | null) => void
}

function LandingView({
  nationality,
  onNationalityChange,
  secondaryNationality,
  onSecondaryNationalityChange,
}: LandingViewProps) {
  return (
    <div className="min-h-screen flex items-center sm:items-center justify-center pb-40 sm:pt-0">
      <div className="text-center">
        <div className="relative size-20 rounded-full bg-primary/10 mx-auto mb-6 overflow-hidden">
          <Image
            src="/placeholder-logo.svg"
            alt="Visa Planner Logo"
            fill
            className="object-cover rounded-full"
            priority
            sizes="80px"
          />
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
  )
}

// Separate component to handle geographies properly
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
        // Only call the callback once when geographies are first loaded
        // Use setTimeout to defer the callback to avoid setState during render
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
                  // Throttled mouse move for better performance
                  if (throttledMouseMove.current) return
                  
                  throttledMouseMove.current = setTimeout(() => {
                    setMousePosition({ x: e.clientX, y: e.clientY })
                    throttledMouseMove.current = null
                  }, 32) // ~30fps - more responsive than before but still throttled
                }}
                onTouchStart={(e: React.TouchEvent) => {
                  const touch = e.touches[0]
                  setHoveredCountry(geo.properties.name ?? null)
                  setMousePosition({ x: touch.clientX, y: touch.clientY })
                }}
                onTouchEnd={() => {
                  // Keep tooltip visible for a short time on touch end
                  setTimeout(() => {
                    setHoveredCountry(null)
                    setMousePosition(null)
                  }, 1000)
                }}
      style={{
        default: {
          fill: getCountryColor(geo),
          stroke: "#374151",
          strokeWidth: 0.3,
          outline: "none",
          // Removed transition for better performance
        },
        hover: {
          fill: isRoutePlanned ? getCountryColor(geo) : "oklch(0.75 0.15 180)", // Restored hover color
          stroke: "#374151",
          strokeWidth: 0.3,
          outline: "none",
          cursor: isRoutePlanned ? "default" : "pointer",
        },
        pressed: {
          fill: isRoutePlanned ? getCountryColor(geo) : "oklch(0.75 0.15 180)", // Match hover state
          stroke: "#374151",
          strokeWidth: 0.3,
          outline: "none",
        },
      }}
              />
            ))}
          </>
        )
      }}
    </Geographies>
  )
}

function useWorldMapView({ nationality, onNationalityChange, secondaryNationality = null, onSecondaryNationalityChange }: WorldMapProps) {
  const isMobile = useIsMobile()
  const [tripState, setTripState] = useState({
    step: "select-start" as Step,
    route: [] as Country[],
    isRoutePlanned: false,
    showResetDialog: false,
    showTripDetails: false,
  })
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null)
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 })
  const [showVisaFreeOnly, setShowVisaFreeOnly] = useState(false)
  const [showVisaRequiredOnly, setShowVisaRequiredOnly] = useState(false)
  const [showEVisaOnly, setShowEVisaOnly] = useState(false)
  const [showOnArrivalOnly, setShowOnArrivalOnly] = useState(false)
  const [allGeographies, setAllGeographies] = useState<MapGeography[]>([])
  const [visaState, dispatchVisa] = useReducer(visaReducer, {
    requirements: {},
    isLoading: true,
  })
  const { requirements: visaRequirements, isLoading: isLoadingVisa } = visaState
  const { step, route, isRoutePlanned, showResetDialog, showTripDetails } = tripState

  const setStep = useCallback((nextStep: Step) => {
    setTripState((prev) => ({ ...prev, step: nextStep }))
  }, [])

  const setRoute = useCallback((nextRoute: Country[] | ((previousRoute: Country[]) => Country[])) => {
    setTripState((prev) => ({
      ...prev,
      route: typeof nextRoute === "function" ? nextRoute(prev.route) : nextRoute,
    }))
  }, [])

  const setIsRoutePlanned = useCallback((value: boolean) => {
    setTripState((prev) => ({ ...prev, isRoutePlanned: value }))
  }, [])

  const setShowResetDialog = useCallback((value: boolean) => {
    setTripState((prev) => ({ ...prev, showResetDialog: value }))
  }, [])

  const setShowTripDetails = useCallback((value: boolean) => {
    setTripState((prev) => ({ ...prev, showTripDetails: value }))
  }, [])

  const getStorageKey = useCallback(() => {
    if (!nationality) return null
    return secondaryNationality
      ? `trip-${nationality}-${secondaryNationality}`
      : `trip-${nationality}`
  }, [nationality, secondaryNationality])

  const persistTrip = useCallback((nextRoute: Country[], nextIsPlanned: boolean) => {
    if (typeof window === "undefined") return

    const storageKey = getStorageKey()
    if (!storageKey || nextRoute.length === 0) return

    localStorage.setItem(storageKey, JSON.stringify({ route: nextRoute, isPlanned: nextIsPlanned }))
  }, [getStorageKey])

  const handleReset = useCallback(() => {
    setTripState((prev) => ({
      ...prev,
      route: [],
      step: "select-start",
      isRoutePlanned: false,
      showResetDialog: false,
      showTripDetails: false,
    }))

    if (typeof window !== "undefined") {
      const storageKey = getStorageKey()
      if (storageKey) {
        localStorage.removeItem(storageKey)
      }
    }

    toast.info("Trip reset")
  }, [getStorageKey])

  const handlePlanRoute = useCallback(() => {
    setIsRoutePlanned(true)
    persistTrip(route, true)
    const distance = calculateTotalDistance(route)
    toast.success("Route planned!", {
      description: `${distance.toLocaleString()} km total distance`,
    })
  }, [persistTrip, route, setIsRoutePlanned])

  const handleUndoLast = useCallback(() => {
    if (route.length === 0) return

    const removed = route[route.length - 1]
    const newRoute = route.slice(0, -1)
    setRoute(newRoute)

    if (newRoute.length === 0) {
      setStep("select-start")
      setIsRoutePlanned(false)
    } else if (newRoute.length === 1) {
      setStep("select-destination")
      setIsRoutePlanned(false)
    }

    persistTrip(newRoute, false)
    toast.info(`Removed: ${removed.name}`)
  }, [persistTrip, route, setIsRoutePlanned, setRoute, setStep])

  const handleCancelPlanning = useCallback(() => {
    setIsRoutePlanned(false)
    persistTrip(route, false)
    toast.info("Edit mode enabled")
  }, [persistTrip, route, setIsRoutePlanned])

  const handleSaveTrip = useCallback(() => {
    if (route.length === 0) {
      toast.error("No trip to save")
      return
    }

    const storageKey = getStorageKey()
    if (typeof window !== "undefined" && storageKey) {
      localStorage.setItem(storageKey, JSON.stringify({ route, isPlanned: isRoutePlanned }))
    }
    toast.success("Trip saved!")
  }, [getStorageKey, isRoutePlanned, route])

  useEffect(() => {
    if (!nationality) {
      dispatchVisa({ type: "clear" })
      return
    }

    let cancelled = false

    const fetchVisaData = async () => {
      dispatchVisa({ type: "start" })
      try {
        const primaryResult = await getVisaRequirementsForNationality(nationality)

        let primaryRequirements: Record<string, ProcessedVisaRequirement> = {}
        if (primaryResult.error) {
          toast.error("Failed to load visa requirements", {
            description: primaryResult.error.message,
          })
        } else if (primaryResult.data) {
          primaryRequirements = primaryResult.data
        }

        let secondaryRequirements: Record<string, ProcessedVisaRequirement> = {}
        if (secondaryNationality) {
          const secondaryResult = await getVisaRequirementsForNationality(secondaryNationality)

          if (secondaryResult.error) {
            toast.error("Failed to load secondary passport requirements", {
              description: secondaryResult.error.message,
            })
          } else if (secondaryResult.data) {
            secondaryRequirements = secondaryResult.data
          }
        }

        if (cancelled) return

        let nextRequirements: Record<string, ProcessedVisaRequirement | CombinedVisaRequirement> = {}

        if (secondaryNationality && Object.keys(primaryRequirements).length > 0 && Object.keys(secondaryRequirements).length > 0) {
          nextRequirements = combineVisaRequirements(
            primaryRequirements,
            secondaryRequirements,
            nationality,
            secondaryNationality
          )
        } else if (Object.keys(primaryRequirements).length > 0) {
          const requirements = { ...primaryRequirements }
          if (!requirements[nationality]) {
            requirements[nationality] = {
              country: "Own Country",
              countryCode: nationality,
              requirement: "visa-free",
              notes: "No visa required for own country",
            }
          }
          nextRequirements = requirements
        }

        dispatchVisa({ type: "loaded", requirements: nextRequirements })
      } catch {
        if (!cancelled) {
          toast.error("Failed to load visa requirements", {
            description: "Network error occurred. Please try again.",
          })
          dispatchVisa({ type: "clear" })
        }
      }
    }

    void fetchVisaData()

    return () => {
      cancelled = true
    }
  }, [nationality, secondaryNationality])

  useEffect(() => {
    if (typeof window === "undefined" || !nationality) return

    const storageKey = getStorageKey()
    if (!storageKey) return

    const savedTrip = localStorage.getItem(storageKey)
    if (!savedTrip) return

    try {
      const parsed = JSON.parse(savedTrip)
      if (parsed.route && parsed.route.length > 0) {
        toast.info("Previous trip loaded", {
          description: "Your saved trip has been restored",
          action: {
            label: "Clear",
            onClick: () => {
              localStorage.removeItem(storageKey)
              handleReset()
            },
          },
        })
        setTripState((prev) => ({
          ...prev,
          route: parsed.route,
          isRoutePlanned: parsed.isPlanned || false,
          step: parsed.route.length === 1 ? "select-destination" : "adding-countries",
        }))
      }
    } catch {
      // Ignore malformed saved trips.
    }
  }, [getStorageKey, handleReset, nationality])

  const handlePlanRouteEvent = useEffectEvent(handlePlanRoute)
  const handleUndoLastEvent = useEffectEvent(handleUndoLast)
  const handleSaveTripEvent = useEffectEvent(handleSaveTrip)
  const handleCancelPlanningEvent = useEffectEvent(handleCancelPlanning)

  useEffect(() => {
    if (typeof window === "undefined") return

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showResetDialog) setShowResetDialog(false)
        else if (isRoutePlanned) handleCancelPlanningEvent()
        else if (route.length > 0) setShowResetDialog(true)
      }
      if (e.key === "Enter" && route.length >= 2 && !isRoutePlanned) {
        handlePlanRouteEvent()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && route.length > 0 && !isRoutePlanned) {
        e.preventDefault()
        handleUndoLastEvent()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault()
        handleSaveTripEvent()
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [isRoutePlanned, route.length, setShowResetDialog, showResetDialog])

  const tooltipContent = useMemo(() => {
    if (!hoveredCountry) return "Unknown"
    const geo = allGeographies.find((g) => g.properties.name === hoveredCountry)
    const isoCode = geo ? getISOFromGeographyId(geo.id) : null
    if (!isoCode) return "Unknown"

    if (nationality && isoCode === nationality) {
      return "visa free"
    }
    if (secondaryNationality && isoCode === secondaryNationality) {
      return "visa free"
    }

    const visaReq = getVisaRequirementForCountry(isoCode, nationality ?? "", visaRequirements, secondaryNationality)
    if (!visaReq) return "Unknown"

    return visaReq.requirement?.replace("-", " ") || "Unknown"
  }, [allGeographies, hoveredCountry, nationality, secondaryNationality, visaRequirements])

  const hoveredCountryIso = useMemo(() => {
    if (!hoveredCountry) return null
    const geo = allGeographies.find((g) => g.properties.name === hoveredCountry)
    return geo ? getISOFromGeographyId(geo.id) : null
  }, [allGeographies, hoveredCountry])

  if (!nationality) {
    return (
      <LandingView
        nationality={nationality}
        onNationalityChange={onNationalityChange}
        secondaryNationality={secondaryNationality}
        onSecondaryNationalityChange={onSecondaryNationalityChange}
      />
    )
  }

  const handleCountryClick = (geo: MapGeography) => {
    if (isRoutePlanned) return

    const countryName = geo.properties.name ?? ""
    const countryId = geo.id

    // Check if country already in route - if so, deselect it
    const existingIndex = route.findIndex((c) => c.id === countryId)
    if (existingIndex !== -1) {
      removeCountry(existingIndex)
      return
    }

    const centroid = getCentroidFromMapGeography(geo)
    const nextCountry = { name: countryName, id: countryId, coordinates: centroid }

    if (step === "select-start") {
      const nextRoute = [nextCountry]
      setRoute(nextRoute)
      setStep("select-destination")
      persistTrip(nextRoute, false)
      toast.success(`Start: ${countryName}`)
    } else if (step === "select-destination") {
      const nextRoute = [...route, nextCountry]
      setRoute(nextRoute)
      setStep("adding-countries")
      persistTrip(nextRoute, false)
      toast.success(`Destination: ${countryName}`)
    } else if (step === "adding-countries") {
      const nextRoute = [...route, nextCountry]
      setRoute(nextRoute)
      persistTrip(nextRoute, false)
    }
  }

  const getCountryColor = (geo: MapGeography) => {
    const countryId = geo.id
    const isInRoute = route.some((c) => c.id === countryId)

    // Convert geography ID to ISO code for API lookup
    const isoCode = getISOFromGeographyId(countryId)
    
    // Check if it's own country (primary or secondary)
    if (isoCode === nationality || isoCode === secondaryNationality) {
      // Own country is always visa-free
      if (isInRoute && isRoutePlanned) {
        return "oklch(0.65 0.18 140)" // Green for visa-free
      }
    }
    
    // Get visa requirement from combined requirements
    const visaReq = isoCode
      ? getVisaRequirementForCountry(isoCode, nationality ?? "", visaRequirements, secondaryNationality)
      : null

    if (isInRoute && isRoutePlanned) {
      // Show actual visa requirement colors for countries in the planned route
      if (!visaReq) {
        return "oklch(0.75 0.15 180)" // Fallback to cyan if no visa data
      }

      const requirement = visaReq.requirement || ""

      if (requirement === "visa-free") {
        return "oklch(0.65 0.18 140)" // Green
      } else if (requirement === "visa-on-arrival") {
        return "oklch(0.70 0.20 60)" // Yellow
      } else if (requirement === "e-visa") {
        return "oklch(0.60 0.18 280)" // Purple
      } else if (requirement === "visa-required") {
        return "oklch(0.55 0.22 25)" // Orange/Red
      } else if (requirement === "no-admission") {
        return "oklch(0.35 0.15 0)" // Dark Red
      }

      return "oklch(0.75 0.15 180)" // Fallback to cyan
    }

    if (isInRoute && !isRoutePlanned) {
      // In edit mode, show cyan for selected countries
      return "oklch(0.75 0.15 180)"
    }

    if (isRoutePlanned) {
      // Route is planned but this country is not in route - show dark
      return "#1a1f2e"
    }

    // Check if any filters are active
    const hasActiveFilters = showVisaFreeOnly || showVisaRequiredOnly || showEVisaOnly || showOnArrivalOnly
    
    if (hasActiveFilters && !isRoutePlanned) {
      // Show filtered colors when any filter is active and not in planned mode
      const requirement = visaReq?.requirement || ""
      
      // Check if this country matches any of the active filters
      const matchesFilter = 
        (showVisaFreeOnly && requirement === "visa-free") ||
        (showVisaRequiredOnly && requirement === "visa-required") ||
        (showEVisaOnly && requirement === "e-visa") ||
        (showOnArrivalOnly && requirement === "visa-on-arrival")
      
      if (matchesFilter) {
        // Return appropriate color based on requirement
        if (requirement === "visa-free") {
          return "oklch(0.65 0.18 140)" // Green
        } else if (requirement === "visa-required") {
          return "oklch(0.55 0.22 25)" // Orange/Red
        } else if (requirement === "e-visa") {
          return "oklch(0.60 0.18 280)" // Purple
        } else if (requirement === "visa-on-arrival") {
          return "oklch(0.70 0.20 60)" // Yellow
        }
      }
      
      // Country doesn't match any active filter
      return "oklch(0.15 0.01 240)"
    }

    // Default state - no colors shown
    return "#1a1f2e"
  }

  const removeCountry = (index: number) => {
    const removed = route[index]
    const nextRoute = route.filter((_, i) => i !== index)
    setRoute(nextRoute)
    if (nextRoute.length === 0) {
      setStep("select-start")
      setIsRoutePlanned(false)
    } else if (nextRoute.length === 1) {
      setStep("select-destination")
      setIsRoutePlanned(false)
    }
    persistTrip(nextRoute, isRoutePlanned)
    toast.info(`Removed: ${removed.name}`)
  }

  const moveCountry = (fromIndex: number, toIndex: number) => {
    const nextRoute = [...route]
    const [moved] = nextRoute.splice(fromIndex, 1)
    nextRoute.splice(toIndex, 0, moved)
    setRoute(nextRoute)
    persistTrip(nextRoute, isRoutePlanned)
  }
  const copyToClipboard = (text: string) => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text)
      toast.success("Copied to clipboard!")
    } else {
      toast.error("Clipboard not available")
    }
  }

  const handleShare = async () => {
    if (route.length === 0) {
      toast.error("No trip to share")
      return
    }

    // Calculate trip statistics
    const totalDistance = calculateTotalDistance(route)
    const visaFreeCount = route.filter((c) => {
      const geo = allGeographies.find((g) => g.properties.name === c.name)
      const isoCode = geo ? getISOFromGeographyId(geo.id) : null
      if (!isoCode) return false
      
      // Check if it's own country (primary or secondary)
      if (isoCode === nationality || isoCode === secondaryNationality) {
        return true
      }
      
      const apiVisaReq = isoCode
        ? getVisaRequirementForCountry(isoCode, nationality ?? "", visaRequirements, secondaryNationality)
        : null
      const requirement = apiVisaReq?.requirement || "unknown"
      return requirement === "visa-free"
    }).length

    const shareText = `ðŸŒ My Visa Planner Trip Plan

ðŸ“ Route: ${route.map((c) => c.name).join(" â†’ ")}

ðŸ“Š Trip Stats:
â€¢ Total Distance: ${totalDistance.toLocaleString()} km
â€¢ Countries: ${route.length}
â€¢ Visa-free countries: ${visaFreeCount}/${route.length}

ðŸ‘¤ Traveler: ${getCountryNameFromCode(nationality)}${secondaryNationality ? ` and ${getCountryNameFromCode(secondaryNationality)}` : ''} passport holder${secondaryNationality ? 's' : ''}

Plan your own visa-free routes at Visa Planner!`

    if (typeof window !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: "My Visa Planner Trip Plan",
          text: shareText,
        })
        toast.success("Shared successfully!")
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          copyToClipboard(shareText)
        }
      }
    } else {
      copyToClipboard(shareText)
    }
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
          visa: isoCode
            ? getVisaRequirementForCountry(isoCode, nationality ?? "", visaRequirements, secondaryNationality)
            : null,
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

  const updateCountry = (index: number, updates: Partial<Country>) => {
    const nextRoute = [...route]
    nextRoute[index] = { ...nextRoute[index], ...updates }
    setRoute(nextRoute)
    persistTrip(nextRoute, isRoutePlanned)
  }

  const getTooltipPosition = (mousePos: { x: number; y: number }) => {
    const tooltipWidth = isMobile ? 180 : 200 // Smaller on mobile
    const tooltipHeight = isMobile ? 50 : 60 // Smaller on mobile
    const offset = isMobile ? 5 : 10 // Smaller offset on mobile
    
    let x = mousePos.x + offset
    let y = mousePos.y - offset
    
    // Prevent going off right edge
    if (x + tooltipWidth > window.innerWidth) {
      x = mousePos.x - tooltipWidth - offset
    }
    
    // Prevent going off left edge
    if (x < 0) {
      x = offset
    }
    
    // Prevent going off top edge
    if (y < 0) {
      y = mousePos.y + offset
    }
    
    // Prevent going off bottom edge
    if (y + tooltipHeight > window.innerHeight) {
      y = mousePos.y - tooltipHeight - offset
    }
    
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
        handleReset={handleReset}
        routeLength={route.length}
        isRoutePlanned={isRoutePlanned}
        handlePlanRoute={handlePlanRoute}
        handleCancelPlanning={handleCancelPlanning}
        handleShare={handleShare}
        handleSaveTrip={handleSaveTrip}
        handleExport={handleExport}
        setShowResetDialog={setShowResetDialog}
        showVisaFreeOnly={showVisaFreeOnly}
        setShowVisaFreeOnly={setShowVisaFreeOnly}
        showVisaRequiredOnly={showVisaRequiredOnly}
        setShowVisaRequiredOnly={setShowVisaRequiredOnly}
        showEVisaOnly={showEVisaOnly}
        setShowEVisaOnly={setShowEVisaOnly}
        showOnArrivalOnly={showOnArrivalOnly}
        setShowOnArrivalOnly={setShowOnArrivalOnly}
      />

      <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative">
        {/* Map */}
        <div className={`flex-1 relative bg-background overflow-hidden ${isMobile && showTripDetails ? 'hidden' : ''}`}>
          {isLoadingVisa && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
              <Card className="p-6 max-w-md">
                <div className="flex items-center gap-3 mb-3">
                  <div className="size-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-medium">Loading visa requirements…</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Warning: Visa requirements change frequently and may not reflect recent policy updates. Always verify current requirements with official embassy sources before travel.
                </p>
              </Card>
            </div>
          )}

          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 147,
            }}
            className="w-full h-full"
          >
            <ZoomableGroup
              zoom={position.zoom}
              center={position.coordinates as [number, number]}
              onMoveEnd={(position) => setPosition(position)}
              translateExtent={[
                [-100, -200],  // Southwest boundary (left, bottom) - extended bottom for Antarctica
                [800, 750]     // Northeast boundary (right, top) - keeping good top/right
              ]}
            >
              <GeographiesWrapper 
                geoUrl={geoUrl}
                onGeographiesLoad={(geographies) => {
                  if (allGeographies.length === 0) {
                    setAllGeographies(geographies)
                  }
                }}
                getCountryColor={getCountryColor}
                handleCountryClick={handleCountryClick}
                setHoveredCountry={setHoveredCountry}
                setMousePosition={setMousePosition}
                isRoutePlanned={isRoutePlanned}
              />

              {/* Render curved dotted lines between countries */}
              {route.length > 1 && <RouteLines route={route} />}

            </ZoomableGroup>
          </ComposableMap>

          <AnimatePresence>
            {hoveredCountry && mousePosition && (
              <m.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="fixed z-50 pointer-events-none"
                style={{
                  left: `${getTooltipPosition(mousePosition).x}px`,
                  top: `${getTooltipPosition(mousePosition).y}px`,
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
            )}
          </AnimatePresence>

          {isRoutePlanned && (
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
          )}


          {/* Mobile Trip Details Hint - only in plan mode */}
          {isMobile && route.length > 0 && isRoutePlanned && !showTripDetails && (
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-40"
            >
              <Card 
                className="px-4 py-3 bg-card/95 backdrop-blur-sm border-primary/20 shadow-lg cursor-pointer hover:bg-card/90 transition-colors"
                onClick={() => setShowTripDetails(true)}
              >
                <div className="flex items-center gap-2 text-center">
                  <span className="text-sm font-medium">View Trip Details</span>
                  <m.div
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <svg 
                      className="size-4 text-primary" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M5 15l7-7 7 7" 
                      />
                    </svg>
                  </m.div>
                </div>
              </Card>
            </m.div>
          )}
        </div>

        {route.length > 0 && !isMobile && (
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
            showTripDetails={showTripDetails}
            onCloseTripDetails={() => setShowTripDetails(false)}
          />
        )}

        {/* Mobile TripDetails - rendered separately for mobile */}
        {route.length > 0 && isMobile && (
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
            showTripDetails={showTripDetails}
            onCloseTripDetails={() => setShowTripDetails(false)}
          />
        )}
      </div>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent className="max-w-[95vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Reset your trip?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all selected countries and start over. This action cannot be undone.
            </AlertDialogDescription>
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

export function WorldMap(props: WorldMapProps) {
  return useWorldMapView(props)
}




