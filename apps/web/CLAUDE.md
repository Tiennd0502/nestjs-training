# CLAUDE.md — web

Next.js 15 (App Router), React 19, Tailwind v4, shadcn/ui, Clerk; package `web`. Monorepo guidance is in the root `CLAUDE.md`.

## Commands (from here, or `pnpm web <script>` from the root)

```bash
pnpm dev          # http://localhost:3001
pnpm build        # also runs ESLint and the type check
pnpm lint         # eslint --fix
pnpm test         # Jest + React Testing Library
pnpm test src/sections/CategoryForm/CategoryForm.test.tsx   # one test file
pnpm test:cov
```

## Gotchas

- `src/middleware.ts` protects the routes in `src/app`. The role of every `src/` folder is in the Layers table of `.claude/rules/coding.md`.
- When upgrading `next`, bump `eslint-config-next` in `packages/eslint-config/package.json` to the same version.
- Copy `.env.example` to `.env`. `NEXT_PUBLIC_API_URL` points at the API (`pnpm dev:api` serves `http://localhost:3000`). `pnpm build` needs `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`; CI reads it from the GitHub Actions variable of the same name.
- When planning or reviewing, read `.claude/rules/coding.md` and `testing.md` even if no matching file is open. Run `apps/web:verify` before calling a web change done.
