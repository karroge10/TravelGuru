"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TripDetails } from "@/components/trip-details"
import { RouteLines } from "@/components/route-lines"
import { NationalityDropdown } from "@/components/nationality-dropdown"
import { getAllVisaRequirements, getLastUpdatedDate, type ProcessedVisaRequirement } from "@/lib/visa-api"
import { calculateTotalDistance, type Country } from "@/lib/visa-data"
import { getISOFromGeographyId, getCountryNameFromCode } from "@/lib/country-mapping"
import { getVisaRequirementsForNationality, getVisaRequirementForCountry } from "@/lib/visa-service"
import { Flag, RotateCcw, Undo2, Globe, Filter, Share2, Save, Download } from "lucide-react"
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

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

interface WorldMapProps {
  nationality: string | null
  onNationalityChange: (nationality: string) => void
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
  const throttledMouseMove = React.useRef<NodeJS.Timeout | null>(null)

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
                  // Throttled mouse move for better performance
                  if (throttledMouseMove.current) return
                  
                  throttledMouseMove.current = setTimeout(() => {
                    setMousePosition({ x: e.clientX, y: e.clientY })
                    throttledMouseMove.current = null
                  }, 32) // ~30fps - more responsive than before but still throttled
                }}
                onTouchStart={(e: React.TouchEvent) => {
                  const touch = e.touches[0]
                  setHoveredCountry(geo.properties.name)
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

export function WorldMap({ nationality, onNationalityChange }: WorldMapProps) {
  const isMobile = useIsMobile()
  const [step, setStep] = useState<Step>("select-start")
  const [route, setRoute] = useState<Country[]>([])
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null)
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 })
  const [isRoutePlanned, setIsRoutePlanned] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [showVisaFreeOnly, setShowVisaFreeOnly] = useState(false)
  const [showVisaRequiredOnly, setShowVisaRequiredOnly] = useState(false)
  const [showEVisaOnly, setShowEVisaOnly] = useState(false)
  const [showOnArrivalOnly, setShowOnArrivalOnly] = useState(false)
  const [allGeographies, setAllGeographies] = useState<any[]>([])
  const [visaRequirements, setVisaRequirements] = useState<Record<string, ProcessedVisaRequirement>>({})
  const [isLoadingVisa, setIsLoadingVisa] = useState(true)
  const [showTripDetails, setShowTripDetails] = useState(false)

  // All useEffect hooks must be called before any conditional returns
  useEffect(() => {
    if (!nationality) return
    
    const fetchVisaData = async () => {
      setIsLoadingVisa(true)
      try {
        const result = await getVisaRequirementsForNationality(nationality)
        
        if (result.error) {
          toast.error("Failed to load visa requirements", {
            description: result.error.message,
          })
          setVisaRequirements({})
        } else if (result.data) {
          setVisaRequirements(result.data)
        } else {
          setVisaRequirements({})
        }
        
      } catch (error) {
        toast.error("Failed to load visa requirements", {
          description: "Network error occurred. Please try again.",
        })
        setVisaRequirements({})
      } finally {
        setIsLoadingVisa(false)
      }
    }

    fetchVisaData()
  }, [nationality])

  useEffect(() => {
    // Only run on client side to avoid hydration mismatch
    if (typeof window === 'undefined' || !nationality) return
    
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
    if (typeof window === 'undefined' || !nationality) return
    
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

  if (!nationality) {
    return (
      <div className="min-h-screen flex items-center sm:items-center justify-center pb-40 sm:pt-0">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 overflow-hidden">
            <Image 
              src="/logo.jpg" 
              alt="Visa Planner Logo" 
              width={80} 
              height={80} 
              className="object-cover rounded-full"
              priority
            />
          </div>
          <h1 className="text-4xl font-bold mb-3">Visa Planner</h1>
          <p className="text-muted-foreground text-lg mb-8">Select your nationality to start planning your visa-free travel routes</p>
          <NationalityDropdown 
            nationality={nationality} 
            onNationalityChange={onNationalityChange}
            className="text-lg px-6 py-3"
          />
        </div>
      </div>
    )
  }

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
    }
  }

  const getCentroid = (geo: any): [number, number] => {
    // Handle different geometry types (Polygon vs MultiPolygon)
    let coordinates = geo.geometry.coordinates
    
    // For MultiPolygon, use the largest polygon (usually the mainland)
    if (geo.geometry.type === 'MultiPolygon') {
      // Find the polygon with the most coordinates (likely the mainland)
      coordinates = coordinates.reduce((largest: any, current: any) => {
        return current[0].length > largest[0].length ? current : largest
      })
    }
    
    // Extract the outer ring coordinates
    const outerRing = coordinates[0]
    if (!outerRing || outerRing.length === 0) return [0, 0]

    let sumLon = 0
    let sumLat = 0
    let count = 0

    // Process only the outer ring coordinates
    outerRing.forEach((coord: any) => {
      if (Array.isArray(coord) && coord.length >= 2) {
        sumLon += coord[0]
        sumLat += coord[1]
        count++
      }
    })

    return count > 0 ? [sumLon / count, sumLat / count] : [0, 0]
  }

  const getCountryColor = (geo: any) => {
    const countryId = geo.id
    const isInRoute = route.some((c) => c.id === countryId)

    // Convert geography ID to ISO code for API lookup
    const isoCode = getISOFromGeographyId(countryId)
    
    // Get visa requirement using the new service (API-only)
    const visaReq = isoCode ? getVisaRequirementForCountry(isoCode, nationality!, visaRequirements) : null

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

  // Memoize tooltip content calculation for better performance
  const tooltipContent = useMemo(() => {
    if (!hoveredCountry) return "Unknown"
    const geo = allGeographies.find((g) => g.properties.name === hoveredCountry)
    const isoCode = geo ? getISOFromGeographyId(geo.id) : null
    const visaReq = isoCode ? getVisaRequirementForCountry(isoCode, nationality!, visaRequirements) : null
    return visaReq?.requirement?.replace("-", " ") || "Unknown"
  }, [hoveredCountry, allGeographies, nationality, visaRequirements])

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

    // Calculate trip statistics
    const totalDistance = calculateTotalDistance(route)
    const visaFreeCount = route.filter((c) => {
      const geo = allGeographies.find((g) => g.properties.name === c.name)
      const isoCode = geo ? getISOFromGeographyId(geo.id) : null
      
      let apiVisaReq = null
      if (isoCode === nationality) {
        apiVisaReq = { requirement: "visa-free" }
      } else {
        apiVisaReq = isoCode ? visaRequirements[isoCode] : null
      }
      
      const requirement = apiVisaReq?.requirement || 'unknown'
      return requirement === "visa-free"
    }).length

    const shareText = `🌍 My Visa Planner Trip Plan

📍 Route: ${route.map((c) => c.name).join(" → ")}

📊 Trip Stats:
• Total Distance: ${totalDistance.toLocaleString()} km
• Countries: ${route.length}
• Visa-free countries: ${visaFreeCount}/${route.length}

👤 Traveler: ${getCountryNameFromCode(nationality)} passport holder

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
      route: route.map((c) => {
        const geo = allGeographies.find((g) => g.properties.name === c.name)
        const isoCode = geo ? getISOFromGeographyId(geo.id) : null
        return {
          name: c.name,
          dates: c.dates,
          notes: c.notes,
          visa: isoCode ? getVisaRequirementForCountry(isoCode, nationality!, visaRequirements) : null,
        }
      }),
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
      const geo = allGeographies.find((g) => g.properties.name === country.name)
      const isoCode = geo ? getISOFromGeographyId(geo.id) : null
      const visa = isoCode ? getVisaRequirementForCountry(isoCode, nationality!, visaRequirements) : null
      // API doesn't provide cost data, so we'll return 0 for now
      // This can be enhanced when cost data is available
    })
    return total
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm z-10 flex-shrink-0">
        <div className="px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold">Visa Planner</h1>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {!isRoutePlanned && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1 sm:gap-2 bg-transparent h-8 sm:h-9">
                      <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Filter</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuCheckboxItem checked={showVisaFreeOnly} onCheckedChange={setShowVisaFreeOnly}>
                      Visa-Free
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={showVisaRequiredOnly} onCheckedChange={setShowVisaRequiredOnly}>
                      Visa Required
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={showEVisaOnly} onCheckedChange={setShowEVisaOnly}>
                      E-Visa
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={showOnArrivalOnly} onCheckedChange={setShowOnArrivalOnly}>
                      Visa on Arrival
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <NationalityDropdown 
                nationality={nationality} 
                onNationalityChange={onNationalityChange}
                className="gap-1 sm:gap-2 h-8 sm:h-9"
              />


              {route.length >= 2 && !isRoutePlanned && (
                <Button onClick={handlePlanRoute} size="sm" className="gap-1 sm:gap-2 h-8 sm:h-9">
                  <Flag className="w-3 h-3 sm:w-4 sm:h-4" />
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
                        <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
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

                  <Button onClick={() => setShowResetDialog(true)} variant="outline" size="sm" className="gap-1 sm:gap-2 h-8 sm:h-9">
                    <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Reset</span>
                  </Button>
                </>
              )}

              {route.length > 0 && !isRoutePlanned && (
                <Button onClick={() => setShowResetDialog(true)} variant="ghost" size="sm" className="gap-1 sm:gap-2 h-8 sm:h-9">
                  <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Reset</span>
                </Button>
              )}

            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative">
        {/* Map */}
        <div className={`flex-1 relative bg-background overflow-hidden ${isMobile && showTripDetails ? 'hidden' : ''}`}>
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
                <Card className={`px-3 py-2 bg-card/95 backdrop-blur-sm border-primary/20 shadow-lg ${isMobile ? 'text-xs' : 'px-4'}`}>
                  <p className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>{hoveredCountry}</p>
                  <p className={`text-muted-foreground capitalize ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
                    {tooltipContent}
                  </p>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {isRoutePlanned && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`absolute ${isMobile ? 'top-2 left-2' : 'top-4 left-4'}`}
            >
              <Card className={`p-3 bg-card/95 backdrop-blur-sm ${isMobile ? 'max-w-[240px]' : 'max-w-[280px]'}`}>
                <h3 className={`font-semibold mb-2 ${isMobile ? 'text-xs' : 'text-xs'}`}>Visa Requirements</h3>
                <div className="grid grid-cols-1 gap-1.5 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "oklch(0.65 0.18 140)" }} />
                    <span className={isMobile ? 'text-[10px]' : 'text-xs'}>Visa-Free</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "oklch(0.70 0.20 60)" }} />
                    <span className={isMobile ? 'text-[10px]' : 'text-xs'}>Visa on Arrival</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "oklch(0.60 0.18 280)" }} />
                    <span className={isMobile ? 'text-[10px]' : 'text-xs'}>eVisa</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "oklch(0.55 0.22 25)" }} />
                    <span className={isMobile ? 'text-[10px]' : 'text-xs'}>Visa Required</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "oklch(0.35 0.15 0)" }} />
                    <span className={isMobile ? 'text-[10px]' : 'text-xs'}>No Admission</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}


          {/* Mobile Trip Details Hint - only in plan mode */}
          {isMobile && route.length > 0 && isRoutePlanned && !showTripDetails && (
            <motion.div
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
                  <motion.div
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <svg 
                      className="w-4 h-4 text-primary" 
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
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>

        {route.length > 0 && !isMobile && (
          <TripDetails
            route={route}
            nationality={nationality}
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
  )
}
