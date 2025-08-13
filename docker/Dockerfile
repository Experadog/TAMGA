# Build image
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies
COPY package*.json *config.* ./
RUN npm install --registry=https://registry.npmjs.org/ --ignore-scripts

# Add commands
COPY docker/commands $ROOT/commands
RUN chmod +x $ROOT/commands/*
ENV PATH="$ROOT/commands:$PATH"


# Dev image
FROM base AS dev

ENTRYPOINT [ "entrypoint.sh" ]


# Build image
FROM base AS build

# Build
ARG APP_ENV_FILE .env

COPY $APP_ENV_FILE .env
COPY public public
COPY src src

RUN npm run build
RUN rm -rf src

# App image
FROM node:20-alpine AS app

WORKDIR /app

COPY --from=build /app .

# Add commands
COPY docker/commands $ROOT/commands
RUN chmod +x $ROOT/commands/*
ENV PATH="$ROOT/commands:$PATH"

ENTRYPOINT [ "entrypoint.sh" ]
CMD [ "start.sh" ]
