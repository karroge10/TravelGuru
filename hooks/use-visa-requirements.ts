import { useState, useEffect, useReducer } from "react"
import { toast } from "sonner"
import { 
  getVisaRequirementsForNationality, 
  combineVisaRequirements,
  type CombinedVisaRequirement 
} from "@/lib/visa-service"
import { type ProcessedVisaRequirement } from "@/lib/visa-api"

interface VisaState {
  requirements: Record<string, ProcessedVisaRequirement | CombinedVisaRequirement>
  isLoading: boolean
  error: string | null
}

type VisaAction =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: Record<string, ProcessedVisaRequirement | CombinedVisaRequirement> }
  | { type: "FETCH_ERROR"; payload: string }

function visaReducer(state: VisaState, action: VisaAction): VisaState {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, isLoading: true, error: null }
    case "FETCH_SUCCESS":
      return { ...state, isLoading: false, requirements: action.payload, error: null }
    case "FETCH_ERROR":
      return { ...state, isLoading: false, error: action.payload }
    default:
      return state
  }
}

export function useVisaRequirements(nationality: string | null, secondaryNationality: string | null) {
  const [state, dispatch] = useReducer(visaReducer, {
    requirements: {},
    isLoading: false,
    error: null
  })

  useEffect(() => {
    if (!nationality) return
    
    const fetchVisaData = async () => {
      dispatch({ type: "FETCH_START" })
      try {
        const primaryResult = await getVisaRequirementsForNationality(nationality)
        if (primaryResult.error) {
          toast.error("Failed to load visa requirements", {
            description: primaryResult.error.message,
          })
          dispatch({ type: "FETCH_ERROR", payload: primaryResult.error.message })
          return
        }

        const primaryRequirements = primaryResult.data ?? {}

        if (secondaryNationality) {
          const secondaryResult = await getVisaRequirementsForNationality(secondaryNationality)
          if (secondaryResult.error) {
            toast.error("Failed to load secondary passport requirements", {
              description: secondaryResult.error.message,
            })
            dispatch({ type: "FETCH_ERROR", payload: secondaryResult.error.message })
            return
          }

          const secondaryRequirements = secondaryResult.data ?? {}
          const combined = combineVisaRequirements(
            primaryRequirements,
            secondaryRequirements,
            nationality,
            secondaryNationality
          )
          dispatch({ type: "FETCH_SUCCESS", payload: combined })
          return
        }

        const requirements = { ...primaryRequirements }
        if (!requirements[nationality]) {
          requirements[nationality] = {
            country: "Own Country",
            countryCode: nationality,
            requirement: "visa-free",
            notes: "No visa required for own country",
          } as ProcessedVisaRequirement
        }
        dispatch({ type: "FETCH_SUCCESS", payload: requirements })
      } catch (error) {
        const message = "Network error occurred. Please try again."
        toast.error("Failed to load visa requirements", {
          description: message,
        })
        dispatch({ type: "FETCH_ERROR", payload: message })
      }
    }

    fetchVisaData()
  }, [nationality, secondaryNationality])

  return state
}
