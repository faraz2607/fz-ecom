# Fz-Ecom

A mobile-friendly product discovery storefront with a password-protected product catalog dashboard.

## Getting started

1. Copy `.env.example` to `.env.local` and set `ADMIN_PASSWORD`, a unique, long `SESSION_SECRET`, your MongoDB `MONGODB_URI`, and your `MEESHO_SHOP_URL`.
2. Install dependencies with `npm install`.
3. Start the app with `npm run dev` and open `http://localhost:3000`.
4. Open `/admin` to manage products. Starter products are demo catalog content.

## Checks

- `npm run lint`
- `npm run typecheck`
- `npm run format:check`
- `npm run build`

Run `npm run format` to format the project and sort Tailwind utility classes.

## Rebranding

Update `config/brand.ts` to change the brand name, storefront copy, theme colors, icon monogram, and generated browser/home-screen icons. The app uses self-hosted Inter Variable for UI text and DM Serif Display for editorial headings.

## Deployment

Products are stored in the `products` collection in MongoDB (`FzEcomDev` by default). The shop home shows ten temporary fabric cards only while the collection has no records; they are never inserted into MongoDB or shown in the admin catalog. Product cards use their own Meesho URL when present and otherwise link to `MEESHO_SHOP_URL`. Public product images must be accessible over HTTPS; for Google Drive, share the file for public viewing.
