# Campusly

Campus placement management system (MERN).

```
backend/    Node.js + Express + MongoDB API (port 5000)
frontend/   React + Vite + Tailwind (port 5173 in dev)
deploy/     Nginx site config + deployment guide
docker-compose.yml
```

## Run locally (development)
1. Backend: `cd backend`, `npm install`, fill in `.env`, `npm run seed:tpo` (once), `npm run dev`
2. Frontend: `cd frontend`, `npm install`, `npm run dev`
3. Open http://localhost:5173

## Run with Docker
```bash
cp .env.example .env   # fill it in
docker compose up -d --build
```
App runs on http://127.0.0.1:8085, with MongoDB in a private container. Full guide: `deploy/DEPLOY.md`.
