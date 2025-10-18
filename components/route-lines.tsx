"use client"

import { motion } from "framer-motion"
import { Marker, Line, useMapContext, useZoomPanContext } from "react-simple-maps"
import type { Country } from "@/lib/visa-data"

interface RouteLinesProps {
  route: Country[]
}

// Component to render markers with zoom-based scaling
function MarkerWithZoom({ country, index, isStart, isEnd, isWaypoint, route }: {
  country: Country
  index: number
  isStart: boolean
  isEnd: boolean
  isWaypoint: boolean
  route: Country[]
}) {
  const { k: zoom } = useZoomPanContext()
  
  // Calculate dynamic marker size based on zoom level
  // Base radius of 6-8, scaled inversely with zoom (smaller when zoomed in)
  const baseRadius = isStart ? 6 : isEnd ? 8 : 8
  const radius = Math.max(3, Math.min(12, baseRadius / zoom))
  
  // Calculate dynamic stroke width
  const strokeWidth = Math.max(1, Math.min(3, 2 / zoom))
  
  // Calculate dynamic font size for waypoint numbers - proportional to marker size
  const fontSize = Math.max(4, Math.min(16, radius * 0.8))

  return (
    <>
      {isStart && (
        // Start marker - Flag/Pin style
        <g style={{ userSelect: "none", WebkitUserSelect: "none", MozUserSelect: "none", msUserSelect: "none" }}>
          <motion.circle
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            r={radius}
            fill="oklch(0.75 0.15 180)"
            stroke="oklch(0.12 0.01 240)"
            strokeWidth={strokeWidth}
            style={{
              filter: "drop-shadow(0 0 8px oklch(0.75 0.15 180 / 0.8))",
            }}
          />
          <motion.path
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            d={`M 0,-${radius} L 0,-${radius * 2.5} L ${radius * 1.3},-${radius * 2.2} L 0,-${radius * 1.7} Z`}
            fill="oklch(0.75 0.15 180)"
            stroke="oklch(0.12 0.01 240)"
            strokeWidth={strokeWidth * 0.5}
            style={{
              filter: "drop-shadow(0 0 4px oklch(0.75 0.15 180 / 0.6))",
            }}
          />
        </g>
      )}

      {isWaypoint && (
        // Waypoint marker - Numbered circle
        <g style={{ userSelect: "none", WebkitUserSelect: "none", MozUserSelect: "none", msUserSelect: "none" }}>
          <motion.circle
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.3 + 0.2, type: "spring", stiffness: 200 }}
            r={radius}
            fill="oklch(0.70 0.20 60)"
            stroke="oklch(0.12 0.01 240)"
            strokeWidth={strokeWidth}
            style={{
              filter: "drop-shadow(0 0 8px oklch(0.70 0.20 60 / 0.8))",
            }}
          />
          <text
            textAnchor="middle"
            y={fontSize * 0.3}
            x={0}
            style={{
              fontSize: `${fontSize}px`,
              fill: "oklch(0.12 0.01 240)",
              fontWeight: "bold",
              pointerEvents: "none",
              userSelect: "none",
              WebkitUserSelect: "none",
              MozUserSelect: "none",
              msUserSelect: "none",
            }}
          >
            {index}
          </text>
        </g>
      )}

      {isEnd && (
        // Destination marker - Green Flag/Pin style
        <g style={{ userSelect: "none", WebkitUserSelect: "none", MozUserSelect: "none", msUserSelect: "none" }}>
          <motion.circle
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: (route.length - 1) * 0.3 + 0.2, type: "spring", stiffness: 200 }}
            r={radius}
            fill="oklch(0.65 0.18 140)"
            stroke="oklch(0.12 0.01 240)"
            strokeWidth={strokeWidth}
            style={{
              filter: "drop-shadow(0 0 8px oklch(0.65 0.18 140 / 0.8))",
            }}
          />
          <motion.path
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: (route.length - 1) * 0.3 + 0.3, type: "spring", stiffness: 200 }}
            d={`M 0,-${radius} L 0,-${radius * 2.5} L ${radius * 1.3},-${radius * 2.2} L 0,-${radius * 1.7} Z`}
            fill="oklch(0.65 0.18 140)"
            stroke="oklch(0.12 0.01 240)"
            strokeWidth={strokeWidth * 0.5}
            style={{
              filter: "drop-shadow(0 0 4px oklch(0.65 0.18 140 / 0.6))",
            }}
          />
        </g>
      )}
    </>
  )
}

// Component to render curved dotted lines between countries
function CurvedLine({ from, to, index }: { from: [number, number], to: [number, number], index: number }) {
  const { projection } = useMapContext()
  const { k: zoom } = useZoomPanContext()

  // Project the coordinates to the map's projection
  const projectedFrom = projection(from)
  const projectedTo = projection(to)
  
  if (!projectedFrom || !projectedTo) return null
  
  const [x0, y0] = projectedFrom
  const [x1, y1] = projectedTo

  // Calculate dynamic stroke width based on zoom level
  // Base width of 2, scaled inversely with zoom (smaller when zoomed in)
  const strokeWidth = Math.max(0.5, Math.min(4, 2 / zoom))
  
  // Calculate dynamic dash pattern based on zoom level and distance
  const distance = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2))
  
  // Adjust dash pattern based on distance - shorter distances get smaller, more frequent dashes
  const baseDashLength = distance < 100 ? 3 : distance < 200 ? 5 : 8
  const baseGapLength = distance < 100 ? 3 : distance < 200 ? 4 : 6
  
  const dashLength = Math.max(2, Math.min(12, baseDashLength / zoom))
  const gapLength = Math.max(1, Math.min(10, baseGapLength / zoom))
  
  // For very long distances (like transcontinental), use a more pronounced curve
  // For shorter distances, use a gentler curve
  const curveHeight = Math.min(Math.max(distance * 0.2, 30), 100)
  
  // Define control points for the Bezier curve
  const midX = (x0 + x1) / 2
  const midY = (y0 + y1) / 2
  
  // Create control points that create a more pronounced arc
  const controlPoint1 = [midX, midY - curveHeight]
  const controlPoint2 = [midX, midY - curveHeight * 0.4]

  // Create the path for the curve using cubic Bezier
  const path = `M${x0},${y0} C${controlPoint1[0]},${controlPoint1[1]} ${controlPoint2[0]},${controlPoint2[1]} ${x1},${y1}`

  return (
    <motion.path
      initial={{ strokeDashoffset: 1000, opacity: 0 }}
      animate={{ 
        strokeDashoffset: 0, 
        opacity: 1
      }}
      transition={{ 
        strokeDashoffset: { duration: 2, ease: "easeInOut", delay: index * 0.5 },
        opacity: { duration: 1, delay: index * 0.5 }
      }}
      d={path}
      fill="none"
      stroke="white"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeDasharray={`${dashLength} ${gapLength}`}
      style={{
        filter: "drop-shadow(0 4px 12px rgba(255, 255, 255, 0.4)) drop-shadow(0 2px 4px rgba(255, 255, 255, 0.2))",
      }}
    />
  )
}

export function RouteLines({ route }: RouteLinesProps) {
  return (
    <>
      {/* Define gradient for the route lines */}
      <defs>
        <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="30%" stopColor="#f0f0f0" stopOpacity="1" />
          <stop offset="70%" stopColor="#e0e0e0" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="1" />
        </linearGradient>
      </defs>

      {route.map((country, index) => {
        if (index === route.length - 1) return null

        const start = country.coordinates
        const end = route[index + 1].coordinates

        return (
          <CurvedLine
            key={`${country.id}-${route[index + 1].id}`}
            from={start}
            to={end}
            index={index}
          />
        )
      })}

      {route.map((country, index) => {
        const isStart = index === 0
        const isEnd = index === route.length - 1
        const isWaypoint = !isStart && !isEnd

        return (
          <Marker key={`marker-${country.id}`} coordinates={country.coordinates}>
            <MarkerWithZoom country={country} index={index} isStart={isStart} isEnd={isEnd} isWaypoint={isWaypoint} route={route} />
          </Marker>
        )
      })}
    </>
  )
}
