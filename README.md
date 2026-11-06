# howard-lite

A minimal stand-in for howard's container setup:

- **backend**: Koa API at the repo root (`Dockerfile`, port 4000, routes under `/v1`)
- **frontend**: Vue + Vite in `client/`, built into an nginx image (`client/Dockerfile`, built from the repo root).
  nginx serves the SPA and proxies `/v1/*` to `BACKEND_URL`.

## Run locally

With Docker:

```bash
docker compose up --build
# app:  http://localhost:8080
# api:  http://localhost:4000/v1/health
```

Without Docker (Node 24):

```bash
npm install && npm run dev                 # terminal 1: API on :4000
cd client && npm install && npm run dev    # terminal 2: Vite on :5173, proxies /v1
```

## Deploy on Railway (two services, one repo)

1. Push this repo to GitHub.
2. In Railway: **New Project → Deploy from GitHub repo →** pick the repo.
   Rename that service to **`backend`**.
   - Variables: `PORT=4000`
   - Don't generate a public domain. It's only reachable over the private network.
   - The root `Dockerfile` is picked up automatically.
3. In the same project: **+ Create → GitHub Repo →** the same repo. Rename it to **`frontend`**.
   - Variables:
     - `RAILWAY_DOCKERFILE_PATH=client/Dockerfile`
     - `BACKEND_URL=http://${{backend.RAILWAY_PRIVATE_DOMAIN}}:${{backend.PORT}}`
   - Settings → Networking → **Generate Domain**.
4. Open the frontend's domain. A green "API ok · backend (production)" line means
   the browser → nginx → private network → Koa path works.

Optional: set **Watch Paths** so a change only redeploys what it touches:
`client/**` for frontend, and `src/**`, `package*.json`, `Dockerfile` for backend.

## Notes

- The backend listens on `::` because Railway's private network may be IPv6-only.
- nginx resolves `BACKEND_URL` per request (the `resolver` directive), so it starts even if
  the backend isn't up yet.
- Data is in memory and resets on every deploy, the same way howard's sessions do.
