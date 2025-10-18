"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getVisaRequirement, calculateTotalDistance, type Country } from "@/lib/visa-data"
import { ProcessedVisaRequirement } from "@/lib/visa-api"
import { getISOFromGeographyId, getCountryNameFromCode } from "@/lib/country-mapping"
import {
  X,
  Clock,
  FileText,
  Flag,
  Navigation,
  Calendar,
  StickyNote,
  MapPin,
  Plane,
  GripVertical,
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useState } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import {
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface TripDetailsProps {
  route: Country[]
  nationality: string
  onRemove: (index: number) => void
  onMove: (fromIndex: number, toIndex: number) => void
  onUpdate: (index: number, updates: Partial<Country>) => void
  isPlanned: boolean
  visaRequirements: Record<string, ProcessedVisaRequirement>
  allGeographies: any[]
}

// Sortable Country Item Component
function SortableCountryItem({ 
  country, 
  index, 
  route, 
  nationality, 
  onRemove, 
  onUpdate, 
  isPlanned, 
  visaRequirements, 
  allGeographies 
}: {
  country: Country
  index: number
  route: Country[]
  nationality: string
  onRemove: (index: number) => void
  onUpdate: (index: number, updates: Partial<Country>) => void
  isPlanned: boolean
  visaRequirements: Record<string, ProcessedVisaRequirement>
  allGeographies: any[]
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: country.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? "z-50" : ""}>
      <CountryItem
        country={country}
        index={index}
        route={route}
        nationality={nationality}
        onRemove={onRemove}
        onUpdate={onUpdate}
        isPlanned={isPlanned}
        visaRequirements={visaRequirements}
        allGeographies={allGeographies}
        dragAttributes={attributes}
        dragListeners={listeners}
        isDragging={isDragging}
      />
    </div>
  )
}

// Country Item Component
function CountryItem({ 
  country, 
  index, 
  route, 
  nationality, 
  onRemove, 
  onUpdate, 
  isPlanned, 
  visaRequirements, 
  allGeographies,
  dragAttributes,
  dragListeners,
  isDragging
}: {
  country: Country
  index: number
  route: Country[]
  nationality: string
  onRemove: (index: number) => void
  onUpdate: (index: number, updates: Partial<Country>) => void
  isPlanned: boolean
  visaRequirements: Record<string, ProcessedVisaRequirement>
  allGeographies: any[]
  dragAttributes?: any
  dragListeners?: any
  isDragging?: boolean
}) {

  const isStart = index === 0
  const isEnd = index === route.length - 1

  // Try to get visa requirement from API data first, then fallback
  const geo = allGeographies.find((g) => g.properties.name === country.name)
  const isoCode = geo ? getISOFromGeographyId(geo.id) : null
  
  // Special case: if looking up visa requirements for own country
  let apiVisaReq = null
  if (isoCode === nationality) {
    apiVisaReq = { 
      requirement: "visa-free", 
      notes: "No visa required for own country",
      country: country.name,
      countryCode: isoCode
    }
  } else {
    apiVisaReq = isoCode ? visaRequirements[isoCode] : null
  }
  
  const fallbackVisaReq = getVisaRequirement(nationality, country.name)
  const visaReq = apiVisaReq || fallbackVisaReq
  
  
  // Normalize the requirement type
  const requirementType = apiVisaReq?.requirement || fallbackVisaReq.type

  const getVisaColor = (type: string) => {
    switch (type) {
      case "visa-free":
      case "visa free":
        return "bg-[oklch(0.65_0.18_140)]"
      case "visa-on-arrival":
      case "visa on arrival":
        return "bg-[oklch(0.70_0.20_60)]"
      case "evisa":
      case "e-visa":
        return "bg-[oklch(0.60_0.18_280)]"
      case "visa-required":
      case "visa required":
        return "bg-[oklch(0.55_0.22_25)]"
      case "no-admission":
        return "bg-[oklch(0.35_0.15_0)]"
      default:
        return "bg-red-600/80 text-white"
    }
  }

  const getVisaLabel = (type: string) => {
    switch (type) {
      case "visa-free":
      case "visa free":
        return "Visa-Free"
      case "visa-on-arrival":
      case "visa on arrival":
        return "Visa on Arrival"
      case "evisa":
      case "e-visa":
        return "eVisa"
      case "visa-required":
      case "visa required":
        return "Visa Required"
      case "no-admission":
        return "No Admission"
      default:
        return "Unknown"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={isDragging ? "opacity-50" : ""}
    >
      <Card className="p-4 bg-card border-border/50 hover:border-primary/50 transition-colors">
        <div className="flex items-start gap-3">
          {/* Drag Handle */}
          <div className="flex flex-col items-center gap-2 pt-1">
            <div 
              {...dragAttributes} 
              {...dragListeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded transition-colors"
              title="Drag to reorder"
            >
              <GripVertical className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 pt-1">
            {isStart ? (
              <div className="w-6 h-6 rounded-full bg-[oklch(0.75_0.15_180)] flex items-center justify-center">
                <Flag className="w-3 h-3 text-background" />
              </div>
            ) : isEnd ? (
              <div className="w-6 h-6 rounded-full bg-[oklch(0.65_0.18_140)] flex items-center justify-center">
                <Navigation className="w-3 h-3 text-background" />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-[oklch(0.70_0.20_60)] flex items-center justify-center text-xs font-bold text-background">
                {index}
              </div>
            )}
            {index < route.length - 1 && <div className="w-px h-8 bg-border" />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-sm">{country.name}</h3>
                {isStart && (
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">Start</span>
                )}
                {isEnd && (
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    Destination
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 -mt-1 hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
                onClick={() => onRemove(index)}
                title="Remove country"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>

            {country.dates && (
              <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(country.dates.arrival).toLocaleDateString()} -{" "}
                {new Date(country.dates.departure).toLocaleDateString()}
              </div>
            )}

            {country.notes && (
              <div className="text-xs text-muted-foreground mb-2 flex items-start gap-1">
                <StickyNote className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{country.notes}</span>
              </div>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              {isPlanned && (
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="text-left hover:opacity-80 transition-opacity">
                      <div
                        className={`inline-flex items-center gap-2 px-2 py-1 rounded text-xs font-medium ${getVisaColor(requirementType)} text-background`}
                      >
                        {getVisaLabel(requirementType)}
                      </div>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 select-none" side="left">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold mb-1">{country.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Visa requirements for {getCountryNameFromCode(nationality)} citizens
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Requirement</p>
                            <p className="text-sm text-muted-foreground">{getVisaLabel(requirementType)}</p>
                          </div>
                        </div>

                        {apiVisaReq?.duration && (
                          <div className="flex items-start gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">Duration</p>
                              <p className="text-sm text-muted-foreground">{apiVisaReq.duration} days</p>
                            </div>
                          </div>
                        )}

                        {(apiVisaReq?.notes || (fallbackVisaReq.notes && !apiVisaReq)) && (
                          <div className="pt-2 border-t border-border">
                            <p className="text-xs text-muted-foreground">{apiVisaReq?.notes || fallbackVisaReq.notes}</p>
                          </div>
                        )}

                        <div className="pt-2 border-t border-border">
                          <p className="text-xs text-muted-foreground">
                            ⚠️ Visa requirements change frequently. Always verify with official sources before travel.
                          </p>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    {country.dates || country.notes ? "Edit" : "Add"} details
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit {country.name}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Arrival Date</Label>
                      <Input
                        type="date"
                        defaultValue={country.dates?.arrival}
                        onChange={(e) => {
                          onUpdate(index, {
                            dates: {
                              arrival: e.target.value,
                              departure: country.dates?.departure || "",
                            },
                          })
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Departure Date</Label>
                      <Input
                        type="date"
                        defaultValue={country.dates?.departure}
                        onChange={(e) => {
                          onUpdate(index, {
                            dates: {
                              arrival: country.dates?.arrival || "",
                              departure: e.target.value,
                            },
                          })
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Textarea
                        placeholder="Add notes about this destination..."
                        defaultValue={country.notes}
                        onChange={(e) => {
                          onUpdate(index, { notes: e.target.value })
                        }}
                        rows={4}
                      />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export function TripDetails({ route, nationality, onRemove, onMove, onUpdate, isPlanned, visaRequirements, allGeographies }: TripDetailsProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = route.findIndex((item) => item.id === active.id)
      const newIndex = route.findIndex((item) => item.id === over.id)
      
      onMove(oldIndex, newIndex)
    }
  }

  const totalDistance = calculateTotalDistance(route)
  const visaFreeCount = route.filter((c) => {
    const geo = allGeographies.find((g) => g.properties.name === c.name)
    const isoCode = geo ? getISOFromGeographyId(geo.id) : null
    
    // Special case: own country is always visa-free
    let apiVisaReq = null
    if (isoCode === nationality) {
      apiVisaReq = { requirement: "visa-free" }
    } else {
      apiVisaReq = isoCode ? visaRequirements[isoCode] : null
    }
    
    const fallbackVisaReq = getVisaRequirement(nationality, c.name)
    const requirement = apiVisaReq?.requirement || fallbackVisaReq.type
    return requirement === "visa-free"
  }).length

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 25 }}
      className="w-full lg:w-96 border-l border-border bg-card/50 backdrop-blur-sm flex flex-col h-full"
    >
      <div className="flex-shrink-0 p-6 pb-4">
        <div>
          <h2 className="text-xl font-bold mb-2">Your Trip</h2>
          <p className="text-sm text-muted-foreground">
            {route.length} {route.length === 1 ? "country" : "countries"} in your route
          </p>
          {route.length > 1 && (
            <p className="text-xs text-muted-foreground mt-1">
              Drag countries to reorder your trip
            </p>
          )}
        </div>

        {isPlanned && (
          <Card className="p-4 bg-card border-border/50 mt-6">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Plane className="w-4 h-4" />
              Trip Statistics
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" />
                  Total distance
                </span>
                <span className="font-semibold">{totalDistance.toLocaleString()} km</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Flag className="w-3.5 h-3.5" />
                  Visa-free
                </span>
                <span className="font-semibold text-[oklch(0.65_0.18_140)]">
                  {visaFreeCount} / {route.length}
                </span>
              </div>
            </div>
          </Card>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={route.map(c => c.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {route.map((country, index) => (
                <SortableCountryItem
                  key={country.id}
                  country={country}
                  index={index}
                  route={route}
                  nationality={nationality}
                  onRemove={onRemove}
                  onUpdate={onUpdate}
                  isPlanned={isPlanned}
                  visaRequirements={visaRequirements}
                  allGeographies={allGeographies}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </motion.div>
  )
}


