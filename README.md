# Visa Planner

Visa Planner is an open source interactive world map for planning multi-country trips and checking visa requirements by passport. Issues and pull requests are welcome.

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

- Next.js 16
- React 19 + TypeScript
- Tailwind CSS
- Framer Motion
- react-simple-maps
- dnd-kit

## Getting started

This repo uses [pnpm](https://pnpm.io/). Copy `.env.example` to `.env` and adjust values if needed (all variables are optional for local dev).

### 1) Install dependencies

```bash
pnpm install
```

### 2) Start the app

```bash
pnpm dev
```

Open the local URL shown in your terminal.

## How visa data works

The app fetches visa data from a Passport Visa API–compatible HTTP service. Override the base URL with `NEXT_PUBLIC_VISA_API_BASE_URL` if you self-host the API from [passport-visa-api](https://github.com/nickypangers/passport-visa-api?tab=MIT-1-ov-file).

DISCLAIMER: Visa policies change often. Always verify with official government or embassy sources before traveling.

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

## Scripts

- `pnpm dev` starts development server
- `pnpm build` builds production bundle
- `pnpm start` runs production server
- `pnpm lint` runs ESLint

## Contributing

This project is open source under the MIT License. If you want to improve the app, fix a bug, or extend visa handling, open an issue or submit a pull request. A quick `pnpm lint` and `pnpm build` on your branch before opening a PR is always appreciated.

## License

This project is licensed under the MIT License. See `LICENSE` for details.
