# Sistema de Venta de Entradas — Latidos de la Historia

- Backend: Java 21 + Spring Boot 3.5 + Spring Security (JWT) + Postgres + Flyway
- Frontend: Vite + React
- Zonas y precios según plano (Platea Baja $25k; Palcos Gold $25k; VIP/ Superiores $20k)
- Deploy: todo en Render (Postgres + backend Docker + frontend estático), vía `render.yaml`

## Desarrollo local

1) Base de datos: levantá un Postgres local (por ejemplo `docker run --name entradas-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=entradas -p 5432:5432 -d postgres:16-alpine`), o apuntá `SPRING_DATASOURCE_URL` a uno remoto.

2) Backend
```bash
cd backend
cp .env.example .env   # completar DATABASE_URL / variables si hace falta
./mvnw spring-boot:run
```
Las tablas y los datos del evento actual (9 zonas, ~500 butacas) se crean solos vía Flyway
al arrancar. Para tener un admin, definí `ADMIN_DEFAULT_EMAIL`/`ADMIN_DEFAULT_PASSWORD` como
variables de entorno antes del primer arranque (solo se usan si todavía no existe ningún admin).

3) Frontend
```bash
cd ../frontend
cp .env.example .env
npm install
npm run dev
```
Abrí `http://localhost:5173`. El mapa se dibuja con bloques, colores y ángulos.

## Deploy

`render.yaml` es un [Blueprint de Render](https://render.com/docs/blueprint-spec) que
define los tres recursos (Postgres, backend, frontend) en un solo archivo. En el dashboard
de Render: **New > Blueprint**, conectar este repo, rama `develop` (o `main`). Render crea
la base y ambos servicios, y cablea automáticamente host/usuario/contraseña de la base al
backend — no hace falta pegar ningún connection string a mano. Quedan como secrets a cargar
manualmente en el dashboard (marcados `sync: false`): `JWT_SECRET` (generar con
`openssl rand -base64 64`), y opcionalmente `ADMIN_DEFAULT_EMAIL`/`ADMIN_DEFAULT_PASSWORD`
(admin inicial) y `MAIL_USERNAME`/`MAIL_PASSWORD` (envío de emails de confirmación).
