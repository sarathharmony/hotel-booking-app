# Hotel Booking (PaaS)

A managed hotel-booking app on ACE: browse rooms, check availability, and make
reservations. Built and extended via DevLay Master, published and sold as a PaaS.

Customers provision their own instance from the PaaS marketplace.

## Quick start

```bash
pnpm install
pnpm dev
```

- **API** — http://localhost:4100 (`GET /api/health`, rooms, availability, bookings)
- **Web** — http://localhost:5174 (browse rooms, pick dates, book)

Individual services:

```bash
pnpm dev:api   # Express API on port 4100
pnpm dev:web   # Vite React UI on port 5174 (proxies /api → API)
```

## Monorepo layout

| Package | Path | Description |
|---------|------|-------------|
| `@hotel-booking/api` | `services/api` | Node + Express + TypeScript REST API |
| `@hotel-booking/web` | `apps/web` | React + Vite booking UI |

## Services

Services live in `ace.json` under `services[]`. Editing `ace.json` in local mode
auto-reloads the stack via the ACE engine (rediscovers + restarts services).
