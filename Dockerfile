FROM node:15.14.0@sha256:608bba799613b1ebf754034ae008849ba51e88b23271412427b76d60ae0d0627 AS build

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
RUN yarn install --immutable --immutable-cache && yarn cache clean

COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN yarn build

FROM node:15.14.0-slim@sha256:ecfa754d007a069a2ffc293115927f86416beea07b779c48c0597e26d2321bbb

ENV PORT 4000

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
RUN yarn install --immutable --immutable-cache && yarn cache clean

COPY --from=build /app/dist ./dist

EXPOSE $PORT

CMD ["node", "dist/main.js"]
