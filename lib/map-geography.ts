/** Linear ring: sequence of [lng, lat] positions (GeoJSON). */
export type LinearRing = [number, number][]

export type PolygonGeometry = {
  type: "Polygon"
  coordinates: LinearRing[]
}

export type MultiPolygonGeometry = {
  type: "MultiPolygon"
  coordinates: LinearRing[][]
}

/** Feature shape produced by react-simple-maps for world-atlas / topojson data. */
export interface MapGeography {
  rsmKey: string
  id: string
  properties: { name?: string }
  geometry: PolygonGeometry | MultiPolygonGeometry
}

export function getCentroidFromMapGeography(geo: MapGeography): [number, number] {
  const rings: LinearRing[] =
    geo.geometry.type === "MultiPolygon"
      ? geo.geometry.coordinates.reduce((largest, current) =>
          current[0].length > largest[0].length ? current : largest
        )
      : geo.geometry.coordinates

  const outerRing = rings[0]
  if (!outerRing?.length) return [0, 0]

  let sumLon = 0
  let sumLat = 0
  let count = 0
  for (const coord of outerRing) {
    if (Array.isArray(coord) && coord.length >= 2) {
      sumLon += coord[0]
      sumLat += coord[1]
      count++
    }
  }

  return count > 0 ? [sumLon / count, sumLat / count] : [0, 0]
}
