ARG NODE_VERSION=24
ARG PORT=3000

FROM node:${NODE_VERSION} AS base
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts

FROM base AS development
ARG PORT
COPY package.json pnpm-lock.yaml ./
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE ${PORT}
CMD ["pnpm", "run", "start:dev"]

FROM deps AS build
COPY . .
RUN pnpm run build

FROM base AS production
ARG PORT
ENV NODE_ENV=production
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod --ignore-scripts
COPY --from=build /app/dist ./dist
USER node
EXPOSE ${PORT}
CMD ["node", "dist/main"]
