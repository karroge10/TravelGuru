"use client"

import { motion } from "framer-motion"
import { Marker } from "react-simple-maps"
import type { Country } from "@/lib/visa-data"

interface RouteLinesProps {
  route: Country[]
}

export function RouteLines({ route }: RouteLinesProps) {
  const createCurvedPath = (start: [number, number], end: [number, number]) => {
    // Calculate the distance between points
    const distance = Math.sqrt(Math.pow(end[0] - start[0], 2) + Math.pow(end[1] - start[1], 2))
    
    // For very long distances (like transcontinental), use a more pronounced curve
    // For shorter distances, use a gentler curve
    const curveHeight = Math.min(Math.max(distance * 0.1, 5), 30)
    
    // Calculate control point - create an arc that goes "up" from the straight line
    const midX = (start[0] + end[0]) / 2
    const midY = (start[1] + end[1]) / 2
    
    // For very long distances, create a more pronounced arc
    const arcDirection = distance > 100 ? curveHeight : curveHeight * 0.5
    
    
    return `M ${start[0]},${start[1]} Q ${midX},${midY - arcDirection} ${end[0]},${end[1]}`
  }

  return (
    <>
      {route.map((country, index) => {
        if (index === route.length - 1) return null

        const start = country.coordinates
        const end = route[index + 1].coordinates

        return (
          <motion.g
            key={`${country.id}-${route[index + 1].id}`}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, ease: "easeInOut", delay: index * 0.5 }}
          >
            <motion.path
              d={createCurvedPath(start, end)}
              fill="none"
              stroke="#3b82f6"
              strokeWidth={3}
              strokeLinecap="round"
              strokeDasharray="8 4"
              strokeDashoffset={0}
              style={{
                filter: "drop-shadow(0 2px 8px rgba(59, 130, 246, 0.6))",
              }}
            />
          </motion.g>
        )
      })}

      {route.map((country, index) => {
        const isStart = index === 0
        const isEnd = index === route.length - 1
        const isWaypoint = !isStart && !isEnd

        return (
          <Marker key={`marker-${country.id}`} coordinates={country.coordinates}>
            {isStart && (
              // Start marker - Flag/Pin style
              <g>
                <motion.circle
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  r={6}
                  fill="oklch(0.75 0.15 180)"
                  stroke="oklch(0.12 0.01 240)"
                  strokeWidth={2}
                  style={{
                    filter: "drop-shadow(0 0 8px oklch(0.75 0.15 180 / 0.8))",
                  }}
                />
                <motion.path
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  d="M 0,-6 L 0,-16 L 8,-13 L 0,-10 Z"
                  fill="oklch(0.75 0.15 180)"
                  stroke="oklch(0.12 0.01 240)"
                  strokeWidth={1}
                  style={{
                    filter: "drop-shadow(0 0 4px oklch(0.75 0.15 180 / 0.6))",
                  }}
                />
              </g>
            )}

            {isWaypoint && (
              // Waypoint marker - Numbered circle
              <g>
                <motion.circle
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.3 + 0.2, type: "spring", stiffness: 200 }}
                  r={8}
                  fill="oklch(0.70 0.20 60)"
                  stroke="oklch(0.12 0.01 240)"
                  strokeWidth={2}
                  style={{
                    filter: "drop-shadow(0 0 8px oklch(0.70 0.20 60 / 0.8))",
                  }}
                />
                <motion.text
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.3 + 0.4 }}
                  textAnchor="middle"
                  y={1}
                  x={0}
                  style={{
                    fontSize: "8px",
                    fill: "oklch(0.12 0.01 240)",
                    fontWeight: "bold",
                    pointerEvents: "none",
                  }}
                >
                  {index}
                </motion.text>
              </g>
            )}

            {isEnd && (
              // Destination marker - Star/Target style
              <g>
                <motion.circle
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: (route.length - 1) * 0.3 + 0.2, type: "spring", stiffness: 200 }}
                  r={8}
                  fill="oklch(0.65 0.18 140)"
                  stroke="oklch(0.12 0.01 240)"
                  strokeWidth={2}
                  style={{
                    filter: "drop-shadow(0 0 10px oklch(0.65 0.18 140 / 0.9))",
                  }}
                />
                <motion.circle
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: (route.length - 1) * 0.3 + 0.3, type: "spring", stiffness: 200 }}
                  r={4}
                  fill="oklch(0.12 0.01 240)"
                />
              </g>
            )}
          </Marker>
        )
      })}
    </>
  )
}
