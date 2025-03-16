# Next.js

## Getting started

Run the development server (the server is accessible at [http://localhost:3000](http://localhost:3000)):
```bash
docker compose up --build
```

## Development

Run the dev container to work within the docker container environment:
```bash
docker compose build dev
docker compose run --service-ports --rm dev
npm run dev  # to run the app inside the container
```
