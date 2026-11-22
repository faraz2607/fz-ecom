# Application Features

## Feature 1: Product storefront

### Objective

Help customers who arrive from a package QR code discover more curated products.

### Requirements

- Show active products with image, category, badge, sale price, and discount.
- Search products and filter by category.
- Link product actions to their Meesho listing.
- Show ten temporary fabric cards only while the catalog has no product records; keep the cards out of the admin data store.
- Fall back to the configured Meesho shop URL when a product has no listing URL.

### Expected Behavior

The home page loads the MongoDB catalog. It displays ten temporary shemagh, stole, gamcha, lungi, and lower examples only when the collection has no records. Shop actions open the product Meesho URL when set, and otherwise use `MEESHO_SHOP_URL`.

### UI/UX Requirements

Configurable brand messaging, mobile-friendly product cards, clear pricing, product-focused copy, trust messaging, and useful empty states.

### Additional Notes

Brand text is centralized in `config/brand.ts`.

## Brand identity and share previews

The root layout publishes Open Graph and large-image Twitter metadata from `config/brand.ts`. `app/opengraph-image.tsx` generates a share card using `BRAND.name`, `BRAND.tagline`, `BRAND.description`, `BRAND.shortName`, `BRAND.iconBackground`, `BRAND.foreground`, and `BRAND.iconAccent`; the short-name tile is the share-card logo. Update those values when rebranding so the storefront header, browser icons, and shared URL preview remain consistent. Set `NEXT_PUBLIC_SITE_URL` to the public storefront origin in production; `VERCEL_URL` is used as a fallback on Vercel.

## Feature 2: Admin catalog

### Objective

Let an administrator maintain products shown on the public storefront.

### Requirements

- Password-only sign in and sign out.
- Create, edit, activate/deactivate, and delete products.
- Search, category filter, and pagination.
- Validate product fields and protect write endpoints with a signed HTTP-only session.

### Expected Behavior

The admin route prompts for a password when signed out. Signed-in admins manage catalog data and product changes appear on the storefront.

### UI/UX Requirements

Responsive dashboard, focused product editor, clear confirmation before deletion, and visible loading/error/success states.

### Additional Notes

Set `ADMIN_PASSWORD`, `SESSION_SECRET`, `MONGODB_URI`, `MONGODB_DB`, and `MEESHO_SHOP_URL` in the local environment.
