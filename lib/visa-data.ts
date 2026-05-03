export interface Country {
  name: string
  id: string
  coordinates: [number, number]
  dates?: { arrival: string; departure: string }
  notes?: string
  flag?: string
}

export function calculateDistance(coord1: [number, number], coord2: [number, number]): number {
  const R = 6371 // Earth's radius in km
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

export function calculateTotalDistance(route: Country[]): number {
  let total = 0
  for (let i = 0; i < route.length - 1; i++) {
    total += calculateDistance(route[i].coordinates, route[i + 1].coordinates)
  }
  return Math.round(total)
}
