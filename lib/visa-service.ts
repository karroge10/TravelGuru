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

// Visa requirement ranking (lower number = better access)
const VISA_RANK: Record<string, number> = {
  'visa-free': 1,
  'visa-on-arrival': 2,
  'e-visa': 3,
  'visa-required': 4,
  'no-admission': 5,
}

// Extended visa requirement with passport information
export interface CombinedVisaRequirement extends ProcessedVisaRequirement {
  bestPassport: 'primary' | 'secondary' | 'both'
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

/**
 * Combines visa requirements from two passports, selecting the better option for each country
 * @param primary Primary passport visa requirements
 * @param secondary Secondary passport visa requirements
 * @param primaryCode Primary passport ISO code
 * @param secondaryCode Secondary passport ISO code
 * @returns Combined visa requirements with best passport indicator
 */
export function combineVisaRequirements(
  primary: Record<string, ProcessedVisaRequirement>,
  secondary: Record<string, ProcessedVisaRequirement>,
  primaryCode: string,
  secondaryCode: string
): Record<string, CombinedVisaRequirement> {
  const combined: Record<string, CombinedVisaRequirement> = {}
  
  // Get all unique country codes from both passports
  const allCountries = new Set([
    ...Object.keys(primary),
    ...Object.keys(secondary)
  ])
  
  // Always include home countries (they're visa-free)
  if (primaryCode) {
    allCountries.add(primaryCode)
  }
  if (secondaryCode) {
    allCountries.add(secondaryCode)
  }
  
  for (const countryCode of allCountries) {
    const primaryReq = primary[countryCode]
    const secondaryReq = secondary[countryCode]
    
    // Check if this is a home country for either passport
    const isPrimaryHome = countryCode === primaryCode
    const isSecondaryHome = countryCode === secondaryCode
    
    // If it's a home country for either passport, it's always visa-free
    if (isPrimaryHome || isSecondaryHome) {
      let bestPassport: 'primary' | 'secondary' | 'both'
      if (isPrimaryHome && isSecondaryHome) {
        bestPassport = 'both'
      } else if (isPrimaryHome) {
        bestPassport = 'primary'
      } else {
        bestPassport = 'secondary'
      }
      
      combined[countryCode] = {
        country: primaryReq?.country || secondaryReq?.country || 'Own Country',
        countryCode,
        requirement: 'visa-free',
        bestPassport,
        notes: 'No visa required for own country'
      }
      continue
    }
    
    // If only one passport has data, use that
    if (!primaryReq && secondaryReq) {
      combined[countryCode] = {
        ...secondaryReq,
        bestPassport: 'secondary'
      }
      continue
    }
    
    if (primaryReq && !secondaryReq) {
      combined[countryCode] = {
        ...primaryReq,
        bestPassport: 'primary'
      }
      continue
    }
    
    // If neither has data, skip
    if (!primaryReq && !secondaryReq) {
      continue
    }
    
    // Both have data - compare and pick the better one
    const primaryRank = VISA_RANK[primaryReq!.requirement] || 999
    const secondaryRank = VISA_RANK[secondaryReq!.requirement] || 999
    
    if (primaryRank < secondaryRank) {
      // Primary is better
      combined[countryCode] = {
        ...primaryReq!,
        bestPassport: 'primary'
      }
    } else if (secondaryRank < primaryRank) {
      // Secondary is better
      combined[countryCode] = {
        ...secondaryReq!,
        bestPassport: 'secondary'
      }
    } else {
      // Equal rank - either passport works
      combined[countryCode] = {
        ...primaryReq!,
        bestPassport: 'both'
      }
    }
  }
  
  return combined
}
