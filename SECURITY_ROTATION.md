# Credencial vieja de Postgres expuesta en git

`backend/.env` estuvo commiteado en git (sin `.gitignore`) con la contraseña real de la
base Postgres vieja (`tickets_db_hj02`, host `dpg-d47j2dqli9vc738p2bv0-a`, servicio de
Render que cayó por falta de pago). Ese commit ya se sacó del tracking, pero la
contraseña sigue en el historial de git.

## Ya no es urgente por el servicio en sí

Como se decidió arrancar de cero con una base Postgres nueva en Render (ver el
Blueprint `render.yaml`), la base vieja y esa contraseña ya no protegen ningún servicio
en uso — el riesgo inmediato de "alguien accede a la base de producción" desaparece en
cuanto se abandona `tickets_db_hj02`.

## Igual conviene limpiar el historial en algún momento

El valor sigue siendo un secreto real commiteado en un repo. Si en algún momento el
repo se hace público, o solo por buena práctica, se puede purgar con `git filter-repo`.
Es un paso aparte, pendiente de confirmación explícita antes de ejecutarlo porque
reescribe todos los hashes de commit y requiere `push --force` (rompe cualquier clone
existente, que va a necesitar re-clonar).

Este archivo se puede borrar cuando se decida no hacer la limpieza, o después de hacerla.
