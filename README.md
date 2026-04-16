# nodejs-training

## Overview (coffee-shop-web)

The web app lives in **`coffee-shop-web/`**: **Next.js 15** (App Router), **React 19**, **TypeScript**, **Tailwind CSS v4**, **shadcn/ui** (tokens in `coffee-shop-web/src/app/globals.css`, components in `coffee-shop-web/src/components/ui/`). Tooling: ESLint, Prettier, Jest + React Testing Library, Husky (`coffee-shop-web/.husky/`).

---

## Directory layout (`coffee-shop-web/`)

```text
coffee-shop-web/
├── src/
│   ├── app/                    # App Router
│   │   ├── layout.tsx
│   │   ├── globals.css         # Theme + Tailwind @theme
│   │   ├── (shop)/             # Shop, URL /
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   └── dashboard/          # URL /dashboard
│   │       ├── layout.tsx
│   │       └── page.tsx
│   ├── components/
│   │   ├── ui/                 # shadcn / primitives
│   │   ├── features/           # By domain
│   │   └── shared/             # Header, footer, … (when present)
│   ├── hooks/
│   ├── lib/
│   ├── services/               # Server Actions, API client
│   ├── store/
│   ├── types/
│   └── middleware.ts
├── public/
├── .husky/
├── components.json
├── eslint.config.mjs
├── jest.config.ts
├── next.config.ts
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

---

## GETTING STARTED

| Command | Description |
| ------- | ----------- |
| `pnpm dev` | Dev server (Turbopack) |
| `pnpm build` / `pnpm start` | Build & run production |
| `pnpm lint` / `pnpm lint:fix` | ESLint |
| `pnpm format` / `pnpm format:check` | Prettier |
| `pnpm test` / `pnpm test:watch` | Jest |
