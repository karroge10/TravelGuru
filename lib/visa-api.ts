// API client for visa requirements using Passport Visa API
const API_BASE_URL = "https://rough-sun-2523.fly.dev"

// API Response Types based on the OpenAPI schema
export interface VisaDestination {
  name: string
  code: string
  duration: number | null
}

export interface CountryVisaData {
  name: string
  code: string
  VR: VisaDestination[]  // Visa Required
  VOA: VisaDestination[] // Visa on Arrival
  VF: VisaDestination[]  // Visa Free
  EV: VisaDestination[]  // eVisa
  NA: VisaDestination[]  // No Admission
  last_updated: string
}

export interface VisaRequirement {
  id: string
  passport: {
    name: string
    code: string
  }
  destination: {
    name: string
    code: string
  }
  dur: number | null
  category: {
    name: string
    code: string
  }
  last_updated: string
}

// Processed visa requirement for UI
export interface ProcessedVisaRequirement {
  country: string
  countryCode: string
  requirement: "visa-free" | "visa-required" | "visa-on-arrival" | "e-visa" | "no-admission"
  duration?: number
  notes?: string
}

// Cache for API responses to avoid repeated calls
const cache = new Map<string, any>()

// Global variable to store the last updated date from API
let lastUpdatedDate: string | null = null

export async function getCountryVisaData(countryCode: string): Promise<CountryVisaData | null> {
  const cacheKey = `country-${countryCode}`
  const url = `${API_BASE_URL}/country/${countryCode}`
  

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)
  }

  try {
    const response = await fetch(url)

    if (!response.ok) {
      const errorText = await response.text()
      return null
    }

    const data = await response.json()
    
    // Store the last updated date globally
    if (data.last_updated) {
      lastUpdatedDate = data.last_updated
    }
    
    cache.set(cacheKey, data)
    return data
  } catch (error) {
    return null
  }
}

export async function getSpecificVisaRequirement(passportCode: string, destinationCode: string): Promise<VisaRequirement | null> {
  const cacheKey = `visa-${passportCode}-${destinationCode}`

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)
  }

  try {
    const response = await fetch(`${API_BASE_URL}/visa/${passportCode}/${destinationCode}`)

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    cache.set(cacheKey, data)
    return data
  } catch (error) {
    return null
  }
}

export async function getAllVisaRequirements(passportCode: string): Promise<Record<string, ProcessedVisaRequirement>> {
  const cacheKey = `all-${passportCode}`
  

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)
  }

  try {
    const countryData = await getCountryVisaData(passportCode)
    
    if (!countryData) {
      return {}
    }

    const requirements: Record<string, ProcessedVisaRequirement> = {}

    // Process Visa Free countries
    countryData.VF.forEach(dest => {
      requirements[dest.code] = {
        country: dest.name,
        countryCode: dest.code,
        requirement: "visa-free",
        duration: dest.duration,
        notes: dest.duration ? `Stay up to ${dest.duration} days` : undefined
      }
    })

    // Process Visa on Arrival countries
    countryData.VOA.forEach(dest => {
      requirements[dest.code] = {
        country: dest.name,
        countryCode: dest.code,
        requirement: "visa-on-arrival",
        duration: dest.duration,
        notes: dest.duration ? `Stay up to ${dest.duration} days` : undefined
      }
    })

    // Process eVisa countries
    countryData.EV.forEach(dest => {
      requirements[dest.code] = {
        country: dest.name,
        countryCode: dest.code,
        requirement: "e-visa",
        duration: dest.duration,
        notes: dest.duration ? `Stay up to ${dest.duration} days` : undefined
      }
    })

    // Process Visa Required countries
    countryData.VR.forEach(dest => {
      requirements[dest.code] = {
        country: dest.name,
        countryCode: dest.code,
        requirement: "visa-required",
        duration: dest.duration,
        notes: dest.duration ? `Stay up to ${dest.duration} days` : undefined
      }
    })

    // Process No Admission countries
    countryData.NA.forEach(dest => {
      requirements[dest.code] = {
        country: dest.name,
        countryCode: dest.code,
        requirement: "no-admission",
        duration: dest.duration,
        notes: "Entry not permitted"
      }
    })

    
    cache.set(cacheKey, requirements)
    return requirements
  } catch (error) {
    return {}
  }
}

// Get the last updated date from the API data
export function getLastUpdatedDate(): string | null {
  return lastUpdatedDate
}

// Clear cache (useful for testing or when data needs refresh)
export function clearCache() {
  cache.clear()
  lastUpdatedDate = null
}
