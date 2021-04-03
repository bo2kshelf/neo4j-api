FROM node:14.16.0@sha256:f6b9ff4caca9d4f0a331a882e560df242eb332b7bbbed2f426784de208fcd7bd AS build

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
COPY tsconfig.json tsconfig.build.json ./
COPY .yarn ./.yarn
COPY src ./src

RUN yarn install --immutable --immutable-cache
RUN yarn build

FROM node:14.16.0-slim@sha256:7ff9cf5e411481ee734479637265f063c5f356f496d0f9c47112312cb7b46d42

ENV PORT 4000

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
COPY --from=build /app/dist ./dist

RUN yarn install --immutable --immutable-cache

EXPOSE $PORT

CMD ["node", "dist/main.js"]
