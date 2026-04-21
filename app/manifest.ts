import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Visa Planner",
    short_name: "Visa Planner",
    description: "Plan multi-country trips and check visa requirements by passport.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#0f172a",
    icons: [
      {
        src: "/placeholder-logo.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  }
}
