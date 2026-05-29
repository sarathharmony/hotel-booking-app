# Hotel Booking (PaaS)

A managed hotel-booking app on ACE: browse rooms, check availability, and make
reservations. Built and extended via DevLay Master, published and sold as a PaaS.

Customers provision their own instance from the PaaS marketplace.

## Services

Services live in `ace.json` under `services[]`. Editing `ace.json` in local mode
auto-reloads the stack via the ACE engine (rediscovers + restarts services).

> This repo starts intentionally minimal — the app (API + web UI) is built by
> the DevLay agent.
