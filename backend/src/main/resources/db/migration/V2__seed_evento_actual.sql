-- Migra los datos del evento actual ("Latidos de la Historia"): 9 zonas y su
-- grilla de butacas, con la misma cantidad/precio/color que tenía el seed.js
-- del backend anterior (Node/Prisma), y el layout (columna del grid + skew)
-- que hoy está hardcodeado en SeatMap.jsx.

INSERT INTO eventos (nombre, fecha, activo)
VALUES ('Latidos de la Historia', '2026-12-20', TRUE);

-- Platea baja (CENTRO, orden 1): filas 1-12 con 14 butacas, fila 13 con 12.
WITH zona AS (
    INSERT INTO zonas (evento_id, nombre, precio, color, display_order, grid_column, skew_deg)
    VALUES ((SELECT id FROM eventos WHERE nombre = 'Latidos de la Historia'),
            'Platea baja', 25000, '#f5d742', 1, 'CENTRO', 0)
    RETURNING id
), filas AS (
    SELECT * FROM (VALUES
        (1,14),(2,14),(3,14),(4,14),(5,14),(6,14),(7,14),
        (8,14),(9,14),(10,14),(11,14),(12,14),(13,12)
    ) AS t(fila, asientos)
)
INSERT INTO butacas (zona_id, fila, columna, estado)
SELECT zona.id, filas.fila, s.columna, 'DISPONIBLE'
FROM zona, filas, LATERAL generate_series(1, filas.asientos) AS s(columna);

-- Platea superior central (CENTRO, orden 2).
WITH zona AS (
    INSERT INTO zonas (evento_id, nombre, precio, color, display_order, grid_column, skew_deg)
    VALUES ((SELECT id FROM eventos WHERE nombre = 'Latidos de la Historia'),
            'Platea superior central', 20000, '#4caf50', 2, 'CENTRO', 0)
    RETURNING id
), filas AS (
    SELECT * FROM (VALUES (1,26),(2,28),(3,31),(4,25),(5,28),(6,30)) AS t(fila, asientos)
)
INSERT INTO butacas (zona_id, fila, columna, estado)
SELECT zona.id, filas.fila, s.columna, 'DISPONIBLE'
FROM zona, filas, LATERAL generate_series(1, filas.asientos) AS s(columna);

-- Palco superior central (CENTRO, orden 3): una sola fila de 30.
WITH zona AS (
    INSERT INTO zonas (evento_id, nombre, precio, color, display_order, grid_column, skew_deg)
    VALUES ((SELECT id FROM eventos WHERE nombre = 'Latidos de la Historia'),
            'Palco superior central', 20000, '#26c6da', 3, 'CENTRO', 0)
    RETURNING id
)
INSERT INTO butacas (zona_id, fila, columna, estado)
SELECT zona.id, 1, s.columna, 'DISPONIBLE'
FROM zona, LATERAL generate_series(1, 30) AS s(columna);

-- Palcos superiores A (IZQUIERDA, orden 1).
WITH zona AS (
    INSERT INTO zonas (evento_id, nombre, precio, color, display_order, grid_column, skew_deg)
    VALUES ((SELECT id FROM eventos WHERE nombre = 'Latidos de la Historia'),
            'Palcos superiores A', 20000, '#42a5f5', 1, 'IZQUIERDA', 0)
    RETURNING id
), filas AS (
    SELECT * FROM (VALUES (1,7),(2,7),(3,4)) AS t(fila, asientos)
)
INSERT INTO butacas (zona_id, fila, columna, estado)
SELECT zona.id, filas.fila, s.columna, 'DISPONIBLE'
FROM zona, filas, LATERAL generate_series(1, filas.asientos) AS s(columna);

-- Palcos inferiores A (IZQUIERDA, orden 2).
WITH zona AS (
    INSERT INTO zonas (evento_id, nombre, precio, color, display_order, grid_column, skew_deg)
    VALUES ((SELECT id FROM eventos WHERE nombre = 'Latidos de la Historia'),
            'Palcos inferiores A', 25000, '#ff7043', 2, 'IZQUIERDA', 0)
    RETURNING id
), filas AS (
    SELECT * FROM (VALUES (1,2),(2,3),(3,4),(4,5),(5,5),(6,2)) AS t(fila, asientos)
)
INSERT INTO butacas (zona_id, fila, columna, estado)
SELECT zona.id, filas.fila, s.columna, 'DISPONIBLE'
FROM zona, filas, LATERAL generate_series(1, filas.asientos) AS s(columna);

-- Palcos VIP A (IZQUIERDA, orden 3, skew -6).
WITH zona AS (
    INSERT INTO zonas (evento_id, nombre, precio, color, display_order, grid_column, skew_deg)
    VALUES ((SELECT id FROM eventos WHERE nombre = 'Latidos de la Historia'),
            'Palcos VIP A', 20000, '#ab47bc', 3, 'IZQUIERDA', -6)
    RETURNING id
), filas AS (
    SELECT * FROM (VALUES (1,3),(2,3),(3,5),(4,6),(5,3),(6,2)) AS t(fila, asientos)
)
INSERT INTO butacas (zona_id, fila, columna, estado)
SELECT zona.id, filas.fila, s.columna, 'DISPONIBLE'
FROM zona, filas, LATERAL generate_series(1, filas.asientos) AS s(columna);

-- Palcos superiores B (DERECHA, orden 1).
WITH zona AS (
    INSERT INTO zonas (evento_id, nombre, precio, color, display_order, grid_column, skew_deg)
    VALUES ((SELECT id FROM eventos WHERE nombre = 'Latidos de la Historia'),
            'Palcos superiores B', 20000, '#42a5f5', 1, 'DERECHA', 0)
    RETURNING id
), filas AS (
    SELECT * FROM (VALUES (1,7),(2,7),(3,4)) AS t(fila, asientos)
)
INSERT INTO butacas (zona_id, fila, columna, estado)
SELECT zona.id, filas.fila, s.columna, 'DISPONIBLE'
FROM zona, filas, LATERAL generate_series(1, filas.asientos) AS s(columna);

-- Palcos inferiores B (DERECHA, orden 2).
WITH zona AS (
    INSERT INTO zonas (evento_id, nombre, precio, color, display_order, grid_column, skew_deg)
    VALUES ((SELECT id FROM eventos WHERE nombre = 'Latidos de la Historia'),
            'Palcos inferiores B', 25000, '#ff7043', 2, 'DERECHA', 0)
    RETURNING id
), filas AS (
    SELECT * FROM (VALUES (1,2),(2,3),(3,4),(4,5),(5,5),(6,2)) AS t(fila, asientos)
)
INSERT INTO butacas (zona_id, fila, columna, estado)
SELECT zona.id, filas.fila, s.columna, 'DISPONIBLE'
FROM zona, filas, LATERAL generate_series(1, filas.asientos) AS s(columna);

-- Palcos VIP B (DERECHA, orden 3, skew +6).
WITH zona AS (
    INSERT INTO zonas (evento_id, nombre, precio, color, display_order, grid_column, skew_deg)
    VALUES ((SELECT id FROM eventos WHERE nombre = 'Latidos de la Historia'),
            'Palcos VIP B', 20000, '#ab47bc', 3, 'DERECHA', 6)
    RETURNING id
), filas AS (
    SELECT * FROM (VALUES (1,3),(2,3),(3,5),(4,6),(5,3),(6,2)) AS t(fila, asientos)
)
INSERT INTO butacas (zona_id, fila, columna, estado)
SELECT zona.id, filas.fila, s.columna, 'DISPONIBLE'
FROM zona, filas, LATERAL generate_series(1, filas.asientos) AS s(columna);
