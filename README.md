# Ticket Sales System — Latidos de la Historia

- Backend: Java 21 + Spring Boot 3.5 + Spring Security (JWT) + Postgres + Flyway
- Frontend: Vite + React
- Zones and prices follow the venue plan (Lower Stalls $25k; Gold Boxes $25k; VIP / Upper $20k)
- Deployment: backend on Render (Docker), frontend on Netlify

## Local development

1) Database: spin up a local Postgres instance (for example `docker run --name entradas-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=entradas -p 5432:5432 -d postgres:16-alpine`), or point `SPRING_DATASOURCE_URL` at a remote one.

2) Backend
```bash
cd backend
cp .env.example .env   # fill in DATABASE_URL / other variables if needed
./mvnw spring-boot:run
```
The tables and the current event's data (9 zones, ~500 seats) are created automatically by Flyway
on startup. To get an admin account, set `ADMIN_DEFAULT_EMAIL` / `ADMIN_DEFAULT_PASSWORD` as
environment variables before the first run (they are only used if no admin exists yet).

3) Frontend
```bash
cd ../frontend
cp .env.example .env
npm install
npm run dev
```
Open `http://localhost:5173`. The seating map is rendered with blocks, colours and angles.

## Deployment

See `render.yaml` (backend) and `netlify.toml` (frontend). Creating the services and loading the
secrets into the Render/Netlify dashboards is done manually — see the runbook in
`SECURITY_ROTATION.md` for the specific case of rotating the database password.
