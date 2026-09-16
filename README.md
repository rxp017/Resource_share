# HITAM Resource Share

Campus resource sharing and marketplace for verified HITAM students: buy, sell,
lend, borrow and rent physical items with clear exchange records and private
payment proof. One campus, exact @hitam.org identities, direct buyer-to-owner
payment (no gateway, no escrow, no bank-verification claim).

Stack: React + Vite + TypeScript (Cloudflare Pages Free), Supabase Free
(PostgreSQL, auth, private storage, narrow server commands). Source of truth:
the `planning/` pack; execution evidence: `docs/execution/`.

## Develop

    npm install
    npm run dev

Copy `.env.example` to `.env` and fill in your project's public anon key.
Never place the service_role key or any secret in this repository.

## Checks

    npm run typecheck
    npm run build