# Entradas — "El Deseo de Existir" (Epifanía Dance)

Sitio de venta de entradas del show 2026 de Epifanía Dance: **domingo 6 de diciembre, 19:30 hs,
Sala Mayor de la Facultad de Derecho (UNC), Córdoba**.

- Backend: Java 21 + Spring Boot 3.5 + Spring Security (JWT) + Postgres + Flyway
- Frontend: Vite + React (sin librerías de UI, estilos propios)
- Deploy: todo en Render (Postgres + backend Docker + frontend estático), vía `render.yaml`

## Cómo funciona la venta

1. La persona elige butacas en el plano (hasta 10 por reserva) y deja nombre, DNI y email.
2. El backend las reserva por **30 minutos** (con lock de base de datos para que dos personas no
   puedan quedarse con la misma butaca) y le manda un email de confirmación si hay SMTP configurado.
3. El sitio abre WhatsApp con un mensaje ya armado con la reserva, para coordinar el pago con Epifanía.
4. En el panel admin (`/#/admin`) se **confirma el pago** (las butacas pasan a vendidas) o se **libera**
   la reserva. Las reservas que vencen sin pago se liberan solas.
   La pantalla de la persona se actualiza sola: pasa a "¡Pago confirmado!" cuando el admin confirma.

### Plano y precios

300 butacas según el plano de la sala: filas 1 a 14 de 19 butacas, fila 15 de 18 (desplazada medio
asiento), fila 16 con 5 + cabina + 5 y fila 17 con 6 a la derecha.

| Butacas | Precio |
| --- | --- |
| Filas 1 a 5 (platea preferencial) | $25.000 |
| Filas 6 a 15 (platea general) | $20.000 |
| Filas 16 y 17 (las beige junto a la cabina) | no se venden |

Los precios, la fecha, la hora y el lugar se editan desde el panel admin (pestañas *Precios* y
*Evento*), sin tocar código. El plano sale de la base de datos: cada butaca guarda su posición
(`pos_x`, en medios asientos) y la cabina es un elemento del mapa (`elementos_mapa`), todo cargado
por la migración `V3__el_deseo_de_existir.sql`.

## Desarrollo local

1) Base de datos: levantá un Postgres local (por ejemplo `docker run --name entradas-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=entradas -p 5432:5432 -d postgres:16-alpine`), o apuntá `SPRING_DATASOURCE_URL` a uno remoto.

2) Backend
```bash
cd backend
cp .env.example .env   # completar DATABASE_URL / variables si hace falta
./mvnw spring-boot:run
```
Las tablas y el evento (300 butacas) se crean solos vía Flyway al arrancar. Para tener un admin, definí `ADMIN_DEFAULT_EMAIL`/`ADMIN_DEFAULT_PASSWORD` como
variables de entorno antes del primer arranque (solo se usan si todavía no existe ningún admin).

3) Frontend
```bash
cd ../frontend
cp .env.example .env
npm install
npm run dev
```
Abrí `http://localhost:5173` (sitio de venta) y `http://localhost:5173/#/admin` (administración).
Variables opcionales del frontend: `VITE_API_URL` (URL del backend) y `VITE_WHATSAPP_PHONE` (número que
recibe las reservas, formato internacional sin `+`).

## Deploy

`render.yaml` es un [Blueprint de Render](https://render.com/docs/blueprint-spec) que
define los tres recursos (Postgres, backend, frontend) en un solo archivo. En el dashboard
de Render: **New > Blueprint**, conectar este repo, rama `develop` (o `main`). Render crea
la base y ambos servicios, y cablea automáticamente host/usuario/contraseña de la base al
backend — no hace falta pegar ningún connection string a mano. Quedan como secrets a cargar
manualmente en el dashboard (marcados `sync: false`): `JWT_SECRET` (generar con
`openssl rand -base64 64`), y opcionalmente `ADMIN_DEFAULT_EMAIL`/`ADMIN_DEFAULT_PASSWORD`
(admin inicial) y `MAIL_USERNAME`/`MAIL_PASSWORD` (envío de emails de confirmación).
