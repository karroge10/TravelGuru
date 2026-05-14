import type { Metadata } from "next"
import { HomePage } from "@/app/home-page"

export const metadata: Metadata = {
  title: "Visa Planner",
  description: "Plan visa-friendly multi-country routes and compare passport access.",
}

export default function Page() {
  return <HomePage />
}
