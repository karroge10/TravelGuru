# Visa Planner

Visa Planner is an interactive world map for planning multi-country trips and checking visa requirements by passport.

Pick your nationality, click countries on the map to build a route, and instantly see visa status for each stop.

## Why I built this

I wanted a faster way to answer a simple travel question:

"Can I actually enter these countries with my passport, and what does the full route look like?"

Most tools answer one destination at a time. This app focuses on route planning with visa visibility built in.

## Features

- Interactive world map with click-to-build routes
- Visa labels by destination (`Visa-Free`, `Visa on Arrival`, `eVisa`, `Visa Required`, `No Admission`)
- Support for dual passports and best-passport comparison
- Route statistics (distance and visa-friendly count)
- Reorderable itinerary with drag and drop
- Save and restore trips from local storage
- Export and share trip summaries
- Mobile-friendly layout

## Tech stack

- Next.js 15
- React 19 + TypeScript
- Tailwind CSS
- Framer Motion
- react-simple-maps
- dnd-kit

## Getting started

### 1) Install dependencies

```bash
npm install
```

### 2) Start the app

```bash
npm run dev
```

Open the local URL shown in your terminal.

## How visa data works

The app currently reads visa data from `passport-visa-api`:
https://github.com/nickypangers/passport-visa-api?tab=MIT-1-ov-file

Important: visa policies change often. Always verify with official government or embassy sources before traveling.

## Known limitations

- Visa data quality depends on the upstream provider
- Some destinations may have stale or incorrect classifications
- Rules can vary by travel purpose, transit, and length of stay
- The app does not replace official immigration guidance

## Roadmap

- Migrate to a higher-trust visa provider
- Show source attribution per visa decision
- Add rule details by travel purpose and stay duration
- Add test coverage for critical country pairs
- Add analytics for most checked routes

## Publishing note

If you plan to make this project public, keep the disclaimer above and avoid marketing this as legal advice.

## Scripts

- `npm run dev` starts development server
- `npm run build` builds production bundle
- `npm run start` runs production server
- `npm run lint` runs linter

## Basic test plan

- Run `npm run lint` and confirm no errors
- Run `npm run build` and confirm production build succeeds
- Run `npm run dev`, select passport(s), and confirm visa data loads
- Build a route with multiple countries, plan it, then verify trip details and export
- Verify disclaimer/source attribution is visible before publishing

## License

This project is licensed under the MIT License. See `LICENSE` for details.
