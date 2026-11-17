<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Fz-Ecom contributor instructions

## Project overview

Fz-Ecom is a product discovery storefront with an admin catalog. Visitors browse offers and continue to Meesho to purchase. Brand copy lives in `config/brand.ts` so the storefront can be rebranded centrally.

## Technology and architecture

- Next.js 16 App Router, React 19, strict TypeScript, Tailwind CSS 4, ESLint.
- `app/` owns routing, layouts, metadata, and API handlers.
- `features/` owns feature components, types, hooks, and services.
- `components/common/` is for genuinely shared UI; `components/layout/` is for shared site chrome.
- `config/` contains app configuration and brand copy; `lib/` contains shared server helpers; `docs/` records app requirements.
- Product storage uses MongoDB; configure `MONGODB_URI` and optionally `MONGODB_DB` in the environment.

## Coding standards

- Inspect existing code and the installed Next.js docs before modifying Next APIs.
- Keep Server Components by default; mark client boundaries only for interactive UI.
- Keep strict typing, validate all untrusted API input, and avoid `any`.
- Use descriptive camelCase variables and PascalCase components/types. Use UPPER_SNAKE_CASE for constant values.
- Use semantic HTML, accessible labels, keyboard focus states, and responsive Tailwind/CSS styling.
- Use Tailwind utilities for component styling and run Prettier so class names remain sorted.
- Keep business logic in feature services, not route page components.
- Protect every admin write endpoint with server-side authorization; never expose secrets to client code.
- Do not add dependencies, duplicate shared logic, create empty folders/files, or add business requirements without need.
- Keep brand and organization-facing storefront copy in `config/brand.ts` where practical.

## API conventions

- Keep route handlers under `app/api/` and feature persistence/validation under `features/<feature>/services/`.
- Return typed JSON responses with consistent error messages and appropriate HTTP status codes.
- Keep MongoDB access in server-only feature services and read connection strings from environment variables, never in UI components.

## Adding a feature

1. Inspect the relevant routes, components, services, and docs.
2. Read the installed Next.js guide for APIs affected by the change.
3. Place feature code in its feature folder and keep `app/` focused on route composition.
4. Update `docs/SPEC.md` or `docs/FEATURES.md` when requirements or app-wide decisions change.
5. Run `npm run lint`, `npx tsc --noEmit`, and `npm run build` for implementation changes.
