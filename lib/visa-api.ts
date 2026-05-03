// API client for visa requirements using Passport Visa API
const API_BASE_URL =
  process.env.NEXT_PUBLIC_VISA_API_BASE_URL?.replace(/\/$/, "") ??
  "https://rough-sun-2523.fly.dev"

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

// Processed visa requirement for UI
export interface ProcessedVisaRequirement {
  country: string
  countryCode: string
  requirement: "visa-free" | "visa-required" | "visa-on-arrival" | "e-visa" | "no-admission"
  duration?: number
  notes?: string
  dataSource?: "api"
  lastUpdated?: string
  sourceUrl?: string
}

const countryDataCache = new Map<string, CountryVisaData>()
const allRequirementsCache = new Map<string, Record<string, ProcessedVisaRequirement>>()

export async function getCountryVisaData(countryCode: string): Promise<CountryVisaData | null> {
  const cacheKey = `country-${countryCode}`
  const url = `${API_BASE_URL}/country/${countryCode}`

  const cached = countryDataCache.get(cacheKey)
  if (cached) return cached

  try {
    const response = await fetch(url)

    if (!response.ok) {
      await response.text()
      return null
    }

    const data = (await response.json()) as CountryVisaData

    countryDataCache.set(cacheKey, data)
    return data
  } catch {
    return null
  }
}

export async function getAllVisaRequirements(passportCode: string): Promise<Record<string, ProcessedVisaRequirement>> {
  const cacheKey = `all-${passportCode}`

  const cached = allRequirementsCache.get(cacheKey)
  if (cached) return cached

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
        duration: dest.duration ?? undefined,
        notes: dest.duration ? `Stay up to ${dest.duration} days` : undefined,
        dataSource: "api",
        lastUpdated: countryData.last_updated,
      }
    })

    // Process Visa on Arrival countries
    countryData.VOA.forEach(dest => {
      requirements[dest.code] = {
        country: dest.name,
        countryCode: dest.code,
        requirement: "visa-on-arrival",
        duration: dest.duration ?? undefined,
        notes: dest.duration ? `Stay up to ${dest.duration} days` : undefined,
        dataSource: "api",
        lastUpdated: countryData.last_updated,
      }
    })

    // Process eVisa countries
    countryData.EV.forEach(dest => {
      requirements[dest.code] = {
        country: dest.name,
        countryCode: dest.code,
        requirement: "e-visa",
        duration: dest.duration ?? undefined,
        notes: dest.duration ? `Stay up to ${dest.duration} days` : undefined,
        dataSource: "api",
        lastUpdated: countryData.last_updated,
      }
    })

    // Process Visa Required countries
    countryData.VR.forEach(dest => {
      requirements[dest.code] = {
        country: dest.name,
        countryCode: dest.code,
        requirement: "visa-required",
        duration: dest.duration ?? undefined,
        notes: dest.duration ? `Stay up to ${dest.duration} days` : undefined,
        dataSource: "api",
        lastUpdated: countryData.last_updated,
      }
    })

    // Process No Admission countries
    countryData.NA.forEach(dest => {
      requirements[dest.code] = {
        country: dest.name,
        countryCode: dest.code,
        requirement: "no-admission",
        duration: dest.duration ?? undefined,
        notes: "Entry not permitted",
        dataSource: "api",
        lastUpdated: countryData.last_updated,
      }
    })

    allRequirementsCache.set(cacheKey, requirements)
    return requirements
  } catch {
    return {}
  }
}
