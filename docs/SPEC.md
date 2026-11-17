# Application Specification

## Application Overview

Fz-Ecom is a mobile-friendly product discovery storefront. Visitors browse curated offers and continue to the seller's Meesho listing. An administrator manages product details through a password-protected dashboard.

## Technology Stack

Next.js 16 App Router, React Server Components, TypeScript strict mode, Tailwind CSS 4 with PostCSS, Prettier with Tailwind class sorting, Inter Variable, DM Serif Display, MongoDB, and ESLint.

## Architecture

`app/` owns routes, generated site icons, and API handlers; `features/` contains storefront, admin, and product logic; `components/` is for shared presentation; `config/brand.ts` owns editable brand copy, icon identity, and theme basics; `lib/` contains server utilities. Product records are stored in MongoDB. The MongoDB client is cached across requests in development to avoid opening redundant connections.

## Design Guidelines

Use Inter for interface text and DM Serif Display for selected editorial accents. Keep the forest, paper, and citron palette, clear product imagery and prices, responsive layouts, visible focus states, semantic accessible controls, and reduced-motion support. Prefer Tailwind utilities for component layout and styling.

## Global Requirements

Public visitors see active products only. Admins can sign in with a password, search/filter/page the catalog, and create, edit, activate, or delete products. Product purchase links leave this application for Meesho.

## Technical Constraints

Set `ADMIN_PASSWORD`, a high-entropy `SESSION_SECRET`, `MONGODB_URI`, and `MEESHO_SHOP_URL` in the deployment environment. `MONGODB_DB` is optional and defaults to `FzEcomDev`. When MongoDB has no product records, ten temporary fabric cards appear on the public storefront; they are not stored or shown in the admin catalog. Product cards fall back to `MEESHO_SHOP_URL` when the record has no Meesho URL.
