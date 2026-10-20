# Sunami — Backend API

REST API for the Sunami music app, built with Node.js, Express and MongoDB (Mongoose). See the [root README](../README.md) for the full project overview, architecture and API summary.

## Quick start

```bash
npm install
cp .env.example .env     # fill in MONGODB_URI and the JWT secrets
npm run generate:secrets # generates JWT secrets
npm run seed:admin       # creates an admin user
npm run seed             # seeds music data from data/musicData.json
npm run dev              # http://localhost:3000
```

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start with nodemon |
| `npm start` | Start with node |
| `npm test` | Run all tests (Vitest + in-memory MongoDB) |
| `npm run test:coverage` | Tests with coverage report |
| `npm run seed` | Seed artists, albums and songs from the JSON export |
| `npm run seed:admin` | Create or promote the admin user |
| `npm run seed:playlists` | Create curated "Sunami" playlists |
| `npm run generate:secrets` | Generate JWT secrets |

## Environment variables

| Variable | Required | Notes |
|---|---|---|
| `MONGODB_URI` | yes | MongoDB connection string |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | yes | Must be different |
| `FRONTEND_URL` | yes in production | Allowed CORS origin (default `http://localhost:5173`) |
| `PORT` | no | Default `3000` |
| `NODE_ENV` | no | `production` enables secure cross-site cookies |
| `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` | only for `exportSpotifyData` | Not needed to run the API |

## Endpoints (all under `/api`)

- **Auth:** `POST /auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `PUT /auth/password`
- **Users:** `GET /users/profile`, `GET /users/me/library`, `POST|DELETE /users/me/{songs|albums|artists}/:id`, `GET /users/search`
- **Songs / Albums / Artists:** `GET` list and detail (public); `POST|PUT|DELETE` admin only
- **Playlists:** CRUD, `POST|DELETE /playlists/:id/songs`, `/follow`, `/collaborators`; `GET /playlists/public`, `/playlists/my`

## Deploying

See [VERCEL_BACKEND_DEPLOY.md](../VERCEL_BACKEND_DEPLOY.md).
