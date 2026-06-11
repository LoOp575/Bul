# Nusatani - PRD

## Product Overview
**Nusatani** is a B2B mobile app for Indonesian commodity sellers (jahe, lada, kunyit, kencur, lengkuas, kayu manis, cengkeh, pala, kapulaga, kemiri). It provides real-time commodity price tracking and a buyer finder to connect sellers with verified buyers.

## Key Features (MVP)
- **Beranda (Dashboard)**: Live price index, top gainers/losers, top commodities horizontal scroll, full trend table.
- **Harga & Grafik**: Filterable commodity chip row, 7-day price line chart (SVG), high/avg/low stats, full price table, CTA to buyer search.
- **Cari Pembeli (Buyer Finder)**: Search by name/city/type, filter by commodity & location, verified-only toggle, buyer cards.
- **Detail Pembeli**: Full buyer profile, commodity needs, contact actions (phone, email, WhatsApp).
- **Commodity Detail**: Image cover, description, chart, 7-day stats, CTA to find buyers.

## Tech Stack
- **Frontend**: Expo Router (file-based, bottom tabs), React Native, expo-image, expo-linear-gradient, react-native-svg, Lora + Plus Jakarta Sans via CDN.
- **Backend**: FastAPI with `/api` prefix, in-memory mock seed data, pseudo-real-time pricing bucketed per-minute with deterministic random.

## API
- GET /api/commodities
- GET /api/commodities/{id} (with 7-day history)
- GET /api/market/overview
- GET /api/buyers?commodity=&location=&verified_only=&search=
- GET /api/buyers/{id}
- GET /api/locations

## UI Language
Bahasa Indonesia.

## Future Enhancements
- Real-time price WebSocket
- Authenticated seller accounts
- Direct chat / contract negotiation with buyers
- Push notifications for price alerts
