# Campusly Backend

## Setup
1. `npm install`
2. Copy `.env.example` to `.env` and fill in the values
3. `npm run dev`
4. Open http://localhost:5000/api/health - you should see `"success": true`

## Folder structure
```
src/
  server.js        starts the server + connects DB
  app.js           express app, middleware, routes
  config/          db connection
  models/          mongoose schemas
  controllers/     the logic for each API
  routes/          URL -> controller mapping
  middleware/      auth, role check, error handler
  utils/           small helpers
  scripts/         one-off scripts (seed TPO)
```
