"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TripDetails } from "@/components/trip-details"
import { getAllVisaRequirements, getLastUpdatedDate, type ProcessedVisaRequirement } from "@/lib/visa-api"
import { getISOFromGeographyId, getCountryNameFromCode } from "@/lib/country-mapping"
import type { Country } from "@/lib/visa-data"
import { Flag, RotateCcw, Undo2, Globe, Filter, Share2, Save, Download } from "lucide-react"
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

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

interface WorldMapProps {
  nationality: string
  onChangeNationality: () => void
}

type Step = "select-start" | "select-destination" | "adding-countries"

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
  onGeographiesLoad: (geographies: any[]) => void
  getCountryColor: (geo: any) => string
  handleCountryClick: (geo: any) => void
  setHoveredCountry: (country: string | null) => void
  setMousePosition: (position: { x: number; y: number } | null) => void
  isRoutePlanned: boolean
}) {
  const hasLoadedRef = React.useRef(false)

  return (
    <Geographies geography={geoUrl}>
      {({ geographies }) => {
        // Only call the callback once when geographies are first loaded
        // Use setTimeout to defer the callback to avoid setState during render
        if (!hasLoadedRef.current && geographies.length > 0) {
          hasLoadedRef.current = true
          setTimeout(() => {
            onGeographiesLoad(geographies)
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
                  setHoveredCountry(geo.properties.name)
                  setMousePosition({ x: e.clientX, y: e.clientY })
                }}
                onMouseLeave={() => {
                  setHoveredCountry(null)
                  setMousePosition(null)
                }}
                onMouseMove={(e: React.MouseEvent) => {
                  setMousePosition({ x: e.clientX, y: e.clientY })
                }}
                style={{
                  default: {
                    fill: getCountryColor(geo),
                    stroke: "#374151",
                    strokeWidth: 0.3,
                    outline: "none",
                    transition: "all 0.2s ease-in-out",
                  },
                  hover: {
                    fill: isRoutePlanned ? getCountryColor(geo) : "oklch(0.75 0.15 180)",
                    stroke: "#374151",
                    strokeWidth: 0.3,
                    outline: "none",
                    cursor: isRoutePlanned ? "default" : "pointer",
                  },
                  pressed: {
                    fill: isRoutePlanned ? getCountryColor(geo) : "oklch(0.75 0.15 180)",
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

export function WorldMap({ nationality, onChangeNationality }: WorldMapProps) {
  const [step, setStep] = useState<Step>("select-start")
  const [route, setRoute] = useState<Country[]>([])
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null)
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 })
  const [isRoutePlanned, setIsRoutePlanned] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [showVisaFreeOnly, setShowVisaFreeOnly] = useState(false)
  const [allGeographies, setAllGeographies] = useState<any[]>([])
  const [visaRequirements, setVisaRequirements] = useState<Record<string, ProcessedVisaRequirement>>({})
  const [isLoadingVisa, setIsLoadingVisa] = useState(true)

  useEffect(() => {
    const fetchVisaData = async () => {
      setIsLoadingVisa(true)
      try {
        const data = await getAllVisaRequirements(nationality)
        
        if (Object.keys(data).length === 0) {
        }
        
        setVisaRequirements(data)
        
      } catch (error) {
        toast.error("Failed to load visa requirements", {
          description: "Using fallback data. Some information may be limited.",
        })
      } finally {
        setIsLoadingVisa(false)
      }
    }

    fetchVisaData()
  }, [nationality])

  useEffect(() => {
    // Only run on client side to avoid hydration mismatch
    if (typeof window === 'undefined') return
    
    const savedTrip = localStorage.getItem(`trip-${nationality}`)
    if (savedTrip) {
      try {
        const parsed = JSON.parse(savedTrip)
        if (parsed.route && parsed.route.length > 0) {
          toast.info("Previous trip loaded", {
            description: "Your saved trip has been restored",
            action: {
              label: "Clear",
              onClick: () => {
                localStorage.removeItem(`trip-${nationality}`)
                handleReset()
              },
            },
          })
          setRoute(parsed.route)
          setIsRoutePlanned(parsed.isPlanned || false)
          if (parsed.route.length === 1) setStep("select-destination")
          else if (parsed.route.length > 1) setStep("adding-countries")
        }
      } catch (e) {
      }
    }
  }, [nationality])

  useEffect(() => {
    // Only run on client side to avoid hydration mismatch
    if (typeof window === 'undefined') return
    
    if (route.length > 0) {
      localStorage.setItem(`trip-${nationality}`, JSON.stringify({ route, isPlanned: isRoutePlanned }))
    }
  }, [route, isRoutePlanned, nationality])

  useEffect(() => {
    // Only run on client side to avoid hydration mismatch
    if (typeof window === 'undefined') return
    
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showResetDialog) setShowResetDialog(false)
        else if (isRoutePlanned) handleCancelPlanning()
        else if (route.length > 0) setShowResetDialog(true)
      }
      if (e.key === "Enter" && route.length >= 2 && !isRoutePlanned) {
        handlePlanRoute()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && route.length > 0 && !isRoutePlanned) {
        e.preventDefault()
        handleUndoLast()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault()
        handleSaveTrip()
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [route, isRoutePlanned, showResetDialog])


  const handleCountryClick = (geo: any) => {
    if (isRoutePlanned) return

    const countryName = geo.properties.name
    const countryId = geo.id

    // Check if country already in route - if so, deselect it
    const existingIndex = route.findIndex((c) => c.id === countryId)
    if (existingIndex !== -1) {
      removeCountry(existingIndex)
      return
    }

    if (step === "select-start") {
      setRoute([{ name: countryName, id: countryId, coordinates: getCentroid(geo) }])
      setStep("select-destination")
      toast.success(`Start: ${countryName}`)
    } else if (step === "select-destination") {
      setRoute([...route, { name: countryName, id: countryId, coordinates: getCentroid(geo) }])
      setStep("adding-countries")
      toast.success(`Destination: ${countryName}`)
    } else if (step === "adding-countries") {
      setRoute([...route, { name: countryName, id: countryId, coordinates: getCentroid(geo) }])
      toast.success(`Added: ${countryName}`)
    }
  }

  const getCentroid = (geo: any): [number, number] => {
    const bounds = geo.geometry.coordinates[0]
    if (!bounds || bounds.length === 0) return [0, 0]

    let sumLon = 0
    let sumLat = 0
    let count = 0

    const processCoords = (coords: any) => {
      if (Array.isArray(coords[0])) {
        coords.forEach(processCoords)
      } else {
        sumLon += coords[0]
        sumLat += coords[1]
        count++
      }
    }

    geo.geometry.coordinates.forEach((polygon: any) => {
      processCoords(polygon)
    })

    return count > 0 ? [sumLon / count, sumLat / count] : [0, 0]
  }

  const getCountryColor = (geo: any) => {
    const countryId = geo.id
    const isInRoute = route.some((c) => c.id === countryId)

    // Convert geography ID to ISO code for API lookup
    const isoCode = getISOFromGeographyId(countryId)
    
    // Special case: if looking up visa requirements for own country
    let visaReq = null
    if (isoCode === nationality) {
      visaReq = { requirement: "visa-free" }
    } else {
      visaReq = isoCode ? visaRequirements[isoCode] : null
    }

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

    if (showVisaFreeOnly && !isRoutePlanned) {
      // Show visa-free filter colors only when not in planned mode
      const requirement = visaReq?.requirement || ""

      if (requirement === "visa-free") {
        return "oklch(0.65 0.18 140)"
      }
      return "oklch(0.15 0.01 240)"
    }

    // Default state - no colors shown
    return "#1a1f2e"
  }

  const handlePlanRoute = () => {
    setIsRoutePlanned(true)
    const distance = calculateTotalDistance(route)
    toast.success("Route planned!", {
      description: `${distance.toLocaleString()} km total distance`,
    })
  }

  const handleReset = () => {
    setRoute([])
    setStep("select-start")
    setIsRoutePlanned(false)
    setShowResetDialog(false)
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`trip-${nationality}`)
    }
    toast.info("Trip reset")
  }

  const handleUndoLast = () => {
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

    toast.info(`Removed: ${removed.name}`)
  }

  const handleCancelPlanning = () => {
    setIsRoutePlanned(false)
    toast.info("Edit mode enabled")
  }

  const removeCountry = (index: number) => {
    const removed = route[index]
    const newRoute = route.filter((_, i) => i !== index)
    setRoute(newRoute)
    if (newRoute.length === 0) {
      setStep("select-start")
      setIsRoutePlanned(false)
    } else if (newRoute.length === 1) {
      setStep("select-destination")
      setIsRoutePlanned(false)
    }
    toast.info(`Removed: ${removed.name}`)
  }

  const moveCountry = (fromIndex: number, toIndex: number) => {
    const newRoute = [...route]
    const [moved] = newRoute.splice(fromIndex, 1)
    newRoute.splice(toIndex, 0, moved)
    setRoute(newRoute)
  }

  const handleSaveTrip = () => {
    if (route.length === 0) {
      toast.error("No trip to save")
      return
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(`trip-${nationality}`, JSON.stringify({ route, isPlanned: isRoutePlanned }))
    }
    toast.success("Trip saved!")
  }

  const handleShare = async () => {
    if (route.length === 0) {
      toast.error("No trip to share")
      return
    }

    const tripData = {
      nationality,
      countries: route.map((c) => c.name),
    }

    const shareText = `My trip: ${route.map((c) => c.name).join(" → ")}`

    if (typeof window !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: "My Trip Plan",
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

  const copyToClipboard = (text: string) => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text)
      toast.success("Copied to clipboard!")
    } else {
      toast.error("Clipboard not available")
    }
  }

  const handleExport = () => {
    if (route.length === 0) {
      toast.error("No trip to export")
      return
    }

    const tripData = {
      nationality,
      route: route.map((c) => ({
        name: c.name,
        dates: c.dates,
        notes: c.notes,
        visa: getVisaRequirementForCountry(c.name),
      })),
      totalDistance: calculateTotalDistance(route),
      totalVisaCost: calculateTotalVisaCost(route),
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
    const newRoute = [...route]
    newRoute[index] = { ...newRoute[index], ...updates }
    setRoute(newRoute)
  }

  const calculateDistance = (coord1: [number, number], coord2: [number, number]): number => {
    const R = 6371
    const dLat = ((coord2[1] - coord1[1]) * Math.PI) / 180
    const dLon = ((coord2[0] - coord1[0]) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((coord1[1] * Math.PI) / 180) *
        Math.cos((coord2[1] * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const getTooltipPosition = (mousePos: { x: number; y: number }) => {
    const tooltipWidth = 200 // Approximate tooltip width
    const tooltipHeight = 60 // Approximate tooltip height
    const offset = 10
    
    let x = mousePos.x + offset
    let y = mousePos.y - offset
    
    // Prevent going off right edge
    if (x + tooltipWidth > window.innerWidth) {
      x = mousePos.x - tooltipWidth - offset
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

  const getVisaRequirementForCountry = (countryName: string) => {
    const geo = allGeographies.find((g) => g.properties.name === countryName)
    if (!geo) {
      return { requirement: "unknown", notes: "Information not available" }
    }

    // Convert geography ID to ISO code for API lookup
    const isoCode = getISOFromGeographyId(geo.id)
    
    // Special case: if looking up visa requirements for own country
    if (isoCode === nationality) {
      return { 
        requirement: "visa-free", 
        notes: "No visa required for own country",
        country: countryName,
        countryCode: isoCode
      }
    }
    
    const visaReq = isoCode ? visaRequirements[isoCode] : null
    
    if (!visaReq) {
    }
    
    return visaReq || { requirement: "unknown", notes: "Information not available" }
  }

  const calculateTotalDistance = (routeData: Country[]): number => {
    let total = 0
    for (let i = 0; i < routeData.length - 1; i++) {
      total += calculateDistance(routeData[i].coordinates, routeData[i + 1].coordinates)
    }
    return Math.round(total)
  }

  const calculateTotalVisaCost = (routeData: Country[]): number => {
    const total = 0
    routeData.forEach((country) => {
      const visa = getVisaRequirementForCountry(country.name)
      // API doesn't provide cost data, so we'll return 0 for now
      // This can be enhanced when cost data is available
    })
    return total
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm z-10 flex-shrink-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold mb-1">Plan Your Route</h1>
              <div className="flex items-center gap-2 text-sm flex-wrap">
                {!isRoutePlanned ? (
                  <>
                    <div
                      className={`flex items-center gap-2 ${step === "select-start" ? "text-primary font-medium" : "text-muted-foreground"}`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === "select-start" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                      >
                        1
                      </div>
                      <span>Select start country</span>
                    </div>
                    <span className="text-muted-foreground">→</span>
                    <div
                      className={`flex items-center gap-2 ${step === "select-destination" ? "text-primary font-medium" : "text-muted-foreground"}`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === "select-destination" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                      >
                        2
                      </div>
                      <span>Select destination</span>
                    </div>
                    {step === "adding-countries" && (
                      <>
                        <span className="text-muted-foreground">→</span>
                        <div className="flex items-center gap-2 text-primary font-medium">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs bg-primary text-primary-foreground">
                            3
                          </div>
                          <span>Add more countries (optional)</span>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground">
                    Route planned! Countries are color-coded by visa requirements.
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Filter className="w-4 h-4" />
                    <span className="hidden sm:inline">Filter</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuCheckboxItem checked={showVisaFreeOnly} onCheckedChange={setShowVisaFreeOnly}>
                    Show visa-free only
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" size="sm" onClick={onChangeNationality} className="gap-2">
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">{getCountryNameFromCode(nationality)}</span>
              </Button>

              {route.length > 0 && !isRoutePlanned && (
                <Button variant="outline" size="sm" onClick={handleUndoLast} className="gap-2 bg-transparent">
                  <Undo2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Undo</span>
                </Button>
              )}


              {route.length >= 2 && !isRoutePlanned && (
                <Button onClick={handlePlanRoute} size="sm" className="gap-2">
                  <Flag className="w-4 h-4" />
                  Plan Route
                </Button>
              )}

              {isRoutePlanned && (
                <>
                  <Button onClick={handleCancelPlanning} variant="outline" size="sm" className="gap-2 bg-transparent">
                    Edit Route
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                        <Share2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Share</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleShare}>
                        <Share2 className="w-4 h-4 mr-2" />
                        Share trip
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleSaveTrip}>
                        <Save className="w-4 h-4 mr-2" />
                        Save trip
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleExport}>
                        <Download className="w-4 h-4 mr-2" />
                        Export as JSON
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button onClick={() => setShowResetDialog(true)} variant="outline" size="sm" className="gap-2">
                    <RotateCcw className="w-4 h-4" />
                    <span className="hidden sm:inline">Reset</span>
                  </Button>
                </>
              )}

              {route.length > 0 && !isRoutePlanned && (
                <Button onClick={() => setShowResetDialog(true)} variant="ghost" size="sm" className="gap-2">
                  <RotateCcw className="w-4 h-4" />
                  <span className="hidden sm:inline">Reset</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Map */}
        <div className="flex-1 relative bg-background overflow-hidden">
          {isLoadingVisa && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
              <Card className="p-6 max-w-md">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-medium">Loading visa requirements...</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  ⚠️ Visa requirements change frequently and may not reflect recent policy updates. Always verify current requirements with official embassy sources before travel.
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

            </ZoomableGroup>
          </ComposableMap>

          <AnimatePresence>
            {hoveredCountry && mousePosition && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="fixed z-50 pointer-events-none"
                style={{
                  left: `${getTooltipPosition(mousePosition).x}px`,
                  top: `${getTooltipPosition(mousePosition).y}px`,
                }}
              >
                <Card className="px-4 py-2 bg-card/95 backdrop-blur-sm border-primary/20 shadow-lg">
                  <p className="text-sm font-medium">{hoveredCountry}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {getVisaRequirementForCountry(hoveredCountry).requirement?.replace("-", " ") || "Unknown"}
                  </p>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {isRoutePlanned && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute bottom-4 left-4"
            >
              <Card className="p-3 bg-card/95 backdrop-blur-sm max-w-[280px]">
                <h3 className="text-xs font-semibold mb-2">Visa Requirements</h3>
                <div className="grid grid-cols-1 gap-1.5 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "oklch(0.65 0.18 140)" }} />
                    <span>Visa-Free</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "oklch(0.70 0.20 60)" }} />
                    <span>Visa on Arrival</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "oklch(0.60 0.18 280)" }} />
                    <span>eVisa</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "oklch(0.55 0.22 25)" }} />
                    <span>Visa Required</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "oklch(0.35 0.15 0)" }} />
                    <span>No Admission</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {!isRoutePlanned && route.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute bottom-4 right-4"
            >
              <Card className="p-3 bg-card/95 backdrop-blur-sm">
                <p className="text-xs text-muted-foreground mb-2 font-semibold">Keyboard Shortcuts</p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">⌘Z</kbd>
                    <span>Undo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Enter</kbd>
                    <span>Plan route</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Esc</kbd>
                    <span>Cancel</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>

        {route.length > 0 && (
          <TripDetails
            route={route}
            nationality={nationality}
            onRemove={removeCountry}
            onMove={moveCountry}
            onUpdate={updateCountry}
            isPlanned={isRoutePlanned}
            visaRequirements={visaRequirements}
            allGeographies={allGeographies}
          />
        )}
      </div>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset your trip?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all selected countries and start over. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset}>Reset Trip</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
