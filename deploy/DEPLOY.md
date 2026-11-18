# Deploying Campusly

```
Internet ──HTTPS──> server Nginx ──> 127.0.0.1:8085 frontend container
                                         └─ /api → backend container (no public port)
                                                      └─ MongoDB container (internal network, password, no public port)
```

1. `cp .env.example .env`, then fill it in (use `openssl rand -hex 32` for secrets)
2. `docker compose up -d --build`
3. `docker compose ps` (all three should be running; backend and mongo "healthy")
4. Create the TPO once: `docker compose exec backend node src/scripts/seedTpo.js`
5. Server Nginx: point `campusly.maslecodes.fun` to `http://127.0.0.1:8085`

## Backup the database
```bash
docker compose exec -T mongo sh -c 'mongodump --archive --gzip -u "$MONGO_INITDB_ROOT_USERNAME" -p "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin --db campusly' > backup-$(date +%F).gz
```
Restore:
```bash
docker compose exec -T mongo sh -c 'mongorestore --archive --gzip --drop -u "$MONGO_INITDB_ROOT_USERNAME" -p "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin' < backup-YYYY-MM-DD.gz
```

## Useful commands
| Task | Command |
|---|---|
| Logs | `docker compose logs -f backend` |
| Update after git pull | `docker compose up -d --build` |
| Stop | `docker compose down` (data is kept in the mongo-data volume) |
