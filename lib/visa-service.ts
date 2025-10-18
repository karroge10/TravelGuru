// Enhanced visa service with proper error handling and no hardcoded fallbacks
import { getAllVisaRequirements, type ProcessedVisaRequirement } from "./visa-api"

export interface VisaServiceError {
  type: 'NETWORK_ERROR' | 'API_ERROR' | 'NO_DATA' | 'INVALID_NATIONALITY'
  message: string
  details?: string
}

export interface VisaServiceResult {
  data: Record<string, ProcessedVisaRequirement> | null
  error: VisaServiceError | null
  isLoading: boolean
}

// Cache for API responses
const cache = new Map<string, { data: Record<string, ProcessedVisaRequirement>, timestamp: number }>()
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

export async function getVisaRequirementsForNationality(
  nationality: string
): Promise<VisaServiceResult> {
  // Validate nationality
  if (!nationality || nationality.length !== 2) {
    return {
      data: null,
      error: {
        type: 'INVALID_NATIONALITY',
        message: 'Invalid nationality code provided',
        details: 'Nationality must be a valid 2-letter ISO country code'
      },
      isLoading: false
    }
  }

  // Check cache first
  const cacheKey = `visa-${nationality}`
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return {
      data: cached.data,
      error: null,
      isLoading: false
    }
  }

  try {
    const data = await getAllVisaRequirements(nationality)
    
    if (!data || Object.keys(data).length === 0) {
      return {
        data: null,
        error: {
          type: 'NO_DATA',
          message: 'No visa data available',
          details: `No visa requirements found for ${nationality} passport holders`
        },
        isLoading: false
      }
    }

    // Cache the successful result
    cache.set(cacheKey, { data, timestamp: Date.now() })

    return {
      data,
      error: null,
      isLoading: false
    }
  } catch (error) {
    console.error('Visa API Error:', error)
    
    return {
      data: null,
      error: {
        type: 'API_ERROR',
        message: 'Failed to fetch visa requirements',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      isLoading: false
    }
  }
}

export function getVisaRequirementForCountry(
  countryCode: string,
  nationality: string,
  visaRequirements: Record<string, ProcessedVisaRequirement>
): ProcessedVisaRequirement | null {
  // Special case: own country is always visa-free
  if (countryCode === nationality) {
    return {
      country: 'Own Country',
      countryCode,
      requirement: 'visa-free',
      notes: 'No visa required for own country'
    }
  }

  return visaRequirements[countryCode] || null
}

export function clearVisaCache() {
  cache.clear()
}

export function getCacheStats() {
  return {
    size: cache.size,
    keys: Array.from(cache.keys())
  }
}
