FROM node:16.3.0@sha256:ca6daf1543242acb0ca59ff425509eab7defb9452f6ae07c156893db06c7a9a4 AS build

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
RUN yarn install --immutable --immutable-cache && yarn cache clean

COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN yarn build

FROM node:16.3.0-slim@sha256:5cf3448bd86f70498653613372b862564b3b8415e11a86c6ea229939bb3dba4a

ENV PORT 4000

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
RUN yarn install --immutable --immutable-cache && yarn cache clean

COPY --from=build /app/dist ./dist

EXPOSE $PORT

CMD ["node", "dist/main.js"]
