FROM node:14.16.1@sha256:8eb45f4677c813ad08cef8522254640aa6a1800e75a9c213a0a651f6f3564189 AS build

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
RUN yarn install --immutable --immutable-cache && yarn cache clean

COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN yarn build

FROM node:14.16.1-slim@sha256:58dbfbdf664f703072bd8263b787301614579c8e345029cdc3d9acf682e853a9

ENV PORT 4000

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
RUN yarn install --immutable --immutable-cache && yarn cache clean

COPY --from=build /app/dist ./dist

EXPOSE $PORT

CMD ["node", "dist/main.js"]
