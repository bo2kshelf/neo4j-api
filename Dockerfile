FROM node:14.17.1@sha256:d8f90b676efb1260957a4170a9a0843fc003b673ae164f22df07eaee9bbc6223 AS build

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
RUN yarn install --immutable --immutable-cache && yarn cache clean

COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN yarn build

FROM node:14.17.1-slim@sha256:41bbb713cb3ac5f7d531ccdc156d2611f019b50b9c478d6475c79ced618640f0

ENV PORT 4000

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
RUN yarn install --immutable --immutable-cache && yarn cache clean

COPY --from=build /app/dist ./dist

EXPOSE $PORT

CMD ["node", "dist/main.js"]
