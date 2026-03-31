# Project Blueprint: FarmCMD

> **Version**: 1.4.1 | **Last Updated**: March 31, 2026
> **Stack**: Next.js 14.2.5 · React 18 · TypeScript 5.5 · Tailwind CSS 3.4 · Open-Meteo API · RainViewer API
> **Deployment**: Vercel (ISR, `revalidate = 900`)

---

## 1. Architecture Overview

FarmCMD is a server-rendered farm weather dashboard designed for mobile-first viewing. It provides grain prices, real-time weather, spray decisions, and 10 modular farmer feature cards — all fetched in parallel on the server and rendered as static HTML with periodic ISR regeneration.

### Core Principles

- **Server Components Only** — No `'use client'` except for `error.tsx` and `UpdateButton`. All data fetching happens server-side in `page.tsx` via `Promise.all`.
- **Parallel Data Fetching** — Every card's data is fetched concurrently in a single `Promise.all` call inside `Home()`. No sequential waterfalls.
- **Isolated Features** — Each of the 10 farmer features is self-contained: one `lib/<feature>.ts` file, one `components/<Feature>Card.tsx` file, and comment-wrapped blocks in `page.tsx` for easy removal.
- **Zero Client API Calls** — All data fetching uses server-side `fetch` with `AbortSignal.timeout(10000)`. No client-side API routes are called by the dashboard UI.

### Project Structure

```
farm-snapshot/
├── app/
│   ├── layout.tsx          # Root layout (max-w-md mobile shell, metadata, PWA manifest)
│   ├── page.tsx            # Main dashboard — async server component, all data fetching
│   ├── error.tsx           # Error boundary (client component with reset button)
│   ├── loading.tsx         # Skeleton loading states (grain, weather, spray, forecast, news)
│   ├── globals.css         # Tailwind directives + custom styles
│   └── api/
│       ├── weather/route.ts  # Legacy API route (not used by dashboard UI)
│       ├── spray/route.ts    # Legacy API route (not used by dashboard UI)
│       └── grain/route.ts    # Legacy API route (not used by dashboard UI)
├── components/
│   ├── GrainCard.tsx           # Core — Corn & soybean prices
│   ├── WeatherCard.tsx         # Core — Current conditions, wind, gust, rain
│   ├── SprayCard.tsx           # Core — GO/WAIT spray decision
│   ├── ForecastCard.tsx        # Core — 10-day forecast
│   ├── NewsCard.tsx            # Core — Farm news headlines
│   ├── UpdateButton.tsx        # Client component — manual refresh trigger
│   ├── SunriseSunsetCard.tsx   # Feature 1
│   ├── RadarCard.tsx           # Feature 2 — Dual-layer radar map
│   ├── SoilTempCard.tsx        # Feature 3
│   ├── DewPointCard.tsx        # Feature 4
│   ├── GrowingDegreeDaysCard.tsx # Feature 5
│   ├── FrostAlertCard.tsx      # Feature 6
│   ├── BarometerCard.tsx       # Feature 7
│   ├── SprayDayPlannerCard.tsx # Feature 8
│   ├── DryingCard.tsx          # Feature 9
│   └── RainTimelineCard.tsx    # Feature 10
├── lib/
│   ├── config.ts               # Central config — all env vars with validation
│   ├── types.ts                # Shared TypeScript interfaces
│   ├── validation.ts           # Runtime type guards (isValidNumber, isValidObject, parseNumeric)
│   ├── weather.ts              # Core — Open-Meteo current weather + daily forecast
│   ├── rainfall.ts             # Core — Rainfall API integration
│   ├── grain.ts                # Core — Grain price fetching
│   ├── news.ts                 # Core — Farm news scraping
│   ├── spray.ts                # Core — Spray decision logic
│   ├── sunrise-sunset.ts       # Feature 1 — HH:MM extraction (no Date parsing)
│   ├── radar.ts                # Feature 2 — RainViewer tiles + Mercator math + CartoDB base
│   ├── soil-temp.ts            # Feature 3 — 4-depth soil temperature
│   ├── dew-point.ts            # Feature 4 — Dew point + humidity + comfort advisory
│   ├── growing-degree-days.ts  # Feature 5 — GDD calculator (corn/soybean base temps)
│   ├── frost-alert.ts          # Feature 6 — 3-day freeze/frost scanner
│   ├── barometer.ts            # Feature 7 — Pressure trend (rising/falling/steady)
│   ├── spray-day-planner.ts    # Feature 8 — 7-day spray GO/WAIT forecast
│   ├── drying-conditions.ts    # Feature 9 — Hay baling / crop drying rating
│   └── rain-timeline.ts        # Feature 10 — 24hr hourly precip probability timeline
├── public/
│   ├── favicon.svg
│   ├── app-icon.png
│   ├── manifest.json
│   ├── sw.js
│   └── robots.txt
├── next.config.mjs             # Image domains for CartoCDN + RainViewer
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── vercel.json
├── BLUEPRINT.md
└── package.json
```

---

## 2. Feature Inventory

### Core Cards (always present)

| Card | Data Source | Key Data Points |
|------|------------|-----------------|
| **GrainCard** | Commodities API | Corn/soybean price, change %, SELL/HOLD recommendation |
| **WeatherCard** | Open-Meteo | Temp, feels-like, wind, gust, humidity, rain status, 1d/3d/7d rainfall |
| **SprayCard** | Derived from WeatherCard | GO/WAIT based on wind, gust, rain thresholds from config |
| **ForecastCard** | Open-Meteo 10-day | High/low temps, rain chance, precip mm, wind, WMO code per day |
| **NewsCard** | RSS/scrape | Top farm news headlines with links |

### Modular Farmer Features (removable)

Each feature is wrapped with `/* FEATURE: <Name> — delete this block to remove */` comments in `page.tsx`. To fully remove a feature, delete its import lines, fetch call in `Promise.all`, render block, plus its `lib/` and `components/` files.

| # | Card | Lib File | API | Description |
|---|------|----------|-----|-------------|
| 1 | **SunriseSunsetCard** | `sunrise-sunset.ts` | Open-Meteo | Sunrise/sunset times, total daylight minutes, formatted in 12h AM/PM |
| 2 | **RadarCard** | `radar.ts` | RainViewer + CartoDB | Dual-layer radar map (CartoDB Positron base + RainViewer precip overlay), compass rose, scale bar, legend, pulsing farm center marker, ~150mi radius |
| 3 | **SoilTempCard** | `soil-temp.ts` | Open-Meteo | 4 depth readings (surface, 6in, 18in, 54in), color-coded by planting readiness |
| 4 | **DewPointCard** | `dew-point.ts` | Open-Meteo | Dew point, relative humidity, temp, comfort advisory, spray/driveability notes |
| 5 | **GrowingDegreeDaysCard** | `growing-degree-days.ts` | Open-Meteo | Today's GDD, season cumulative (corn from Apr 1, soybeans from May 1), 7-day total, mini bar chart |
| 6 | **FrostAlertCard** | `frost-alert.ts` | Open-Meteo | 3-day freeze/frost scanner, color-coded alert level (freeze/frost/clear), per-day lows |
| 7 | **BarometerCard** | `barometer.ts` | Open-Meteo | Barometric pressure in inHg, trend arrow (rising/falling/steady), change rate, forecast text |
| 8 | **SprayDayPlannerCard** | `spray-day-planner.ts` | Open-Meteo | 7-day spray forecast rating each day GO/WAIT against config thresholds, per-day reasons |
| 9 | **DryingCard** | `drying-conditions.ts` | Open-Meteo | Combined temp + humidity + wind rating for hay baling/crop drying (Excellent/Good/Fair/Poor) |
| 10 | **RainTimelineCard** | `rain-timeline.ts` | Open-Meteo | 24hr color-coded bar chart of hourly precip probability, dry streak counter, total precip |

---

## 3. Configuration Management

All environment variables are centralized in `lib/config.ts` with validated parsing and bounds-checked fallbacks.

### Config Structure

```typescript
export const config = {
  weather: {
    lat: parseValidatedFloat(process.env.WEATHER_LAT, 38.4626783, -90, 90),
    lon: parseValidatedFloat(process.env.WEATHER_LON, -93.5373719, -180, 180),
    locationLabel: process.env.WEATHER_LOCATION_LABEL || "Windsor, MO",
    timezone: process.env.TIMEZONE || "America/Chicago",
  },
  spray: {
    maxWindMph: parseValidatedFloat(process.env.MAX_SPRAY_WIND_MPH, 10, 0, 100),
    maxGustMph: parseValidatedFloat(process.env.MAX_SPRAY_GUST_MPH, 15, 0, 200),
    rainThreshold: parseValidatedFloat(process.env.RAIN_THRESHOLD, 20, 0, 100),
    rainForecastHours: parseValidatedInt(process.env.RAIN_FORECAST_HOURS, 3, 1, 48),
  },
  grain: {
    priceDropThreshold: parseValidatedFloat(process.env.GRAIN_PRICE_DROP_THRESHOLD, -0.03, -10, 10),
    commoditiesApiKey: process.env.COMMODITIES_API_KEY || "",
  },
  rainfall: {
    apiUrl: process.env.RAINFALL_API_URL || "https://rain-api.vercel.app",
    fieldId: process.env.FIELD_ID || "",
  },
};
```

### Default Farm Location

- **Address**: 11713 NE Hwy OO, Windsor, MO 65360
- **Coordinates**: 38.4626783, -93.5373719
- **Timezone**: America/Chicago

### Validation Helpers

Two validation functions ensure env vars are safe:

- `parseValidatedFloat(value, fallback, min, max)` — Parses float, returns `fallback` if NaN or out of bounds
- `parseValidatedInt(value, fallback, min, max)` — Same for integers

Runtime data validation uses `lib/validation.ts`:

- `isValidNumber(value)` — Type guard: `typeof === "number" && !isNaN`
- `isValidObject(value)` — Type guard: `typeof === "object" && !== null && !Array.isArray`
- `parseNumeric(value)` — Safe number parser returning `number | null`

---

## 4. Data Fetching Patterns

### Parallel Server-Side Fetch

All data is fetched in a single `Promise.all` inside the `Home()` async server component:

```typescript
const [weather, grainData, forecast, newsData, sunriseSunsetData, radarData, 
       soilTempData, dewPointData, gddData, frostData, barometerData, 
       sprayPlannerData, dryingData, rainTimelineData] = await Promise.all([...]);
```

This ensures maximum parallelism — no request waits on another.

### Fetch Standard

Every `fetch` call in `lib/` MUST:

1. Use `AbortSignal.timeout(10000)` for a 10-second timeout
2. Include `User-Agent: Farm-Command/1.0` header
3. Return a fully typed object with `error?: string` for graceful degradation
4. Never throw — catch all errors and return an error-state object
5. Validate API responses with `isValidNumber()` / `isValidObject()` before use

### API Sources

| API | Purpose | Base URL |
|-----|---------|----------|
| **Open-Meteo** | Weather, forecast, soil temp, hourly, sunrise | `https://api.open-meteo.com/v1/forecast` |
| **RainViewer** | Radar precipitation tiles | `https://tilecache.rainviewer.com` |
| **CartoCDN** | Base map tiles (Positron) | `https://a.basemaps.cartocdn.com` |
| **Commodities API** | Grain prices | Configurable via env |
| **RSS/Scrape** | Farm news | Configurable |

### ISR Regeneration

```typescript
export const revalidate = 900; // 15 minutes
```

The entire page is server-rendered and cached for 15 minutes. Vercel handles background revalidation.

---

## 5. Technical Standards

### TypeScript

- All data interfaces defined in `lib/types.ts` for core types
- Feature-specific interfaces exported from their respective `lib/<feature>.ts` files
- No `any` types — use generics, `unknown`, or validated type guards
- Component props defined as inline interfaces at the top of each component file

### Unit Conversions

Standard helpers used across all lib files:

```typescript
function toF(celsius: number): number      // °C → °F
function toMph(kmh: number): number        // km/h → mph
function mmToIn(mm: number): number        // mm → inches (rounded to 2 decimal places)
```

### Timezone Handling

All time-aware features use `config.weather.timezone` (default `America/Chicago`). Timezone is passed to Open-Meteo API via `timezone=` query parameter so returned timestamps are already localized. For display:

- **Sunrise/Sunset**: Extract `HH:MM` directly from API response string — no `new Date()` parsing to avoid double timezone conversion
- **Hourly data**: API returns ISO strings in the configured timezone, parsed directly

### Error Handling Strategy

Every card component handles three states:

1. **Normal**: Data rendered with full UI
2. **Partial data**: Shows available data with `--` for missing values
3. **Error only**: Shows centered error message when data fetch failed completely

Error boundaries are handled at two levels:

- **App level**: `app/error.tsx` catches unhandled exceptions with reset button
- **Card level**: Each lib function returns `{ error?: string }` — components check for errors and render graceful fallbacks

### Security

- No API keys exposed to the client (all fetching is server-side)
- `robots.txt` disallows `/api/` paths from crawling
- All external URLs use HTTPS
- All fetches have 10-second timeouts to prevent hanging
- No user input is processed (read-only dashboard)

---

## 6. UI/UX Design System

### Layout

- **Mobile-first**: `max-w-md mx-auto px-2 py-2` — optimized for phone screens
- **Card stack**: `<main className="space-y-2">` — all cards in a vertical scroll
- **Consistent padding**: All cards use `p-3` with `rounded-lg shadow-sm border border-slate-200`

### Card Anatomy

Every card follows this structure:

```
┌─────────────────────────────┐
│ <h2> Title     [Badge]      │  ← White bg, semibold title, optional status badge
│                             │
│  Data content area          │  ← Varies per card (stats, bars, timeline, etc.)
│                             │
│  Reason / Advisory text     │  ← Italic, slate-500, centered
└─────────────────────────────┘
```

### Color System

| Purpose | Color | Usage |
|---------|-------|-------|
| Status: GO / Good / Excellent | Green (`bg-green-500`) | Spray, Drying ratings |
| Status: Warning / Fair | Amber (`bg-amber-400`) | Marginal conditions |
| Status: WAIT / Poor | Slate (`bg-slate-400`) | Bad conditions |
| Status: Danger / Frost | Red (`bg-red-500`) | Freeze warnings, high rain |
| Primary accent | Blue (`bg-blue-500`) | Buttons, links |
| Card background | White (`bg-white`) | All cards |
| Page background | Slate-50 (`bg-slate-50`) | Body |
| Text primary | Slate-900 | Headings |
| Text secondary | Slate-500/600 | Labels, advisory |
| Text muted | Slate-400 | Timestamps, secondary info |

### Badge System

Status badges use rounded pills:

```tsx
<span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-green-500">
  EXCELLENT
</span>
```

---

## 7. Implementation Workflow

When adding a new feature to the dashboard:

1. **Define types** — Create the data interface in the feature's `lib/<feature>.ts` file
2. **Implement service layer** — Write the fetch function in `lib/<feature>.ts` following the fetch standard (timeout, User-Agent, error handling, validation)
3. **Build component** — Create `components/<Feature>Card.tsx` with inline props interface, normal/partial/error states
4. **Wire into page.tsx** — Add three comment-wrapped blocks:
   - Import lines: `// FEATURE: <Name> — delete this import + render block to remove`
   - Fetch in Promise.all: `// FEATURE: <Name> — delete this fetch<Name> from Promise.all to remove`
   - Render block: `{/* FEATURE: <Name> — delete this block to remove */}` ... `{/* END FEATURE: <Name> */}`
5. **Verify build** — Run `npm run build` to check types and lint
6. **Commit and push**

---

## 8. Known Bugs & Fixes Applied

| Bug | Root Cause | Fix |
|-----|-----------|-----|
| ForecastCard showing mm with `"` symbol | Open-Meteo returns mm, not inches | Convert: `(val / 25.4).toFixed(2)"` |
| WeatherCard gust 0mph showing "--" | Truthiness check `data.gustMph ?` fails for `0` | Changed to `!== null` check |
| Spray config NaN on bad env vars | Raw `parseFloat()` with no validation | Added `parseValidatedFloat()` with bounds checking |
| Sunrise showing wrong timezone | `new Date()` on server parsed Chicago string as UTC | Extract `HH:MM` from API string directly |
| Radar "zoom level not supported" | Missing `/256` tile size in RainViewer URL | Added size segment between path and zoom |
| DewPoint prop mismatch | Cron agent used different prop names | Aligned prop names between lib and component |
| DryingConditions type error | Cron agent used `humidity.rating` instead of `humid.rating` | Fixed variable reference |

---

*Last updated: March 31, 2026*
