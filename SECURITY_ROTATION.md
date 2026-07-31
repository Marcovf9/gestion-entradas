# Rotación urgente de credenciales (hacer manualmente en Render)

`backend/.env` estuvo commiteado en git (sin `.gitignore`) con la contraseña real de la
base Postgres de producción (`tickets_db_hj02`, host `dpg-d47j2dqli9vc738p2bv0-a`). Ese
commit acaba de sacarse del tracking, pero la contraseña ya estuvo expuesta en el
historial y hay que tratarla como comprometida.

## Pasos (los tenés que hacer vos en el dashboard de Render, no tengo esas credenciales)

1. Entrá a [Render Dashboard](https://dashboard.render.com) → la base `tickets_db_hj02`.
2. En la pestaña **Info** / **Connect**, buscá la opción para rotar/regenerar la
   contraseña de la base (o creá un nuevo usuario de DB y eliminá el viejo si Render no
   ofrece "rotate" directo).
3. Copiá la nueva `DATABASE_URL` completa.
4. Actualizá el env var `DATABASE_URL` en el servicio backend de Render (dashboard →
   servicio → **Environment**) con la nueva connection string.
5. Actualizá tu `backend/.env` local (el archivo ya no se sube a git) con el mismo valor
   nuevo, para poder seguir desarrollando localmente.
6. Verificá que el backend en Render reinicie sano (logs → "Conexión a la base de datos
   establecida correctamente").

## Sobre el historial de git

El contenido viejo de `backend/.env` (con la contraseña anterior) sigue en commits
pasados del historial de git hasta que se reescriba con `git filter-repo` (paso aparte,
pendiente de tu confirmación explícita antes de ejecutarlo, porque reescribe todos los
hashes de commit y requiere `push --force`). Rotar la contraseña en Render ahora hace que
ese valor viejo en el historial quede inútil de todos modos — es la mitigación más
importante y no depende de la limpieza del historial.

Este archivo (`SECURITY_ROTATION.md`) se puede borrar una vez hecha la rotación.
